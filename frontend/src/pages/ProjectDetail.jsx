import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchProjectDetails, createTask, updateTaskStatus, addMemberToProject, deleteProject } from '../store/projectSlice';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiPlus, FiArrowLeft, FiClock, FiUserPlus, FiTrash2, FiMail } from 'react-icons/fi';
import { format, parseISO, isPast } from 'date-fns';
import TaskDrawer from '../components/TaskDrawer';

const statusStyles = {
  Todo: 'bg-slate-400',
  'In Progress': 'bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.65)]',
  Review: 'bg-blue-400 shadow-[0_0_16px_rgba(96,165,250,0.55)]',
  Done: 'bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.55)]',
};

const TaskBoard = React.memo(({ columns, tasksByStatus, userId, currentProject, handleStatusChange, handleAssignTask, setSelectedTaskId }) => (
  <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
    <div className="flex gap-4 min-w-max h-full">
      {columns.map(status => {
        const colTasks = tasksByStatus[status] || [];
        return (
          <div key={status} className="w-[280px] sm:w-80 flex flex-col rounded-2xl border border-white/10 bg-slate-950/35 p-3 shadow-sm backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <h3 className="font-semibold flex items-center gap-2 text-textMain text-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${statusStyles[status] || 'bg-textMuted'}`} />
                {status}
              </h3>
              <span className="text-xs bg-white/[0.07] text-textMain px-2 py-1 rounded-md border border-white/10">{colTasks.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {colTasks.map(task => {
                const overdue = task.status !== 'Done' && task.dueDate && isPast(parseISO(task.dueDate));
                return (
                  <div 
                    key={task._id}
                    onClick={() => setSelectedTaskId(task._id)}
                    className={`group rounded-xl cursor-pointer border border-white/10 bg-surface/60 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-surface/80 ${
                      overdue ? 'border-l-4 border-l-danger bg-danger/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        task.priority === 'High' ? 'bg-danger/15 text-rose-200 border border-danger/20' :
                        task.priority === 'Medium' ? 'bg-warning/15 text-amber-200 border border-warning/20' : 'bg-success/15 text-emerald-200 border border-success/20'
                      }`}>{task.priority}</span>
                      {(userId && (task.assignedTo?._id === userId || currentProject.createdBy?._id === userId)) || !userId ? (
                        <select 
                          value={task.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className="text-xs bg-transparent text-textMuted outline-none cursor-pointer hover:text-textMain font-medium"
                        >
                          {columns.map(c => <option key={c} value={c} className="bg-surface text-textMain">{c}</option>)}
                        </select>
                      ) : (
                        <span className="text-[10px] bg-surface/50 text-textMuted px-2 py-0.5 rounded border border-textMain/5">
                          {task.status} (Read Only)
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm mb-1 text-textMain group-hover:text-cyan-200 transition-colors">{task.title}</h4>
                    <p className="text-xs text-textMuted line-clamp-2 mb-3">{task.description}</p>

                    <div className="flex items-center justify-between mt-auto">
                      {task.dueDate ? (
                        <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-danger font-medium' : 'text-textMuted'}`}>
                          <FiClock /> {format(parseISO(task.dueDate), 'MMM dd')}
                        </div>
                      ) : <div />}
                      {task.assignedTo && typeof task.assignedTo === 'object' && task.assignedTo.name ? (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-[10px] text-white font-bold" title={`Assigned to ${task.assignedTo.name}`}>
                          {task.assignedTo.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAssignTask(task._id); }}
                          className="text-[10px] bg-cyan-400/10 text-cyan-200 px-2 py-1 rounded hover:bg-cyan-400/20 transition-colors"
                        >
                          Assign Task
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
));
TaskBoard.displayName = 'TaskBoard';

const ProgressTable = React.memo(({ projectMembers, memberTasksMap, id }) => (
  <div className="flex-1 space-y-6">
    <div className="panel rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-3 min-w-[700px]">
          <thead>
            <tr className="bg-white/[0.04] border-b border-white/10">
              <th className="p-4 text-sm font-semibold text-textMuted">Member</th>
              <th className="p-4 text-sm font-semibold text-textMuted">Progress</th>
              <th className="p-4 text-sm font-semibold text-textMuted">Tasks</th>
              <th className="p-4 text-sm font-semibold text-textMuted text-right">View Detail</th>
            </tr>
          </thead>
          <tbody>
            {projectMembers.length > 0 ? projectMembers.map(member => {
              const memberTasks = memberTasksMap[member._id] || [];
              const completed = memberTasks.filter(t => t.status === 'Done').length;
              const total = memberTasks.length;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <tr key={member._id} className="border-b border-white/10 hover:bg-white/[0.04] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-textMain">{member.name}</p>
                        <p className="text-xs text-textMuted">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 w-64">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-textMain">{percent}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-4 text-xs">
                      <span className="text-textMuted"><b className="text-textMain">{completed}</b> Done</span>
                      <span className="text-textMuted"><b className="text-textMain">{total - completed}</b> Pending</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      to={`/projects/${id}/member/${member._id}/progress`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      Full Report <FiArrowLeft className="rotate-180" />
                    </Link>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="4" className="p-12 text-center text-textMuted">
                  No members have been added to this project yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));
ProgressTable.displayName = 'ProgressTable';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { currentProject, tasks, isLoading } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'progress'
  const [viewMode, setViewMode] = useState(user?.role === 'Admin' ? 'team-board' : 'my-tasks'); // 'my-tasks' or 'team-board'
  
  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState(user?._id || '');

  // Member form state
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (token) dispatch(fetchProjectDetails(id));
  }, [id, token, dispatch]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createTask({ 
      title, description, project: id, priority, dueDate, assignedTo: assignedTo || null 
    }));
    if (createTask.fulfilled.match(resultAction)) {
      setShowModal(false);
      setTitle(''); setDescription(''); setPriority('Medium'); setDueDate(''); setAssignedTo('');
    }
  };

  const handleStatusChange = useCallback((taskId, newStatus) => {
    dispatch(updateTaskStatus({ taskId, status: newStatus }));
  }, [dispatch]);

  const handleAssignTask = useCallback((taskId) => {
    setTaskToAssign(taskId);
    setShowAssignModal(true);
  }, []);

  const submitAssignment = (memberId) => {
    dispatch(updateTaskStatus({ taskId: taskToAssign, assignedTo: memberId }));
    setShowAssignModal(false);
    setTaskToAssign(null);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(addMemberToProject({ projectId: id, email }));
    if (addMemberToProject.fulfilled.match(resultAction)) {
      setShowMemberModal(false);
      setEmail('');
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      const resultAction = await dispatch(deleteProject(id));
      if (deleteProject.fulfilled.match(resultAction)) {
        navigate('/projects');
      }
    }
  };

  const columns = useMemo(() => ['Todo', 'In Progress', 'Review', 'Done'], []);

  const projectMembers = useMemo(() => [
    ...(currentProject?.members || []),
    ...(currentProject?.createdBy?._id && !(currentProject?.members || []).some(member => member._id === currentProject.createdBy._id)
      ? [currentProject.createdBy]
      : [])
  ], [currentProject]);

  const filteredTasks = useMemo(() => {
    if (viewMode === 'my-tasks') {
      return tasks.filter(task => task.assignedTo?._id === user?._id);
    }
    return tasks;
  }, [tasks, viewMode, user?._id]);

  const tasksByStatus = useMemo(() => {
    return columns.reduce((result, status) => {
      result[status] = filteredTasks.filter(task => task.status === status);
      return result;
    }, {});
  }, [columns, filteredTasks]);

  const memberTasksMap = useMemo(() => {
    return filteredTasks.reduce((map, task) => {
      const memberId = task.assignedTo?._id;
      if (!memberId) return map;
      if (!map[memberId]) map[memberId] = [];
      map[memberId].push(task);
      return map;
    }, {});
  }, [filteredTasks]);

  if (isLoading || !currentProject) return (
    <div className="space-y-4">
      <div className="skeleton h-44 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map(item => <div key={item} className="skeleton h-80 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="panel rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="space-y-4">
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-textMuted hover:text-primary mb-2 transition-colors">
            <FiArrowLeft /> Back to Projects
          </Link>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-textMain">{currentProject.name}</h1>
            <p className="text-sm text-textMuted max-w-2xl">{currentProject.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-textMuted mb-2">Team Members</p>
              <p className="text-xl font-semibold text-textMain">{projectMembers.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-textMuted mb-2">Tasks</p>
              <p className="text-xl font-semibold text-textMain">{tasks.length}</p>
            </div>
            <div className="relative rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <button
                type="button"
                onClick={() => setShowMembersList(prev => !prev)}
                className="w-full text-left"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-textMuted mb-2">Members</p>
                <div className="flex flex-wrap items-center gap-2">
                  {projectMembers.length > 0 ? projectMembers.slice(0, 5).map(member => (
                    <div
                      key={member._id}
                      title={member.name}
                      className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-slate-950"
                    >
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                  )) : (
                    <span className="text-sm text-textMuted">No members</span>
                  )}
                  {projectMembers.length > 5 && (
                    <span className="text-xs font-semibold text-textMuted">+{projectMembers.length - 5}</span>
                  )}
                </div>
              </button>

              {showMembersList && (
                <div className="absolute left-0 right-0 top-full mt-2 z-[120] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
                  {projectMembers.map(member => (
                    <Link
                      key={member._id}
                      to={`/projects/${id}/member/${member._id}/progress`}
                      onClick={() => setShowMembersList(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-cyan-400/10 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-textMain truncate">{member.name}</p>
                        <p className="text-xs text-textMuted truncate flex items-center gap-1">
                          <FiMail size={12} /> {member.email || 'No email'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        <div className="flex flex-wrap items-center gap-3 justify-end">
          {user?.role === 'Admin' && (
            <>
              <button 
                onClick={() => setShowMemberModal(true)}
                className="btn-muted flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                <FiUserPlus /> Add Member
              </button>
              <button 
                onClick={handleDeleteProject}
                className="flex items-center gap-2 bg-danger/10 text-danger px-4 py-2 rounded-lg hover:bg-danger/20 border border-danger/20 transition-colors"
                title="Delete Project"
              >
                <FiTrash2 /> Delete
              </button>
            </>
          )}
          <Link 
            to={`/projects/${id}/member/${user?._id}/progress`}
            className="btn-muted flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            My Progress
          </Link>
          {(user?.role === 'Admin' || currentProject.createdBy?._id === user?._id) && (
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <FiPlus /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/35 p-2 sm:p-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex overflow-hidden rounded-xl bg-white/[0.04] border border-white/10 shadow-sm">
            <button 
              onClick={() => setActiveTab('board')}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === 'board' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'text-textMuted hover:text-textMain hover:bg-white/[0.04]'}`}
            >
              Task Board
            </button>
            <button 
              onClick={() => setActiveTab('progress')}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === 'progress' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'text-textMuted hover:text-textMain hover:bg-white/[0.04]'}`}
            >
              Team Progress
            </button>
          </div>
          {user?.role !== 'Admin' && activeTab === 'board' && (
            <div className="flex items-center gap-2 p-1 bg-white/[0.04] rounded-xl border border-white/10">
              <button 
                onClick={() => setViewMode('my-tasks')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'my-tasks' ? 'bg-primary text-slate-950 shadow-md' : 'text-textMuted hover:text-textMain'}`}
              >
                My Tasks
              </button>
              <button 
                onClick={() => setViewMode('team-board')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'team-board' ? 'bg-primary text-slate-950 shadow-md' : 'text-textMuted hover:text-textMain'}`}
              >
                Team Board
              </button>
            </div>
          )}
        </div>
      </div>

<div className={activeTab === 'board' ? '' : 'hidden'}>
        <TaskBoard
          columns={columns}
          tasksByStatus={tasksByStatus}
          userId={user?._id}
          currentProject={currentProject}
          handleStatusChange={handleStatusChange}
          handleAssignTask={handleAssignTask}
          setSelectedTaskId={setSelectedTaskId}
        />
      </div>
      <div className={activeTab === 'progress' ? '' : 'hidden'}>
        <ProgressTable
          projectMembers={projectMembers}
          memberTasksMap={memberTasksMap}
          id={id}
        />
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Create Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm text-textMuted mb-1">Task Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="field" />
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-1">Description</label>
                <textarea rows="2" value={description} onChange={e => setDescription(e.target.value)} className="field"></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-textMuted mb-1">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className="field">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-1">Assignee</label>
                  <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="field">
                    <option value="">Unassigned</option>
                    {projectMembers.map(member => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-sm text-textMuted mb-1">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="field" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-muted px-4 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg">Add Task</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add Member to Project</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm text-textMuted mb-1">User Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" className="field" />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn-muted px-4 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg">Add Member</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-sm p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-textMain">Assign Task</h2>
            <p className="text-sm text-textMuted mb-6">Select a team member to assign this task to:</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {projectMembers.length > 0 ? (
                <>
                  {projectMembers.map(member => (
                    <button 
                      key={member._id}
                      onClick={() => submitAssignment(member._id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-textMain">{member.name}</p>
                        <p className="text-xs text-textMuted">{member.email}</p>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-textMain/10 my-2 pt-2">
                    <button 
                      onClick={() => submitAssignment(user._id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/10 border border-transparent hover:border-secondary/20 transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-textMain">Assign to Me (Admin)</p>
                        <p className="text-xs text-textMuted">Keep this task for yourself</p>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-textMuted mb-4">No members in this project yet.</p>
                  <button 
                    onClick={() => submitAssignment(user._id)}
                    className="btn-primary w-full py-3 rounded-xl"
                  >
                    Assign to Me (Admin)
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-textMain/10">
              <button 
                onClick={() => setShowAssignModal(false)}
                className="w-full py-2 text-sm text-textMuted hover:text-textMain transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Task Drawer */}
      <TaskDrawer 
        taskId={selectedTaskId} 
        onClose={() => setSelectedTaskId(null)} 
        columns={columns} 
      />
    </div>
  );
};

export default ProjectDetail;
