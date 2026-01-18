
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient.ts';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import IncidentForm from './components/IncidentForm.tsx';
import IncidentTable from './components/IncidentTable.tsx';
import AIAnalysis from './components/AIAnalysis.tsx';
import IncidentDetail from './components/IncidentDetail.tsx';
import DailySummaryView from './components/DailySummary.tsx';
import Reports from './components/Reports.tsx';
import ConfirmModal from './components/ConfirmModal.tsx';
import Auth from './components/Auth.tsx';
import { Incident, IncidentStatus, DailySummary } from './types.ts';
import { MOCK_INCIDENTS } from './constants.ts';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('pmma_incidents');
    if (saved) return JSON.parse(saved);
    return [...MOCK_INCIDENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>(() => {
    const saved = localStorage.getItem('pmma_daily_summaries');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState<IncidentStatus | null>(null);

  const [viewingIncident, setViewingIncident] = useState<Incident | null>(null);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('pmma_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('pmma_daily_summaries', JSON.stringify(dailySummaries));
  }, [dailySummaries]);

  useEffect(() => {
    if (activeTab !== 'new') {
      setEditingIncident(null);
    }
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  const handleSaveIncident = (incidentData: Partial<Incident>) => {
    const isEditing = !!editingIncident;
    if (isEditing) {
      setIncidents(prev => {
        const updated = prev.map(inc =>
          inc.id === incidentData.id ? { ...inc, ...incidentData } as Incident : inc
        );
        return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
      setEditingIncident(null);
    } else {
      const completeIncident: Incident = {
        ...incidentData,
        reportedBy: 'P/3 - 43° BPM',
        createdAt: new Date().toISOString(),
      } as Incident;
      setIncidents(prev => [completeIncident, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setActiveTab('list');
  };

  const handleSaveDailySummary = (summary: DailySummary) => {
    setDailySummaries(prev => {
      const exists = prev.some(s => s.id === summary.id);
      let updated;
      if (exists) {
        updated = prev.map(s => s.id === summary.id ? summary : s);
      } else {
        updated = [summary, ...prev];
      }
      return updated.sort((a, b) => b.date.localeCompare(a.date));
    });
  };

  const handleDashboardFilterChange = (status: IncidentStatus | null) => {
    setDashboardStatusFilter(prev => prev === status ? null : status);
  };

  const handleStartEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setActiveTab('new');
    setViewingIncident(null);
  };

  const handleStartView = (incident: Incident) => setViewingIncident(incident);

  const handleDeleteRequest = (id: string) => {
    setIncidentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (incidentToDelete) {
      setIncidents(prev => prev.filter(inc => inc.id !== incidentToDelete));
      setShowDeleteModal(false);
      setIncidentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setIncidentToDelete(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setDashboardStatusFilter(null);
  };

  const normalizeText = (text: string | undefined) => text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

  const parseSearchDate = (str: string) => {
    const parts = str.split(/[/-]/);
    if (parts.length < 2) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parts[2] ? (parts[2].length === 2 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10)) : null;
    return { day, month, year };
  };

  const filteredIncidents = useMemo(() => {
    let result = [...incidents];

    if (dashboardStatusFilter) {
      result = result.filter(i => i.status === dashboardStatusFilter);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const searchDate = parseSearchDate(term);

      result = result.filter(i => {
        if (searchDate) {
          const d = new Date(i.date);
          const incDay = d.getUTCDate();
          const incMonth = d.getUTCMonth() + 1;
          const incYear = d.getUTCFullYear();
          const dayMatch = incDay === searchDate.day;
          const monthMatch = incMonth === searchDate.month;
          const yearMatch = searchDate.year ? incYear === searchDate.year : true;
          if (dayMatch && monthMatch && yearMatch) return true;
        }

        const matchText =
          normalizeText(i.incidentNumber).includes(term) ||
          normalizeText(i.sigma).includes(term) ||
          normalizeText(i.location.address).includes(term) ||
          normalizeText(i.type).includes(term) ||
          normalizeText(i.description).includes(term) ||
          normalizeText(i.victim).includes(term) ||
          normalizeText(i.garrison).includes(term) ||
          normalizeText(i.vehicleDetails).includes(term) ||
          normalizeText(i.stolenDetails).includes(term);

        if (matchText) return true;
        const formattedDate = new Date(i.date).toLocaleDateString('pt-BR');
        if (formattedDate.includes(term)) return true;
        return false;
      });
    }

    if (startDate || endDate) {
      result = result.filter(inc => {
        const incDateStr = inc.date.split('T')[0];
        if (startDate && endDate) return incDateStr >= startDate && incDateStr <= endDate;
        if (startDate) return incDateStr >= startDate;
        if (endDate) return incDateStr <= endDate;
        return true;
      });
    }
    return result;
  }, [incidents, searchTerm, startDate, endDate, dashboardStatusFilter]);

  const filteredSummaries = useMemo(() => {
    let result = [...dailySummaries];
    const term = searchTerm.trim().toLowerCase();

    if (term) {
      const searchDate = parseSearchDate(term);
      result = result.filter(sum => {
        if (searchDate) {
          const [y, m, d] = sum.date.split('-').map(Number);
          const dayMatch = d === searchDate.day;
          const monthMatch = m === searchDate.month;
          const yearMatch = searchDate.year ? y === searchDate.year : true;
          if (dayMatch && monthMatch && yearMatch) return true;
        }
        const naturesWithRecords = Object.keys(sum.counts).filter(k => sum.counts[k] > 0);
        const matchContent = naturesWithRecords.some(n => normalizeText(n).includes(term));
        if (matchContent) return true;
        const formattedDate = sum.date.split('-').reverse().join('/');
        if (formattedDate.includes(term)) return true;
        return false;
      });
    }

    if (startDate || endDate) {
      result = result.filter(sum => {
        const sumDateStr = sum.date;
        if (startDate && endDate) return sumDateStr >= startDate && sumDateStr <= endDate;
        if (startDate) return sumDateStr >= startDate;
        if (endDate) return sumDateStr <= endDate;
        return true;
      });
    }
    return result;
  }, [dailySummaries, searchTerm, startDate, endDate]);

  const isSearching = searchTerm.trim() !== '' || startDate !== '' || endDate !== '';

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col lg:flex-row text-slate-200 overflow-x-hidden relative">
      {/* Botão Hambúrguer Mobile */}
      <div className="lg:hidden bg-[#001021] border-b border-red-900/30 p-4 flex justify-between items-center sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ffd700] rounded-lg flex items-center justify-center text-[#001021]">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <span className="font-black text-xs uppercase tracking-widest">43° BPM - P/3</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#ffd700]"
        >
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:z-10
        ${isMobileMenuOpen ? 'translate-x-0 z-[80]' : '-translate-x-full z-10'}
      `}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 min-w-0">
        <Header
          activeTab={activeTab}
          editingIncident={!!editingIncident}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          isSearching={isSearching}
          dashboardStatusFilter={dashboardStatusFilter}
          onClearFilters={handleClearFilters}
        />

        <div className="relative">
          {activeTab === 'dashboard' && (
            <Dashboard
              incidents={incidents}
              filteredIncidents={filteredIncidents}
              summaries={dailySummaries}
              filteredSummaries={filteredSummaries}
              isSearching={isSearching}
              activeFilter={dashboardStatusFilter}
              onFilterChange={handleDashboardFilterChange}
            />
          )}
          {activeTab === 'list' && (
            <IncidentTable
              incidents={filteredIncidents}
              onView={handleStartView}
              onEdit={handleStartEdit}
              onDelete={handleDeleteRequest}
            />
          )}
          {activeTab === 'daily' && <DailySummaryView summaries={filteredSummaries} onSave={handleSaveDailySummary} />}
          {activeTab === 'reports' && <Reports incidents={incidents} dailySummaries={dailySummaries} />}
          {activeTab === 'analysis' && <AIAnalysis incidents={filteredIncidents} />}
          {activeTab === 'new' && (
            <div className="max-w-4xl mx-auto">
              <IncidentForm onSave={handleSaveIncident} onCancel={() => setActiveTab('list')} initialData={editingIncident} />
            </div>
          )}
        </div>
      </main>

      {viewingIncident && <IncidentDetail incident={viewingIncident} onClose={() => setViewingIncident(null)} onEdit={handleStartEdit} />}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="ATENÇÃO: EXCLUSÃO"
        message="O registro será removido permanentemente. Deseja prosseguir?"
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
      />
    </div>
  );
};

export default App;
