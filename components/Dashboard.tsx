
import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Incident, IncidentType, IncidentStatus } from '../types.ts';

interface DashboardProps {
  incidents: Incident[];
  filteredIncidents: Incident[];
  isSearching: boolean;
  activeFilter: IncidentStatus | null;
  onFilterChange: (status: IncidentStatus | null) => void;
  onCardClick: (term: string) => void;
}

const INCIDENT_COLOR_MAP: Record<string, string> = {
  [IncidentType.CVLI]: '#ef4444',
  [IncidentType.MORTE_INTERVENCAO]: '#991b1b',
  [IncidentType.VEICULO_RECUPERADO]: '#22c55e',
  [IncidentType.ARMA_FOGO]: '#10b981', // Emerald/Green Color
  [IncidentType.DROGAS]: '#a855f7',
  [IncidentType.ROUBO_VEICULO]: '#f97316',
  [IncidentType.FURTO_VEICULO]: '#fbbf24',
  [IncidentType.MANDADO]: '#06b6d4',
  [IncidentType.SIMULACRO]: '#64748b',
  [IncidentType.CADAVER]: '#475569',
  [IncidentType.SUICIDIO]: '#94a3b8',
  [IncidentType.ROUBO_RESIDENCIA]: '#db2777',
  [IncidentType.ROUBO_COMERCIAL]: '#be185d',
  [IncidentType.ROUBO_PESSOA]: '#7c3aed',
  [IncidentType.OUTRO]: '#1e293b',
};

const DEFAULT_PALETTE = ['#002b5c', '#ffd700', '#0ea5e9', '#6366f1', '#ec4899', '#14b8a6', '#8b5cf6'];
const CONDUZIDOS_COLORS = ['#ef4444', '#3b82f6', '#ec4899', '#6366f1', '#f43f5e'];

const Dashboard: React.FC<DashboardProps> = ({
  incidents,
  filteredIncidents,
  isSearching,
  activeFilter,
  onFilterChange,
  onCardClick
}) => {
  const baseIncidents = isSearching ? filteredIncidents : incidents;

  const totalOcorrenciasGeral = baseIncidents.length;
  const totalBO = baseIncidents.filter(i => !i.isTco).length;
  const totalTCO = baseIncidents.filter(i => i.isTco).length;

  const totalCvli = baseIncidents.filter(i => i.type === IncidentType.CVLI).length;
  const totalArmaFogo = baseIncidents.filter(i => i.type === IncidentType.ARMA_FOGO).length;
  const totalSimulacros = baseIncidents.filter(i => i.type === IncidentType.SIMULACRO).length;
  const totalMorteIntervencao = baseIncidents.filter(i => i.type === IncidentType.MORTE_INTERVENCAO).length;

  const totalFlagrantes = baseIncidents.filter(i => i.hasFlagrante === 'Sim').length;
  const totalConduzidos = baseIncidents.reduce((sum, i) => sum + (i.conductedCount || 0), 0);

  // Perfil Conduzidos
  const perfilConduzidosMap = { masculino: 0, feminino: 0, menor: 0 };
  baseIncidents.forEach(inc => {
    const profiles = inc.conductedProfiles || (inc.conductedSex ? [inc.conductedSex] : []);
    profiles.forEach(sex => {
      if (sex === 'Masculino') perfilConduzidosMap.masculino += 1;
      else if (sex === 'Feminino') perfilConduzidosMap.feminino += 1;
      else if (sex === 'Menor (Infrator)') perfilConduzidosMap.menor += 1;
    });
  });

  const conduzidosChartData = [
    { name: 'Masc', value: perfilConduzidosMap.masculino },
    { name: 'Fem', value: perfilConduzidosMap.feminino },
    { name: 'Menor', value: perfilConduzidosMap.menor }
  ].filter(d => d.value > 0);

  // Incidência por Tipo (Pie Chart e Lista Bottom)
  const natureCounts: Record<string, number> = {};
  baseIncidents.forEach(inc => {
    // Usar o incidentNumber type ou algo simples
    const typeLabel = inc.type as string; // IncidentType enum value
    natureCounts[typeLabel] = (natureCounts[typeLabel] || 0) + 1;
  });

  const pieData = Object.entries(natureCounts).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value); // Sort descending

  const detailedNatureData = pieData.filter(d => d.value > 0);

  const stats = [
    {
      label: 'Geral',
      value: totalOcorrenciasGeral,
      icon: 'fa-file-shield',
      color: 'bg-[#ffd700]/10',
      textColor: 'text-[#ffd700]',
      borderColor: 'border-[#ffd700]/20',
      searchTerm: ''
    },
    {
      label: 'Boletim (B.O.)',
      value: totalBO,
      icon: 'fa-file-lines',
      color: 'bg-blue-600/10',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-600/20',
      searchTerm: 'BO'
    },
    {
      label: 'TCO',
      value: totalTCO,
      icon: 'fa-file-signature',
      color: 'bg-purple-600/10',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-600/20',
      searchTerm: 'TCO' // Será? TCO não é tipo, é flag. Mas searchTerm pode ser special.
    },
    {
      label: 'CVLI',
      value: totalCvli,
      icon: 'fa-skull-crossbones',
      color: totalCvli > 0 ? 'bg-red-600/20' : 'bg-slate-900/20',
      textColor: totalCvli > 0 ? 'text-red-500' : 'text-slate-500',
      borderColor: totalCvli > 0 ? 'border-red-600' : 'border-slate-800',
      isCritical: totalCvli > 0,
      searchTerm: 'CVLI'
    },
    {
      label: 'Flagrantes',
      value: totalFlagrantes,
      icon: 'fa-handcuffs',
      color: totalFlagrantes > 0 ? 'bg-orange-600/20' : 'bg-slate-900/20',
      textColor: totalFlagrantes > 0 ? 'text-orange-500' : 'text-slate-500',
      borderColor: totalFlagrantes > 0 ? 'border-orange-600' : 'border-slate-800',
      isCritical: totalFlagrantes > 0,
      searchTerm: 'FLAGRANTE'
    },
    {
      label: 'Arma de Fogo',
      value: totalArmaFogo,
      icon: 'fa-gun',
      color: totalArmaFogo > 0 ? 'bg-emerald-600/20' : 'bg-green-900/10',
      textColor: totalArmaFogo > 0 ? 'text-emerald-500' : 'text-green-500',
      borderColor: totalArmaFogo > 0 ? 'border-emerald-600' : 'border-green-900/20',
      isPositive: totalArmaFogo > 0,
      searchTerm: IncidentType.ARMA_FOGO
    },
    {
      label: 'Simulacros',
      value: totalSimulacros,
      icon: 'fa-person-rifle',
      color: totalSimulacros > 0 ? 'bg-teal-600/20' : 'bg-slate-900/20',
      textColor: totalSimulacros > 0 ? 'text-teal-400' : 'text-slate-500',
      borderColor: totalSimulacros > 0 ? 'border-teal-600' : 'border-slate-800',
      isPositive: totalSimulacros > 0,
      searchTerm: IncidentType.SIMULACRO
    },
    {
      label: 'Conduzidos',
      value: totalConduzidos,
      icon: 'fa-user-lock',
      color: 'bg-slate-900/20',
      textColor: 'text-slate-300',
      borderColor: 'border-slate-800',
      searchTerm: 'CONDUZIDOS'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat: any, idx) => (
          <div
            key={idx}
            onClick={() => { if (stat.searchTerm) onCardClick(stat.searchTerm); }}
            className={`p-4 rounded-3xl shadow-lg border flex flex-col justify-between h-32 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${stat.borderColor} ${stat.color} ${stat.isCritical ? 'shadow-red-600/10' : ''} ${stat.isPositive ? 'shadow-emerald-600/10' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-white border border-white/10 ${stat.isCritical ? 'bg-red-600/20 border-red-600' : ''} ${stat.isPositive ? 'bg-emerald-600/20 border-emerald-600' : ''}`}>
                <i className={`fa-solid ${stat.icon} text-lg ${stat.isCritical ? 'text-red-500' : ''} ${stat.isPositive ? 'text-emerald-500' : ''}`}></i>
              </div>
              <span className={`text-3xl font-black ${stat.textColor}`}>{stat.value}</span>
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${stat.textColor} opacity-90 leading-tight`}>{stat.label}</p>
              <div className={`h-1 w-8 mt-2 rounded-full ${stat.isCritical ? 'bg-red-600 opacity-100' : (stat.isPositive ? 'bg-emerald-600 opacity-100' : 'bg-current opacity-30')}`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0f172a] p-8 rounded-[2rem] shadow-xl border border-slate-800 min-w-0">
          <h3 className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-widest mb-8">
            <span className="w-2 h-6 bg-[#ffd700] rounded-full"></span>
            Incidência de Crimes (P3)
            {(totalCvli > 0 || totalMorteIntervencao > 0) && <span className="ml-auto text-[10px] bg-red-600 text-white px-3 py-1 rounded-full font-black">ALERTAS CRÍTICOS</span>}
          </h3>
          <div className="h-80 w-full relative min-h-[320px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="99%" height={320} debounce={100}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={INCIDENT_COLOR_MAP[entry.name] || DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '900',
                      textTransform: 'uppercase'
                    }}
                    labelStyle={{
                      color: '#ffd700',
                      fontSize: '10px',
                      fontWeight: '900',
                      marginBottom: '4px',
                      textTransform: 'uppercase'
                    }}
                  />
                  <Legend
                    iconType="circle"
                    formatter={(value) => (
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${value === IncidentType.CVLI || value === IncidentType.MORTE_INTERVENCAO ? 'text-red-500' : 'text-slate-400'}`}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 uppercase text-[10px] font-black">Sem registros detalhados</div>
            )}
          </div>
        </div>

        <div className="bg-[#0f172a] p-8 rounded-[2rem] shadow-xl border border-slate-800 min-w-0">
          <h3 className="text-sm font-black text-slate-300 flex items-center gap-3 uppercase tracking-widest mb-8">
            <i className="fa-solid fa-users-viewfinder text-blue-500"></i> Perfil de Conduzidos
          </h3>
          <div className="h-80 w-full relative min-h-[320px]">
            {conduzidosChartData.length > 0 ? (
              <ResponsiveContainer width="99%" height={320} debounce={100}>
                <BarChart data={conduzidosChartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="black" tick={{ fill: '#64748b' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                    itemStyle={{
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '900',
                      textTransform: 'uppercase'
                    }}
                    labelStyle={{
                      color: '#3b82f6',
                      fontSize: '10px',
                      fontWeight: '900',
                      marginBottom: '4px',
                      textTransform: 'uppercase'
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                    {conduzidosChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CONDUZIDOS_COLORS[index % CONDUZIDOS_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 uppercase text-[10px] font-black">Nenhuma condução no período</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a] p-8 rounded-[2rem] shadow-xl border border-slate-800">
        <h3 className="text-sm font-black text-slate-100 flex items-center gap-3 uppercase tracking-widest mb-6">
          <i className="fa-solid fa-list-ol text-[#ffd700]"></i> Detalhamento por Natureza
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {detailedNatureData.length > 0 ? detailedNatureData.map((item, idx) => {
            const isCritical = (item.name as string).includes('CVLI') || (item.name as string).includes('MORTE') || (item.name as string).includes('HOMICÍDIO');
            const isTcoType = false; // Como distinguir visualmente?

            return (
              <div key={idx} className={`p-4 rounded-2xl border flex justify-between items-center transition-all ${isCritical ? 'bg-red-900/40 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-white/5 border-white/5'
                }`}>
                <span className={`text-[10px] font-black uppercase truncate pr-2 ${isCritical ? 'text-red-500' : 'text-slate-400'}`}>
                  {item.name}
                </span>
                <span className={`text-sm font-black ${isCritical ? 'text-red-500' : 'text-[#ffd700]'}`}>
                  {item.value}
                </span>
              </div>
            );
          }) : (
            <div className="col-span-full py-6 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest">
              Nenhuma natureza registrada no período.
            </div>
          )}
          <div className="bg-green-600/10 p-4 rounded-2xl border border-green-500/20 flex justify-between items-center">
            <span className="text-[10px] font-black text-green-400 uppercase">FLAGRANTES (TOTAL)</span>
            <span className="text-sm font-black text-green-400">{totalFlagrantes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
