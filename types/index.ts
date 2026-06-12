export type ClientStatus = 'lead' | 'onboarding' | 'active' | 'inactive';

export interface Client {
  id: string;
  name: string;
  companyName: string;
  cnpj: string;
  phone: string;
  email: string;
  responsibleUser: string;
  commercialStatus: ClientStatus;
  notes?: string;
  createdAt: string;
}

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';

export interface ProposalItem {
  id: string;
  description: string;
  value: number;
  isMonthly: boolean; // recurring
}

export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  description: string;
  items: ProposalItem[];
  totalValue: number;
  monthlyValue: number;
  validityDate: string;
  paymentTerms: string;
  notes?: string;
  status: ProposalStatus;
  createdAt: string;
}

export type ContractStatus = 
  | 'not_generated'
  | 'drafting'
  | 'generated'
  | 'sent'
  | 'pending_signatures'
  | 'signed'
  | 'declined'
  | 'expired'
  | 'cancelled';

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  proposalId: string;
  type: string; // e.g. "Prestação de Serviços"
  value: number;
  monthlyValue: number;
  startDate: string;
  firstPaymentDate: string;
  status: ContractStatus;
  documentUrl?: string; // ZapSign placeholder url
  version: string;
  createdAt: string;
}

export type ChargeStatus = 
  | 'pending_generation'
  | 'created'
  | 'sent'
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface Charge {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  contractId: string;
  value: number;
  dueDate: string;
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  paymentUrl?: string; // Asaas placeholder url
  status: ChargeStatus;
  paidAt?: string;
  createdAt: string;
}

export type OnboardingStepStatus = 'pending' | 'completed';

export interface Onboarding {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  startDate: string;
  responsibleUser: string;
  steps: {
    paymentConfirmed: OnboardingStepStatus;
    driveCreated: OnboardingStepStatus;
    clickupCreated: OnboardingStepStatus;
    tasksCreated: OnboardingStepStatus;
    onboardingMeeting: OnboardingStepStatus;
    completed: OnboardingStepStatus;
  };
  links: {
    googleDrive?: string;
    clickup?: string;
    whatsAppGroup?: string;
    contract?: string;
    charge?: string;
    proposal?: string;
  };
  createdAt: string;
}

export type PublicationStatus = 
  | 'draft'
  | 'ready_for_approval'
  | 'sent_to_client'
  | 'pending_approval'
  | 'approved'
  | 'changes_requested'
  | 'adjusting'
  | 'resubmitted'
  | 'scheduled'
  | 'posted';

export interface Publication {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  imageUrl: string;
  caption: string;
  scheduledDate: string;
  status: PublicationStatus;
  approvalLink: string;
  clientComments?: string;
  responsibleUser: string;
  createdAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'in_review' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TeamTask {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  responsibleUser: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  description?: string;
  createdAt: string;
}

export interface HistoryEvent {
  id: string;
  clientId?: string;
  clientName?: string;
  title: string;
  description: string;
  type: 
    | 'client_created'
    | 'proposal_created'
    | 'proposal_sent'
    | 'proposal_viewed'
    | 'proposal_accepted'
    | 'contract_generated'
    | 'contract_sent'
    | 'contract_signed'
    | 'charge_generated'
    | 'charge_paid'
    | 'drive_created'
    | 'clickup_created'
    | 'publication_sent'
    | 'publication_approved'
    | 'publication_revision'
    | 'publication_posted'
    | 'task_completed'
    | 'onboarding_completed';
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}
