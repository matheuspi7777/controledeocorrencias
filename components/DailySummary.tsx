
import React, { useState, useMemo } from 'react';
import { DailySummary, ReportEntry } from '../types';

interface DailySummaryProps {
  summaries: DailySummary[];
  onSave: (summary: DailySummary) => void;
  onDelete?: (id: string) => void;
}

const DailySummaryView: React.FC<DailySummaryProps> = ({ summaries, onSave, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newFieldName, setNewFieldName] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const [searchNatureTerm, setSearchNatureTerm] = useState('');
  const [customNatures, setCustomNatures] = useState<Record<string, string>>({});
  const [newNatureName, setNewNatureName] = useState('');
  const [showAddNatureModal, setShowAddNatureModal] = useState(false);

  const getTodayLocal = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const occurrenceLabels: Record<string, string> = {
    bo: 'BOLETIM DE OCORRÊNCIA',
    tco: 'TERMO CIRCUNSTANCIADO',
    tentativa_homicidio: 'TENTATIVA DE HOMICÍDIO',
    tentativa_roubo: 'TENTATIVA DE ROUBO',
    tentativa_latrocinio: 'TENTATIVA DE LATROCÍNIO',
    tentativa_feminicidio: 'TENTATIVA DE FEMINICÍDIO',
    violencia_domestica: 'VIOLÊNCIA DOMÉSTICA',
    estupro_vulneravel: 'ESTUPRO DE VULNERÁVEL',
    apreensao_veiculo: 'APREENSÃO DE VEÍCULO',
    desacato: 'DESACATO / DESOBEDIÊNCIA',
    importunacao_sexual: 'IMPORTUNAÇÃO SEXUAL',
    ameaca: 'AMEAÇA',
    assedio: 'ASSÉDIO',
    injuria: 'INJÚRIA',
    arrombamento: 'ARROMBAMENTO',
    associacao_criminosa: 'ASSOCIAÇÃO CRIMINOSA',
    tentativa_estupro: 'TENTATIVA DE ESTUPRO',
    estelionato: 'ESTELIONATO',
    acidente_transito: 'ACIDENTE DE TRÂNSITO',
    acidente_fatal: 'ACIDENTE COM VÍTIMA FATAL',
    embriaguez: 'EMBRIAGUEZ AO VOLANTE',
    consumo_drogas: 'CONSUMO PESSOAL DE DROGAS',
    vias_de_fato: 'VIAS DE FATO',
    difamacao: 'DIFAMAÇÃO',
    invasao_domiciliar: 'INVASÃO DOMICILIAR',
    preservacao_direito: 'PRESERVAÇÃO DE DIREITO',
    lesao_corporal: 'LESÃO CORPORAL',
    lesao_arma_fogo: 'LESÃO CORPORAL (PAF)',
    flagrantes: 'FLAGRANTES',
    sequestro: 'SEQUESTRO',
    quebra_medida: 'QUEBRA DE MEDIDA PROTETIVA',
    violacao_tornozeleira: 'VIOLAÇÃO DE TORNOZELEIRA'
  };

  const conduzidosLabels: Record<string, string> = {
    masculino: 'SEXO MASCULINO',
    feminino: 'SEXO FEMININO',
    menor_infrator: 'MENOR INFRATOR'
  };

  const initialFormState: Partial<DailySummary> = {
    date: getTodayLocal(),
    counts: {},
    conduzidos: { masculino: 0, feminino: 0, menor_infrator: 0 },
    entries: []
  };

  const [formData, setFormData] = useState<Partial<DailySummary>>(initialFormState);

  // Carregar rascunho
  React.useEffect(() => {
    if (!isEditing && showForm) {
      const draft = localStorage.getItem('pmma_summary_draft');
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          setFormData(prev => ({ ...prev, ...parsedDraft }));
        } catch (e) {
          console.error('Erro ao carregar rascunho:', e);
        }
      }
    }
  }, [showForm, isEditing]);

  // Salvar rascunho
  React.useEffect(() => {
    if (!isEditing && showForm) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('pmma_summary_draft', JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, showForm, isEditing]);

  const calculateTotals = (entries: ReportEntry[]) => {
    const counts: Record<string, number> = {};
    const conduzidos = { masculino: 0, feminino: 0, menor_infrator: 0 };

    entries.forEach(entry => {
      // Increment report type count
      const typeKey = entry.type.toLowerCase();
      counts[typeKey] = (counts[typeKey] || 0) + 1;

      // Increment nature counts
      entry.natures.forEach(nature => {
        counts[nature] = (counts[nature] || 0) + 1;
      });

      // Increment conduzidos counts
      conduzidos.masculino += entry.conduzidos.masculino;
      conduzidos.feminino += entry.conduzidos.feminino;
      conduzidos.menor_infrator += entry.conduzidos.menor_infrator;
    });

    return { counts, conduzidos };
  };

  const handleAddEntry = (type: 'BO' | 'TCO') => {
    const newEntry: ReportEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      natures: [],
      conduzidos: { masculino: 0, feminino: 0, menor_infrator: 0 }
    };
    const newEntries = [...(formData.entries || []), newEntry];
    const { counts, conduzidos } = calculateTotals(newEntries);
    setFormData({ ...formData, entries: newEntries, counts, conduzidos });
  };

  const handleRemoveEntry = (id: string) => {
    const newEntries = (formData.entries || []).filter(e => e.id !== id);
    const { counts, conduzidos } = calculateTotals(newEntries);
    setFormData({ ...formData, entries: newEntries, counts, conduzidos });
  };

  const handleUpdateEntry = (id: string, updates: Partial<ReportEntry>) => {
    const newEntries = (formData.entries || []).map(e => e.id === id ? { ...e, ...updates } : e);
    const { counts, conduzidos } = calculateTotals(newEntries);
    setFormData({ ...formData, entries: newEntries, counts, conduzidos });
  };

  const toggleNatureInEntry = (entryId: string, natureKey: string) => {
    const entry = (formData.entries || []).find(e => e.id === entryId);
    if (!entry) return;
    const newNatures = entry.natures.includes(natureKey)
      ? entry.natures.filter(n => n !== natureKey)
      : [...entry.natures, natureKey];
    handleUpdateEntry(entryId, { natures: newNatures });
  };

  const handleAddCustomNature = () => {
    if (!newNatureName.trim()) return;
    const key = newNatureName.toLowerCase().trim().replace(/\s+/g, '_');
    setCustomNatures(prev => ({ ...prev, [key]: newNatureName.toUpperCase().trim() }));
    setNewNatureName('');
    setShowAddNatureModal(false);
  };

  const handleOpenNew = () => {
    setFormData({ ...initialFormState, date: getTodayLocal() });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditClick = (summary: DailySummary) => {
    setFormData(summary);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const newSummary: DailySummary = {
        ...formData,
        id: isEditing ? formData.id : Math.random().toString(36).substr(2, 9),
        reportedBy: 'P/3 - 43° BPM',
        createdAt: isEditing ? (formData.createdAt || new Date().toISOString()) : new Date().toISOString()
      } as DailySummary;
      onSave(newSummary);
      if (!isEditing) {
        localStorage.removeItem('pmma_summary_draft');
      }
      setShowForm(false);
      setIsSaving(false);
    }, 400);
  };

  const handleCloseForm = () => {
    if (!isEditing) {
      localStorage.removeItem('pmma_summary_draft');
    }
    setShowForm(false);
  };

  const formatDateLocale = (dateStr: string) => {
    // If it's already an ISO string or just yyyy-mm-dd
    const parts = dateStr.includes('T') ? dateStr.split('T')[0].split('-') : dateStr.split('-');
    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR');
  };

  const filteredNatures = useMemo(() => {
    const term = searchNatureTerm.toLowerCase().trim();
    const allLabels = { ...occurrenceLabels, ...customNatures };
    const entries = (Object.entries(allLabels) as [string, string][]).filter(([key, label]) => {
      if (key === 'bo' || key === 'tco') return false;
      return label.toLowerCase().includes(term) || key.toLowerCase().includes(term);
    });

    // Sort to put flagrantes first, then alphabetically
    return entries.sort((a, b) => {
      if (a[0] === 'flagrantes') return -1;
      if (b[0] === 'flagrantes') return 1;
      return a[1].localeCompare(b[1]);
    });
  }, [searchNatureTerm, customNatures]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Histórico de Resumos Operacionais</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Controle de Outras Ocorrências e Conduções</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="bg-[#ffd700] text-[#002b5c] px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-[#ffea00] transition-all shadow-lg flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Novo Lançamento Diário
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => !isSaving && handleCloseForm()}></div>
          <div className="relative bg-[#020617] rounded-[1.5rem] sm:rounded-[2rem] w-full max-w-7xl max-h-[98vh] overflow-hidden flex flex-col border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">

            <header className="px-6 sm:px-8 py-4 sm:py-5 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#ffd700] text-[#002b5c] rounded-xl flex items-center justify-center shadow-lg shadow-[#ffd700]/10">
                  <i className={`fa-solid ${isEditing ? 'fa-pen-to-square' : 'fa-file-signature'} text-lg`}></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">
                    {isEditing ? 'Atualização de Resumo' : 'Novo Lançamento Diário (P/3)'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">43º Batalhão de Polícia Militar - MA</p>
                </div>
              </div>
              {!isSaving && (
                <button onClick={handleCloseForm} className="text-slate-500 hover:text-white p-2 transition-colors">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              )}
            </header>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 custom-scrollbar bg-[#020617]">
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                <div className="w-full sm:w-52 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data Referência</label>
                  <input
                    type="date"
                    required
                    style={{ colorScheme: 'dark' }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-[#1e293b] text-white font-black text-sm outline-none focus:ring-2 focus:ring-[#ffd700]/50"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="flex-1 flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => handleAddEntry('BO')}
                    className="flex-1 bg-[#ffd700]/10 text-[#ffd700] px-4 py-3 rounded-xl border border-[#ffd700]/30 font-black text-xs uppercase hover:bg-[#ffd700]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-file-invoice"></i> + B.O
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddEntry('TCO')}
                    className="flex-1 bg-blue-500/10 text-blue-400 px-4 py-3 rounded-xl border border-blue-500/30 font-black text-xs uppercase hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-file-signature"></i> + TCO
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {(formData.entries || []).length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl opacity-50">
                    <i className="fa-solid fa-folder-open text-4xl text-slate-600 mb-4"></i>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Nenhuma ocorrência (B.O/TCO) adicionada</p>
                  </div>
                ) : (
                  formData.entries?.map((entry, entryIdx) => (
                    <div key={entry.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden animate-in slide-in-from-bottom-4">
                      <div className={`px-6 py-4 flex justify-between items-center ${entry.type === 'BO' ? 'bg-[#ffd700]/10' : 'bg-blue-500/10'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase ${entry.type === 'BO' ? 'bg-[#ffd700] text-[#002b5c]' : 'bg-blue-500 text-white'}`}>
                            {entry.type === 'BO' ? 'Boletim de Ocorrência' : 'Termo Circunstanciado'}
                          </span>
                          <span className="text-slate-400 text-[10px] font-black uppercase">#{entryIdx + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEntry(entry.id)}
                          className="text-red-500 hover:text-red-400 p-2 transition-colors"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Naturezas do {entry.type}</label>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <div className="relative flex-1">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-2 text-slate-500 text-[10px]"></i>
                                <input
                                  type="text"
                                  placeholder="Filtrar naturezas..."
                                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 bg-black/20 text-white font-black text-[9px] uppercase outline-none focus:border-[#ffd700]/50"
                                  value={searchNatureTerm}
                                  onChange={(e) => setSearchNatureTerm(e.target.value)}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowAddNatureModal(true)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-[9px] font-black uppercase flex items-center gap-2"
                              >
                                <i className="fa-solid fa-plus text-[8px]"></i> Outra
                              </button>
                            </div>
                          </div>

                          <div className="max-h-40 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {filteredNatures.map(([key, label]) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => toggleNatureInEntry(entry.id, key)}
                                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase text-left transition-all border ${entry.natures.includes(key)
                                  ? 'bg-[#ffd700] text-[#002b5c] border-[#ffd700]'
                                  : key === 'flagrantes'
                                    ? 'bg-[#ffd700]/10 text-[#ffd700] border-[#ffd700]/40 hover:bg-[#ffd700]/20'
                                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-slate-600'
                                  }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800 space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conduzidos no {entry.type}</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {Object.entries(conduzidosLabels).map(([key, label]) => (
                              <div key={key} className="bg-red-900/5 border border-red-900/10 rounded-xl overflow-hidden flex items-center">
                                <label className="flex-1 px-4 py-2 text-[9px] font-black text-red-500 uppercase truncate">{label}</label>
                                <input
                                  type="number"
                                  min="0"
                                  className="w-16 bg-black/40 border-l border-red-900/10 py-2 text-center text-white font-black text-xs outline-none focus:bg-white/5"
                                  value={(entry.conduzidos as any)[key]}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    handleUpdateEntry(entry.id, {
                                      conduzidos: { ...entry.conduzidos, [key]: val }
                                    });
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </form>

            <footer className="p-4 sm:p-6 border-t border-slate-800 bg-[#0f172a] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Total Ocorrências</span>
                  <p className="text-sm font-black text-[#ffd700]">{(formData.counts?.bo || 0) + (formData.counts?.tco || 0)}</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-500 uppercase">Total Conduzidos</span>
                  <p className="text-sm font-black text-red-500">
                    {(Object.values(formData.conduzidos || {}) as number[]).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-6 py-3 bg-slate-800 text-slate-400 font-black rounded-xl hover:text-white transition-all text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving || (formData.entries || []).length === 0}
                  className="px-10 py-3 bg-[#ffd700] text-[#002b5c] font-black rounded-xl hover:bg-[#ffea00] transition-all text-xs uppercase shadow-xl shadow-[#ffd700]/10 disabled:opacity-50"
                >
                  {isSaving ? 'Gravando...' : (isEditing ? 'Atualizar' : 'Finalizar Lançamento')}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        {summaries.length > 0 ? (
          summaries.map((summary) => (
            <div key={summary.id} className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800 shadow-xl hover:border-[#ffd700]/30 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Referência</span>
                  <p className="text-sm font-black text-white">{formatDateLocale(summary.date)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(summary)}
                    className="w-10 h-10 rounded-full bg-[#ffd700]/10 flex items-center justify-center text-[#ffd700] hover:bg-[#ffd700] hover:text-[#002b5c] transition-all border border-[#ffd700]/20"
                  ><i className="fa-solid fa-pen"></i></button>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(summary.id)}
                      className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                      title="Excluir Lançamento"
                    ><i className="fa-solid fa-trash-can"></i></button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Total (B.O + TCO)</span>
                    <p className="text-2xl font-black text-white">{(summary.counts.bo || 0) + (summary.counts.tco || 0)}</p>
                  </div>
                  <div className="bg-red-900/10 p-4 rounded-2xl border border-red-900/20">
                    <span className="text-[8px] font-black text-red-500 uppercase block mb-1">Conduzidos</span>
                    <p className="text-2xl font-black text-red-400">
                      {(summary.conduzidos.masculino || 0) + (summary.conduzidos.feminino || 0) + (summary.conduzidos.menor_infrator || 0)}
                    </p>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-800">
                  <h5 className="text-[10px] font-black text-[#ffd700] uppercase mb-3 flex items-center gap-2">Distribuição de Naturezas</h5>
                  <div className="space-y-2">
                    {(Object.entries(summary.counts) as [string, number][])
                      .filter(([key, val]) => val > 0 && key !== 'bo' && key !== 'tco')
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                          <span className="text-[10px] font-bold text-slate-300 uppercase truncate pr-4">{occurrenceLabels[key] || key}</span>
                          <span className="text-xs font-black text-[#ffd700]">{val}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {summary.entries?.length || 0} Registros Vinculados
                    </span>
                  </div>
                  <span className="text-[8px] font-black text-slate-700 uppercase">P/3 - 43 BPM</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-40 bg-[#0f172a] rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-700 mb-8">
              <i className="fa-solid fa-file-circle-exclamation text-5xl"></i>
            </div>
            <h4 className="text-slate-500 font-black uppercase text-base tracking-widest">Nenhum registro operacional processado</h4>
          </div>
        )}
        {showAddNatureModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddNatureModal(false)}></div>
            <div className="relative bg-[#0f172a] rounded-3xl p-6 w-full max-w-md border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#ffd700] text-[#002b5c] rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-plus text-lg"></i>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Nova Natureza</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Adicione um tipo de ocorrência extra</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Natureza</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Ex: TRÁFICO DE DROGAS"
                    className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#1e293b] text-white font-black text-xs uppercase outline-none focus:ring-2 focus:ring-[#ffd700]/50"
                    value={newNatureName}
                    onChange={(e) => setNewNatureName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomNature()}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddNatureModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-800 text-slate-400 font-black rounded-xl hover:text-white transition-all text-[10px] uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddCustomNature}
                    className="flex-1 px-4 py-3 bg-[#ffd700] text-[#002b5c] font-black rounded-xl hover:bg-[#ffea00] transition-all text-[10px] uppercase"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailySummaryView;
