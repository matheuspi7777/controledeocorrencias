import * as React from 'react';
import { IncidentStatus } from '../types.ts';

interface HeaderProps {
  activeTab: string;
  editingIncident: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  isSearching: boolean;
  dashboardStatusFilter: IncidentStatus | null;
  onClearFilters: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  editingIncident,
  searchTerm,
  setSearchTerm,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isSearching,
  dashboardStatusFilter,
  onClearFilters
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Painel de Controle';
      case 'list': return 'Gestão de Ocorrências';
      case 'daily': return 'Resumo Operacional';
      case 'reports': return 'Relatórios PDF';
      case 'analysis': return 'Inteligência IA';
      case 'new': return editingIncident ? 'Atualização de Registro' : 'Inclusão de Ocorrência';
      default: return '';
    }
  };

  const showSearchBar = activeTab !== 'new' && activeTab !== 'analysis';

  return (
    <header className="mb-6 lg:mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 lg:gap-6 bg-[#0f172a] p-5 lg:p-6 rounded-3xl shadow-xl border border-slate-800">
      <div className="min-w-max">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-[#002b5c] text-white text-[8px] lg:text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">PMMA</span>
          <span className="bg-[#ffd700] text-[#002b5c] text-[8px] lg:text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">43° BPM - P/3</span>
        </div>
        <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase">
          {getTitle()}
        </h1>
      </div>

      {showSearchBar && (
        <div className="flex flex-col md:flex-row flex-1 max-w-4xl gap-3 items-stretch md:items-center w-full animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="relative flex-[2]">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-500"></i>
            <input
              type="text"
              placeholder="Pesquise B.O, SIGMA, DATA..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-800 bg-[#1e293b] shadow-sm focus:ring-2 focus:ring-[#ffd700] focus:border-[#ffd700] outline-none transition-all text-xs lg:text-sm font-black text-white placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <i
                className="fa-solid fa-xmark absolute right-4 top-3.5 text-slate-500 cursor-pointer hover:text-white transition-colors"
                onClick={() => setSearchTerm('')}
              ></i>
            )}
          </div>
          <div className="flex flex-1 items-center gap-2 bg-[#1e293b] border-2 border-slate-800 rounded-xl px-2 py-1 shadow-sm">
            <div className="relative flex-1 group">
              <i className="fa-solid fa-calendar-day absolute left-3 top-2.5 text-slate-500 text-[10px]"></i>
              <input
                type="date"
                className="w-full pl-8 pr-1 py-2 bg-transparent outline-none text-[10px] lg:text-xs font-black text-white appearance-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); if (!endDate) setEndDate(e.target.value); }}
              />
            </div>
            <div className="h-4 w-[1px] bg-slate-700"></div>
            <div className="relative flex-1 group">
              <i className="fa-solid fa-calendar-check absolute left-3 top-2.5 text-slate-500 text-[10px]"></i>
              <input
                type="date"
                className="w-full pl-8 pr-1 py-2 bg-transparent outline-none text-[10px] lg:text-xs font-black text-white appearance-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          {(isSearching || dashboardStatusFilter) && (
            <button
              onClick={onClearFilters}
              title="Limpar Filtros"
              className="w-11 h-11 bg-red-900/20 text-red-500 rounded-xl shadow-sm flex items-center justify-center hover:bg-red-900/40 transition-colors border-2 border-red-900/50 flex-shrink-0"
            ><i className="fa-solid fa-filter-circle-xmark"></i></button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
