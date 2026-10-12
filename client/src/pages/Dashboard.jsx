import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import UserCard from '../components/UserCard';
import { 
  Sparkles, 
  Award, 
  BookOpen, 
  Users, 
  Calendar, 
  Star, 
  Zap, 
  ArrowRight, 
  PlusCircle, 
  Clock, 
  Loader2 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    teachingCount: 0,
    learningCount: 0,
    xp: 0,
    rating: 5.0,
    completedSessions: 0,
    connectionsCount: 0
  });
  const [recommendedPartners, setRecommendedPartners] = useState([]);
  const [upcomingSession, setUpcomingSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [matchesRes, sessionsRes, connectionsRes] = await Promise.allSettled([
          api.get('/matches'),
          api.get('/sessions'),
          api.get('/connections')
        ]);

        const matchesData = matchesRes.status === 'fulfilled' ? matchesRes.value.data?.data || [] : [];
        const sessionsData = sessionsRes.status === 'fulfilled' ? sessionsRes.value.data?.data || [] : [];
        const connectionsData = connectionsRes.status === 'fulfilled' ? connectionsRes.value.data?.data || [] : [];

        setRecommendedPartners(matchesData.slice(0, 3));

        const upcoming = sessionsData.find(s => s.status === 'Pending' || s.status === 'Confirmed');
        setUpcomingSession(upcoming || null);

        const completed = sessionsData.filter(s => s.status === 'Completed').length;
        setStats({
          teachingCount: user?.skillsToTeach?.length || 0,
          learningCount: user?.skillsToLearn?.length || 0,
          xp: user?.xp || 10,
          rating: user?.rating || 5.0,
          completedSessions: completed,
          connectionsCount: connectionsData.length
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleConnect = (partner) => {
    alert(`Connecting with ${partner.name}. Request feature available in Matches & Requests.`);
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-800/90 to-slate-800/40 border border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Learner Hub
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'Friend'}! 👋
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-xl">
              Exchange practical skills peer-to-peer. Search compatible study buddies or manage your skills.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Manage Skills
            </Link>
            <Link
              to="/matches"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl text-sm transition"
            >
              Browse Buddies
            </Link>
          </div>
        </div>

        {/* 6 Key Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-emerald-400" /> Teaching
            </div>
            <div className="text-2xl font-black text-white">{stats.teachingCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Skills listed</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <BookOpen className="w-4 h-4 text-sky-400" /> Learning
            </div>
            <div className="text-2xl font-black text-white">{stats.learningCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Skills targeted</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Zap className="w-4 h-4 text-amber-400" /> Total XP
            </div>
            <div className="text-2xl font-black text-amber-300">{stats.xp}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Experience pts</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Star className="w-4 h-4 text-yellow-400" /> Rating
            </div>
            <div className="text-2xl font-black text-white">{Number(stats.rating).toFixed(1)}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Peer reviews</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Calendar className="w-4 h-4 text-teal-400" /> Sessions
            </div>
            <div className="text-2xl font-black text-white">{stats.completedSessions}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Completed swaps</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-purple-400" /> Buddies
            </div>
            <div className="text-2xl font-black text-white">{stats.connectionsCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Connected peers</div>
          </div>
        </div>

        {/* Upcoming Session Box */}
        {upcomingSession && (
          <div className="bg-slate-800/40 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Upcoming 1-on-1 Session
                </span>
                <h3 className="text-base font-bold text-white mt-1">{upcomingSession.skill}</h3>
                <p className="text-xs text-slate-400">
                  {upcomingSession.date} at {upcomingSession.startTime} ({upcomingSession.mode || 'Online'})
                </p>
              </div>
            </div>

            <Link
              to="/sessions"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              View Session
            </Link>
          </div>
        )}

        {/* Recommended Buddies from Database */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Recommended Skill Buddies</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Compatible students from the database.</p>
            </div>
            <Link
              to="/matches"
              className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs sm:text-sm inline-flex items-center gap-1"
            >
              View All Matches <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center text-slate-400 text-sm gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span>Matching data load ho raha hai...</span>
            </div>
          ) : recommendedPartners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedPartners.map((partner) => (
                <UserCard 
                  key={partner._id} 
                  user={partner} 
                  matchScore={partner.matchScore || 85} 
                  onConnect={handleConnect} 
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 bg-slate-800/20 border border-slate-800 rounded-2xl text-xs">
              Database me abhi koi recommended partner nahi hai. Naye users sign up karenge tab yahan dikhenge.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}