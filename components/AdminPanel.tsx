import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';

const AdminPanel: React.FC = () => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (err) {
            console.error('Error fetching profiles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleApproval = async (profile: UserProfile) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: !profile.is_approved })
                .eq('id', profile.id);

            if (error) throw error;
            setProfiles(profiles.map(p =>
                p.id === profile.id ? { ...p, is_approved: !p.is_approved } : p
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Erro ao atualizar status do usuário.');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Administração de Acesso</h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Aprove ou gerencie o acesso de usuários ao sistema</p>
            </div>

            <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Policial</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Cadastro</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                        <i className="fa-solid fa-circle-notch animate-spin mr-2"></i> carregando usuários...
                                    </td>
                                </tr>
                            ) : profiles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                        Nenhum usuário encontrado
                                    </td>
                                </tr>
                            ) : (
                                profiles.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${profile.is_admin ? 'bg-[#ffd700] text-[#001021]' : 'bg-slate-800 text-slate-400'
                                                    }`}>
                                                    {profile.is_admin ? <i className="fa-solid fa-crown"></i> : profile.police_id.substring(0, 1).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-white uppercase">{profile.police_id}</span>
                                                {profile.is_admin && (
                                                    <span className="text-[8px] font-black bg-[#ffd700]/10 text-[#ffd700] px-1.5 py-0.5 rounded border border-[#ffd700]/20 uppercase">Admin</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-400 text-xs font-bold">
                                                {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {profile.is_approved ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/20">
                                                    <i className="fa-solid fa-check-circle translate-y-[0.5px]"></i>
                                                    Aprovado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase border border-amber-500/20">
                                                    <i className="fa-solid fa-clock"></i>
                                                    Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!profile.is_admin && (
                                                <button
                                                    onClick={() => handleToggleApproval(profile)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${profile.is_approved
                                                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                                                            : 'bg-[#ffd700] text-[#001021] hover:bg-[#ffd700]/90 shadow-lg shadow-[#ffd700]/10'
                                                        }`}
                                                >
                                                    {profile.is_approved ? 'Revogar Acesso' : 'Aprovar Acesso'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
