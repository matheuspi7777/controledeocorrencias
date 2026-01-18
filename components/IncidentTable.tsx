import * as React from 'react';
import { Incident, IncidentStatus } from '../types.ts';

interface IncidentTableProps {
    incidents: Incident[];
    onView: (incident: Incident) => void;
    onEdit: (incident: Incident) => void;
    onDelete: (id: string) => void;
}

const IncidentTable: React.FC<IncidentTableProps> = ({
    incidents,
    onView,
    onEdit,
    onDelete
}) => {
    return (
        <div className="bg-[#0f172a] rounded-2xl shadow-xl border border-slate-800 overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[800px] lg:min-w-full">
                    <thead className="bg-[#002b5c] text-white">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Número Ocorrência</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">SIGMA</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Tipo</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Local / Detalhes</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {incidents.length > 0 ? incidents.map((inc) => (
                            <tr key={inc.id} className="hover:bg-slate-800/50 transition-colors group">
                                <td className="px-6 py-4"><span className="font-black text-slate-100">{inc.incidentNumber}</span></td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-[#ffd700]/10 rounded text-xs font-mono font-black text-[#ffd700]">{inc.sigma}</span></td>
                                <td className="px-6 py-4"><span className="text-[11px] text-red-500 font-black uppercase">{inc.type}</span></td>
                                <td className="px-6 py-4">
                                    <p className="text-xs text-slate-300 max-w-[250px] truncate font-bold">{inc.location.address}</p>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter mt-1">
                                        {new Date(inc.date).toLocaleString('pt-BR')} {inc.garrison ? `| GU: ${inc.garrison}` : ''}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border-2 ${inc.status === IncidentStatus.CONCLUIDO ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-amber-900/20 text-amber-400 border-amber-900/50'
                                            }`}>{inc.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-1">
                                        <button onClick={() => onView(inc)} title="Ver Detalhes" className="p-2 text-slate-500 hover:text-white transition-colors relative z-10"><i className="fa-solid fa-eye"></i></button>
                                        <button onClick={() => onEdit(inc)} title="Editar" className="p-2 text-slate-500 hover:text-[#ffd700] transition-colors relative z-10"><i className="fa-solid fa-pen-to-square"></i></button>
                                        <button onClick={() => onDelete(inc.id)} title="Excluir" className="p-2 text-slate-500 hover:text-red-600 transition-colors relative z-10"><i className="fa-solid fa-trash-can"></i></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-600 font-black uppercase text-xs tracking-widest">Nenhum registro encontrado para esta busca.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IncidentTable;
