'use client';

import React, { useState } from 'react';
import { History, Search, Clock, FileText, FileCheck, CreditCard, FolderOpen, CheckCircle, Info } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { PageHeader as UIHeader } from '../../components/ui/page-header';
import Card, { CardContent } from '../../components/ui/card';
import Select from '../../components/ui/select';
import EmptyState from '../../components/ui/empty-state';

export default function HistoricoPage() {
  const mounted = useMounted();
  const { historyEvents, clients } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('all');

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Filter history events
  const filteredEvents = historyEvents.filter((ev) => {
    const matchesSearch = 
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.clientName && ev.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesClient = clientFilter === 'all' || ev.clientId === clientFilter;

    return matchesSearch && matchesClient;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'client_created':
        return <Info className="h-4 w-4 text-primary" />;
      case 'proposal_created':
      case 'proposal_sent':
        return <FileText className="h-4 w-4 text-info" />;
      case 'proposal_accepted':
      case 'contract_signed':
        return <FileCheck className="h-4 w-4 text-success" />;
      case 'charge_generated':
      case 'charge_paid':
        return <CreditCard className="h-4 w-4 text-success" />;
      case 'drive_created':
      case 'clickup_created':
        return <FolderOpen className="h-4 w-4 text-amber-500" />;
      case 'onboarding_completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const clientOptions = [
    { value: 'all', label: 'Todos os Clientes' },
    ...clients.map(c => ({ value: c.id, label: c.companyName }))
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <UIHeader 
        title="Histórico de Atividades" 
        description="Auditoria global das ações operacionais, financeiras e automações de integração disparadas."
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-card p-4 rounded-xl border border-border/80 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all placeholder:text-muted-foreground/75"
          />
        </div>

        {/* Client Filter */}
        <div className="w-full md:w-64">
          <Select
            options={clientOptions}
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Timeline Audit */}
      <Card>
        <CardContent className="p-6">
          {filteredEvents.length === 0 ? (
            <EmptyState 
              title="Sem atividades localizadas" 
              description="Nenhum evento registrado corresponde aos critérios de pesquisa informados."
              icon={<History className="h-6 w-6" />}
            />
          ) : (
            <div className="relative pl-6 border-l border-border/80 space-y-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="relative group flex items-start gap-4">
                  {/* Bullet Bullet icon wrapper */}
                  <span className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm">
                    {getEventIcon(event.type)}
                  </span>
                  
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {event.title}
                      </span>
                      {event.clientName && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded-full">
                          {event.clientName}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                    
                    <span className="text-[10px] text-muted-foreground/80 block mt-1.5">
                      {new Date(event.createdAt).toLocaleDateString('pt-BR')} às {new Date(event.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
