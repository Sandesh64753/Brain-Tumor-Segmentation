import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Brain, Shield, User as UserIcon, LogOut, ChevronDown, LayoutDashboard, History, BookOpen, Mail, Server } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-navy-900 border-b border-navy-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Subtitle */}
          <Link to={isAuthenticated ? "/app" : "/"} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600/30 transition-colors">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  NEUROSCAN <span className="text-blue-400 font-mono">AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700/50 font-mono">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] tracking-widest text-slate-400 font-mono font-medium">
                RESEARCH • ANALYZE • DISCOVER
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to={isAuthenticated ? "/app" : "/"}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') || isActive('/app')
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              {isAuthenticated ? "Analysis Workspace" : "Home"}
            </Link>

            {isAuthenticated && (
              <Link
                to="/app/history"
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/app/history')
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-navy-800'
                }`}
              >
                Analysis History
              </Link>
            )}

            <Link
              to="/models"
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/models')
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              AI Models
            </Link>

            <Link
              to="/documentation"
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/documentation')
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              Docs
            </Link>

            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/contact')
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              Contact
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/app/admin"
                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide uppercase transition-colors flex items-center gap-1.5 ${
                  isActive('/app/admin')
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Admin
              </Link>
            )}
          </nav>

          {/* Right Action / Profile Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-navy-800 hover:bg-navy-700 border border-navy-700 text-sm font-medium text-slate-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{user?.full_name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-navy-900 border border-navy-700 rounded-lg shadow-xl py-1 text-slate-200 text-sm z-50 divide-y divide-navy-800"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5">
                      <p className="font-semibold text-white truncate">{user?.full_name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/app"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-navy-800 text-slate-300 hover:text-white"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-400" /> MRI Analysis
                      </Link>
                      <Link
                        to="/app/history"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-navy-800 text-slate-300 hover:text-white"
                      >
                        <History className="w-4 h-4 text-cyan-400" /> Analysis History
                      </Link>
                      <Link
                        to="/app/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-navy-800 text-slate-300 hover:text-white"
                      >
                        <UserIcon className="w-4 h-4 text-indigo-400" /> User Settings
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-950/40 text-red-400 hover:text-red-300"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-navy-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors border border-blue-500"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
