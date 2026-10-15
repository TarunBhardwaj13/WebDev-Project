import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login', { replace: true });
  };

  const closeMenu = () => setIsOpen(false);

  const dashboardPath =
    user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  const firstName =
    user?.name?.split(' ')?.[0] || 'My Profile';

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Learn Unique
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">

            <Link
              to="/"
              className="text-slate-300 hover:text-white text-sm font-medium transition"
            >
              Home
            </Link>

            {!loading && user && (
              <>
                <Link
                  to="/matches"
                  className="text-slate-300 hover:text-white text-sm font-medium transition"
                >
                  Find Partners
                </Link>

                <Link
                  to="/leaderboard"
                  className="text-slate-300 hover:text-white text-sm font-medium transition"
                >
                  Leaderboard
                </Link>

                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-lg text-sm font-semibold border border-slate-700 transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 text-sm font-medium transition px-2"
                >
                  <User className="w-4 h-4" />
                  {firstName}
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 transition"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}

            {!loading && !user && (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-slate-200 hover:text-white text-sm font-semibold px-4 py-2 transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm shadow-md shadow-emerald-500/10 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white p-2"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">

          <Link
            to="/"
            onClick={closeMenu}
            className="block text-slate-300 hover:text-white py-2 text-base font-medium"
          >
            Home
          </Link>

          {!loading && user && (
            <>
              <Link
                to="/matches"
                onClick={closeMenu}
                className="block text-slate-300 hover:text-white py-2 text-base font-medium"
              >
                Find Partners
              </Link>

              <Link
                to="/leaderboard"
                onClick={closeMenu}
                className="block text-slate-300 hover:text-white py-2 text-base font-medium"
              >
                Leaderboard
              </Link>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <Link
                  to={dashboardPath}
                  onClick={closeMenu}
                  className="block text-emerald-400 py-2 font-medium"
                >
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="block text-slate-300 py-2 font-medium"
                >
                  My Profile ({firstName})
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-rose-400 py-2 font-medium"
                >
                  Logout
                </button>
              </div>
            </>
          )}

          {!loading && !user && (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={closeMenu}
                className="text-center w-full py-2 bg-slate-800 rounded-lg text-white font-medium"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={closeMenu}
                className="text-center w-full py-2 bg-emerald-500 rounded-lg text-slate-950 font-bold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}