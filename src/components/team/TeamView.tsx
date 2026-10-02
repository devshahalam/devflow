import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  FolderGit2,
  CalendarClock,
  Users2,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { AppUser, UserRole } from '../../types/crm';
import { MemberProfileModal } from '../settings/MemberProfileModal';

export const TeamView: React.FC = () => {
  const { currentUser, users, addUser, deleteUser, leads, projects, followUps, formatCurrency } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Team Leader' | 'Member'>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<AppUser | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Member');
  const [teamLeaderId, setTeamLeaderId] = useState<string>('');

  const isOwner =
    currentUser?.role === 'Owner' ||
    currentUser?.email?.toLowerCase() === 'dev.mdshahalam@gmail.com';

  const teamLeaders = users.filter((u) => u.role === 'Team Leader');
  const members = users.filter((u) => u.role === 'Member');

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    addUser({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      role,
      teamLeaderId: role === 'Member' && teamLeaderId ? teamLeaderId : undefined,
    });

    setIsAddOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Member');
    setTeamLeaderId('');
    setStatusBanner(`New ${role} "${name}" added to the studio.`);
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const targetName = userToDelete.name;
    const success = deleteUser(userToDelete.id);
    setUserToDelete(null);

    if (success) {
      setStatusBanner(`Team user "${targetName}" has been successfully removed. All their assigned tasks, leads, and projects were transferred to your Owner account.`);
      setTimeout(() => setStatusBanner(null), 4000);
    } else {
      setErrorBanner(`Failed to remove "${targetName}". Please verify that you are logged in as the Studio Owner.`);
      setTimeout(() => setErrorBanner(null), 4000);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Team & Staff Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Inspect leader and member profiles, supervise assigned tasks, and manage studio access.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add Team Member</span>
          </button>
        )}
      </div>

      {/* Status & Error Alerts */}
      {statusBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{statusBanner}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-rose-600 hover:text-rose-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Staff
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{users.length}</span>
            <span className="text-xs text-slate-500">accounts</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Team Leaders
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{teamLeaders.length}</span>
            <span className="text-xs text-slate-500">supervisors</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
            Members & Devs
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600">{members.length}</span>
            <span className="text-xs text-slate-500">executors</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Active Follow-ups
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">
              {followUps.filter((f) => !f.completed).length}
            </span>
            <span className="text-xs text-slate-500">tasks</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search team by name, email, or ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(['All', 'Team Leader', 'Member'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                roleFilter === r
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r === 'All' ? 'All Roles' : `${r}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const userLeads = leads.filter((l) => l.assignedTo === user.id);
          const userProjects = projects.filter((p) => p.assignedTo === user.id);
          const userTasks = followUps.filter((f) => f.assignedTo === user.id && !f.completed);
          const leader = users.find((u) => u.id === user.teamLeaderId);
          const supervisedMembers = users.filter((u) => u.teamLeaderId === user.id);

          return (
            <div
              key={user.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* User Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold text-sm text-white shadow-xs ${
                        user.role === 'Owner'
                          ? 'bg-purple-600 shadow-purple-600/20'
                          : user.role === 'Team Leader'
                          ? 'bg-amber-600 shadow-amber-600/20'
                          : 'bg-blue-600 shadow-blue-600/20'
                      }`}
                    >
                      {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.id === currentUser?.id && (
                          <span className="text-[10px] text-blue-600 font-semibold">(You)</span>
                        )}
                      </h3>
                      <div className="text-xs text-slate-500 truncate max-w-[190px]">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                      user.role === 'Owner'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'Team Leader'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Supervisor or Supervising Tag */}
                {leader && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                    Supervisor: <strong className="text-slate-800">{leader.name}</strong>
                  </div>
                )}
                {user.role === 'Team Leader' && (
                  <div className="text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 font-medium">
                    Supervising: <strong>{supervisedMembers.length} team member{supervisedMembers.length === 1 ? '' : 's'}</strong>
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100">
                  <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-medium text-slate-400 block">Tasks</span>
                    <strong className="text-sm font-bold text-amber-700">{userTasks.length}</strong>
                  </div>
                  <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-medium text-slate-400 block">Leads</span>
                    <strong className="text-sm font-bold text-slate-800">{userLeads.length}</strong>
                  </div>
                  <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-medium text-slate-400 block">Projects</span>
                    <strong className="text-sm font-bold text-blue-700">{userProjects.length}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserProfile(user)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 transition-colors font-semibold"
                  title="View Profile and All Assigned Tasks"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Profile & Tasks</span>
                </button>

                {isOwner && user.role !== 'Owner' && (
                  <button
                    type="button"
                    onClick={() => setUserToDelete(user)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors font-medium"
                    title="Remove User from Studio"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove User</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Team Member</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="member@alamdigital.com"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Login Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">User Role</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="Team Leader">Team Leader</option>
                  <option value="Member">Member</option>
                </select>
              </div>

              {role === 'Member' && teamLeaders.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Assign under Team Leader (Supervisor)
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    value={teamLeaderId}
                    onChange={(e) => setTeamLeaderId(e.target.value)}
                  >
                    <option value="">No Specific Supervisor</option>
                    {teamLeaders.map((tl) => (
                      <option key={tl.id} value={tl.id}>
                        {tl.name} ({tl.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setUserToDelete(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 shrink-0">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Remove Team User</h3>
                <p className="text-xs text-slate-500">Confirm account removal from studio</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 text-xs">
              <div className="font-bold text-slate-900 text-sm">{userToDelete.name}</div>
              <div className="text-slate-500">{userToDelete.email}</div>
              <div className="pt-1 flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    userToDelete.role === 'Team Leader'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {userToDelete.role}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{userToDelete.id}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{userToDelete.name}</strong>? Any leads, projects, or follow-ups assigned to this user will be safely preserved and transferred to your Owner account.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Confirm & Remove User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Profile & Workload Modal */}
      {selectedUserProfile && (
        <MemberProfileModal
          user={selectedUserProfile}
          isOpen={!!selectedUserProfile}
          onClose={() => setSelectedUserProfile(null)}
          onSelectAnotherUser={(another) => setSelectedUserProfile(another)}
          onDeleteUser={(u) => {
            setSelectedUserProfile(null);
            setUserToDelete(u);
          }}
        />
      )}
    </div>
  );
};
