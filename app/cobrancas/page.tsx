'use client';

import React, { useState } from 'react';
import { Search, Filter, CreditCard, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { PageHeader as UIHeader } from '../../components/ui/page-header';
import Button from '../../components/ui/button';
import Card, { CardContent } from '../../components/ui/card';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import StatusBadge from '../../components/ui/status-badge';
import EmptyState from '../../components/ui/empty-state';

export default function CobrancasPage() {
  const mounted = useMounted();
  const { charges, confirmPaymentFlow } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Filter charges
  const filteredCharges = charges.filter((ch) => {
    const matchesSearch = 
      ch.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || ch.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <UIHeader 
        title="Controle de Cobranças (Asaas)" 
        description="Acompanhe o faturamento, compensações e envie notificações de pagamento pendente."
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-card p-4 rounded-xl border border-border/80 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar por cliente, método..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all placeholder:text-muted-foreground/75"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
            {['all', 'pending', 'paid', 'overdue'].map((statusKey) => (
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
                {statusKey === 'pending' && 'Aguardando Pagamento'}
                {statusKey === 'paid' && 'Pagas'}
                {statusKey === 'overdue' && 'Vencidas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charges Table List */}
      <Card>
        <CardContent className="p-0">
          {filteredCharges.length === 0 ? (
            <div className="p-12">
              <EmptyState 
                title="Nenhuma fatura localizada" 
                description="Não há cobranças geradas sob estes critérios. Faturas recorrentes ou avulsas são emitidas a partir do faturamento de contratos ativos."
                icon={<CreditCard className="h-6 w-6" />}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura Ref / Cliente</TableHead>
                  <TableHead>Valor Emitido</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status Pagamento</TableHead>
                  <TableHead>Data Compensação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCharges.map((ch) => (
                  <TableRow key={ch.id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">{ch.companyName}</div>
                      <div className="text-xs text-muted-foreground font-mono">ID Asaas: {ch.id}</div>
                    </TableCell>
                    <TableCell className="font-bold text-foreground text-sm">
                      R$ {ch.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(ch.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-xs font-medium uppercase text-foreground">{ch.paymentMethod}</TableCell>
                    <TableCell><StatusBadge type="charge" status={ch.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {ch.paidAt ? (
                        <span className="font-medium text-foreground">{new Date(ch.paidAt).toLocaleDateString('pt-BR')} às {new Date(ch.paidAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
                      ) : (
                        <span className="italic text-muted-foreground/60">Aguardando</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* External link to Asaas Mock Invoice */}
                        {ch.paymentUrl && (
                          <a href={ch.paymentUrl} target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm" className="h-8 gap-1" title="Visualizar Fatura no Asaas">
                              Fatura Asaas <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        )}

                        {/* Pay Simulator */}
                        {ch.status === 'pending' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => confirmPaymentFlow(ch.id)}
                            className="h-8 gap-1 border border-border"
                          >
                            <AlertCircle className="h-3.5 w-3.5 text-primary" /> Compensar Pago
                          </Button>
                        )}

                        {ch.status === 'paid' && (
                          <span className="text-xs font-semibold text-success flex items-center gap-1">
                            <Check className="h-4 w-4" /> Pago
                          </span>
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
    </div>
  );
}
