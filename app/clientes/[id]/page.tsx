'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, Phone, Mail, User, ShieldAlert, ArrowLeft,
  FileSignature, CreditCard, UserPlus, Image, CheckSquare, 
  History, ExternalLink, Calendar, Plus, RefreshCw, Send, Check, AlertCircle, Save
} from 'lucide-react';
import { useStore } from '../../../lib/store';
import { useMounted } from '../../../hooks/useMounted';
import type { TaskPriority } from '../../../types';
import { PageHeader as UIHeader } from '../../../components/ui/page-header';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import Textarea from '../../../components/ui/textarea';
import Select from '../../../components/ui/select';
import Modal from '../../../components/ui/modal';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import StatusBadge from '../../../components/ui/status-badge';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import EmptyState from '../../../components/ui/empty-state';
import DatePicker from '../../../components/ui/date-picker';

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const mounted = useMounted();
  const clientId = params.id as string;

  const { 
    clients, proposals, contracts, charges, onboardings, 
    publications, tasks, historyEvents, signContractFlow, 
    confirmPaymentFlow, updateOnboardingStep, updateOnboardingLinks,
    updatePublicationStatus, addTask, updateTaskStatus, updateClientStatus, teamMembers
  } = useStore();

  // Selected client
  const client = clients.find(c => c.id === clientId);

  // Onboarding links form state
  const onboarding = onboardings.find(o => o.clientId === clientId);
  const [driveLink, setDriveLink] = useState(onboarding?.links.googleDrive || '');
  const [clickupLink, setClickupLink] = useState(onboarding?.links.clickup || '');
  const [whatsappLink, setWhatsappLink] = useState(onboarding?.links.whatsAppGroup || '');

  // Add Task states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskResp, setTaskResp] = useState('Ana Silva');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  // Publication comment states
  const [pubComment, setPubComment] = useState<Record<string, string>>({});

  // Mock auto filling updated link input states when onboarding state loads
  React.useEffect(() => {
    if (onboarding) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDriveLink(onboarding.links.googleDrive || '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClickupLink(onboarding.links.clickup || '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWhatsappLink(onboarding.links.whatsAppGroup || '');
    }
  }, [onboarding]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <ShieldAlert className="h-12 w-12 mx-auto text-danger mb-4" />
        <h2 className="text-lg font-bold text-foreground">Cliente não encontrado</h2>
        <p className="text-muted-foreground mt-2">O cliente solicitado não existe no sistema.</p>
        <Button onClick={() => router.push('/clientes')} className="mt-4">
          Voltar para Clientes
        </Button>
      </div>
    );
  }

  // Filtered Client-Specific Data
  const clientProposals = proposals.filter(p => p.clientId === clientId);
  const clientContract = contracts.find(c => c.clientId === clientId);
  const clientCharges = charges.filter(c => c.clientId === clientId);
  const clientPublications = publications.filter(p => p.clientId === clientId);
  const clientTasks = tasks.filter(t => t.clientId === clientId);
  const clientHistory = historyEvents.filter(h => h.clientId === clientId);

  // Actions
  const handleSaveOnboardingLinks = (e: React.FormEvent) => {
    e.preventDefault();
    updateOnboardingLinks(clientId, {
      googleDrive: driveLink,
      clickup: clickupLink,
      whatsAppGroup: whatsappLink
    });
    alert('Links salvos e atualizados com sucesso! 📁');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDueDate) return;
    
    addTask({
      title: taskTitle,
      clientId: client.id,
      clientName: client.companyName,
      responsibleUser: taskResp,
      dueDate: taskDueDate,
      status: 'pending',
      priority: taskPriority,
      description: taskDesc
    });

    setTaskTitle('');
    setTaskDueDate('');
    setTaskDesc('');
    setIsTaskModalOpen(false);
  };



  const teamOptions = teamMembers.map(m => ({ value: m.name, label: m.name }));
  const priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <button 
          onClick={() => router.push('/clientes')} 
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Clientes
        </button>
      </div>

      {/* Client Profile Header Summary */}
      <div className="bg-card p-6 rounded-xl border border-border/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-foreground leading-tight">{client.companyName}</h2>
              <StatusBadge type="client" status={client.commercialStatus} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Contato: {client.name}</span>
              <span>•</span>
              <span className="font-mono">CNPJ: {client.cnpj}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-1.5 text-xs text-muted-foreground shrink-0 border-t border-border/20 pt-4 md:border-t-0 md:pt-0">
          <span>Responsável Operacional: <strong className="text-foreground">{client.responsibleUser}</strong></span>
          <span>Criado em: <strong>{new Date(client.createdAt).toLocaleDateString('pt-BR')}</strong></span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados"><Building2 className="h-3.5 w-3.5 mr-1.5" /> Dados da Empresa</TabsTrigger>
          <TabsTrigger value="financeiro"><CreditCard className="h-3.5 w-3.5 mr-1.5" /> Financeiro &amp; Contratos</TabsTrigger>
          <TabsTrigger value="onboarding"><UserPlus className="h-3.5 w-3.5 mr-1.5" /> Onboarding Checklist</TabsTrigger>
          <TabsTrigger value="publicacoes"><Image className="h-3.5 w-3.5 mr-1.5" /> Redes Sociais</TabsTrigger>
          <TabsTrigger value="tarefas"><CheckSquare className="h-3.5 w-3.5 mr-1.5" /> Tarefas ({clientTasks.length})</TabsTrigger>
          <TabsTrigger value="historico"><History className="h-3.5 w-3.5 mr-1.5" /> Histórico</TabsTrigger>
        </TabsList>

        {/* Tab 1: CRM Details */}
        <TabsContent value="dados">
          <Card>
            <CardHeader>
              <CardTitle>Dados Cadastrais Detalhados</CardTitle>
              <CardDescription>Informações recuperadas no cadastro ou por consulta automática do CNPJ.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">Informações de Contato</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-border/10">
                      <span className="text-muted-foreground">Nome do Contato:</span>
                      <span className="font-medium text-foreground">{client.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/10">
                      <span className="text-muted-foreground">E-mail:</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {client.email}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/10">
                      <span className="text-muted-foreground">WhatsApp / Telefone:</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {client.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">Atribuições e Status</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-border/10">
                      <span className="text-muted-foreground">Responsável Operacional:</span>
                      <span className="font-medium text-foreground">{client.responsibleUser}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/10">
                      <span className="text-muted-foreground">Status Comercial:</span>
                      <span><StatusBadge type="client" status={client.commercialStatus} /></span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/10">
                      <span className="text-muted-foreground">Identificador Interno:</span>
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{client.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Notas e Endereço Físico</h3>
                <div className="p-4 bg-muted/40 border border-border rounded-lg text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                  {client.notes || 'Nenhuma observação cadastrada.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Financials & Contracts */}
        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Box (Contracts) */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-bold">Registro de Contrato (ZapSign)</CardTitle>
                    <CardDescription>Contrato formal eletrônico gerado a partir do aceite da proposta.</CardDescription>
                  </div>
                  {clientContract && <StatusBadge type="contract" status={clientContract.status} />}
                </CardHeader>
                <CardContent>
                  {!clientContract ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      <p className="mb-2">Nenhum contrato gerado para este cliente.</p>
                      <span className="text-xs">Para gerar um contrato automático, crie e aprove uma proposta comercial.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-muted/20 border border-border/60 rounded-lg">
                          <span className="text-xs text-muted-foreground block">Tipo de Serviço</span>
                          <strong className="text-foreground text-sm block mt-1">{clientContract.type}</strong>
                        </div>
                        <div className="p-3 bg-muted/20 border border-border/60 rounded-lg">
                          <span className="text-xs text-muted-foreground block">Versão do Documento</span>
                          <strong className="text-foreground text-sm block mt-1">{clientContract.version}</strong>
                        </div>
                        <div className="p-3 bg-muted/20 border border-border/60 rounded-lg">
                          <span className="text-xs text-muted-foreground block">Valor Recorrente Mensal</span>
                          <strong className="text-foreground text-sm block mt-1">R$ {clientContract.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="p-3 bg-muted/20 border border-border/60 rounded-lg">
                          <span className="text-xs text-muted-foreground block">Início das Operações</span>
                          <strong className="text-foreground text-sm block mt-1">{new Date(clientContract.startDate).toLocaleDateString('pt-BR')}</strong>
                        </div>
                      </div>

                      {/* Sign contract mock action */}
                      {clientContract.status === 'pending_signatures' && (
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                          <div className="flex items-start gap-2.5">
                            <FileSignature className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <span className="font-semibold text-foreground block">Simulador de Assinatura Eletrônica (ZapSign)</span>
                              Este contrato aguarda assinaturas. Clique no botão abaixo para simular o aceite digital do cliente final.
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => signContractFlow(clientContract.id)}
                              className="h-8 text-xs font-semibold gap-1.5"
                            >
                              <Check className="h-3.5 w-3.5" /> Assinar Contrato (Simulado)
                            </Button>
                            {clientContract.documentUrl && (
                              <a 
                                href={clientContract.documentUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 hover:underline ml-2"
                              >
                                Link ZapSign <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {clientContract.status === 'signed' && (
                        <div className="p-3 bg-success/5 border border-success/20 rounded-xl flex items-center gap-2 text-xs text-success font-semibold">
                          <Check className="h-4 w-4" /> Contrato Assinado por todos e ativo no ZapSign.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Proposals history */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold">Propostas Comerciais Vinculadas</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {clientProposals.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      Nenhuma proposta elaborada.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição do Serviço</TableHead>
                          <TableHead>Valor Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientProposals.map((prop) => (
                          <TableRow key={prop.id}>
                            <TableCell>
                              <span className="font-medium text-foreground block truncate max-w-xs">{prop.description}</span>
                              <span className="text-[10px] text-muted-foreground">Vencimento: {new Date(prop.validityDate).toLocaleDateString('pt-BR')}</span>
                            </TableCell>
                            <TableCell className="font-semibold text-foreground text-xs">
                              R$ {prop.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell><StatusBadge type="proposal" status={prop.status} /></TableCell>
                            <TableCell className="text-right">
                              <Link href={`/proposta/${prop.id}`} target="_blank">
                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                  Link Público <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Box (Charges/Billing) */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold">Cobranças &amp; Faturamento (Asaas)</CardTitle>
                  <CardDescription>Vencimentos e compensações registradas no integrador financeiro.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {clientCharges.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      Nenhuma cobrança ativa de faturamento.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {clientCharges.map((charge) => (
                        <div 
                          key={charge.id} 
                          className="p-4 rounded-xl border border-border bg-muted/10 space-y-3.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-mono text-muted-foreground">Ref: {charge.id}</span>
                            <StatusBadge type="charge" status={charge.status} />
                          </div>
                          
                          <div className="flex items-baseline justify-between">
                            <span className="text-lg font-bold text-foreground">
                              R$ {charge.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Venc: {new Date(charge.dueDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          {/* Pix mockup simulator */}
                          {charge.status === 'pending' && (
                            <div className="space-y-3 pt-3 border-t border-border/40">
                              <div className="p-3 bg-muted/40 rounded-lg text-[10px] text-muted-foreground font-mono break-all border border-border select-all" title="Clique para copiar">
                                pix-copy-paste-code-mock-hub-power-cobranca-{charge.id}-000000000000
                              </div>
                              
                              <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg text-xs space-y-2">
                                <div className="text-warning font-semibold flex items-center gap-1.5">
                                  <AlertCircle className="h-4 w-4" /> Webhook Asaas Simulator
                                </div>
                                <p className="text-muted-foreground text-[11px] leading-relaxed">
                                  Simule a recepção do webhook do Asaas informando a compensação do Pix do cliente.
                                </p>
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  onClick={() => confirmPaymentFlow(charge.id)}
                                  className="w-full text-xs font-semibold h-8"
                                >
                                  Simular PIX Pago (Compensar)
                                </Button>
                              </div>
                            </div>
                          )}

                          {charge.status === 'paid' && (
                            <div className="pt-2 border-t border-border/20 text-xs text-success font-semibold flex items-center justify-between">
                              <span>Compensado em:</span>
                              <span>{charge.paidAt ? new Date(charge.paidAt).toLocaleDateString('pt-BR') : ''}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Onboarding Pipeline */}
        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle>Etapas de Onboarding Operacional</CardTitle>
              <CardDescription>Fluxo de automações integradas. Algumas etapas são acionadas por eventos (como pagamento).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!onboarding ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  Nenhum onboarding configurado para este cliente.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Pipeline Checklist */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">Checklist de Integrações</h3>
                    
                    <div className="space-y-3">
                      {/* Step 1: Payment */}
                      <div className="p-3.5 rounded-xl border border-border flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            onboarding.steps.paymentConfirmed === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                          }`}>
                            <CreditCard className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold block text-foreground">Compensar Pagamento no Asaas</span>
                            <span className="text-[11px] text-muted-foreground">Gera o gatilho automático de onboarding operacional.</span>
                          </div>
                        </div>
                        <StatusBadge type="onboarding" status={onboarding.steps.paymentConfirmed} />
                      </div>

                      {/* Step 2: Google Drive */}
                      <div className="p-3.5 rounded-xl border border-border flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            onboarding.steps.driveCreated === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                          }`}>
                            <Building2 className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold block text-foreground">Criar Pasta Estruturada no Google Drive</span>
                            <span className="text-[11px] text-muted-foreground">Automação cria repositórios de mídia e criativos.</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {onboarding.links.googleDrive && (
                            <a href={onboarding.links.googleDrive} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                Abrir Pasta <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                          )}
                          <StatusBadge type="onboarding" status={onboarding.steps.driveCreated} />
                        </div>
                      </div>

                      {/* Step 3: ClickUp */}
                      <div className="p-3.5 rounded-xl border border-border flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            onboarding.steps.clickupCreated === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                          }`}>
                            <CheckSquare className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold block text-foreground">Criar Projeto no ClickUp &amp; Grupo no WhatsApp</span>
                            <span className="text-[11px] text-muted-foreground">Automação gera as ferramentas operacionais.</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {onboarding.links.clickup && (
                            <a href={onboarding.links.clickup} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                ClickUp <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                          )}
                          {onboarding.links.whatsAppGroup && (
                            <a href={onboarding.links.whatsAppGroup} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                WhatsApp <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                          )}
                          <StatusBadge type="onboarding" status={onboarding.steps.clickupCreated} />
                        </div>
                      </div>

                      {/* Step 4: Tasks created */}
                      <div className="p-3.5 rounded-xl border border-border flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            onboarding.steps.tasksCreated === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                          }`}>
                            <Plus className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold block text-foreground">Popular Tarefas Operacionais Iniciais</span>
                            <span className="text-[11px] text-muted-foreground">Autopopula o kanban operacional com as tarefas padrão.</span>
                          </div>
                        </div>
                        <StatusBadge type="onboarding" status={onboarding.steps.tasksCreated} />
                      </div>

                      {/* Step 5: Onboarding Meeting */}
                      <div className="p-3.5 rounded-xl border border-border flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            onboarding.steps.onboardingMeeting === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                          }`}>
                            <Calendar className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold block text-foreground">Reunião Oficial de Onboarding</span>
                            <span className="text-[11px] text-muted-foreground">Aline e feche a identidade de conteúdo com o cliente.</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {onboarding.steps.onboardingMeeting === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => updateOnboardingStep(clientId, 'onboardingMeeting', 'completed')}
                              className="h-7 text-xs font-semibold"
                            >
                              Marcar Reunião Realizada
                            </Button>
                          )}
                          <StatusBadge type="onboarding" status={onboarding.steps.onboardingMeeting} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual URLs configurator */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">Configurar Links Operacionais</h3>
                    <form onSubmit={handleSaveOnboardingLinks} className="space-y-4">
                      <Input
                        label="Pasta do Google Drive"
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={driveLink}
                        onChange={(e) => setDriveLink(e.target.value)}
                      />
                      <Input
                        label="Pasta de Projetos do ClickUp"
                        type="url"
                        placeholder="https://app.clickup.com/..."
                        value={clickupLink}
                        onChange={(e) => setClickupLink(e.target.value)}
                      />
                      <Input
                        label="Grupo do WhatsApp"
                        type="url"
                        placeholder="https://chat.whatsapp.com/..."
                        value={whatsappLink}
                        onChange={(e) => setWhatsappLink(e.target.value)}
                      />
                      <Button type="submit" size="sm" className="w-full flex items-center justify-center gap-1.5 h-9">
                        <Save className="h-4 w-4" /> Salvar Links
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Marketing & Publications */}
        <TabsContent value="publicacoes">
          <Card>
            <CardHeader>
              <CardTitle>Painel de Publicações de Redes Sociais</CardTitle>
              <CardDescription>Aprove os criativos, legendas e agendamento de posts deste cliente.</CardDescription>
            </CardHeader>
            <CardContent>
              {clientPublications.length === 0 ? (
                <div className="py-6">
                  <EmptyState 
                    title="Nenhuma publicação cadastrada" 
                    description="As publicações aparecerão aqui conforme forem sendo elaboradas pelo designer no ClickUp."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {clientPublications.map((pub) => (
                    <Card key={pub.id} className="overflow-hidden border border-border flex flex-col justify-between">
                      <div>
                        {/* Image preview */}
                        <div className="relative h-44 bg-muted overflow-hidden shrink-0 border-b border-border/60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={pub.imageUrl} 
                            alt="Criativo preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <StatusBadge type="publication" status={pub.status} />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-3.5">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Agendado para: <strong>{new Date(pub.scheduledDate).toLocaleDateString('pt-BR')}</strong></span>
                            <span>Criado por: {pub.responsibleUser}</span>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-foreground block">Legenda da Publicação:</span>
                            <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/40 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                              {pub.caption}
                            </div>
                          </div>

                          {pub.clientComments && (
                            <div className="p-3 bg-danger/5 border border-danger/20 rounded-lg space-y-1 text-xs">
                              <span className="font-semibold text-danger block flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" /> Ajustes Solicitados pelo Cliente:
                              </span>
                              <p className="text-muted-foreground leading-relaxed italic">
                                &ldquo;{pub.clientComments}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approvals */}
                      <div className="p-4 border-t border-border/40 bg-muted/10">
                        {pub.status === 'pending_approval' || pub.status === 'ready_for_approval' || pub.status === 'sent_to_client' ? (
                          <div className="space-y-3.5">
                            <Textarea
                              placeholder="Escreva observações de ajuste caso vá solicitar alterações..."
                              value={pubComment[pub.id] || ''}
                              onChange={(e) => setPubComment({ ...pubComment, [pub.id]: e.target.value })}
                              rows={2}
                              className="text-xs"
                            />
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1 text-xs h-8.5 gap-1.5"
                                onClick={() => updatePublicationStatus(pub.id, 'approved')}
                              >
                                <Check className="h-3.5 w-3.5" /> Aprovar Criativo
                              </Button>
                              <Button 
                                size="sm" 
                                variant="danger" 
                                className="flex-1 text-xs h-8.5 gap-1.5"
                                onClick={() => {
                                  if (!pubComment[pub.id]) {
                                    alert('Por favor, informe no campo de texto o ajuste a ser feito.');
                                    return;
                                  }
                                  updatePublicationStatus(pub.id, 'changes_requested', pubComment[pub.id]);
                                  setPubComment({ ...pubComment, [pub.id]: '' });
                                }}
                              >
                                <AlertCircle className="h-3.5 w-3.5" /> Solicitar Ajuste
                              </Button>
                            </div>
                          </div>
                        ) : pub.status === 'approved' ? (
                          <div className="text-xs text-success font-semibold flex items-center gap-1.5 justify-center py-1 bg-success/5 border border-success/15 rounded-lg">
                            <Check className="h-4 w-4" /> Esta publicação está aprovada e pronta para postagem!
                          </div>
                        ) : pub.status === 'changes_requested' ? (
                          <div className="text-xs text-danger font-semibold flex items-center gap-1.5 justify-center py-1 bg-danger/5 border border-danger/15 rounded-lg">
                            <AlertCircle className="h-4 w-4" /> Aguardando ajustes no ClickUp pelo designer.
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground text-center py-1.5">
                            Status: <strong className="text-foreground uppercase">{pub.status}</strong>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Client-Specific Tasks */}
        <TabsContent value="tarefas" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Tarefas do Cliente</CardTitle>
                <CardDescription>Fluxo de tarefas criadas pela equipe ou geradas automaticamente.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsTaskModalOpen(true)} className="flex items-center gap-1 h-9">
                <Plus className="h-4 w-4" /> Nova Tarefa
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {clientTasks.length === 0 ? (
                <div className="p-12">
                  <EmptyState 
                    title="Nenhuma tarefa vinculada" 
                    description="Não existem tarefas registradas para este cliente."
                    actionLabel="Criar Tarefa"
                    onAction={() => setIsTaskModalOpen(true)}
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título da Tarefa</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div className="font-semibold text-foreground">{task.title}</div>
                          {task.description && <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>}
                        </TableCell>
                        <TableCell className="text-xs text-foreground font-medium">{task.responsibleUser}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell><StatusBadge type="priority" status={task.priority} /></TableCell>
                        <TableCell><StatusBadge type="task" status={task.status} /></TableCell>
                        <TableCell className="text-right">
                          {task.status !== 'completed' ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                              className="h-8 text-xs gap-1 border-success/35 hover:bg-success/5 text-success-foreground hover:text-success-foreground"
                            >
                              <Check className="h-3.5 w-3.5 text-success" /> Concluir
                            </Button>
                          ) : (
                            <span className="text-xs font-semibold text-success flex items-center gap-1 justify-end">
                              <Check className="h-3.5 w-3.5" /> Concluída
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Audit History events specific to client */}
        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Histórico e Trilha de Eventos</CardTitle>
              <CardDescription>Todas as automações e atualizações disparadas para este cliente.</CardDescription>
            </CardHeader>
            <CardContent>
              {clientHistory.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  Sem eventos registrados.
                </div>
              ) : (
                <div className="relative pl-6 border-l border-border/80 space-y-6">
                  {clientHistory.map((event) => (
                    <div key={event.id} className="relative group">
                      <span className="absolute -left-8.5 top-1 h-3 w-3 rounded-full bg-primary border border-card ring-2 ring-primary/20" />
                      
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-foreground block">
                          {event.title}
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {event.description}
                        </p>
                        <span className="text-[10px] text-muted-foreground/80 block mt-1.5">
                          {new Date(event.createdAt).toLocaleTimeString('pt-BR')} em {new Date(event.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Creation Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Cadastrar Tarefa Operacional"
        description="Associe uma nova tarefa para a equipe executar para este cliente."
      >
        <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
          <Input
            label="Título da Tarefa"
            type="text"
            placeholder="Ex: Definir paleta de cores inicial"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Responsável na Equipe"
              options={teamOptions}
              value={taskResp}
              onChange={(e) => setTaskResp(e.target.value)}
            />
            <DatePicker
              label="Data Limite (Prazo)"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              required
            />
          </div>

          <Select
            label="Nível de Prioridade"
            options={priorityOptions}
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
          />

          <Textarea
            label="Instruções / Descrição"
            placeholder="Mapeie o que precisa ser feito..."
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
            <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Tarefa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
