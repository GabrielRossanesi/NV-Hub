import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../lib/planner.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { dateFromKey, dateKey, plannerDate, moveDate, weekDates, monthDates, plannerItems, isPlannerOverdue } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

assert.equal(dateKey(dateFromKey('2026-10-07')), '2026-10-07', 'A date-only deadline must not move to the previous day');
assert.equal(plannerDate('2026-10-07T00:00:00.000Z'), '2026-10-07');
assert.equal(plannerDate('2026-02-30'), '', 'Invalid dates belong in the undated queue');
assert.equal(plannerDate(''), '');
assert.equal(moveDate('2026-12-31', 1), '2027-01-01');
assert.equal(moveDate('2024-02-28', 1), '2024-02-29');
assert.deepEqual(weekDates('2026-10-11'), ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11']);
assert.equal(monthDates('2024-02-15').includes('2024-02-29'), true);
assert.equal(monthDates('2026-02-15').includes('2026-02-29'), false);
assert.equal(monthDates('2026-03-01').length, 42, 'Months spanning six weeks must remain complete');

const base = { organizationId: 'org', clientId: 'client', clientName: 'Cliente', responsibleUser: 'Pessoa', createdAt: '2026-10-01', priority: 'medium' };
const tasks = [
  { ...base, id: 'today', title: 'Prazo hoje', dueDate: '2026-10-07', status: 'pending' },
  { ...base, id: 'late', title: 'Prazo ontem', dueDate: '2026-10-06', status: 'in_progress' },
  { ...base, id: 'undated', title: 'Sem data', dueDate: '', status: 'pending' },
  { ...base, id: 'cancelled', title: 'Cancelada', dueDate: '2026-10-01', status: 'cancelled' },
  { ...base, id: 'archived', title: 'Arquivada', dueDate: '2026-10-01', status: 'archived' },
  { ...base, id: 'done', title: 'Concluída', dueDate: '2026-10-01', status: 'completed' },
];
const pub = { ...base, id: 'today', companyName: 'Cliente', caption: 'Publicação no mesmo dia', scheduledDate: '2026-10-07', status: 'approved', imageUrl: '', approvalLink: '' };
const items = plannerItems(tasks, [pub, { ...pub, id: 'posted', scheduledDate: '2026-10-01', status: 'posted' }, { ...pub, id: 'archived', archivedAt: '2026-10-02' }]);
assert.equal(items.length, 6, 'Archived and cancelled records must not pollute the planner');
assert.equal(new Set(items.map(item => item.id)).size, items.length, 'Task and publication IDs must not collide');
assert.equal(items.filter(item => item.date === '2026-10-07').length, 2, 'Both sources share the same operational day');
assert.deepEqual(items.filter(item => isPlannerOverdue(item, '2026-10-07')).map(item => item.id), ['task:late'], 'Today, posted, completed and undated activities are not overdue');
assert.equal(items.find(item => item.id === 'task:undated').date, '');
assert.equal(tasks[0].id, 'today', 'Presentation must not mutate source records');
console.log(`Planner checks passed (timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}).`);
