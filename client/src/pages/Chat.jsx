import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Send, User, MessageSquare, Loader2 } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch connections/chat list from API
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        const res = await api.get('/connections');
        setConversations(res.data.data || []);
      } catch (err) {
        console.error('Failed to load connections', err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        const res = await api.get(`/messages/${selectedUser._id}`);
        setMessages(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch messages', err);
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedUser) return;

    try {
      const res = await api.post('/messages', {
        receiverId: selectedUser._id,
        text: inputMessage.trim()
      });
      setMessages((prev) => [...prev, res.data.data]);
      setInputMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="bg-slate-900 min-h-[calc(100vh-4rem)] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto h-[80vh] bg-slate-800/60 border border-slate-700/80 rounded-3xl overflow-hidden flex shadow-2xl">
        
        {/* Left Sidebar: Conversations */}
        <div className="w-1/3 border-r border-slate-700/80 flex flex-col bg-slate-900/40">
          <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" /> Chats
            </h2>
            <span className="text-xs text-slate-400">{conversations.length} Contacts</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-slate-400 text-sm gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading contacts...
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((c) => {
                const partner = c.users?.find((u) => u._id !== user?._id) || c;
                const isSelected = selectedUser?._id === partner._id;
                return (
                  <button
                    key={partner._id}
                    onClick={() => setSelectedUser(partner)}
                    className={`w-full p-4 flex items-center gap-3 text-left transition ${
                      isSelected ? 'bg-slate-800 border-l-4 border-emerald-500' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      {partner.name ? partner.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-white text-sm truncate">{partner.name || 'User'}</div>
                      <div className="text-xs text-slate-400 truncate">{partner.college || 'Peer Partner'}</div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Koi active connection nahi mila. Pehle request accept hone dein.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="flex-1 flex flex-col bg-slate-900/60">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-700/80 flex items-center gap-3 bg-slate-800/40">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm leading-tight">{selectedUser.name}</h3>
                  <span className="text-xs text-emerald-400">Online</span>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading messages...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((m, idx) => {
                    const isOwn = m.sender === user?._id || m.sender?._id === user?._id;
                    return (
                      <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                            isOwn
                              ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                              : 'bg-slate-800 text-white rounded-bl-none border border-slate-700'
                          }`}
                        >
                          <p>{m.text || m.message}</p>
                          <span
                            className={`text-[10px] block mt-1 text-right ${
                              isOwn ? 'text-emerald-950 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                    Abhi koi message nahi hai. Hello keh kar conversation shuru karein!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700/80 bg-slate-800/40 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 px-5 py-2.5 rounded-xl font-bold transition flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm gap-2">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              Chat karne ke liye left list se koi contact select karein.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}