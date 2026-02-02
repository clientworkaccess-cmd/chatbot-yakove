
import React from 'react';
import { Briefcase, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { WorkerTasks } from '../types';

interface TaskUpdateViewProps {
  onGetTasks: () => Promise<void>;
  isLoading: boolean;
  result: WorkerTasks[] | null;
}

export const TaskUpdateView: React.FC<TaskUpdateViewProps> = ({ onGetTasks, isLoading, result }) => {
  // Ensure result is treated as array
  const taskGroups = Array.isArray(result) ? result : [];
  const hasResult = result !== null;

  return (
    <div className="flex-1 flex flex-col relative overflow-y-auto bg-white dark:bg-[#212121]">
      <div className="w-full min-h-full flex flex-col items-center justify-start p-6 py-12">
        <div className="max-w-2xl w-full flex flex-col items-center">
          <div className="w-16 h-16 mb-6 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm shrink-0">
            <Briefcase size={32} />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            Task Update
          </h1>
          
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-md text-center">
            Click the button below to retrieve the latest task assignments and status updates from the system.
          </p>
          
          <button
            onClick={onGetTasks}
            disabled={isLoading}
            className="group relative w-full max-w-md flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Retrieving Tasks...</span>
              </>
            ) : (
              <>
                <Play size={20} className="fill-current" />
                <span>Get Tasks</span>
              </>
            )}
          </button>

          {hasResult && (
            <div className="mt-10 w-full animate-fadeIn space-y-6">
              {taskGroups.length === 0 ? (
                <div className="bg-gray-50 dark:bg-[#2f2f2f] rounded-xl p-6 text-center text-gray-500 dark:text-gray-400">
                  No tasks found.
                </div>
              ) : (
                taskGroups.map((workerGroup, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#2f2f2f] rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 dark:bg-[#252525] px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
                        {workerGroup.worker || 'Unknown Worker'}'s Tasks
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {workerGroup.tasks?.length || 0} {(workerGroup.tasks?.length || 0) === 1 ? 'task' : 'tasks'} assigned
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {workerGroup.tasks && workerGroup.tasks.length > 0 ? (
                        workerGroup.tasks.map((task) => (
                          <div key={task.id || Math.random().toString()} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-[#353535] transition-colors">
                            <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                            <span className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-snug">
                              {task.name || 'Unnamed Task'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm italic">
                            No active tasks listed.
                        </div>
                      )}
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
