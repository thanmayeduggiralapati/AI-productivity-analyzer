// pages/AssistantPage.js
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/common/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User , Trash2 } from 'lucide-react';
import aiService from '../services/aiService';

const AssistantPage = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI study assistant. I can help you with:\n\n- **Study questions** and explanations\n- **Goal planning** and advice\n- **Productivity tips**\n- **Career guidance**\n\nWhat would you like to know?`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        try {
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));
            const userContext = `
                Name: ${user?.name}
                Goal: ${user?.goal || 'Not set'}
                Field: ${user?.studyField || user?.profession || 'Not set'}
            `;
            const res = await aiService.chat(input, history, userContext);
            const assistantMessage = {
                role: 'assistant',
                content: res.data.response
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const handleClear = () => {
        setMessages([{
            role: 'assistant',
            content: `Hi ${user?.name?.split(' ')[0] || 'there'}! How can I help you today?`
        }]);
    };
    const formatMessage = (content) => {
        return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
    };
    const quickPrompts = [
        'Help me make a study plan',
        'How to stay focused?',
        'Tips for campus placements',
        'Explain binary search',
    ];
    return (
    <Layout>
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        AI Assistant
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        Powered by Gemini AI
                    </p>
                </div>
                <button
                    onClick={handleClear}
                    className="btn-secondary flex items-center gap-2"
                >
                    <Trash2 size={14} /> Clear Chat
                </button>
            </div>
            {/* Messages */}
            <div className={`
                flex-1 overflow-y-auto rounded-xl border p-4 space-y-4 mb-4
                ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}
            `}>
                {/* Quick Prompts */}
                {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {quickPrompts.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setInput(prompt);
                                }}
                                className={`
                                    text-xs px-3 py-1.5 rounded-full border
                                    ${isDark
                                        ? 'border-dark-border text-dark-muted hover:border-primary-400 hover:text-primary-400'
                                        : 'border-light-border text-light-muted hover:border-primary-400 hover:text-primary-400'
                                    }
                                `}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}
                <AnimatePresence>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`
                                w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                                ${message.role === 'assistant'
                                    ? 'bg-primary-400'
                                    : isDark ? 'bg-dark-border' : 'bg-light-border'
                                }
                            `}>
                                {message.role === 'assistant'
                                    ? <Bot size={16} color="white" />
                                    : <User size={16} className={isDark ? 'text-dark-muted' : 'text-light-muted'} />
                                }
                            </div>
                            {/* Message Bubble */}
                            <div className={`
                                max-w-lg px-4 py-3 rounded-2xl text-sm
                                ${message.role === 'assistant'
                                    ? isDark
                                    ? 'bg-dark-border text-dark-text rounded-tl-none'
                                    : 'bg-light-bg text-light-text rounded-tl-none'
                                    : 'bg-primary-400 text-white rounded-tr-none'
                                }
                            `}>
                                <div
                                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                                />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {/* Loading */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center flex-shrink-0">
                                <Bot size={16} color="white" />
                            </div>
                            <div className={`px-4 py-3 rounded-2xl rounded-tl-none ${isDark ? 'bg-dark-border' : 'bg-light-bg'}`}>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 rounded-full bg-primary-400"
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                    </div>
                    {/* Input */}
                    <div className={`
                        flex gap-3 p-3 rounded-xl border
                        ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}
                    `}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything... (Enter to send)"
                            rows={1}
                            className={`
                                flex-1 resize-none outline-none text-sm bg-transparent
                                ${isDark ? 'text-dark-text placeholder-dark-muted' : 'text-light-text placeholder-light-muted'}
                            `}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className={`
                                w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                                ${input.trim() && !loading
                                    ? 'bg-primary-400 text-white'
                                    : isDark ? 'bg-dark-border text-dark-muted' : 'bg-light-border text-light-muted'
                                }
                            `}
                        >
                            {loading
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Send size={15} />
                            }
                        </button>
                    </div>
                </div>
            </Layout>
        );
};

export default AssistantPage;