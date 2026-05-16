import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  tasks: [],
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/projects');
      set({ projects: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
      toast.error('Failed to fetch projects');
    }
  },

  fetchProjectDetails: async (projectId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/projects/${projectId}`);
      const tasksRes = await api.get(`/tasks/project/${projectId}`);
      set({ currentProject: res.data, tasks: tasksRes.data, isLoading: false });
    } catch {
      set({ isLoading: false });
      toast.error('Failed to fetch project details');
    }
  },

  createProject: async (projectData) => {
    try {
      const res = await api.post('/projects', projectData);
      set((state) => ({ projects: [...state.projects, res.data] }));
      toast.success('Project created');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
      return false;
    }
  },

  createTask: async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      set((state) => ({ tasks: [...state.tasks, res.data] }));
      toast.success('Task created');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
      return false;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status });
      set((state) => ({
        tasks: state.tasks.map(t => t._id === taskId ? res.data : t)
      }));
    } catch {
      toast.error('Failed to update task');
    }
  }
}));

export default useProjectStore;
