import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  LayoutDashboard, 
  History, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X 
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Summary History',
      path: '/history',
      icon: History
    }
  ];

  const toggleMobileSidebar = () => setIsOpen(!isOpen);

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-6">
      {/* Brand logo & Nav */}
      <div>
        <div className="flex items-center space-x-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white dark:text-white">
            SmartSumm <span className="text-brand-400">AI</span>
          </span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500/10 border-l-4 border-brand-500 text-brand-300 shadow-md shadow-brand-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile & Controls */}
      <div className="space-y-5 pt-6 border-t border-slate-900/60 dark:border-slate-900/60">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/30 dark:bg-slate-950/20 border border-slate-800/40 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-700/60 transition-all"
        >
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span className="font-semibold text-xs tracking-wider uppercase">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <span className="w-7 h-4 rounded-full bg-slate-800 relative flex items-center px-0.5">
            <span className={`w-3 h-3 rounded-full bg-brand-500 absolute transition-transform ${theme === 'dark' ? 'translate-x-3' : 'translate-x-0'}`} />
          </span>
        </button>

        {/* User Card */}
        {user && (
          <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-900/10 dark:bg-slate-950/10 border border-slate-900/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all"
        >
          <LogOut className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden relative z-25 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-md font-bold tracking-tight text-white">SmartSumm AI</span>
        </div>
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:block w-64 h-screen bg-slate-950 border-r border-slate-900/60 shrink-0 sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          {/* Overlay Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMobileSidebar} />

          {/* Drawer Panel */}
          <aside className="relative z-40 w-64 h-full bg-slate-950 border-r border-slate-900">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
