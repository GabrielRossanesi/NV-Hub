'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, FileText, ExternalLink, Send, Trash2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { PageHeader as UIHeader } from '../../components/ui/page-header';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Textarea from '../../components/ui/textarea';
import Select from '../../components/ui/select';
import Modal from '../../components/ui/modal';
import Card, { CardContent } from '../../components/ui/card';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import StatusBadge from '../../components/ui/status-badge';
import EmptyState from '../../components/ui/empty-state';
import DatePicker from '../../components/ui/date-picker';
import { ProposalStatus, ProposalItem } from '../../types';

export default function PropostasPage() {
  const mounted = useMounted();
  const { proposals, clients, addProposal, updateProposalStatus } = useStore();

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [selectedClientId, setSelectedClientId] = useState('');
  const [description, setDescription] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Boleto Asaas. Vencimento todo dia 10.');
  const [notes, setNotes] = useState('');
  
  // Dynamic Items list state
  const [items, setItems] = useState<Omit<ProposalItem, 'id'>[]>([
    { description: 'Setup inicial de Contas de Anúncio', value: 1000, isMonthly: false },
    { description: 'Gestão de Tráfego Pago e Redes Sociais', value: 2500, isMonthly: true }
  ]);
  
  // Temp item form
  const [tempDesc, setTempDesc] = useState('');
  const [tempVal, setTempVal] = useState('');
  const [tempRec, setTempRec] = useState(false);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Add Item to proposal draft
  const handleAddItem = () => {
    if (!tempDesc || !tempVal) return;
    
    setItems([
      ...items,
      {
        description: tempDesc,
        value: parseFloat(tempVal),
        isMonthly: tempRec
      }
    ]);
    
    setTempDesc('');
    setTempVal('');
    setTempRec(false);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Totals calculations
  const totalSetup = items.filter(i => !i.isMonthly).reduce((sum, item) => sum + item.value, 0);
  const monthlyRecurring = items.filter(i => i.isMonthly).reduce((sum, item) => sum + item.value, 0);
  const totalValue = totalSetup + monthlyRecurring; // setup + monthly base

  const handleSaveProposal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const client = clients.find(c => c.id === selectedClientId);
    if (!client || !description || !validityDate || items.length === 0) {
      alert('Preencha os campos obrigatórios e adicione ao menos 1 item na proposta.');
      return;
    }

    addProposal({
      clientId: client.id,
      clientName: client.name,
      companyName: client.companyName,
      description: description,
      items: items.map((it, idx) => ({ ...it, id: `pi_${Date.now()}_${idx}` })),
      totalValue: totalValue,
      monthlyValue: monthlyRecurring,
      validityDate: validityDate,
      paymentTerms: paymentTerms,
      notes: notes
    });

    // Reset fields
    setSelectedClientId('');
    setDescription('');
    setValidityDate('');
    setPaymentTerms('Boleto Asaas. Vencimento todo dia 10.');
    setNotes('');
    setItems([
      { description: 'Setup inicial de Contas de Anúncio', value: 1000, isMonthly: false },
      { description: 'Gestão de Tráfego Pago e Redes Sociais', value: 2500, isMonthly: true }
    ]);
    setIsModalOpen(false);
  };

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    const matchesSearch = 
      p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const clientOptions = clients.map(c => ({ value: c.id, label: `${c.companyName} (${c.name})` }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <UIHeader 
        title="Propostas Comerciais" 
        description="Acompanhe propostas elaboradas, envie links de aceite aos clientes e feche negócios."
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova Proposta
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-card p-4 rounded-xl border border-border/80 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar propostas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all placeholder:text-muted-foreground/75"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
            {['all', 'draft', 'sent', 'viewed', 'accepted', 'declined', 'expired'].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => setStatusFilter(statusKey)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  statusFilter === statusKey
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {statusKey === 'all' && 'Todas'}
                {statusKey === 'draft' && 'Rascunho'}
                {statusKey === 'sent' && 'Enviada'}
                {statusKey === 'viewed' && 'Visualizada'}
                {statusKey === 'accepted' && 'Aceita'}
                {statusKey === 'declined' && 'Recusada'}
                {statusKey === 'expired' && 'Expirada'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table List */}
      <Card>
        <CardContent className="p-0">
          {filteredProposals.length === 0 ? (
            <div className="p-12">
              <EmptyState 
                title="Nenhuma proposta comercial" 
                description="Não há registros correspondentes. Crie uma nova proposta para iniciar o funil de vendas."
                actionLabel="Criar Proposta"
                onAction={() => setIsModalOpen(true)}
                icon={<FileText className="h-6 w-6" />}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa / Cliente</TableHead>
                  <TableHead>Descrição do Serviço</TableHead>
                  <TableHead>Valor Mensal</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((prop) => (
                  <TableRow key={prop.id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">{prop.companyName}</div>
                      <div className="text-xs text-muted-foreground">Contato: {prop.clientName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-foreground font-medium truncate max-w-xs">{prop.description}</div>
                      <div className="text-[10px] text-muted-foreground">Criação: {new Date(prop.createdAt).toLocaleDateString('pt-BR')}</div>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground text-xs">
                      R$ {prop.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground text-xs">
                      R$ {prop.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(prop.validityDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell><StatusBadge type="proposal" status={prop.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Link to public proposal page */}
                        <Link href={`/proposta/${prop.id}`} target="_blank">
                          <Button variant="outline" size="sm" className="h-8 gap-1" title="Ver Link Público da Proposta">
                            Página Aceite <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>

                        {/* Send proposal flow mock */}
                        {prop.status === 'draft' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => updateProposalStatus(prop.id, 'sent')}
                            className="h-8 gap-1 text-primary hover:text-primary border border-border"
                          >
                            <Send className="h-3 w-3" /> Enviar
                          </Button>
                        )}

                        {prop.status === 'sent' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateProposalStatus(prop.id, 'viewed')}
                            className="h-8 text-xs font-semibold text-amber-500 border-amber-500/20 hover:bg-amber-500/5"
                          >
                            Marcar Visualizada
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Criar Proposta Comercial"
        description="Defina os termos, validade e elabore a planilha de itens de serviço."
        size="lg"
      >
        <form onSubmit={handleSaveProposal} className="space-y-4 pt-2">
          <Select
            label="Selecione o Cliente Associado"
            placeholder="Escolha um cliente..."
            options={clientOptions}
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            required
          />

          <Input
            label="Título / Escopo Principal do Serviço"
            type="text"
            placeholder="Ex: Gestão de Mídias Sociais + Tráfego Pago Local"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Data de Validade da Proposta"
              value={validityDate}
              onChange={(e) => setValidityDate(e.target.value)}
              required
            />
            <Input
              label="Condições de Faturamento"
              type="text"
              placeholder="Ex: Cartão, Pix ou Boleto via Asaas"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>

          {/* Proposal itemizer table panel */}
          <div className="space-y-3 p-4 bg-muted/30 border border-border rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Itens da Proposta</h3>
            
            {/* Add Item form fields */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
              <div className="md:col-span-2">
                <Input
                  label="Descrição do Item"
                  type="text"
                  placeholder="Nome do serviço"
                  value={tempDesc}
                  onChange={(e) => setTempDesc(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <Input
                  label="Valor (R$)"
                  type="number"
                  placeholder="0.00"
                  value={tempVal}
                  onChange={(e) => setTempVal(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 h-10 select-none">
                <input
                  type="checkbox"
                  id="tempRec"
                  checked={tempRec}
                  onChange={(e) => setTempRec(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/40 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="tempRec" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                  Mensal?
                </label>
              </div>
              <div>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleAddItem}
                  className="w-full h-9 text-xs border border-border"
                >
                  Adicionar
                </Button>
              </div>
            </div>

            {/* List of current proposal items */}
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">Nenhum item adicionado à proposta.</p>
            ) : (
              <div className="divide-y divide-border/30 max-h-40 overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div key={index} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground block truncate">{item.description}</span>
                      <span className="text-[10px] text-muted-foreground block">{item.isMonthly ? 'Recorrente Mensal' : 'Setup Único'}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-foreground">
                        R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveItem(index)}
                        className="text-danger hover:text-danger/80 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Calculations totals summary box */}
            <div className="pt-2 border-t border-border/40 grid grid-cols-2 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-muted-foreground block">Valor Recorrente Mensal:</span>
                <span className="text-muted-foreground block">Setup Único / Total Proposta:</span>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-primary font-bold block">R$ {monthlyRecurring.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="text-foreground font-bold block">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <Textarea
            label="Notas Adicionais da Proposta"
            placeholder="Observações adicionais..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Gravar Proposta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
