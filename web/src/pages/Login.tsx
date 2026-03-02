import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { user, signInWithGoogle } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login interativo com o Google');
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
                <div className="bg-white py-12 px-4 shadow-sm sm:rounded-2xl border border-slate-100 sm:px-10">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <p className="text-sm text-slate-500">
                            Para acessar a plataforma corporativa, utilize sua conta Google. Requisitos de segurança solicitam uma credencial de e-mail válida.
                        </p>
                    </div>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full inline-flex justify-center items-center py-3.5 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Abrindo pop-up de segurança...</span>
                            ) : (
                                <>
                                    <img className="h-5 w-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                                    <span>Continuar com Workspace / Google</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
