import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { logout } from './authSlice';

const getAuthToken = (state) => {
  const token = state.auth.token;
  return token && token !== 'null' && token !== 'undefined' ? token : null;
};

const rejectProtectedRequest = (error, thunkAPI, fallbackMessage) => {
  const message = error.response?.data?.message || fallbackMessage;
  if (error.response?.status === 401) {
    thunkAPI.dispatch(logout());
  }
  return thunkAPI.rejectWithValue(message);
};

export const fetchProjects = createAsyncThunk('project/fetchProjects', async (_, thunkAPI) => {
  try {
    const token = getAuthToken(thunkAPI.getState());
    if (!token) {
      return thunkAPI.rejectWithValue('Not authenticated');
    }

    const res = await api.get('/projects');
    return res.data;
  } catch (error) {
    toast.error('Failed to fetch projects');
    return rejectProtectedRequest(error, thunkAPI, 'Failed to fetch projects');
  }
});

export const fetchDashboardStats = createAsyncThunk('project/fetchStats', async (_, thunkAPI) => {
  try {
    const token = getAuthToken(thunkAPI.getState());
    if (!token) {
      return thunkAPI.rejectWithValue('Not authenticated');
    }

    const res = await api.get('/dashboard/stats');
    return res.data;
  } catch (error) {
    return rejectProtectedRequest(error, thunkAPI, 'Failed to fetch dashboard stats');
  }
});

export const fetchProjectDetails = createAsyncThunk('project/fetchDetails', async (projectId, thunkAPI) => {
  try {
    const projectRes = await api.get(`/projects/${projectId}`);
    const tasksRes = await api.get(`/tasks/project/${projectId}`);
    return { project: projectRes.data, tasks: tasksRes.data };
  } catch (error) {
    toast.error('Failed to fetch project details');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const createProject = createAsyncThunk('project/create', async (projectData, thunkAPI) => {
  try {
    const res = await api.post('/projects', projectData);
    toast.success('Project created');
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create project');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const createTask = createAsyncThunk('project/createTask', async (taskData, thunkAPI) => {
  try {
    const res = await api.post('/tasks', taskData);
    toast.success('Task created');
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create task');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const updateTaskStatus = createAsyncThunk('project/updateTaskStatus', async ({ taskId, ...updateData }, thunkAPI) => {
  try {
    const res = await api.put(`/tasks/${taskId}`, updateData);
    toast.success('Task updated successfully!');
    return res.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Failed to update task';
    toast.error(errorMsg);
    return thunkAPI.rejectWithValue(errorMsg);
  }
});

export const addMemberToProject = createAsyncThunk('project/addMember', async ({ projectId, email }, thunkAPI) => {
  try {
    const res = await api.post(`/projects/${projectId}/members`, { email });
    toast.success('Member added successfully');
    return res.data; // Returns updated project
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add member');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const deleteProject = createAsyncThunk('project/delete', async (projectId, thunkAPI) => {
  try {
    await api.delete(`/projects/${projectId}`);
    toast.success('Project deleted');
    return projectId;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete project');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const addTaskComment = createAsyncThunk('project/addComment', async ({ taskId, text }, thunkAPI) => {
  try {
    const res = await api.post(`/tasks/${taskId}/comments`, { text });
    return res.data; // Returns updated task
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to add comment');
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

const initialState = {
  projects: [],
  currentProject: null,
  tasks: [],
  stats: { totalProjects: 0, tasksCompleted: 0, tasksInProgress: 0, tasksOverdue: 0 },
  isLoading: false,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state) => { state.isLoading = false; })
      
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      .addCase(fetchProjectDetails.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload.project;
        state.tasks = action.payload.tasks;
      })
      .addCase(fetchProjectDetails.rejected, (state) => { state.isLoading = false; })

      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })
      
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
      })
      
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      
      .addCase(addMemberToProject.fulfilled, (state, action) => {
        state.currentProject = action.payload;
      })
      
      .addCase(addTaskComment.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      });
  }
});

export default projectSlice.reducer;
