import { useState, useEffect } from 'react';
import { 
  FiUsers, FiUserPlus, FiShield, FiMail, FiCheck, 
  FiClock, FiTrash2, FiSettings, FiX, FiUser, FiCheckCircle 
} from 'react-icons/fi';
import api from '../services/api';

export default function TeamPage() {
  const [team, setTeam] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teams');
      setTeam(res.data.team);
      setPendingApprovals(res.data.pendingApprovals || []);
    } catch (err) {
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams/invite', { email: inviteEmail, role: inviteRole });
      setShowInviteModal(false);
      setInviteEmail('');
      fetchTeamData();
      alert('Invitation sent successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send invite');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from your team?')) return;
    try {
      await api.delete(`/teams/members/${memberId}`);
      fetchTeamData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleApprovalAction = async (postId, status) => {
    try {
      await api.post(`/teams/posts/${postId}/review`, { status });
      fetchTeamData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update post status');
    }
  };

  const handleToggleRequireApproval = async () => {
    if (!team) return;
    try {
      const res = await api.patch('/teams/settings', {
        requireApproval: !team.requireApproval
      });
      setTeam(res.data.team);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update setting');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiUsers className="text-primary-400" /> Team Workspace
          </h1>
          <p className="text-surface-400 text-sm">
            Collaborate with team members, assign roles, and streamline post approval workflows
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-primary-600/20 transition-all hover:scale-[1.02]"
        >
          <FiUserPlus size={18} /> Invite Team Member
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-900/60 border border-surface-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Team Name</span>
            <h3 className="text-xl font-bold text-white mt-1">{team?.name || 'My Workspace Team'}</h3>
          </div>
          <div className="p-3 bg-primary-500/10 text-primary-400 rounded-xl">
            <FiUsers size={24} />
          </div>
        </div>

        <div className="bg-surface-900/60 border border-surface-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Team Size</span>
            <h3 className="text-xl font-bold text-white mt-1">{team?.members?.length || 1} Members</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <FiUser size={24} />
          </div>
        </div>

        <div className="bg-surface-900/60 border border-surface-800/80 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Pending Approvals</span>
            <h3 className="text-xl font-bold text-amber-400 mt-1">{pendingApprovals.length} Posts</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <FiClock size={24} />
          </div>
        </div>
      </div>

      {/* Workflow Settings Card */}
      <div className="bg-surface-900/60 border border-surface-800/80 p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-surface-800 text-surface-200 rounded-xl">
            <FiShield size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-white">Post Approval Workflow</h4>
            <p className="text-xs text-surface-400">
              When enabled, posts created by Editors must be reviewed and approved by Admins before scheduling.
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleRequireApproval}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            team?.requireApproval ? 'bg-primary-600' : 'bg-surface-800'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              team?.requireApproval ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Main Content Grid: Members List & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members Column */}
        <div className="lg:col-span-2 bg-surface-900/60 border border-surface-800/80 rounded-2xl overflow-hidden p-5">
          <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
            <FiUsers className="text-primary-400" /> Active Members & Invites
          </h3>

          <div className="divide-y divide-surface-800/60">
            {team?.members?.map((member) => (
              <div key={member._id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm uppercase">
                    {member.user?.name ? member.user.name.charAt(0) : member.email.charAt(0)}
                  </div>

                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {member.user?.name || member.email.split('@')[0]}
                      {member.status === 'pending' && (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded-md font-semibold">
                          Pending Invite
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-surface-400">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                    member.role === 'admin' 
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : member.role === 'editor'
                      ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                      : 'bg-surface-800 text-surface-400'
                  }`}>
                    {member.role}
                  </span>

                  {member.role !== 'admin' && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="p-1.5 text-surface-500 hover:text-rose-400 transition"
                      title="Remove member"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approval Queue */}
        <div className="bg-surface-900/60 border border-surface-800/80 rounded-2xl overflow-hidden p-5">
          <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
            <FiClock className="text-amber-400" /> Pending Approvals
          </h3>

          {pendingApprovals.length === 0 ? (
            <div className="text-center py-10 text-surface-500 text-sm">
              <FiCheckCircle size={32} className="mx-auto mb-2 text-teal-400/60" />
              All caught up! No posts awaiting review.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((post) => (
                <div key={post._id} className="bg-surface-950 p-4 rounded-xl border border-surface-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <span className="capitalize text-primary-400 font-semibold">{post.platform}</span>
                    <span>By {post.author?.name || 'Team Editor'}</span>
                  </div>

                  <p className="text-sm text-surface-200 line-clamp-3">{post.content}</p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-surface-800/60">
                    <button
                      onClick={() => handleApprovalAction(post._id, 'draft')}
                      className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg text-xs font-medium transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprovalAction(post._id, 'scheduled')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                    >
                      Approve & Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-surface-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FiUserPlus className="text-primary-400" /> Invite Team Member
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-surface-400 hover:text-white">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-300 uppercase mb-1">Role Permissions</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="editor">Editor — Create & edit draft posts</option>
                  <option value="admin">Admin — Full workspace control & approval</option>
                  <option value="viewer">Viewer — View analytics & content calendar</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-surface-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
