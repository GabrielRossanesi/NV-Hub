import { isDatabaseDataMode } from '../../lib/data-mode';
import { measureServerTiming } from '../../lib/performance';
import { getClients, getTenantMembers } from './actions';
import ClientesPageClient from './ClientesPageClient';

export default async function ClientesPage() {
  if (!isDatabaseDataMode) {
    return <ClientesPageClient />;
  }

  const [clients, members] = await measureServerTiming('clients/data-total', () =>
    Promise.all([getClients(true), getTenantMembers()]),
  );

  return <ClientesPageClient initialClients={clients} initialMembers={members} />;
}
