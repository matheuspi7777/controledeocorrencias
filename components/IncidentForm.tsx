
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Incident, IncidentType, IncidentStatus } from '../types.ts';

interface IncidentFormProps {
  onSave: (incident: Partial<Incident>) => void;
  onCancel: () => void;
  initialData?: Incident | null;
  existingIncidents?: Incident[];
}

const IncidentForm: React.FC<IncidentFormProps> = ({ onSave, onCancel, initialData, existingIncidents = [] }) => {
  const isEditing = !!initialData;
  const photoInputRef = useRef<HTMLInputElement>(null);

  const getLocalDatetime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<Partial<Incident>>({
    type: IncidentType.CVLI,
    isTco: false,
    status: IncidentStatus.PENDENTE,
    date: getLocalDatetime(),
    location: { address: '' },
    description: '',
    cvliType: '',
    conductedCount: 0,
    conductedProfiles: [],
    hasFlagrante: 'Não Informado',
    weaponType: '',
    weaponCount: 1,
    ammoIntactCount: 0,
    ammoDeflagratedCount: 0,
    garrison: '',
    photo: '',
    vehicleDetails: '',
    stolenDetails: '',
    customType: '',
    victim: '',
    isTimeUndefined: false,
    vehicleCount: 1,
    simulacrumCount: 1,
    stolenVehicleCount: 1,
    robbedVehicleCount: 1,
    victimCount: 1
  });

  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Carregar rascunho se não houver dados iniciais (edição)
  useEffect(() => {
    if (!initialData) {
      const draft = localStorage.getItem('pmma_incident_draft');
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          setFormData(prev => ({ ...prev, ...parsedDraft }));
        } catch (e) {
          console.error('Erro ao carregar rascunho:', e);
        }
      }
    }
  }, [initialData]);

  // Salvar rascunho automaticamente
  useEffect(() => {
    if (!isEditing) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('pmma_incident_draft', JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, isEditing]);

  const isWeaponSeizure = formData.type === IncidentType.ARMA_FOGO;
  const isSimulacro = formData.type === IncidentType.SIMULACRO;
  const isCVLI = formData.type === IncidentType.CVLI;
  const isMorteIntervencao = formData.type === IncidentType.MORTE_INTERVENCAO;
  const isCVLIStyle = isCVLI || isMorteIntervencao;
  const isCadaverOrSuicide = formData.type === IncidentType.CADAVER || formData.type === IncidentType.SUICIDIO;
  const isMandado = formData.type === IncidentType.MANDADO;
  const isDrogas = formData.type === IncidentType.DROGAS;
  const isRouboPessoa = formData.type === IncidentType.ROUBO_PESSOA;
  const isVeiculoRecuperado = formData.type === IncidentType.VEICULO_RECUPERADO;
  const isFurtoVeiculo = formData.type === IncidentType.FURTO_VEICULO;
  const isRouboVeiculo = formData.type === IncidentType.ROUBO_VEICULO;
  const isRouboPatrimonial = formData.type === IncidentType.ROUBO_RESIDENCIA || formData.type === IncidentType.ROUBO_COMERCIAL;
  const isOther = formData.type === IncidentType.OUTRO;

  // Identifica se é um tipo "Legado" que possui campos detalhados específicos
  const hasSpecificDetails = isCVLIStyle || isCadaverOrSuicide || isMandado || isDrogas || isWeaponSeizure || isSimulacro || isVeiculoRecuperado || isFurtoVeiculo || isRouboVeiculo || isRouboPatrimonial || isRouboPessoa || isOther;

  const isPersonIncident = isCVLIStyle || isCadaverOrSuicide || isMandado || isRouboPessoa || isOther;

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: new Date(initialData.date).toISOString().slice(0, 16),
        conductedProfiles: initialData.conductedProfiles || (initialData.conductedSex ? [initialData.conductedSex] : []),
        victimCount: initialData.victimCount || (initialData.victim ? initialData.victim.split(',').length : 1)
      });
      if (initialData.victim) {
        const parts = initialData.victim.split(',').map(s => s.trim());
        setVictimCount(parts.length);
        setVictimsList(parts);
        setVictimsInitialized(true);
      }
    }
  }, [initialData]);

  // Check for duplicate incident number
  useEffect(() => {
    if (formData.incidentNumber && !isEditing) {
      const exists = existingIncidents.some(i => i.incidentNumber === formData.incidentNumber);
      setShowDuplicateWarning(exists);
    } else {
      setShowDuplicateWarning(false);
    }
  }, [formData.incidentNumber, existingIncidents, isEditing]);

  // Sincroniza o array de perfis com a quantidade de conduzidos
  useEffect(() => {
    const count = formData.conductedCount || 0;
    const currentProfiles = formData.conductedProfiles || [];

    if (currentProfiles.length !== count) {
      const nextProfiles = [...currentProfiles];
      if (nextProfiles.length < count) {
        for (let i = nextProfiles.length; i < count; i++) {
          nextProfiles.push('Não Informado');
        }
      } else {
        nextProfiles.length = count;
      }
      setFormData(prev => ({ ...prev, conductedProfiles: nextProfiles }));
    }
  }, [formData.conductedCount]);

  // Searchable Incident Type State
  const [typeSearch, setTypeSearch] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeInputRef = useRef<HTMLInputElement>(null);
  const typeContainerRef = useRef<HTMLDivElement>(null);

  // Sync search text with selected type initially or when it changes
  useEffect(() => {
    if (formData.type) {
      setTypeSearch(typeof formData.type === 'string' ? formData.type : '');
    }
  }, [formData.type]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeContainerRef.current && !typeContainerRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileChange = (index: number, value: string) => {
    const nextProfiles = [...(formData.conductedProfiles || [])];
    nextProfiles[index] = value;
    setFormData({ ...formData, conductedProfiles: nextProfiles });
  };

  // State for multiple victims
  const [victimCount, setVictimCount] = useState<number>(1);
  const [victimsList, setVictimsList] = useState<string[]>(['']);
  const [victimsInitialized, setVictimsInitialized] = useState(false);

  // Sync victimsList with victimCount when count changes
  const handleVictimCountChange = (newCount: number) => {
    const safeCount = Math.max(1, newCount);
    setVictimCount(safeCount);
    setVictimsList(prev => {
      const next = [...prev];
      if (next.length < safeCount) {
        while (next.length < safeCount) next.push('');
      } else if (next.length > safeCount) {
        next.length = safeCount;
      }
      return next;
    });
    setFormData(prev => ({ ...prev, victimCount: safeCount }));
  };

  // Update formData.victim when victimsList changes
  useEffect(() => {
    const joined = victimsList.filter(v => v.trim() !== '').join(', ');
    if (joined !== formData.victim) {
      setFormData(prev => ({ ...prev, victim: joined }));
    }
  }, [victimsList]);

  const handleVictimChange = (index: number, value: string) => {
    setVictimsList(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalDescription = formData.description;
    let finalType = formData.type;
    const garrisonText = formData.garrison ? formData.garrison : 'NÃO INFORMADA';

    if (isOther) {
      finalType = formData.customType?.toUpperCase() || 'OUTRA NATUREZA';
      finalDescription = `${finalType}: ${formData.description || ''} | Vítima: ${formData.victim || 'NÃO INFORMADA'} | Guarnição: ${garrisonText}`;
    } else if (isCVLIStyle) {
      const prefix = isCVLI ? 'CVLI' : 'MORTE POR INTERVENÇÃO POLICIAL';
      finalDescription = `${prefix}: ${formData.cvliType || 'NÃO ESPECIFICADO'} | Vítima: ${formData.victim || 'NÃO IDENTIFICADA'} | Guarnição: ${garrisonText}`;
    } else if (isCadaverOrSuicide) {
      finalDescription = `${formData.type}: Vítima: ${formData.victim || 'NÃO IDENTIFICADA'} | Guarnição: ${garrisonText}`;
    } else if (isMandado) {
      finalDescription = `Mandado de Prisão: Conduzido(a): ${formData.victim || 'NÃO IDENTIFICADO(A)'} | Guarnição: ${garrisonText}`;
    } else if (isRouboPessoa) {
      finalDescription = `Roubo à Pessoa: Vítima: ${formData.victim || 'NÃO IDENTIFICADA'} | Guarnição: ${garrisonText}`;
    } else if (isDrogas) {
      finalDescription = `Apreensão de Drogas: ${formData.drugDetails} | Guarnição: ${garrisonText}`;
    } else if (isWeaponSeizure) {
      finalDescription = `Apreensão de Arma de Fogo: ${formData.weaponType} | Qtd Armas: ${formData.weaponCount || 1} | Munição Intacta: ${formData.ammoIntactCount} | Munição Deflagrada: ${formData.ammoDeflagratedCount} | Guarnição: ${garrisonText}`;
    } else if (isSimulacro) {
      finalDescription = `Apreensão de Simulacro de Arma de Fogo | Qtd: ${formData.simulacrumCount || 1} | Guarnição: ${garrisonText}`;
    } else if (isVeiculoRecuperado || isFurtoVeiculo || isRouboVeiculo) {
      const victimPart = (isFurtoVeiculo || isRouboVeiculo) && formData.victim ? ` | Vítima: ${formData.victim}` : '';
      let qtyText = '';
      if (isVeiculoRecuperado) qtyText = ` | Qtd: ${formData.vehicleCount || 1}`;
      if (isFurtoVeiculo) qtyText = ` | Qtd: ${formData.stolenVehicleCount || 1}`;
      if (isRouboVeiculo) qtyText = ` | Qtd: ${formData.robbedVehicleCount || 1}`;
      finalDescription = `${formData.type}: ${formData.vehicleDetails || ''}${victimPart}${qtyText} | Guarnição: ${garrisonText}`;
    } else if (isRouboPatrimonial) {
      finalDescription = `${formData.type}: ${formData.stolenDetails || ''} | Guarnição: ${garrisonText}`;
    }

    onSave({
      ...formData,
      type: finalType,
      id: isEditing ? initialData?.id : Math.random().toString(36).substr(2, 9),
      createdAt: isEditing ? initialData?.createdAt : new Date().toISOString(),
      description: finalDescription || '',
      sigma: formData.sigma || 'N/A',
      garrison: formData.garrison || '',
      conductedSex: formData.conductedProfiles?.[0] || 'Não Informado' // Legado
    });

    if (!isEditing) {
      localStorage.removeItem('pmma_incident_draft');
    }
  };

  const handleCancelClick = () => {
    if (!isEditing) {
      localStorage.removeItem('pmma_incident_draft');
    }
    onCancel();
  };

  return (
    <div className="bg-[#0f172a] rounded-3xl shadow-2xl border-t-8 border-[#ffd700] border-x border-b border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500 relative z-10">
      <div className="bg-[#1e293b]/30 p-8 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            {isEditing ? 'Atualizar Registro' : 'Inclusão de Ocorrência'}
          </h2>
          <p className="text-[#ffd700] font-black text-[10px] mt-1 uppercase tracking-[0.2em]">
            {isEditing ? `BO: ${initialData?.incidentNumber}` : 'POLÍCIA MILITAR DO MARANHÃO'}
          </p>
        </div>
        <button onClick={handleCancelClick} type="button" className="w-10 h-10 rounded-xl bg-slate-800 text-slate-500 hover:bg-red-900/20 hover:text-red-500 transition-all flex items-center justify-center border border-slate-700">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8 bg-[#0f172a]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#ffd700] text-[#002b5c] flex items-center justify-center font-black text-xs">01</span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Natureza do Fato</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Incidente</label>
              <div className="relative" ref={typeContainerRef}>
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10"></i>
                <input
                  type="text"
                  className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black placeholder-slate-600 cursor-pointer"
                  placeholder="Pesquisar natureza..."
                  value={typeSearch}
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  onChange={(e) => {
                    setTypeSearch(e.target.value);
                    setIsTypeDropdownOpen(true);
                  }}
                  ref={typeInputRef}
                />
                {typeSearch && (
                  <i
                    className="fa-solid fa-xmark absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer hover:text-[#ffd700] transition-colors z-20"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setTypeSearch('');
                      setFormData({ ...formData, type: '' });
                      setIsTypeDropdownOpen(true);
                    }}
                  ></i>
                )}

                {isTypeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-[#1e293b] border-2 border-slate-700 rounded-2xl shadow-2xl z-50 scroller-thin animate-in fade-in zoom-in-95 duration-200">
                    {Object.values(IncidentType)
                      .filter(t => t.toLowerCase().includes(typeSearch.toLowerCase()))
                      .map((type) => (
                        <div
                          key={type}
                          className={`px-6 py-3 text-xs sm:text-sm font-bold cursor-pointer transition-colors border-b border-slate-800 last:border-0 ${formData.type === type ? 'bg-[#ffd700] text-[#002b5c]' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setFormData({ ...formData, type: type });
                            setTypeSearch(type);
                            setIsTypeDropdownOpen(false);
                          }}
                        >
                          {type}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {isOther && (
              <div className="space-y-1.5 animate-in slide-in-from-left-2">
                <label className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest ml-1">Especificar Natureza</label>
                <div className="relative">
                  <i className="fa-solid fa-pen-nib absolute left-4 top-3.5 text-slate-500"></i>
                  <input
                    value={formData.customType || ''}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-[#ffd700]/30 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black placeholder-slate-700"
                    placeholder="Digite a natureza..."
                    onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Número Ocorrência</label>
              <div className="relative">
                <i className="fa-solid fa-hashtag absolute left-4 top-3.5 text-slate-500"></i>
                <input
                  value={formData.incidentNumber || ''}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 bg-[#1e293b] outline-none transition-all text-sm text-white font-black placeholder-slate-700 ${showDuplicateWarning ? 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'border-slate-800 focus:border-[#ffd700]'}`}
                  placeholder="BO-00000"
                  onChange={(e) => setFormData({ ...formData, incidentNumber: e.target.value })}
                />
                {showDuplicateWarning && (
                  <div className="absolute top-full left-0 mt-1 flex items-center gap-1.5 text-orange-500 animate-in fade-in slide-in-from-top-1">
                    <i className="fa-solid fa-triangle-exclamation text-[10px]"></i>
                    <span className="text-[9px] font-bold uppercase tracking-tight">Número já cadastrado! (Será gerado sufixo)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Código SIGMA</label>
              <div className="relative">
                <i className="fa-solid fa-fingerprint absolute left-4 top-3.5 text-slate-500"></i>
                <input
                  value={formData.sigma || ''}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black placeholder-slate-700"
                  placeholder="S-0000"
                  onChange={(e) => setFormData({ ...formData, sigma: e.target.value })}
                />
              </div>
            </div>

            <div className="md:col-span-3 flex items-center gap-3 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <input
                type="checkbox"
                id="isTco"
                className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-800 cursor-pointer"
                checked={formData.isTco || false}
                onChange={(e) => setFormData({ ...formData, isTco: e.target.checked })}
              />
              <label htmlFor="isTco" className="text-xs font-black text-blue-400 uppercase tracking-wide cursor-pointer select-none">
                MARCAR OCORRÊNCIA COMO TCO (Termo Circunstanciado)
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#ffd700] text-[#002b5c] flex items-center justify-center font-black text-xs">02</span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Status e Tempo</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
              <select
                className="w-full px-6 py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black appearance-none cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as IncidentStatus })}
              >
                {Object.values(IncidentStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data e Hora</label>
                <div className="flex items-center gap-2 bg-slate-800/50 px-2 py-0.5 rounded-lg border border-slate-700 transition-all hover:bg-slate-800">
                  <input
                    type="checkbox"
                    id="isTimeUndefined"
                    className="w-3 h-3 rounded border-slate-600 text-[#ffd700] focus:ring-[#ffd700] bg-slate-900 cursor-pointer"
                    checked={formData.isTimeUndefined || false}
                    onChange={(e) => setFormData({ ...formData, isTimeUndefined: e.target.checked })}
                  />
                  <label htmlFor="isTimeUndefined" className="text-[8px] font-black text-slate-400 uppercase tracking-wider cursor-pointer select-none">Horário Indefinido</label>
                </div>
              </div>
              <input
                type={formData.isTimeUndefined ? "date" : "datetime-local"}
                style={{ colorScheme: 'dark' }}
                className="w-full px-6 py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black"
                value={formData.isTimeUndefined ? (formData.date?.slice(0, 10)) : (formData.date || '')}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#ffd700] text-[#002b5c] flex items-center justify-center font-black text-xs">03</span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Localização</h3>
          </div>
          <div className="space-y-1.5">
            <input
              value={formData.location?.address || ''}
              className="w-full px-6 py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none transition-all text-sm text-white font-black placeholder-slate-700"
              placeholder="Endereço completo da ocorrência"
              onChange={(e) => setFormData({ ...formData, location: { address: e.target.value } })}
            />
          </div>
        </div>

        {hasSpecificDetails && (
          <div className="space-y-6 bg-slate-800/20 p-4 sm:p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">
              04. Detalhes {isCVLIStyle ? `da ${isCVLI ? 'CVLI' : 'Intervenção'}` : (isVeiculoRecuperado || isFurtoVeiculo || isRouboVeiculo) ? 'do Veículo' : 'da Ocorrência'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isCVLIStyle && (
                <div className="md:col-span-2 space-y-1.5 mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    {isMorteIntervencao ? 'HISTÓRICO DA OCORRÊNCIA' : 'Detalhe da Ocorrência'}
                  </label>
                  <input
                    value={formData.cvliType || ''}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                    placeholder={isCVLI ? "Ex: HOMICÍDIO POR ARMA DE FOGO..." : "Descreva brevemente o histórico..."}
                    onChange={(e) => setFormData({ ...formData, cvliType: e.target.value.toUpperCase() })}
                  />
                </div>
              )}

              {isPersonIncident && (
                <div className="space-y-1.5 mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    {isMandado ? "Nome do Conduzido(a)" : "Vítimas"}
                  </label>

                  {isMandado ? (
                    <input
                      value={formData.victim || ''}
                      className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                      placeholder="Nome do Conduzido(a)"
                      onChange={(e) => setFormData({ ...formData, victim: e.target.value })}
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
                        <label className="text-[9px] font-black text-[#ffd700] uppercase ml-1 whitespace-nowrap">Qtd Vítimas:</label>
                        <input
                          type="number"
                          min="1"
                          value={victimCount}
                          onChange={(e) => handleVictimCountChange(parseInt(e.target.value) || 1)}
                          className="w-20 px-3 py-1.5 rounded-lg border border-slate-600 bg-[#0f172a] text-white text-xs font-black focus:border-[#ffd700] outline-none"
                        />
                      </div>
                      <div className="grid gap-3">
                        {victimsList.map((v, idx) => (
                          <input
                            key={idx}
                            value={v}
                            onChange={(e) => handleVictimChange(idx, e.target.value)}
                            className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700 animate-in fade-in slide-in-from-top-2"
                            placeholder={`Nome da Vítima ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isDrogas && (
                <div className="space-y-1.5 mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Drogas (QTD/Tipo)</label>
                  <input
                    value={formData.drugDetails || ''}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                    placeholder="QTD e Tipo de Drogas"
                    onChange={(e) => setFormData({ ...formData, drugDetails: e.target.value })}
                  />
                </div>
              )}

              {isWeaponSeizure && (
                <>
                  <div className="space-y-1.5 mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Arma</label>
                    <input
                      value={formData.weaponType || ''}
                      className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                      placeholder="Ex: Revólver .38"
                      onChange={(e) => setFormData({ ...formData, weaponType: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 mb-2">
                    <label className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest ml-1">Quantidade de Armas</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black"
                      value={formData.weaponCount || 1}
                      onChange={(e) => setFormData({ ...formData, weaponCount: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </>
              )}

              {isSimulacro && (
                <div className="space-y-1.5 mb-2">
                  <label className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest ml-1">Quantidade de Simulacros</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black"
                    value={formData.simulacrumCount || 1}
                    onChange={(e) => setFormData({ ...formData, simulacrumCount: parseInt(e.target.value) || 1 })}
                  />
                </div>
              )}

              {(isVeiculoRecuperado || isFurtoVeiculo || isRouboVeiculo) && (
                <>
                  <div className="md:col-span-2 space-y-1.5 mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Informações do Veículo</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-bold placeholder-slate-700"
                      placeholder="Descreva marca, modelo, placa, cor e estado do veículo..."
                      value={formData.vehicleDetails || ''}
                      onChange={(e) => setFormData({ ...formData, vehicleDetails: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 mb-2">
                    <label className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest ml-1">Quantidade de Veículos</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black"
                      value={isVeiculoRecuperado ? formData.vehicleCount : (isFurtoVeiculo ? formData.stolenVehicleCount : formData.robbedVehicleCount)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        if (isVeiculoRecuperado) setFormData({ ...formData, vehicleCount: val });
                        else if (isFurtoVeiculo) setFormData({ ...formData, stolenVehicleCount: val });
                        else if (isRouboVeiculo) setFormData({ ...formData, robbedVehicleCount: val });
                      }}
                    />
                  </div>
                </>
              )}

              {isRouboPatrimonial && (
                <div className="md:col-span-2 space-y-1.5 mb-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Relação de Bens e Dinâmica</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-bold placeholder-slate-700"
                    placeholder="Descreva o que foi levado, número de suspeitos..."
                    value={formData.stolenDetails || ''}
                    onChange={(e) => setFormData({ ...formData, stolenDetails: e.target.value })}
                  />
                </div>
              )}

              {!isPersonIncident && !isDrogas && !isWeaponSeizure && !isSimulacro && !isVeiculoRecuperado && !isFurtoVeiculo && !isRouboVeiculo && !isRouboPatrimonial && (
                <div className="md:col-span-2 space-y-6">
                  <textarea
                    rows={4}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-bold placeholder-slate-700"
                    placeholder={isOther ? "Descreva detalhadamente a ocorrência..." : "Descreva o fato..."}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-1.5 mb-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">VTR / Guarnição</label>
                <input
                  value={formData.garrison || ''}
                  className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-800 bg-[#1e293b] focus:border-[#ffd700] outline-none text-sm text-white font-black placeholder-slate-700"
                  placeholder="Ex: VTR 43-100"
                  onChange={(e) => setFormData({ ...formData, garrison: e.target.value })}
                />
              </div>

              {isWeaponSeizure && (
                <>
                  <div className="space-y-1.5 mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Qtd Munição Intacta</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.ammoIntactCount || 0}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-sm outline-none"
                      onChange={(e) => setFormData({ ...formData, ammoIntactCount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1.5 mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Qtd Munição Deflagrada</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.ammoDeflagratedCount || 0}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-sm outline-none"
                      onChange={(e) => setFormData({ ...formData, ammoDeflagratedCount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6 bg-red-900/5 p-4 sm:p-6 rounded-3xl border border-red-900/20">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs">05</span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Produtividade P/3</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5 mb-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantidade de Conduzidos</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-sm outline-none focus:border-[#ffd700]"
                value={formData.conductedCount || 0}
                onChange={(e) => setFormData({ ...formData, conductedCount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5 mb-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Houve Flagrante?</label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-sm outline-none appearance-none cursor-pointer focus:border-[#ffd700]"
                value={formData.hasFlagrante}
                onChange={(e) => setFormData({ ...formData, hasFlagrante: e.target.value })}
              >
                <option value="Não Informado">Não Informado</option>
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
          </div>

          {(formData.conductedCount || 0) > 0 && (
            <div className="mt-6 pt-6 border-t border-red-900/20 animate-in fade-in slide-in-from-top-4">
              <h4 className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest mb-4">Perfil dos Conduzidos ({formData.conductedCount})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(formData.conductedProfiles || []).map((profile, idx) => (
                  <div key={idx} className="space-y-1.5 mb-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Conduzido #{idx + 1}</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] text-white font-black text-xs outline-none appearance-none cursor-pointer focus:border-[#ffd700]"
                      value={profile}
                      onChange={(e) => handleProfileChange(idx, e.target.value)}
                    >
                      <option value="Não Informado">Não Informado</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Menor (Infrator)">Menor (Infrator)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-800">
          <button type="button" onClick={handleCancelClick} className="px-4 sm:px-6 py-3 bg-slate-800 text-slate-400 font-black rounded-xl hover:text-white transition-all text-xs uppercase">Cancelar</button>
          <button type="submit" className="flex-1 px-4 sm:px-6 py-3 bg-[#ffd700] text-[#002b5c] font-black rounded-xl hover:bg-[#ffea00] transition-all text-xs uppercase shadow-lg shadow-[#ffd700]/10">Salvar Registro</button>
        </div>
      </form>
    </div>
  );
};

export default IncidentForm;
