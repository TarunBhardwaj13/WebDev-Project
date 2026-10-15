import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Sparkles,
  ArrowRight,
  Repeat,
  Calendar,
  MessageSquare,
  Award,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const steps = [
    {
      title: '1. Create Profile',
      desc: 'Sign up in 30 seconds with your educational background.',
    },
    {
      title: '2. Add Your Skills',
      desc: 'List what you can teach and what you are eager to learn.',
    },
    {
      title: '3. Smart Match',
      desc: 'Our algorithm pairs you with compatible reciprocal learners.',
    },
    {
      title: '4. Exchange & Level Up',
      desc: 'Chat, schedule 1-on-1 sessions, and earn XP and badges.',
    },
  ];

  const popularSkills = [
    {
      name: 'Python',
      category: 'AI & Backend',
      learners: '420+ learners',
    },
    {
      name: 'React.js',
      category: 'Web Development',
      learners: '380+ learners',
    },
    {
      name: 'Java',
      category: 'Core Programming',
      learners: '310+ learners',
    },
    {
      name: 'Machine Learning',
      category: 'Data Science',
      learners: '290+ learners',
    },
    {
      name: 'UI/UX Design',
      category: 'Product Design',
      learners: '210+ learners',
    },
    {
      name: 'Communication',
      category: 'Soft Skills',
      learners: '190+ learners',
    },
  ];

  // Redirect users according to login status
  const partnerPath = user ? '/matches' : '/register';
  const explorePath = user ? '/matches' : '/login';

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8">
          <Sparkles className="w-4 h-4" />
          Peer-to-Peer Skill Barter
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
          Exchange Skills.
          <br />

          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
            Grow Together.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Learn what you need by sharing what you know. Connect with peers
          to swap Java for Python, Design for Code, or English for System
          Architecture without paying for expensive bootcamps.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          <Link
            to={partnerPath}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition text-base"
          >
            {user ? 'Find My Skill Partner' : 'Get Started'}
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to={explorePath}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-8 py-4 rounded-xl transition text-base"
          >
            {user ? 'Explore Matches' : 'Login to Explore'}
          </Link>

        </div>
      </section>

      {/* Metrics Row */}
      <section className="border-y border-slate-800 bg-slate-950/60 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">

          <div>
            <div className="text-3xl sm:text-4xl font-black text-white">
              1,500+
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
              Active Students
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">
              120+
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
              Listed Skills
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-white">
              3,200+
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
              Exchange Sessions
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-teal-400">
              98%
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
              Positive Reviews
            </div>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How Learn Unique Works
          </h2>

          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Zero tuition fees. A simple reciprocal model based on mutual
            respect and collaborative learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl relative"
            >
              <span className="text-3xl font-extrabold text-slate-700 absolute top-4 right-4">
                0{idx + 1}
              </span>

              <h3 className="text-lg font-bold text-white mb-2">
                {step.title}
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* Popular Skills Showcase */}
      <section className="py-20 bg-slate-950/40 border-t border-slate-800 px-4 sm:px-6 lg:px-8">

        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">

            <div>
              <h2 className="text-3xl font-bold text-white">
                Popular Exchange Skills
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Discover skills available for knowledge exchange.
              </p>
            </div>

            <Link
              to={partnerPath}
              className="text-emerald-400 hover:text-emerald-300 font-semibold text-sm inline-flex items-center gap-1 mt-4 md:mt-0"
            >
              Browse all skills
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

            {popularSkills.map((skill, index) => (
              <div
                key={index}
                className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-xl hover:border-emerald-500/40 transition"
              >

                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {skill.category}
                </span>

                <h3 className="text-xl font-bold text-white mt-1 mb-3">
                  {skill.name}
                </h3>

                <div className="flex items-center justify-between text-xs text-slate-400">

                  <span>{skill.learners}</span>

                  <Link
                    to={partnerPath}
                    className="text-slate-200 hover:text-emerald-400 font-semibold"
                  >
                    {user ? 'Find Match →' : 'Get Started →'}
                  </Link>

                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">
            Built for Genuine Learning
          </h2>

          <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
            Every tool you need to conduct seamless knowledge swaps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-2xl">
            <Repeat className="w-8 h-8 text-emerald-400 mb-4" />

            <h3 className="text-lg font-bold text-white mb-2">
              Smart Compatibility Matching
            </h3>

            <p className="text-sm text-slate-400">
              Our weighted scoring pairs you with users whose learning goals
              match what you teach.
            </p>
          </div>

          <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-2xl">
            <Calendar className="w-8 h-8 text-teal-400 mb-4" />

            <h3 className="text-lg font-bold text-white mb-2">
              Session Scheduling
            </h3>

            <p className="text-sm text-slate-400">
              Book mutually convenient 1-on-1 sessions with custom notes
              and durations.
            </p>
          </div>

          <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-2xl">
            <Award className="w-8 h-8 text-amber-400 mb-4" />

            <h3 className="text-lg font-bold text-white mb-2">
              Gamified XP & Badges
            </h3>

            <p className="text-sm text-slate-400">
              Earn XP by completing sessions, receiving high ratings,
              and climbing the community leaderboard.
            </p>
          </div>

        </div>
      </section>

      {/* Final Call To Action */}
      {!user && (
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-5xl mx-auto text-center bg-slate-800/50 border border-slate-700 rounded-3xl p-8 sm:p-12">

            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to Exchange Your Skills?
            </h2>

            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Join Learn Unique to connect with learners, share your
              knowledge, and grow together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

              <Link
                to="/register"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition"
              >
                Create Account
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-3 rounded-xl transition"
              >
                Already a Member? Login
              </Link>

            </div>
          </div>
        </section>
      )}

    </div>
  );
}