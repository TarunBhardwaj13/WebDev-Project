import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, BookOpen, GraduationCap, MapPin, Send } from 'lucide-react';

export default function UserCard({ user, matchScore, onConnect }) {
  const teachSkills = user?.skillsToTeach || [];
  const learnSkills = user?.skillsToLearn || [];

  return (
    <div className="bg-slate-800/60 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-6 transition duration-200 flex flex-col justify-between shadow-lg">
      <div>
        {/* Top Header: Avatar, Name & Match Score */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-snug">{user?.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                {user?.college && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    {user.college}
                  </span>
                )}
                {user?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {user.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {matchScore && (
            <div className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${
              matchScore >= 80 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
            }`}>
              {matchScore}% Match
            </div>
          )}
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {user?.bio || "Passionate about peer learning and exchanging practical skills."}
        </p>

        {/* Skills Section */}
        <div className="space-y-3 mb-5">
          {/* Can Teach */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1.5 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Can Teach
            </span>
            <div className="flex flex-wrap gap-1.5">
              {teachSkills.length > 0 ? (
                teachSkills.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="bg-slate-900/80 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg">
                    {s.name} <span className="text-[10px] text-slate-400">({s.level})</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No skills added yet</span>
              )}
            </div>
          </div>

          {/* Wants to Learn */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Wants to Learn
            </span>
            <div className="flex flex-wrap gap-1.5">
              {learnSkills.length > 0 ? (
                learnSkills.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="bg-slate-900/80 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg">
                    {s.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No goals added yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer stats & connect button */}
      <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1 font-semibold text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {user?.rating ? user.rating.toFixed(1) : '5.0'}
          </div>
          <div>{user?.xp || 10} XP</div>
        </div>

        <button
          onClick={() => onConnect && onConnect(user)}
          className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
          Connect
        </button>
      </div>
    </div>
  );
}