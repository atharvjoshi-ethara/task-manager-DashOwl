import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiFolder, FiLogOut, FiMenu, FiX, FiCheckCircle, FiSearch, FiBell, FiSettings, FiUsers } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { fetchNotifications } from '../store/notificationSlice';
import { fetchProjects } from '../store/projectSlice';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPanel from './NotificationPanel';

const Layout = () => {
  const { user, token } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);
  const { projects } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (user && token) {
      dispatch(fetchNotifications());
      if (projects.length === 0) {
        dispatch(fetchProjects());
      }
      
      // Add polling to check for new notifications every 30 seconds
      const interval = setInterval(() => {
        dispatch(fetchNotifications());
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [dispatch, user, token, projects.length]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    const syncSearch = setTimeout(() => {
      if (location.pathname !== '/projects') {
        setSearchQuery('');
        return;
      }

      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get('search') || '');
    }, 0);

    return () => clearTimeout(syncSearch);
  }, [location.pathname, location.search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearchFocused(true);

    if (location.pathname === '/projects') {
      const query = value.trim();
      navigate(query ? `/projects?search=${encodeURIComponent(query)}` : '/projects', { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    setIsSearchFocused(false);
    navigate(query ? `/projects?search=${encodeURIComponent(query)}` : '/projects');
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (token && projects.length === 0) {
      dispatch(fetchProjects());
    }
  };

  const fuzzyMatch = (text, query) => {
    if (!query) return false;
    if (text.includes(query)) return true;

    let queryIndex = 0;
    for (const char of text) {
      if (char === query[queryIndex]) queryIndex += 1;
      if (queryIndex === query.length) return true;
    }

    const queryChars = new Set(query);
    let matches = 0;
    queryChars.forEach(char => {
      if (text.includes(char)) matches += 1;
    });

    return matches >= Math.max(2, Math.ceil(queryChars.size * 0.6));
  };

  const matchingProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return projects
      .filter(project => {
        const name = project.name?.toLowerCase() || '';
        const description = project.description?.toLowerCase() || '';
        return fuzzyMatch(name, query) || fuzzyMatch(description, query);
      })
      .slice(0, 6);
  }, [projects, searchQuery]);

  const handleSuggestionSelect = (projectId) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    navigate(`/projects/${projectId}`);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: FiHome },
    { name: 'Projects', path: '/projects', icon: FiFolder },
    { name: 'Team', path: '/team', icon: FiUsers },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-background flex overflow-hidden text-textMain">
      {/* Sidebar Backdrop for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 w-64 h-screen bg-slate-950/75 border-r border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out backdrop-blur-2xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <h1 className="text-lg font-bold text-gradient flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-300/20">
              <FiCheckCircle className="text-primary" />
            </span>
            Atharv.Joshi Task Manager
          </h1>
          <button className="md:hidden text-textMuted p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => {
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={({ isActive }) => 
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-cyan-400/10 text-cyan-200 font-semibold border border-cyan-300/20 shadow-[inset_3px_0_0_rgba(34,211,238,0.7)]' 
                    : 'text-textMuted hover:bg-white/[0.06] hover:text-textMain hover:translate-x-1'
                }`
              }
            >
              <link.icon size={20} />
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Summary */}
        <div className="p-4 m-3 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-cyan-950/40">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-textMain">{user?.name}</p>
              <p className="text-xs text-textMuted truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors font-medium"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Sticky Top Navbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-6 bg-slate-950/55 backdrop-blur-xl border-b border-white/10 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-textMain p-2 hover:bg-white/10 rounded-lg transition-colors">
              <FiMenu size={24} />
            </button>
            <div className="relative hidden sm:block w-48 lg:w-64">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-slate-950/70 border border-white/10 rounded-lg px-3 py-2 focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-400/10 transition-all"
              >
                <FiSearch className="text-textMuted mr-2" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 180)}
                  placeholder="Search projects..."
                  className="bg-transparent text-sm w-full outline-none text-textMain placeholder-textMuted"
                />
              </form>
              {isSearchFocused && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl z-[100] backdrop-blur-xl">
                  {matchingProjects.length > 0 ? (
                    matchingProjects.map(project => (
                      <button
                        key={project._id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionSelect(project._id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cyan-400/10 transition-colors"
                      >
                        <FiFolder className="text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-textMain truncate">{project.name}</p>
                          {project.description && (
                            <p className="text-xs text-textMuted truncate">{project.description}</p>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-textMuted">No matching projects</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative p-2 transition-colors rounded-lg ${isNotificationOpen ? 'text-primary bg-primary/10' : 'text-textMuted hover:text-textMain hover:bg-white/10'}`}
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-[10px] text-white flex items-center justify-center rounded-full border-2 border-slate-950 font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {isNotificationOpen && (
                <NotificationPanel onClose={() => setIsNotificationOpen(false)} />
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => navigate('/settings')}
              aria-label="Open account settings"
              title="Account settings"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 hover:ring-2 hover:ring-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto flex flex-col relative custom-scrollbar">
          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
          
          {/* Footer */}
          <footer className="w-full py-6 px-4 md:px-8 border-t border-white/5 bg-slate-950/30 mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-textMuted">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-primary" />
                  <span className="font-bold text-textMain">Atharv.Joshi Task Manager</span>
                </div>
                <span className="hidden md:inline text-textMain/20">|</span>
                <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 font-medium">
                <button 
                  onClick={() => import('react-hot-toast').then(({ default: toast }) => toast('Privacy Policy coming soon!', { icon: '📄' }))}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Privacy
                </button>
                <button 
                  onClick={() => import('react-hot-toast').then(({ default: toast }) => toast('Terms of Service coming soon!', { icon: '⚖️' }))}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Terms
                </button>
                <button 
                  onClick={() => import('react-hot-toast').then(({ default: toast }) => toast('Contact Support coming soon!', { icon: '💬' }))}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Support
                </button>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Layout;
