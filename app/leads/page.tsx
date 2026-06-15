'use client';

import React, { useState } from 'react';
import { 
  Target, Activity, TrendingUp, Plus, Search, Kanban, List, 
  ArrowRight, Phone, Mail, Building2, User, 
  Calendar, Clock, CheckCircle, Settings
} from 'lucide-react';
import { useTenantStore } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { PageHeader as UIHeader } from '../../components/ui/page-header';
import Button from '../../components/ui/button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';

import Input from '../../components/ui/input';
import Badge from '../../components/ui/badge';
import Modal from '../../components/ui/modal';
import { Lead, LeadStatus, LeadTemperature } from '../../types';

export default function LeadsPage() {
  const mounted = useMounted();
  const { 
    currentOrganization,
    teamMembers,
    currentIntegration,
    leads,
    addLead,
    updateLeadStatus,
    updateLeadTemperature,
    assignLead,
    addLeadNote,
    convertLeadToClient,
    createProposalFromLead,
    markLeadAsLost,
    clients
  } = useTenantStore();

  // View state: 'kanban' | 'list' | 'dashboard'
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'dashboard'>('kanban');

  // Search & Filters states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTemperature, setFilterTemperature] = useState<string>('all');
  const [filterResponsible, setFilterResponsible] = useState<string>('all');

  // Lead Detail Modal state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [showLostInput, setShowLostInput] = useState(false);

  // Add Lead Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadMessage, setNewLeadMessage] = useState('');
  const [newLeadOrigin, setNewLeadOrigin] = useState('Site/Formulário');
  const [newLeadPlatform, setNewLeadPlatform] = useState<'google_ads' | 'meta_ads' | 'organic' | 'landing_page' | 'whatsapp'>('landing_page');
  const [newLeadTemperature, setNewLeadTemperature] = useState<LeadTemperature>('warm');
  const [newLeadResponsible, setNewLeadResponsible] = useState(teamMembers[0]?.name || 'Ana Silva');

  // Toast / Feedback states
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [proposalSuccessUrl, setProposalSuccessUrl] = useState<string | null>(null);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Handle lead creation
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadEmail || !newLeadPhone) {
      alert('Por favor, preencha os campos obrigatórios (Nome, E-mail e Telefone).');
      return;
    }

    addLead({
      name: newLeadName,
      companyName: newLeadCompany || undefined,
      email: newLeadEmail,
      phone: newLeadPhone,
      origin: newLeadOrigin,
      platform: newLeadPlatform,
      status: 'new',
      temperature: newLeadTemperature,
      responsibleUser: newLeadResponsible,
      message: newLeadMessage || undefined,
      notes: newLeadMessage ? `Anotação inicial: ${newLeadMessage}` : undefined
    });

    // Reset form
    setNewLeadName('');
    setNewLeadCompany('');
    setNewLeadEmail('');
    setNewLeadPhone('');
    setNewLeadMessage('');
    setIsAddModalOpen(false);
    showFeedback('Novo lead cadastrado com sucesso e inserido no funil!');
  };

  // Handle conversion
  const handleConvertLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Check duplication warning
    const exists = clients.some(c => 
      c.email.toLowerCase() === lead.email.toLowerCase() || 
      c.phone.replace(/\D/g, '') === lead.phone.replace(/\D/g, '')
    );

    if (exists) {
      const confirm = window.confirm(`Atenção: Já existe um cliente cadastrado com o e-mail ou telefone deste lead nesta organização. Deseja associá-lo de qualquer forma?`);
      if (!confirm) return;
    }

    const client = convertLeadToClient(leadId);
    if (client) {
      showFeedback(`Sucesso! Lead ${lead.name} convertido em Cliente: ${client.companyName}.`);
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, status: 'converted' });
      }
    }
  };

  // Handle proposal creation
  const handleCreateProposal = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const isConverted = lead.status === 'converted' || clients.some(c => c.email.toLowerCase() === lead.email.toLowerCase());
    
    if (!isConverted) {
      const confirm = window.confirm(`Para gerar uma proposta, o lead será convertido em Cliente primeiro. Deseja prosseguir?`);
      if (!confirm) return;
    }

    const proposal = createProposalFromLead(leadId);
    if (proposal) {
      showFeedback(`Sucesso! Proposta comercial de R$ 2.500,00 gerada sob status Rascunho para este lead.`);
      setProposalSuccessUrl(`/propostas`);
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, status: 'proposal_requested' });
      }
    }
  };

  // Handle lost status
  const handleMarkAsLost = (leadId: string) => {
    if (!lostReason) {
      alert('Por favor, informe o motivo do descarte.');
      return;
    }
    markLeadAsLost(leadId, lostReason);
    showFeedback('Lead descartado e marcado como perdido.');
    setLostReason('');
    setShowLostInput(false);
    setIsDetailModalOpen(false);
  };

  // Handle note addition
  const handleAddNote = (leadId: string) => {
    if (!noteText.trim()) return;
    addLeadNote(leadId, noteText);
    setNoteText('');
    showFeedback('Anotação adicionada ao lead.');
    const updatedLead = leads.find(l => l.id === leadId);
    if (updatedLead) {
      setSelectedLead(updatedLead);
    }
  };

  // Map origins to platform helper
  const handleOriginChange = (origin: string) => {
    setNewLeadOrigin(origin);
    const platMap: Record<string, typeof newLeadPlatform> = {
      'Google Ads': 'google_ads',
      'Anúncio de Pesquisa': 'google_ads',
      'Meta Ads': 'meta_ads',
      'Instagram Lead Form': 'meta_ads',
      'Facebook Leads': 'meta_ads',
      'WhatsApp': 'whatsapp',
      'WhatsApp Corporativo': 'whatsapp',
      'WhatsApp Contato': 'whatsapp',
      'Site/Formulário': 'landing_page',
      'Formulário do Site': 'landing_page',
      'Orgânico': 'organic',
      'Busca Orgânica': 'organic',
      'Indicação': 'organic',
      'Indicação Comercial': 'organic'
    };
    if (platMap[origin]) {
      setNewLeadPlatform(platMap[origin]);
    }
  };

  // Filter leads dynamically
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      (l.companyName && l.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlatform = filterPlatform === 'all' || l.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    const matchesTemperature = filterTemperature === 'all' || l.temperature === filterTemperature;
    const matchesResponsible = filterResponsible === 'all' || l.responsibleUser === filterResponsible;

    return matchesSearch && matchesPlatform && matchesStatus && matchesTemperature && matchesResponsible;
  });

  // KPI Calculations
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const qualifiedLeadsCount = leads.filter(l => l.status === 'qualified').length;
  const convertedCount = leads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

  // Chart data calculations
  const platformCounts = leads.reduce((acc, l) => {
    acc[l.platform] = (acc[l.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Render helpers
  const getTempColor = (temp: LeadTemperature) => {
    switch (temp) {
      case 'hot': return 'bg-danger/10 text-danger border-danger/20';
      case 'warm': return 'bg-warning/10 text-warning border-warning/20';
      case 'cold': return 'bg-info/10 text-info border-info/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTempLabel = (temp: LeadTemperature) => {
    switch (temp) {
      case 'hot': return 'Quente';
      case 'warm': return 'Morno';
      case 'cold': return 'Frio';
    }
  };

  const getStatusLabelText = (status: LeadStatus) => {
    const map: Record<LeadStatus, string> = {
      new: 'Novo',
      in_progress: 'Em atendimento',
      qualified: 'Qualificado',
      meeting: 'Reunião Marcada',
      proposal_requested: 'Proposta Solicitada',
      converted: 'Convertido',
      lost: 'Perdido'
    };
    return map[status] || status;
  };

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'default';
      case 'in_progress': return 'warning';
      case 'qualified': return 'info';
      case 'meeting': return 'info';
      case 'proposal_requested': return 'warning';
      case 'converted': return 'success';
      case 'lost': return 'danger';
      default: return 'muted';
    }
  };

  const getPlatformLabel = (plat: string) => {
    const map: Record<string, string> = {
      google_ads: 'Google Ads',
      meta_ads: 'Meta Ads',
      whatsapp: 'WhatsApp',
      landing_page: 'Site/Form',
      organic: 'Orgânico'
    };
    return map[plat] || plat;
  };

  // Fontes conectadas helper
  const getIntegrationBadge = (status: string | undefined) => {
    const currentStatus = status || 'not_connected';
    switch (currentStatus) {
      case 'connected':
        return <Badge variant="success">Conectado (Sandbox)</Badge>;
      case 'sandbox':
        return <Badge variant="info">Sandbox Ativo</Badge>;
      case 'not_connected':
        return <Badge variant="muted">Não Conectado</Badge>;
      case 'error':
        return <Badge variant="danger">Erro</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>;
      default:
        return <Badge variant="muted">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedbackMsg && (
        <div className="p-3 bg-success/15 border border-success/20 text-success text-xs font-semibold rounded-lg flex items-center justify-between gap-2 animate-fade-in shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4.5 w-4.5" />
            <span>{feedbackMsg}</span>
          </div>
          {proposalSuccessUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[10px] h-7 px-2"
              onClick={() => {
                setProposalSuccessUrl(null);
                window.location.href = proposalSuccessUrl;
              }}
            >
              Ver Propostas <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Page Header */}
      <UIHeader 
        title="Central de Leads" 
        description="Acompanhe leads capturados de campanhas patrocinadas, formulários do site e WhatsApp operacional até virarem clientes fechados."
        actions={
          <Button 
            variant="primary" 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Novo Lead Manual
          </Button>
        }
      />

      {/* Active Organization Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-muted/40 rounded-lg border border-border/40 gap-2 text-xs">
        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Configurações comerciais ativas: <strong className="text-foreground">{currentOrganization?.name || 'Organização não encontrada'}</strong>
        </span>
        <div className="flex items-center gap-2">
          <Badge variant="info" className="text-[10px] font-bold uppercase tracking-wider">
            Dados Simulados / Sandbox
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">
            ID: {currentOrganization?.id || 'N/A'}
          </span>
        </div>
      </div>

      {/* Leads KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total de Leads</span>
              <div className="text-2xl font-black">{totalLeads}</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Target className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Novos / Qualificados</span>
              <div className="text-xl font-bold flex items-baseline gap-1.5">
                <span className="text-2xl font-black">{newLeadsCount}</span>
                <span className="text-xs text-muted-foreground font-semibold">/ {qualifiedLeadsCount}</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center text-info">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Taxa de Conversão</span>
              <div className="text-2xl font-black text-success">{conversionRate}%</div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Tempo de Resposta</span>
              <div className="text-xl font-black text-foreground">18 <span className="text-xs text-muted-foreground font-bold">min (médio)</span></div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls & Filters Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* View selectors */}
            <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg w-fit">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Kanban className="h-3.5 w-3.5" /> Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="h-3.5 w-3.5" /> Tabela
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'dashboard' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <TrendingUp className="h-3.5 w-3.5" /> Estatísticas
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all text-foreground"
              />
            </div>
          </div>

          {/* Collapsible filters block */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border/40 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Plataforma</span>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="w-full h-8 px-2 rounded-md bg-background border border-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Todas as fontes</option>
                <option value="google_ads">Google Ads</option>
                <option value="meta_ads">Meta Ads</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="landing_page">Site/Formulário</option>
                <option value="organic">Orgânico / Indicação</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Temperatura</span>
              <select
                value={filterTemperature}
                onChange={(e) => setFilterTemperature(e.target.value)}
                className="w-full h-8 px-2 rounded-md bg-background border border-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Todas</option>
                <option value="hot">Quente</option>
                <option value="warm">Morno</option>
                <option value="cold">Frio</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Responsável</span>
              <select
                value={filterResponsible}
                onChange={(e) => setFilterResponsible(e.target.value)}
                className="w-full h-8 px-2 rounded-md bg-background border border-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Todos</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Filtro de Status</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-8 px-2 rounded-md bg-background border border-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Todos os Status</option>
                <option value="new">Novos</option>
                <option value="in_progress">Em atendimento</option>
                <option value="qualified">Qualificados</option>
                <option value="meeting">Reunião marcada</option>
                <option value="proposal_requested">Proposta solicitada</option>
                <option value="converted">Convertidos</option>
                <option value="lost">Perdidos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main View Panel */}

      {/* 1. Kanban View */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-6 lg:px-6">
          <div className="flex gap-4 min-w-[1400px]">
            {([
              { id: 'new', title: 'Novo' },
              { id: 'in_progress', title: 'Em Atendimento' },
              { id: 'qualified', title: 'Qualificado' },
              { id: 'meeting', title: 'Reunião Marcada' },
              { id: 'proposal_requested', title: 'Proposta Solicitada' },
              { id: 'converted', title: 'Convertido' },
              { id: 'lost', title: 'Perdido' }
            ] as { id: LeadStatus, title: string }[]).map((col) => {
              const colLeads = filteredLeads.filter(l => l.status === col.id);
              return (
                <div key={col.id} className="flex-1 min-w-[200px] bg-muted/30 rounded-xl border border-border/40 flex flex-col max-h-[600px]">
                  <div className="p-3 border-b border-border/40 flex justify-between items-center bg-card rounded-t-xl">
                    <span className="text-xs font-bold text-foreground block">{col.title}</span>
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">{colLeads.length}</span>
                  </div>
                  <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                    {colLeads.map((lead) => (
                      <div 
                        key={lead.id} 
                        className="p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-all space-y-2.5 shadow-sm group relative"
                      >
                        <div className="flex justify-between items-start">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getTempColor(lead.temperature)}`}>
                            {getTempLabel(lead.temperature)}
                          </span>
                          <span className="text-[9px] font-semibold text-muted-foreground">
                            {getPlatformLabel(lead.platform)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">{lead.name}</h4>
                          {lead.companyName && (
                            <span className="text-[10px] text-muted-foreground font-medium block flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3" /> {lead.companyName}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-normal space-y-0.5 pt-1.5 border-t border-border/10">
                          <div className="truncate flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" /> {lead.email}</div>
                          <div className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" /> {lead.phone}</div>
                          <div className="text-[9px] font-mono text-muted-foreground/80 mt-1 block">Última ação: {new Date(lead.lastInteraction).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <div className="pt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-[10px] font-bold h-7 justify-center bg-muted/40 hover:bg-primary/10 hover:text-primary border border-border/40"
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            Ver detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                    {colLeads.length === 0 && (
                      <div className="py-8 text-center text-[10px] text-muted-foreground/70 select-none">
                        Sem leads nesta etapa
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. List / Table View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            {/* Desktop Tabela */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase bg-muted/20">
                    <th className="p-3">Lead / Contato</th>
                    <th className="p-3">Origem</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Temperatura</th>
                    <th className="p-3">Responsável</th>
                    <th className="p-3">Entrada / Interação</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-foreground">{lead.name}</div>
                        {lead.companyName && <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5"><Building2 className="h-3 w-3" /> {lead.companyName}</div>}
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{lead.phone} | {lead.email}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-foreground">{lead.origin}</div>
                        <span className="text-[10px] text-muted-foreground font-mono">{getPlatformLabel(lead.platform)}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant={getStatusBadgeVariant(lead.status)}>
                          {getStatusLabelText(lead.status)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 border text-[10px] font-bold ${getTempColor(lead.temperature)}`}>
                          {getTempLabel(lead.temperature)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {lead.responsibleUser}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(lead.createdAt).toLocaleDateString('pt-BR')}</div>
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(lead.lastInteraction).toLocaleDateString('pt-BR')}</div>
                      </td>
                      <td className="p-3 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-[10px] font-semibold"
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground leading-normal">
                        Nenhum lead correspondente aos filtros foi encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Stack */}
            <div className="block md:hidden divide-y divide-border/20 p-2 space-y-3">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-4 bg-muted/10 rounded-lg border border-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{lead.name}</h4>
                      {lead.companyName && <span className="text-xs text-muted-foreground block font-semibold">{lead.companyName}</span>}
                    </div>
                    <Badge variant={getStatusBadgeVariant(lead.status)}>
                      {getStatusLabelText(lead.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/10 py-2">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold">Origem / Canal</span>
                      <span className="font-medium">{lead.origin} ({getPlatformLabel(lead.platform)})</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold">Temperatura</span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.2 border text-[9px] font-bold ${getTempColor(lead.temperature)}`}>
                        {getTempLabel(lead.temperature)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold">Atendimento</span>
                      <span className="font-medium">{lead.phone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold">Responsável</span>
                      <span className="font-medium">{lead.responsibleUser}</span>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs font-bold"
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      Ver detalhes do lead
                    </Button>
                  </div>
                </div>
              ))}
              {filteredLeads.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground leading-normal">
                  Nenhum lead encontrado.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Dashboard/Analytics View */}
      {viewMode === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Platforms SVG Bar Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-bold">Leads por Canal / Plataforma</CardTitle>
              <CardDescription>Quantidade agregada de leads gerados em cada plataforma de origem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const max = Math.max(...Object.values(platformCounts), 1);
                return (
                  <div className="space-y-3.5">
                    {['google_ads', 'meta_ads', 'whatsapp', 'landing_page', 'organic'].map((plat) => {
                      const count = platformCounts[plat] || 0;
                      const pct = (count / max) * 100;
                      return (
                        <div key={plat} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{getPlatformLabel(plat)}</span>
                            <span className="font-bold">{count} leads</span>
                          </div>
                          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-700" 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Leads Quentes e Sem Atendimento */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Qualificação Rápida</CardTitle>
              <CardDescription>Acompanhamento de prioridade imediata.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Hot Leads */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">🔥 Leads Quentes ({leads.filter(l => l.temperature === 'hot' && l.status !== 'converted').length})</span>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                  {leads.filter(l => l.temperature === 'hot' && l.status !== 'converted').map(l => (
                    <div key={l.id} className="flex justify-between items-center p-2 bg-muted/40 rounded border border-border/40">
                      <span className="font-bold truncate max-w-[120px]">{l.name}</span>
                      <span className="text-[9px] text-muted-foreground">{getPlatformLabel(l.platform)}</span>
                    </div>
                  ))}
                  {leads.filter(l => l.temperature === 'hot' && l.status !== 'converted').length === 0 && (
                    <span className="text-muted-foreground block text-[10px] py-2">Sem leads quentes pendentes.</span>
                  )}
                </div>
              </div>

              {/* No contact leads */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">🚨 Sem Atendimento ({leads.filter(l => l.status === 'new').length})</span>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                  {leads.filter(l => l.status === 'new').map(l => (
                    <div key={l.id} className="flex justify-between items-center p-2 bg-muted/40 rounded border border-border/40">
                      <span className="font-bold truncate max-w-[120px]">{l.name}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">{new Date(l.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ))}
                  {leads.filter(l => l.status === 'new').length === 0 && (
                    <span className="text-muted-foreground block text-[10px] py-2">Todos os leads iniciados!</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns lists */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-base font-bold">Desempenho de Campanhas Mockadas</CardTitle>
              <CardDescription>Monitoramento das campanhas vinculadas ao tráfego do tenant.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/40 font-bold text-muted-foreground uppercase bg-muted/20">
                      <th className="p-3">Nome da Campanha</th>
                      <th className="p-3">Mídia / Canal</th>
                      <th className="p-3">Leads Gerados</th>
                      <th className="p-3">Status de Integração</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {leads.filter(l => l.campaign).reduce((acc, l) => {
                      const existing = acc.find(item => item.campaign === l.campaign);
                      if (existing) {
                        existing.count++;
                      } else {
                        acc.push({ campaign: l.campaign!, platform: l.platform, count: 1 });
                      }
                      return acc;
                    }, [] as { campaign: string, platform: string, count: number }[]).map((c) => (
                      <tr key={c.campaign} className="hover:bg-muted/10">
                        <td className="p-3 font-semibold font-mono text-xs">{c.campaign}</td>
                        <td className="p-3">{getPlatformLabel(c.platform)}</td>
                        <td className="p-3 font-bold">{c.count} leads</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-info/10 text-info border border-info/20">
                            Ativa (Automação Webhook)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Seção Fontes Conectadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-1.5">
            <Settings className="h-4.5 w-4.5 text-muted-foreground" /> Status das Fontes de Captura
          </CardTitle>
          <CardDescription>
            Status operacional dos coletores de webhook. Modificável em &quot;Configurações&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-muted/40 rounded-lg border border-border/40 space-y-1.5 flex flex-col justify-between">
            <span className="font-bold text-xs text-foreground block">Meta Ads Leads</span>
            {getIntegrationBadge(currentIntegration?.metaAdsStatus)}
          </div>
          <div className="p-3 bg-muted/40 rounded-lg border border-border/40 space-y-1.5 flex flex-col justify-between">
            <span className="font-bold text-xs text-foreground block">Google Ads Leads</span>
            {getIntegrationBadge(currentIntegration?.googleAdsStatus)}
          </div>
          <div className="p-3 bg-muted/40 rounded-lg border border-border/40 space-y-1.5 flex flex-col justify-between">
            <span className="font-bold text-xs text-foreground block">WhatsApp Business</span>
            {getIntegrationBadge(currentIntegration?.whatsappStatus)}
          </div>
          <div className="p-3 bg-muted/40 rounded-lg border border-border/40 space-y-1.5 flex flex-col justify-between">
            <span className="font-bold text-xs text-foreground block">Formulário do Site</span>
            <Badge variant="success">Conectado (Sandbox)</Badge>
          </div>
        </CardContent>
      </Card>

      {/* LEAD DETAIL MODAL */}
      {selectedLead && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setShowLostInput(false);
            setLostReason('');
          }}
          title={`Detalhes do Lead: ${selectedLead.name}`}
          size="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-normal">
            
            {/* Lead Info block */}
            <div className="md:col-span-2 space-y-4">
              
              {/* Header Info */}
              <div className="p-4 bg-muted/40 rounded-lg border border-border/40 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{selectedLead.name}</h3>
                    {selectedLead.companyName && <span className="font-medium text-muted-foreground flex items-center gap-1 mt-0.5"><Building2 className="h-3.5 w-3.5" /> {selectedLead.companyName}</span>}
                  </div>
                  <Badge variant={getStatusBadgeVariant(selectedLead.status)}>
                    {getStatusLabelText(selectedLead.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-border/20">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-bold uppercase">E-mail</span>
                    <span className="font-medium text-foreground flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {selectedLead.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-bold uppercase">WhatsApp</span>
                    <span className="font-medium text-foreground flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {selectedLead.phone}</span>
                  </div>
                </div>
              </div>

              {/* Trafejo / Rastreio */}
              <Card>
                <CardHeader className="py-2.5 px-4 bg-muted/20 border-b border-border/40">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider">Metadados de Rastreamento de Tráfego</CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[9px] text-muted-foreground block uppercase font-bold">Origem</span>
                    <span className="font-semibold">{selectedLead.origin}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block uppercase font-bold">Plataforma</span>
                    <span className="font-semibold">{getPlatformLabel(selectedLead.platform)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block uppercase font-bold">Campanha</span>
                    <span className="font-mono truncate block font-semibold">{selectedLead.campaign || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block uppercase font-bold">Grupo de Anúncios</span>
                    <span className="font-mono truncate block font-semibold">{selectedLead.adGroup || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block uppercase font-bold">Anúncio (Criativo)</span>
                    <span className="font-mono truncate block font-semibold">{selectedLead.adName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground block uppercase font-bold">Formulário API ID</span>
                    <span className="font-mono truncate block font-semibold">{selectedLead.formName || '-'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Message content */}
              {selectedLead.message && (
                <Card>
                  <CardHeader className="py-2.5 px-4 bg-muted/20 border-b border-border/40">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider">Mensagem Recebida / Resposta Formulário</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="bg-muted/40 p-3 rounded-lg border border-border/40 text-foreground whitespace-pre-wrap font-medium">
                      &quot;{selectedLead.message}&quot;
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Note / Comments History log */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Observações do Atendimento</span>
                <div className="space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Adicionar observações sobre a ligação, reunião ou feedback do lead..."
                    className="w-full h-16 p-2 rounded-lg bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleAddNote(selectedLead.id)}
                      disabled={!noteText.trim()}
                    >
                      Adicionar Anotação
                    </Button>
                  </div>
                </div>

                {selectedLead.notes && (
                  <div className="p-3 bg-muted/20 rounded-lg border border-border/40 leading-relaxed text-muted-foreground font-medium mt-2">
                    {selectedLead.notes}
                  </div>
                )}
              </div>

            </div>

            {/* Actions Column */}
            <div className="space-y-4">
              
              {/* Qualify lead card */}
              <Card>
                <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/40">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider">Qualificar Lead</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Status selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Mudar Status</label>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => {
                        updateLeadStatus(selectedLead.id, e.target.value as LeadStatus);
                        setSelectedLead({ ...selectedLead, status: e.target.value as LeadStatus });
                        showFeedback('Status do lead updated!');
                      }}
                      className="w-full h-8 px-2 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-medium"
                    >
                      <option value="new">Novo</option>
                      <option value="in_progress">Em atendimento</option>
                      <option value="qualified">Qualificado</option>
                      <option value="meeting">Reunião marcada</option>
                      <option value="proposal_requested">Proposta solicitada</option>
                      <option value="converted">Convertido</option>
                      <option value="lost">Perdido</option>
                    </select>
                  </div>

                  {/* Temp selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Temperatura</label>
                    <select
                      value={selectedLead.temperature}
                      onChange={(e) => {
                        updateLeadTemperature(selectedLead.id, e.target.value as LeadTemperature);
                        setSelectedLead({ ...selectedLead, temperature: e.target.value as LeadTemperature });
                        showFeedback('Temperatura do lead updated!');
                      }}
                      className="w-full h-8 px-2 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-medium"
                    >
                      <option value="cold">Frio</option>
                      <option value="warm">Morno</option>
                      <option value="hot">Quente</option>
                    </select>
                  </div>

                  {/* Responsible User select */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Responsável</label>
                    <select
                      value={selectedLead.responsibleUser}
                      onChange={(e) => {
                        assignLead(selectedLead.id, e.target.value);
                        setSelectedLead({ ...selectedLead, responsibleUser: e.target.value });
                        showFeedback('Responsável alterado com sucesso!');
                      }}
                      className="w-full h-8 px-2 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-medium"
                    >
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Conversions Flows */}
              <div className="space-y-2">
                {selectedLead.status !== 'converted' && selectedLead.status !== 'lost' && (
                  <Button 
                    variant="secondary" 
                    className="w-full justify-center h-10 font-bold bg-success text-success-foreground hover:bg-success/95 border-none shadow-sm"
                    onClick={() => handleConvertLead(selectedLead.id)}
                  >
                    Converter em Cliente
                  </Button>
                )}

                {selectedLead.status !== 'lost' && (
                  <Button 
                    variant="primary" 
                    className="w-full justify-center h-10 font-bold"
                    onClick={() => handleCreateProposal(selectedLead.id)}
                  >
                    Gerar Proposta
                  </Button>
                )}

                {/* Lost button */}
                {selectedLead.status !== 'lost' && !showLostInput && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-center h-10 font-bold text-danger border-danger/20 hover:bg-danger/5 hover:border-danger/40"
                    onClick={() => setShowLostInput(true)}
                  >
                    Marcar como Perdido
                  </Button>
                )}

                {showLostInput && (
                  <div className="p-3 bg-danger/5 border border-danger/10 rounded-lg space-y-2 animate-fade-in">
                    <span className="text-[10px] font-bold text-danger block uppercase">Motivo do Descarte</span>
                    <input
                      type="text"
                      placeholder="Ex: Preço alto, Sem orçamento..."
                      value={lostReason}
                      onChange={(e) => setLostReason(e.target.value)}
                      className="w-full h-8 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:border-danger"
                    />
                    <div className="flex gap-1.5 justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => setShowLostInput(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        className="h-7 text-xs font-bold"
                        onClick={() => handleMarkAsLost(selectedLead.id)}
                        disabled={!lostReason}
                      >
                        Confirmar Perda
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </Modal>
      )}

      {/* ADD LEAD MANUAL MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Novo Lead Manual"
        size="md"
      >
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs leading-normal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Lead *"
              placeholder="Ex: Carlos Santos"
              value={newLeadName}
              onChange={(e) => setNewLeadName(e.target.value)}
            />
            <Input
              label="Nome da Empresa (Opcional)"
              placeholder="Ex: Santos Engenharia"
              value={newLeadCompany}
              onChange={(e) => setNewLeadCompany(e.target.value)}
            />
            <Input
              label="E-mail de Contato *"
              type="email"
              placeholder="Ex: carlos@santoseng.com"
              value={newLeadEmail}
              onChange={(e) => setNewLeadEmail(e.target.value)}
            />
            <Input
              label="Telefone / WhatsApp *"
              placeholder="Ex: (11) 98888-7777"
              value={newLeadPhone}
              onChange={(e) => setNewLeadPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Origem</label>
              <select
                value={newLeadOrigin}
                onChange={(e) => handleOriginChange(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Formulário do Site">Formulário do Site</option>
                <option value="WhatsApp Contato">WhatsApp Contato</option>
                <option value="Google Ads Pesquisa">Google Ads Pesquisa</option>
                <option value="Facebook Leads">Facebook Leads</option>
                <option value="Indicação Comercial">Indicação Comercial</option>
                <option value="Busca Orgânica">Busca Orgânica</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Temperatura</label>
              <select
                value={newLeadTemperature}
                onChange={(e) => setNewLeadTemperature(e.target.value as LeadTemperature)}
                className="w-full h-9 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="cold">Frio</option>
                <option value="warm">Morno</option>
                <option value="hot">Quente</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Responsável</label>
              <select
                value={newLeadResponsible}
                onChange={(e) => setNewLeadResponsible(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {teamMembers.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Mensagem de Interesse / Anotação inicial</label>
            <textarea
              placeholder="Descreva o interesse do lead ou observações iniciais da ligação..."
              value={newLeadMessage}
              onChange={(e) => setNewLeadMessage(e.target.value)}
              className="w-full h-20 p-2 rounded-lg bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit"
            >
              Confirmar Cadastro
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
