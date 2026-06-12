'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Send, CheckCircle, FileSignature, CreditCard, 
  UserCheck, Image as ImageIcon, AlertTriangle, CheckSquare, 
  Clock, ArrowRight, UserPlus, AlertCircle
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import PageHeader from '../../components/ui/page-header';
import MetricCard from '../../components/ui/metric-card';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import StatusBadge from '../../components/ui/status-badge';

export default function DashboardPage() {
  const mounted = useMounted();
  const { 
    proposals, contracts, charges, onboardings, 
    publications, tasks, historyEvents, clients 
  } = useStore();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Calculate Metrics
  const propostasEnviadas = proposals.filter(p => p.status === 'sent' || p.status === 'viewed').length;
  const propostasAceitas = proposals.filter(p => p.status === 'accepted').length;
  
  const contratosAguardandoAssinatura = contracts.filter(c => c.status === 'pending_signatures').length;
  
  const cobrancasAguardandoPagamento = charges.filter(c => c.status === 'pending').length;
  const cobrancasPagas = charges.filter(c => c.status === 'paid').length;
  
  const clientesEmOnboarding = onboardings.filter(o => o.steps.completed !== 'completed').length;
  
  const publicacoesAguardandoAprovacao = publications.filter(p => p.status === 'pending_approval' || p.status === 'ready_for_approval').length;
  const publicacoesComAlteracao = publications.filter(p => p.status === 'changes_requested').length;
  
  const tarefasPendentes = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress' || t.status === 'in_review').length;
  const tarefasAtrasadas = tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && new Date(t.dueDate) < new Date())).length;

  // Recent History (max 5)
  const recentActivities = historyEvents.slice(0, 5);

  // Near due tasks (max 4)
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Top clients (max 4 active ones)
  const highlightClients = clients
    .filter(c => c.commercialStatus === 'active' || c.commercialStatus === 'onboarding')
    .slice(0, 4);

  // Team productivity mock data
  const teamProductivity = [
    { name: 'Ana Silva', role: 'Operações / Onboarding', completed: 32, total: 40, avatar: 'AS' },
    { name: 'João Santos', role: 'Designer / Social Media', completed: 20, total: 25, avatar: 'JS' },
    { name: 'Maria Souza', role: 'Gestora de Tráfego', completed: 28, total: 30, avatar: 'MS' },
    { name: 'Carlos Santos', role: 'Diretor Comercial', completed: 15, total: 18, avatar: 'CS' }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader 
        title="Dashboard Geral" 
        description="Acompanhamento operacional em tempo real do fluxo de negócios."
      />

      {/* KPI Metrics Categories Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Filtro de Desempenho Operacional</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard 
            title="Propostas Enviadas" 
            value={propostasEnviadas} 
            icon={<Send className="h-4 w-4" />}
            trend={{ value: 'Em análise', type: 'neutral' }}
          />
          <MetricCard 
            title="Propostas Aceitas" 
            value={propostasAceitas} 
            icon={<CheckCircle className="h-4 w-4" />}
            trend={{ value: '+15% mês', type: 'positive' }}
          />
          <MetricCard 
            title="Aguardando Assinatura" 
            value={contratosAguardandoAssinatura} 
            icon={<FileSignature className="h-4 w-4" />}
            trend={{ value: 'ZapSign', type: 'neutral' }}
          />
          <MetricCard 
            title="Cobranças Pendentes" 
            value={cobrancasAguardandoPagamento} 
            icon={<Clock className="h-4 w-4" />}
            trend={{ value: 'Asaas', type: 'neutral' }}
          />
          <MetricCard 
            title="Cobranças Pagas" 
            value={cobrancasPagas} 
            icon={<CreditCard className="h-4 w-4" />}
            trend={{ value: '+8% sem.', type: 'positive' }}
          />
          <MetricCard 
            title="Em Onboarding" 
            value={clientesEmOnboarding} 
            icon={<UserPlus className="h-4 w-4" />}
            trend={{ value: 'Ativos em breve', type: 'neutral' }}
          />
          <MetricCard 
            title="Pubs para Aprovação" 
            value={publicacoesAguardandoAprovacao} 
            icon={<ImageIcon className="h-4 w-4" />}
            trend={{ value: 'Ação requerida', type: 'neutral' }}
          />
          <MetricCard 
            title="Pubs com Alteração" 
            value={publicacoesComAlteracao} 
            icon={<AlertCircle className="h-4 w-4" />}
            trend={{ value: 'Revisar artes', type: 'negative' }}
          />
          <MetricCard 
            title="Tarefas Pendentes" 
            value={tarefasPendentes} 
            icon={<CheckSquare className="h-4 w-4" />}
            trend={{ value: 'Equipe ativa', type: 'neutral' }}
          />
          <MetricCard 
            title="Tarefas Atrasadas" 
            value={tarefasAtrasadas} 
            icon={<AlertTriangle className="h-4 w-4" />}
            trend={{ value: 'Crítico', type: 'negative' }}
          />
        </div>
      </div>

      {/* Main Content Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Activities & Upcoming Tasks) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                Tarefas Próximas do Prazo
              </CardTitle>
              <Link href="/tarefas" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                Ver tudo <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  Nenhuma tarefa pendente no momento! 🎉
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-foreground block truncate">{task.title}</span>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[11px] font-medium text-muted-foreground">{task.clientName}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-[11px] font-medium text-muted-foreground">Resp: {task.responsibleUser}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge type="priority" status={task.priority} />
                        <StatusBadge type="task" status={task.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productivity & Team */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Produtividade da Equipe (Mês Corrente)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamProductivity.map((person) => {
                  const percent = Math.round((person.completed / person.total) * 100);
                  return (
                    <div key={person.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px]">
                            {person.avatar}
                          </div>
                          <div>
                            <span className="text-sm font-semibold block text-foreground leading-none">{person.name}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5 block">{person.role}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {person.completed}/{person.total} ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Recent Activities & Highlight Clients) */}
        <div className="space-y-8">
          
          {/* Highlight Clients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold">
                Clientes em Destaque
              </CardTitle>
              <Link href="/clientes" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                Todos <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {highlightClients.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  Nenhum cliente cadastrado.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {highlightClients.map((client) => (
                    <Link 
                      key={client.id} 
                      href={`/clientes/${client.id}`}
                      className="block p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground block truncate">{client.companyName}</span>
                        <StatusBadge type="client" status={client.commercialStatus} />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Resp: {client.responsibleUser}</span>
                        <span>{client.cnpj}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activities Audit Trail */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Histórico Recente
              </CardTitle>
              <Link href="/historico" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                Ver auditoria <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  Sem atividades registradas.
                </div>
              ) : (
                <div className="relative pl-4 border-l border-border/80 space-y-6">
                  {recentActivities.map((event) => (
                    <div key={event.id} className="relative group">
                      {/* Timeline Bullet */}
                      <span className="absolute -left-6.5 top-1 h-2.5 w-2.5 rounded-full bg-primary border border-card ring-2 ring-primary/20" />
                      
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-foreground block">
                          {event.title}
                        </span>
                        {event.clientName && (
                          <span className="text-[10px] font-medium text-primary block">
                            {event.clientName}
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {event.description}
                        </p>
                        <span className="text-[10px] text-muted-foreground/80 block mt-1">
                          {new Date(event.createdAt).toLocaleTimeString('pt-BR')} em {new Date(event.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
