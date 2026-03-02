import { Search, Bell, Plus, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
            {/* Global Command Palette Trigger fake input */}
            <div className="flex-1 max-w-md">
                <div className="relative group cursor-pointer">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <div className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50 hover:bg-white hover:border-slate-300 transition-colors">
                        Buscar reuniões ou contatos... <kbd className="ml-2 px-1.5 py-0.5 rounded-md border border-slate-300 bg-slate-100 text-xs font-sans">Cmd+K</kbd>
                    </div>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/meetings', { state: { openForm: true } })}
                    className="flex items-center space-x-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nova Reunião</span>
                </button>

                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center cursor-pointer overflow-hidden" title={user?.email || 'Perfil'}>
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-indigo-700 font-semibold text-sm uppercase">
                            {user?.displayName ? user.displayName.charAt(0) : (user?.email ? user.email.charAt(0) : <UserIcon className="w-4 h-4" />)}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
