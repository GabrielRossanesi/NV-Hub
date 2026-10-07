'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowUpRight, CalendarDays, CheckSquare, ChevronLeft, ChevronRight, CircleCheck, Send, SlidersHorizontal } from 'lucide-react';
import type { Publication, TeamTask } from '../../types';
import { dateFromKey, dateKey, isPlannerOverdue, monthDates, moveDate, plannerDate, plannerItems, weekDates, type PlannerItem } from '../../lib/planner';
import Button from './button';
import IconButton from './icon-button';
import SearchInput from './search-input';
import Select from './select';
import StatusBadge from './status-badge';
import EmptyState from './empty-state';
import Modal from './modal';

type Period = 'day' | 'week' | 'month';
type Scope = 'day' | 'overdue' | 'undated';
interface PlannerProps {
  tasks: TeamTask[];
  publications: Publication[];
  publicationsEnabled: boolean;
  clients: { id: string; companyName: string }[];
  members: { name: string }[];
  onOpenTask: (id: string) => void;
  onCreateTask: (date: string) => void;
}

const focusStyle = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50';
const channelNames: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', tiktok: 'TikTok', google_business: 'Google Business', other: 'Outro' };
const friendlyDate = (key: string, options: Intl.DateTimeFormatOptions) => dateFromKey(key).toLocaleDateString('pt-BR', options);

export default function OperationalPlanner({ tasks, publications, publicationsEnabled, clients, members, onOpenTask, onCreateTask }: PlannerProps) {
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [period, setPeriod] = useState<Period>('week');
  const [scope, setScope] = useState<Scope>('day');
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'all' | 'task' | 'publication'>('all');
  const [client, setClient] = useState('all');
  const [responsible, setResponsible] = useState('all');
  const [showDone, setShowDone] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedPublicationId, setSelectedPublicationId] = useState<string | null>(null);
  const [brokenPreviewId, setBrokenPreviewId] = useState<string | null>(null);
  const today = dateKey(new Date());
  const items = useMemo(() => plannerItems(tasks, publicationsEnabled ? publications : []), [tasks, publications, publicationsEnabled]);
  const filtersActive = !!search || kind !== 'all' || client !== 'all' || responsible !== 'all' || showDone;
  const clearFilters = () => { setSearch(''); setKind('all'); setClient('all'); setResponsible('all'); setShowDone(false); };
  const filtered = items.filter(item =>
    (!search || `${item.title} ${item.clientName} ${item.responsibleUser} ${item.task?.description || ''} ${item.publication?.caption || ''}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))) &&
    (kind === 'all' || item.kind === kind) && (client === 'all' || (client === 'none' ? !item.clientId : item.clientId === client)) &&
    (responsible === 'all' || (responsible === 'none' ? !item.responsibleUser : item.responsibleUser === responsible)) && (showDone || !item.done));
  const byDay = new Map<string, PlannerItem[]>();
  for (const item of filtered) byDay.set(item.date, [...(byDay.get(item.date) || []), item]);
  const overdue = filtered.filter(item => isPlannerOverdue(item, today));
  const undated = filtered.filter(item => !item.date && !item.done);
  const dayItems = byDay.get(selectedDate) || [];
  const agenda = scope === 'overdue' ? overdue : scope === 'undated' ? undated : dayItems;
  const selectedPub = publications.find(pub => pub.id === selectedPublicationId);
  const week = weekDates(selectedDate);
  const days = period === 'month' ? monthDates(selectedDate) : week;
  const periodLabel = period === 'month'
    ? friendlyDate(selectedDate, { month: 'long', year: 'numeric' })
    : period === 'day' ? friendlyDate(selectedDate, { day: 'numeric', month: 'long', year: 'numeric' })
      : `${friendlyDate(week[0], { day: 'numeric', month: 'short' })} — ${friendlyDate(week[6], { day: 'numeric', month: 'short', year: 'numeric' })}`;
  const selectedDayAll = items.filter(item => item.date === selectedDate);
  const doneCount = selectedDayAll.filter(item => item.done).length;
  const memberNames = [...new Set([...members.map(member => member.name), ...items.map(item => item.responsibleUser)].filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const clientOptions = [...new Map([...clients.map(c => [c.id, c.companyName] as const), ...items.filter(item => item.clientId).map(item => [item.clientId, item.clientName] as const)]).entries()];

  const selectDay = (date: string) => { setSelectedDate(date); setScope('day'); };
  const navigate = (direction: number) => {
    if (period !== 'month') return selectDay(moveDate(selectedDate, direction * (period === 'week' ? 7 : 1)));
    const date = dateFromKey(selectedDate);
    const target = new Date(date.getFullYear(), date.getMonth() + direction, 1);
    target.setDate(Math.min(date.getDate(), new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()));
    selectDay(dateKey(target));
  };
  const openItem = (item: PlannerItem) => item.task ? onOpenTask(item.task.id) : setSelectedPublicationId(item.publication!.id);

  return (
    <div className="nv-planner min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:max-w-xs"><SearchInput label="Buscar no planner" placeholder="Buscar atividade, cliente ou pessoa…" value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} /></div>
        {publicationsEnabled && <div className="flex items-center gap-1 rounded-md bg-surface-subtle p-1" aria-label="Tipo de atividade">
          {([['all', 'Tudo'], ['task', 'Tarefas'], ['publication', 'Publicações']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)} className={`min-h-9 rounded-sm px-3 text-label font-medium transition-colors ${focusStyle} ${kind === value ? 'bg-surface text-foreground shadow-subtle' : 'text-foreground-muted hover:text-foreground'}`}>{label}</button>)}
        </div>}
        <Button variant="ghost" aria-expanded={filtersOpen} aria-controls="planner-filters" onClick={() => setFiltersOpen(!filtersOpen)} className="gap-2 sm:ml-auto"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filtros{(client !== 'all' || responsible !== 'all' || showDone) && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}</Button>
        {filtersActive && <Button variant="ghost" onClick={clearFilters}>Limpar filtros</Button>}
      </div>
      {filtersOpen && <div id="planner-filters" className="nv-planner-reveal grid grid-cols-1 gap-4 rounded-md bg-surface-subtle p-4 sm:grid-cols-3">
        <Select label="Cliente" value={client} onChange={e => setClient(e.target.value)} options={[{ value: 'all', label: 'Todos os clientes' }, { value: 'none', label: 'Sem cliente' }, ...clientOptions.map(([id, name]) => ({ value: id, label: name }))]} />
        <Select label="Responsável" value={responsible} onChange={e => setResponsible(e.target.value)} options={[{ value: 'all', label: 'Toda a equipe' }, { value: 'none', label: 'Sem responsável' }, ...memberNames.map(name => ({ value: name, label: name }))]} />
        <label className="flex min-h-10 cursor-pointer items-center gap-3 self-end text-body-small text-foreground-secondary"><input type="checkbox" checked={showDone} onChange={e => setShowDone(e.target.checked)} className="h-4 w-4 accent-primary" /> Incluir concluídas e publicadas</label>
      </div>}

      <section className="overflow-hidden rounded-lg border border-border bg-surface" aria-label="Calendário do planner">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:px-5">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <CalendarDays className="hidden h-4 w-4 text-foreground-muted sm:block" aria-hidden="true" />
            <h2 className="text-card-title font-semibold capitalize text-foreground" aria-live="polite">{periodLabel}</h2>
            <div className="flex items-center gap-1">
              <IconButton label={`${period === 'day' ? 'Dia' : period === 'week' ? 'Semana' : 'Mês'} anterior`} variant="ghost" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" aria-hidden="true" /></IconButton>
              <IconButton label={`Próximo ${period === 'day' ? 'dia' : period === 'week' ? 'período semanal' : 'mês'}`} variant="ghost" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" aria-hidden="true" /></IconButton>
              <Button variant="outline" size="sm" className="min-h-9" onClick={() => selectDay(today)}>Hoje</Button>
            </div>
          </div>
          <div className="flex gap-1 rounded-md bg-surface-subtle p-1" aria-label="Período do planner">
            {([['day', 'Dia'], ['week', 'Semana'], ['month', 'Mês']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={period === value} onClick={() => setPeriod(value)} className={`min-h-9 rounded-sm px-3 text-label font-medium transition-colors ${focusStyle} ${period === value ? 'bg-surface text-foreground shadow-subtle' : 'text-foreground-muted hover:text-foreground'}`}>{label}</button>)}
          </div>
        </div>

        {period !== 'day' && <>
          {period === 'month' && <div className="grid grid-cols-7 border-b border-border bg-surface-subtle">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => <span key={day} className="py-2 text-center text-caption font-medium text-foreground-muted">{day}</span>)}</div>}
          <div className={`grid grid-cols-7 ${period === 'week' ? 'divide-x divide-border' : ''}`}>
            {days.map(day => {
              const entries = byDay.get(day) || [];
              const isSelected = day === selectedDate;
              const isToday = day === today;
              const taskCount = entries.filter(item => item.kind === 'task').length;
              const pubCount = entries.length - taskCount;
              const currentMonth = day.slice(0, 7) === selectedDate.slice(0, 7);
              return <div key={day} className={`min-w-0 transition-colors duration-200 ${isSelected ? 'bg-primary-subtle/40' : 'bg-surface'} ${period === 'month' ? 'border-b border-r border-border last:border-r-0' : ''}`}>
                <button type="button" aria-pressed={isSelected} aria-current={isToday ? 'date' : undefined} aria-label={`${friendlyDate(day, { weekday: 'long', day: 'numeric', month: 'long' })}, ${taskCount} ${taskCount === 1 ? 'tarefa' : 'tarefas'} e ${pubCount} ${pubCount === 1 ? 'publicação' : 'publicações'}`} onClick={() => selectDay(day)} className={`flex w-full flex-col items-center gap-1 px-1 py-3 transition-colors hover:bg-surface-subtle ${focusStyle} ${period === 'month' ? 'min-h-20 sm:items-start sm:px-3' : 'min-h-24 sm:items-start sm:px-3'}`}>
                  {period === 'week' && <span className="text-caption font-medium uppercase text-foreground-muted">{friendlyDate(day, { weekday: 'short' }).replace('.', '')}</span>}
                  <span className={`flex h-8 w-8 items-center justify-center rounded-md font-mono text-sm font-semibold tabular-nums ${isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'text-primary ring-1 ring-inset ring-primary/40' : !currentMonth && period === 'month' ? 'text-foreground-muted' : 'text-foreground'}`}>{dateFromKey(day).getDate()}</span>
                  <span className="text-caption text-foreground-muted sm:hidden">{entries.length || '—'}</span>
                  <span className="hidden text-caption text-foreground-muted sm:block">{entries.length ? `${entries.length} ${entries.length === 1 ? 'atividade' : 'atividades'}` : 'Livre'}</span>
                </button>
                {period === 'week' && days.some(date => (byDay.get(date)?.length || 0) > 0) && <div className="hidden min-h-28 space-y-1 px-2 pb-3 xl:block">
                  {entries.slice(0, 2).map(item => <button key={item.id} type="button" onClick={() => { selectDay(day); openItem(item); }} title={item.title} className={`group flex w-full items-start gap-1.5 rounded-sm px-1.5 py-2 text-left transition-colors hover:bg-surface-subtle ${focusStyle}`}>
                    {item.kind === 'task' ? <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground-muted" aria-hidden="true" /> : <Send className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground-muted" aria-hidden="true" />}
                    <span className="min-w-0"><span className={`line-clamp-2 text-caption font-medium ${item.done ? 'text-foreground-muted line-through' : 'text-foreground'}`}>{item.title}</span><span className="mt-1 block truncate text-caption text-foreground-muted">{item.clientName || 'Sem cliente'}</span></span>
                  </button>)}
                  {entries.length > 2 && <button type="button" onClick={() => selectDay(day)} className={`min-h-9 w-full rounded-sm px-2 text-left text-caption font-medium text-primary hover:bg-primary-subtle ${focusStyle}`}>+{entries.length - 2} atividades</button>}
                </div>}
                {period === 'month' && <div className="hidden gap-2 px-3 pb-2 sm:flex" aria-hidden="true">{taskCount > 0 && <span className="flex items-center gap-1 text-caption text-foreground-muted"><CheckSquare className="h-3 w-3" />{taskCount}</span>}{pubCount > 0 && <span className="flex items-center gap-1 text-caption text-foreground-muted"><Send className="h-3 w-3" />{pubCount}</span>}</div>}
              </div>;
            })}
          </div>
        </>}

        <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-5 sm:px-5">
              <div>
                <div className="mb-1 flex items-center gap-2 text-caption text-foreground-muted"><span>{scope === 'day' ? selectedDate === today ? 'HOJE' : 'AGENDA DO DIA' : 'PENDÊNCIAS'}</span>{scope === 'day' && <span className="font-mono tabular-nums">{friendlyDate(selectedDate, { day: '2-digit', month: '2-digit' })}</span>}</div>
                <h3 className="text-section-title font-semibold capitalize text-foreground">{scope === 'overdue' ? 'Atividades atrasadas' : scope === 'undated' ? 'Atividades sem data' : friendlyDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                <p className="mt-1 text-caption text-foreground-muted" aria-live="polite">{agenda.length} {agenda.length === 1 ? 'atividade' : 'atividades'}{scope === 'day' && selectedDayAll.length > 0 ? ` · ${doneCount} de ${selectedDayAll.length} finalizadas no dia` : ''}</p>
              </div>
              {scope === 'day' ? <Button variant="outline" size="sm" className="min-h-9" onClick={() => onCreateTask(selectedDate)}>Adicionar tarefa</Button> : <Button variant="ghost" size="sm" className="min-h-9" onClick={() => setScope('day')}>Voltar ao dia</Button>}
            </div>
            <div key={`${selectedDate}-${scope}`} className="nv-planner-reveal">
              {agenda.length === 0 ? <div className="px-4 py-10 sm:px-5"><EmptyState icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />} title={scope === 'day' ? 'Nenhuma atividade para este dia' : 'Nenhuma pendência nesta visão'} description={filtersActive ? 'Ajuste os filtros para visualizar mais atividades.' : scope === 'day' ? 'Adicione uma tarefa ou selecione outro dia no planner.' : 'As atividades que precisam de atenção aparecerão aqui.'} actionLabel={filtersActive ? 'Limpar filtros' : scope === 'day' ? 'Adicionar tarefa' : undefined} onAction={filtersActive ? clearFilters : scope === 'day' ? () => onCreateTask(selectedDate) : undefined} /></div>
                : <ul className="divide-y divide-border">{agenda.map(item => <li key={item.id}>
                  <button type="button" onClick={() => openItem(item)} className={`group flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-150 hover:bg-surface-subtle sm:gap-4 sm:px-5 ${focusStyle}`}>
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-subtle ${item.done ? 'text-success' : 'text-foreground-muted'}`}>{item.done ? <CircleCheck className="h-4 w-4" aria-hidden="true" /> : item.kind === 'task' ? <CheckSquare className="h-4 w-4" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-foreground-muted"><span>{item.kind === 'task' ? 'Tarefa' : 'Publicação'}</span>{item.publication && <><span aria-hidden="true">·</span><span>{(item.publication.channels?.length ? item.publication.channels : [item.publication.platform || 'other']).map(channel => channelNames[channel] || channel).join(', ')}</span></>}{isPlannerOverdue(item, today) && <span className="font-medium text-danger">· Atrasada</span>}</span>
                      <span className={`block break-words text-sm font-medium ${item.done ? 'text-foreground-muted line-through' : 'text-foreground'}`}>{item.title}</span>
                      <span className="mt-1 block text-caption text-foreground-muted">{item.clientName || 'Sem cliente'} · {item.responsibleUser || 'Sem responsável'}{scope !== 'day' && item.date ? ` · ${friendlyDate(item.date, { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}</span>
                      <span className="mt-2 flex flex-wrap gap-2"><StatusBadge type={item.kind} status={item.status} />{item.task && ['urgent', 'high'].includes(item.task.priority) && <StatusBadge type="priority" status={item.task.priority} />}</span>
                    </span>
                    <ArrowUpRight className="mt-2 h-4 w-4 shrink-0 text-foreground-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                </li>)}</ul>}
            </div>
          </div>
          <aside className="border-t border-border bg-surface-subtle/50 px-4 py-5 sm:px-5 xl:border-l xl:border-t-0" aria-label="Pendências do planner">
            <div className="mb-5 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-foreground-muted" aria-hidden="true" /><h3 className="text-sm font-semibold text-foreground">Precisa de atenção</h3></div>
            {([{ value: 'overdue', label: 'Atrasadas', entries: overdue }, { value: 'undated', label: 'Sem data', entries: undated }] as const).map(group => <div key={group.value} className="mb-5 last:mb-0">
              <button type="button" aria-pressed={scope === group.value} onClick={() => setScope(scope === group.value ? 'day' : group.value)} className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-2 text-label font-medium transition-colors ${focusStyle} ${scope === group.value ? 'bg-primary-subtle text-primary' : 'text-foreground-secondary hover:bg-surface-subtle'}`}><span>{group.label}</span><span className={`font-mono tabular-nums ${group.value === 'overdue' && group.entries.length ? 'text-danger' : 'text-foreground-muted'}`}>{group.entries.length}</span></button>
              {group.entries.length === 0 ? <p className="px-2 py-2 text-caption text-foreground-muted">{group.value === 'overdue' ? 'Nenhuma atividade atrasada.' : 'Todas as pendências têm data.'}</p> : <ul>{group.entries.slice(0, 3).map(item => <li key={item.id}><button type="button" onClick={() => openItem(item)} className={`w-full rounded-sm px-2 py-2 text-left transition-colors hover:bg-surface-subtle ${focusStyle}`}><span className="block truncate text-body-small font-medium text-foreground">{item.title}</span><span className="mt-0.5 block truncate text-caption text-foreground-muted">{item.kind === 'task' ? 'Tarefa' : 'Publicação'} · {item.clientName || 'Sem cliente'}</span></button></li>)}</ul>}
              {group.entries.length > 3 && <button type="button" onClick={() => setScope(group.value)} className={`min-h-9 rounded-sm px-2 text-caption font-medium text-primary hover:bg-primary-subtle ${focusStyle}`}>Ver todas ({group.entries.length})</button>}
            </div>)}
            {publicationsEnabled && <Link href={`/publicacoes?nova=1&data=${selectedDate}`} className={`mt-3 flex min-h-10 items-center justify-between gap-2 border-t border-border pt-4 text-label font-medium text-foreground-secondary hover:text-primary ${focusStyle}`}>Agendar publicação<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>}
          </aside>
        </div>
      </section>
      <p className="text-caption text-foreground-muted">{publicationsEnabled ? 'Tarefas pelo prazo de entrega. Publicações pela data prevista. ' : 'Tarefas pelo prazo de entrega. '}{showDone ? 'Incluindo atividades finalizadas.' : 'Concluídas e publicadas ficam ocultas.'}</p>

      <Modal isOpen={!!selectedPub} onClose={() => setSelectedPublicationId(null)} title="Detalhes da publicação" description={selectedPub?.companyName || selectedPub?.clientName} size="lg">
        {selectedPub && <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2"><StatusBadge type="publication" status={selectedPub.status} /><span className="text-caption text-foreground-muted">{plannerDate(selectedPub.scheduledDate) ? friendlyDate(plannerDate(selectedPub.scheduledDate), { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sem data'} · {selectedPub.responsibleUser || 'Sem responsável'}</span></div>
          {selectedPub.imageUrl && brokenPreviewId !== selectedPub.id && <div className="flex max-h-72 justify-center overflow-hidden rounded-md bg-surface-subtle">
            {/* Publications can contain user uploads and external URLs outside the Next image allowlist. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedPub.images?.[0] || selectedPub.imageUrl} alt={`Prévia da publicação de ${selectedPub.companyName || selectedPub.clientName}`} onError={() => setBrokenPreviewId(selectedPub.id)} className="max-h-72 max-w-full object-contain" />
          </div>}
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground-secondary">{selectedPub.caption || 'Nenhuma legenda adicionada.'}</p>
          {selectedPub.clientFeedback && <div className="rounded-md bg-warning-subtle p-3"><p className="mb-1 text-label font-medium text-warning">Ajustes solicitados pelo cliente</p><p className="whitespace-pre-wrap text-body-small text-foreground-secondary">{selectedPub.clientFeedback}</p></div>}
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4"><Button variant="ghost" onClick={() => setSelectedPublicationId(null)}>Fechar</Button><Link href={`/publicacoes?publicacao=${encodeURIComponent(selectedPub.id)}`} className={`inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover ${focusStyle}`}>Gerenciar publicação<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div>
        </div>}
      </Modal>
    </div>
  );
}
