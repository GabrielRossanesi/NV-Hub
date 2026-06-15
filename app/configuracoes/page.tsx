'use client';

import React, { useState } from 'react';
import { RefreshCw, Key, ShieldCheck, Database, Check, Save, CreditCard, Activity } from 'lucide-react';
import { useTenantStore } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { PageHeader as UIHeader } from '../../components/ui/page-header';
import Button from '../../components/ui/button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import Input from '../../components/ui/input';
import Badge from '../../components/ui/badge';
import { IntegrationStatus } from '../../types';

export default function ConfiguracoesPage() {
  const mounted = useMounted();
  const { 
    resetState, 
    currentOrganization, 
    upgradePlan, 
    clients, 
    proposals, 
    tasks, 
    teamMembers,
    currentIntegration,
    updateIntegration,
    testIntegrationConnection
  } = useTenantStore();

  // Local form states initialized directly from the tenant store integration configurations.
  // Using key={currentOrganization.id} on the tab content resets the states automatically on tenant change.
  const [asaasToken, setAsaasToken] = useState(currentIntegration?.asaasToken || '');
  const [asaasWebhook, setAsaasWebhook] = useState(currentIntegration?.asaasWebhook || '');
  const [clickupToken, setClickupToken] = useState(currentIntegration?.clickupToken || '');
  const [clickupWorkspace, setClickupWorkspace] = useState(currentIntegration?.clickupWorkspace || '');
  const [zapsignKey, setZapsignKey] = useState(currentIntegration?.zapsignKey || '');
  const [googleKey, setGoogleKey] = useState(currentIntegration?.googleKey || '');
  const [googleFolder, setGoogleFolder] = useState(currentIntegration?.googleFolder || '');
  const [whatsappToken, setWhatsappToken] = useState(currentIntegration?.whatsappToken || '');
  const [metaAdsToken, setMetaAdsToken] = useState(currentIntegration?.metaAdsToken || '');
  const [googleAdsToken, setGoogleAdsToken] = useState(currentIntegration?.googleAdsToken || '');

  // Saving and testing connection feedback states
  const [saveStates, setSaveStates] = useState<Record<string, boolean>>({});
  const [testStates, setTestStates] = useState<Record<string, 'idle' | 'testing' | 'success'>>({});

  const handleSave = (service: string) => {
    const targetOrgId = currentOrganization?.id || 'org_hub_power'; // Capture organization ID explicitly to prevent cross-tenant leak
    let data = {};
    
    if (service === 'asaas') {
      data = { asaasToken, asaasWebhook };
    } else if (service === 'clickup') {
      data = { clickupToken, clickupWorkspace };
    } else if (service === 'googleDrive') {
      data = { googleKey, googleFolder };
    } else if (service === 'googleDocs') {
      data = { googleKey }; // Shares same authentication JSON
    } else if (service === 'zapsign') {
      data = { zapsignKey };
    } else if (service === 'whatsapp') {
      data = { whatsappToken };
    } else if (service === 'metaAds') {
      data = { metaAdsToken };
    } else if (service === 'googleAds') {
      data = { googleAdsToken };
    }

    updateIntegration(targetOrgId, data);
    setSaveStates(prev => ({ ...prev, [service]: true }));
    setTimeout(() => {
      setSaveStates(prev => ({ ...prev, [service]: false }));
    }, 2000);
  };

  const handleTestConnection = (service: string) => {
    const targetOrgId = currentOrganization?.id || 'org_hub_power'; // Capture organization ID explicitly to prevent cross-tenant leak
    const storeService = service === 'googleDocs' ? 'googleDrive' : service;
    
    setTestStates(prev => ({ ...prev, [service]: 'testing' }));
    
    setTimeout(() => {
      testIntegrationConnection(targetOrgId, storeService);
      setTestStates(prev => ({ ...prev, [service]: 'success' }));
      setTimeout(() => {
        setTestStates(prev => ({ ...prev, [service]: 'idle' }));
      }, 3000);
    }, 1000);
  };

  const handleReset = () => {
    const confirm = window.confirm('Deseja realmente restaurar todos os dados simulados aos valores originais do MVP? Suas alterações serão perdidas.');
    if (confirm) {
      resetState();
      alert('Dados resetados com sucesso! O painel será recarregado.');
      window.location.reload();
    }
  };

  const getBadgeVariant = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected': return 'success';
      case 'sandbox': return 'info';
      case 'not_connected': return 'muted';
      case 'error': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'sandbox': return 'Sandbox';
      case 'not_connected': return 'Não Conectado';
      case 'error': return 'Erro';
      case 'pending': return 'Pendente';
      default: return status || 'Não Conectado';
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <UIHeader 
        title="Configurações do Sistema" 
        description={`Gerencie credenciais de integrações, tokens de APIs e o faturamento para a empresa ${currentOrganization?.name || 'Organização não encontrada'}.`}
      />

      {/* Active Organization Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-muted/40 rounded-lg border border-border/40 gap-2 text-xs">
        <span className="text-muted-foreground font-medium">
          Configurações da organização ativa: <strong className="text-foreground">{currentOrganization?.name || 'Organização não encontrada'}</strong>
        </span>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-[10px] font-bold uppercase tracking-wider">
            Plano {String(currentOrganization?.planId ?? 'sem plano').toUpperCase()}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">
            ID: {currentOrganization?.id || 'N/A'}
          </span>
        </div>
      </div>

      <Tabs defaultValue="integracoes">
        <TabsList>
          <TabsTrigger value="integracoes"><Key className="h-3.5 w-3.5 mr-1.5" /> Integrações &amp; APIs</TabsTrigger>
          <TabsTrigger value="assinatura"><CreditCard className="h-3.5 w-3.5 mr-1.5" /> Plano &amp; Faturamento</TabsTrigger>
          <TabsTrigger value="sistema"><Database className="h-3.5 w-3.5 mr-1.5" /> Manutenção &amp; Reset</TabsTrigger>
        </TabsList>

        {/* Tab 1: Mock Credentials config */}
        <TabsContent key={currentOrganization?.id || 'default'} value="integracoes" className="space-y-6">
          
          {/* Sandbox Warning Banner */}
          <div className="p-4 bg-info/10 border border-info/20 text-info rounded-lg leading-relaxed flex flex-col md:flex-row items-start md:items-center gap-3">
            <ShieldCheck className="h-6 w-6 shrink-0 text-info mt-0.5 md:mt-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wider">Simulação Operacional Ativa</p>
              <p className="text-xs">
                Modo Simulado / Sandbox Ativo. As integrações exibidas nesta versão são simulações funcionais por organização. Nenhuma API real está conectada neste ambiente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Asaas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-bold">Asaas (Financeiro)</CardTitle>
                  <CardDescription>Cobranças automáticas via PIX, Boleto e Cartão (Simulação/Sandbox).</CardDescription>
                </div>
                <Badge variant={getBadgeVariant(currentIntegration?.asaasStatus || 'not_connected')}>
                  {getStatusLabel(currentIntegration?.asaasStatus || 'not_connected')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <Input
                  label="API Token Asaas"
                  type="password"
                  placeholder="Tokens iniciam com $asaas_"
                  value={asaasToken}
                  onChange={(e) => setAsaasToken(e.target.value)}
                />
                <Input
                  label="Webhook Token (Segurança)"
                  type="password"
                  placeholder="Token do Webhook recebido do Asaas"
                  value={asaasWebhook}
                  onChange={(e) => setAsaasWebhook(e.target.value)}
                />
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground">
                    {testStates['asaas'] === 'testing' && <span className="text-info animate-pulse">Testando conexão...</span>}
                    {testStates['asaas'] === 'success' && <span className="text-success font-semibold">Conexão de sandbox estabelecida!</span>}
                    {saveStates['asaas'] && <span className="text-success font-semibold">Salvo com sucesso!</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestConnection('asaas')}
                      disabled={testStates['asaas'] === 'testing'}
                    >
                      <Activity className="h-3.5 w-3.5 mr-1" /> Testar Conexão
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleSave('asaas')}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. ClickUp */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-bold">ClickUp (Operações)</CardTitle>
                  <CardDescription>Criação de projetos e tarefas de onboarding (Simulação/Sandbox).</CardDescription>
                </div>
                <Badge variant={getBadgeVariant(currentIntegration?.clickupStatus || 'not_connected')}>
                  {getStatusLabel(currentIntegration?.clickupStatus || 'not_connected')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <Input
                  label="Personal Token ClickUp"
                  type="password"
                  placeholder="Ex: pk_48392_..."
                  value={clickupToken}
                  onChange={(e) => setClickupToken(e.target.value)}
                />
                <Input
                  label="Workspace ID Padrão"
                  type="password"
                  placeholder="ID da Workspace operacional no ClickUp"
                  value={clickupWorkspace}
                  onChange={(e) => setClickupWorkspace(e.target.value)}
                />
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground">
                    {testStates['clickup'] === 'testing' && <span className="text-info animate-pulse">Testando conexão...</span>}
                    {testStates['clickup'] === 'success' && <span className="text-success font-semibold">Conexão de sandbox estabelecida!</span>}
                    {saveStates['clickup'] && <span className="text-success font-semibold">Salvo com sucesso!</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestConnection('clickup')}
                      disabled={testStates['clickup'] === 'testing'}
                    >
                      <Activity className="h-3.5 w-3.5 mr-1" /> Testar Conexão
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleSave('clickup')}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Google Drive */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-bold">Google Drive (Arquivos)</CardTitle>
                  <CardDescription>Criação de pastas de entrega de mídia (Simulação/Sandbox).</CardDescription>
                </div>
                <Badge variant={getBadgeVariant(currentIntegration?.googleDriveStatus || 'not_connected')}>
                  {getStatusLabel(currentIntegration?.googleDriveStatus || 'not_connected')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <Input
                  label="JSON Key de Service Account"
                  type="password"
                  placeholder="Conteúdo JSON da chave do Google Cloud Console"
                  value={googleKey}
                  onChange={(e) => setGoogleKey(e.target.value)}
                />
                <Input
                  label="ID da Pasta Raiz"
                  type="password"
                  placeholder="ID da pasta compartilhada no Drive"
                  value={googleFolder}
                  onChange={(e) => setGoogleFolder(e.target.value)}
                />
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground">
                    {testStates['googleDrive'] === 'testing' && <span className="text-info animate-pulse">Testando conexão...</span>}
                    {testStates['googleDrive'] === 'success' && <span className="text-success font-semibold">Conexão de sandbox estabelecida!</span>}
                    {saveStates['googleDrive'] && <span className="text-success font-semibold">Salvo com sucesso!</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestConnection('googleDrive')}
                      disabled={testStates['googleDrive'] === 'testing'}
                    >
                      <Activity className="h-3.5 w-3.5 mr-1" /> Testar Conexão
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleSave('googleDrive')}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Google Docs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-bold">Google Docs (Documentos)</CardTitle>
                  <CardDescription>Geração de briefings e relatórios (Simulação/Sandbox).</CardDescription>
                </div>
                {/* Google Docs shares credentials with Google Drive */}
                <Badge variant={getBadgeVariant(currentIntegration?.googleDriveStatus || 'not_connected')}>
                  {getStatusLabel(currentIntegration?.googleDriveStatus || 'not_connected')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <Input
                  label="JSON Key de Service Account (Google Docs API)"
                  type="password"
                  placeholder="Geralmente o mesmo JSON do Google Drive"
                  value={googleKey}
                  onChange={(e) => setGoogleKey(e.target.value)}
                />
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground">
                    {testStates['googleDocs'] === 'testing' && <span className="text-info animate-pulse">Testando Docs...</span>}
                    {testStates['googleDocs'] === 'success' && <span className="text-success font-semibold">Conexão de sandbox estabelecida!</span>}
                    {saveStates['googleDocs'] && <span className="text-success font-semibold">Salvo com sucesso!</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestConnection('googleDocs')}
                      disabled={testStates['googleDocs'] === 'testing'}
                    >
                      <Activity className="h-3.5 w-3.5 mr-1" /> Testar Conexão
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleSave('googleDocs')}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. ZapSign */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-bold">ZapSign (Contratos)</CardTitle>
                  <CardDescription>Geração e assinatura digital de contratos (Simulação/Sandbox).</CardDescription>
                </div>
                <Badge variant={getBadgeVariant(currentIntegration?.zapsignStatus || 'not_connected')}>
                  {getStatusLabel(currentIntegration?.zapsignStatus || 'not_connected')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <Input
                  label="API Key ZapSign"
                  type="password"
                  placeholder="Ex: api_key_zapsign_..."
                  value={zapsignKey}
                  onChange={(e) => setZapsignKey(e.target.value)}
                />
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground">
                    {testStates['zapsign'] === 'testing' && <span className="text-info animate-pulse">Testando ZapSign...</span>}
                    {testStates['zapsign'] === 'success' && <span className="text-success font-semibold">Conexão de sandbox estabelecida!</span>}
                    {saveStates['zapsign'] && <span className="text-success font-semibold">Salvo com sucesso!</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestConnection('zapsign')}
                      disabled={testStates['zapsign'] === 'testing'}
                    >
                      <Activity className="h-3.5 w-3.5 mr-1" /> Testar Conexão
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleSave('zapsign')}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6. WhatsApp */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-bold">WhatsApp Business (Notificação)</CardTitle>
                  <CardDescription>Envio de faturas e links de onboarding (Simulação/Sandbox).</CardDescription>
                </div>
                <Badge variant={getBadgeVariant(currentIntegration?.whatsappStatus || 'not_connected')}>
                  {getStatusLabel(currentIntegration?.whatsappStatus || 'not_connected')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <Input
                  label="WhatsApp API Access Token"
                  type="password"
                  placeholder="Ex: EAA..."
                  value={whatsappToken}
                  onChange={(e) => setWhatsappToken(e.target.value)}
                />
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground">
                    {testStates['whatsapp'] === 'testing' && <span className="text-info animate-pulse">Testando WhatsApp...</span>}
                    {testStates['whatsapp'] === 'success' && <span className="text-success font-semibold">Conexão de sandbox estabelecida!</span>}
                    {saveStates['whatsapp'] && <span className="text-success font-semibold">Salvo com sucesso!</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestConnection('whatsapp')}
                      disabled={testStates['whatsapp'] === 'testing'}
                    >
                      <Activity className="h-3.5 w-3.5 mr-1" /> Testar Conexão
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleSave('whatsapp')}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7. Meta Ads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-bold">Meta Ads (Instagram / Facebook)</CardTitle>
                  <CardDescription>Mockado para a Central de Leads. Nenhuma API real conectada nesta versão Sandbox.</CardDescription>
                </div>
                <Badge variant={getBadgeVariant(currentIntegration?.metaAdsStatus || 'not_connected')}>
                  {getStatusLabel(currentIntegration?.metaAdsStatus || 'not_connected')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <Input
                  label="Meta Graph API Access Token"
                  type="password"
                  placeholder="User ou Page Access Token de longa duração"
                  value={metaAdsToken}
                  onChange={(e) => setMetaAdsToken(e.target.value)}
                />
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground">
                    {testStates['metaAds'] === 'testing' && <span className="text-info animate-pulse">Testando Meta API...</span>}
                    {testStates['metaAds'] === 'success' && <span className="text-success font-semibold">Conexão de sandbox estabelecida!</span>}
                    {saveStates['metaAds'] && <span className="text-success font-semibold">Salvo com sucesso!</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestConnection('metaAds')}
                      disabled={testStates['metaAds'] === 'testing'}
                    >
                      <Activity className="h-3.5 w-3.5 mr-1" /> Testar Conexão
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleSave('metaAds')}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 8. Google Ads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base font-bold">Google Ads (Leads / Pesquisa)</CardTitle>
                  <CardDescription>Mockado para a Central de Leads. Nenhuma API real conectada nesta versão Sandbox.</CardDescription>
                </div>
                <Badge variant={getBadgeVariant(currentIntegration?.googleAdsStatus || 'not_connected')}>
                  {getStatusLabel(currentIntegration?.googleAdsStatus || 'not_connected')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <Input
                  label="Google Ads Developer Token"
                  type="password"
                  placeholder="Developer Token obtido no Google Ads Manager"
                  value={googleAdsToken}
                  onChange={(e) => setGoogleAdsToken(e.target.value)}
                />
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground">
                    {testStates['googleAds'] === 'testing' && <span className="text-info animate-pulse">Testando Google API...</span>}
                    {testStates['googleAds'] === 'success' && <span className="text-success font-semibold">Conexão de sandbox estabelecida!</span>}
                    {saveStates['googleAds'] && <span className="text-success font-semibold">Salvo com sucesso!</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestConnection('googleAds')}
                      disabled={testStates['googleAds'] === 'testing'}
                    >
                      <Activity className="h-3.5 w-3.5 mr-1" /> Testar Conexão
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleSave('googleAds')}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Tab 3: Subscription & Billing */}
        <TabsContent value="assinatura" className="space-y-6">
          {(() => {
            const planId = currentOrganization?.planId || 'starter';
            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Usage Summary Card */}
                <Card className="lg:col-span-1 border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                      <CreditCard className="h-4.5 w-4.5 text-primary" /> Seu Plano Atual: <span className="text-primary uppercase font-extrabold">{planId}</span>
                    </CardTitle>
                    <CardDescription>Consumo de limites e recursos contratados no plano.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 text-xs">
                    {/* Client Limit */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span className="text-muted-foreground">Clientes Cadastrados</span>
                        <span className="text-foreground">{clients.length} / {planId === 'starter' ? '3' : planId === 'pro' ? '30' : 'Ilimitado'}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (clients.length / (planId === 'starter' ? 3 : planId === 'pro' ? 30 : 9999)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Proposals Limit */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span className="text-muted-foreground">Propostas Comerciais</span>
                        <span className="text-foreground">{proposals.length} / {planId === 'starter' ? '5' : planId === 'pro' ? '50' : 'Ilimitado'}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (proposals.length / (planId === 'starter' ? 5 : planId === 'pro' ? 50 : 9999)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Tasks Limit */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span className="text-muted-foreground">Tarefas Operacionais</span>
                        <span className="text-foreground">{tasks.length} / {planId === 'starter' ? '10' : 'Ilimitado'}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (tasks.length / (planId === 'starter' ? 10 : 9999)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Users Limit */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span className="text-muted-foreground">Usuários da Equipe</span>
                        <span className="text-foreground">{teamMembers.length} / {planId === 'starter' ? '2' : planId === 'pro' ? '5' : 'Ilimitado'}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (teamMembers.length / (planId === 'starter' ? 2 : planId === 'pro' ? 5 : 9999)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Integrations Premium Status */}
                    <div className="pt-2 border-t border-border/40 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-semibold">Acesso a Integrações:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${planId === 'starter' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
                        {planId === 'starter' ? 'Bloqueado' : 'Liberado'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Upgrade Comparison Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Starter Card */}
                  <div className={`p-5 rounded-xl border flex flex-col justify-between ${planId === 'starter' ? 'bg-muted/30 border-primary' : 'bg-card border-border'}`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-sm text-foreground">Plano Starter</h3>
                        {planId === 'starter' && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">Ativo</span>}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">R$ 149</span>
                        <span className="text-xs text-muted-foreground">/mês</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">Ideal para freelancers ou agências no início que precisam de controle essencial de escopos.</p>
                      <ul className="text-[10px] text-muted-foreground space-y-1.5 pt-2 border-t border-border/40">
                        <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Máximo 3 Clientes</li>
                        <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Máximo 5 Propostas</li>
                        <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Máximo 10 Tarefas</li>
                        <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> 2 Usuários na Equipe</li>
                      </ul>
                    </div>
                    {planId !== 'starter' && (
                      <Button 
                        variant="outline" 
                        className="w-full text-xs font-bold h-9 mt-4"
                        onClick={() => {
                          upgradePlan('starter');
                          alert('Upgrade simulado: Plano alterado para Starter com sucesso! 🚀');
                        }}
                      >
                        Downgrade para Starter
                      </Button>
                    )}
                  </div>

                  {/* Pro Card */}
                  <div className={`p-5 rounded-xl border flex flex-col justify-between ${planId === 'pro' ? 'bg-muted/30 border-primary shadow-sm' : 'bg-card border-border'}`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-sm text-foreground">Plano Pro</h3>
                        {planId === 'pro' && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">Ativo</span>}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">R$ 399</span>
                        <span className="text-xs text-muted-foreground">/mês</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">Para agências consolidadas que querem automatizar seu onboarding e controle completo de tarefas.</p>
                      <ul className="text-[10px] text-muted-foreground space-y-1.5 pt-2 border-t border-border/40">
                        <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Máximo 30 Clientes</li>
                        <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Máximo 50 Propostas</li>
                        <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Tarefas Operacionais Ilimitadas</li>
                        <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> 5 Usuários na Equipe</li>
                        <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Acesso a Integrações Integradas</li>
                      </ul>
                    </div>
                    {planId !== 'pro' && (
                      <Button 
                        variant="primary" 
                        className="w-full text-xs font-bold h-9 mt-4"
                        onClick={() => {
                          upgradePlan('pro');
                          alert('Upgrade simulado: Plano alterado para Pro com sucesso! 🚀');
                        }}
                      >
                        Simular Upgrade para Pro
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* Tab 2: Reset database */}
        <TabsContent value="sistema">
          <Card className="border border-danger/20 bg-danger/5">
            <CardHeader>
              <CardTitle className="text-base font-bold text-danger flex items-center gap-2">
                <Database className="h-4.5 w-4.5" /> Área de Manutenção de Dados
              </CardTitle>
              <CardDescription>Restaure a base de dados mockada ao estado inicial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-start gap-2.5 text-danger font-medium">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <p className="leading-relaxed">
                  Atenção: Ao restaurar os dados, todas as propostas aceitas, faturas compensadas e tarefas criadas durante a sessão de testes atual serão deletadas e substituídas pela massa de dados mockados inicial.
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  variant="danger" 
                  onClick={handleReset}
                  className="flex items-center gap-2 h-10"
                >
                  <RefreshCw className="h-4 w-4" /> Restaurar Banco de Dados Simulados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

