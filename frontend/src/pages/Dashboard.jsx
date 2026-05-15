import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects, fetchDashboardStats } from '../store/projectSlice';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiAlertCircle, FiFolder } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const { projects, stats, isLoading } = useSelector((state) => state.project);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(fetchProjects());
      dispatch(fetchDashboardStats());
    }
  }, [token, dispatch]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 px-2 md:px-4"
    >

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-10 bg-gradient-to-br from-primary/20 via-surface to-surface shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl rounded-full" />

        <h1 className="text-3xl md:text-4xl font-bold textMain mb-3">
          {stats.totalProjects === 0
            ? `Welcome to DashOwl, ${user?.name.split(' ')[0]} 🚀`
            : `Welcome back, ${user?.name.split(' ')[0]} 👋`}
        </h1>

        <p className="text-textMuted text-sm md:text-base max-w-lg">
          {stats.totalProjects === 0
            ? "Start by creating your first project and bring your ideas to life."
            : "Here’s a quick overview of what’s happening with your projects."}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Projects', value: stats.totalProjects, icon: FiFolder, color: 'text-primary' },
          { title: 'Completed', value: stats.tasksCompleted, icon: FiCheckCircle, color: 'text-green-500' },
          { title: 'In Progress', value: stats.tasksInProgress, icon: FiClock, color: 'text-yellow-500' },
          { title: 'Overdue', value: stats.tasksOverdue, icon: FiAlertCircle, color: 'text-red-500' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="group rounded-2xl p-5 bg-surface/70 backdrop-blur-md border border-white/10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs uppercase tracking-wider text-textMuted font-medium">
                {stat.title}
              </p>
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>

            <p className="text-3xl font-bold textMain group-hover:scale-105 transition-transform">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* RECENT PROJECTS */}
      <div className="rounded-3xl p-6 md:p-8 bg-surface/70 backdrop-blur-md border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-bold textMain">
            Recent Projects
          </h2>
          <Link 
            to="/projects" 
            className="text-sm text-primary font-medium hover:underline"
          >
            View All →
          </Link>
        </div>

        {isLoading ? (
          <p className="text-textMuted">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-textMuted">No projects yet. Create one to begin.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((p) => (
              <Link to={`/projects/${p._id}`} key={p._id}>
                <div className="group rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-surface to-surface/40 hover:from-primary/10 hover:to-surface transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer">

                  <h3 className="text-lg font-semibold textMain mb-2 group-hover:text-primary transition">
                    {p.name}
                  </h3>

                  <p className="text-sm text-textMuted line-clamp-2">
                    {p.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between text-xs text-textMuted">
                    <span>{p.members?.length || 0} Members</span>
                    <span className="opacity-0 group-hover:opacity-100 transition">
                      Open →
                    </span>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default Dashboard;