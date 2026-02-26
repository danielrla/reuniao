import { useState, useEffect } from 'react';
import { Filter, Search, LayoutList, LayoutGrid, Clock, MoreVertical, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
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
}

const Tasks = () => {
    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [tasks, setTasks] = useState<TaskRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/tasks?page=${page}&limit=50`);
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
        fetchTasks();
    }, [page]);

    const toggleTaskStatus = async (task: TaskRecord) => {
        const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        try {
            await api.put(`/tasks/${task.id}`, { status: newStatus });
            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error('Error updating task status', error);
        }
    };

    const isOverdue = (dueDate: string | null, status: string) => {
        if (!dueDate || status === 'COMPLETED' || status === 'CANCELLED') return false;
        return new Date(dueDate) < new Date();
    };

    const getAssigneeName = (t: TaskRecord) => t.assignee?.name || t.assigneeEmail || 'Não atribuído';

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Pendências Extraídas</h1>
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
                    <button className="flex items-center space-x-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Filter className="w-4 h-4" />
                        <span>Filtros</span>
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

            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center p-12 text-slate-500">Caregando tarefas...</div>
                ) : view === 'list' ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tarefa</th>
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
                                                        <p className="text-sm font-medium text-slate-900 line-clamp-1">{t.description}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">De: {t.meeting?.title || 'Reunião'}</p>
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
                                                    onClick={() => toggleTaskStatus(t)}
                                                    className={cn("px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full hover:opacity-80 transition-opacity",
                                                        t.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                                    )}>
                                                    {t.status === 'COMPLETED' ? 'Concluída' : 'Pendente'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 opacity-0 group-hover:opacity-100">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
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
                                        <div key={t.id} className={cn("bg-white p-4 rounded-lg shadow-sm border", overdue ? "border-l-4 border-l-rose-500 border-t-slate-200 border-r-slate-200 border-b-slate-200" : "border-slate-200")} onClick={() => toggleTaskStatus(t)} role="button">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="inline-flex items-center text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                    {t.meeting?.title || 'Sem Reunião'}
                                                </span>
                                                {overdue && <Flame className="w-4 h-4 text-rose-500" />}
                                            </div>
                                            <h4 className="text-sm font-medium text-slate-900 mb-3">{t.description}</h4>
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
                                    <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200" onClick={() => toggleTaskStatus(t)} role="button">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="inline-flex items-center text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded line-through">
                                                {t.meeting?.title || 'Sem Reunião'}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-medium text-slate-600 mb-3 line-through">{t.description}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 mt-4 rounded-xl shadow-sm sm:px-6">
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

export default Tasks;
