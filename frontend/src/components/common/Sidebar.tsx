import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Brain, LayoutDashboard, History, Layers, BookOpen, Mail, Settings, Shield, LogOut, Cpu, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'MRI Analysis', path: '/app', icon: LayoutDashboard },
    { label: 'Analysis History', path: '/app/history', icon: History },
    { label: 'AI Models', path: '/models', icon: Layers },
    { label: 'Documentation', path: '/documentation', icon: BookOpen },
    { label: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <aside className="w-64 bg-navy-950 border-r border-navy-800 flex flex-col justify-between min-h-[calc(100vh-4rem)] text-slate-300 select-none">
      <div className="py-6 px-4 space-y-6">
        
        {/* Navigation Group Header */}
        <div>
          <p className="px-3 text-[11px] font-semibold font-mono uppercase tracking-wider text-slate-500 mb-2">
            RESEARCH WORKSPACE
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-navy-900'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* System Status Card */}
        <div className="mx-1 p-3.5 rounded-lg bg-navy-900 border border-navy-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" /> PyTorch Engine
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-300 font-medium">Device: CPU / CUDA Active</p>
          <p className="text-[11px] text-slate-400">Classification + UNet Loaded</p>
        </div>

        {user?.role === 'admin' && (
          <div>
            <p className="px-3 text-[11px] font-semibold font-mono uppercase tracking-wider text-slate-500 mb-2">
              ADMINISTRATION
            </p>
            <NavLink
              to="/app/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-navy-900'
                }`
              }
            >
              <Shield className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Admin Dashboard</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* User Footer Settings */}
      <div className="p-4 border-t border-navy-900 bg-navy-950/80 space-y-2">
        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            `flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors ${
              isActive ? 'bg-navy-800 text-white' : 'text-slate-400 hover:bg-navy-900 hover:text-slate-200'
            }`
          }
        >
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="truncate font-medium">{user?.full_name}</span>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-400" />
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded-md text-xs text-red-400 hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
