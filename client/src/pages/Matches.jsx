import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Send, 
  GraduationCap, 
  Star, 
  Award, 
  BookOpen, 
  X, 
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function Matches() {
  const { user } = useAuth();

  // API Data & Loading state
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');

  // Modal State for Sending Request
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [teachSkill, setTeachSkill] = useState('');
  const [learnSkill, setLearnSkill] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch partners/matches directly from MongoDB backend
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        setApiError('');
        const res = await api.get('/matches');
        setPartners(res.data.data || []);
      } catch (err) {
        console.error('Failed to load partners from database:', err);
        setApiError(err.response?.data?.message || 'Database se partners load nahi ho paye.');
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  // Open Connect Modal
  const handleOpenModal = (partner) => {
    setSelectedPartner(partner);
    setTeachSkill(user?.skillsToTeach?.[0]?.name || '');
    setLearnSkill(partner.skillsToTeach?.[0]?.name || '');
    setCustomMessage(`Hi ${partner.name?.split(' ')[0] || ''}, I would like to exchange skills with you!`);
    setIsModalOpen(true);
  };

  // Submit Exchange Request to Backend API
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedPartner) return;

    try {
      setSubmitting(true);
      await api.post('/requests', {
        receiverId: selectedPartner._id,
        teachSkill,
        learnSkill,
        message: customMessage
      });
      setIsModalOpen(false);
      setToastMessage(`Exchange request sent to ${selectedPartner.name} successfully!`);
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Request bhejne me error aayi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    if (score >= 70) return 'bg-teal-500/10 text-teal-300 border border-teal-500/30';
    return 'bg-slate-700/60 text-slate-300 border border-slate-600';
  };

  // Filter Logic over database response
  const filteredPartners = partners.filter((p) => {
    // Current logged-in user ko khud ke matches me nahi dikhana
    if (p._id === user?._id) return false;

    const term = searchTerm.toLowerCase();
    const teachSkills = p.skillsToTeach || [];
    const learnSkills = p.skillsToLearn || [];

    const matchesSearch = 
      p.name?.toLowerCase().includes(term) ||
      teachSkills.some(s => s.name?.toLowerCase().includes(term)) ||
      learnSkills.some(s => s.name?.toLowerCase().includes(term));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesMode = selectedMode === 'All' || p.learningMode === selectedMode || p.learningMode === 'Both';

    return matchesSearch && matchesCategory && matchesMode;
  });

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Success Alert */}
        {toastMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-xl">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* API Error Alert */}
        {apiError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Reciprocal Match Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Find Your Skill Buddy</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Discover peers from the database with compatible learning goals.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-slate-800/60 border border-slate-700/80 p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by skill (e.g. Python, Java, React) or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="AI/ML">AI & Machine Learning</option>
              <option value="Soft Skills">Soft Skills</option>
            </select>

            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Modes</option>
              <option value="Online">Online Only</option>
              <option value="Offline">Offline Only</option>
              <option value="Both">Online / Offline</option>
            </select>
          </div>
        </div>

        {/* Content Section: Loading vs Cards vs Empty */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 text-sm gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span>Database se compatible skill partners load ho rahe hain...</span>
          </div>
        ) : filteredPartners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <div 
                key={partner._id}
                className="bg-slate-800/60 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-6 transition duration-200 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shrink-0">
                        {partner.name ? partner.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-snug">{partner.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {partner.college || 'Peer Student'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${getScoreBadgeClass(partner.matchScore || 75)}`}>
                      {partner.matchScore ? `${partner.matchScore}% Match` : 'Match'}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {partner.bio || 'Skill exchange karne ke liye ready.'}
                  </p>

                  <div className="space-y-3 mb-5">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1.5 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Can Teach
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {partner.skillsToTeach && partner.skillsToTeach.length > 0 ? (
                          partner.skillsToTeach.map((s, idx) => (
                            <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg">
                              {s.name} <span className="text-[10px] text-emerald-400">({s.level})</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No teaching skills listed</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block mb-1.5 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> Wants to Learn
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {partner.skillsToLearn && partner.skillsToLearn.length > 0 ? (
                          partner.skillsToLearn.map((s, idx) => (
                            <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg">
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No learning goals listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1 font-semibold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {partner.rating ? partner.rating.toFixed(1) : '5.0'}
                    </div>
                    <div>{partner.xp || 10} XP</div>
                  </div>

                  <button
                    onClick={() => handleOpenModal(partner)}
                    className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 bg-slate-800/20 border border-slate-800 rounded-2xl text-sm">
            Database me abhi koi matching user nahi mila. Dusre users ke register hone par yahan show honge.
          </div>
        )}

      </div>

      {/* Exchange Request Modal */}
      {isModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Skill Barter Invitation</span>
              <h3 className="text-xl font-bold text-white mt-1">Connect with {selectedPartner.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Propose a reciprocal exchange session.</p>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Skill You Want to Learn
                </label>
                <input
                  type="text"
                  value={learnSkill}
                  onChange={(e) => setLearnSkill(e.target.value)}
                  placeholder="e.g. Python, AI, React"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Skill You Can Teach in Return
                </label>
                <input
                  type="text"
                  value={teachSkill}
                  onChange={(e) => setTeachSkill(e.target.value)}
                  placeholder="e.g. Java, React, SQL"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Personal Note
                </label>
                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Introduce yourself and propose a schedule..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}