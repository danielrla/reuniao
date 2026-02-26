
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MapPin, Link as LinkIcon, Users, Plus, Save, AlertCircle, ArrowLeft, MoreHorizontal, FileText, UserPlus, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../components/layout/Sidebar';
import api from '../services/api';

const Meetings = () => {
    const routerLocation = useLocation();
    const navigate = useNavigate();

    const [view, setView] = useState<'list' | 'form'>('list');

    // --- LIST STATE ---
    const [meetings, setMeetings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // --- FORM STATE ---
    const [meetingType, setMeetingType] = useState<'online' | 'presential'>('online');
    const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    // UI State for IA Extraction
    const [transcript, setTranscript] = useState('');
    const [isSavingMinute, setIsSavingMinute] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEditClick = (m: any, readOnly = false) => {
        setEditingMeetingId(m.id);
        setIsReadOnly(readOnly);
        setTitle(m.title || '');
        setAgenda(m.agenda || '');
        setMeetingType(m.type === 'ONLINE' ? 'online' : 'presential');
        setMeetingLink(m.meetingLink || '');
        setLocation(m.location || '');
        setSelectedContacts(m.contacts || []);
        setSearchQuery('');

        if (m.date) {
            const dateObj = new Date(m.date);
            setDate(dateObj.toISOString().split('T')[0]);
        }
        if (m.startTime) {
            const startObj = new Date(m.startTime);
            setStartTime(startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
            setStartTime('');
        }
        if (m.endTime) {
            const endObj = new Date(m.endTime);
            setEndTime(endObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
            setEndTime('');
        }
        setView('form');
    };

    // Check if we navigated here with intent to open the form
    useEffect(() => {
        if (routerLocation.state?.returnFromContacts && routerLocation.state?.meetingState) {
            const ms = routerLocation.state.meetingState;
            setTitle(ms.title || '');
            setDate(ms.date || '');
            setStartTime(ms.startTime || '');
            setEndTime(ms.endTime || '');
            setMeetingLink(ms.meetingLink || '');
            setLocation(ms.location || '');
            setAgenda(ms.agenda || '');
            setTranscript(ms.transcript || '');
            setMeetingType(ms.meetingType || 'online');
            setEditingMeetingId(ms.editingMeetingId || null);
            setSelectedContacts(ms.selectedContacts || []);
            setSearchQuery('');
            setView('form');
            navigate('/meetings', { replace: true, state: {} });
        } else if (routerLocation.state?.openForm) {
            clearForm();
            setView('form');
            setIsReadOnly(false);
            navigate('/meetings', { replace: true, state: {} });
        } else if (routerLocation.state?.editMeeting) {
            handleEditClick(routerLocation.state.editMeeting, false);
            navigate('/meetings', { replace: true, state: {} });
        } else if (routerLocation.state?.viewMeeting) {
            handleEditClick(routerLocation.state.viewMeeting, true);
            navigate('/meetings', { replace: true, state: {} });
        }
    }, [routerLocation.state, navigate]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [location, setLocation] = useState('');
    const [agenda, setAgenda] = useState('');

    const [availableContacts, setAvailableContacts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

    const fetchMeetings = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/meetings?page=${page}&limit=10`);
            setMeetings(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
            setTotalItems(response.data.pagination.total);
        } catch (error) {
            console.error('Error fetching meetings', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await api.get('/contacts?limit=1000');
            const items = response.data.data || [];
            setAvailableContacts(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error('Error fetching contacts', error);
        }
    };

    useEffect(() => {
        if (view === 'list') {
            fetchMeetings();
        } else if (view === 'form') {
            fetchContacts();
        }
    }, [view, page]);

    const handleSave = async () => {
        if (!title || !date) {
            setErrorMessage('Título e data são obrigatórios.');
            setSaveStatus('error');
            return;
        }

        setIsSaving(true);
        setSaveStatus('saving');
        setErrorMessage('');

        try {
            const payloadDate = new Date(`${date}T12:00:00.000Z`).toISOString();
            const payloadStartTime = startTime ? new Date(`${date}T${startTime}:00.000Z`).toISOString() : undefined;
            const payloadEndTime = endTime ? new Date(`${date}T${endTime}:00.000Z`).toISOString() : undefined;

            const payload = {
                title,
                date: payloadDate,
                type: meetingType === 'online' ? 'ONLINE' : 'IN_PERSON',
                startTime: payloadStartTime,
                endTime: payloadEndTime,
                location: meetingType === 'presential' ? location : undefined,
                meetingLink: meetingType === 'online' ? meetingLink : undefined,
                agenda,
                contactIds: selectedContacts.map(c => c.id)
            };

            if (editingMeetingId) {
                await api.put(`/meetings/${editingMeetingId}`, payload);
            } else {
                await api.post('/meetings', payload);
            }

            setSaveStatus('saved');
            setTimeout(() => {
                setSaveStatus('idle');
                clearForm();
                setView('list'); // Redirect back to list
            }, 1000);
        } catch (error: any) {
            console.error(error);
            let errMsg = error.response?.data?.message || 'Erro ao agendar reunião. Verifique os campos.';
            if (error.response?.data?.details) {
                const detailsStr = error.response.data.details.map((d: any) => d.issue).join(' ');
                errMsg += ` Detalhes: ${detailsStr}`;
            }
            setErrorMessage(errMsg);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const clearForm = () => {
        setTitle(''); setDate(''); setStartTime(''); setEndTime(''); setAgenda(''); setLocation(''); setMeetingLink('');
        setMeetingType('online');
        setEditingMeetingId(null);
        setIsReadOnly(false);
        setTranscript('');
        setAiResult(null);
        setSelectedContacts([]);
        setSearchQuery('');
        setShowDeleteModal(false);
        setIsDeleting(false);
    };

    const handleSaveMinute = async () => {
        if (!editingMeetingId || !transcript) return;
        try {
            setIsSavingMinute(true);
            await api.post('/minutes', { meetingId: editingMeetingId, transcript });
            alert('Transcrição salva com sucesso! Agora você pode extrair via IA.');
        } catch (error) {
            console.error('Error saving minute', error);
            alert('Erro ao salvar transcrição.');
        } finally {
            setIsSavingMinute(false);
        }
    };

    const handleExtractAI = async () => {
        if (!editingMeetingId) return;
        try {
            setIsExtracting(true);
            const response = await api.post('/tasks/extract', { meetingId: editingMeetingId });
            setAiResult(response.data);
            alert('Resumo e tarefas extraídos com sucesso!');
        } catch (error) {
            console.error('Error extracting AI tasks', error);
            alert('Erro ao extrair dados. Verifique log.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleNewMeetingClick = () => {
        clearForm();
        setView('form');
    };

    const handleAddParticipantNav = () => {
        const currentState = {
            title, date, startTime, endTime, meetingLink, location, agenda, transcript, meetingType, editingMeetingId, selectedContacts
        };
        navigate('/contacts', { state: { returnToMeeting: true, meetingState: currentState } });
    };

    const handleSelectContact = (contact: any) => {
        if (!selectedContacts.find(c => c.id === contact.id)) {
            setSelectedContacts([...selectedContacts, contact]);
        }
        setSearchQuery('');
    };

    const handleRemoveContact = (contactId: string) => {
        if (isReadOnly) return;
        setSelectedContacts(selectedContacts.filter(c => c.id !== contactId));
    };

    const normalizeText = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const handleConfirmDeleteClick = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setShowDeleteModal(true);
    };

    const handleDeleteMeeting = async () => {
        if (!editingMeetingId) return;
        try {
            setIsDeleting(true);
            await api.delete(`/meetings/${editingMeetingId}`);
            setShowDeleteModal(false);
            clearForm();
            setView('list');
        } catch (error) {
            console.error('Error deleting meeting', error);
            alert('Erro ao excluir a reunião. Verifique as permissões.');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredContacts = availableContacts.filter(contact => {
        if (!searchQuery) return false;
        const normalizedSearch = normalizeText(searchQuery);
        const nameMatch = normalizeText(contact.name || '').includes(normalizedSearch);
        const emailMatch = normalizeText(contact.email || '').includes(normalizedSearch);
        const isAlreadySelected = selectedContacts.some(c => c.id === contact.id);
        return (nameMatch || emailMatch) && !isAlreadySelected;
    });

    if (view === 'list') {
        return (
            <div className="w-full max-w-6xl mx-auto space-y-6 h-full flex flex-col pl-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Reuniões</h1>
                        <p className="text-sm text-slate-500 mt-1">Gerencie suas atas, pautas e próximas reuniões.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={handleNewMeetingClick}
                            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nova Reunião</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reunião</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data e Hora</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Ata</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Carregando reuniões...</td></tr>
                            ) : meetings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Nenhuma reunião agendada. Clique em "Nova Reunião" para começar.
                                    </td>
                                </tr>
                            ) : (
                                meetings.map((m) => {
                                    const d = new Date(m.date);
                                    const dateStr = d.toLocaleDateString('pt-BR');
                                    const startStr = m.startTime ? new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                    const endStr = m.endTime ? new Date(m.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                    const timeStr = startStr && endStr ? `${startStr} - ${endStr} ` : startStr || 'A definir';
                                    const isOnline = m.type === 'ONLINE';

                                    return (
                                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-slate-900 line-clamp-1">{m.title}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-slate-600">
                                                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                                    {dateStr} <span className="mx-2">•</span> <Clock className="w-4 h-4 mr-1 text-slate-400" /> {timeStr}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={cn("inline-flex items-center text-xs font-medium px-2 py-1 rounded-md border", isOnline ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-emerald-50 text-emerald-700 border-emerald-100")}>
                                                    {isOnline ? <Video className="w-3 h-3 mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
                                                    {isOnline ? 'Online' : 'Presencial'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    Pendente
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEditClick(m, false)}
                                                    className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-md hover:bg-slate-100"
                                                    title="Editar"
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
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
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-4">
                    <button onClick={() => { clearForm(); setView('list'); }} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{isReadOnly ? 'Detalhes da Reunião' : (editingMeetingId ? 'Editar Reunião' : 'Nova Reunião')}</h1>
                        <p className="text-sm text-slate-500 mt-1">{isReadOnly ? 'Visualizando dados da reunião agendada.' : 'Preencha os detalhes para agendar e gerar Pauta / QR Code.'}</p>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    {saveStatus === 'saved' && <span className="text-sm text-emerald-600 font-medium">✓ Reunião Agendada</span>}
                    {saveStatus === 'saving' && <span className="text-sm text-slate-400 font-medium animate-pulse">Agendando...</span>}
                    {saveStatus === 'error' && <span className="text-sm text-red-600 font-medium flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> Erro</span>}
                    {editingMeetingId && (
                        <button
                            type="button"
                            onClick={handleConfirmDeleteClick}
                            className="flex items-center space-x-2 bg-white hover:bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-red-200"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Excluir</span>
                        </button>
                    )}
                    {!isReadOnly && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>Agendar Reunião</span>
                        </button>
                    )}
                </div>
            </div>

            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
                    {errorMessage}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                        <h2 className="text-lg font-semibold text-slate-900">Detalhes Principais</h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Título da Reunião *</label>
                            <input
                                type="text"
                                value={title}
                                disabled={isReadOnly}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Sync Semanal de Arquitetura"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="date"
                                        value={date}
                                        disabled={isReadOnly}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Início</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="time"
                                            value={startTime}
                                            disabled={isReadOnly}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full pl-10 pr-2 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Término</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        disabled={isReadOnly}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-sm font-medium text-slate-700 mb-3">Tipo de Reunião</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg w-full max-w-sm">
                                <button
                                    onClick={() => setMeetingType('online')}
                                    disabled={isReadOnly}
                                    className={cn("flex-1 px-4 py-2 rounded-md text-sm font-medium flex justify-center items-center space-x-2 transition-all",
                                        meetingType === 'online' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                                        isReadOnly ? "opacity-75 cursor-not-allowed" : ""
                                    )}
                                >
                                    <Video className="w-4 h-4" />
                                    <span>Online</span>
                                </button>
                                <button
                                    onClick={() => setMeetingType('presential')}
                                    disabled={isReadOnly}
                                    className={cn("flex-1 px-4 py-2 rounded-md text-sm font-medium flex justify-center items-center space-x-2 transition-all",
                                        meetingType === 'presential' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                                        isReadOnly ? "opacity-75 cursor-not-allowed" : ""
                                    )}
                                >
                                    <MapPin className="w-4 h-4" />
                                    <span>Presencial</span>
                                </button>
                            </div>

                            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {meetingType === 'online' ? (
                                    <div>
                                        <label className="block text-sm text-slate-600 mb-1">Link da Sala (Zoom, Meet, Teams)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LinkIcon className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="url"
                                                value={meetingLink}
                                                disabled={isReadOnly}
                                                onChange={(e) => setMeetingLink(e.target.value)}
                                                placeholder="https://meet.google.com/..."
                                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm text-slate-600 mb-1">Localização (Endereço completo ou Sala)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={location}
                                                disabled={isReadOnly}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="Av. Paulista, Sala 12B"
                                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900">Pauta e Notas Iniciais</h2>
                        <textarea
                            rows={5}
                            value={agenda}
                            disabled={isReadOnly}
                            onChange={(e) => setAgenda(e.target.value)}
                            placeholder="Escreva a pauta da reunião ou arraste arquivos..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-y disabled:bg-slate-50 disabled:text-slate-500"
                        />
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50">
                            <span className="text-sm">Arraste PDFs ou Imagens para anexar à pauta.</span>
                        </div>
                    </div>

                    {editingMeetingId && (
                        <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-sm space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                                Cérebro IA (Transcrição e Resumo)
                            </h2>
                            <textarea
                                rows={6}
                                value={transcript}
                                disabled={isReadOnly}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Insira a transcrição do áudio aqui para análise da IA..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y text-sm disabled:bg-slate-50 disabled:text-slate-500"
                            />
                            {!isReadOnly && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleSaveMinute}
                                        disabled={isSavingMinute || !transcript}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                                    >
                                        {isSavingMinute ? 'Salvando...' : '1. Salvar Transcrição'}
                                    </button>
                                    <button
                                        onClick={handleExtractAI}
                                        disabled={isExtracting}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-200 disabled:opacity-50"
                                    >
                                        {isExtracting ? 'Analisando...' : '2. Extrair Resumo e Tarefas'}
                                    </button>
                                </div>
                            )}

                            {aiResult && (
                                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-3">
                                    <h3 className="font-semibold text-indigo-900 text-sm">Resumo Gerado:</h3>
                                    <p className="text-sm text-indigo-800">{aiResult.summary}</p>
                                    <h3 className="font-semibold text-indigo-900 text-sm pt-2">Decisões:</h3>
                                    <ul className="list-disc pl-5 text-sm text-indigo-800">
                                        {aiResult.decisions?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                                    </ul>
                                    <p className="text-xs text-indigo-600 mt-2 font-medium bg-indigo-100 px-2 py-1 inline-block rounded">
                                        {aiResult.tasks?.length || 0} Tarefas enviadas para a aba "Pendências"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column - Participants */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Participantes</h2>
                            <div className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                {selectedContacts.length} adicionados
                            </div>
                        </div>
                        <div>
                            <div className="relative mb-3">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Users className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    disabled={isReadOnly}
                                    placeholder="Buscar contatos (Nome, Email)..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                                />

                                {searchQuery && filteredContacts.length > 0 && !isReadOnly && (
                                    <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {filteredContacts.map(contact => (
                                            <li
                                                key={contact.id}
                                                onClick={() => handleSelectContact(contact)}
                                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex flex-col border-b border-slate-100 last:border-0"
                                            >
                                                <span className="font-medium text-sm text-slate-800">{contact.name}</span>
                                                {contact.email && <span className="text-xs text-slate-500">{contact.email}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Selected Contacts List */}
                            {selectedContacts.length > 0 && (
                                <ul className="mb-4 space-y-2">
                                    {selectedContacts.map(contact => (
                                        <li key={contact.id} className="flex justify-between items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="font-medium text-sm text-slate-800 truncate">{contact.name}</span>
                                                {contact.email && <span className="text-xs text-slate-500 truncate">{contact.email}</span>}
                                            </div>
                                            {!isReadOnly && (
                                                <button
                                                    onClick={() => handleRemoveContact(contact.id)}
                                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2 flex-shrink-0"
                                                    title="Remover participante"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {!isReadOnly && (
                                <button
                                    onClick={handleAddParticipantNav}
                                    className="w-full flex items-center justify-center space-x-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Incluir Participante Remotamente</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-2 text-red-600">
                                <AlertCircle className="w-6 h-6" />
                                <h3 className="text-lg font-bold">Excluir Reunião</h3>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                disabled={isDeleting}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-slate-600 mb-6 font-medium">
                            Tem certeza que deseja remover permanentemente a reunião "{title}"?
                            <span className="block mt-1 font-normal text-sm">Esta ação não poderá ser desfeita e todas as tarefas e atas associadas poderão ser perdidas.</span>
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteMeeting}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center shadow-sm"
                            >
                                {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meetings;
