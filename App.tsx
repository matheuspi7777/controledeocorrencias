
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

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchInitialData();
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Use background refresh if we already have data
        fetchInitialData(incidents.length === 0 && dailySummaries.length === 0);
      } else {
        setIncidents([]);
        setDailySummaries([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInitialData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .order('date', { ascending: false });

      if (incidentsError) throw incidentsError;

      // Map Supabase snake_case to camelCase
      const mappedIncidents: Incident[] = (incidentsData || []).map(row => ({
        id: row.id,
        type: row.type,
        incidentNumber: row.incident_number,
        sigma: row.sigma,
        description: row.description,
        location: row.location,
        date: row.date,
        status: row.status,
        reportedBy: row.reported_by,
        createdAt: row.created_at,
        weaponType: row.weapon_type,
        weaponCount: row.weapon_count,
        ammoIntactCount: row.ammo_intact_count,
        ammoDeflagratedCount: row.ammo_deflagrated_count,
        garrison: row.garrison,
        victim: row.victim,
        cvliType: row.cvli_type,
        drugDetails: row.drug_details,
        conductedCount: row.conducted_count,
        conductedSex: row.conducted_sex,
        conductedProfiles: row.conducted_profiles,
        hasFlagrante: row.has_flagrante,
        photo: row.photo,
        vehicleDetails: row.vehicle_details,
        stolenDetails: row.stolen_details,
        customType: row.custom_type
      }));

      setIncidents(mappedIncidents);

      const { data: summariesData, error: summariesError } = await supabase
        .from('daily_summaries')
        .select('*')
        .order('date', { ascending: false });

      if (summariesError) throw summariesError;

      const mappedSummaries: DailySummary[] = (summariesData || []).map(row => ({
        id: row.id,
        date: row.date,
        counts: row.counts,
        conduzidos: row.conduzidos,
        entries: row.entries,
        reportedBy: row.reported_by,
        createdAt: row.created_at
      }));

      setDailySummaries(mappedSummaries);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState<IncidentStatus | null>(null);

  const [viewingIncident, setViewingIncident] = useState<Incident | null>(null);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'incident' | 'summary' } | null>(null);


  useEffect(() => {
    if (activeTab !== 'new') {
      setEditingIncident(null);
    }
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  const handleSaveIncident = async (incidentData: Partial<Incident>) => {
    const isEditing = !!editingIncident;
    try {
      const payload = {
        type: incidentData.type,
        incident_number: incidentData.incidentNumber,
        sigma: incidentData.sigma,
        description: incidentData.description,
        location: incidentData.location,
        date: incidentData.date,
        status: incidentData.status,
        reported_by: incidentData.reportedBy || (isEditing ? editingIncident?.reportedBy : 'P/3 - 43° BPM'),
        weapon_type: incidentData.weaponType,
        weapon_count: incidentData.weaponCount,
        ammo_intact_count: incidentData.ammoIntactCount,
        ammo_deflagrated_count: incidentData.ammoDeflagratedCount,
        garrison: incidentData.garrison,
        victim: incidentData.victim,
        cvli_type: incidentData.cvliType,
        drug_details: incidentData.drugDetails,
        conducted_count: incidentData.conductedCount,
        conducted_sex: incidentData.conductedSex,
        conducted_profiles: incidentData.conductedProfiles,
        has_flagrante: incidentData.hasFlagrante,
        photo: incidentData.photo,
        vehicle_details: incidentData.vehicleDetails,
        stolen_details: incidentData.stolenDetails,
        custom_type: incidentData.customType,
        user_id: session?.user.id
      };

      if (isEditing) {
        const { error } = await supabase
          .from('incidents')
          .update(payload)
          .eq('id', incidentData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('incidents')
          .insert([payload]);

        if (error) throw error;
      }

      await fetchInitialData();
      setEditingIncident(null);
      setSearchTerm('');
      setStartDate('');
      setEndDate('');
      setActiveTab('list');
    } catch (err) {
      console.error('Error saving incident:', err);
      alert('Erro ao salvar ocorrência no banco de dados.');
    }
  };

  const handleSaveDailySummary = async (summary: DailySummary) => {
    try {
      const payload = {
        date: summary.date,
        counts: summary.counts,
        conduzidos: summary.conduzidos,
        entries: summary.entries,
        reported_by: summary.reportedBy || 'P/3 - 43° BPM',
        user_id: session?.user.id
      };

      const exists = !!summary.id && typeof summary.id === 'string' && summary.id.length > 20; // Check if it's a real UUID

      if (exists) {
        const { error } = await supabase
          .from('daily_summaries')
          .update(payload)
          .eq('id', summary.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_summaries')
          .insert([payload]);

        if (error) throw error;
      }

      await fetchInitialData();
    } catch (err) {
      console.error('Error saving summary:', err);
      alert('Erro ao salvar resumo no banco de dados.');
    }
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
    setItemToDelete({ id, type: 'incident' });
    setShowDeleteModal(true);
  };

  const handleDeleteSummaryRequest = (id: string) => {
    setItemToDelete({ id, type: 'summary' });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        if (itemToDelete.type === 'incident') {
          const { error } = await supabase
            .from('incidents')
            .delete()
            .eq('id', itemToDelete.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('daily_summaries')
            .delete()
            .eq('id', itemToDelete.id);
          if (error) throw error;
        }
        await fetchInitialData();
        setShowDeleteModal(false);
        setItemToDelete(null);
      } catch (err) {
        console.error('Error deleting:', err);
        alert('Erro ao excluir registro no banco de dados.');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-[#ffd700] text-xl font-black animate-pulse flex flex-col items-center gap-4">
          <i className="fa-solid fa-shield-halved text-4xl"></i>
          Sincronizando Dados...
        </div>
      </div>
    );
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
          {activeTab === 'daily' && (
            <DailySummaryView
              summaries={filteredSummaries}
              onSave={handleSaveDailySummary}
              onDelete={handleDeleteSummaryRequest}
            />
          )}
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
