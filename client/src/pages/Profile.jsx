import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Award, 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  Plus, 
  Trash2, 
  Save, 
  Star, 
  CheckCircle2, 
  Mail, 
  Loader2 
} from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();

  const [bio, setBio] = useState('');
  const [college, setCollege] = useState('');
  const [location, setLocation] = useState('');
  const [learningMode, setLearningMode] = useState('Online');
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);

  const [newTeach, setNewTeach] = useState({ name: '', level: 'Intermediate', experience: '' });
  const [newLearn, setNewLearn] = useState({ name: '', level: 'Beginner', experience: '' });
  
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setCollege(user.college || '');
      setLocation(user.location || '');
      setLearningMode(user.learningMode || 'Online');
      setSkillsToTeach(user.skillsToTeach || []);
      setSkillsToLearn(user.skillsToLearn || []);
    }
  }, [user]);

  const handleAddTeachSkill = (e) => {
    e.preventDefault();
    if (!newTeach.name.trim()) return;
    setSkillsToTeach([...skillsToTeach, { ...newTeach, name: newTeach.name.trim() }]);
    setNewTeach({ name: '', level: 'Intermediate', experience: '' });
  };

  const handleAddLearnSkill = (e) => {
    e.preventDefault();
    if (!newLearn.name.trim()) return;
    setSkillsToLearn([...skillsToLearn, { ...newLearn, name: newLearn.name.trim() }]);
    setNewLearn({ name: '', level: 'Beginner', experience: '' });
  };

  const handleRemoveTeach = (index) => {
    setSkillsToTeach(skillsToTeach.filter((_, idx) => idx !== index));
  };

  const handleRemoveLearn = (index) => {
    setSkillsToLearn(skillsToLearn.filter((_, idx) => idx !== index));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updatePayload = {
        bio,
        college,
        location,
        learningMode,
        skillsToTeach,
        skillsToLearn
      };

      const res = await api.put('/users/profile', updatePayload);
      if (setUser) {
        setUser(res.data.data);
      }
      setSavedMessage('Profile & skills database me successfully save ho gayi!');
      setTimeout(() => setSavedMessage(''), 3500);
    } catch (err) {
      alert(err.response?.data?.message || 'Profile update karne me error aayi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {savedMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* Top Profile Summary Card */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-3xl shadow-lg shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user?.name}</h1>
                <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {user?.role === 'admin' ? 'Admin' : 'Member'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-3">
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {user?.rating ? user.rating.toFixed(1) : '5.0'} / 5.0
                </span>
                <span>&bull;</span>
                <span className="font-semibold text-emerald-400">{user?.xp || 10} XP</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-500/10 self-stretch sm:self-auto justify-center"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Details Form */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-5">
          <h2 className="font-bold uppercase tracking-wider text-xs text-emerald-400">
            About & Learning Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                College / Organization
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. IIT Delhi, NSUT"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                City / Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New Delhi, Bengaluru"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Learning Mode
              </label>
              <select
                value={learningMode}
                onChange={(e) => setLearningMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Online">Online Only (Meet / Zoom)</option>
                <option value="Offline">Offline (Campus / Library)</option>
                <option value="Both">Both Online & Offline</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Bio & Introduction
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Apne study interests aur skills ke baare me likhein..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* 2-Column Skill Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Skills I Can Teach */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" /> Skills I Can Teach
                </h3>
                <p className="text-xs text-slate-400 mt-1">Skills jo aap dusre students ko sikha sakte hain.</p>
              </div>
              <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full">
                {skillsToTeach.length} Added
              </span>
            </div>

            <div className="space-y-2.5">
              {skillsToTeach.length > 0 ? (
                skillsToTeach.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/80 border border-slate-700/80 p-3.5 rounded-xl">
                    <div>
                      <div className="font-bold text-white text-sm">{skill.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Level: <span className="text-emerald-400 font-semibold">{skill.level}</span> {skill.experience && `• ${skill.experience}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTeach(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 transition"
                      title="Remove skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">Koi teaching skill add nahi hai. Niche form se add karein.</div>
              )}
            </div>

            <form onSubmit={handleAddTeachSkill} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Add Teaching Skill</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="e.g. Java, React, SQL"
                  value={newTeach.name}
                  onChange={(e) => setNewTeach({ ...newTeach, name: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={newTeach.level}
                  onChange={(e) => setNewTeach({ ...newTeach, level: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add to Teaching List
              </button>
            </form>
          </div>

          {/* Column 2: Skills I Want to Learn */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-400" /> Skills I Want to Learn
                </h3>
                <p className="text-xs text-slate-400 mt-1">Skills jo aap seekhna chahte hain.</p>
              </div>
              <span className="text-xs font-bold bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-full">
                {skillsToLearn.length} Added
              </span>
            </div>

            <div className="space-y-2.5">
              {skillsToLearn.length > 0 ? (
                skillsToLearn.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/80 border border-slate-700/80 p-3.5 rounded-xl">
                    <div>
                      <div className="font-bold text-white text-sm">{skill.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Target Level: <span className="text-sky-400 font-semibold">{skill.level}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveLearn(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 transition"
                      title="Remove skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">Koi learning goal add nahi hai. Niche form se add karein.</div>
              )}
            </div>

            <form onSubmit={handleAddLearnSkill} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Add Learning Goal</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="e.g. Python, AI, Figma"
                  value={newLearn.name}
                  onChange={(e) => setNewLearn({ ...newLearn, name: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <select
                  value={newLearn.level}
                  onChange={(e) => setNewLearn({ ...newLearn, level: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add to Learning Goals
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}