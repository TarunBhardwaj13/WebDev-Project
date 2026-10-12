import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <span className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            EXCHIVO
          </span>
          <p className="text-sm text-slate-400 leading-relaxed">
            Exchange skills. Grow together. A modern peer-to-peer barter learning network for students and professionals.
          </p>
          
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/matches" className="hover:text-emerald-400 transition">Find Partners</Link></li>
            <li><Link to="/leaderboard" className="hover:text-emerald-400 transition">Leaderboard</Link></li>
            <li><Link to="/register" className="hover:text-emerald-400 transition">Join Community</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Popular Skills</h4>
          <ul className="space-y-2 text-sm">
            <li>React & Frontend</li>
            <li>Python & Machine Learning</li>
            <li>Java & System Design</li>
            <li>UI/UX Design</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">About</h4>
          <p className="text-sm text-slate-400">
            Built with React, Tailwind CSS, Express, and MongoDB. Learn by sharing.
          </p>
          <p className="text-xs text-slate-500 mt-4">
            &copy; {new Date().getFullYear()} EXCHIVO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}