import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Search,
  Eye,
  X,
  MapPin,
  GraduationCap,
  CalendarDays,
  Star,
  Award,
  BookOpen,
  AlertCircle,
  Mail,
  UserRound,
  Loader2,
  Power,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  const [error, setError] = useState('');
  const [usersError, setUsersError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const { logout } = useAuth();

  // Dashboard statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get('/admin/dashboard');
      setStats(response.data.stats || response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Dashboard statistics load nahi ho sake.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Users list
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError('');

      const response = await axios.get('/admin/users', {
        params: {
          search: search.trim(),
          status: statusFilter === 'all' ? '' : statusFilter,
          role: roleFilter === 'all' ? '' : roleFilter,
          page: 1,
          limit: 100,
        },
      });

      const data = response.data;
      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.users)) {
        list = data.users;
      } else if (Array.isArray(data.data?.users)) {
        list = data.data.users;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      }

      setUsers(list);
    } catch (err) {
      setUsersError(
        err.response?.data?.message ||
          'Users load nahi ho sake. Backend API check karo.'
      );
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter, roleFilter]);

  // Refresh everything
  const handleRefresh = () => {
    fetchStats();
    fetchUsers();
  };

  // Logout
  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
    } finally {
      window.location.href = '/login';
    }
  };

  // Toggle user status: Active <-> Suspended
  const handleToggleStatus = async (user) => {
    if (user.role === 'admin') {
      alert('Administrator account ka status change nahi kiya ja sakta.');
      return;
    }

    const currentStatus = user.isActive !== false;
    const confirmMessage = currentStatus
      ? `Kya aap "${user.name}" ko Deactivate (Suspend) karna chahte hain?`
      : `Kya aap "${user.name}" ko Activate karna chahte hain?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoadingId(user._id);

      // Backend route toggle call
      const res = await axios.patch(`/admin/users/${user._id}/toggle-status`);
      const updatedUser = res.data.user || res.data.data?.user || {
        ...user,
        isActive: !currentStatus,
      };

      // State me turant update karein bina full reload ke
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === user._id ? { ...u, isActive: updatedUser.isActive } : u))
      );

      // Agar modal khula hai toh modal me bhi live update karein
      if (selectedUser && selectedUser._id === user._id) {
        setSelectedUser((prev) => ({ ...prev, isActive: updatedUser.isActive }));
      }

      // Stats bhi silently refresh karein
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Status change karne me error aayi.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // View complete user details
  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setDetailsError('');
    setDetailsLoading(true);

    try {
      const response = await axios.get(`/admin/users/${user._id}`);
      const data = response.data;
      setSelectedUser(data.user || data.data?.user || data);
    } catch (err) {
      setDetailsError(
        err.response?.data?.message ||
          'Complete details load nahi ho sake. Available profile data neeche dikhaya gaya hai.'
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // Format dates safely
  const formatDate = (date) => {
    if (!date) return 'Not available';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return 'Not available';

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatus = (user) => {
    return user?.isActive === false ? 'Suspended' : 'Active';
  };

  const cards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-400',
      background: 'bg-blue-500/10',
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers ?? 0,
      icon: UserCheck,
      color: 'text-emerald-400',
      background: 'bg-emerald-500/10',
    },
    {
      title: 'Suspended Users',
      value: stats?.suspendedUsers ?? 0,
      icon: UserX,
      color: 'text-rose-400',
      background: 'bg-rose-500/10',
    },
    {
      title: 'Administrators',
      value: stats?.totalAdmins ?? 0,
      icon: ShieldCheck,
      color: 'text-purple-400',
      background: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div>
            <h1 className="text-2xl font-extrabold text-emerald-400">Learn Unique</h1>
            <p className="mt-1 text-sm text-slate-400">Administration Dashboard</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || usersLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:border-emerald-500 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading || usersLoading ? 'animate-spin' : ''}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/20"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-5 sm:p-8">
        <section className="mb-8">
          <p className="text-sm font-semibold tracking-wider text-emerald-400">ADMINISTRATION</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Dashboard</h2>
          <p className="mt-2 text-sm text-slate-400">
            View platform statistics and click status to activate or suspend users.
          </p>
        </section>

        {error && (
          <div className="mb-6 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
            <AlertCircle size={20} className="shrink-0" />
            <div>
              <p className="font-semibold">Statistics unavailable</p>
              <p className="mt-1 text-sm">{error}</p>
              <button type="button" onClick={fetchStats} className="mt-2 text-sm underline">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Statistics cards */}
        <section className="mb-10">
          <h3 className="mb-4 text-lg font-semibold">Platform Overview</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">{card.title}</p>
                      <p className="mt-3 text-3xl font-bold">
                        {loading ? '...' : card.value}
                      </p>
                    </div>
                    <div className={`rounded-xl p-3 ${card.background}`}>
                      <Icon className={card.color} size={25} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Users list */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Registered Users</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Click on status to toggle Active / Deactive, or click View Details.
                </p>
              </div>

              <span className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300">
                {usersLoading ? 'Loading...' : `${users.length} results`}
              </span>
            </div>

            {/* Search and filters */}
            <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, college, location..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          {/* Users table */}
          <div className="overflow-x-auto">
            {usersError && (
              <div className="m-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                {usersError}
                <button type="button" onClick={fetchUsers} className="ml-2 underline">
                  Retry
                </button>
              </div>
            )}

            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-950/70 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-medium">User</th>
                  <th className="px-5 py-4 font-medium">College</th>
                  <th className="px-5 py-4 font-medium">Location</th>
                  <th className="px-5 py-4 font-medium">Role</th>
                  <th className="px-5 py-4 font-medium">Status (Click to Switch)</th>
                  <th className="px-5 py-4 font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {usersLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      No users found. Try another search.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isActive = user.isActive !== false;
                    const isProcessing = actionLoadingId === user._id;

                    return (
                      <tr key={user._id} className="transition hover:bg-slate-800/40">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-bold text-emerald-400">
                              {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">
                                {user.name || 'Unnamed User'}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {user.email || 'No email'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {user.college || '—'}
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {user.location || '—'}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              user.role === 'admin'
                                ? 'rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300'
                                : 'rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300'
                            }
                          >
                            {user.role || 'user'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            disabled={isProcessing || user.role === 'admin'}
                            onClick={() => handleToggleStatus(user)}
                            title={user.role === 'admin' ? 'Admin cannot be deactivated' : 'Click to toggle status'}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                              isActive
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300'
                                : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300'
                            }`}
                          >
                            {isProcessing ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Power size={13} />
                            )}
                            {isActive ? 'Active' : 'Suspended'}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(user)}
                            className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* User details modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-900 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-emerald-400">USER PROFILE</p>
                <h3 className="mt-1 text-xl font-bold sm:text-2xl">
                  {selectedUser.name || 'User Details'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedUser.role !== 'admin' && (
                  <button
                    type="button"
                    disabled={actionLoadingId === selectedUser._id}
                    onClick={() => handleToggleStatus(selectedUser)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                      selectedUser.isActive !== false
                        ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                    }`}
                  >
                    <Power size={14} />
                    {selectedUser.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                  aria-label="Close user details"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {detailsLoading && (
                <p className="text-sm text-emerald-300">Loading complete profile...</p>
              )}

              {detailsError && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                  {detailsError}
                </div>
              )}

              {/* Personal information */}
              <section>
                <h4 className="mb-4 flex items-center gap-2 font-semibold">
                  <UserRound size={18} className="text-emerald-400" />
                  Personal Information
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Detail
                    icon={UserRound}
                    label="Full Name"
                    value={selectedUser.name}
                  />

                  <Detail
                    icon={Mail}
                    label="Email"
                    value={selectedUser.email}
                  />

                  <Detail
                    icon={GraduationCap}
                    label="College / Organization"
                    value={selectedUser.college}
                  />

                  <Detail
                    icon={MapPin}
                    label="Location"
                    value={selectedUser.location}
                  />

                  <Detail
                    icon={CalendarDays}
                    label="Registration Date"
                    value={formatDate(selectedUser.createdAt)}
                  />

                  <Detail
                    icon={ShieldCheck}
                    label="Account Status"
                    value={getStatus(selectedUser)}
                  />

                  <Detail
                    icon={ShieldCheck}
                    label="Role"
                    value={selectedUser.role || 'user'}
                  />
                </div>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-400">Bio</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                    {selectedUser.bio || 'No bio available.'}
                  </p>
                </div>
              </section>

              {/* Skills */}
              <section>
                <h4 className="mb-4 flex items-center gap-2 font-semibold">
                  <BookOpen size={18} className="text-emerald-400" />
                  Skills Information
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SkillList
                    title="Skills to Teach"
                    skills={selectedUser.skillsToTeach}
                  />

                  <SkillList
                    title="Skills to Learn"
                    skills={selectedUser.skillsToLearn}
                  />
                </div>
              </section>

              {/* Performance */}
              <section>
                <h4 className="mb-4 flex items-center gap-2 font-semibold">
                  <Award size={18} className="text-emerald-400" />
                  Performance
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Detail
                    icon={Award}
                    label="XP Points"
                    value={selectedUser.xp ?? 0}
                  />

                  <Detail
                    icon={Star}
                    label="Rating"
                    value={selectedUser.rating ?? 'Not rated'}
                  />
                </div>
              </section>

              {/* Related activity */}
              <section>
                <h4 className="mb-4 font-semibold">Related Activity</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Detail
                    label="Sent Requests"
                    value={
                      selectedUser.sentRequests?.length ??
                      selectedUser.requestsSent?.length ??
                      'Not provided'
                    }
                  />

                  <Detail
                    label="Received Requests"
                    value={
                      selectedUser.receivedRequests?.length ??
                      selectedUser.requestsReceived?.length ??
                      'Not provided'
                    }
                  />

                  <Detail
                    label="Sessions"
                    value={selectedUser.sessions?.length ?? 'Not provided'}
                  />
                </div>
              </section>
            </div>

            <div className="border-t border-slate-800 p-5 text-right">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable detail field
function Detail({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <Icon
            size={17}
            className="mt-0.5 shrink-0 text-emerald-400"
          />
        )}
        <div className="min-w-0">
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-1 break-words text-sm font-medium text-slate-200">
            {value === null || value === undefined || value === ''
              ? 'Not available'
              : String(value)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable skills list
function SkillList({ title, skills }) {
  const items = Array.isArray(skills) ? skills : [];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <h5 className="mb-3 text-sm font-semibold text-slate-300">{title}</h5>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No skills available.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((skill, index) => {
            const name =
              typeof skill === 'string'
                ? skill
                : skill.name || 'Unnamed skill';

            const level =
              typeof skill === 'object' && skill !== null
                ? skill.level
                : null;

            const id =
              typeof skill === 'object' && skill !== null
                ? skill._id
                : null;

            return (
              <span
                key={id || `${name}-${index}`}
                className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"
              >
                {name}
                {level ? ` · ${level}` : ''}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}