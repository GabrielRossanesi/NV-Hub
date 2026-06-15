'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Users, DollarSign, ShieldAlert, Sparkles, 
  Activity, Calendar, Settings, Play, Lock, 
  Unlock, Send, CheckCircle2, UserX, UserCheck, Target
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { UserRole } from '../../types';
import { PageHeader as UIHeader } from '../../components/ui/page-header';
import Button from '../../components/ui/button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import Modal from '../../components/ui/modal';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';

export default function EmpresasAdminPage() {
  const mounted = useMounted();
  const router = useRouter();
  
  const { 
    organizations, 
    clients, 
    proposals, 
    tasks, 
    teamMembers, 
    historyEvents,
    integrations,
    leads,
    upgradePlan,
    updateOrganizationStatus,
    updateTeamMemberRole,
    updateTeamMemberStatus,
    setCurrentOrganizationId 
  } = useStore();

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'usuarios' | 'clientes' | 'historico' | 'leads'>('usuarios');
  const [modalFeedbackMsg, setModalFeedbackMsg] = useState<string | null>(null);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Aggregate stats
  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter(o => o.status === 'active').length;
  const trialOrgs = organizations.filter(o => o.status === 'trial').length;
  const suspendedOrgs = organizations.filter(o => o.status === 'suspended').length;

  const planPrices = { starter: 199, pro: 499, enterprise: 1499 };
  const monthlyRevenue = organizations
    .filter(o => o.status === 'active')
    .reduce((acc, org) => acc + planPrices[org.planId], 0);

  const totalUsers = teamMembers.length;
  const totalClients = clients.length;
  const totalProposals = proposals.length;

  const selectedOrg = organizations.find(o => o.id === selectedOrgId);

  // Helper for plan limits
  const getOrgLimits = (planId: 'starter' | 'pro' | 'enterprise') => {
    const limits = {
      starter: { clients: 3, users: 2, proposals: 5, tasks: 10 },
      pro: { clients: 30, users: 5, proposals: 50, tasks: 99999 },
      enterprise: { clients: 99999, users: 99999, proposals: 99999, tasks: 99999 }
    };
    return limits[planId];
  };

  const renderProgressBar = (current: number, max: number) => {
    if (max >= 99999) {
      return (
        <div className="space-y-0.5">
          <div className="flex justify-between text-[9px] font-semibold text-muted-foreground">
            <span>{current} / ∞</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-primary/30 h-1 rounded-full" style={{ width: '10%' }} />
          </div>
        </div>
      );
    }
    const pct = Math.min((current / max) * 100, 100);
    const color = pct >= 90 ? 'bg-danger' : pct >= 75 ? 'bg-warning' : 'bg-success';
    return (
      <div className="space-y-0.5">
        <div className="flex justify-between text-[9px] font-semibold text-muted-foreground">
          <span>{current} / {max}</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1">
          <div className={`${color} h-1 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  const handleSimulateAccess = (orgId: string) => {
    setCurrentOrganizationId(orgId);
    router.push('/dashboard');
  };

  const showModalFeedback = (msg: string) => {
    setModalFeedbackMsg(msg);
    setTimeout(() => setModalFeedbackMsg(null), 4500);
  };

  const handleResendInvite = (userName: string, email: string) => {
    showModalFeedback(`Convite enviado com sucesso para ${userName} (${email})!`);
  };

  const handleUpgradePlan = (plan: 'starter' | 'pro' | 'enterprise', orgId: string) => {
    upgradePlan(plan, orgId);
    showModalFeedback(`Plano atualizado com sucesso para ${plan.toUpperCase()}!`);
  };

  const handleUpdateStatus = (orgId: string, status: 'active' | 'suspended' | 'trial') => {
    updateOrganizationStatus(orgId, status);
    const statusText = status === 'active' ? 'Reativada' : status === 'trial' ? 'colocada em Trial' : 'Suspensa';
    showModalFeedback(`Conta da organização foi ${statusText} com sucesso!`);
  };

  return (
    <div className="space-y-6">
      {/* Top operational alert */}
      <div className="p-3.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold rounded-lg flex items-center gap-2.5 shadow-sm">
        <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
        <span>Área administrativa da plataforma — visão do operador GaroFlow.</span>
      </div>

      {/* Page Header */}
      <UIHeader 
        title="Controle de Empresas" 
        description="Visualize métricas agregadas da plataforma SaaS, configure planos de assinantes e simule acessos."
      />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Empresas Cadastradas</span>
              <div className="text-xl font-bold flex items-baseline gap-1.5">
                {totalOrgs}
                <span className="text-[10px] text-muted-foreground font-normal">total</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Status Operacional</span>
              <div className="text-xs font-semibold flex flex-col gap-0.5">
                <span className="text-success flex items-center gap-1">● {activeOrgs} Ativas</span>
                <span className="text-warning flex items-center gap-1">● {trialOrgs} em Trial</span>
                <span className="text-danger flex items-center gap-1">● {suspendedOrgs} Suspended</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Receita Mensal Simulada</span>
              <div className="text-xl font-bold text-success flex items-baseline gap-1.5">
                R$ {monthlyRevenue.toLocaleString('pt-BR')}
                <span className="text-[10px] text-muted-foreground font-normal">/mês</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Recursos Totais</span>
              <div className="text-xs font-semibold flex flex-col gap-0.5 text-muted-foreground">
                <span>Usuários: <strong className="text-foreground">{totalUsers}</strong></span>
                <span>Clientes: <strong className="text-foreground">{totalClients}</strong></span>
                <span>Propostas: <strong className="text-foreground">{totalProposals}</strong></span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Companies Table */}
      <Card>
        <CardHeader className="px-6 py-4 border-b border-border/40">
          <CardTitle className="text-base font-bold">Empresas Assinantes</CardTitle>
          <CardDescription>Lista completa de tenants cadastrados no simulador da GaroFlow.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Plano / Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead>Limites &amp; Uso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => {
                  const orgUsers = teamMembers.filter(m => m.organizationId === org.id).length;
                  const orgClients = clients.filter(c => c.organizationId === org.id).length;
                  const orgProposals = proposals.filter(p => p.organizationId === org.id).length;
                  const orgTasks = tasks.filter(t => t.organizationId === org.id).length;
                  const limits = getOrgLimits(org.planId);

                  return (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="font-bold text-foreground text-sm">{org.name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">ID: {org.id}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {org.cnpj}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {org.planId}
                          </span>
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${
                            org.status === 'active' ? 'text-success' : 
                            org.status === 'trial' ? 'text-warning' : 'text-danger'
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {org.status === 'active' ? 'Ativo' : org.status === 'trial' ? 'Trial' : 'Suspenso'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(org.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <div>
                            <span className="text-[9px] text-muted-foreground block">Membros</span>
                            {renderProgressBar(orgUsers, limits.users)}
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground block">Clientes</span>
                            {renderProgressBar(orgClients, limits.clients)}
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground block">Propostas</span>
                            {renderProgressBar(orgProposals, limits.proposals)}
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground block">Tarefas</span>
                            {renderProgressBar(orgTasks, limits.tasks)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedOrgId(org.id);
                              setActiveTab('usuarios');
                            }}
                          >
                            Ver detalhes
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleSimulateAccess(org.id)}
                          >
                            <Play className="h-3 w-3 fill-current" /> Acessar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selectedOrg && (
        <Modal
          isOpen={!!selectedOrgId}
          onClose={() => setSelectedOrgId(null)}
          title={`Administração: ${selectedOrg.name}`}
          description="Painel do operador GaroFlow para gerenciamento de limites, status e membros do tenant."
          size="xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Organization Admin Controls */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader className="p-4 border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Settings className="h-4 w-4 text-muted-foreground" /> Configurações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block font-medium">CNPJ</span>
                    <span className="font-mono font-semibold text-foreground">{selectedOrg.cnpj}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Data de Cadastro</span>
                    <span className="font-semibold text-foreground">
                      {new Date(selectedOrg.createdAt).toLocaleDateString('pt-BR')} às {new Date(selectedOrg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <hr className="border-border/40" />

                  {/* Plan Control */}
                  <div className="space-y-2">
                    <span className="text-muted-foreground block font-bold uppercase tracking-wider text-[10px]">Alterar Plano (Assinatura)</span>
                    <div className="grid grid-cols-3 gap-1">
                      {(['starter', 'pro', 'enterprise'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleUpgradePlan(p, selectedOrg.id)}
                          className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase border transition-all ${
                            selectedOrg.planId === p 
                              ? 'bg-primary border-primary text-primary-foreground shadow-sm' 
                              : 'bg-background border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Toggle Control */}
                  <div className="space-y-2">
                    <span className="text-muted-foreground block font-bold uppercase tracking-wider text-[10px]">Status do Inquilino</span>
                    <div className="flex gap-2">
                      {selectedOrg.status === 'suspended' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full gap-1.5 border-success text-success hover:bg-success/10"
                          onClick={() => handleUpdateStatus(selectedOrg.id, 'active')}
                        >
                          <Unlock className="h-3.5 w-3.5" /> Reativar Conta
                        </Button>
                      ) : (
                        <Button 
                          variant="danger" 
                          size="sm"
                          className="w-full gap-1.5"
                          onClick={() => handleUpdateStatus(selectedOrg.id, 'suspended')}
                        >
                          <Lock className="h-3.5 w-3.5" /> Suspender Conta
                        </Button>
                      )}
                      {selectedOrg.status !== 'trial' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(selectedOrg.id, 'trial')}
                        >
                          Trial
                        </Button>
                      )}
                    </div>
                  </div>

                  <hr className="border-border/40" />

                  {/* Simulation Command */}
                  <div className="space-y-2">
                    <span className="text-muted-foreground block font-bold uppercase tracking-wider text-[10px]">Simular Login</span>
                    <Button 
                      variant="primary" 
                      className="w-full gap-1.5 justify-center"
                      onClick={() => handleSimulateAccess(selectedOrg.id)}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Ver Painel Operacional
                    </Button>
                    <p className="text-[10px] text-muted-foreground leading-normal mt-1 text-center">
                      Redireciona para o painel com isolamento de dados da {selectedOrg.name}.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Progress limit box */}
              <Card>
                <CardHeader className="p-4 border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-muted-foreground" /> Limites &amp; Uso
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {(() => {
                    const orgUsers = teamMembers.filter(m => m.organizationId === selectedOrg.id).length;
                    const orgClients = clients.filter(c => c.organizationId === selectedOrg.id).length;
                    const orgProposals = proposals.filter(p => p.organizationId === selectedOrg.id).length;
                    const orgTasks = tasks.filter(t => t.organizationId === selectedOrg.id).length;
                    const limits = getOrgLimits(selectedOrg.planId);

                    return (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Membros da Equipe</span>
                          </div>
                          {renderProgressBar(orgUsers, limits.users)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Clientes Gerenciados</span>
                          </div>
                          {renderProgressBar(orgClients, limits.clients)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Propostas Emitidas</span>
                          </div>
                          {renderProgressBar(orgProposals, limits.proposals)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Tarefas Ativas</span>
                          </div>
                          {renderProgressBar(orgTasks, limits.tasks)}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Integrations Status Box */}
              <Card>
                <CardHeader className="p-4 border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Settings className="h-4 w-4 text-muted-foreground" /> Status das Integrações
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {(() => {
                    const orgIntegration = integrations.find(i => i.organizationId === selectedOrg.id);
                    
                    const conectorList = [
                      { name: 'Asaas (Financeiro)', status: orgIntegration?.asaasStatus || 'not_connected', code: 'asaas' },
                      { name: 'ClickUp (Operações)', status: orgIntegration?.clickupStatus || 'not_connected', code: 'clickup' },
                      { name: 'Google Drive (Arquivos)', status: orgIntegration?.googleDriveStatus || 'not_connected', code: 'googleDrive' },
                      { name: 'Google Docs (Relatórios)', status: orgIntegration?.googleDriveStatus || 'not_connected', code: 'googleDocs' },
                      { name: 'ZapSign (Contratos)', status: orgIntegration?.zapsignStatus || 'not_connected', code: 'zapsign' },
                      { name: 'WhatsApp Business', status: orgIntegration?.whatsappStatus || 'not_connected', code: 'whatsapp' },
                      { name: 'Meta Ads (Leads)', status: orgIntegration?.metaAdsStatus || 'not_connected', code: 'metaAds' },
                      { name: 'Google Ads (Leads)', status: orgIntegration?.googleAdsStatus || 'not_connected', code: 'googleAds' },
                    ];

                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'connected': return 'bg-success/10 text-success border-success/20';
                        case 'sandbox': return 'bg-info/10 text-info border-info/20';
                        case 'not_connected': return 'bg-slate-100 dark:bg-slate-800 text-muted-foreground border-border';
                        case 'error': return 'bg-danger/10 text-danger border-danger/20';
                        case 'pending': return 'bg-warning/10 text-warning border-warning/20';
                        default: return 'bg-muted text-muted-foreground border-border';
                      }
                    };

                    const getStatusText = (status: string) => {
                      switch (status) {
                        case 'connected': return 'Conectado';
                        case 'sandbox': return 'Sandbox';
                        case 'not_connected': return 'Inativo';
                        case 'error': return 'Erro';
                        case 'pending': return 'Pendente';
                        default: return 'Inativo';
                      }
                    };

                    return (
                      <div className="space-y-3">
                        {conectorList.map((c, idx) => {
                          const hasConnection = c.status === 'connected' || c.status === 'sandbox';
                          const orgHistory = historyEvents.filter(h => h.organizationId === selectedOrg.id);
                          const lastTestEvent = orgHistory.find(h => 
                            h.description.toLowerCase().includes(c.code.toLowerCase()) || 
                            h.description.toLowerCase().includes(c.name.toLowerCase())
                          );
                          
                          let lastTestLabel = '-';
                          if (lastTestEvent) {
                            lastTestLabel = new Date(lastTestEvent.createdAt).toLocaleDateString('pt-BR');
                          } else if (hasConnection) {
                            lastTestLabel = 'Simulado (OK)';
                          }

                          return (
                            <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-border/10 last:border-0 last:pb-0">
                              <div className="space-y-0.5">
                                <span className="font-semibold text-foreground block">{c.name}</span>
                                <span className="text-[10px] text-muted-foreground block">
                                  Último teste: {lastTestLabel}
                                </span>
                              </div>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(c.status)}`}>
                                {getStatusText(c.status)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Dynamic Sub-tabs for detailed resources */}
            <div className="lg:col-span-2 space-y-4">
              {modalFeedbackMsg && (
                <div className="p-3 bg-success/15 border border-success/20 text-success text-xs font-semibold rounded-lg flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  <span>{modalFeedbackMsg}</span>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'usuarios' | 'clientes' | 'historico' | 'leads')}>
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="usuarios">
                    <Users className="h-3.5 w-3.5 mr-1.5" /> Usuários ({teamMembers.filter(m => m.organizationId === selectedOrg.id).length})
                  </TabsTrigger>
                  <TabsTrigger value="clientes">
                    <Building2 className="h-3.5 w-3.5 mr-1.5" /> Clientes ({clients.filter(c => c.organizationId === selectedOrg.id).length})
                  </TabsTrigger>
                  <TabsTrigger value="leads">
                    <Target className="h-3.5 w-3.5 mr-1.5" /> Leads ({leads.filter(l => l.organizationId === selectedOrg.id).length})
                  </TabsTrigger>
                  <TabsTrigger value="historico">
                    <Activity className="h-3.5 w-3.5 mr-1.5" /> Histórico ({historyEvents.filter(h => h.organizationId === selectedOrg.id).length})
                  </TabsTrigger>
                </TabsList>

                {/* Sub-tab 1: Users */}
                <TabsContent value="usuarios" className="pt-3">
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase bg-muted/20">
                              <th className="p-3">Nome / E-mail</th>
                              <th className="p-3">Papel / Função</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/20 text-xs">
                            {teamMembers
                              .filter(m => m.organizationId === selectedOrg.id)
                              .map((user) => (
                                <tr key={user.id} className="hover:bg-muted/10">
                                  <td className="p-3">
                                    <div className="font-bold text-foreground">{user.name}</div>
                                    <div className="text-[10px] text-muted-foreground">{user.email || 'sem e-mail'}</div>
                                    <div className="text-[9px] text-muted-foreground font-mono mt-0.5">Último acesso: {user.lastAccess || 'nunca'}</div>
                                  </td>
                                  <td className="p-3 space-y-1">
                                    <div className="font-medium text-foreground">{user.role}</div>
                                    <select
                                      value={user.userRole}
                                      onChange={(e) => updateTeamMemberRole(user.id, e.target.value as UserRole)}
                                      className="bg-background border border-border rounded px-1.5 py-0.5 text-[10px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary animate-none"
                                    >
                                      <option value="owner">Owner</option>
                                      <option value="admin">Admin</option>
                                      <option value="member">Member</option>
                                      <option value="viewer">Viewer</option>
                                    </select>
                                  </td>
                                  <td className="p-3">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                      user.status === 'active' ? 'bg-success/10 text-success' :
                                      user.status === 'pending' ? 'bg-warning/10 text-warning' :
                                      'bg-danger/10 text-danger'
                                    }`}>
                                      {user.status === 'active' ? 'Ativo' :
                                       user.status === 'pending' ? 'Pendente' : 'Desativado'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex flex-col gap-1 items-end">
                                      <button
                                        type="button"
                                        onClick={() => updateTeamMemberStatus(user.id, user.status === 'disabled' ? 'active' : 'disabled')}
                                        className={`text-[10px] font-bold flex items-center gap-0.5 ${
                                          user.status === 'disabled' ? 'text-success hover:underline' : 'text-danger hover:underline'
                                        }`}
                                      >
                                        {user.status === 'disabled' ? (
                                          <><UserCheck className="h-3 w-3" /> Ativar</>
                                        ) : (
                                          <><UserX className="h-3 w-3" /> Desativar</>
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleResendInvite(user.name, user.email || '')}
                                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                      >
                                        <Send className="h-3 w-3" /> Reenviar convite
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sub-tab 2: Clients */}
                <TabsContent value="clientes" className="pt-3">
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase bg-muted/20">
                              <th className="p-3">Cliente / Contato</th>
                              <th className="p-3">CNPJ</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/20 text-xs">
                            {clients
                              .filter(c => c.organizationId === selectedOrg.id)
                              .map((client) => (
                                <tr key={client.id} className="hover:bg-muted/10">
                                  <td className="p-3">
                                    <div className="font-bold text-foreground">{client.companyName}</div>
                                    <div className="text-[10px] text-muted-foreground">{client.name} &bull; {client.email}</div>
                                  </td>
                                  <td className="p-3 font-mono text-xs text-muted-foreground">
                                    {client.cnpj}
                                  </td>
                                  <td className="p-3">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                      client.commercialStatus === 'active' ? 'bg-success/10 text-success' :
                                      client.commercialStatus === 'onboarding' ? 'bg-info/10 text-info' :
                                      client.commercialStatus === 'lead' ? 'bg-warning/10 text-warning' :
                                      'bg-danger/10 text-danger'
                                    }`}>
                                      {client.commercialStatus === 'active' ? 'Ativo' :
                                       client.commercialStatus === 'onboarding' ? 'Onboarding' :
                                       client.commercialStatus === 'lead' ? 'Lead' : 'Inativo'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            {clients.filter(c => c.organizationId === selectedOrg.id).length === 0 && (
                              <tr>
                                <td colSpan={3} className="p-6 text-center text-muted-foreground">
                                  Nenhum cliente cadastrado nesta organização.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sub-tab 4: Leads Summary */}
                <TabsContent value="leads" className="pt-3">
                  <Card>
                    <CardHeader className="p-4 border-b border-border/40 bg-muted/20">
                      <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-primary" /> Resumo Operacional de Leads
                      </CardTitle>
                      <CardDescription>
                        Métricas gerais e principais origens de aquisição. Dados pessoais ocultados por privacidade.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                      {(() => {
                        const orgLeads = leads.filter(l => l.organizationId === selectedOrg.id);
                        const totalLeads = orgLeads.length;
                        const newLeads = orgLeads.filter(l => l.status === 'new').length;
                        const convertedLeads = orgLeads.filter(l => l.status === 'converted').length;
                        const hotLeads = orgLeads.filter(l => l.temperature === 'hot').length;
                        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

                        // Get origin counts
                        const originCounts: Record<string, number> = {};
                        orgLeads.forEach(l => {
                          originCounts[l.origin] = (originCounts[l.origin] || 0) + 1;
                        });
                        const mainOrigins = Object.entries(originCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([origin, count]) => ({ origin, count }));

                        return (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              <div className="p-3 bg-muted/30 border border-border/20 rounded-lg text-center">
                                <span className="text-[10px] text-muted-foreground font-medium block">Total de Leads</span>
                                <strong className="text-lg font-bold text-foreground block mt-1">{totalLeads}</strong>
                              </div>
                              <div className="p-3 bg-muted/30 border border-border/20 rounded-lg text-center">
                                <span className="text-[10px] text-muted-foreground font-medium block">Novos Leads</span>
                                <strong className="text-lg font-bold text-info block mt-1">{newLeads}</strong>
                              </div>
                              <div className="p-3 bg-muted/30 border border-border/20 rounded-lg text-center">
                                <span className="text-[10px] text-muted-foreground font-medium block">Leads Convertidos</span>
                                <strong className="text-lg font-bold text-success block mt-1">{convertedLeads}</strong>
                              </div>
                              <div className="p-3 bg-muted/30 border border-border/20 rounded-lg text-center">
                                <span className="text-[10px] text-muted-foreground font-medium block">Leads Quentes</span>
                                <strong className="text-lg font-bold text-danger block mt-1">{hotLeads}</strong>
                              </div>
                              <div className="p-3 bg-muted/30 border border-border/20 rounded-lg text-center col-span-2 sm:col-span-2">
                                <span className="text-[10px] text-muted-foreground font-medium block">Taxa de Conversão</span>
                                <strong className="text-lg font-bold text-success block mt-1">
                                  {conversionRate.toFixed(1)}%
                                </strong>
                              </div>
                            </div>

                            <div className="space-y-3 pt-2">
                              <h4 className="text-xs font-bold text-foreground">Principais Origens de Entrada</h4>
                              {mainOrigins.length > 0 ? (
                                <div className="space-y-2">
                                  {mainOrigins.map((orig, idx) => {
                                    const pct = totalLeads > 0 ? (orig.count / totalLeads) * 100 : 0;
                                    return (
                                      <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium">
                                          <span className="text-foreground">{orig.origin || 'Desconhecida'}</span>
                                          <span className="text-muted-foreground">{orig.count} ({pct.toFixed(0)}%)</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5">
                                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground text-center py-4 bg-muted/10 rounded-lg border border-dashed border-border">
                                  Nenhuma origem registrada para esta empresa.
                                </p>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sub-tab 3: History */}
                <TabsContent value="historico" className="pt-3">
                  <Card>
                    <CardContent className="p-4 space-y-4 max-h-[350px] overflow-y-auto">
                      {historyEvents
                        .filter(h => h.organizationId === selectedOrg.id)
                        .map((event) => (
                          <div key={event.id} className="flex gap-3 text-xs leading-normal">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                              <Calendar className="h-3.5 w-3.5" />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-bold text-foreground">{event.title}</div>
                              <p className="text-muted-foreground text-[11px]">{event.description}</p>
                              {event.clientName && (
                                <span className="inline-block text-[9px] font-semibold bg-muted px-1 py-0.2 rounded text-muted-foreground">
                                  {event.clientName}
                                </span>
                              )}
                              <span className="block text-[9px] text-muted-foreground font-mono">
                                {new Date(event.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        ))}
                      {historyEvents.filter(h => h.organizationId === selectedOrg.id).length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          Nenhum evento registrado nesta organização.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
