import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, AlertCircle, CheckSquare as CheckSquareIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, trend, trendLabel }: any) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary-600" />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-600 font-medium">{trend}</span>
                <span className="text-slate-500 ml-2">{trendLabel}</span>
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        meetingsToday: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        totalContacts: 0
    });

    const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
    const [criticalTasks, setCriticalTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [meetingsRes, tasksRes, contactsRes] = await Promise.all([
                    api.get('/meetings?limit=100'),
                    api.get('/tasks?limit=100'),
                    api.get('/contacts?limit=100')
                ]);

                const meetings = meetingsRes.data.data || [];
                const tasks = tasksRes.data.data || [];
                const contactsItems = contactsRes.data.data || [];
                const contacts = Array.isArray(contactsItems) ? contactsItems : [];

                const todayStr = new Date().toISOString().split('T')[0];
                const todayMeetings = meetings.filter((m: any) => m.date && m.date.startsWith(todayStr)).length;

                const pending = tasks.filter((t: any) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
                const overdue = pending.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date());

                setStats({
                    meetingsToday: todayMeetings,
                    pendingTasks: pending.length,
                    overdueTasks: overdue.length,
                    totalContacts: contacts.length
                });

                // Sort meetings by date ascending
                const sortedM = meetings.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setUpcomingMeetings(sortedM.filter((m: any) => new Date(m.date) >= new Date()).slice(0, 3));

                // Sort overdue tasks
                const sortedT = overdue.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                setCriticalTasks(sortedT.slice(0, 4));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatDay = (dateString: string) => {
        const d = new Date(dateString);
        return {
            month: d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
            day: d.getDate()
        };
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
                    <p className="text-sm text-slate-500 mt-1">Acompanhe suas métricas e próximas reuniões.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Reuniões Hoje" value={isLoading ? '-' : stats.meetingsToday} icon={CalendarIcon} />
                <StatCard title="Encaminhamentos" value={isLoading ? '-' : stats.pendingTasks} icon={CheckSquareIcon} />
                <StatCard title="Atrasadas" value={isLoading ? '-' : stats.overdueTasks} icon={AlertCircle} trend="Ação requirida" />
                <StatCard title="Total de Contatos" value={isLoading ? '-' : stats.totalContacts} icon={Users} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Próximas Reuniões */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-base font-semibold text-slate-900">Próximas Reuniões</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {isLoading ? (
                                <p className="text-sm text-slate-500">Carregando...</p>
                            ) : upcomingMeetings.length === 0 ? (
                                <p className="text-sm text-slate-500">Nenhuma reunião futura encontrada.</p>
                            ) : upcomingMeetings.map((m) => {
                                const { month, day } = formatDay(m.date);
                                const startStr = m.startTime ? new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                const endStr = m.endTime ? new Date(m.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                const timeStr = startStr && endStr ? `${startStr} - ${endStr}` : startStr || 'Horário a definir';

                                return (
                                    <div key={m.id} className="flex items-start space-x-4 p-4 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors">
                                        <div className="w-12 h-12 rounded-lg bg-slate-50 flex flex-col items-center justify-center border border-slate-200">
                                            <span className="text-[10px] text-slate-500 font-medium uppercase">{month}</span>
                                            <span className="text-lg font-bold text-slate-900 leading-none">{day}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{m.title}</h3>
                                            <div className="mt-1 flex items-center text-xs text-slate-500 space-x-3">
                                                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {timeStr}</span>
                                                {m.type === 'ONLINE' ? (
                                                    <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium border border-indigo-100">Online</span>
                                                ) : (
                                                    <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-100">Presencial</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate('/meetings', { state: { viewMeeting: m } })}
                                            className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md hover:bg-slate-800 transition-colors"
                                        >
                                            Detalhes
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Encaminhamentos Críticos */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-semibold text-slate-900">Encaminhamentos Críticos</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {isLoading ? (
                                <p className="text-sm text-slate-500">Carregando...</p>
                            ) : criticalTasks.length === 0 ? (
                                <p className="text-sm text-slate-500">Nenhuma tarefa atrasada.</p>
                            ) : criticalTasks.map((t) => (
                                <div key={t.id} className="flex items-start space-x-3">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 shadow-sm flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{t.description}</p>
                                        <p className="text-xs text-rose-600 font-medium mt-1">Prazo era: {new Date(t.dueDate).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
