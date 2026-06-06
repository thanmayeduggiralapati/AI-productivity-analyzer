// components/common/Sidebar.js
// Main navigation sidebar

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    LayoutDashboard, BookOpen, CheckSquare, Target,
    Clock, Bot, FileText, StickyNote, BarChart3,
    MapPin, Sun, Moon, LogOut, Sparkles
} from 'lucide-react';

const navItems = [
    { path: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
    { path: '/journal',    label: 'Journal',      icon: BookOpen },
    { path: '/tasks',      label: 'Tasks',        icon: CheckSquare },
    { path: '/goals',      label: 'Goals',        icon: Target },
    { path: '/focus',      label: 'Focus Mode',   icon: Clock },
    { path: '/assistant',  label: 'AI Assistant', icon: Bot },
    { path: '/mocktest',   label: 'Mock Tests',   icon: FileText },
    { path: '/notes',      label: 'Notes',        icon: StickyNote },
    { path: '/insights',   label: 'Insights',     icon: BarChart3 },
    { path: '/travel',     label: 'Travel',       icon: MapPin },
];

const Sidebar = () => {
    const { logout, user } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    return (
    <aside className={`
        fixed left-0 top-0 h-full w-56 z-50
        flex flex-col
        ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}
        border-r
    `}>
    {/* ─── Logo ─────────────────────────────── */}
    <div className={`
        p-5 border-b
        ${isDark ? 'border-dark-border' : 'border-light-border'}
    `}>
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-400 flex items-center justify-center">
                <Sparkles size={16} color="white" />
            </div>
        <div>
        <p className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Productivity Analyzer
        </p>
        <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
            v
        </p>
    </div>
    </div>
    </div>

    {/* ─── Navigation ───────────────────────── */}
    <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
                flex items-center gap-3 px-5 py-2.5 text-sm
                transition-all duration-150
                ${isActive
                    ? isDark
                    ? 'bg-primary-500 text-white border-r-2 border-primary-400'
                    : 'bg-primary-50 text-primary-500 border-r-2 border-primary-400 font-500'
                    : isDark
                    ? 'text-dark-muted hover:bg-dark-border hover:text-dark-text'
                    : 'text-light-muted hover:bg-light-border hover:text-light-text'
                }
            `}
        >
            <Icon size={17} />
            {label}
        </NavLink>
        ))}
    </nav>

    {/* ─── Bottom Actions ────────────────────── */}
    <div className={`
            p-4 border-t
            ${isDark ? 'border-dark-border' : 'border-light-border'}
        `}>
        {/* User info */}
        <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                <span className="text-sm font-500 text-primary-500">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
            </div>
        <div>
        <p className={`text-xs font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            {user?.name || 'User'}
        </p>
        <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
            {user?.email || ''}
        </p>
        </div>
        </div>

        {/* Theme toggle */}
        <button
            onClick={toggleTheme}
            className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-2
                transition-all duration-150
                ${isDark
                    ? 'bg-dark-border text-dark-muted hover:text-dark-text'
                    : 'bg-light-border text-light-muted hover:text-light-text'
                }
            `}
        >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* Logout */}
        <button
            onClick={handleLogout}
            className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                transition-all duration-150
                ${isDark
                    ? 'text-dark-muted hover:bg-dark-border hover:text-danger-400'
                    : 'text-light-muted hover:bg-light-border hover:text-danger-400'
                }
            `}
        >
            <LogOut size={14} />
            Logout
        </button>
    </div>
    </aside>
);
};

export default Sidebar;