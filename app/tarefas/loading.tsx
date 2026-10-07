export default function Loading() {
  return <div className="space-y-6" role="status" aria-label="Carregando planner">
    <span className="sr-only">Carregando tarefas e publicações…</span>
    <div className="space-y-3 border-b border-border pb-5"><div className="h-4 w-24 rounded-sm bg-surface-subtle" /><div className="h-8 w-64 max-w-full rounded-md bg-surface-subtle" /><div className="h-4 w-80 max-w-full rounded-sm bg-surface-subtle" /></div>
    <div className="h-10 w-64 max-w-full rounded-md bg-surface-subtle" />
    <div className="overflow-hidden rounded-lg border border-border bg-surface"><div className="h-20 border-b border-border bg-surface-subtle" /><div className="grid grid-cols-7 divide-x divide-border">{Array.from({ length: 7 }, (_, i) => <div key={i} className="h-28 bg-surface" />)}</div><div className="space-y-4 border-t border-border p-5">{Array.from({ length: 3 }, (_, i) => <div key={i} className="h-14 rounded-md bg-surface-subtle" />)}</div></div>
  </div>;
}
