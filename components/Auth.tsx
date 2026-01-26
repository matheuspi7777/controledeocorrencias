
import * as React from 'react';
import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [policeId, setPoliceId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Map ID to a dummy email format for Supabase Auth
        const internalEmail = `${policeId.trim().toLowerCase()}@pmma.local`;

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email: internalEmail,
                    password,
                    options: {
                        data: {
                            police_id: policeId.trim()
                        }
                    }
                });
                if (error) throw error;
                alert('Solicitação de cadastro enviada! Aguarde a liberação do administrador.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: internalEmail,
                    password
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
                <div className="bg-[#0f172a]/80 backdrop-blur-xl p-8 lg:p-10 rounded-[2.5rem] shadow-2xl border border-slate-800 relative z-10">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#ffd700] to-[#b8860b] rounded-2xl flex items-center justify-center text-[#001021] shadow-xl mb-6 hover:scale-105 transition-transform duration-300">
                            <i className="fa-solid fa-shield-halved text-4xl"></i>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">43° BPM - P/3</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Sistema de Ocorrências</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Policial (Matrícula/CPF)</label>
                            <div className="relative group">
                                <i className="fa-solid fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#ffd700] transition-colors"></i>
                                <input
                                    type="text"
                                    required
                                    placeholder="Digite seu ID"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border-2 border-slate-800 rounded-2xl text-white outline-none focus:border-[#ffd700] focus:ring-4 focus:ring-[#ffd700]/5 transition-all font-bold placeholder:text-slate-600"
                                    value={policeId}
                                    onChange={(e) => setPoliceId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                            <div className="relative group">
                                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#ffd700] transition-colors"></i>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border-2 border-slate-800 rounded-2xl text-white outline-none focus:border-[#ffd700] focus:ring-4 focus:ring-[#ffd700]/5 transition-all font-bold placeholder:text-slate-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold animate-in slide-in-from-top-2">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-[#ffd700] to-[#daa520] text-[#001021] font-black rounded-2xl shadow-xl shadow-[#ffd700]/10 hover:shadow-[#ffd700]/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                        >
                            {loading ? (
                                <i className="fa-solid fa-circle-notch animate-spin text-xl"></i>
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Cadastrar Unidade' : 'Acessar Sistema'}</span>
                                    <i className="fa-solid fa-arrow-right"></i>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-xs font-black text-slate-500 hover:text-[#ffd700] transition-colors uppercase tracking-widest"
                        >
                            {isSignUp ? 'Já possui acesso? Clique aqui' : 'Primeiro acesso? Solicite cadastro'}
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">P/3 - Seção de Estatística e Inteligência</p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
