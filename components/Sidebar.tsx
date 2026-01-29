
import * as React from 'react';
import { useState, useRef } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, isAdmin }) => {
  const [customBadge, setCustomBadge] = useState<string | null>(() => {
    return localStorage.getItem('pmma_custom_badge');
  });

  const badgeFileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Painel Geral' },
    { id: 'list', icon: 'fa-list-check', label: 'Ocorrências' },
    { id: 'reports', icon: 'fa-file-pdf', label: 'Relatórios' },
    { id: 'new', icon: 'fa-plus-circle', label: 'Registrar Nova' },
    ...(isAdmin ? [{ id: 'admin', icon: 'fa-user-shield', label: 'Administração' }] : []),
  ];

  const handleBadgeClick = () => {
    badgeFileInputRef.current?.click();
  };

  const handleBadgeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCustomBadge(base64);
        localStorage.setItem('pmma_custom_badge', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-64 bg-[#001021] h-full lg:h-screen text-white flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.3)] border-r border-red-900/30 overflow-y-auto custom-scrollbar">
      {/* Red accent top bar */}
      <div className="h-1.5 w-full bg-red-700 shadow-[0_0_10px_rgba(185,28,28,0.5)] flex-shrink-0"></div>

      <div className="pt-6 pb-4 px-4 flex flex-col items-center gap-2 border-b border-white/5 bg-gradient-to-b from-[#001a35] to-[#001021] flex-shrink-0">
        <input
          type="file"
          ref={badgeFileInputRef}
          onChange={handleBadgeFileChange}
          accept="image/*"
          className="hidden"
        />

        <div
          onClick={handleBadgeClick}
          className="w-24 h-28 relative group cursor-pointer flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Clique para alterar a imagem do brasão"
        >
          {customBadge ? (
            <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg border-2 border-[#ffd700] shadow-[0_4px_10px_rgba(0,0,0,0.7)] bg-white">
              <img src={customBadge} alt="Brasão Personalizado" className="w-full h-full object-fill" />
            </div>
          ) : (
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_8px_15px_rgba(0,0,0,0.7)] overflow-visible">
              <defs>
                <clipPath id="shieldClipSidebar">
                  <path d="M10,5 L90,5 L90,85 C90,105 50,120 50,120 C50,120 10,105 10,85 Z" />
                </clipPath>
              </defs>
              <path
                d="M10,5 L90,5 L90,85 C90,105 50,120 50,120 C50,120 10,105 10,85 Z"
                fill="#000"
                stroke="#ffd700"
                strokeWidth="2.5"
              />
              <path d="M11.5,6.5 L88.5,6.5 L88.5,84 C88.5,103 50,118 50,118 C50,118 11.5,103 11.5,84 Z" fill="white" />
              <g clipPath="url(#shieldClipSidebar)">
                <rect x="10" y="5" width="80" height="12" fill="#000080" />
                <rect x="10" y="17" width="80" height="15" fill="#ff0000" />
                <text x="50" y="28" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial Black, Arial, sans-serif">43º BPM</text>
                <line x1="50" y1="32" x2="50" y2="72" stroke="black" strokeWidth="1" />
                <circle cx="31" cy="52" r="13" fill="white" stroke="#ffd700" strokeWidth="1" />
                <circle cx="31" cy="52" r="10" fill="none" stroke="#000080" strokeWidth="1.5" strokeDasharray="1,1" />
                <polygon points="31,45 33.5,50.5 39,50.5 34.5,54 36,59.5 31,56 26,59.5 27.5,54 23,50.5 28.5,50.5" fill="#ffd700" />
                <path d="M68,40 C72,38 78,40 80,44 C82,48 80,54 82,60 C82,66 78,74 72,76 C66,78 62,70 60,64 C58,58 64,42 68,40" fill="#15803d" />
                <g transform="translate(50, 68) scale(0.35)">
                  <path d="M-30,0 L30,25 M30,0 L-30,25" stroke="#8b4513" strokeWidth="8" strokeLinecap="round" />
                  <path d="M-30,0 L30,25 M30,0 L-30,25" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="0" cy="12" r="5" fill="#ffd700" />
                </g>
                <rect x="10" y="75" width="80" height="40" fill="white" />
                <rect x="11.5" y="75" width="28" height="30" fill="#000080" />
                <polygon points="25.5,85 27,89 31,89 28,92 29,96 25.5,94 22,96 23,92 20,89 24,89" fill="white" />
                <rect x="39.5" y="75" width="49" height="3" fill="#ff0000" />
                <rect x="39.5" y="78" width="49" height="3" fill="white" />
                <rect x="39.5" y="81" width="49" height="3" fill="black" />
                <rect x="39.5" y="84" width="49" height="3" fill="white" />
                <rect x="39.5" y="87" width="49" height="3" fill="#ff0000" />
                <rect x="39.5" y="90" width="49" height="3" fill="white" />
                <rect x="39.5" y="93" width="49" height="3" fill="black" />
                <rect x="39.5" y="96" width="49" height="4" fill="#ff0000" />
              </g>
            </svg>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-1">
              <i className="fa-solid fa-camera text-white text-lg"></i>
              <span className="text-[8px] font-black uppercase text-white tracking-widest">Alterar</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-1">
          <h1 className="text-sm font-black text-white tracking-widest uppercase mb-0.5">43º BPM - P/3</h1>
          <p className="text-[8px] font-black text-red-500 uppercase tracking-[0.2em] animate-pulse">Sessão Ativa</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1.5 flex-grow">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] ml-3 mb-3">Menu Principal</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
              ? 'bg-gradient-to-r from-red-700/20 to-red-900/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[0_0_10px_rgba(185,28,28,1)]"></div>
            )}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${activeTab === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-800/50 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'
              }`}>
              <i className={`fa-solid ${item.icon} text-sm`}></i>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === item.id ? 'translate-x-1' : ''
              }`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5 bg-black/20 flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-red-900/20 hover:text-red-500 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] border border-transparent hover:border-red-900/30 group"
        >
          <i className="fa-solid fa-power-off group-hover:scale-110 transition-transform"></i>
          Encerrar Sessão
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
