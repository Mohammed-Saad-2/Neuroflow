/**
 * Deep Work Task Queue & Priority Board
 * Seamlessly feeds the Focus Sprint Timer with active tasks.
 */

import React, { useState } from 'react';
import { Plus, Check, Trash2, Target, CheckSquare, ListFilter } from 'lucide-react';

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'Dev' | 'Architecture' | 'Design' | 'Research';

export interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  category: TaskCategory;
  estimatedSprints: number;
  completedSprints: number;
  completed: boolean;
  createdAt: number;
}

interface TaskBoardProps {
  tasks: TaskItem[];
  activeTaskId: string | null;
  onSelectActiveTask: (taskId: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'completed' | 'completedSprints' | 'createdAt'>) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onClearCompleted: () => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  activeTaskId,
  onSelectActiveTask,
  onAddTask,
  onToggleTaskComplete,
  onDeleteTask,
  onClearCompleted,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('Dev');
  const [estimatedSprints, setEstimatedSprints] = useState<number>(2);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      priority,
      category,
      estimatedSprints,
    });

    setNewTitle('');
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md space-y-5">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Sprint Task Queue</h2>
          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span>{activeCount} remaining</span>
            <span aria-hidden="true">·</span>
            <span>{completedCount} completed</span>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'active' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'completed' ? 'bg-slate-800 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Done ({completedCount})
          </button>
        </div>
      </div>

      {/* Quick Add Task Form */}
      <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Add high-impact sprint task... e.g. Write Web Audio synthesizer graph"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Task Attributes Bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Category:</span>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as TaskCategory)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value="Dev">Dev</option>
              <option value="Architecture">Architecture</option>
              <option value="Design">Design</option>
              <option value="Research">Research</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Priority:</span>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Estimate:</span>
            <select
              value={estimatedSprints}
              onChange={e => setEstimatedSprints(parseInt(e.target.value, 10))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value={1}>1 Sprint (25m)</option>
              <option value={2}>2 Sprints (50m)</option>
              <option value={3}>3 Sprints (75m)</option>
              <option value={4}>4 Sprints (100m)</option>
            </select>
          </div>
        </div>
      </form>

      {/* Task List Items */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
            <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No tasks in this view.</p>
            <p className="text-[11px] text-slate-500 mt-1">Add a task above to schedule your next sprint.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isActive = activeTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'border-cyan-500/80 bg-slate-800/90 shadow-sm'
                    : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Complete checkbox */}
                  <button
                    onClick={() => onToggleTaskComplete(task.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-900'
                    }`}
                    aria-label={`Mark task '${task.title}' ${task.completed ? 'incomplete' : 'complete'}`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium truncate ${
                        task.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </p>

                    {/* Metadata text with bullet separators (anti-pill compliant) */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{task.category}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          task.priority === 'high'
                            ? 'text-rose-400 font-medium'
                            : task.priority === 'medium'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }
                      >
                        {task.priority.toUpperCase()}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {task.estimatedSprints} sprint{task.estimatedSprints > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Set Active / Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!task.completed && (
                    <button
                      onClick={() => onSelectActiveTask(task.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800'
                      }`}
                      title={isActive ? 'Currently active on Focus Timer' : 'Select as active task'}
                    >
                      <Target className="w-3 h-3" />
                      <span className="hidden sm:inline">{isActive ? 'Active Sprint' : 'Focus'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label={`Delete task ${task.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {completedCount > 0 && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClearCompleted}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear completed tasks
          </button>
        </div>
      )}
    </div>
  );
};
