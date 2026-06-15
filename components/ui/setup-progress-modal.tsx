import React from 'react';
import { useTenantStore } from '../../lib/store';
import { 
  CreditCard, FolderOpen, CheckSquare, ListPlus, 
  CheckCircle2, Loader2, X, ArrowUpRight
} from 'lucide-react';
import Modal from './modal';
import Button from './button';

export function SetupProgressModal() {
  const { 
    activeSetupClientId, 
    activeSetupStep, 
    isSetupDismissed,
    clients, 
    onboardings,
    clearActiveSetup,
    setSetupDismissed
  } = useTenantStore();

  if (!activeSetupClientId || isSetupDismissed) return null;

  const client = clients.find(c => c.id === activeSetupClientId);
  const onboarding = onboardings.find(o => o.clientId === activeSetupClientId);
  
  if (!client) return null;

  const steps = [
    {
      id: 'payment',
      title: 'Confirmando compensação no Asaas',
      desc: 'Simulando recebimento de webhook de pagamento Pix.',
      icon: CreditCard,
      status: activeSetupStep === 'payment' ? 'active' : 'completed'
    },
    {
      id: 'drive',
      title: 'Criando pasta no Google Drive',
      desc: 'Estruturando repositórios de mídia e criativos.',
      icon: FolderOpen,
      status: activeSetupStep === 'payment' ? 'pending' : activeSetupStep === 'drive' ? 'active' : 'completed'
    },
    {
      id: 'clickup',
      title: 'Configurando ClickUp e WhatsApp',
      desc: 'Criando projetos operacionais e grupo de atendimento.',
      icon: CheckSquare,
      status: ['payment', 'drive'].includes(activeSetupStep) ? 'pending' : activeSetupStep === 'clickup' ? 'active' : 'completed'
    },
    {
      id: 'tasks',
      title: 'Gerando tarefas iniciais da equipe',
      desc: 'Criando pautas de onboarding e pauta editorial.',
      icon: ListPlus,
      status: ['payment', 'drive', 'clickup'].includes(activeSetupStep) ? 'pending' : activeSetupStep === 'tasks' ? 'active' : 'completed'
    },
    {
      id: 'completed',
      title: 'Setup Operacional Finalizado!',
      desc: 'Onboarding iniciado com sucesso para o cliente.',
      icon: CheckCircle2,
      status: activeSetupStep === 'completed' ? 'completed' : 'pending'
    }
  ];

  const handleMinimize = () => {
    setSetupDismissed(true);
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleMinimize}
      title="Automação Comercial & Setup Operacional"
      description={`Configurando ambiente operacional para ${client.companyName}. Por favor, aguarde.`}
    >
      <div className="space-y-5 py-3">
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id} 
                className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-300 ${
                  step.status === 'active' 
                    ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/10' 
                    : step.status === 'completed'
                      ? 'bg-success/5 border-success/20 opacity-85'
                      : 'bg-muted/10 border-border/40 opacity-55'
                }`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  step.status === 'active' 
                    ? 'bg-primary/10 text-primary animate-pulse' 
                    : step.status === 'completed'
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step.status === 'active' ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Icon className="h-4.5 w-4.5" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className={`text-xs font-bold block ${
                    step.status === 'active' 
                      ? 'text-primary' 
                      : step.status === 'completed'
                        ? 'text-success-foreground'
                        : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {step.status === 'completed' && (
                  <CheckCircle2 className="h-4.5 w-4.5 text-success shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Links shown dynamically if available */}
        {activeSetupStep === 'completed' && onboarding && (
          <div className="p-3 bg-muted/40 rounded-lg border border-border/60 text-xs space-y-2 animate-in fade-in duration-300">
            <span className="font-semibold text-foreground block">Links Gerados:</span>
            <div className="grid grid-cols-2 gap-2">
              {onboarding.links.googleDrive && (
                <a 
                  href={onboarding.links.googleDrive} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 p-1.5 bg-card border border-border hover:bg-muted transition-colors rounded text-muted-foreground hover:text-foreground"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-amber-500" /> Google Drive <ArrowUpRight className="h-3 w-3 ml-auto" />
                </a>
              )}
              {onboarding.links.clickup && (
                <a 
                  href={onboarding.links.clickup} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 p-1.5 bg-card border border-border hover:bg-muted transition-colors rounded text-muted-foreground hover:text-foreground"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-violet-500" /> ClickUp <ArrowUpRight className="h-3 w-3 ml-auto" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border/20">
          <span className="text-[10px] text-muted-foreground font-medium">
            Status: {activeSetupStep === 'completed' ? 'Setup concluído!' : 'Simulando webhook...'}
          </span>
          <div className="flex gap-2">
            {activeSetupStep !== 'completed' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMinimize}
                className="h-8.5 text-xs font-semibold"
              >
                Rodar em segundo plano
              </Button>
            )}
            {activeSetupStep === 'completed' && (
              <Button 
                size="sm" 
                onClick={clearActiveSetup}
                className="h-8.5 text-xs font-semibold"
              >
                Concluir
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function SetupIndicator() {
  const { 
    activeSetupClientId, 
    activeSetupStep, 
    isSetupDismissed, 
    clients, 
    clearActiveSetup, 
    setSetupDismissed 
  } = useTenantStore();

  // Show if setup is active AND user has dismissed/minimized the main modal
  if (!activeSetupClientId || !isSetupDismissed) return null;

  const client = clients.find(c => c.id === activeSetupClientId);
  if (!client) return null;

  const getStepLabel = () => {
    switch (activeSetupStep) {
      case 'payment': return 'Confirmando pagamento...';
      case 'drive': return 'Criando Google Drive...';
      case 'clickup': return 'Configurando ClickUp & WhatsApp...';
      case 'tasks': return 'Gerando tarefas iniciais...';
      case 'completed': return 'Setup Finalizado!';
      default: return 'Processando automações...';
    }
  };

  const isCompleted = activeSetupStep === 'completed';

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-3.5 rounded-xl border shadow-lg max-w-sm w-full animate-in slide-in-from-bottom duration-300 ${
      isCompleted 
        ? 'bg-success/90 border-success/30 text-success-foreground' 
        : 'bg-card/95 border-border/85 backdrop-blur-md text-foreground'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
          isCompleted ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary animate-pulse'
        }`}>
          {isCompleted ? (
            <CheckCircle2 className="h-4.5 w-4.5" />
          ) : (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold block truncate leading-tight">
            {isCompleted ? 'Setup Concluído!' : 'Setup em Execução'}
          </span>
          <span className={`text-[10px] block mt-0.5 truncate ${isCompleted ? 'text-white/80' : 'text-muted-foreground'}`}>
            {client.companyName}: {getStepLabel()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isCompleted ? (
            <button 
              onClick={clearActiveSetup}
              className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button 
              onClick={() => setSetupDismissed(false)}
              className="text-[10px] font-bold text-primary hover:underline px-1.5 py-0.5 rounded cursor-pointer"
            >
              Abrir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

