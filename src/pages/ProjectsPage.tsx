import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  ArrowRight,
  X,
  FolderPlus,
  Check,
  Mic2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const { projects, createProject, deleteProject, history, setActiveTab, setStudioPreload, addToast } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(projects[0]?.id || null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      addToast('Please enter a project name', 'error');
      return;
    }
    const created = createProject(newProjectName.trim(), newProjectDesc.trim());
    setActiveProjectId(created.id);
    setNewProjectName('');
    setNewProjectDesc('');
    setCreateModalOpen(false);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const projectItems = history.filter((h) => h.projectId === activeProjectId);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Projects Workspace
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {projects.length} Active Folders
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Organize voice generations by YouTube series, podcast episodes, audiobook chapters, or ad campaigns.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* CREATE PROJECT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-600" />
                <span>Create New Project</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My YouTube Video #4"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of script and goal..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Project Selector (4 cols) */}
        <div className="md:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Your Folders
          </span>
          {projects.map((proj) => {
            const isSelected = proj.id === activeProjectId;
            return (
              <div
                key={proj.id}
                onClick={() => setActiveProjectId(proj.id)}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {proj.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {proj.description || 'No description'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(proj.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 transition"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Project Details & Audio Items (8 cols) */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          {activeProject ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeProject.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeProject.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('studio');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow-sm hover:bg-indigo-700 transition"
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  <span>Record for Project</span>
                </button>
              </div>

              {projectItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <p>No audio files have been assigned to this project folder yet.</p>
                  <p className="text-[11px]">
                    Tip: When generating speech in the AI Voice Studio, select this project in the footer dropdown!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          "{item.text}"
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Voice: {item.voice} • {item.language} • {item.characters} chars
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setStudioPreload({
                            text: item.text,
                            voice: item.voice,
                            language: item.language,
                          });
                          setActiveTab('studio');
                        }}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                      >
                        Open in Studio →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-8 text-xs text-slate-500">Select a project folder</p>
          )}
        </div>
      </div>
    </div>
  );
};
