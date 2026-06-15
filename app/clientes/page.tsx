'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, Building2, SearchCode } from 'lucide-react';
import { useTenantStore } from '../../lib/store';
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
import { ClientStatus } from '../../types';

export default function ClientesPage() {
  const mounted = useMounted();
  const { clients, addClient, teamMembers, simulateCnpjSearch, checkLimit } = useTenantStore();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [responsavel, setResponsavel] = useState('Ana Silva');
  const [status, setStatus] = useState<ClientStatus>('lead');
  const [observacoes, setObservacoes] = useState('');
  
  // CNPJ status states
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [cnpjSearchMessage, setCnpjSearchMessage] = useState('');

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnpj.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || client.commercialStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle CNPJ search simulation
  const handleCnpjSearch = () => {
    if (!cnpj) {
      setCnpjSearchMessage('Digite um CNPJ para consultar.');
      return;
    }
    
    setIsSearchingCnpj(true);
    setCnpjSearchMessage('');
    
    setTimeout(() => {
      const result = simulateCnpjSearch(cnpj);
      setIsSearchingCnpj(false);
      
      if (result) {
        setEmpresa(result.companyName);
        setObservacoes(
          `Endereço: ${result.address}, ${result.city}-${result.state}\n` +
          `Situação Cadastral: ${result.status}\n` +
          `Atividade Principal: ${result.activity}\n` +
          (observacoes ? `\nObservações Adicionais:\n${observacoes}` : '')
        );
        setCnpjSearchMessage('Dados preenchidos automaticamente! ✅');
      } else {
        setCnpjSearchMessage('CNPJ inválido ou não encontrado.');
      }
    }, 1000);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !empresa || !cnpj || !email) {
      return;
    }
    
    const result = addClient({
      name: nome,
      companyName: empresa,
      cnpj: cnpj,
      phone: telefone,
      email: email,
      responsibleUser: responsavel,
      commercialStatus: status,
      notes: observacoes
    });
    
    if (!result) {
      alert('Limite do Plano Atingido! Faça o upgrade do seu plano nas Configurações para continuar cadastrando mais clientes.');
      return;
    }
    
    // Reset form & close
    setNome('');
    setEmpresa('');
    setCnpj('');
    setTelefone('');
    setEmail('');
    setResponsavel('Ana Silva');
    setStatus('lead');
    setObservacoes('');
    setCnpjSearchMessage('');
    setIsModalOpen(false);
  };

  const teamOptions = teamMembers.map(m => ({ value: m.name, label: m.name }));
  const statusOptions = [
    { value: 'lead', label: 'Lead' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <UIHeader 
        title="Gestão de Clientes" 
        description="Visualize e cadastre os clientes corporativos da sua carteira."
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Novo Cliente
          </Button>
        }
      />

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-card p-4 rounded-xl border border-border/80 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar por nome, empresa, CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all placeholder:text-muted-foreground/75"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
            {['all', 'lead', 'onboarding', 'active', 'inactive'].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => setStatusFilter(statusKey)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  statusFilter === statusKey
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {statusKey === 'all' && 'Todos'}
                {statusKey === 'lead' && 'Leads'}
                {statusKey === 'onboarding' && 'Onboarding'}
                {statusKey === 'active' && 'Ativos'}
                {statusKey === 'inactive' && 'Inativos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Client List */}
      <Card>
        <CardContent className="p-0">
          {filteredClients.length === 0 ? (
            <div className="p-12">
              <EmptyState 
                title="Nenhum cliente encontrado" 
                description="Experimente ajustar a busca ou clique no botão acima para cadastrar um novo cliente."
                actionLabel="Cadastrar Cliente"
                onAction={() => setIsModalOpen(true)}
                icon={<Building2 className="h-6 w-6" />}
              />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa / Razão Social</TableHead>
                      <TableHead>Contato Principal</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Status Comercial</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="font-semibold text-foreground">{client.companyName}</div>
                          <div className="text-xs text-muted-foreground">{client.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-foreground font-medium">{client.name}</div>
                          <div className="text-xs text-muted-foreground">{client.phone}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{client.cnpj}</TableCell>
                        <TableCell>
                          <div className="text-xs font-medium text-foreground">{client.responsibleUser}</div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge type="client" status={client.commercialStatus} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/clientes/${client.id}`}>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5">
                              <Eye className="h-3.5 w-3.5" /> Detalhes
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-border/30 px-4">
                {filteredClients.map((client) => (
                  <div key={client.id} className="py-4 space-y-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-sm text-foreground block">{client.companyName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">CNPJ: {client.cnpj}</span>
                      </div>
                      <StatusBadge type="client" status={client.commercialStatus} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div className="p-2 bg-muted/20 border border-border/40 rounded-lg">
                        <span className="text-[10px] text-muted-foreground block">Contato</span>
                        <strong className="text-foreground text-xs block mt-0.5 truncate">{client.name}</strong>
                      </div>
                      <div className="p-2 bg-muted/20 border border-border/40 rounded-lg">
                        <span className="text-[10px] text-muted-foreground block">Telefone</span>
                        <strong className="text-foreground text-xs block mt-0.5 truncate">{client.phone}</strong>
                      </div>
                      <div className="p-2 bg-muted/20 border border-border/40 rounded-lg col-span-2">
                        <span className="text-[10px] text-muted-foreground block">Email</span>
                        <strong className="text-foreground text-[11px] block mt-0.5 truncate">{client.email}</strong>
                      </div>
                      <div className="p-2 bg-muted/20 border border-border/40 rounded-lg">
                        <span className="text-[10px] text-muted-foreground block">Responsável</span>
                        <strong className="text-foreground text-xs block mt-0.5 truncate">{client.responsibleUser}</strong>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Link href={`/clientes/${client.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full h-8.5 text-xs gap-1.5">
                          <Eye className="h-3.5 w-3.5" /> Detalhes do Cliente
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Register Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Cliente"
        description="Preencha os dados cadastrais. Você pode usar o preenchimento por CNPJ para acelerar."
        size="lg"
      >
        <form onSubmit={handleSaveClient} className="space-y-4 pt-2">
          {!checkLimit('clients') && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg">
              Aviso: O limite de clientes do seu plano foi atingido. Faça o upgrade nas Configurações para continuar.
            </div>
          )}
          {/* CNPJ Field with autofill button */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <Input
                label="CNPJ da Empresa"
                type="text"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                required
              />
            </div>
            <div>
              <Button
                type="button"
                variant="secondary"
                className="w-full flex items-center justify-center gap-1.5 h-10 border border-border"
                onClick={handleCnpjSearch}
                isLoading={isSearchingCnpj}
              >
                <SearchCode className="h-4 w-4 text-primary" /> Consultar CNPJ
              </Button>
            </div>
          </div>

          {cnpjSearchMessage && (
            <p className={`text-xs font-semibold ${cnpjSearchMessage.includes('✅') ? 'text-success' : 'text-danger'}`}>
              {cnpjSearchMessage}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Razão Social / Nome da Empresa"
              type="text"
              placeholder="Razão Social Ltda"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              required
            />
            <Input
              label="Nome do Contato Principal"
              type="text"
              placeholder="Nome do contato comercial"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="E-mail de Contato"
              type="email"
              placeholder="contato@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Telefone / WhatsApp"
              type="text"
              placeholder="(00) 90000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Responsável Interno"
              options={teamOptions}
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
            />
            <Select
              label="Status Comercial"
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
            />
          </div>

          <Textarea
            label="Observações Cadastrais / Endereço Completo"
            placeholder="Informações adicionais..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Gravar Cliente
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
