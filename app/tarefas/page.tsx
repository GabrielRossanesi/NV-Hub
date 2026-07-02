'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Check, AlertTriangle, CheckSquare, Clock, UserCheck, LayoutList, Calendar } from 'lucide-react';
import { useTenantStore } from '../../lib/store';
import TaskCalendar from '../../components/ui/task-calendar';
import { useMounted } from '../../hooks/useMounted';
import { PageHeader as UIHeader } from '../../components/ui/page-header';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Textarea from '../../components/ui/textarea';
import Select from '../../components/ui/select';
import Modal from '../../components/ui/modal';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import StatusBadge from '../../components/ui/status-badge';
import EmptyState from '../../components/ui/empty-state';
import DatePicker from '../../components/ui/date-picker';
import { TaskPriority } from '../../types';

export default function TarefasPage() {
  const mounted = useMounted();
  const { tasks, clients, teamMembers, addTask, updateTaskStatus, checkLimit } = useTenantStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [respFilter, setRespFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Load view preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nv_hub_tasks_view');
      if (saved === 'list' || saved === 'calendar') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setViewMode(saved);
      }
    }
  }, []);

  const handleSetViewMode = (mode: 'list' | 'calendar') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nv_hub_tasks_view', mode);
    }
  };

  // Form States
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [taskResp, setTaskResp] = useState('Ana Silva');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesResp = respFilter === 'all' || t.responsibleUser === respFilter;
    
    return matchesSearch && matchesStatus && matchesResp;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId);
    if (!taskTitle || !client || !taskDueDate) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const result = addTask({
      title: taskTitle,
      clientId: client.id,
      clientName: client.companyName,
      responsibleUser: taskResp,
      dueDate: taskDueDate,
      status: 'pending',
      priority: taskPriority,
      description: taskDesc
    });

    if (!result) {
      alert('Limite do Plano Atingido! Faça o upgrade do seu plano nas Configurações para continuar criando mais tarefas.');
      return;
    }

    setTaskTitle('');
    setSelectedClientId('');
    setTaskResp('Ana Silva');
    setTaskPriority('medium');
    setTaskDueDate('');
    setTaskDesc('');
    setIsModalOpen(false);
  };

  // Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const percentCompleted = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasks = tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && new Date(t.dueDate) < new Date())).length;

  // Leaderboard statistics mapping
  const teamStats = teamMembers.map((m) => {
    const memberTasks = tasks.filter(t => t.responsibleUser === m.name);
    const completed = memberTasks.filter(t => t.status === 'completed').length;
    const total = memberTasks.length;
    return {
      name: m.name,
      role: m.role,
      completed,
      total,
      percent: total ? Math.round((completed / total) * 100) : 0
    };
  });

  const clientOptions = clients.map(c => ({ value: c.id, label: c.companyName }));
  const teamOptions = teamMembers.map(m => ({ value: m.name, label: m.name }));
  
  const priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <UIHeader 
        title="Tarefas da Equipe" 
        description="Acompanhe o cronograma operacional, kanban de atividades e produtividade individual."
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova Tarefa
          </Button>
        }
      />

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total de Tarefas</span>
            <strong className="text-xl font-bold text-foreground">{totalTasks}</strong>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center text-success shrink-0">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Concluídas</span>
            <strong className="text-xl font-bold text-foreground">{completedTasks}</strong>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-muted-foreground block font-medium">Aproveitamento</span>
            <div className="flex items-center gap-2 mt-1">
              <strong className="text-sm font-bold text-foreground">{percentCompleted}%</strong>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${percentCompleted}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-danger/10 rounded-full flex items-center justify-center text-danger shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Atrasadas</span>
            <strong className="text-xl font-bold text-danger">{overdueTasks}</strong>
          </div>
        </Card>
      </div>

      {/* Two Column Layout (Leaderboard vs Filters/List) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Leaderboard) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Produtividade por Colaborador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamStats.map((member) => (
                <div key={member.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-foreground block">{member.name}</span>
                      <span className="text-[10px] text-muted-foreground">{member.role}</span>
                    </div>
                    <span className="font-bold text-foreground">{member.completed}/{member.total} ({member.percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${member.percent}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Filters & Tasks Table) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row items-center gap-3 justify-between bg-card p-4 rounded-xl border border-border/80 shadow-sm">
            {/* Search */}
            <div className="relative w-full md:w-64 flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filtrar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full pl-9 pr-3 rounded-lg border border-border bg-background text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all placeholder:text-muted-foreground/75"
              />
            </div>

            {/* Dropdown Filters & View Toggle */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Select
                options={[
                  { value: 'all', label: 'Todos Responsáveis' },
                  ...teamMembers.map(m => ({ value: m.name, label: m.name }))
                ]}
                value={respFilter}
                onChange={(e) => setRespFilter(e.target.value)}
                className="h-9 text-xs py-1"
              />
              <Select
                options={[
                  { value: 'all', label: 'Todos Status' },
                  { value: 'pending', label: 'Pendente' },
                  { value: 'in_progress', label: 'Em Andamento' },
                  { value: 'completed', label: 'Concluído' }
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 text-xs py-1"
              />

              {/* View Toggle Segmented Control */}
              <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border/80 h-9 shrink-0 ml-auto md:ml-0">
                <button
                  type="button"
                  onClick={() => handleSetViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all h-7 cursor-pointer select-none ${
                    viewMode === 'list'
                      ? 'bg-card text-foreground shadow-sm border border-border/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Visualização em Lista"
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Lista</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetViewMode('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all h-7 cursor-pointer select-none ${
                    viewMode === 'calendar'
                      ? 'bg-card text-foreground shadow-sm border border-border/40'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Visualização em Calendário"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Calendário</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tasks List or Calendar */}
          {viewMode === 'calendar' ? (
            <TaskCalendar 
              tasks={filteredTasks} 
              updateTaskStatus={updateTaskStatus} 
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                {filteredTasks.length === 0 ? (
                  <div className="p-12">
                    <EmptyState 
                      title="Nenhuma tarefa localizada" 
                      description="Não existem tarefas correspondentes à busca."
                      actionLabel="Criar Tarefa"
                      onAction={() => setIsModalOpen(true)}
                    />
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Título da Tarefa</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Prazo</TableHead>
                            <TableHead>Prioridade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTasks.map((task) => (
                            <TableRow key={task.id}>
                              <TableCell>
                                <div className="font-semibold text-foreground" title={task.description || task.title}>{task.title}</div>
                                <div className="text-xs text-primary font-medium mt-0.5">{task.clientName}</div>
                              </TableCell>
                              <TableCell className="text-xs text-foreground font-medium">{task.responsibleUser}</TableCell>
                              <TableCell className="text-xs text-muted-foreground flex items-center gap-1 py-4.5">
                                <Clock className="h-3.5 w-3.5" /> {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell><StatusBadge type="priority" status={task.priority} /></TableCell>
                              <TableCell><StatusBadge type="task" status={task.status} /></TableCell>
                              <TableCell className="text-right">
                                {task.status !== 'completed' ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => updateTaskStatus(task.id, 'completed')}
                                    className="h-8 text-xs gap-1 border-success/30 hover:bg-success/5 text-success-foreground"
                                  >
                                    <Check className="h-3.5 w-3.5 text-success" /> Concluir
                                  </Button>
                                ) : (
                                  <span className="text-xs font-semibold text-success flex items-center gap-1 justify-end">
                                    <Check className="h-3.5 w-3.5" /> Concluída
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="block md:hidden divide-y divide-border/40">
                      {filteredTasks.map((task) => (
                        <div key={task.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-foreground text-sm leading-snug">{task.title}</div>
                              <div className="text-[11px] text-primary font-medium mt-0.5">{task.clientName}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <StatusBadge type="task" status={task.status} />
                              <StatusBadge type="priority" status={task.priority} />
                            </div>
                          </div>

                          {task.description && (
                            <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/40 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs py-1.5 border-t border-border/10">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" /> {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                            </div>
                            <span className="font-medium text-foreground">Resp: {task.responsibleUser}</span>
                          </div>

                          <div className="pt-1">
                            {task.status !== 'completed' ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => updateTaskStatus(task.id, 'completed')}
                                className="h-9 w-full justify-center text-xs gap-1.5 border-success/30 hover:bg-success/5 text-success-foreground"
                              >
                                <Check className="h-3.5 w-3.5 text-success" /> Marcar como Concluída
                              </Button>
                            ) : (
                              <div className="text-xs font-semibold text-success flex items-center justify-center gap-1 py-1.5 bg-success/5 border border-success/15 rounded-lg text-center">
                                <Check className="h-3.5 w-3.5" /> Concluída
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

      </div>

      {/* Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Nova Tarefa"
        description="Preencha os dados da tarefa para a equipe."
      >
        <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
          {!checkLimit('tasks') && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-lg">
              Aviso: O limite de tarefas do seu plano foi atingido. Faça o upgrade nas Configurações para continuar.
            </div>
          )}
          <Input
            label="Título da Tarefa"
            type="text"
            placeholder="Ex: Agendar posts de lançamento de Junho"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />

          <Select
            label="Selecione o Cliente Vinculado"
            placeholder="Escolha um cliente..."
            options={clientOptions}
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Responsável na Equipe"
              options={teamOptions}
              value={taskResp}
              onChange={(e) => setTaskResp(e.target.value)}
            />
            <DatePicker
              label="Data Limite (Prazo)"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              required
            />
          </div>

          <Select
            label="Nível de Prioridade"
            options={priorityOptions}
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
          />

          <Textarea
            label="Descrição da Atividade"
            placeholder="Detalhamento do que precisa ser feito..."
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Tarefa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
