// pages/RegisterPage.js
// Register page

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const { register } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

    // Check passwords match
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

    // Check password length
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }
        
        try {
            await register(form.name, form.email, form.password);
            navigate('/onboarding');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
        {/* Theme Toggle */}
        <button
        onClick={toggleTheme}
        className={`
            fixed top-4 right-4 p-2 rounded-lg
            ${isDark ? 'bg-dark-card text-dark-muted' : 'bg-white text-light-muted'}
            border ${isDark ? 'border-dark-border' : 'border-light-border'}
        `}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`
                w-full max-w-md rounded-2xl p-8
                ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}
                border shadow-soft
            `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary-400 flex items-center justify-center">
                        <Sparkles size={20} color="white" />
                    </div>
                <div>
                    <h1 className={`text-lg font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        Productivity Analyzer
                    </h1>
                    <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        Your AI study companion
                    </p>
                </div>
            </div>
            {/* Title */}
            <h2 className={`text-2xl font-500 mb-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                Create account
            </h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                Start your productivity journey today
            </p>
            {/* Error */}
            {error && (
                <div className="bg-danger-50 text-danger-500 text-sm px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className={`text-xs font-500 mb-1.5 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        Full Name
                    </label>
                    <div className="relative">
                        <User size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                        <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="input pl-9"
                        required
                        />
                    </div>
                </div>
                {/* Email */}
                <div>
                    <label className={`text-xs font-500 mb-1.5 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        Email
                    </label>
                    <div className="relative">
                        <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                        <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="input pl-9"
                        required
                        />
                    </div>
                </div>
                {/* Password */}
                <div>
                    <label className={`text-xs font-500 mb-1.5 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        Password
                    </label>
                    <div className="relative">
                        <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                        <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min 6 characters"
                        className="input pl-9 pr-10"
                        required
                        />
                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                {/* Confirm Password */}
                <div>
                    <label className={`text-xs font-500 mb-1.5 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        Confirm Password
                    </label>
                    <div className="relative">
                        <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                        <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat your password"
                        className="input pl-9"
                        required
                        />
                    </div>
                </div>
                {/* Submit */}
                <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : 'Create Account'}
                </button>
                </form>
                {/* Login Link */}
                <p className={`text-center text-sm mt-6 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    Already have an account?{' '}
                    <Link to="/" className="text-primary-400 hover:text-primary-500 font-500">
                    Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;