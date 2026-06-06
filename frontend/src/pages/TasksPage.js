// pages/TasksPage.js
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/common/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Check, SkipForward, ChevronRight,
    Trash2, Calendar , Clock
} from 'lucide-react';
import taskService from '../services/taskService';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CATEGORIES = ['study', 'work', 'personal', 'health', 'travel', 'other'];

const TasksPage = () => {
    const { isDark } = useTheme();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'medium',
        category: 'study',
        scheduledDate: new Date().toISOString().split('T')[0],
        estimatedDuration: 30,
        goalAligned: false
    });

    const today = new Date().toISOString().split('T')[0];

    // eslint-disable-next-line
    useEffect(() => { loadTasks(); }, [activeFilter]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const status = activeFilter === 'all' ? undefined : activeFilter;
            const res = await taskService.getTasks(
                activeFilter === 'today' ? today : undefined,
                activeFilter !== 'today' && activeFilter !== 'all' ? status : undefined
            );
            setTasks(res.data.tasks);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await taskService.createTask(form);
            setShowForm(false);
            setForm({
                title: '',
                description: '',
                priority: 'medium',
                category: 'study',
                scheduledDate: today,
                estimatedDuration: 30,
                goalAligned: false
            });
            loadTasks();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDone = async (id) => {
        try {
            await taskService.markDone(id);
            loadTasks();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSkip = async (id) => {
        try {
            await taskService.skipTask(id);
            loadTasks();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCarry = async (id) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const newDate = tomorrow.toISOString().split('T')[0];
        try {
            await taskService.carryForward(id, newDate);
            loadTasks();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await taskService.deleteTask(id);
            loadTasks();
        } catch (err) {
            console.error(err);
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-danger-50 text-danger-500';
            case 'high': return 'bg-danger-50 text-danger-400';
            case 'medium': return 'bg-warn-50 text-warn-500';
            default: return 'bg-success-50 text-success-500';
        }
    };

    const filters = ['all', 'today', 'pending', 'completed', 'skipped'];

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                            Tasks
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                            {tasks.length} tasks total
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary"
                    >
                        <Plus size={16} /> New Task
                    </button>
                </div>
                {/* Add Task Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
                        >
                            <h2 className={`text-sm font-500 mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                Create New Task
                            </h2>
                            <form onSubmit={handleCreate} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Task title"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="input"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="input"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={`text-xs mb-1 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                            Priority
                                        </label>
                                        <select
                                            value={form.priority}
                                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                            className="input"
                                        >
                                            {PRIORITIES.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
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
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={`text-xs mb-1 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={form.scheduledDate}
                                            onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-xs mb-1 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                            Duration (mins)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.estimatedDuration}
                                            onChange={(e) => setForm({ ...form, estimatedDuration: parseInt(e.target.value) })}
                                            className="input"
                                            min="5"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="goalAligned"
                                        checked={form.goalAligned}
                                        onChange={(e) => setForm({ ...form, goalAligned: e.target.checked })}
                                        className="accent-primary-400"
                                    />
                                    <label htmlFor="goalAligned" className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                        Aligned with my goal
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="btn-primary">Create Task</button>
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
                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`
                                px-4 py-1.5 rounded-full text-sm capitalize
                                transition-all duration-150
                                ${activeFilter === f
                                    ? 'bg-primary-400 text-white'
                                    : isDark
                                        ? 'bg-dark-card text-dark-muted border border-dark-border'
                                        : 'bg-white text-light-muted border border-light-border'
                                }
                            `}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                {/* Tasks List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                        <Check size={40} className={`mx-auto mb-3 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                        <p className={isDark ? 'text-dark-muted' : 'text-light-muted'}>No tasks found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <motion.div
                                key={task._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`
                                    rounded-xl p-4 border
                                    ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}
                                    ${task.status === 'completed' ? 'opacity-60' : ''}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Complete Button */}
                                    <button
                                        onClick={() => handleDone(task._id)}
                                        className={`
                                            w-6 h-6 rounded-full border-2 flex-shrink-0
                                            flex items-center justify-center
                                            transition-all duration-150
                                            ${task.status === 'completed'
                                                ? 'bg-success-400 border-success-400'
                                                : 'border-primary-400 hover:bg-primary-50'
                                            }
                                        `}
                                    >
                                        {task.status === 'completed' && <Check size={12} color="white" />}
                                    </button>
                                    {/* Task Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`
                                        text-sm font-500
                                        ${task.status === 'completed' ? 'line-through' : ''}
                                        ${isDark ? 'text-dark-text' : 'text-light-text'}
                                        `}>
                                            {task.title}
                                        </p>
                                        {task.description && (
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                                {task.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar size={11} className={isDark ? 'text-dark-muted' : 'text-light-muted'} />
                                            <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                                {task.scheduledDate}
                                            </span>
                                            <Clock size={11} className={isDark ? 'text-dark-muted' : 'text-light-muted'} />
                                            <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                                {task.estimatedDuration}m
                                            </span>
                                        </div>
                                    </div>
                                    {/* Priority Badge */}
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityStyle(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                    {/* Category Badge */}
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-dark-bg text-dark-muted' : 'bg-light-bg text-light-muted'}`}>
                                        {task.category}
                                    </span>
                                    {/* Actions */}
                                    {task.status === 'pending' && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCarry(task._id)}
                                                title="Carry to tomorrow"
                                                className={`p-1.5 rounded-lg hover:bg-info-50 text-info-400`}
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleSkip(task._id)}
                                                title="Skip task"
                                                className={`p-1.5 rounded-lg hover:bg-warn-50 text-warn-400`}
                                            >
                                                <SkipForward size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task._id)}
                                                title="Delete task"
                                                className={`p-1.5 rounded-lg hover:bg-danger-50 text-danger-400`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default TasksPage;                          