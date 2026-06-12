'use client';

import React from 'react';
import { Settings, RefreshCw, Key, ShieldCheck, Database } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { PageHeader as UIHeader } from '../../components/ui/page-header';
import Button from '../../components/ui/button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import Input from '../../components/ui/input';

export default function ConfiguracoesPage() {
  const mounted = useMounted();
  const { resetState } = useStore();

  const handleReset = () => {
    const confirm = window.confirm('Deseja realmente restaurar todos os dados simulados aos valores originais do MVP? Suas alterações serão perdidas.');
    if (confirm) {
      resetState();
      alert('Dados resetados com sucesso! O painel será recarregado.');
      window.location.reload();
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
        description="Ajuste credenciais de integrações mockadas, visualize endpoints de webhook e gerencie dados do sistema."
      />

      <Tabs defaultValue="integracoes">
        <TabsList>
          <TabsTrigger value="integracoes"><Key className="h-3.5 w-3.5 mr-1.5" /> Integrações &amp; APIs</TabsTrigger>
          <TabsTrigger value="sistema"><Database className="h-3.5 w-3.5 mr-1.5" /> Manutenção &amp; Reset</TabsTrigger>
        </TabsList>

        {/* Tab 1: Mock Credentials config */}
        <TabsContent value="integracoes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asaas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" /> Asaas (Financeiro)
                </CardTitle>
                <CardDescription>Configuração de emissão de cobranças automáticas via API.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="API Token Asaas"
                  type="password"
                  value="$asaas_live_token_738472938491028394"
                  disabled
                />
                <Input
                  label="Webhook Token (Compensação)"
                  type="text"
                  value="wh_token_asaas_sec_8392849"
                  disabled
                />
                <div className="text-[11px] text-muted-foreground leading-relaxed p-3 bg-muted/40 rounded-lg border border-border/40">
                  <strong className="text-foreground">Fluxo Simulado:</strong> Quando uma cobrança expira ou é paga no Asaas, nosso webhook é acionado, liberando o onboarding.
                </div>
              </CardContent>
            </Card>

            {/* ClickUp */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" /> ClickUp (Operacional)
                </CardTitle>
                <CardDescription>Automação de criação de tarefas e workspaces de novos clientes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="ClickUp Personal Token"
                  type="password"
                  value="pk_48392_4728347293847239"
                  disabled
                />
                <Input
                  label="Workspace ID Padrão"
                  type="text"
                  value="90038472"
                  disabled
                />
                <div className="text-[11px] text-muted-foreground leading-relaxed p-3 bg-muted/40 rounded-lg border border-border/40">
                  <strong className="text-foreground">Fluxo Simulado:</strong> Ao identificar o pagamento confirmado, o sistema cria pastas, listas e tarefas operacionais via API ClickUp.
                </div>
              </CardContent>
            </Card>

            {/* ZapSign */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" /> ZapSign (Contratos)
                </CardTitle>
                <CardDescription>Integração de assinatura de documentos digitais.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="ZapSign API Key"
                  type="password"
                  value="api_key_zapsign_live_83928492"
                  disabled
                />
                <div className="text-[11px] text-muted-foreground leading-relaxed p-3 bg-muted/40 rounded-lg border border-border/40">
                  <strong className="text-foreground">Fluxo Simulado:</strong> Ao aprovar uma proposta, a ZapSign gera o link da assinatura digital do contrato.
                </div>
              </CardContent>
            </Card>

            {/* Google Drive */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" /> Google Drive &amp; Docs
                </CardTitle>
                <CardDescription>Integração de armazenamento em nuvem e documentos de revisão.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Google Service Account JSON Key"
                  type="password"
                  value="google-key-service-account-placeholder"
                  disabled
                />
                <Input
                  label="Pasta Raiz do Drive ID"
                  type="text"
                  value="drive_root_folder_id_98293489234"
                  disabled
                />
                <div className="text-[11px] text-muted-foreground leading-relaxed p-3 bg-muted/40 rounded-lg border border-border/40">
                  <strong className="text-foreground">Fluxo Simulado:</strong> Criação de pastas de arquivos de mídia dos clientes organizados de forma automática no Google Drive.
                </div>
              </CardContent>
            </Card>
          </div>
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
