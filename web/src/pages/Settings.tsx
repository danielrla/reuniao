import { useState, useEffect } from 'react';
import { User, Save, UserPlus, Shield, Calendar as CalendarIcon } from 'lucide-react';
import api from '../services/api';
import { formatWhatsAppNumber } from '../utils/formatters';

const Settings = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'subordinates' | 'integrations'>('profile');

    // Profile State
    const [profile, setProfile] = useState<any>(null);
    const [profileForm, setProfileForm] = useState({ name: '', jobTitle: '', company: '', phone: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');

    // Subordinate State
    const [subordinateForm, setSubordinateForm] = useState({ name: '', email: '', password: '' });
    const [isSavingSubordinate, setIsSavingSubordinate] = useState(false);
    const [subordinateMessage, setSubordinateMessage] = useState('');

    // Integrations State
    const [integrationsForm, setIntegrationsForm] = useState({ googleClientId: '', googleClientSecret: '', googleRefreshToken: '' });
    const [isSavingIntegrations, setIsSavingIntegrations] = useState(false);
    const [integrationsMessage, setIntegrationsMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/me');
                setProfile(response.data);
                setProfileForm({
                    name: response.data.name || '',
                    jobTitle: response.data.jobTitle || '',
                    company: response.data.company || '',
                    phone: response.data.phone || ''
                });
                setIntegrationsForm({
                    googleClientId: response.data.googleClientId || '',
                    googleClientSecret: response.data.googleClientSecret || '',
                    googleRefreshToken: response.data.googleRefreshToken || ''
                });
            } catch (error) {
                console.error("Error fetching profile", error);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSavingProfile(true);
            setProfileMessage('Salvando...');
            await api.put('/users/me', profileForm);
            setProfileMessage('Perfil atualizado com sucesso!');
            setTimeout(() => setProfileMessage(''), 3000);
        } catch (error: any) {
            console.error('Error saving profile', error);
            setProfileMessage(error.response?.data?.message || 'Erro ao atualizar perfil.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSaveIntegrations = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSavingIntegrations(true);
            setIntegrationsMessage('Salvando...');
            await api.put('/users/me', integrationsForm);
            setIntegrationsMessage('Credenciais de integração atualizadas!');
            setTimeout(() => setIntegrationsMessage(''), 3000);
        } catch (error: any) {
            console.error('Error saving integrations', error);
            setIntegrationsMessage(error.response?.data?.message || 'Erro ao guardar integrações.');
        } finally {
            setIsSavingIntegrations(false);
        }
    };

    const handleCreateSubordinate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSavingSubordinate(true);
            setSubordinateMessage('Criando...');
            await api.post('/users/subordinate', subordinateForm);
            setSubordinateMessage('Subordinado (Secretariado) criado com sucesso!');
            setSubordinateForm({ name: '', email: '', password: '' });
            setTimeout(() => setSubordinateMessage(''), 3000);
        } catch (error: any) {
            console.error('Error creating subordinate', error);
            setSubordinateMessage(error.response?.data?.message || 'Erro ao criar subordinado.');
        } finally {
            setIsSavingSubordinate(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 h-full flex flex-col pl-4">
            <div className="border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
                <p className="text-sm text-slate-500 mt-1">Gerencie seu perfil e conceda acessos para seu secretariado.</p>
            </div>

            <div className="flex space-x-4 border-b border-slate-200 mb-6">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-3 text-sm font-medium ${activeTab === 'profile' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <div className="flex items-center space-x-2"><User className="w-4 h-4" /><span>Meu Perfil</span></div>
                </button>
                {profile?.role === 'ADMIN' && (
                    <button
                        onClick={() => setActiveTab('subordinates')}
                        className={`pb-3 text-sm font-medium ${activeTab === 'subordinates' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center space-x-2"><Shield className="w-4 h-4" /><span>Secretariado</span></div>
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('integrations')}
                    className={`pb-3 text-sm font-medium ${activeTab === 'integrations' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <div className="flex items-center space-x-2"><CalendarIcon className="w-4 h-4" /><span>Integrações</span></div>
                </button>
            </div>

            {activeTab === 'profile' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Informações Pessoais</h2>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                                <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail de Login</label>
                                <input type="email" value={profile?.email || ''} disabled className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500" />
                                <p className="text-xs text-slate-400 mt-1">E-mail associado à conta não pode ser alterado.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                                <input type="text" value={profileForm.company} onChange={e => setProfileForm({ ...profileForm, company: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                                <input type="text" value={profileForm.jobTitle} onChange={e => setProfileForm({ ...profileForm, jobTitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone (WhatsApp)</label>
                                <input
                                    type="text"
                                    value={profileForm.phone}
                                    onChange={e => setProfileForm({ ...profileForm, phone: formatWhatsAppNumber(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="+55 11 99999-9999"
                                />
                            </div>
                        </div>
                        {profileMessage && <p className="text-sm font-medium text-emerald-600">{profileMessage}</p>}
                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={isSavingProfile} className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                                <Save className="w-4 h-4" />
                                <span>Salvar Alterações</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'subordinates' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Criar Acesso (Secretariado)</h2>
                    <p className="text-sm text-slate-500 mb-6">Contas de secretariado têm acesso às suas reuniões e contatos corporativos em seu nome.</p>
                    <form onSubmit={handleCreateSubordinate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Subordinado *</label>
                                <input type="text" required value={subordinateForm.name} onChange={e => setSubordinateForm({ ...subordinateForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                                <input type="email" required value={subordinateForm.email} onChange={e => setSubordinateForm({ ...subordinateForm, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Senha Padrão *</label>
                                <input type="password" required value={subordinateForm.password} onChange={e => setSubordinateForm({ ...subordinateForm, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 md:w-1/2" />
                            </div>
                        </div>
                        {subordinateMessage && <p className="text-sm font-medium text-primary-600">{subordinateMessage}</p>}
                        <div className="pt-4">
                            <button type="submit" disabled={isSavingSubordinate} className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                                <UserPlus className="w-4 h-4" />
                                <span>Criar Conta de Acesso</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'integrations' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-semibold text-slate-800 mb-2">Integrações Google (Agenda & Contatos)</h2>
                    <p className="text-sm text-slate-500 mb-6"> Configure suas credenciais OAuth2 do Google Cloud Console para permitir que o sistema sincronize suas reuniões e lista de contatos bidirecionalmente.</p>

                    <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg mb-6 border border-blue-100">
                        <p className="font-semibold mb-1">Como obter suas credenciais:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-1 text-xs">
                            <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="underline">Google Cloud Console</a>.</li>
                            <li>Crie um Novo Projeto e ative a "Google Calendar API" e a "Google People API" (Contatos).</li>
                            <li>Vá em "Credentials" (Credenciais) e crie um "OAuth client ID" do tipo "Web application".</li>
                            <li>Gere as credenciais e utilize o Google OAuth Playground para obter seu <strong>Refresh Token</strong> com os escopos: <br /> <code>https://www.googleapis.com/auth/calendar</code> <br /> e <code>https://www.googleapis.com/auth/contacts</code>.</li>
                        </ol>
                    </div>

                    <form onSubmit={handleSaveIntegrations} className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Client ID</label>
                                <input
                                    type="text"
                                    value={integrationsForm.googleClientId}
                                    onChange={e => setIntegrationsForm({ ...integrationsForm, googleClientId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                                    placeholder="Ex: 123456789-abcde.apps.googleusercontent.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Client Secret</label>
                                <input
                                    type="password"
                                    value={integrationsForm.googleClientSecret}
                                    onChange={e => setIntegrationsForm({ ...integrationsForm, googleClientSecret: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                                    placeholder="Ex: GOCSPX-..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Refresh Token</label>
                                <input
                                    type="password"
                                    value={integrationsForm.googleRefreshToken}
                                    onChange={e => setIntegrationsForm({ ...integrationsForm, googleRefreshToken: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                                    placeholder="Ex: 1//0eAAA..."
                                />
                                <p className="text-xs text-slate-400 mt-1">O Refresh Token é necessário para atualizações de fundo sem que você precise relogar no Google.</p>
                            </div>
                        </div>
                        {integrationsMessage && <p className="text-sm font-medium text-primary-600">{integrationsMessage}</p>}
                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={isSavingIntegrations} className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                                <Save className="w-4 h-4" />
                                <span>Salvar Credenciais do Google</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;
