import { useState, useEffect } from 'react';
import { Search, Upload, Plus, MoreHorizontal, X, Save, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

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
            const response = await api.get(`/contacts?page=${page}&limit=10`);
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
        fetchContacts();
        if (routerLocation.state?.returnToMeeting) {
            setIsCreating(true);
        }
    }, [routerLocation.state, page]);

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

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.company || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 h-full flex flex-col pl-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Contatos</h1>
                    <p className="text-sm text-slate-500 mt-1">Base de networking isolada. Contatos disponíveis para envio de atas e Pautas.</p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    <button className="flex items-center space-x-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Importar CSV</span>
                    </button>
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="+55 11 99999-9999" />
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

            <div className="bg-white border flex items-center px-4 py-2 rounded-xl border-slate-200 shadow-sm">
                <Search className="w-5 h-5 text-slate-400 mr-2" />
                <input
                    type="text"
                    placeholder="Busca instantânea por nome ou empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400 py-1"
                />
            </div>

            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
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
                        ) : filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    Nenhum contato encontrado {searchTerm && `para "${searchTerm}"`}
                                </td>
                            </tr>
                        ) : (
                            filteredContacts.map((c) => (
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
                                        <button
                                            onClick={() => handleEditClick(c)}
                                            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-md hover:bg-slate-100"
                                            title="Editar Contato"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6 mt-auto">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50">Anterior</button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50">Próxima</button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-700">
                                    Página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span> ({totalItems} Itens)
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                        <span className="sr-only">Anterior</span>
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                        <span className="sr-only">Próxima</span>
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contacts;
