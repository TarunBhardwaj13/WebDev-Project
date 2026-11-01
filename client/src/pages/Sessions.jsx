import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Star, 
  X, 
  Loader2,
  Video
} from 'lucide-react';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'completed'
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formPartnerId, setFormPartnerId] = useState('');
  const [formSkill, setFormSkill] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState('60');
  const [formMode, setFormMode] = useState('Online');
  const [formNotes, setFormNotes] = useState('');

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [reviewPartnerId, setReviewPartnerId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [toast, setToast] = useState('');

  // Fetch Sessions from Database
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sessions');
      setSessions(res.data.data || []);
    } catch (err) {
      console.error('Failed to load sessions', err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Handle Book Session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sessions', {
        partnerId: formPartnerId,
        skill: formSkill,
        date: formDate,
        startTime: formTime,
        duration: formDuration,
        mode: formMode,
        notes: formNotes
      });
      setIsCreateOpen(false);
      setToast('Session successfully schedule ho gaya!');
      setTimeout(() => setToast(''), 3000);
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || 'Session schedule nahi ho saka.');
    }
  };

  // Mark Completed
  const handleCompleteSession = async (id, partnerId) => {
    try {
      await api.put(`/sessions/${id}`, { status: 'Completed' });
      setSelectedSessionId(id);
      setReviewPartnerId(partnerId);
      setIsReviewOpen(true);
      fetchSessions();
    } catch (err) {
      console.error('Failed to complete session', err);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        sessionId: selectedSessionId,
        reviewedUserId: reviewPartnerId,
        rating,
        comment
      });
      setIsReviewOpen(false);
      setComment('');
      setToast('Review submit ho gaya aur XP add ho gaye!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Review submit nahi ho paya.');
    }
  };

  const filteredSessions = sessions.filter((s) =>
    activeTab === 'upcoming' ? s.status !== 'Completed' && s.status !== 'Cancelled' : s.status === 'Completed'
  );

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {toast && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" /> {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Peer Learning Sessions</h1>
            <p className="text-sm text-slate-400 mt-1">1-on-1 swap sessions schedule aur track karein.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition"
          >
            <Plus className="w-4 h-4" /> Schedule Session
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 gap-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'upcoming' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> Upcoming Sessions
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'completed' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Completed Sessions
          </button>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> Sessions load ho rahe hain...
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSessions.map((session) => {
              // Har session ke liye unique roomId ensure karein
              const meetingId = session.meetingRoomId || session.roomId || session._id;

              return (
                <div key={session._id} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {session.skill || 'Skill Exchange'}
                      </span>
                      <span className="text-xs text-slate-400">{session.mode || 'Online'}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{session.skill}</h3>
                    <div className="space-y-1 text-xs text-slate-300">
                      <div><strong>Date & Time:</strong> {session.date} at {session.startTime} ({session.duration || 60} mins)</div>
                      {session.notes && <div className="text-slate-400 italic mt-2">"{session.notes}"</div>}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      Status: <strong className="text-white">{session.status}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {session.status !== 'Completed' && (
                        <>
                          {/* Live Video + Whiteboard Meeting Button */}
                          <Link
                            to={`/meeting/${meetingId}`}
                            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition"
                          >
                            <Video className="w-3.5 h-3.5" /> Join Meeting
                          </Link>

                          <button
                            onClick={() => handleCompleteSession(session._id, session.teacher?._id || session.teacher)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-lg transition"
                          >
                            Mark Complete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 bg-slate-800/20 border border-slate-800 rounded-2xl text-sm">
            Koi session nahi mila.
          </div>
        )}

      </div>

      {/* Schedule Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setIsCreateOpen(false)} className="absolute right-5 top-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">New Learning Session Schedule Karein</h3>
            <form onSubmit={handleCreateSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Skill *</label>
                <input
                  type="text"
                  placeholder="e.g. Python Async Programming"
                  value={formSkill}
                  onChange={(e) => setFormSkill(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Time *</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Agenda / Meeting Link Notes</label>
                <textarea
                  rows={2}
                  placeholder="Session topics ya details..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition mt-2"
              >
                Schedule Confirm Karein
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setIsReviewOpen(false)} className="absolute right-5 top-5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2">Learning Experience Rate Karein</h3>
            <p className="text-xs text-slate-400 mb-4">Partner ko feedback dein taaki unka XP aur badge update ho sake.</p>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Rating (Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Feedback Comment</label>
                <textarea
                  rows={3}
                  placeholder="Session kaisa raha? Explanation easy tha ya nahi..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition"
              >
                Review Submit Karein (+XP)
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}