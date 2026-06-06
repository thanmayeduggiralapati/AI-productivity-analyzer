// pages/MockTestPage.js
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/common/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Brain, Check, X, ChevronRight, Trash2, Trophy } from 'lucide-react';
import aiService from '../services/aiService';
import mockTestService from '../services/mockTestService';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const MockTestPage = () => {
  const { isDark } = useTheme();

  const [tests, setTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('tests');
  const [form, setForm] = useState({
    topic: '',
    difficulty: 'medium',
    numberOfQuestions: 5
  });

  // eslint-disable-next-line
  useEffect(() => { loadTests(); }, []);

  const loadTests = async () => {
    try {
      const res = await mockTestService.getMockTests();
      setTests(res.data.mockTests);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      // Generate questions with AI
      const aiRes = await aiService.generateMockTest(
        form.topic,
        form.difficulty,
        form.numberOfQuestions,
        'topic'
      );

      // Save to database
      const saveRes = await mockTestService.createMockTest({
        title: `${form.topic} Test`,
        topic: form.topic,
        questions: aiRes.data.questions,
        difficulty: form.difficulty,
        source: 'topic'
      });

      setShowForm(false);
      setForm({ topic: '', difficulty: 'medium', numberOfQuestions: 5 });
      loadTests();

      // Auto open the new test
      setActiveTest(saveRes.data.mockTest);
      setAnswers(new Array(saveRes.data.mockTest.questions.length).fill(''));
      setCurrentQuestion(0);
      setSubmitted(false);
      setActiveTab('take');
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleStartTest = (test) => {
    setActiveTest(test);
    setAnswers(new Array(test.questions.length).fill(''));
    setCurrentQuestion(0);
    setSubmitted(false);
    setResult(null);
    setActiveTab('take');
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < activeTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await mockTestService.submitMockTest(
        activeTest._id,
        answers,
        0
      );
      setResult(res.data.mockTest);
      setSubmitted(true);
      loadTests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await mockTestService.deleteMockTest(id);
      loadTests();
    } catch (err) {
      console.error(err);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-success-400';
    if (percentage >= 60) return 'text-warn-400';
    return 'text-danger-400';
  };

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Mock Tests
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
              AI generated tests to test your knowledge
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus size={16} /> Generate Test
          </button>
        </div>

        {/* Generate Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
            >
              <h2 className={`text-sm font-500 mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                Generate New Test
              </h2>
              <form onSubmit={handleGenerate} className="space-y-3">
                <input
                  type="text"
                  placeholder="Topic (e.g. Binary Search, SQL Joins...)"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="input"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs mb-1 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      Difficulty
                    </label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="input"
                    >
                      {DIFFICULTIES.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs mb-1 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      Questions
                    </label>
                    <select
                      value={form.numberOfQuestions}
                      onChange={(e) => setForm({ ...form, numberOfQuestions: parseInt(e.target.value) })}
                      className="input"
                    >
                      {[5, 10, 15].map(n => (
                        <option key={n} value={n}>{n} questions</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={generating}
                    className="btn-primary"
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <><Brain size={14} /> Generate with AI</>
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

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-dark-card' : 'bg-light-border'}`}>
          {['tests', 'take'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-lg text-sm font-500 capitalize
                ${activeTab === tab
                  ? 'bg-primary-400 text-white'
                  : isDark ? 'text-dark-muted' : 'text-light-muted'
                }
              `}
            >
              {tab === 'take' ? 'Take Test' : 'My Tests'}
            </button>
          ))}
        </div>

        {activeTab === 'tests' ? (
          /* Tests List */
          <div className="space-y-3">
            {tests.length === 0 ? (
              <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                <Brain size={40} className={`mx-auto mb-3 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                <p className={isDark ? 'text-dark-muted' : 'text-light-muted'}>
                  No tests yet. Generate your first test!
                </p>
              </div>
            ) : (
              tests.map((test) => (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`rounded-xl p-4 border flex items-center gap-4 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
                >
                  <div className="flex-1">
                    <h3 className={`font-500 text-sm ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                      {test.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        {test.totalQuestions} questions
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full
                        ${test.difficulty === 'hard' ? 'bg-danger-50 text-danger-500' :
                          test.difficulty === 'medium' ? 'bg-warn-50 text-warn-500' :
                          'bg-success-50 text-success-500'}`}>
                        {test.difficulty}
                      </span>
                      {test.status === 'completed' && (
                        <span className={`text-xs font-500 ${getScoreColor(test.percentage)}`}>
                          Score: {test.percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.status !== 'completed' && (
                      <button
                        onClick={() => handleStartTest(test)}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        Start <ChevronRight size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(test._id)}
                      className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          /* Take Test */
          <div>
            {!activeTest ? (
              <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                <Brain size={40} className={`mx-auto mb-3 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                <p className={isDark ? 'text-dark-muted' : 'text-light-muted'}>
                  Select a test to start
                </p>
              </div>
            ) : submitted && result ? (
              /* Results */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl p-8 border text-center ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
              >
                <Trophy size={48} className={`mx-auto mb-4 ${getScoreColor(result.percentage)}`} />
                <h2 className={`text-2xl font-bold mb-2 ${getScoreColor(result.percentage)}`}>
                  {result.percentage}%
                </h2>
                <p className={`text-sm mb-6 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  {result.correctAnswers} out of {result.totalQuestions} correct
                </p>

                {/* Question Review */}
                <div className="text-left space-y-3 mb-6">
                  {result.questions.map((q, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${q.isCorrect
                        ? isDark ? 'border-success-400 bg-success-50' : 'border-success-400 bg-success-50'
                        : isDark ? 'border-danger-400 bg-danger-50' : 'border-danger-400 bg-danger-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {q.isCorrect
                          ? <Check size={14} className="text-success-400 mt-0.5 flex-shrink-0" />
                          : <X size={14} className="text-danger-400 mt-0.5 flex-shrink-0" />
                        }
                        <div>
                          <p className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                            {q.question}
                          </p>
                          {!q.isCorrect && (
                            <p className="text-xs text-success-500 mt-1">
                              Correct: {q.correctAnswer}
                            </p>
                          )}
                          {q.explanation && (
                            <p className={`text-xs mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setActiveTest(null);
                    setActiveTab('tests');
                  }}
                  className="btn-primary"
                >
                  Back to Tests
                </button>
              </motion.div>
            ) : (
              /* Question */
              <div className={`rounded-xl p-6 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>

                {/* Progress */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    Question {currentQuestion + 1} of {activeTest.questions.length}
                  </span>
                  <span className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {answers.filter(a => a !== '').length} answered
                  </span>
                </div>

                {/* Progress Bar */}
                <div className={`h-1.5 rounded-full mb-6 ${isDark ? 'bg-dark-border' : 'bg-light-border'}`}>
                  <div
                    className="h-full rounded-full bg-primary-400 transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / activeTest.questions.length) * 100}%` }}
                  />
                </div>

                {/* Question */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className={`text-base font-500 mb-5 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                      {activeTest.questions[currentQuestion].question}
                    </p>

                    <div className="space-y-3">
                      {activeTest.questions[currentQuestion].options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(option)}
                          className={`
                            w-full text-left p-3 rounded-xl border text-sm
                            transition-all duration-150
                            ${answers[currentQuestion] === option
                              ? 'border-primary-400 bg-primary-50 text-primary-500'
                              : isDark
                                ? 'border-dark-border text-dark-text hover:border-primary-400'
                                : 'border-light-border text-light-text hover:border-primary-400'
                            }
                          `}
                        >
                          <span className="font-500 mr-2">
                            {['A', 'B', 'C', 'D'][i]}.
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePrev}
                    disabled={currentQuestion === 0}
                    className="btn-secondary"
                  >
                    Previous
                  </button>

                  {currentQuestion === activeTest.questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={answers.filter(a => a !== '').length === 0}
                      className="btn-primary"
                    >
                      Submit Test
                    </button>
                  ) : (
                    <button onClick={handleNext} className="btn-primary">
                      Next <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MockTestPage;