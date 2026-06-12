'use client';

import React from 'react';
import Link from 'next/link';
import { 
  UserPlus, ExternalLink, Calendar, User, 
  FileSignature, CreditCard, FolderOpen, 
  CheckSquare, ArrowRight, MessageSquare, Play 
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { PageHeader as UIHeader } from '../../components/ui/page-header';
import Button from '../../components/ui/button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import StatusBadge from '../../components/ui/status-badge';
import EmptyState from '../../components/ui/empty-state';

export default function OnboardingPage() {
  const mounted = useMounted();
  const { onboardings } = useStore();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <UIHeader 
        title="Pipeline de Onboarding" 
        description="Acompanhe o andamento da configuração de ferramentas e setups operacionais de novos clientes."
      />

      {/* Onboarding grid */}
      {onboardings.length === 0 ? (
        <Card className="p-12">
          <EmptyState 
            title="Nenhum onboarding pendente" 
            description="Não existem faturamento ou contratações recentes aguardando Onboarding. Ative propostas aceitas para iniciar."
            icon={<UserPlus className="h-6 w-6" />}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {onboardings.map((o) => {
            // Calculate checklist progression count
            const stepsList = [
              o.steps.paymentConfirmed,
              o.steps.driveCreated,
              o.steps.clickupCreated,
              o.steps.tasksCreated,
              o.steps.onboardingMeeting
            ];
            
            const completedCount = stepsList.filter(s => s === 'completed').length;
            const progressPercent = Math.round((completedCount / stepsList.length) * 100);
            const isFullyCompleted = o.steps.completed === 'completed';

            return (
              <Card key={o.id} className={`border ${isFullyCompleted ? 'border-success/30' : 'border-border'}`}>
                <CardHeader className="pb-3 border-b border-border/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold">{o.companyName}</CardTitle>
                      <CardDescription className="text-xs">Contato: {o.clientName}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Resp: {o.responsibleUser}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Início: {new Date(o.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Checklist Progression bar */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-muted-foreground">Progresso do Setup:</span>
                      <span className="font-bold text-foreground">{completedCount} de 5 etapas ({progressPercent}%)</span>
                    </div>
                    
                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFullyCompleted ? 'bg-success' : 'bg-primary'
                        }`} 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Checklist steps summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 p-2 bg-muted/20 border border-border/40 rounded-lg">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${o.steps.paymentConfirmed === 'completed' ? 'bg-success' : 'bg-warning'}`} />
                      <span className="truncate text-muted-foreground">1. Pagamento Asaas</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-muted/20 border border-border/40 rounded-lg">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${o.steps.driveCreated === 'completed' ? 'bg-success' : 'bg-warning'}`} />
                      <span className="truncate text-muted-foreground">2. Google Drive</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-muted/20 border border-border/40 rounded-lg">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${o.steps.clickupCreated === 'completed' ? 'bg-success' : 'bg-warning'}`} />
                      <span className="truncate text-muted-foreground">3. ClickUp &amp; WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-muted/20 border border-border/40 rounded-lg">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${o.steps.tasksCreated === 'completed' ? 'bg-success' : 'bg-warning'}`} />
                      <span className="truncate text-muted-foreground">4. Tarefas Iniciais</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-muted/20 border border-border/40 rounded-lg col-span-2">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${o.steps.onboardingMeeting === 'completed' ? 'bg-success' : 'bg-warning'}`} />
                      <span className="truncate text-muted-foreground">5. Reunião de Alinhamento de Onboarding</span>
                    </div>
                  </div>

                  {/* Operational Links grid */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">Links Operacionais</span>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {o.links.googleDrive ? (
                        <a 
                          href={o.links.googleDrive} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-center text-[10px]"
                        >
                          <FolderOpen className="h-4 w-4 text-amber-500 mb-1" />
                          <span className="font-semibold truncate w-full">Google Drive</span>
                        </a>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-muted/40 opacity-50 text-center text-[10px]">
                          <FolderOpen className="h-4 w-4 text-muted-foreground mb-1" />
                          <span className="font-semibold truncate w-full">Drive Inativo</span>
                        </div>
                      )}

                      {o.links.clickup ? (
                        <a 
                          href={o.links.clickup} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-center text-[10px]"
                        >
                          <CheckSquare className="h-4 w-4 text-violet-500 mb-1" />
                          <span className="font-semibold truncate w-full">ClickUp</span>
                        </a>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-muted/40 opacity-50 text-center text-[10px]">
                          <CheckSquare className="h-4 w-4 text-muted-foreground mb-1" />
                          <span className="font-semibold truncate w-full">ClickUp Inativo</span>
                        </div>
                      )}

                      {o.links.whatsAppGroup ? (
                        <a 
                          href={o.links.whatsAppGroup} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-center text-[10px]"
                        >
                          <MessageSquare className="h-4 w-4 text-success mb-1" />
                          <span className="font-semibold truncate w-full">WhatsApp</span>
                        </a>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-muted/40 opacity-50 text-center text-[10px]">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mb-1" />
                          <span className="font-semibold truncate w-full">Grupo Inativo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/20">
                    <Link href={`/clientes/${o.clientId}`}>
                      <Button variant="outline" size="sm" className="h-8.5 text-xs gap-1">
                        Ver Checklist Completo <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
