import { isDatabaseDataMode } from '../../lib/data-mode';
import { measureServerTiming } from '../../lib/performance';
import { getClients } from '../clientes/actions';
import { getTasks, getOrganizationMembers } from './actions';
import TarefasPageClient from './TarefasPageClient';

export default async function TarefasPage() {
  if (!isDatabaseDataMode) {
    return <TarefasPageClient />;
  }

  const [tasks, clients, members] = await measureServerTiming('tasks/data-total', () =>
    Promise.all([getTasks(true), getClients(false), getOrganizationMembers()]),
  );

  return (
    <TarefasPageClient
      initialTasks={tasks}
      initialClients={clients}
      initialMembers={members}
    />
  );
}
