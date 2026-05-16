import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects, fetchDashboardStats } from '../store/projectSlice';
import { motion } from 'framer-motion';
import { FiActivity, FiAlertCircle, FiCheckCircle, FiClock, FiFolder, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const chartColors = ['#06b6d4', '#2563eb', '#f59e0b', '#22c55e'];

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

  const firstName = user?.name?.split(' ')[0] || 'there';
  const totalTrackedTasks = Math.max(
    (stats.tasksCompleted || 0) + (stats.tasksInProgress || 0) + (stats.tasksOverdue || 0),
    1
  );
  const completionRate = Math.round(((stats.tasksCompleted || 0) / totalTrackedTasks) * 100);

  const statusData = useMemo(() => [
    { name: 'Done', value: stats.tasksCompleted || 0 },
    { name: 'Active', value: stats.tasksInProgress || 0 },
    { name: 'Overdue', value: stats.tasksOverdue || 0 },
    { name: 'Projects', value: stats.totalProjects || 0 },
  ], [stats]);

  const velocityData = useMemo(() => {
    const completed = stats.tasksCompleted || 0;
    const active = stats.tasksInProgress || 0;
    const overdue = stats.tasksOverdue || 0;
    return [
      { day: 'Mon', done: Math.max(1, Math.round(completed * 0.12)), active: Math.max(1, Math.round(active * 0.18)) },
      { day: 'Tue', done: Math.max(1, Math.round(completed * 0.18)), active: Math.max(1, Math.round(active * 0.24)) },
      { day: 'Wed', done: Math.max(1, Math.round(completed * 0.22)), active: Math.max(1, Math.round(active * 0.16)) },
      { day: 'Thu', done: Math.max(1, Math.round(completed * 0.16)), active: Math.max(1, Math.round(active * 0.22)) },
      { day: 'Fri', done: Math.max(1, Math.round(completed * 0.24)), active: Math.max(1, Math.round(active * 0.2 + overdue * 0.2)) },
    ];
  }, [stats]);

  const statCards = [
    { title: 'Total Projects', value: stats.totalProjects, icon: FiFolder, tone: 'text-cyan-300', caption: 'Active workspaces' },
    { title: 'Completed', value: stats.tasksCompleted, icon: FiCheckCircle, tone: 'text-emerald-300', caption: `${completionRate}% completion rate` },
    { title: 'In Progress', value: stats.tasksInProgress, icon: FiClock, tone: 'text-amber-300', caption: 'Currently moving' },
    { title: 'Overdue', value: stats.tasksOverdue, icon: FiAlertCircle, tone: 'text-rose-300', caption: 'Needs attention' },
  ];

  const tooltipStyle = {
    background: 'rgba(2, 6, 23, 0.94)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 10,
    color: '#e2e8f0',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-5">
        <section className="panel relative overflow-hidden rounded-2xl p-6 md:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
                <FiActivity /> Live workspace
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-textMain">
                Welcome back, {firstName}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-textMuted">
                A compact command center for projects, task flow, and team momentum.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-72">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-textMuted">Focus</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-200">{stats.tasksInProgress || 0}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-cyan-400/15 to-blue-600/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-textMuted">Health</p>
                <p className="mt-2 text-2xl font-semibold text-textMain">{completionRate}%</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-textMuted">Task mix</p>
              <h2 className="text-lg font-semibold text-textMain">Status Analytics</h2>
            </div>
            <FiTrendingUp className="text-primary" />
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="interactive-card rounded-2xl border border-white/10 bg-surface/55 p-5 backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-textMuted">{stat.title}</p>
              <div className={`rounded-lg border border-white/10 bg-white/[0.05] p-2.5 ${stat.tone}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-textMain">{stat.value || 0}</p>
            <p className="mt-2 text-xs text-textMuted">{stat.caption}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.85fr] gap-5">
        <section className="panel rounded-2xl p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-textMuted">Velocity</p>
              <h2 className="text-lg font-semibold text-textMain">Weekly Throughput</h2>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="doneGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="activeGlow" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="done" stroke="#06b6d4" fill="url(#doneGlow)" strokeWidth={2} />
                <Area type="monotone" dataKey="active" stroke="#2563eb" fill="url(#activeGlow)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel rounded-2xl p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-textMuted">Projects</p>
              <h2 className="text-lg font-semibold text-textMain">Recent Workspaces</h2>
            </div>
            <Link to="/projects" className="text-sm font-medium text-primary hover:text-cyan-200 transition-colors">
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
              <FiFolder className="mx-auto mb-3 text-3xl text-textMuted" />
              <p className="text-sm text-textMuted">No projects yet. Create one to begin.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((project, index) => (
                <Link
                  to={`/projects/${project._id}`}
                  key={project._id}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-200 hover:border-cyan-300/35 hover:bg-cyan-400/[0.06]"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-cyan-200 ring-1 ring-white/10">
                    <FiFolder />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-textMain group-hover:text-cyan-200 transition-colors">
                      {project.name}
                    </h3>
                    <p className="truncate text-xs text-textMuted">{project.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-textMuted">
                    <FiUsers /> {project.members?.length || 0}
                  </div>
                  <span className="text-xs text-textMuted">#{index + 1}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="panel rounded-2xl p-5">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.18em] text-textMuted">Distribution</p>
          <h2 className="text-lg font-semibold text-textMain">Operational Snapshot</h2>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;
