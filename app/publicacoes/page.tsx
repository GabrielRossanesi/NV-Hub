'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Search, Filter, Plus, Check, AlertCircle } from 'lucide-react';
import { useTenantStore } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { PageHeader as UIHeader } from '../../components/ui/page-header';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Textarea from '../../components/ui/textarea';
import Select from '../../components/ui/select';
import Modal from '../../components/ui/modal';
import Card from '../../components/ui/card';
import StatusBadge from '../../components/ui/status-badge';
import EmptyState from '../../components/ui/empty-state';
import DatePicker from '../../components/ui/date-picker';

export default function PublicacoesPage() {
  const mounted = useMounted();
  const { publications, clients, addPublication, updatePublicationStatus, teamMembers } = useTenantStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [selectedClientId, setSelectedClientId] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80');
  const [caption, setCaption] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [responsavel, setResponsavel] = useState('João Santos');

  // Comment state for revisions
  const [pubComments, setPubComments] = useState<Record<string, string>>({});

  // Expanded caption state
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Filtered publications
  const filteredPubs = publications.filter((pub) => {
    const matchesSearch = 
      pub.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.caption.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || pub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreatePublication = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId);
    if (!client || !caption || !scheduledDate) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    addPublication({
      clientId: client.id,
      clientName: client.name,
      companyName: client.companyName,
      imageUrl: imageUrl,
      caption: caption,
      scheduledDate: scheduledDate,
      status: 'pending_approval',
      approvalLink: `https://garoflow.com.br/aprovar/mock_${Date.now()}`,
      responsibleUser: responsavel
    });

    setSelectedClientId('');
    setImageUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80');
    setCaption('');
    setScheduledDate('');
    setResponsavel('João Santos');
    setIsModalOpen(false);
  };

  const clientOptions = clients.map(c => ({ value: c.id, label: c.companyName }));
  const teamOptions = teamMembers.map(m => ({ value: m.name, label: m.name }));



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <UIHeader 
        title="Controle de Publicações" 
        description="Aprove mídias e artes de campanhas e redes sociais dos clientes."
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova Publicação
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
            placeholder="Pesquisar por legenda, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all placeholder:text-muted-foreground/75"
          />
        </div>

        {/* Filter status buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto">
            {['all', 'pending_approval', 'approved', 'changes_requested'].map((statusKey) => (
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
                {statusKey === 'pending_approval' && 'Aguardando Aprovação'}
                {statusKey === 'approved' && 'Aprovadas'}
                {statusKey === 'changes_requested' && 'Alteração Solicitada'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Publications Grid */}
      {filteredPubs.length === 0 ? (
        <Card className="p-12">
          <EmptyState 
            title="Nenhuma publicação encontrada" 
            description="Não existem posts cadastrados sob este status. Crie um novo post para testar."
            icon={<ImageIcon className="h-6 w-6" />}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPubs.map((pub) => (
            <Card key={pub.id} className="overflow-hidden border border-border flex flex-col justify-between hover:shadow-md transition-shadow h-full">
              <div className="flex flex-col flex-1">
                {/* Visual Image Preview */}
                <div className="relative h-48 bg-muted overflow-hidden shrink-0 border-b border-border/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={pub.imageUrl} 
                    alt="Social media post visual creative" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <StatusBadge type="publication" status={pub.status} />
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-sm text-foreground block truncate" title={pub.companyName}>{pub.companyName}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">Contato: {pub.clientName}</span>
                    </div>
                    <div className="text-right text-[10px] text-muted-foreground shrink-0">
                      <span className="block font-medium">Agendamento:</span>
                      <strong className="text-foreground">{new Date(pub.scheduledDate).toLocaleDateString('pt-BR')}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <span className="text-xs font-semibold text-foreground block">Legenda:</span>
                    <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/40 whitespace-pre-wrap leading-relaxed">
                      {expandedCaptions[pub.id] 
                        ? pub.caption 
                        : (pub.caption.length > 120 ? `${pub.caption.slice(0, 120)}...` : pub.caption)
                      }
                      {pub.caption.length > 120 && (
                        <button
                          type="button"
                          onClick={() => setExpandedCaptions({
                            ...expandedCaptions,
                            [pub.id]: !expandedCaptions[pub.id]
                          })}
                          className="text-primary hover:text-primary/80 font-bold block mt-1 focus:outline-none hover:underline cursor-pointer"
                        >
                          {expandedCaptions[pub.id] ? 'Ver menos' : 'Ver mais'}
                        </button>
                      )}
                    </div>
                  </div>

                  {pub.clientComments && (
                    <div className="p-3 bg-danger/5 border border-danger/20 rounded-lg space-y-1 text-xs mt-auto">
                      <span className="font-semibold text-danger block flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Ajustes Solicitados:
                      </span>
                      <p className="text-muted-foreground leading-relaxed italic">
                        &ldquo;{pub.clientComments}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval controls */}
              <div className="p-4 border-t border-border/40 bg-muted/10">
                {pub.status === 'pending_approval' || pub.status === 'ready_for_approval' || pub.status === 'sent_to_client' ? (
                  <div className="space-y-3.5">
                    <Textarea
                      placeholder="Feedback de alteração (obrigatório se for recusar)..."
                      value={pubComments[pub.id] || ''}
                      onChange={(e) => setPubComments({ ...pubComments, [pub.id]: e.target.value })}
                      rows={2}
                      className="text-xs bg-background"
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        size="sm" 
                        className="w-full sm:flex-1 text-xs h-8.5 gap-1.5 justify-center"
                        onClick={() => updatePublicationStatus(pub.id, 'approved')}
                      >
                        <Check className="h-3.5 w-3.5" /> Aprovar Post
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger" 
                        className="w-full sm:flex-1 text-xs h-8.5 gap-1.5 justify-center"
                        onClick={() => {
                          if (!pubComments[pub.id]) {
                            alert('Informe o ajuste necessário no campo de texto.');
                            return;
                          }
                          updatePublicationStatus(pub.id, 'changes_requested', pubComments[pub.id]);
                          setPubComments({ ...pubComments, [pub.id]: '' });
                        }}
                      >
                        <AlertCircle className="h-3.5 w-3.5" /> Solicitar Ajuste
                      </Button>
                    </div>
                  </div>
                ) : pub.status === 'approved' ? (
                  <div className="text-xs text-success font-semibold flex items-center gap-1.5 justify-center py-1 bg-success/5 border border-success/15 rounded-lg text-center">
                    <Check className="h-4 w-4 shrink-0" /> Publicação Aprovada! Pronta para agendamento.
                  </div>
                ) : pub.status === 'changes_requested' ? (
                  <div className="text-xs text-danger font-semibold flex items-center gap-1.5 justify-center py-1 bg-danger/5 border border-danger/15 rounded-lg text-center">
                    <AlertCircle className="h-4 w-4 shrink-0" /> Ajustes criativos solicitados ao designer.
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

      {/* Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Nova Publicação"
        description="Crie um novo post de teste para aprovação do cliente."
      >
        <form onSubmit={handleCreatePublication} className="space-y-4 pt-2">
          <Select
            label="Selecione o Cliente"
            placeholder="Escolha um cliente..."
            options={clientOptions}
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            required
          />

          <Input
            label="URL da Imagem de Destaque"
            type="url"
            placeholder="Link de imagem..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Previsão de Postagem"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
            <Select
              label="Designer / Responsável"
              options={teamOptions}
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
            />
          </div>

          <Textarea
            label="Legenda do Post (Copywriting)"
            placeholder="Texto que acompanhará o criativo..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Publicação
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
