import { isDatabaseDataMode } from '../../lib/data-mode';
import { measureServerTiming } from '../../lib/performance';
import { getClients } from '../clientes/actions';
import { getTasks, getOrganizationMembers } from './actions';
import TarefasPageClient from './TarefasPageClient';
import { getPlannerPublications } from '../publicacoes/actions';
import { getCurrentDatabaseTenantContext } from '../../lib/tenant-context-actions';
import './planner.css';

export default async function TarefasPage() {
  if (!isDatabaseDataMode) {
    return <TarefasPageClient />;
  }

  const context = await getCurrentDatabaseTenantContext();
  const publicationsEnabled = context?.features.publications === true;
  const [tasks, clients, members, publicationSource] = await measureServerTiming('tasks/data-total', () =>
    Promise.all([getTasks(true), getClients(false), getOrganizationMembers(), publicationsEnabled ? getPlannerPublications() : Promise.resolve({ publications: [], error: null })]),
  );

  return (
    <TarefasPageClient
      initialTasks={tasks}
      initialClients={clients}
      initialMembers={members}
      initialPublications={publicationSource.publications}
      initialPublicationsError={publicationSource.error}
      publicationsEnabled={publicationsEnabled}
    />
  );
}
