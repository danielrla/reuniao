import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('demo@reuniao.app');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // For now, doing the mock login sending to our backend Auth route
            const response = await api.post('/auth/login', {
                email,
                name: 'Daniel CEO' // Mock name for now
            });

            // Assuming response is successful
            localStorage.setItem('token', 'MOCK_TOKEN');
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao realizar login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-sm">
                    R
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    Acesse sua conta
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Meeting Intelligence Platform
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl border border-slate-100 sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email Corporativo
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Senha
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Acessando...' : 'Entrar no Sistema'}
                            </button>
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">Ou continue com</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={handleLogin}
                                    disabled={isLoading}
                                    className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                                    Google Workspace
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
