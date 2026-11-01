import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Video, Mic, Disc, Send, Eraser, PhoneOff } from 'lucide-react';

const socket = io('http://localhost:5000'); // Aapka backend URL

export default function MeetingRoom() {
  const { roomId } = useParams();
  
  // Streams & Recording Refs
  const localVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  
  // Whiteboard Canvas Ref
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // UI States
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('board'); // 'board' ya 'chat'

  useEffect(() => {
    // 1. Camera & Audio Start
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Camera access error:", err));

    // 2. Room Join
    socket.emit('join-room', { roomId, userId: socket.id });

    // 3. Socket Listeners
    socket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('draw-data', ({ x, y, type }) => {
      drawOnCanvas(x, y, type, false);
    });

    socket.on('clear-board', () => {
      clearLocalCanvas();
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // --- WHITEBOARD LOGIC ---
  const drawOnCanvas = (x, y, type, emit = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#38bdf8'; // Blue cyan marker

    if (type === 'start') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (type === 'draw') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    if (emit) {
      socket.emit('draw-data', { x, y, type });
    }
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    isDrawing.current = true;
    drawOnCanvas(e.clientX - rect.left, e.clientY - rect.top, 'start', true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    drawOnCanvas(e.clientX - rect.left, e.clientY - rect.top, 'draw', true);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleClearBoard = () => {
    clearLocalCanvas();
    socket.emit('clear-board');
  };

  // --- RECORDING LOGIC (Browser Native MediaRecorder) ---
  const startRecording = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return alert('Video stream not found to record');

    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-session-${roomId}.webm`;
      a.click();
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- CHAT LOGIC ---
  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    socket.emit('send-message', {
      sender: 'You',
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setInputMsg('');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      
      {/* LEFT/CENTER AREA: Video Feeds + Live Whiteboard */}
      <div className="flex-1 flex flex-col p-4 gap-4">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div>
            <h2 className="font-bold text-emerald-400">Meeting Room: {roomId}</h2>
            <p className="text-xs text-slate-400">Peer Collaboration Session</p>
          </div>

          <div className="flex gap-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
              >
                <Disc className="w-4 h-4 animate-pulse" /> Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
              >
                <Disc className="w-4 h-4" /> Stop & Save Recording
              </button>
            )}

            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-1 bg-red-800 hover:bg-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
            >
              <PhoneOff className="w-4 h-4" /> End Call
            </button>
          </div>
        </div>

        {/* Meeting Body: Video + Canvas */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          
          {/* Whiteboard Workspace */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800/60 border-b border-slate-700 text-xs">
              <span className="font-semibold text-slate-300">Live Interactive Board</span>
              <button
                onClick={handleClearBoard}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition"
              >
                <Eraser className="w-3.5 h-3.5" /> Clear Board
              </button>
            </div>

            <canvas
              ref={canvasRef}
              width={800}
              height={550}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="w-full h-full cursor-crosshair bg-slate-950"
            />
          </div>

          {/* User Video Windows */}
          <div className="w-72 flex flex-col gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <span className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-xs">You</span>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center text-slate-500 text-xs">
              <span>Waiting for peer camera...</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: In-Meeting Real-time Chat */}
      <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full">
        <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-200">
          Meeting Chat
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div key={i} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50 text-xs">
              <div className="flex justify-between text-slate-400 mb-1">
                <span className="font-bold text-emerald-400">{m.sender}</span>
                <span>{m.time}</span>
              </div>
              <p className="text-slate-100">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={sendMessage} className="p-3 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <button type="submit" className="bg-emerald-500 text-slate-950 p-2 rounded-xl hover:bg-emerald-400 transition">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}