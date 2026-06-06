// pages/FocusPage.js
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/common/Layout';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Clock, Music, MessageCircle, Sparkles } from 'lucide-react';
import focusService from '../services/focusService';
import aiService from '../services/aiService';

const DURATIONS = [15, 25, 45, 60];
const MUSIC_OPTIONS = ['none', 'lofi', 'rain', 'nature', 'piano'];

const MUSIC_URLS = {
  lofi: '/music/lofi.mp3',
  rain: '/music/rain.mp3',
  nature: '/music/nature.mp3',
  piano: '/music/piano.mp3',
  none: null
};

const FocusPage = () => {
  const { isDark } = useTheme();

  const [session, setSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [selectedMusic, setSelectedMusic] = useState('none');
  const [subject, setSubject] = useState('');
  const [doubt, setDoubt] = useState('');
  const [doubts, setDoubts] = useState([]);
  const [solvingDoubt, setSolvingDoubt] = useState(false);
  const [activeTab, setActiveTab] = useState('timer');
  const [sessionNotes, setSessionNotes] = useState('');

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // eslint-disable-next-line
  useEffect(() => { loadActiveSession(); }, []);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, [isRunning]);

  const loadActiveSession = async () => {
    try {
      const res = await focusService.getActiveSession();
      if (res.data.session) {
        const s = res.data.session;
        setSession(s);
        setTimeRemaining(s.timerState?.timeRemaining || 0);
        setIsRunning(s.timerState?.isRunning || false);
        setDoubts(s.doubts || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMusicChange = (music) => {
    setSelectedMusic(music);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (music !== 'none' && MUSIC_URLS[music]) {
      audioRef.current = new Audio(MUSIC_URLS[music]);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      if (session) {
        audioRef.current.play();
      }
    }
  };

  const handleStart = async () => {
    try {
      const res = await focusService.startSession(
        selectedDuration,
        subject,
        selectedMusic
      );
      setSession(res.data.session);
      setTimeRemaining(selectedDuration * 60);
      setIsRunning(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    if (session) {
      focusService.updateTimer(session._id, timeRemaining, false);
    }
  };

  const handleResume = () => {
    setIsRunning(true);
    if (session) {
      focusService.updateTimer(session._id, timeRemaining, true);
    }
  };

  const handleStop = async () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    if (session) {
      // Calculate actual duration in minutes
      const actualDuration = Math.round(
        (selectedDuration * 60 - timeRemaining) / 60
      );
      await focusService.completeSession(
        session._id,
        actualDuration,
        sessionNotes,
        0
      );
    }
    setSession(null);
    setTimeRemaining(0);
    setDoubts([]);
  };

  const handleSessionComplete = async () => {
    if (session) {
      const actualDuration = selectedDuration - Math.floor(timeRemaining / 60);
      await focusService.completeSession(session._id, actualDuration, sessionNotes, 0);
      setSession(null);
    }
  };

  const handleSolveDoubt = async () => {
    if (!doubt.trim()) return;
    setSolvingDoubt(true);
    try {
      const res = await aiService.solveDoubt(doubt, subject);
      const answer = res.data.answer;

      if (session) {
        await focusService.addDoubt(session._id, doubt, answer);
      }

      setDoubts(prev => [...prev, { question: doubt, answer }]);
      setDoubt('');
    } catch (err) {
      console.error(err);
    } finally {
      setSolvingDoubt(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = session
    ? ((selectedDuration * 60 - timeRemaining) / (selectedDuration * 60)) * 100
    : 0;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Focus Mode
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
            Deep work with Pomodoro timer and AI doubt solver
          </p>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-dark-card' : 'bg-light-border'}`}>
          {['timer', 'doubts'].map(tab => (
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
              {tab}
              {tab === 'doubts' && doubts.length > 0 && (
                <span className="ml-1 bg-primary-400 text-white text-xs rounded-full px-1.5">
                  {doubts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'timer' ? (
          <div className="grid grid-cols-3 gap-6">

            {/* Timer */}
            <div className="col-span-2">
              <div className={`rounded-xl p-8 border text-center ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>

                {/* Timer Circle */}
                <div className="relative w-48 h-48 mx-auto mb-8">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke={isDark ? '#2A2A3E' : '#EDE9FF'}
                      strokeWidth="6"
                    />
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="#7F77DD"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                      {formatTime(timeRemaining || selectedDuration * 60)}
                    </span>
                    <span className={`text-xs mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      {isRunning ? 'focusing...' : session ? 'paused' : 'ready'}
                    </span>
                  </div>
                </div>

                {/* Music Player */}
                {session && selectedMusic !== 'none' && MUSIC_URLS[selectedMusic] && (
                  <div className="mt-4">
                    <iframe
                      width="0"
                      height="0"
                      src={MUSIC_URLS[selectedMusic]}
                      title="music"
                      allow="autoplay"
                      style={{ display: 'none' }}
                    />
                    <p className={`text-xs text-center ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      Playing {selectedMusic}
                    </p>
                  </div>
                )}

                {/* Duration Selection */}
                {!session && (
                  <div className="flex justify-center gap-2 mb-6">
                    {DURATIONS.map(d => (
                      <button
                        key={d}
                        onClick={() => setSelectedDuration(d)}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm
                          ${selectedDuration === d
                            ? 'bg-primary-400 text-white'
                            : isDark
                              ? 'bg-dark-border text-dark-muted'
                              : 'bg-light-border text-light-muted'
                          }
                        `}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-center gap-3">
                  {!session ? (
                    <button onClick={handleStart} className="btn-primary px-8 py-3">
                      <Play size={16} /> Start Focus
                    </button>
                  ) : (
                    <>
                      {isRunning ? (
                        <button onClick={handlePause} className="btn-secondary px-6 py-3">
                          <Pause size={16} /> Pause
                        </button>
                      ) : (
                        <button onClick={handleResume} className="btn-primary px-6 py-3">
                          <Play size={16} /> Resume
                        </button>
                      )}
                      <button onClick={handleStop} className="px-6 py-3 rounded-lg bg-danger-50 text-danger-500 flex items-center gap-2">
                        <Square size={16} /> Stop
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">

              {/* Subject */}
              <div className={`rounded-xl p-4 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                <p className={`text-sm font-500 mb-2 flex items-center gap-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  <Clock size={14} /> Subject
                </p>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What are you studying?"
                  className="input text-sm"
                  disabled={!!session}
                />
              </div>

              {/* Music */}
              <div className={`rounded-xl p-4 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                <p className={`text-sm font-500 mb-2 flex items-center gap-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  <Music size={14} /> Background Music
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {MUSIC_OPTIONS.map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMusic(m)}
                      disabled={!!session}
                      className={`
                        px-2 py-1.5 rounded-lg text-xs capitalize
                        ${selectedMusic === m
                          ? 'bg-primary-400 text-white'
                          : isDark
                            ? 'bg-dark-border text-dark-muted'
                            : 'bg-light-border text-light-muted'
                        }
                      `}
                    >
                      {m === 'none' ? ' None' :
                      m === 'lofi' ? 'Lo-fi' :
                      m === 'rain' ? ' Rain' :
                      m === 'nature' ? ' Nature' : 'Piano'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Notes */}
              {session && (
                <div className={`rounded-xl p-4 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                  <p className={`text-sm font-500 mb-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    Session Notes
                  </p>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Notes for this session..."
                    className={`w-full h-20 p-2 rounded-lg text-xs resize-none outline-none border ${isDark ? 'bg-dark-bg border-dark-border text-dark-text' : 'bg-light-bg border-light-border text-light-text'}`}
                  />
                </div>
              )}

            </div>
          </div>
        ) : (
          /* Doubts Tab */
          <div className="space-y-4">
            {/* Ask Doubt */}
            <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
              <p className={`text-sm font-500 mb-3 flex items-center gap-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                <Sparkles size={14} className="text-primary-400" /> Ask AI a Doubt
              </p>
              <textarea
                value={doubt}
                onChange={(e) => setDoubt(e.target.value)}
                placeholder="Ask any doubt related to your study..."
                className={`w-full h-24 p-3 rounded-lg text-sm resize-none outline-none border mb-3 ${isDark ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-muted focus:border-primary-400' : 'bg-light-bg border-light-border text-light-text placeholder-light-muted focus:border-primary-400'}`}
              />
              <button
                onClick={handleSolveDoubt}
                disabled={solvingDoubt || !doubt.trim()}
                className="btn-primary"
              >
                {solvingDoubt ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><MessageCircle size={14} /> Solve Doubt</>
                )}
              </button>
            </div>

            {/* Doubts List */}
            {doubts.length === 0 ? (
              <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                <MessageCircle size={32} className={`mx-auto mb-2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  No doubts asked yet
                </p>
              </div>
            ) : (
              doubts.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
              >
                <p className="text-sm font-500 mb-3 text-primary-400">
                  Q: {d.question}
                </p>
                <div
                  className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}
                  dangerouslySetInnerHTML={{
                    __html: d.answer
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br/>')
                  }}
                />
              </motion.div>
            ))
          )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FocusPage;