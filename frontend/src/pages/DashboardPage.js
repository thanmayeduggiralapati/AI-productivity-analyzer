import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/common/Layout';
import { motion } from 'framer-motion';
import {
    CheckSquare, Target, Flame, Clock,
    Plus, ChevronRight, Sparkles,
    BookOpen, BarChart3, Bot
} from 'lucide-react';
import taskService from '../services/taskService';
import insightService from '../services/insightService';
import aiService from '../services/aiService';
import journalService from '../services/journalService';

const DashboardPage = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [insights, setInsights] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [journalText, setJournalText] = useState('');
    const [extracting, setExtracting] = useState(false);
    const [extractedTasks, setExtractedTasks] = useState([]);
    const [showExtracted, setShowExtracted] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };
    const formatDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };
    // eslint-disable-next-line
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [insightRes, taskRes] = await Promise.all([
                insightService.getDashboard(),
                taskService.getTasks(today)
            ]);
            setInsights(insightRes.data.today);
            setTasks(taskRes.data.tasks);
        } catch(err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleExtractTasks = async () => {
        if (!journalText.trim()) return;
        setExtracting(true);
        try {
            const res = await aiService.extractTasks(journalText, user?.goal, today);
    
    // Make sure tasks is always an array
            const tasks = Array.isArray(res.data.tasks) 
                ? res.data.tasks 
                : [];
    
            setExtractedTasks(tasks);
            setShowExtracted(true);

    // Save journal
            await journalService.saveJournal({
            date: today,
            content: journalText
        });
    } catch (err) {
        console.error(err);
        alert('AI extraction failed. Please try again.');
    } finally {
        setExtracting(false);
    }
    };
    const handleSaveTasks = async () => {
        try {
            await journalService.saveExtractedTasks(today, extractedTasks);
            setShowExtracted(false);
            setJournalText('');
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleTask = async (taskId, currentStatus) => {
        try {
            if (currentStatus === 'completed') {
                await taskService.updateTask(taskId, { status: 'pending' });
            } else {
                await taskService.markDone(taskId);
            }
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const statCards = [
        {
            label: 'Tasks Today',
            value: insights?.totalTasks || 0,
            icon: CheckSquare,
            bg: isDark ? 'bg-primary-500' : 'bg-primary-50',
            iconBg: 'bg-primary-400',
            textColor: 'text-primary-400'
        },
        {
            label: 'Completed',
            value: insights?.completedTasks || 0,
            icon: Target,
            bg: isDark ? 'bg-dark-card' : 'bg-success-50',
            iconBg: 'bg-success-400',
            textColor: 'text-success-400'
        },
        {
            label: 'Focus Time',
            value: `${insights?.totalFocusMinutes || 0}m`,
            icon: Clock,
            bg: isDark ? 'bg-dark-card' : 'bg-info-50',
            iconBg: 'bg-info-400',
            textColor: 'text-info-400'
        },
        {
            label: 'Streak',
            value: `${user?.streak || 1} day`,
            icon: Flame,
            bg: isDark ? 'bg-dark-card' : 'bg-warn-50',
            iconBg: 'bg-warn-400',
            textColor: 'text-warn-400'
        }
    ];

    const quickLinks = [
        { label: 'Journal', icon: BookOpen, path: '/journal', color: 'bg-primary-50 text-primary-500' },
        { label: 'Goals', icon: Target, path: '/goals', color: 'bg-success-50 text-success-500' },
        { label: 'Insights', icon: BarChart3, path: '/insights', color: 'bg-info-50 text-info-500' },
        { label: 'AI Chat', icon: Bot, path: '/assistant', color: 'bg-warn-50 text-warn-500' },
    ];
    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }
    return (
        <Layout>
            <div className="space-y-6">
                {/* ─── Header ─────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-6"
                    style={{
                        background: isDark ? 'linear-gradient(135deg, #1A1A2E, #2A2A3E)' : 'linear-gradient(135deg, #EEEDFE, #E1F5EE, #E6F1FB)'
                    }}
                >
                    <p className={`text-xs font-500 uppercase tracking-wider mb-1 ${isDark ? 'text-dark-muted' : 'text-primary-500'}`}>
                        {formatDate()}
                    </p>
                    <h1 className={`text-2xl font-500 mb-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        {insights?.totalTasks === 0 ? 'No tasks yet. Write your journal to get started!' : `You have ${insights?.pendingTasks} tasks pending. Keep going!`}
                    </p>
                </motion.div>
                {/* ─── Stat Cards ─────────────────────── */}
                <div className="grid grid-cols-4 gap-4">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`
                                rounded-xl p-4 border
                                ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}
                            `}
                        >
                            <div className={`w-9 h-9 rounded-lg ${stat.iconBg} flex items-center justify-center mb-3`}>
                                <stat.icon size={18} color="white" />
                            </div>
                            <p className={`text-2xl font-500 ${stat.textColor}`}>{stat.value}</p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
                {/* ─── Main Grid ──────────────────────── */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Tasks */}
                    <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                Today's Tasks
                            </h2>
                            <button
                                onClick={() => navigate('/tasks')}
                                className="btn-primary text-xs py-1.5 px-3"
                            >
                                <Plus size={13} /> Add
                            </button>
                        </div>
                        {tasks.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckSquare size={32} className={`mx-auto mb-2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                    No tasks yet
                                </p>
                                <p className={`text-xs mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                    Write in your journal to extract tasks
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tasks.slice(0, 5).map((task) => (
                                    <div
                                        key={task._id}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-lg
                                            ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}
                                        `}
                                    >
                                        <button
                                            onClick={() => handleToggleTask(task._id, task.status)}
                                            className={`
                                                w-5 h-5 rounded-full border-2 flex-shrink-0
                                                flex items-center justify-center
                                                transition-all duration-150
                                                ${task.status === 'completed' ? 'bg-success-400 border-success-400' : 'border-primary-400'}
                                            `}
                                        >
                                            {task.status === 'completed' && (
                                                <CheckSquare size={10} color="white" />
                                            )}
                                        </button>
                                        <span className={`text-sm flex-1 ${task.status === 'completed' ? 'line-through opacity-50' : isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                            {task.title}
                                        </span>
                                        <span className={`
                                            text-xs px-2 py-0.5 rounded-full
                                            ${task.priority === 'high' || task.priority === 'urgent'
                                                ? 'bg-danger-50 text-danger-500'
                                                : task.priority === 'medium' ? 'bg-warn-50 text-warn-500' : 'bg-success-50 text-success-500'
                                            }
                                        `}>
                                            {task.priority}
                                        </span>
                                    </div>
                                ))}
                                {tasks.length > 5 && (
                                    <button
                                        onClick={() => navigate('/tasks')}
                                        className={`text-xs text-primary-400 flex items-center gap-1 mt-2`}
                                    >
                                        View all {tasks.length} tasks <ChevronRight size={12} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Journal */}
                    <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                        <h2 className={`text-sm font-500 mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                            Quick Journal
                        </h2>
                        {!showExtracted ? (
                            <>
                            <textarea
                                value={journalText}
                                onChange={(e) => setJournalText(e.target.value)}
                                placeholder="Write what's on your mind... AI will extract your tasks automatically"
                                className={`
                                    w-full h-36 p-3 rounded-lg text-sm resize-none outline-none
                                    border transition-colors duration-150
                                    ${isDark
                                        ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-muted focus:border-primary-400'
                                        : 'bg-light-bg border-light-border text-light-text placeholder-light-muted focus:border-primary-400'
                                    }
                                `}
                            />
                            <button 
                                onClick={handleExtractTasks}
                                disabled={extracting || !journalText.trim()}
                                className="btn-primary w-full justify-center py-2.5 mt-3"
                            >
                            {extracting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><Sparkles size={14} /> Extract Tasks with AI</>
                            )}
                            </button>
                        </>  
                        ) : (
                            <div>
                                <p className={`text-xs mb-3 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                    AI extracted {extractedTasks.length} tasks:
                                </p>
                                <div className="space-y-2 max-h-36 overflow-y-auto">
                                    {extractedTasks.map((task, i) => (
                                        <div
                                        key={i}
                                        className={`
                                            flex items-center gap-2 p-2 rounded-lg text-sm
                                            ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}
                                        `}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
                                        <span className={isDark ? 'text-dark-text' : 'text-light-text'}>
                                            {task.title}
                                        </span>
                                        </div>
                                    ))}
                                </div>
                                <div classname="flex gap-2 mt-3">
                                    <button onClick={handleSaveTasks} className="btn-primary flex-1 justify-center py-2">
                                        Save Tasks
                                    </button>
                                    <button
                                        onClick={() => setShowExtracted(false)}
                                        className="btn-secondary flex-1 justify-center py-2"
                                    >
                                        Redo
                                    </button>
                                </div>
                            </div>
                        )}          
                    </div>
                </div>
                {/* ─── Quick Links ─────────────────────── */}
                <div className="grid grid-cols-4 gap-4">
                    {quickLinks.map((link, i) => (
                        <motion.button
                            key={link.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => navigate(link.path)}
                            className={`
                                flex items-center gap-3 p-4 rounded-xl border text-left
                                transition-all duration-150 hover:scale-105
                                ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}
                            `}
                        >
                            <div className={`w-9 h-9 rounded-lg ${link.color} flex items-center justify-center`}>
                                <link.icon size={18} />
                            </div>
                            <span className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                {link.label}
                            </span>
                            <ChevronRight size={14} className={`ml-auto ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                        </motion.button>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default DashboardPage;