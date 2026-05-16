import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMail, FiShield, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const { token, user } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get('/users');
        setTeam(res.data);
      } catch (error) {
        console.error('Failed to fetch team:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.role === 'Admin') fetchTeam();
  }, [token, user]);

  const handleDeleteMember = async (member) => {
    if (member._id === user?._id) {
      toast.error('You cannot delete your own account from Team Directory.');
      return;
    }

    if (!window.confirm(`Delete ${member.name}? This will remove their account and project memberships.`)) {
      return;
    }

    try {
      await api.delete(`/users/${member._id}`);
      setTeam(prevTeam => prevTeam.filter(teamMember => teamMember._id !== member._id));
      toast.success('Team member deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete team member');
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="p-8 text-center text-textMuted flex flex-col items-center justify-center h-full">
        <FiShield size={48} className="mb-4 text-primary/50" />
        <h2 className="text-xl font-bold text-textMain mb-2">Access Restricted</h2>
        <p>Only Administrators can view the team management page.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="panel rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-textMain">Team Directory</h1>
            <p className="text-sm text-textMuted">Manage all members of your organization.</p>
          </div>
          <button 
          onClick={() => setShowInvite(true)}
          className="btn-primary px-4 py-2 rounded-lg"
        >
          Invite Member
        </button>
      </div>
    </div>

      <div className="panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[600px]">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/10">
                <th className="p-4 text-sm font-semibold text-textMuted">Member</th>
                <th className="p-4 text-sm font-semibold text-textMuted">Role</th>
                <th className="p-4 text-sm font-semibold text-textMuted">Joined</th>
                <th className="p-4 text-sm font-semibold text-textMuted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="p-6"><div className="skeleton h-12 rounded-xl" /></td></tr>
              ) : team.map(member => (
                <tr key={member._id} className="border-b border-white/10 hover:bg-white/[0.04] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <img src={member.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-textMain truncate">{member.name}</p>
                        <p className="text-sm text-textMuted flex items-center gap-1 truncate"><FiMail size={12}/> {member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.role === 'Admin' ? 'bg-blue-400/15 text-blue-200 border border-blue-300/20' : 'bg-cyan-400/15 text-cyan-200 border border-cyan-300/20'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-textMuted">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member)}
                      disabled={member._id === user?._id}
                      title={member._id === user?._id ? 'You cannot delete your own account here' : `Delete ${member.name}`}
                      className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-textMain">Invite New Member</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              toast.success(`Invitation sent to ${inviteEmail}!`);
              setShowInvite(false);
              setInviteEmail('');
            }} className="space-y-4">
              <div>
                <label className="block text-sm text-textMuted mb-1">Email Address</label>
                <input required type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="field" />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowInvite(false)} className="btn-muted px-4 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg">Send Invite</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Team;
