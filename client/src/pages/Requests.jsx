import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Inbox, 
  Send, 
  Check, 
  X, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  GraduationCap,
  Loader2
} from 'lucide-react';

export default function Requests() {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Fetch real exchange requests from MongoDB
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      setReceivedRequests(res.data.data?.received || []);
      setSentRequests(res.data.data?.sent || []);
    } catch (err) {
      console.error('Failed to load requests from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle Accept Request in Backend
  const handleAccept = async (id, name) => {
    try {
      await api.put(`/requests/${id}/accept`);
      setNotification(`Accepted request from ${name}! Connection ban gaya.`);
      setTimeout(() => setNotification(''), 4000);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Request accept nahi ho saki.');
    }
  };

  // Handle Reject Request in Backend
  const handleReject = async (id, name) => {
    try {
      await api.put(`/requests/${id}/reject`);
      setNotification(`Declined request from ${name}.`);
      setTimeout(() => setNotification(''), 3000);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Request decline nahi ho saki.');
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {notification && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-xl">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-extrabold text-white">Exchange Requests</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage incoming peer exchange requests and monitor sent invitations.
          </p>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 gap-8">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'received'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" /> Received Requests ({receivedRequests.filter(r => r.status === 'pending').length})
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'sent'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" /> Sent Invitations ({sentRequests.length})
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center text-slate-400 text-sm gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span>Database se requests load ho rahi hain...</span>
          </div>
        ) : activeTab === 'received' ? (
          <div className="space-y-4">
            {receivedRequests.length > 0 ? (
              receivedRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                        {req.sender?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">{req.sender?.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <GraduationCap className="w-3.5 h-3.5" /> {req.sender?.college || 'Student'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        Offers to teach: <strong>{req.teachSkill}</strong>
                      </span>
                      <span className="text-slate-500">&harr;</span>
                      <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-lg">
                        Wants to learn: <strong>{req.learnSkill}</strong>
                      </span>
                    </div>

                    {req.message && (
                      <p className="text-xs text-slate-300 italic pt-1 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        "{req.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex md:flex-col items-center gap-2 shrink-0">
                    {req.status === 'accepted' ? (
                      <div className="flex items-center gap-2">
                        <Link
                          to="/chat"
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Chat
                        </Link>
                        <Link
                          to="/sessions"
                          className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Schedule
                        </Link>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAccept(req._id, req.sender?.name)}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleReject(req._id, req.sender?.name)}
                          className="w-full bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-800 text-xs">
                Database me abhi koi exchange request nahi hai.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sentRequests.length > 0 ? (
              sentRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 flex items-center justify-between shadow-lg"
                >
                  <div>
                    <h3 className="font-bold text-white text-base">{req.receiver?.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{req.receiver?.college || 'Student'}</p>
                    <div className="flex items-center gap-2 text-xs mt-2 text-slate-300">
                      <span>You teach: <strong className="text-emerald-400">{req.teachSkill}</strong></span>
                      <span>&bull;</span>
                      <span>You learn: <strong className="text-sky-400">{req.learnSkill}</strong></span>
                    </div>
                  </div>

                  <div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      req.status === 'accepted'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-800 text-xs">
                Aapne abhi tak koi request nahi bheji hai.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}