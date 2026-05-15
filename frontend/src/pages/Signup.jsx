import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../store/authSlice';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';

const Signup = () => {
  const API_URL = import.meta.env.PROD 
    ? '/api' 
    : 'http://localhost:5000/api';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Member');
  const [adminCode, setAdminCode] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);
  const { isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(signupUser({ name, email, password, role, adminCode }));
    if (signupUser.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain dark:bg-background dark:text-textMain flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] shadow-[0_40px_120px_rgba(15,23,42,0.15)]">
        <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[1fr_1fr] bg-surface text-textMain dark:bg-surface dark:text-textMain">
          <div className="bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#1e40af] p-10 sm:p-12 lg:p-16 text-white flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.35em] text-white/70">Welcome to</p>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 flex items-center justify-center rounded-3xl bg-white/15">
                    <FiCheckCircle className="text-2xl text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold">DashOwl</p>
                    <p className="text-sm text-white/70">Your task dashboard.</p>
                  </div>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-7 text-white/75">
                Build your account with confidence. Create a secure profile and start managing projects and teams instantly.
              </p>

              <div className="space-y-3 text-sm text-white/75">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                  <span>Fast setup</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                  <span>Private & secure</span>
                </div>
              </div>
            </div>

            <div className="text-xs uppercase tracking-[0.35em] text-white/40">
              Creator here | Designer here
            </div>
          </div>

          <div className="p-8 sm:p-12 lg:p-14 bg-surface text-textMain dark:bg-surface dark:text-textMain">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-textMain dark:text-textMain">Create your account</h1>
                <p className="mt-3 text-sm text-textMuted dark:text-textMuted">Join DashOwl and start managing tasks with your team.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-textMuted dark:text-textMuted mb-2">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted dark:text-textMuted" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-3xl border border-textMain/10 bg-surface px-12 py-4 text-textMain placeholder:text-textMuted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition dark:bg-surface dark:text-textMain"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textMuted dark:text-textMuted mb-2">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted dark:text-textMuted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-3xl border border-textMain/10 bg-surface px-12 py-4 text-textMain placeholder:text-textMuted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition dark:bg-surface dark:text-textMain"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textMuted dark:text-textMuted mb-2">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted dark:text-textMuted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-3xl border border-textMain/10 bg-surface px-12 py-4 text-textMain placeholder:text-textMuted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition dark:bg-surface dark:text-textMain"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textMuted dark:text-textMuted mb-2">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-3xl border border-textMain/10 bg-surface px-4 py-4 text-textMain focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition dark:bg-surface dark:text-textMain"
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                {role === 'Admin' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                    <label className="block text-sm font-medium text-textMuted dark:text-textMuted mb-2">Admin Secret Key</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted dark:text-textMuted" />
                      <input
                        type={showAdminCode ? 'text' : 'password'}
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        required={role === 'Admin'}
                        className="w-full rounded-3xl border border-textMain/10 bg-surface px-12 py-4 text-textMain placeholder:text-textMuted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition dark:bg-surface dark:text-textMain"
                        placeholder="Enter secret admin key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminCode((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain"
                        aria-label={showAdminCode ? 'Hide admin key' : 'Show admin key'}
                      >
                        {showAdminCode ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-3xl bg-primary py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-textMuted dark:text-textMuted">
                <span className="flex-1 h-px bg-textMain/10" />
                <span>Or continue with</span>
                <span className="flex-1 h-px bg-textMain/10" />
              </div>

              <a
                href={`${API_URL}/auth/google`}
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-3xl border border-textMain/10 bg-surface px-5 py-4 text-sm font-medium text-textMain transition hover:bg-surface/95 dark:bg-surface dark:text-textMain dark:hover:bg-surface/90"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </a>

              <p className="mt-6 text-center text-sm text-textMuted dark:text-textMuted">
                Already have an account? <Link to="/login" className="font-medium text-primary hover:text-secondary">Sign in</Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
