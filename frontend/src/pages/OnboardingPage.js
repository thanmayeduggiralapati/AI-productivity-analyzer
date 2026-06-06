import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import authService from '../services/authService';

const OnboardingPage = () => {
    const { updateUser } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({
        isStudent: true,
        studyField: '',
        profession: '',
        hasGoal: false,
        goal: '',
        goalDuration: '',
        sleepTime: '22:00',
        wakeTime: '06:00'
    });

    const steps = [
        {
            id: 0,
            title: 'Are you a student?',
            subtitle: 'This helps us personalize your experience',
            type: 'choice',
            field: 'isStudent',
            options: [
                { label: 'Yes, I am a student', value: true },
                { label: 'No, I am a professional', value: false }
            ]
        },
        {
            id: 1,
            title: answers.isStudent ? 'What are you studying?' : 'What is your profession?',
            subtitle: 'Tell us about your field',
            type: 'text',
            field: answers.isStudent ? 'studyField' : 'profession',
            placeholder: answers.isStudent ? 'e.g. B.Tech Computer Science, UPSC preparation...' : 'e.g. Software Engineer, Doctor, Designer...'
        },
        {
            id: 2,
            title: 'Do you have a long term goal?',
            subtitle: 'We will build a roadmap to help you achieve it',
            type: 'choice',
            field: 'hasGoal',
            options: [
                { label: 'Yes, I have a clear goal', value: true },
                { label: 'Not yet, just exploring', value: false }
            ]
        },
        ...(answers.hasGoal ? [
            {
                id: 3,
                title: 'What is your goal?',
                subtitle: 'Be specific — the more detail the better',
                type: 'text',
                field: 'goal',
                placeholder: 'e.g. Get placed in a top tech company, Crack UPSC...'
            },
            {
                id: 4,
                title: 'How much time do you have?',
                subtitle: 'To achieve your goal',
                type: 'text',
                field: 'goalDuration',
                placeholder: 'e.g. 6 months, 1 year, 2 years...'
            }
        ] : []),
        {
            id: 5,
            title: 'What time do you sleep?',
            subtitle: 'We will send smart reminders based on your schedule',
            type: 'time',
            fields: ['sleepTime', 'wakeTime'],
            labels: ['Sleep Time', 'Wake Up Time']
        }
    ];
    const currentStep = steps[step];
    const totalSteps = steps.length;
    const handleChoice = (field, value) => {
        setAnswers({ ...answers, [field]: value });
        setTimeout(() => setStep(step + 1), 300);
    };
    const handleNext = () => {
        if (step < totalSteps - 1) setStep(step + 1);
    };
    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await authService.completeOnboarding(answers);
            updateUser(res.data.user);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
            <div className="w-full max-w-lg">

                {/* Logo */}
                <div className="flex items-center gap-2 justify-center mb-8">
                    <div className="w-8 h-8 rounded-lg bg-primary-400 flex items-center justify-center">
                        <Sparkles size={16} color="white" />
                    </div>
                    <span className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        Productivity Analyzer
                    </span>
                </div>
                {/* Progress Bar */}
                <div className={`w-full h-1.5 rounded-full mb-8 ${isDark ? 'bg-dark-border' : 'bg-light-border'}`}>
                    <motion.div
                        className="h-full rounded-full bg-primary-400"
                        animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Step Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className={`
                            rounded-2xl p-8 border
                            ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}
                        `}
                    >
                        {/* Step Title */}
                        <h2 className={`text-xl font-500 mb-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                            {currentStep.title}
                        </h2>
                        <p className={`text-sm mb-6 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                            {currentStep.subtitle}
                        </p>

                        {/* Choice Type */}
                        {currentStep.type === 'choice' && (
                            <div className="space-y-3">
                                {currentStep.options.map((option) => (
                                    <button
                                        key={option.label}
                                        onClick={() => handleChoice(currentStep.field, option.value)}
                                        className={`
                                            w-full flex items-center gap-3 p-4 rounded-xl border text-left
                                            transition-all duration-150
                                            ${answers[currentStep.field] === option.value
                                                ? 'border-primary-400 bg-primary-50'
                                                : isDark
                                                    ? 'border-dark-border bg-dark-bg hover:border-primary-400'
                                                    : 'border-light-border bg-light-bg hover:border-primary-400'
                                            }
                                        `}
                                    >
                                        <span className="text-2xl">{option.emoji}</span>
                                        <span className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                                            {option.label}
                                        </span>
                                        {answers[currentStep.field] === option.value && (
                                            <Check size={16} className="ml-auto text-primary-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                        {/* Text Type */}

                        {currentStep.type === 'text' && (
                            <div>
                                <input
                                type="text"
                                value={answers[currentStep.field]}
                                onChange={(e) => setAnswers({ ...answers, [currentStep.field]: e.target.value })}
                                placeholder={currentStep.placeholder}
                                className="input"
                                />
                                <button
                                onClick={handleNext}
                                className="btn-primary w-full justify-center py-3 mt-4"
                                >
                                    Continue <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* Time Type */}
                        {currentStep.type === 'time' && (
                            <div className="space-y-4">
                                {currentStep.fields.map((field, i) => (
                                    <div key={field}>
                                        <label className={`text-xs font-500 mb-1.5 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                                            {currentStep.labels[i]}
                                        </label>
                                        <input
                                        type="time"
                                        value={answers[field]}
                                        onChange={(e) => setAnswers({ ...answers, [field]: e.target.value })}
                                        className="input"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="btn-primary w-full justify-center py-3 mt-2"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>Let's get started <Sparkles size={16} /></>
                                    )}
                                </button>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
                {/* Back Button */}
                {step > 0 && currentStep.type !== 'choice' && (
                    <button
                        onClick={handleBack}
                        className={`
                            flex items-center gap-1 mx-auto mt-4 text-sm
                            ${isDark ? 'text-dark-muted' : 'text-light-muted'}
                        `}
                    >
                        <ChevronLeft size={16} /> Back
                    </button>
                )}
                {/* Step Counter */}
                <p className={`text-center text-xs mt-4 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    Step {step + 1} of {totalSteps}
                </p>
            </div>
        </div>
    );
}

export default OnboardingPage;