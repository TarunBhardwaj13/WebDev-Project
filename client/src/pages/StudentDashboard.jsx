import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import {
  User,
  BookOpen,
  GraduationCap,
  Star,
  Send,
  Inbox,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Building,
  Loader2,
  LogOut,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'requests'
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Profile Form State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    college: '',
    location: '',
    bio: '',
    rating: 5.0,
    skillsToTeach: [],
    skillsToLearn: [],
  });

  // Inputs for adding new skills
  const [newTeachSkill, setNewTeachSkill] = useState({ name: '', level: 'Beginner' });
  const [newLearnSkill, setNewLearnSkill] = useState({ name: '', level: 'Beginner' });

  // Swap Requests State
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);

  // Fetch Current Profile Data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/users/profile');
      const data = res.data.user || res.data;
      setProfile({
        name: data.name || '',
        email: data.email || '',
        college: data.college || '',
        location: data.location || '',
        bio: data.bio || '',
        rating: data.rating || 5.0,
        skillsToTeach: data.skillsToTeach || [],
        skillsToLearn: data.skillsToLearn || [],
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Profile data load nahi ho saka.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Sent & Received Requests
  const fetchRequests = async () => {
    try {
      setReqLoading(true);
      const [sentRes, recRes] = await Promise.all([
        axios.get('/requests/sent'),
        axios.get('/requests/received'),
      ]);
      setSentRequests(sentRes.data.requests || sentRes.data || []);
      setReceivedRequests(recRes.data.requests || recRes.data || []);
    } catch (err) {
      console.error('Requests load error:', err);
    } finally {
      setReqLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchRequests();
  }, []);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSuccessMsg('');
    setError('');

    try {
      await axios.put('/users/profile', {
        college: profile.college,
        location: profile.location,
        bio: profile.bio,
        skillsToTeach: profile.skillsToTeach,
        skillsToLearn: profile.skillsToLearn,
      });
      setSuccessMsg('Profile successfully update ho gayi!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update karne mein error aayi.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Add Skill to Teach
  const handleAddTeachSkill = () => {
    if (!newTeachSkill.name.trim()) return;
    setProfile({
      ...profile,
      skillsToTeach: [...profile.skillsToTeach, { ...newTeachSkill }],
    });
    setNewTeachSkill({ name: '', level: 'Beginner' });
  };

  // Remove Skill to Teach
  const handleRemoveTeachSkill = (index) => {
    setProfile({
      ...profile,
      skillsToTeach: profile.skillsToTeach.filter((_, i) => i !== index),
    });
  };

  // Add Skill to Learn
  const handleAddLearnSkill = () => {
    if (!newLearnSkill.name.trim()) return;
    setProfile({
      ...profile,
      skillsToLearn: [...profile.skillsToLearn, { ...newLearnSkill }],
    });
    setNewLearnSkill({ name: '', level: 'Beginner' });
  };

  // Remove Skill to Learn
  const handleRemoveLearnSkill = (index) => {
    setProfile({
      ...profile,
      skillsToLearn: profile.skillsToLearn.filter((_, i) => i !== index),
    });
  };

  // Accept/Reject Received Request
  const handleRespondRequest = async (requestId, status) => {
    try {
      await axios.patch(`/requests/${requestId}/respond`, { status });
      // Update local state
      setReceivedRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status } : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Request status update nahi ho saka.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-emerald-400 mb-3" size={36} />
        <p className="text-sm text-slate-400">Loading Student Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl text-white flex items-center gap-2">
                {profile.name}
                <span className="text-xs bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 font-normal">
                  Student
                </span>
              </h1>
              <p className="text-xs text-slate-400">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Rating Display */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-amber-400 text-sm font-semibold">
              <Star size={16} className="fill-amber-400" />
              <span>{Number(profile.rating || 5).toFixed(1)}</span>
            </div>

            <button
              onClick={() => logout && logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold border border-rose-500/20 transition"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === 'profile'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <User size={16} /> Profile & Skills
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === 'requests'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Inbox size={16} /> Swap Requests ({receivedRequests.filter(r => r.status === 'pending').length} New)
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm flex items-center gap-2">
            <XCircle size={18} /> {error}
          </div>
        )}

        {/* TAB 1: PROFILE & SKILLS MANAGEMENT */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-base font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <GraduationCap size={18} /> Academic & Personal Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">College / University</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
                    <input
                      type="text"
                      value={profile.college}
                      onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                      placeholder="e.g. KIET Ghaziabad"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">City / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="e.g. Meerut, UP"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Bio / Summary</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Apne baare mein thoda batayein (konsa course kar rahe hain, kya sikhna chahte hain)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Skills Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SKILLS TO TEACH (KYA AATA HAI) */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen size={18} className="text-emerald-400" />
                    Skills I Can Teach (Kya Aata Hai)
                  </h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    {profile.skillsToTeach.length} Added
                  </span>
                </div>

                {/* Add Skill Row */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newTeachSkill.name}
                    onChange={(e) => setNewTeachSkill({ ...newTeachSkill, name: e.target.value })}
                    placeholder="Skill (e.g. Java, C++, Python)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={newTeachSkill.level}
                    onChange={(e) => setNewTeachSkill({ ...newTeachSkill, level: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddTeachSkill}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2.5 rounded-xl font-bold transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
                  {profile.skillsToTeach.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Abhi tak koi skill add nahi kiya gaya.</p>
                  ) : (
                    profile.skillsToTeach.map((skill, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-medium"
                      >
                        {skill.name} <span className="text-[10px] opacity-75">({skill.level})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeachSkill(index)}
                          className="hover:text-rose-400 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* SKILLS TO LEARN (KYA SIKHNA HAI) */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <GraduationCap size={18} className="text-blue-400" />
                    Skills I Want to Learn (Kya Sikhna Hai)
                  </h3>
                  <span className="text-xs bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-500/20">
                    {profile.skillsToLearn.length} Added
                  </span>
                </div>

                {/* Add Skill Row */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newLearnSkill.name}
                    onChange={(e) => setNewLearnSkill({ ...newLearnSkill, name: e.target.value })}
                    placeholder="Skill (e.g. React, MongoDB, DSA)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={newLearnSkill.level}
                    onChange={(e) => setNewLearnSkill({ ...newLearnSkill, level: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddLearnSkill}
                    className="bg-blue-500 hover:bg-blue-400 text-slate-950 p-2.5 rounded-xl font-bold transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
                  {profile.skillsToLearn.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Abhi tak koi skill add nahi kiya gaya.</p>
                  ) : (
                    profile.skillsToLearn.map((skill, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-xl text-xs font-medium"
                      >
                        {skill.name} <span className="text-[10px] opacity-75">({skill.level})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLearnSkill(index)}
                          className="hover:text-rose-400 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saveLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {saveLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Profile
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: REQUESTS MANAGEMENT (SENT & RECEIVED) */}
        {activeTab === 'requests' && (
          <div className="space-y-8">
            {/* RECEIVED REQUESTS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Inbox size={18} className="text-emerald-400" />
                  Received Requests (Jo dusro ne aapko bheji hain)
                </h3>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-xl">
                  {receivedRequests.length} Total
                </span>
              </div>

              {reqLoading ? (
                <div className="text-center py-8 text-slate-400 text-sm">Loading requests...</div>
              ) : receivedRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-950 border border-slate-800/80 rounded-2xl">
                  Abhi tak koi request nahi aayi hai.
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-white">{req.sender?.name || 'Peer Student'}</p>
                          <span className="text-xs text-slate-400">({req.sender?.college || 'No college'})</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          <strong className="text-emerald-400">Wants to learn:</strong> {req.topic || req.skillNeeded || 'Skill swap'}
                        </p>
                        {req.message && <p className="text-xs text-slate-400 italic">"{req.message}"</p>}
                      </div>

                      {/* Status / Actions */}
                      <div className="flex items-center gap-2">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleRespondRequest(req._id, 'accepted')}
                              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                            >
                              <CheckCircle size={14} /> Accept
                            </button>
                            <button
                              onClick={() => handleRespondRequest(req._id, 'rejected')}
                              className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/20 transition flex items-center gap-1.5"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        ) : (
                          <span
                            className={`text-xs px-3 py-1 rounded-xl font-bold capitalize ${
                              req.status === 'accepted'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SENT REQUESTS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send size={18} className="text-blue-400" />
                  Sent Requests (Jo aapne dusro ko bheji hain)
                </h3>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-xl">
                  {sentRequests.length} Total
                </span>
              </div>

              {reqLoading ? (
                <div className="text-center py-8 text-slate-400 text-sm">Loading requests...</div>
              ) : sentRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-950 border border-slate-800/80 rounded-2xl">
                  Aapne abhi tak kisi ko request nahi bheji hai.
                </div>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-sm text-white">{req.recipient?.name || 'Peer Student'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Requested for: <span className="text-blue-400">{req.topic || req.skillNeeded || 'Skill Swap'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-500" />
                        <span
                          className={`text-xs px-2.5 py-1 rounded-xl font-bold capitalize ${
                            req.status === 'accepted'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : req.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}