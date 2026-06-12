import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Client, ClientStatus,
  Proposal, ProposalStatus, ProposalItem,
  Contract, ContractStatus,
  Charge, ChargeStatus,
  Onboarding, OnboardingStepStatus,
  Publication, PublicationStatus,
  TeamTask, TaskStatus, TaskPriority,
  HistoryEvent, TeamMember
} from '../types';

interface SystemState {
  clients: Client[];
  proposals: Proposal[];
  contracts: Contract[];
  charges: Charge[];
  onboardings: Onboarding[];
  publications: Publication[];
  tasks: TeamTask[];
  historyEvents: HistoryEvent[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  
  // Actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClientStatus: (id: string, status: ClientStatus) => void;
  
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'status'>) => Proposal;
  updateProposalStatus: (id: string, status: ProposalStatus) => void;
  acceptProposalFlow: (id: string) => void; // Trigger acceptance, which auto-generates contract
  declineProposalFlow: (id: string) => void;
  
  addContract: (contract: Omit<Contract, 'id' | 'createdAt'>) => Contract;
  updateContractStatus: (id: string, status: ContractStatus) => void;
  signContractFlow: (id: string) => void; // Trigger signature, which auto-generates charge
  
  addCharge: (charge: Omit<Charge, 'id' | 'createdAt'>) => Charge;
  updateChargeStatus: (id: string, status: ChargeStatus) => void;
  confirmPaymentFlow: (id: string) => void; // Trigger payment, which starts onboarding
  
  updateOnboardingStep: (clientId: string, stepName: keyof Onboarding['steps'], status: OnboardingStepStatus) => void;
  updateOnboardingLinks: (clientId: string, links: Partial<Onboarding['links']>) => void;
  
  addPublication: (pub: Omit<Publication, 'id' | 'createdAt'>) => Publication;
  updatePublicationStatus: (id: string, status: PublicationStatus, comments?: string) => void;
  
  addTask: (task: Omit<TeamTask, 'id' | 'createdAt'>) => TeamTask;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  
  addHistoryEvent: (event: Omit<HistoryEvent, 'id' | 'createdAt'>) => void;
  
  // CNPJ Mock API Simulator
  simulateCnpjSearch: (cnpj: string) => {
    companyName: string;
    tradeName: string;
    address: string;
    city: string;
    state: string;
    status: string;
    activity: string;
  } | null;

  resetState: () => void;
}

const initialTeamMembers: TeamMember[] = [
  { id: '1', name: 'Ana Silva', role: 'Gestora de Contas / Onboarding', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: '2', name: 'João Santos', role: 'Social Media & Designer', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { id: '3', name: 'Maria Souza', role: 'Gestora de Tráfego Pago', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
  { id: '4', name: 'Carlos Santos', role: 'Diretor Comercial', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' }
];

const initialClients: Client[] = [
  {
    id: 'c1',
    name: 'Roberto Souza',
    companyName: 'Power Energy Ltda',
    cnpj: '12.345.678/0001-90',
    phone: '(11) 98888-7777',
    email: 'roberto@powerenergy.com.br',
    responsibleUser: 'Maria Souza',
    commercialStatus: 'active',
    notes: 'Cliente focado em energia renovável. Exige relatórios semanais de tráfego.',
    createdAt: '2026-05-10T10:00:00Z'
  },
  {
    id: 'c2',
    name: 'Carolina Lima',
    companyName: 'Ponto de Encontro Café',
    cnpj: '98.765.432/0001-10',
    phone: '(21) 97777-6666',
    email: 'carolina@pontoencontro.com.br',
    responsibleUser: 'Ana Silva',
    commercialStatus: 'onboarding',
    notes: 'Onboarding iniciado. Necessita de criação de grupo de WhatsApp e ClickUp rápido.',
    createdAt: '2026-06-01T14:30:00Z'
  },
  {
    id: 'c3',
    name: 'Gabriel Faria',
    companyName: 'Alfa Tech Consultoria',
    cnpj: '55.444.333/0001-22',
    phone: '(31) 96666-5555',
    email: 'gabriel@alfatech.com',
    responsibleUser: 'Carlos Santos',
    commercialStatus: 'lead',
    notes: 'Proposta comercial enviada. Avaliando escopo de tráfego e posts de LinkedIn.',
    createdAt: '2026-06-05T09:15:00Z'
  }
];

const initialProposals: Proposal[] = [
  {
    id: 'p1',
    clientId: 'c3',
    clientName: 'Gabriel Faria',
    companyName: 'Alfa Tech Consultoria',
    description: 'Gestão Completa de Tráfego Pago e Copywriting para LinkedIn',
    items: [
      { id: 'pi1', description: 'Setup inicial de contas de anúncios (Google/Meta)', value: 1500.0, isMonthly: false },
      { id: 'pi2', description: 'Gestão de Tráfego Pago mensal (Meta Ads & Google Ads)', value: 2500.0, isMonthly: true },
      { id: 'pi3', description: 'Criação de 8 posts mensais para LinkedIn com criativos', value: 1000.0, isMonthly: true }
    ],
    totalValue: 5000.0,
    monthlyValue: 3500.0,
    validityDate: '2026-07-05',
    paymentTerms: 'Boleto bancário via Asaas. Setup à vista, mensalidades com vencimento todo dia 10.',
    notes: 'Validade de 30 dias a partir da data de emissão.',
    status: 'sent',
    createdAt: '2026-06-05T10:00:00Z'
  },
  {
    id: 'p2',
    clientId: 'c2',
    clientName: 'Carolina Lima',
    companyName: 'Ponto de Encontro Café',
    description: 'Marketing Digital e Gestão de Redes Sociais Integrada',
    items: [
      { id: 'pi4', description: 'Gestão de Redes Sociais (Instagram/Facebook) - 12 posts', value: 2000.0, isMonthly: true },
      { id: 'pi5', description: 'Tráfego Pago local para atração de clientes ao café', value: 1500.0, isMonthly: true }
    ],
    totalValue: 3500.0,
    monthlyValue: 3500.0,
    validityDate: '2026-06-15',
    paymentTerms: 'Cartão de crédito ou PIX via Asaas recorrente.',
    notes: 'Proposta negociada em reunião inicial.',
    status: 'accepted',
    createdAt: '2026-06-01T15:00:00Z'
  }
];

const initialContracts: Contract[] = [
  {
    id: 'ct1',
    clientId: 'c2',
    clientName: 'Carolina Lima',
    companyName: 'Ponto de Encontro Café',
    proposalId: 'p2',
    type: 'Marketing Digital e Tráfego Local',
    value: 3500.0,
    monthlyValue: 3500.0,
    startDate: '2026-06-11',
    firstPaymentDate: '2026-06-15',
    status: 'pending_signatures',
    documentUrl: 'https://zapsign.com.br/sign/mock-ponto-de-encontro-cafe',
    version: 'v1.0',
    createdAt: '2026-06-02T09:00:00Z'
  }
];

const initialCharges: Charge[] = [
  {
    id: 'ch1',
    clientId: 'c2',
    clientName: 'Carolina Lima',
    companyName: 'Ponto de Encontro Café',
    contractId: 'ct1',
    value: 3500.0,
    dueDate: '2026-06-15',
    paymentMethod: 'pix',
    paymentUrl: 'https://cobranca.asaas.com/mock-cobranca-ponto-cafe',
    status: 'pending',
    createdAt: '2026-06-02T09:30:00Z'
  }
];

const initialOnboardings: Onboarding[] = [
  {
    id: 'o1',
    clientId: 'c2',
    clientName: 'Carolina Lima',
    companyName: 'Ponto de Encontro Café',
    startDate: '2026-06-02',
    responsibleUser: 'Ana Silva',
    steps: {
      paymentConfirmed: 'pending',
      driveCreated: 'pending',
      clickupCreated: 'pending',
      tasksCreated: 'pending',
      onboardingMeeting: 'pending',
      completed: 'pending'
    },
    links: {
      googleDrive: '',
      clickup: '',
      whatsAppGroup: '',
      contract: 'https://zapsign.com.br/sign/mock-ponto-de-encontro-cafe',
      charge: 'https://cobranca.asaas.com/mock-cobranca-ponto-cafe',
      proposal: 'p2'
    },
    createdAt: '2026-06-02T10:00:00Z'
  }
];

const initialPublications: Publication[] = [
  {
    id: 'pub1',
    clientId: 'c1',
    clientName: 'Roberto Souza',
    companyName: 'Power Energy Ltda',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    caption: '⚡ A transição para energia limpa não é mais o futuro, é o presente. Empresas que adotam fontes renováveis reduzem custos operacionais em até 30% e geram um impacto ambiental positivo imediato. Fale conosco para entender como podemos ajudar o seu negócio a decolar sustentavelmente! #EnergiaSolar #Sustentabilidade #Economia',
    scheduledDate: '2026-06-15',
    status: 'approved',
    approvalLink: 'https://hubpowerponto.com/aprovar/pub1',
    responsibleUser: 'João Santos',
    createdAt: '2026-06-08T14:00:00Z'
  },
  {
    id: 'pub2',
    clientId: 'c2',
    clientName: 'Carolina Lima',
    companyName: 'Ponto de Encontro Café',
    imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80',
    caption: '☕ O aroma de um café especial moído na hora tem o poder de transformar qualquer dia produtivo. No Ponto de Encontro, selecionamos grãos de pequenos produtores nacionais para garantir a xícara perfeita para suas reuniões ou pausas criativas. Venha trabalhar e se deliciar! #CafeEspecial #CoffeeLover #EspacoCoworking',
    scheduledDate: '2026-06-18',
    status: 'pending_approval',
    approvalLink: 'https://hubpowerponto.com/aprovar/pub2',
    responsibleUser: 'João Santos',
    createdAt: '2026-06-10T11:00:00Z'
  }
];

const initialTasks: TeamTask[] = [
  {
    id: 't1',
    title: 'Fazer Reunião de Briefing de Onboarding',
    clientId: 'c2',
    clientName: 'Ponto de Encontro Café',
    responsibleUser: 'Ana Silva',
    dueDate: '2026-06-14',
    status: 'pending',
    priority: 'high',
    description: 'Reunião para extrair a identidade da marca, preferências de cores e estruturar o calendário editorial inicial.',
    createdAt: '2026-06-02T10:00:00Z'
  },
  {
    id: 't2',
    title: 'Criar criativos do post de Café Especial',
    clientId: 'c2',
    clientName: 'Ponto de Encontro Café',
    responsibleUser: 'João Santos',
    dueDate: '2026-06-10',
    status: 'completed',
    priority: 'medium',
    description: 'Desenvolver artes e legendas para os posts institucionais de lançamento.',
    createdAt: '2026-06-05T14:00:00Z'
  },
  {
    id: 't3',
    title: 'Mapear Público-Alvo e Configurar Pixel Facebook',
    clientId: 'c2',
    clientName: 'Ponto de Encontro Café',
    responsibleUser: 'Maria Souza',
    dueDate: '2026-06-16',
    status: 'in_progress',
    priority: 'urgent',
    description: 'Instalar pixel de conversão no site do café e configurar campanhas de tráfego de geolocalização.',
    createdAt: '2026-06-05T15:00:00Z'
  }
];

const initialHistory: HistoryEvent[] = [
  {
    id: 'h1',
    clientId: 'c1',
    clientName: 'Power Energy Ltda',
    title: 'Cliente Criado',
    description: 'Cadastro inicial efetuado no sistema por Carlos Santos.',
    type: 'client_created',
    createdAt: '2026-05-10T10:00:00Z'
  },
  {
    id: 'h2',
    clientId: 'c2',
    clientName: 'Ponto de Encontro Café',
    title: 'Cliente Criado',
    description: 'Cadastro efetuado no sistema por Carlos Santos após consulta de CNPJ.',
    type: 'client_created',
    createdAt: '2026-06-01T14:30:00Z'
  },
  {
    id: 'h3',
    clientId: 'c2',
    clientName: 'Ponto de Encontro Café',
    title: 'Proposta Comercial Criada',
    description: 'Proposta comercial de R$ 3.500,00 mensais foi elaborada por Carlos Santos.',
    type: 'proposal_created',
    createdAt: '2026-06-01T15:00:00Z'
  },
  {
    id: 'h4',
    clientId: 'c2',
    clientName: 'Ponto de Encontro Café',
    title: 'Proposta Aceita pelo Cliente',
    description: 'Carolina Lima visualizou e aceitou os termos da proposta na página pública.',
    type: 'proposal_accepted',
    createdAt: '2026-06-01T17:45:00Z'
  },
  {
    id: 'h5',
    clientId: 'c2',
    clientName: 'Ponto de Encontro Café',
    title: 'Contrato Gerado Automaticamente',
    description: 'Contrato de prestação de serviços gerado e enviado para assinatura via ZapSign.',
    type: 'contract_generated',
    createdAt: '2026-06-02T09:00:00Z'
  },
  {
    id: 'h6',
    clientId: 'c2',
    clientName: 'Ponto de Encontro Café',
    title: 'Cobrança Financeira Gerada',
    description: 'Cobrança recorrente de R$ 3.500,00 criada no integrador Asaas.',
    type: 'charge_generated',
    createdAt: '2026-06-02T09:30:00Z'
  }
];

export const useStore = create<SystemState>()(
  persist(
    (set, get) => ({
      clients: initialClients,
      proposals: initialProposals,
      contracts: initialContracts,
      charges: initialCharges,
      onboardings: initialOnboardings,
      publications: initialPublications,
      tasks: initialTasks,
      historyEvents: initialHistory,
      teamMembers: initialTeamMembers,
      currentUser: initialTeamMembers[0], // Ana Silva default
      
      // Actions
      addClient: (clientData) => {
        const newClient: Client = {
          ...clientData,
          id: `c_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          clients: [newClient, ...state.clients],
        }));
        
        get().addHistoryEvent({
          clientId: newClient.id,
          clientName: newClient.name,
          title: 'Cliente Cadastrado',
          description: `Novo cliente comercial ${newClient.companyName} cadastrado no sistema por ${get().currentUser.name}.`,
          type: 'client_created'
        });
        
        return newClient;
      },
      
      updateClientStatus: (id, status) => {
        set((state) => ({
          clients: state.clients.map((c) => c.id === id ? { ...c, commercialStatus: status } : c)
        }));
      },
      
      addProposal: (proposalData) => {
        const newProposal: Proposal = {
          ...proposalData,
          id: `p_${Date.now()}`,
          status: 'draft',
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          proposals: [newProposal, ...state.proposals]
        }));
        
        get().addHistoryEvent({
          clientId: newProposal.clientId,
          clientName: newProposal.clientName,
          title: 'Proposta Comercial Criada',
          description: `Nova proposta de R$ ${newProposal.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} elaborada sob status Rascunho.`,
          type: 'proposal_created'
        });
        
        return newProposal;
      },
      
      updateProposalStatus: (id, status) => {
        set((state) => ({
          proposals: state.proposals.map((p) => p.id === id ? { ...p, status } : p)
        }));
        
        const proposal = get().proposals.find(p => p.id === id);
        if (proposal) {
          get().addHistoryEvent({
            clientId: proposal.clientId,
            clientName: proposal.clientName,
            title: `Proposta Status Atualizado: ${status}`,
            description: `A proposta comercial mudou seu status para '${status}'.`,
            type: 'proposal_sent'
          });
        }
      },
      
      acceptProposalFlow: (id) => {
        const proposal = get().proposals.find(p => p.id === id);
        if (!proposal) return;
        
        // Update Proposal Status
        set((state) => ({
          proposals: state.proposals.map((p) => p.id === id ? { ...p, status: 'accepted' } : p)
        }));
        
        // Update Client Status to Onboarding
        get().updateClientStatus(proposal.clientId, 'onboarding');
        
        // Add History Event for Acceptance
        get().addHistoryEvent({
          clientId: proposal.clientId,
          clientName: proposal.clientName,
          title: 'Proposta Comercial Aceita',
          description: `O cliente aceitou eletronicamente os termos da proposta via link público.`,
          type: 'proposal_accepted'
        });
        
        // Check if contract already exists
        const existsContract = get().contracts.some(c => c.proposalId === id);
        if (!existsContract) {
          // Auto-generate Contract
          const newContract: Contract = {
            id: `ct_${Date.now()}`,
            clientId: proposal.clientId,
            clientName: proposal.clientName,
            companyName: proposal.companyName,
            proposalId: proposal.id,
            type: proposal.description,
            value: proposal.totalValue,
            monthlyValue: proposal.monthlyValue,
            startDate: new Date().toISOString().split('T')[0],
            firstPaymentDate: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0], // 5 days out
            status: 'pending_signatures',
            documentUrl: `https://zapsign.com.br/sign/mock-${proposal.id}`,
            version: 'v1.0',
            createdAt: new Date().toISOString()
          };
          
          set((state) => ({
            contracts: [newContract, ...state.contracts]
          }));
          
          get().addHistoryEvent({
            clientId: proposal.clientId,
            clientName: proposal.clientName,
            title: 'Contrato Gerado Automaticamente',
            description: `Contrato '${newContract.type}' criado sob status 'Aguardando Assinatura' na ZapSign.`,
            type: 'contract_generated'
          });
          
          // Check if Onboarding checklist already exists
          const existsOnboarding = get().onboardings.some(o => o.clientId === proposal.clientId);
          if (!existsOnboarding) {
            const newOnboarding: Onboarding = {
              id: `o_${Date.now()}`,
              clientId: proposal.clientId,
              clientName: proposal.clientName,
              companyName: proposal.companyName,
              startDate: new Date().toISOString().split('T')[0],
              responsibleUser: get().currentUser.name,
              steps: {
                paymentConfirmed: 'pending',
                driveCreated: 'pending',
                clickupCreated: 'pending',
                tasksCreated: 'pending',
                onboardingMeeting: 'pending',
                completed: 'pending'
              },
              links: {
                googleDrive: '',
                clickup: '',
                whatsAppGroup: '',
                contract: newContract.documentUrl,
                charge: '',
                proposal: proposal.id
              },
              createdAt: new Date().toISOString()
            };
            
            set((state) => ({
              onboardings: [newOnboarding, ...state.onboardings]
            }));
          }
        }
      },
      
      declineProposalFlow: (id) => {
        const proposal = get().proposals.find(p => p.id === id);
        if (!proposal) return;
        
        set((state) => ({
          proposals: state.proposals.map((p) => p.id === id ? { ...p, status: 'declined' } : p)
        }));
        
        get().addHistoryEvent({
          clientId: proposal.clientId,
          clientName: proposal.clientName,
          title: 'Proposta Recusada',
          description: `O cliente recusou os termos da proposta na página pública.`,
          type: 'proposal_sent' // using sent as base log type
        });
      },
      
      addContract: (contractData) => {
        const newContract: Contract = {
          ...contractData,
          id: `ct_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          contracts: [newContract, ...state.contracts]
        }));
        
        get().addHistoryEvent({
          clientId: newContract.clientId,
          clientName: newContract.clientName,
          title: 'Contrato Adicionado',
          description: `Contrato do tipo '${newContract.type}' criado manualmente.`,
          type: 'contract_generated'
        });
        
        return newContract;
      },
      
      updateContractStatus: (id, status) => {
        set((state) => ({
          contracts: state.contracts.map((c) => c.id === id ? { ...c, status } : c)
        }));
      },
      
      signContractFlow: (id) => {
        const contract = get().contracts.find(c => c.id === id);
        if (!contract) return;
        
        // Update Contract status
        set((state) => ({
          contracts: state.contracts.map((c) => c.id === id ? { ...c, status: 'signed' } : c)
        }));
        
        get().addHistoryEvent({
          clientId: contract.clientId,
          clientName: contract.clientName,
          title: 'Contrato Assinado',
          description: `O contrato foi assinado por todas as partes via ZapSign.`,
          type: 'contract_signed'
        });
        
        // Auto-generate Charge in Asaas
        const existsCharge = get().charges.some(ch => ch.contractId === id);
        if (!existsCharge) {
          const newCharge: Charge = {
            id: `ch_${Date.now()}`,
            clientId: contract.clientId,
            clientName: contract.clientName,
            companyName: contract.companyName,
            contractId: contract.id,
            value: contract.monthlyValue,
            dueDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0], // 3 days from signature
            paymentMethod: 'pix',
            paymentUrl: `https://cobranca.asaas.com/mock-cobranca-${contract.id}`,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          
          set((state) => ({
            charges: [newCharge, ...state.charges]
          }));
          
          get().addHistoryEvent({
            clientId: contract.clientId,
            clientName: contract.clientName,
            title: 'Cobrança Asaas Gerada',
            description: `Faturamento recorrente de R$ ${newCharge.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} gerado no Asaas.`,
            type: 'charge_generated'
          });
          
          // Link charge url to Onboarding
          set((state) => ({
            onboardings: state.onboardings.map((o) => o.clientId === contract.clientId ? {
              ...o,
              links: { ...o.links, charge: newCharge.paymentUrl }
            } : o)
          }));
        }
      },
      
      addCharge: (chargeData) => {
        const newCharge: Charge = {
          ...chargeData,
          id: `ch_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          charges: [newCharge, ...state.charges]
        }));
        
        return newCharge;
      },
      
      updateChargeStatus: (id, status) => {
        set((state) => ({
          charges: state.charges.map((ch) => ch.id === id ? { ...ch, status } : ch)
        }));
      },
      
      confirmPaymentFlow: (id) => {
        const charge = get().charges.find(ch => ch.id === id);
        if (!charge) return;
        
        // Update charge status to paid
        set((state) => ({
          charges: state.charges.map((ch) => ch.id === id ? { ...ch, status: 'paid', paidAt: new Date().toISOString() } : ch)
        }));
        
        get().addHistoryEvent({
          clientId: charge.clientId,
          clientName: charge.clientName,
          title: 'Cobrança Confirmada (Asaas)',
          description: `Pagamento de R$ ${charge.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} compensado com sucesso via Asaas.`,
          type: 'charge_paid'
        });
        
        // Update Onboarding: set paymentConfirmed to completed
        set((state) => ({
          onboardings: state.onboardings.map((o) => o.clientId === charge.clientId ? {
            ...o,
            steps: { ...o.steps, paymentConfirmed: 'completed' }
          } : o)
        }));
        
        // Auto trigger operational setup simulator
        // 1. Setup Google Drive
        setTimeout(() => {
          set((state) => ({
            onboardings: state.onboardings.map((o) => o.clientId === charge.clientId ? {
              ...o,
              steps: { ...o.steps, driveCreated: 'completed' },
              links: { ...o.links, googleDrive: `https://drive.google.com/drive/folders/mock-${charge.clientId}` }
            } : o)
          }));
          
          get().addHistoryEvent({
            clientId: charge.clientId,
            clientName: charge.clientName,
            title: 'Pasta Criada no Google Drive',
            description: `Automação gerou com sucesso a estrutura de pastas do cliente no Google Drive.`,
            type: 'drive_created'
          });
        }, 1000);

        // 2. Setup ClickUp
        setTimeout(() => {
          set((state) => ({
            onboardings: state.onboardings.map((o) => o.clientId === charge.clientId ? {
              ...o,
              steps: { ...o.steps, clickupCreated: 'completed' },
              links: { ...o.links, clickup: `https://app.clickup.com/folders/mock-${charge.clientId}`, whatsAppGroup: `https://chat.whatsapp.com/mock-${charge.clientId}` }
            } : o)
          }));
          
          get().addHistoryEvent({
            clientId: charge.clientId,
            clientName: charge.clientName,
            title: 'Projeto Criado no ClickUp & WhatsApp',
            description: `Automação ClickUp criou a pasta de projetos. Grupo do WhatsApp operacional criado.`,
            type: 'clickup_created'
          });
        }, 2000);

        // 3. Setup Tasks
        setTimeout(() => {
          // Generate onboarding tasks
          const onboardingMeetingTask = get().addTask({
            title: 'Reunião de Alinhamento de Onboarding',
            clientId: charge.clientId,
            clientName: charge.clientName,
            responsibleUser: 'Ana Silva',
            dueDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
            status: 'pending',
            priority: 'high',
            description: 'Primeira conversa oficial pós-pagamento para definição de cronograma operacional.'
          });

          const editorialTask = get().addTask({
            title: 'Planejar Calendário Editorial e Grade de Temas',
            clientId: charge.clientId,
            clientName: charge.clientName,
            responsibleUser: 'João Santos',
            dueDate: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0],
            status: 'pending',
            priority: 'medium',
            description: 'Roteirizar primeiros 6 posts com base na identidade extraída no onboarding.'
          });
          
          set((state) => ({
            onboardings: state.onboardings.map((o) => o.clientId === charge.clientId ? {
              ...o,
              steps: { ...o.steps, tasksCreated: 'completed' }
            } : o)
          }));
        }, 3000);
      },
      
      updateOnboardingStep: (clientId, stepName, status) => {
        set((state) => {
          const onboardings = state.onboardings.map((o) => {
            if (o.clientId === clientId) {
              const updatedSteps = { ...o.steps, [stepName]: status };
              
              // If all steps except 'completed' are completed, auto complete
              const allDone = 
                updatedSteps.paymentConfirmed === 'completed' &&
                updatedSteps.driveCreated === 'completed' &&
                updatedSteps.clickupCreated === 'completed' &&
                updatedSteps.tasksCreated === 'completed' &&
                updatedSteps.onboardingMeeting === 'completed';
                
              updatedSteps.completed = allDone ? 'completed' : 'pending';
              
              return { ...o, steps: updatedSteps };
            }
            return o;
          });
          
          return { onboardings };
        });
        
        // Log if onboarding overall is completed
        const updatedOnb = get().onboardings.find(o => o.clientId === clientId);
        if (updatedOnb && updatedOnb.steps.completed === 'completed') {
          get().updateClientStatus(clientId, 'active');
          get().addHistoryEvent({
            clientId,
            clientName: updatedOnb.clientName,
            title: 'Onboarding Concluído',
            description: `Onboarding operacional finalizado. O cliente foi movido para o status ATIVO na carteira.`,
            type: 'onboarding_completed'
          });
        }
      },
      
      updateOnboardingLinks: (clientId, links) => {
        set((state) => ({
          onboardings: state.onboardings.map((o) => o.clientId === clientId ? {
            ...o,
            links: { ...o.links, ...links }
          } : o)
        }));
      },
      
      addPublication: (pubData) => {
        const newPub: Publication = {
          ...pubData,
          id: `pub_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          publications: [newPub, ...state.publications]
        }));
        
        get().addHistoryEvent({
          clientId: newPub.clientId,
          clientName: newPub.clientName,
          title: 'Publicação Enviada para Aprovação',
          description: `Novo criativo e legenda enviados para a fila de aprovação de ${newPub.companyName}.`,
          type: 'publication_sent'
        });
        
        return newPub;
      },
      
      updatePublicationStatus: (id, status, comments) => {
        set((state) => ({
          publications: state.publications.map((pub) => 
            pub.id === id ? { ...pub, status, clientComments: comments || pub.clientComments } : pub
          )
        }));
        
        const pub = get().publications.find(p => p.id === id);
        if (pub) {
          const title = status === 'approved' ? 'Publicação Aprovada' : 'Alteração Solicitada na Publicação';
          const type = status === 'approved' ? 'publication_approved' : 'publication_revision';
          
          get().addHistoryEvent({
            clientId: pub.clientId,
            clientName: pub.clientName,
            title,
            description: status === 'approved' 
              ? `A publicação agendada para ${pub.scheduledDate} foi aprovada sem ressalvas pelo cliente.`
              : `O cliente solicitou alterações: "${comments || ''}"`,
            type
          });
          
          // Auto create clickup adjustment task if revision is requested
          if (status === 'changes_requested') {
            get().addTask({
              title: `Ajuste de Publicação - ${pub.companyName}`,
              clientId: pub.clientId,
              clientName: pub.clientName,
              responsibleUser: pub.responsibleUser,
              dueDate: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0], // 1 day limit
              status: 'pending',
              priority: 'high',
              description: `Solicitação de alteração do cliente: "${comments || ''}"`
            });
          }
        }
      },
      
      addTask: (taskData) => {
        const newTask: TeamTask = {
          ...taskData,
          id: `t_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          tasks: [newTask, ...state.tasks]
        }));
        
        return newTask;
      },
      
      updateTaskStatus: (id, status) => {
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === id ? { ...t, status } : t)
        }));
        
        const task = get().tasks.find(t => t.id === id);
        if (task && status === 'completed') {
          get().addHistoryEvent({
            clientId: task.clientId,
            clientName: task.clientName,
            title: 'Tarefa Concluída',
            description: `Tarefa '${task.title}' concluída por ${task.responsibleUser}.`,
            type: 'task_completed'
          });
        }
      },
      
      addHistoryEvent: (eventData) => {
        const newEvent: HistoryEvent = {
          ...eventData,
          id: `h_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          historyEvents: [newEvent, ...state.historyEvents]
        }));
      },
      
      simulateCnpjSearch: (cnpj) => {
        // Clean formatting to parse
        const cleanCnpj = cnpj.replace(/\D/g, '');
        
        if (!cleanCnpj || cleanCnpj.length !== 14) {
          return null;
        }
        
        // Mock DB for CNPJs
        const mockDb: Record<string, ReturnType<SystemState['simulateCnpjSearch']>> = {
          '12345678000190': {
            companyName: 'Power Energy Solar e Automação Ltda',
            tradeName: 'Power Energy',
            address: 'Av. Paulista, 1000 - Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            status: 'ATIVA',
            activity: '71.12-8-00 - Serviços de Engenharia e Eficiência Energética'
          },
          '98765432000110': {
            companyName: 'Carolina Lima & Ponto de Encontro Café Ltda',
            tradeName: 'Ponto de Encontro Café',
            address: 'Rua Visconde de Pirajá, 350 - Ipanema',
            city: 'Rio de Janeiro',
            state: 'RJ',
            status: 'ATIVA',
            activity: '56.11-2-03 - Lanchonetes, casas de chá, de sucos e similares'
          },
          '55444333000122': {
            companyName: 'Alfa Tech Consultoria Tecnológica e Operacional S/A',
            tradeName: 'Alfa Tech Consultoria',
            address: 'Av. do Contorno, 6000 - Savassi',
            city: 'Belo Horizonte',
            state: 'MG',
            status: 'ATIVA',
            activity: '62.04-0-00 - Consultoria em tecnologia da informação'
          }
        };
        
        // Fallback for any other valid length CNPJ to make it work dynamically
        return mockDb[cleanCnpj] || {
          companyName: `Empresa Simulada CNPJ ${cnpj}`,
          tradeName: `Nome Fantasia ${cnpj.slice(0, 5)}`,
          address: 'Rua das Automações, 123 - Centro',
          city: 'São Paulo',
          state: 'SP',
          status: 'ATIVA',
          activity: '70.20-4-00 - Atividades de consultoria em gestão empresarial'
        };
      },
      
      resetState: () => {
        set(() => ({
          clients: initialClients,
          proposals: initialProposals,
          contracts: initialContracts,
          charges: initialCharges,
          onboardings: initialOnboardings,
          publications: initialPublications,
          tasks: initialTasks,
          historyEvents: initialHistory,
          teamMembers: initialTeamMembers,
          currentUser: initialTeamMembers[0],
        }));
      }
    }),
    {
      name: 'hub-power-ponto-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
