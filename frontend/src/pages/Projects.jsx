import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects, createProject, deleteProject } from '../store/projectSlice';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiFolder, FiUsers, FiTrash2 } from 'react-icons/fi';

const Projects = () => {
  const { user, token } = useSelector((state) => state.auth);
  const { projects, isLoading } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const searchQuery = searchParams.get('search')?.trim().toLowerCase() || '';
  const filteredProjects = searchQuery
    ? projects.filter(project => {
        const projectName = project.name?.toLowerCase() || '';
        const projectDescription = project.description?.toLowerCase() || '';
        return projectName.includes(searchQuery) || projectDescription.includes(searchQuery);
      })
    : projects;

  useEffect(() => {
    if (token) dispatch(fetchProjects());
  }, [token, dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createProject({ name, description }));
    if (createProject.fulfilled.match(resultAction)) {
      setShowModal(false);
      setName('');
      setDescription('');
    }
  };

  const handleDelete = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will also be removed.')) {
      dispatch(deleteProject(projectId));
    }
  };

  return (
    <div className="space-y-5">
      <div className="panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-textMain">Projects</h1>
          <p className="text-sm text-textMuted">Manage your team projects and workspaces.</p>
        </div>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <FiPlus /> New Project
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(item => <div key={item} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map((p, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              key={p._id}
              className="relative group"
            >
              <Link to={`/projects/${p._id}`}>
                <div className="interactive-card glass p-5 rounded-2xl h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400/15 to-blue-600/15 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FiFolder className="text-2xl text-primary" />
                    </div>
                    {user?.role === 'Admin' && (
                      <button 
                        onClick={(e) => handleDelete(e, p._id)}
                        className="p-2 text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title="Delete Project"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-textMain group-hover:text-cyan-200 transition-colors">{p.name}</h3>
                  <p className="text-sm text-textMuted flex-1 line-clamp-3">{p.description || 'No description'}</p>
                  
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-sm text-textMuted">
                    <span className="flex items-center gap-1"><FiUsers /> {p.members?.length || 0} Members</span>
                    <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.8)]" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-12 text-center glass rounded-2xl border border-dashed border-white/10">
              <FiFolder className="text-4xl text-textMuted mx-auto mb-3" />
              <p className="text-textMuted">
                {searchQuery ? 'No projects match your search.' : 'No projects found.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-textMuted mb-1">Project Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="field" />
              </div>
              <div>
                <label className="block text-sm text-textMuted mb-1">Description</label>
                <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} className="field"></textarea>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-muted px-4 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg">Create Project</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Projects;
