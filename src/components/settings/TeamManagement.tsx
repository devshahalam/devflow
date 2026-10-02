import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  Trash2,
  Lock,
  Mail,
  X,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { AppUser, UserRole } from '../../types/crm';
import { MemberProfileModal } from './MemberProfileModal';

export const TeamManagement: React.FC = () => {
  const { currentUser, users, addUser, deleteUser, leads, projects, followUps } = useCRM();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<AppUser | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Member');
  const [teamLeaderId, setTeamLeaderId] = useState<string>('');

  const isOwner = currentUser?.role === 'Owner' || currentUser?.email === 'dev.mdshahalam@gmail.com';
  const isTeamLeader = currentUser?.role === 'Team Leader';

  // Team leaders list for assigning members
  const teamLeaders = users.filter((u) => u.role === 'Team Leader');

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
  };

  // Filter users based on role view:
  // Owner sees all
  // Team Leader sees themselves and members assigned under them
  const visibleUsers = users.filter((u) => {
    if (isOwner) return true;
    if (isTeamLeader) {
      return u.id === currentUser?.id || u.teamLeaderId === currentUser?.id;
    }
    return u.id === currentUser?.id;
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Team & Role-Based Access Control
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Owner has complete administrative control. Team Leaders supervise member workloads.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add Team User</span>
          </button>
        )}
      </div>

      {/* Status Alert Banner */}
      {statusBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center justify-between shadow-2xs">
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

      {/* Error Alert Banner */}
      {errorBanner && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center justify-between shadow-2xs">
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

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleUsers.map((user) => {
          const userLeads = leads.filter((l) => l.assignedTo === user.id);
          const userProjects = projects.filter((p) => p.assignedTo === user.id);
          const userTasks = followUps.filter((f) => f.assignedTo === user.id && !f.completed);
          const leader = users.find((u) => u.id === user.teamLeaderId);

          return (
            <div
              key={user.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 relative hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs shadow-2xs">
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.id === currentUser?.id && (
                        <span className="text-[10px] text-blue-600 font-semibold">(You)</span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-500">{user.email}</span>
                  </div>
                </div>

                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
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

              {leader && (
                <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                  Supervisor: <strong className="text-slate-700">{leader.name}</strong>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-200/60 text-center">
                <div className="bg-white p-1 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Tasks</span>
                  <strong className="text-amber-700 font-bold">{userTasks.length}</strong>
                </div>
                <div className="bg-white p-1 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Leads</span>
                  <strong className="text-slate-800 font-bold">{userLeads.length}</strong>
                </div>
                <div className="bg-white p-1 rounded-lg border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Projects</span>
                  <strong className="text-blue-700 font-bold">{userProjects.length}</strong>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setSelectedUserProfile(user)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 transition-colors font-semibold"
                  title="View Profile and All Assigned Tasks"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Profile & Tasks</span>
                </button>

                {isOwner && user.role !== 'Owner' && (
                  <button
                    type="button"
                    onClick={() => setUserToDelete(user)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1 text-xs text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors font-medium"
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
                    Assign under Team Leader (Optional)
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

      {/* Remove User In-App Confirmation Modal */}
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
              Are you sure you want to remove <strong>{userToDelete.name}</strong>? Any leads, projects, or follow-ups assigned to this user will be safely preserved and transferred to the Owner account.
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
                onClick={() => {
                  const targetName = userToDelete.name;
                  const success = deleteUser(userToDelete.id);
                  setUserToDelete(null);
                  if (success) {
                    setStatusBanner(`Team user "${targetName}" has been successfully removed. All their assigned tasks and leads have been safely transferred to you.`);
                    setTimeout(() => setStatusBanner(null), 4000);
                  } else {
                    setErrorBanner(`Unable to remove "${targetName}". Please verify that you are logged in as Owner.`);
                    setTimeout(() => setErrorBanner(null), 4000);
                  }
                }}
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
