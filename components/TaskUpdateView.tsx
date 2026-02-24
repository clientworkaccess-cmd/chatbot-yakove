import React from 'react';
import { Briefcase, Play, Loader2, Calendar, Clock, Package, MapPin, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { WorkerTasks, TaskStatus, Task } from '../types';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface TaskUpdateViewProps {
  onGetTasks: () => Promise<void>;
  isLoading: boolean;
  result: WorkerTasks[] | null;
}

export const TaskUpdateView: React.FC<TaskUpdateViewProps> = ({ onGetTasks, isLoading, result }) => {
  const { profile } = useAuth();
  const taskGroups = Array.isArray(result) ? result : [];
  const hasResult = result !== null;

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Refresh tasks after update
      await onGetTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // Helper to check if a task is locked based on multiple dependencies (comma-separated)
  const isTaskLocked = (task: Task, allTasks: Task[]) => {
    const rawDepends = task.dependsOn || "";
    if (rawDepends.trim() === "") return false;

    // Split dependencies by comma and trim whitespace/trailing commas
    const dependencies = rawDepends
      .split(',')
      .map(d => d.trim())
      .filter(d => d !== "");

    if (dependencies.length === 0) return false;

    // Debug logging to help identify why tasks are locked
    console.group(`Dependency Check: ${task.name} (#${task.taskno})`);
    console.log(`Dependencies found: ${dependencies.join(', ')}`);

    // A task is locked if ANY of its dependencies are not 'done'
    const isLocked = dependencies.some(depTaskNo => {
      const prerequisite = allTasks.find(t => t.taskno === depTaskNo);

      if (!prerequisite) {
        console.warn(`Prerequisite Task #${depTaskNo} NOT found in list!`);
        return true; // Lock if prerequisite is missing
      }

      const isPrereqDone = prerequisite.status === 'done';
      console.log(`- Prerequisite Task #${depTaskNo} ("${prerequisite.name}") status: ${prerequisite.status} -> ${isPrereqDone ? 'OK' : 'LOCKED'}`);

      return !isPrereqDone;
    });

    console.log(`Final Result: ${isLocked ? 'LOCKED 🔒' : 'UNLOCKED ✅'}`);
    console.groupEnd();

    return isLocked;
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-y-auto bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="w-full min-h-full flex flex-col items-center justify-start p-4 md:p-8 py-12">
        <div className="max-w-6xl w-full flex flex-col items-center">
          <div className="w-16 h-16 mb-6 rounded-2xl bg-blue-500/10 backdrop-blur-lg border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xl shrink-0">
            <Briefcase size={32} />
          </div>

          <h1 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white tracking-tight">
            Task Update
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed max-w-md text-center text-lg">
            Monitor and manage your field operations with real-time task data.
          </p>

          <button
            onClick={onGetTasks}
            disabled={isLoading}
            className="group relative w-full max-w-sm flex items-center justify-center gap-3 px-8 py-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-2xl transition-all shadow-xl hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Retrieving Operations...</span>
              </>
            ) : (
              <>
                <Play size={20} className="fill-current" />
                <span>Synchronize Tasks</span>
              </>
            )}
          </button>

          {hasResult && (
            <div className="mt-16 w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {taskGroups.length === 0 ? (
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-12 text-center shadow-2xl">
                  <div className="text-gray-400 dark:text-gray-500 mb-2 font-medium">No operational data found for "{profile?.full_name || profile?.email?.split('@')[0]}"</div>
                  <p className="text-sm text-gray-400">Ensure your name matches the "worker" column in Supabase.</p>
                </div>
              ) : (
                taskGroups.map((workerGroup, idx) => (
                  <div key={idx} className="space-y-6">
                    <div className="flex items-end justify-between px-2">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-3">
                          <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                          {workerGroup.worker}'s Assignment
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-5">
                          {workerGroup.tasks?.length || 0} active deployments
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-900/5 dark:bg-white/5 transition-colors">
                              <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 whitespace-nowrap">Operation</th>
                              <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 whitespace-nowrap">Location</th>
                              <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 whitespace-nowrap text-center text-xs">Number</th>
                              <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 whitespace-nowrap text-center">Deadline</th>
                              <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 whitespace-nowrap text-center">Workload</th>
                              <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 whitespace-nowrap text-center">Status</th>
                              <th className="px-6 py-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 whitespace-nowrap">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {workerGroup.tasks && workerGroup.tasks.length > 0 ? (
                              workerGroup.tasks.map((task) => {
                                // Use the global list if provided, otherwise fallback to local group
                                const globalTasks = (workerGroup as any).allTasksInSystem || workerGroup.tasks;
                                const locked = isTaskLocked(task, globalTasks);
                                const isDone = task.status === 'done';
                                const isStuck = task.status === 'stuck';

                                return (
                                  <tr key={task.id || Math.random().toString()} className={`group transition-all ${locked ? 'opacity-50 grayscale select-none' : 'hover:bg-blue-600/[0.04]'}`}>
                                    <td className="px-6 py-7">
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          {locked && <Lock size={14} className="text-gray-400" />}
                                          <span className={`text-base font-bold transition-colors leading-tight ${locked ? 'text-gray-400' : 'text-gray-800 dark:text-gray-50 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                                            {task.name || 'Unnamed Operation'}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-1.5 opacity-80 uppercase tracking-widest">#{task.id}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-7">
                                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400">
                                        <MapPin size={14} className="shrink-0" />
                                        <span className="text-sm font-bold whitespace-nowrap">{task.unit || '—'}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-7 text-center">
                                      <div className="text-sm font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 rounded-lg px-2 py-1 inline-block min-w-[32px]">
                                        {task.taskno || '—'}
                                      </div>
                                    </td>
                                    <td className="px-6 py-7 text-center">
                                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400">
                                        <Calendar size={14} className="shrink-0" />
                                        <span className="text-sm font-bold whitespace-nowrap">{task.expectedCompletionDate || '—'}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-7 text-center">
                                      <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                        {task.estimatedHours ? `${task.estimatedHours}h` : '—'}
                                      </div>
                                    </td>
                                    <td className="px-6 py-7 text-center">
                                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isDone ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                                        isStuck ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                                          'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-green-500' : isStuck ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                                        {task.status}
                                      </div>
                                    </td>
                                    <td className="px-6 py-7">
                                      {!locked && (
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => handleUpdateStatus(task.id, 'done')}
                                            disabled={isDone}
                                            className={`p-2 rounded-xl border transition-all ${isDone ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 dark:border-white/10 hover:border-green-500 text-gray-400 hover:text-green-500 dark:hover:text-green-400'
                                              }`}
                                            title="Mark as Done"
                                          >
                                            <CheckCircle2 size={20} />
                                          </button>
                                          <button
                                            onClick={() => handleUpdateStatus(task.id, 'stuck')}
                                            disabled={isStuck}
                                            className={`p-2 rounded-xl border transition-all ${isStuck ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 dark:border-white/10 hover:border-red-500 text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                                              }`}
                                            title="Mark as Stuck"
                                          >
                                            <AlertCircle size={20} />
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={8} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500 font-medium italic">
                                  No active operations currently deployed.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
