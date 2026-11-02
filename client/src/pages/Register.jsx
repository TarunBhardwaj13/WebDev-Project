import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { GraduationCap, Briefcase, Mail, Lock, User, Building, MapPin, Loader2, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); // 'student' or 'professor'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    location: '',
    department: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        role,
      };
      
      const res = await axios.post('/auth/register', payload);
      
      if (res.data.success || res.status === 201) {
        alert('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-12 text-white">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-emerald-400">Join Learn Unique</h1>
          <p className="text-sm text-slate-400">Select your account type to get started</p>
        </div>

        {/* Role Toggle Switch */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              role === 'student'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap size={18} /> Student
          </button>

          <button
            type="button"
            onClick={() => setRole('professor')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              role === 'professor'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase size={18} /> Professor
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-semibold mb-1 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={role === 'student' ? 'e.g. Rahul Sharma' : 'e.g. Dr. Rajesh Verma'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Conditional Fields based on Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1 block">
                {role === 'student' ? 'College / Institute' : 'University / College'}
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="e.g. KIET Ghaziabad"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1 block">
                {role === 'student' ? 'City / Location' : 'Department'}
              </label>
              <div className="relative">
                {role === 'student' ? (
                  <MapPin className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
                ) : (
                  <Briefcase className="absolute left-3.5 top-3.5 text-slate-500" size={17} />
                )}
                <input
                  type="text"
                  name={role === 'student' ? 'location' : 'department'}
                  value={role === 'student' ? formData.location : formData.department}
                  onChange={handleChange}
                  placeholder={role === 'student' ? 'e.g. Meerut, Ghaziabad' : 'e.g. Computer Science'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Register as {role === 'student' ? 'Student' : 'Professor'} <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-bold hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}