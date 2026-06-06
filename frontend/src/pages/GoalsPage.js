// pages/GoalsPage.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/common/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Sparkles, ChevronDown, ChevronUp, Check, Trash2 } from 'lucide-react';
import goalService from '../services/goalService';
import aiService from '../services/aiService';

const CATEGORIES = ['career', 'education', 'health', 'personal', 'financial', 'other'];

const GoalsPage = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();

    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [expandedGoal, setExpandedGoal] = useState(null);
    const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        duration: '',
        category: 'career',
        targetDate: ''
    });

    // eslint-disable-next-line
    useEffect(() => { loadGoals(); }, []);

    const loadGoals = async () => {
        try {
            const res = await goalService.getGoals();
            setGoals(res.data.goals);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setGeneratingRoadmap(true);
        try {
            const roadmapRes = await aiService.generateRoadmap(
                form.title,
                form.duration,
                user?.studyField || form.category
            );
            const roadmap = roadmapRes.data.roadmap;

            await goalService.createGoal({
                ...form,
                phases: roadmap.phases || [],
                aiGenerated: true
            });
            setShowForm(false);
            setForm({ title: '', description: '', duration: '', category: 'career', targetDate: '' });
            loadGoals();
        } catch (err) {
            console.error(err);
            try {
                await goalService.createGoal(form);
                setShowForm(false);
                loadGoals();
            } catch (err2) {
                console.error(err2);
            }
        } finally {
            setGeneratingRoadmap(false);
        }
    };

    const handleCompleteMilestone = async (goalId, milestoneId) => {
        try {
            await goalService.completeMilestone(goalId, milestoneId);
            loadGoals();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await goalService.deleteGoal(id);
            loadGoals();
        } catch (err) {
            console.error(err);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            career: 'bg-primary-50 text-primary-500',
            education: 'bg-info-50 text-info-500',
            health: 'bg-success-50 text-success-500',
            personal: 'bg-warn-50 text-warn-500',
            financial: 'bg-danger-50 text-danger-500',
            other: 'bg-light-border text-light-muted'
        };
        return colors[category] || colors.other;
    };

    return (
    <Layout>
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        Goals
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        AI generates a personalized roadmap for each goal
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    <Plus size={16} /> New Goal
                </button>
            </div>
            {/* Add Goal Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
                    >
                        <h2 className={`text-sm font-500 mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                            Create New Goal
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <input
                                type="text"
                                placeholder="What do you want to achieve?"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="input"
                                required
                            />
                            <textarea
                                placeholder="Describe your goal in detail..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className={`input h-20 resize-none`}
                            />
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className={`text-xs mb-1 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                        Duration
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 6 months"
                                        value={form.duration}
                                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`text-xs mb-1 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                        Category
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="input"
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={`text-xs mb-1 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                        Target Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.targetDate}
                                        onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={generatingRoadmap}
                                    className="btn-primary"
                                >
                                    {generatingRoadmap ? (
                                        <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Generating Roadmap...
                                        </>
                                        ) : (
                                        <><Sparkles size={14} /> Create with AI Roadmap</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Goals List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                    ) : goals.length === 0 ? (
                    <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                        <Target size={40} className={`mx-auto mb-3 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                        <p className={`${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                            No goals yet. Create your first goal!
                        </p>
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {goals.map((goal) => (
                            <motion.div
                                key={goal._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`rounded-xl border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
                            >
                                {/* Goal Header */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                                    {goal.title}
                                                </h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(goal.category)}`}>
                                                    {goal.category}
                                                </span>
                                                {goal.aiGenerated && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-500 flex items-center gap-1">
                                                        <Sparkles size={10} /> AI
                                                    </span>
                                                )}
                                            </div>
                                            {goal.description && (
                                                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                                    {goal.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                                    Duration: {goal.duration}
                                                </span>
                                                <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                                    Progress: {goal.progress}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete(goal._id)}
                                                className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-400"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => setExpandedGoal(expandedGoal === goal._id ? null : goal._id)}
                                                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-dark-border text-dark-muted' : 'hover:bg-light-border text-light-muted'}`}
                                            >
                                                {expandedGoal === goal._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className={`mt-3 h-2 rounded-full ${isDark ? 'bg-dark-border' : 'bg-light-border'}`}>
                                        <motion.div
                                            className="h-full rounded-full bg-primary-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${goal.progress}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                                {/* Phases */}
                                <AnimatePresence>
                                    {expandedGoal === goal._id && goal.phases && goal.phases.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`border-t px-5 pb-5 ${isDark ? 'border-dark-border' : 'border-light-border'}`}
                                        >
                                            <div className="space-y-4 pt-4">
                                                {goal.phases.map((phase, phaseIndex) => (
                                                    <div key={phaseIndex}>
                                                        <h4 className={`text-sm font-500 mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                                            Phase {phaseIndex + 1}: {phase.title}
                                                        </h4>
                                                        <div className="space-y-2 ml-4">
                                                            {phase.milestones && phase.milestones.map((milestone) => (
                                                                <div
                                                                    key={milestone._id}
                                                                    className={`flex items-center gap-3 p-2 rounded-lg ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}
                                                                >
                                                                    <button
                                                                        onClick={() => handleCompleteMilestone(goal._id, milestone._id)}
                                                                        className={`
                                                                            w-5 h-5 rounded-full border-2 flex-shrink-0
                                                                            flex items-center justify-center
                                                                            transition-all duration-150
                                                                            ${milestone.completed
                                                                                ? 'bg-success-400 border-success-400'
                                                                                : 'border-primary-400 hover:bg-primary-50'
                                                                            }
                                                                        `}
                                                                    >
                                                                        {milestone.completed && <Check size={10} color="white" />}
                                                                    </button>
                                                                    <span className={`text-sm flex-1 ${milestone.completed ? 'line-through opacity-50' : isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                                                        {milestone.title}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default GoalsPage;