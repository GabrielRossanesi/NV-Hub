'use client';

import React, { useState } from 'react';
import { Search, Filter, Briefcase, FileSignature, Check, ExternalLink } from 'lucide-react';
import { useTenantStore } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { PageHeader as UIHeader } from '../../components/ui/page-header';
import Button from '../../components/ui/button';
import Card, { CardContent } from '../../components/ui/card';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import StatusBadge from '../../components/ui/status-badge';
import EmptyState from '../../components/ui/empty-state';

export default function ContratosPage() {
  const mounted = useMounted();
  const { contracts, signContractFlow } = useTenantStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Filter contracts
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch = 
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <UIHeader 
        title="Contratos Operacionais" 
        description="Monitore e formalize contratos de prestação de serviços emitidos eletronicamente."
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-card p-4 rounded-xl border border-border/80 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar por cliente, serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all placeholder:text-muted-foreground/75"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
            {['all', 'pending_signatures', 'signed', 'cancelled'].map((statusKey) => (
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
                {statusKey === 'pending_signatures' && 'Aguardando Assinatura'}
                {statusKey === 'signed' && 'Assinados'}
                {statusKey === 'cancelled' && 'Cancelados'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contracts Table List */}
      <Card>
        <CardContent className="p-0">
          {filteredContracts.length === 0 ? (
            <div className="p-12">
              <EmptyState 
                title="Nenhum contrato formalizado" 
                description="Não há contratos registrados sob estes critérios. Contratos são gerados automaticamente quando propostas comerciais são aceitas."
                icon={<Briefcase className="h-6 w-6" />}
              />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente / Empresa</TableHead>
                      <TableHead>Serviço Contratado</TableHead>
                      <TableHead>Mensalidade</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Versão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="font-semibold text-foreground">{c.companyName}</div>
                          <div className="text-xs text-muted-foreground">Contato: {c.clientName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-foreground font-medium truncate max-w-xs" title={c.type}>{c.type}</div>
                          <div className="text-[10px] text-muted-foreground">Primeiro Venc: {new Date(c.firstPaymentDate).toLocaleDateString('pt-BR')}</div>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground text-xs">
                          R$ {c.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(c.startDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{c.version}</TableCell>
                        <TableCell><StatusBadge type="contract" status={c.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* External link to ZapSign Mock */}
                            {c.documentUrl && (
                              <a href={c.documentUrl} target="_blank" rel="noreferrer">
                                <Button variant="outline" size="sm" className="h-8 gap-1" title="Ver Minuta no ZapSign">
                                  Minuta ZapSign <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            )}

                            {/* Sign Simulator */}
                            {c.status === 'pending_signatures' && (
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => signContractFlow(c.id)}
                                className="h-8 gap-1"
                              >
                                <FileSignature className="h-3.5 w-3.5" /> Assinar
                              </Button>
                            )}

                            {c.status === 'signed' && (
                              <span className="text-xs font-semibold text-success flex items-center gap-1">
                                <Check className="h-4 w-4" /> Assinado
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden divide-y divide-border/40">
                {filteredContracts.map((c) => (
                  <div key={c.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-foreground text-sm">{c.companyName}</div>
                        <div className="text-[11px] text-muted-foreground">Contato: {c.clientName}</div>
                      </div>
                      <StatusBadge type="contract" status={c.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 px-2.5 border border-border/40 bg-muted/10 rounded-lg">
                      <div className="col-span-2">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Serviço</span>
                        <span className="font-medium text-foreground truncate block" title={c.type}>{c.type}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Mensalidade</span>
                        <span className="font-semibold text-foreground">
                          R$ {c.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Início</span>
                        <span className="text-muted-foreground">{new Date(c.startDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Primeiro Vencimento</span>
                        <span className="text-muted-foreground">{new Date(c.firstPaymentDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Versão</span>
                        <span className="font-mono text-muted-foreground">{c.version}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {c.documentUrl && (
                        <a href={c.documentUrl} target="_blank" rel="noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="h-8.5 w-full justify-center gap-1 text-[11px]" title="Ver Minuta no ZapSign">
                            Minuta ZapSign <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      )}

                      {c.status === 'pending_signatures' && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => signContractFlow(c.id)}
                          className="h-8.5 flex-1 justify-center gap-1 text-[11px]"
                        >
                          <FileSignature className="h-3.5 w-3.5" /> Assinar
                        </Button>
                      )}

                      {c.status === 'signed' && (
                        <span className="text-xs font-semibold text-success flex items-center justify-center gap-1 flex-1 py-1">
                          <Check className="h-4 w-4" /> Assinado
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
