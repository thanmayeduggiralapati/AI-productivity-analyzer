// pages/JournalPage.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/common/Layout';
import { motion } from 'framer-motion';
import { Sparkles, Save, BookOpen, Calendar, Smile } from 'lucide-react';
import journalService from '../services/journalService';
import aiService from '../services/aiService';

const MOODS = [
    { label: 'Great', emoji: '😄', value: 'great' },
    { label: 'Good', emoji: '🙂', value: 'good' },
    { label: 'Okay', emoji: '😐', value: 'okay' },
    { label: 'Bad', emoji: '😔', value: 'bad' },
    { label: 'Terrible', emoji: '😢', value: 'terrible' },
];

const JournalPage = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();

    const [content, setContent] = useState('');
    const [mood, setMood] = useState('good');
    const [energyLevel, setEnergyLevel] = useState(5);
    const [reflection, setReflection] = useState('');
    const [gratitude, setGratitude] = useState('');
    const [saving, setSaving] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [extractedTasks, setExtractedTasks] = useState([]);
    const [showExtracted, setShowExtracted] = useState(false);
    const [saved, setSaved] = useState(false);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('write');

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        loadTodayJournal();
        loadHistory();
    }, []);

    const loadTodayJournal = async () => {
        try {
            const res = await journalService.getTodayJournal();
            if (res.data.journal) {
                const j = res.data.journal;
                setContent(j.content || '');
                setMood(j.mood || 'good');
                setEnergyLevel(j.energyLevel || 5);
                setReflection(j.reflection || '');
                setGratitude(j.gratitude || '');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadHistory = async () => {
        try {
            const res = await journalService.getHistory();
            setHistory(res.data.journals || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!content.trim()) return;
        setSaving(true);
        try {
            await journalService.saveJournal({
                date: today,
                content,
                mood,
                energyLevel: Number(energyLevel),
                reflection,
                gratitude
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };
    const handleExtract = async () => {
        if (!content.trim()) return;
        setExtracting(true);
        try {
            const res = await aiService.extractTasks(content, user?.goal, today);
            const tasks = Array.isArray(res.data.tasks) ? res.data.tasks : [];
            setExtractedTasks(tasks);
            setShowExtracted(true);
        } catch (err) {
            console.error(err);
        } finally {
            setExtracting(false);
        }
    };
    const handleSaveTasks = async () => {
        try {
            await journalService.saveExtractedTasks(today, extractedTasks);
            setShowExtracted(false);
            alert(`${extractedTasks.length} tasks saved successfully!`);
        } catch (err) {
            console.error(err);
        }
    };
    return (
    <Layout>
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    Journal
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    Write your thoughts — AI will extract tasks automatically
                </p>
            </div>
            {/* Tabs */}
            <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-dark-card' : 'bg-light-border'}`}>
                {['write', 'history'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-500 capitalize
                            transition-all duration-150
                            ${activeTab === tab
                                ? 'bg-primary-400 text-white'
                                : isDark ? 'text-dark-muted' : 'text-light-muted'
                            }
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {activeTab === 'write' ? (
                <div className="grid grid-cols-3 gap-6">
                    {/* Main Journal */}
                    <div className="col-span-2 space-y-4">
                        {/* Mood */}
                        <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                            <p className={`text-sm font-500 mb-3 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                How are you feeling today?
                            </p>
                            <div className="flex gap-3">
                                {MOODS.map(m => (
                                    <button
                                        key={m.value}
                                        onClick={async () => {
                                            setMood(m.value);
                                            // Auto save mood immediately
                                            try {
                                                await journalService.saveJournal({
                                                    date: today,
                                                    content: content || ' ',
                                                    mood: m.value,
                                                    energyLevel,
                                                    reflection,
                                                    gratitude
                                                });
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }}
                                        className={`
                                            flex flex-col items-center gap-1 p-3 rounded-xl border
                                            transition-all duration-150
                                            ${mood === m.value
                                                ? 'border-primary-400 bg-primary-50'
                                                : isDark ? 'border-dark-border' : 'border-light-border'
                                            }
                                        `}
                                    >
                                        <span className="text-2xl">{m.emoji}</span>
                                        <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                            {m.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Journal Content */}
                        <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                            <p className={`text-sm font-500 mb-3 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                What's on your mind?
                            </p>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write freely... What did you do today? What do you need to do? Any plans, ideas, or goals? AI will extract actionable tasks from your writing."
                                className={`
                                    w-full h-48 p-3 rounded-lg text-sm resize-none outline-none border
                                    ${isDark
                                        ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-muted focus:border-primary-400'
                                        : 'bg-light-bg border-light-border text-light-text placeholder-light-muted focus:border-primary-400'
                                    }
                                `}
                            />
                            <div className="flex gap-3 mt-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <Save size={14} />
                                    {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
                                </button>
                                <button
                                    onClick={handleExtract}
                                    disabled={extracting || !content.trim()}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {extracting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <><Sparkles size={14} /> Extract Tasks with AI</>
                                    )}
                                </button>
                            </div>
                        </div>
                        {/* Extracted Tasks */}
                        {showExtracted && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
                            >
                                <p className={`text-sm font-500 mb-3 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                    AI extracted {extractedTasks.length} tasks
                                </p>
                                <div className="space-y-2 mb-4">
                                    {extractedTasks.map((task, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-primary-400" />
                                            <span className={`text-sm flex-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                                {task.title}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full
                                                ${task.priority === 'high' || task.priority === 'urgent'
                                                    ? 'bg-danger-50 text-danger-500'
                                                    : 'bg-warn-50 text-warn-500'
                                                }`}>
                                                    {task.priority}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSaveTasks} className="btn-primary">
                                        Save All Tasks
                                    </button>
                                    <button
                                        onClick={() => setShowExtracted(false)}
                                        className="btn-secondary"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Energy Level */}
                        <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                            <p className={`text-sm font-500 mb-3 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                Energy Level: {energyLevel}/10
                            </p>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={energyLevel}
                                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                                className="w-full accent-primary-400"
                            />
                        </div>
                        {/* Gratitude */}
                        <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                            <p className={`text-sm font-500 mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                Gratitude
                            </p>
                            <textarea
                                value={gratitude}
                                onChange={(e) => setGratitude(e.target.value)}
                                placeholder="What are you grateful for today?"
                                className={`
                                    w-full h-24 p-3 rounded-lg text-sm resize-none outline-none border
                                    ${isDark
                                        ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-muted focus:border-primary-400'
                                        : 'bg-light-bg border-light-border text-light-text placeholder-light-muted focus:border-primary-400'
                                    }
                                `}
                            />
                        </div>
                        {/* Reflection */}
                        <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                            <p className={`text-sm font-500 mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                Daily Reflection ✨
                                </p>
                                <textarea
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    placeholder="What did you learn today?"
                                    className={`
                                        w-full h-24 p-3 rounded-lg text-sm resize-none outline-none border
                                        ${isDark
                                            ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-muted focus:border-primary-400'
                                            : 'bg-light-bg border-light-border text-light-text placeholder-light-muted focus:border-primary-400'
                                        }
                                    `}
                                />
                            </div>
                        </div>
                    </div>
                    ) : (
                        /* History Tab */
                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                                    <BookOpen size={40} className={`mx-auto mb-3 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                                    <p className={isDark ? 'text-dark-muted' : 'text-light-muted'}>
                                        No journal entries yet
                                    </p>
                                </div>
                            ) : (
                                history.map((journal) => (
                                <motion.div
                                    key={journal._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-primary-400" />
                                            <span className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                                {new Date(journal.date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Smile size={14} className="text-warn-400" />
                                            <span className={`text-xs capitalize ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                                {journal.mood}
                                            </span>
                                        </div>
                                    </div>
                                    <p className={`text-sm line-clamp-3 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                        {journal.content}
                                    </p>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>
            
        </Layout> 
    );
};

export default JournalPage;