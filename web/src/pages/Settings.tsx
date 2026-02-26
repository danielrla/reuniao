import { useState, useEffect } from 'react';
import { User, Save, UserPlus, Shield } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'subordinates'>('profile');

    // Profile State
    const [profile, setProfile] = useState<any>(null);
    const [profileForm, setProfileForm] = useState({ name: '', jobTitle: '', company: '', phone: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');

    // Subordinate State
    const [subordinateForm, setSubordinateForm] = useState({ name: '', email: '', password: '' });
    const [isSavingSubordinate, setIsSavingSubordinate] = useState(false);
    const [subordinateMessage, setSubordinateMessage] = useState('');

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
                                <input type="text" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" placeholder="+55 11 99999-9999" />
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
        </div>
    );
};

export default Settings;
