import { NavLink } from 'react-router-dom';
import { Calendar, CheckSquare, Users, Settings, Home, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: (string | undefined | null | false)[]) => {
    return twMerge(clsx(inputs));
};

const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Reuniões', path: '/meetings', icon: Calendar },
    { name: 'Encaminhamentos', path: '/tasks', icon: CheckSquare },
    { name: 'Contatos', path: '/contacts', icon: Users },
    { name: 'Configurações', path: '/settings', icon: Settings },
];

import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm">
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <div className="w-8 h-8 rounded-md bg-primary-600 flex items-center justify-center text-white font-bold text-xl mr-3">
                    R
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">Reunião</span>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                                    isActive
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        className={cn(
                                            'w-5 h-5 flex-shrink-0 transition-colors',
                                            isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'
                                        )}
                                    />
                                    <span>{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 text-slate-600 hover:text-rose-600 w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium focus:outline-none"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                </button>
                <div className="mt-4 text-center">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Versão 1.0.0</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
