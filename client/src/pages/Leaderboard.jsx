import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import {
  Trophy,
  Medal,
  Award,
  RefreshCw,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch users from the existing backend API
      const response = await axios.get('/users/leaderboard');

      const leaderboardUsers =
        response.data.users || response.data.data || [];

      setUsers(
        [...leaderboardUsers].sort(
          (a, b) => (b.xp || 0) - (a.xp || 0)
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Leaderboard load nahi ho saka. Backend API check karo.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankStyle = (index) => {
    if (index === 0) {
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
    }

    if (index === 1) {
      return 'border-slate-400/30 bg-slate-400/10 text-slate-300';
    }

    if (index === 2) {
      return 'border-orange-500/30 bg-orange-500/10 text-orange-400';
    }

    return 'border-slate-700 bg-slate-800 text-slate-300';
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={22} />;
    if (index === 1) return <Medal size={22} />;
    if (index === 2) return <Award size={22} />;

    return <span className="text-sm font-bold">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Trophy className="text-emerald-400" size={32} />
          </div>

          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Leaderboard
          </h1>

          <p className="mt-3 text-slate-400">
            Discover the top learners and skill sharers on Learn Unique.
          </p>
        </div>

        {/* Refresh */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users size={18} />
            <span>{users.length} participants</span>
          </div>

          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm transition hover:border-emerald-500 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load leaderboard</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-12 text-center">
            <RefreshCw
              className="mx-auto animate-spin text-emerald-400"
              size={30}
            />
            <p className="mt-4 text-slate-400">
              Loading leaderboard...
            </p>
          </div>
        ) : users.length === 0 && !error ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-12 text-center">
            <Trophy
              className="mx-auto text-slate-500"
              size={38}
            />
            <h2 className="mt-4 text-xl font-bold">
              No rankings available
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Rankings will appear when user data is available.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-800/50 shadow-xl">
            {/* Table heading */}
            <div className="grid grid-cols-[60px_minmax(0,1fr)_90px_90px] gap-3 border-b border-slate-700 bg-slate-800 px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 sm:grid-cols-[80px_minmax(0,1fr)_120px_120px] sm:px-6">
              <span>Rank</span>
              <span>User</span>
              <span className="text-right">XP</span>
              <span className="text-right">Rating</span>
            </div>

            {/* User rows */}
            {users.map((user, index) => (
              <div
                key={user._id || user.id || user.email || index}
                className="grid grid-cols-[60px_minmax(0,1fr)_90px_90px] items-center gap-3 border-b border-slate-700/70 px-4 py-4 transition last:border-b-0 hover:bg-slate-800 sm:grid-cols-[80px_minmax(0,1fr)_120px_120px] sm:px-6"
              >
                <div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${getRankStyle(index)}`}
                  >
                    {getRankIcon(index)}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {user.name || 'Unknown User'}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-400">
                    {user.college || 'Learn Unique Member'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-emerald-400">
                    {user.xp || 0}
                  </p>
                  <p className="text-xs text-slate-500">XP</p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-yellow-400">
                    ★ {Number(user.rating || 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-500">Rating</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-5 text-center text-xs text-slate-500">
          Rankings are based on XP earned on the platform.
        </p>
      </div>
    </div>
  );
}