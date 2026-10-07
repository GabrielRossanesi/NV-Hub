// Server Component: resolve o modo de dados e busca os dados iniciais no servidor
// (modo database) num único passo de render, eliminando o waterfall de fetch
// client-side que causava o delay de 1-2s e o flash de estado vazio.

import { isDatabaseDataMode } from '../../lib/data-mode';
import { getClients, getTenantMembers } from '../clientes/actions';
import { getRealPublications } from './actions';
import PublicacoesPageClient from './PublicacoesPageClient';
import PublicacoesSandboxClient from './PublicacoesSandboxClient';
import { measureServerTiming } from '../../lib/performance';
import { plannerDate } from '../../lib/planner';
import { getCurrentDatabaseTenantContext } from '../../lib/tenant-context-actions';

export default async function PublicacoesPage({ searchParams }: { searchParams: Promise<{ publicacao?: string | string[]; data?: string | string[]; nova?: string | string[] }> }) {
  const params = await searchParams;
  const plannerIntent = {
    publicationId: typeof params.publicacao === 'string' ? params.publicacao : undefined,
    date: typeof params.data === 'string' ? plannerDate(params.data) : undefined,
    create: params.nova === '1',
  };
  if (!isDatabaseDataMode) {
    // Demo: dados vêm do store Zustand no cliente.
    return <PublicacoesSandboxClient plannerIntent={plannerIntent} />;
  }

  // Produção: uma única resolução de sessão/tenant (memoizada) alimenta as três
  // buscas em paralelo, entregues como props prontas ao componente cliente.
  const context = await getCurrentDatabaseTenantContext();
  const [clients, members, publications] = await measureServerTiming(
    'publications/data-total',
    () => Promise.all([
      getClients(false),
      getTenantMembers(),
      getRealPublications(),
    ]),
  );

  return (
    <PublicacoesPageClient
      plannerIntent={plannerIntent}
      plannerEnabled={context?.features.tasks === true}
      initialClients={clients}
      initialMembers={members}
      initialPublications={publications}
    />
  );
}
