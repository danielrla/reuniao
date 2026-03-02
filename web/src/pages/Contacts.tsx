import { useState, useEffect } from 'react';
import { Search, Upload, Plus, X, Save, ArrowLeft, Filter, ChevronLeft, ChevronRight, Pencil, Trash, RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Papa from 'papaparse';
import { cn } from '../components/layout/Sidebar';
import { formatWhatsAppNumber } from '../utils/formatters';

interface ContactRecord {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    jobTitle: string | null;
}

const Contacts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [contacts, setContacts] = useState<ContactRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [filterEmail, setFilterEmail] = useState('');
    const [filterPhone, setFilterPhone] = useState('');
    const [filterCompany, setFilterCompany] = useState('');

    // Import State
    const [isImporting, setIsImporting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [importSummary, setImportSummary] = useState<{ success: number, error: number } | null>(null);

    const routerLocation = useLocation();
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', jobTitle: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [editingContactId, setEditingContactId] = useState<string | null>(null);

    const openCreateForm = () => {
        setFormData({ name: '', email: '', phone: '', company: '', jobTitle: '' });
        setEditingContactId(null);
        setIsCreating(true);
    };

    const handleEditClick = (c: ContactRecord) => {
        setFormData({
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            company: c.company || '',
            jobTitle: c.jobTitle || ''
        });
        setEditingContactId(c.id);
        setIsCreating(true);
    };

    const fetchContacts = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: String(page),
                limit: '10'
            });
            if (filterName) params.append('name', filterName);
            if (filterEmail) params.append('email', filterEmail);
            if (filterPhone) params.append('phone', filterPhone);
            if (filterCompany) params.append('company', filterCompany);
            if (searchTerm) {
                // To keep the instant search bar working side-by-side with advanced filters
                // we map the simple search term to 'name' (or could let the backend handle it).
                // Let's just pass it as name if not using advanced filters, or better yet, rely on advanced filters entirely.
                if (!filterName) params.append('name', searchTerm);
            }

            const response = await api.get(`/contacts?${params.toString()}`);
            const items = response.data.data;
            setContacts(Array.isArray(items) ? items : []);
            setTotalPages(response.data.pagination?.totalPages || 1);
            setTotalItems(response.data.pagination?.total || 0);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [filterName, filterEmail, filterPhone, filterCompany, searchTerm]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchContacts();
        }, 300); // 300ms debounce

        if (routerLocation.state?.returnToMeeting) {
            setIsCreating(true);
        }

        return () => clearTimeout(debounceTimer);
    }, [routerLocation.state, page, searchTerm, filterName, filterEmail, filterPhone, filterCompany]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (editingContactId) {
                const response = await api.put(`/contacts/${editingContactId}`, formData);
                setContacts(contacts.map(c => c.id === editingContactId ? response.data : c));
            } else {
                const response = await api.post('/contacts', formData);
                setContacts([response.data, ...contacts]);
            }

            if (routerLocation.state?.returnToMeeting) {
                navigate('/meetings', { replace: true, state: { returnFromContacts: true, meetingState: routerLocation.state.meetingState } });
                return;
            }

            setIsCreating(false);
            setEditingContactId(null);
            setFormData({ name: '', email: '', phone: '', company: '', jobTitle: '' });
        } catch (error) {
            console.error('Error saving contact', error);
            alert('Erro ao salvar contato. Verifique os campos.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = async (id: string, name: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o contato "${name}"? Esta ação removerá o contato de forma irreversível.`)) return;
        try {
            await api.delete(`/contacts/${id}`);
            setContacts(contacts.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting contact', error);
            alert('Não foi possível excluir o contato.');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    // Map headers gracefully: nome -> name, email -> email, telefone -> phone, empresa -> company
                    const mappedContacts = results.data.map((row: any) => {
                        const keys = Object.keys(row);
                        const getValue = (keyContains: string) => {
                            const foundKey = keys.find(k => k.toLowerCase().includes(keyContains));
                            return foundKey ? row[foundKey] : undefined;
                        };

                        return {
                            name: getValue('nome') || getValue('name'),
                            email: getValue('email'),
                            phone: getValue('telefone') || getValue('phone'),
                            company: getValue('empresa') || getValue('company')
                        };
                    });

                    const response = await api.post('/contacts/import', { contacts: mappedContacts });
                    const { successCount, errorCount } = response.data;
                    setImportSummary({ success: successCount, error: errorCount });
                    fetchContacts();
                } catch (error) {
                    console.error('Error importing payload', error);
                    alert('Erro na comunicação com o servidor durante a importação.');
                } finally {
                    setIsImporting(false);
                    e.target.value = ''; // Reset input
                }
            },
            error: (error) => {
                console.error('CSV Parse Error:', error);
                alert('Erro ao ler o arquivo CSV. Verifique a formatação.');
                setIsImporting(false);
                e.target.value = ''; // Reset input
            }
        });
    };

    const activeFiltersCount = [filterName, filterEmail, filterPhone, filterCompany].filter(Boolean).length;

    const handleSyncGoogle = async () => {
        try {
            setIsSyncing(true);
            const response = await api.post('/contacts/sync-google');
            alert(response.data.message || 'Contatos sincronizados com sucesso!');
            fetchContacts();
        } catch (error: any) {
            console.error('Error syncing Google Contacts', error);
            alert(error.response?.data?.error || 'Erro ao sincronizar com Google Contatos. Verifique se a integração foi configurada nas Configurações.');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 h-full flex flex-col pl-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Contatos</h1>
                    <p className="text-sm text-slate-500 mt-1">Base de networking isolada. Contatos disponíveis para envio de atas e Pautas.</p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={handleSyncGoogle}
                        disabled={isSyncing}
                        className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                        <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar Google'}</span>
                    </button>
                    <label className={cn("flex items-center space-x-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer", isImporting ? "opacity-50 pointer-events-none" : "")}>
                        <Upload className="w-4 h-4" />
                        <span>{isImporting ? 'Lendo...' : 'Importar CSV'}</span>
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isImporting} />
                    </label>
                    {!isCreating && (
                        <button
                            onClick={openCreateForm}
                            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Novo Contato</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Import Summary Modal */}
            {importSummary && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-semibold text-slate-800">Resumo da Importação</h3>
                            <button onClick={() => setImportSummary(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                                    <span className="text-sm font-medium text-green-800">Contatos Inseridos</span>
                                    <span className="text-lg font-bold text-green-600">{importSummary.success}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                    <span className="text-sm font-medium text-red-800">Contatos Rejeitados</span>
                                    <span className="text-lg font-bold text-red-600">{importSummary.error}</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 text-center pt-2">
                                Registros rejeitados geralmente não possuem E-mail válido ou Número de Telefone presente.
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setImportSummary(null)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCreating && (
                <div className="bg-white p-6 rounded-xl border border-primary-200 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                            {routerLocation.state?.returnToMeeting && (
                                <button type="button" onClick={() => navigate('/meetings', { replace: true, state: { returnFromContacts: true, meetingState: routerLocation.state.meetingState } })} className="p-1 -ml-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            )}
                            <h2 className="text-lg font-semibold text-slate-800">{editingContactId ? 'Editar Contato' : 'Novo Contato'}</h2>
                        </div>
                        <button type="button" onClick={() => {
                            if (routerLocation.state?.returnToMeeting) {
                                navigate('/meetings', { replace: true, state: { returnFromContacts: true, meetingState: routerLocation.state.meetingState } });
                            } else {
                                setIsCreating(false);
                            }
                        }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="João da Silva" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="joao@exemplo.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: formatWhatsAppNumber(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="+55 11 99999-9999"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                                <input type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Acme Corp" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                                <input type="text" value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Diretor de TI" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" disabled={isSaving} className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                                <Save className="w-4 h-4" />
                                <span>Salvar Contato</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex bg-white items-center space-x-3">
                <div className="flex-1 bg-white border flex items-center px-4 py-2 rounded-xl border-slate-200 shadow-sm">
                    <Search className="w-5 h-5 text-slate-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Busca instantânea por nome ou empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400 py-1"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn("flex items-center space-x-2 border px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer", showFilters || activeFiltersCount > 0 ? "bg-primary-50 border-primary-200 text-primary-700" : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700")}
                >
                    <Filter className="w-4 h-4" />
                    <span>Filtros Avançados {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                </button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Nome</label>
                        <input type="text" value={filterName} onChange={e => setFilterName(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Ex: Maria" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                        <input type="text" value={filterEmail} onChange={e => setFilterEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="@exemplo.com" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Telefone</label>
                        <input
                            type="text"
                            value={filterPhone}
                            onChange={e => setFilterPhone(formatWhatsAppNumber(e.target.value))}
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            placeholder="DDD + Número"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Empresa</label>
                        <input type="text" value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Nome da Empresa" />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={() => { setFilterName(''); setFilterEmail(''); setFilterPhone(''); setFilterCompany(''); }}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded-md transition-colors w-full md:w-auto"
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] max-h-[70vh]">
                <div className="overflow-x-auto overflow-y-auto flex-1 relative">
                    <table className="min-w-full divide-y divide-slate-200 relative">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contato</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa / Cargo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Telefone</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {isLoading ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Carregando contatos...</td></tr>
                            ) : contacts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Nenhum contato encontrado {searchTerm && `para "${searchTerm}"`}
                                    </td>
                                </tr>
                            ) : (
                                contacts.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{c.name}</p>
                                                    <p className="text-sm text-slate-500">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-slate-900">{c.company || '-'}</p>
                                            <p className="text-xs text-slate-500">{c.jobTitle || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {c.phone ? (
                                                <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">{c.phone}</span>
                                            ) : (
                                                <span className="text-sm text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(c)}
                                                    className="flex items-center space-x-1 text-slate-500 hover:text-primary-600 transition-colors px-2 py-1.5 rounded-md hover:bg-slate-100"
                                                    title="Editar Contato"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    <span className="text-xs font-medium hidden sm:inline">Editar</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(c.id, c.name)}
                                                    className="flex items-center space-x-1 text-slate-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-md hover:bg-slate-100"
                                                    title="Excluir Contato"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                    <span className="text-xs font-medium hidden sm:inline">Excluir</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6 mt-auto">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50">Anterior</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50">Próxima</button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-700">
                                Página <span className="font-medium">{page}</span> de <span className="font-medium">{Math.max(1, totalPages)}</span> ({totalItems} Itens)
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                    <span className="sr-only">Anterior</span>
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                    <span className="sr-only">Próxima</span>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contacts;
