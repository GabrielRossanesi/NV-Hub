import type { Publication, TeamTask } from '../types';

export type PlannerItem = {
  id: string;
  kind: 'task' | 'publication';
  title: string;
  date: string;
  clientId: string;
  clientName: string;
  responsibleUser: string;
  status: string;
  done: boolean;
  task?: TeamTask;
  publication?: Publication;
};

// Operational deadlines are date-only values. Never parse them as UTC instants.
export function plannerDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
  if (!match) return '';
  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return parsed.getFullYear() === Number(year) && parsed.getMonth() === Number(month) - 1 && parsed.getDate() === Number(day)
    ? `${year}-${month}-${day}` : '';
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function moveDate(key: string, days: number): string {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export function weekDates(key: string): string[] {
  const offset = (dateFromKey(key).getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, index) => moveDate(key, index - offset));
}

export function monthDates(key: string): string[] {
  const date = dateFromKey(key);
  const first = dateKey(new Date(date.getFullYear(), date.getMonth(), 1));
  const start = weekDates(first)[0];
  const last = dateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  const length = weekDates(last)[6] === moveDate(start, 27) ? 28
    : weekDates(last)[6] === moveDate(start, 34) ? 35 : 42;
  return Array.from({ length }, (_, index) => moveDate(start, index));
}

export function plannerItems(tasks: TeamTask[], publications: Publication[]): PlannerItem[] {
  const taskItems: PlannerItem[] = tasks.filter(task => !['archived', 'cancelled'].includes(task.status)).map(task => ({
    id: `task:${task.id}`, kind: 'task', title: task.title, date: plannerDate(task.dueDate),
    clientId: task.clientId, clientName: task.clientName, responsibleUser: task.responsibleUser,
    status: task.status, done: task.status === 'completed', task,
  }));
  const publicationItems: PlannerItem[] = publications.filter(pub => pub.status !== 'archived' && !pub.archivedAt).map(publication => ({
    id: `publication:${publication.id}`, kind: 'publication',
    title: publication.caption.trim().split('\n')[0].length > 110 ? `${publication.caption.trim().split('\n')[0].slice(0, 110).trimEnd()}…` : publication.caption.trim().split('\n')[0] || 'Publicação sem legenda', date: plannerDate(publication.scheduledDate),
    clientId: publication.clientId, clientName: publication.companyName || publication.clientName,
    responsibleUser: publication.responsibleUser, status: publication.status, done: publication.status === 'posted', publication,
  }));
  const priorities = { urgent: 0, high: 1, medium: 2, low: 3 };
  return [...taskItems, ...publicationItems].sort((a, b) =>
    Number(a.done) - Number(b.done) || a.date.localeCompare(b.date) ||
    (a.task ? priorities[a.task.priority] : 2) - (b.task ? priorities[b.task.priority] : 2) || a.title.localeCompare(b.title, 'pt-BR'));
}

export function isPlannerOverdue(item: PlannerItem, today: string): boolean {
  return !item.done && (!!item.date && item.date < today || item.status === 'overdue');
}
