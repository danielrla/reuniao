import { useState, useEffect } from 'react';
import { Filter, Search, LayoutList, LayoutGrid, Clock, Pencil, Flame, ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { cn } from '../components/layout/Sidebar';
import api from '../services/api';

interface TaskRecord {
    id: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    dueDate: string | null;
    assigneeEmail: string | null;
    assignee?: { name: string, email: string };
    meeting?: { title: string, date: string };
    notes?: string;
    completionDate?: string;
}

const Tasks = () => {
    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [tasks, setTasks] = useState<TaskRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [filterMeetingId, setFilterMeetingId] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [availableMeetings, setAvailableMeetings] = useState<{ id: string, title: string }[]>([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Edit Modal State
    const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
    const [editTaskStatus, setEditTaskStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('PENDING');
    const [editTaskNotes, setEditTaskNotes] = useState('');
    const [editTaskCompletionDate, setEditTaskCompletionDate] = useState('');
    const [isUpdatingTask, setIsUpdatingTask] = useState(false);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: String(page),
                limit: '10'
            });
            if (filterMeetingId) params.append('meetingId', filterMeetingId);
            if (filterStatus) params.append('status', filterStatus);
            if (filterDate) params.append('date', filterDate);

            const response = await api.get(`/tasks?${params.toString()}`);
            setTasks(response.data.data);
            setTotalPages(response.data.pagination?.totalPages || 1);
            setTotalItems(response.data.pagination?.total || 0);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1); // Reset page when filters change
    }, [filterMeetingId, filterStatus, filterDate]);

    useEffect(() => {
        fetchTasks();
    }, [page, filterMeetingId, filterStatus, filterDate]);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const response = await api.get('/meetings?limit=100');
                setAvailableMeetings(response.data.data.map((m: any) => ({ id: m.id, title: m.title })));
            } catch (err) {
                console.error('Error fetching meetings for filters', err);
            }
        };
        fetchMeetings();
    }, []);

    const handleOpenEditTask = (task: TaskRecord) => {
        setEditingTask(task);
        setEditTaskStatus(task.status);
        setEditTaskNotes(task.notes || '');
        setEditTaskCompletionDate(task.completionDate ? task.completionDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    };

    const handleUpdateTask = async () => {
        if (!editingTask) return;

        if (editTaskStatus === 'COMPLETED' && (!editTaskNotes.trim() || !editTaskCompletionDate)) {
            alert('É obrigatório preencher a Data de Conclusão e uma Anotação para encerrar o encaminhamento.');
            return;
        }

        try {
            setIsUpdatingTask(true);
            const payloadDate = editTaskCompletionDate ? new Date(`${editTaskCompletionDate}T12:00:00.000Z`).toISOString() : undefined;
            const payload = {
                status: editTaskStatus,
                notes: editTaskNotes,
                completionDate: editTaskStatus === 'COMPLETED' ? payloadDate : undefined
            };

            const response = await api.put(`/tasks/${editingTask.id}`, payload);
            setTasks(tasks.map(t => t.id === editingTask.id ? response.data : t));
            setEditingTask(null);
        } catch (error) {
            console.error('Error updating task status', error);
            alert('Erro ao atualizar o encaminhamento.');
        } finally {
            setIsUpdatingTask(false);
        }
    };

    const isOverdue = (dueDate: string | null, status: string) => {
        if (!dueDate || status === 'COMPLETED' || status === 'CANCELLED') return false;
        return new Date(dueDate) < new Date();
    };

    const getAssigneeName = (t: TaskRecord) => t.assignee?.name || t.assigneeEmail || 'Não atribuído';

    const activeFiltersCount = [filterMeetingId, filterStatus, filterDate].filter(Boolean).length;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Encaminhamentos</h1>
                    <p className="text-sm text-slate-500 mt-1">Acompanhe tarefas geradas por IA a partir das reuniões.</p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar responsável ou tarefa..."
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 transition-colors w-64"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn("flex items-center space-x-2 border px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer", showFilters || activeFiltersCount > 0 ? "bg-primary-50 border-primary-200 text-primary-700" : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700")}
                    >
                        <Filter className="w-4 h-4" />
                        <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                    </button>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setView('list')}
                            className={cn("p-1.5 rounded-md transition-colors", view === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            title="Lista"
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('kanban')}
                            className={cn("p-1.5 rounded-md transition-colors", view === 'kanban' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            title="Kanban"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Reunião</label>
                        <select
                            value={filterMeetingId}
                            onChange={e => setFilterMeetingId(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-primary-500 bg-white"
                        >
                            <option value="">Todas as reuniões</option>
                            {availableMeetings.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-primary-500 bg-white"
                        >
                            <option value="">Todos</option>
                            <option value="PENDING">Pendentes</option>
                            <option value="IN_PROGRESS">Em Progresso</option>
                            <option value="COMPLETED">Concluídas</option>
                            <option value="CANCELLED">Canceladas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Data (Prazo Limitador)</label>
                        <input
                            type="date"
                            title="Buscar tarefas marcadas para essa data"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-primary-500 bg-white"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={() => { setFilterMeetingId(''); setFilterStatus(''); setFilterDate(''); }}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded-md transition-colors w-full md:w-auto"
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center p-12 text-slate-500">Caregando tarefas...</div>
                ) : view === 'list' ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] max-h-[70vh]">
                        <div className="overflow-x-auto overflow-y-auto flex-1 relative">
                            <table className="min-w-full divide-y divide-slate-200 relative">
                                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tarefa</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reunião Anexada</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Responsável</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prazo</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {tasks.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">Nenhuma tarefa encontrada.</td></tr>
                                    )}
                                    {tasks.map((t) => {
                                        const overdue = isOverdue(t.dueDate, t.status);
                                        return (
                                            <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        {overdue && <Flame className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900 line-clamp-2">{t.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="bg-primary-50 border border-primary-200 text-primary-700 px-2.5 py-1 rounded-md flex items-center shadow-sm">
                                                            <Calendar className="w-3.5 h-3.5 mr-2 opacity-75" />
                                                            <span className="text-xs font-semibold">{t.meeting?.title || 'Reunião Excluída'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-300">
                                                            {getAssigneeName(t).charAt(0).toUpperCase()}
                                                        </div>
                                                        <span>{getAssigneeName(t)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {t.dueDate ? (
                                                        <div className={cn("inline-flex items-center text-xs font-medium px-2 py-1 rounded-md", overdue ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-slate-50 text-slate-600 border border-slate-200")}>
                                                            <Clock className="w-3 h-3 mr-1.5" />
                                                            {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">Sem prazo</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditTask(t)}
                                                        className={cn("px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full hover:opacity-80 transition-opacity",
                                                            t.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                                        )}>
                                                        {t.status === 'COMPLETED' ? 'Concluída' : 'Pendente'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditTask(t)}
                                                        className="flex items-center space-x-1 text-slate-500 hover:text-primary-600 transition-colors px-2 py-1.5 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                        <span className="text-xs font-medium">Editar</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full space-x-6 overflow-x-auto pb-4">
                        {/* Todo Column */}
                        <div className="flex-shrink-0 w-80 flex flex-col">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-semibold text-slate-700 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                                    Pendentes
                                </h3>
                                <span className="text-xs font-medium text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                                    {tasks.filter(t => t.status !== 'COMPLETED').length}
                                </span>
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-3">
                                {tasks.filter(t => t.status !== 'COMPLETED').map(t => {
                                    const overdue = isOverdue(t.dueDate, t.status);
                                    return (
                                        <div key={t.id} className={cn("bg-white p-4 rounded-lg shadow-sm border", overdue ? "border-l-4 border-l-rose-500 border-t-slate-200 border-r-slate-200 border-b-slate-200" : "border-slate-200")} onClick={() => handleOpenEditTask(t)} role="button">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="inline-flex items-center text-[10px] font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-1 rounded shadow-sm w-full">
                                                    <Calendar className="w-3 h-3 mr-1.5 opacity-80 flex-shrink-0" />
                                                    <span className="truncate">{t.meeting?.title || 'Reunião Excluída'}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-sm font-medium text-slate-900 leading-snug">{t.description}</h4>
                                                {overdue && <Flame className="w-4 h-4 text-rose-500 ml-2 flex-shrink-0" />}
                                            </div>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex -space-x-1">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-700" title={getAssigneeName(t)}>
                                                        {getAssigneeName(t).charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                {t.dueDate && (
                                                    <span className={cn("text-xs font-medium", overdue ? "text-rose-600" : "text-slate-500")}>
                                                        {new Date(t.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Done Column */}
                        <div className="flex-shrink-0 w-80 flex flex-col">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-semibold text-slate-700 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                                    Concluídas
                                </h3>
                                <span className="text-xs font-medium text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                                    {tasks.filter(t => t.status === 'COMPLETED').length}
                                </span>
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-3 opacity-75">
                                {tasks.filter(t => t.status === 'COMPLETED').map(t => (
                                    <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200" onClick={() => handleOpenEditTask(t)} role="button">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="inline-flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded w-full">
                                                <Calendar className="w-3 h-3 mr-1.5 opacity-60 flex-shrink-0" />
                                                <span className="truncate">{t.meeting?.title || 'Reunião Excluída'}</span>
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-medium text-slate-600 mb-3 line-through leading-snug">{t.description}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 mt-4 rounded-xl shadow-sm sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50">Anterior</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= Math.max(1, totalPages)} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50">Próxima</button>
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
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= Math.max(1, totalPages)} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                    <span className="sr-only">Próxima</span>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            {/* Custom Modal for Task Edition / Completion */}
            {
                editingTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{editingTask.description}</h3>
                                <button type="button" onClick={() => setEditingTask(null)} disabled={isUpdatingTask} className="text-slate-400 hover:text-slate-600 transition-colors p-1"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        value={editTaskStatus}
                                        onChange={e => setEditTaskStatus(e.target.value as any)}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-primary-500 bg-white"
                                        disabled={isUpdatingTask}
                                    >
                                        <option value="PENDING">Pendente</option>
                                        <option value="IN_PROGRESS">Em Progresso</option>
                                        <option value="COMPLETED">Concluída</option>
                                        <option value="CANCELLED">Cancelada</option>
                                    </select>
                                </div>

                                {editTaskStatus === 'COMPLETED' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-md font-medium">
                                            Para marcar como concluída, deixe uma anotação de repasse e registre a data final real do fechamento.
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Data Real de Conclusão *</label>
                                            <input
                                                type="date"
                                                value={editTaskCompletionDate}
                                                onChange={e => setEditTaskCompletionDate(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-primary-500"
                                                disabled={isUpdatingTask}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Anotações da Conclusão *</label>
                                            <textarea
                                                rows={3}
                                                value={editTaskNotes}
                                                onChange={e => setEditTaskNotes(e.target.value)}
                                                placeholder="Desfechos, links produzidos, observações finais..."
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-primary-500 resize-none"
                                                disabled={isUpdatingTask}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setEditingTask(null)} disabled={isUpdatingTask} className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">Cancelar</button>
                                    <button
                                        type="button"
                                        onClick={handleUpdateTask}
                                        disabled={isUpdatingTask || (editTaskStatus === 'COMPLETED' && (!editTaskNotes.trim() || !editTaskCompletionDate))}
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center shadow-sm"
                                    >
                                        {isUpdatingTask ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Tasks;
