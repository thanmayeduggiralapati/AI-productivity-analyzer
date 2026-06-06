// pages/TravelPage.js
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/common/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Car, Navigation, Plus, Sparkles, Trash2 } from 'lucide-react';
import taskService from '../services/taskService';

const TRAVEL_MODES = ['driving', 'walking', 'cycling', 'transit'];

const TravelPage = () => {
  const { isDark } = useTheme();

  const [travelTasks, setTravelTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [departureResult, setDepartureResult] = useState(null);
  const [form, setForm] = useState({
    title: '',
    location: '',
    arrivalTime: '',
    travelMode: 'driving'
  });

  const today = new Date().toISOString().split('T')[0];

  // eslint-disable-next-line
  useEffect(() => { loadTravelTasks(); }, []);

  const loadTravelTasks = async () => {
    try {
      const res = await taskService.getTasks(today, undefined, 'travel');
      setTravelTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateDeparture = async (e) => {
    e.preventDefault();
    setCalculating(true);
    setDepartureResult(null);
    try {
      const res = await fetch('http://localhost:5000/api/travel/departure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          destination: form.location,
          arrivalTime: form.arrivalTime,
          travelMode: form.travelMode
        })
      });
      const data = await res.json();
      setDepartureResult(data.data);

      // Create the task
      await taskService.createTask({
        title: form.title || `Travel to ${form.location}`,
        category: 'travel',
        scheduledDate: today,
        location: form.location,
        travelMode: form.travelMode,
        departureTime: data.data?.departureTime || form.arrivalTime,
        priority: 'medium'
      });

      loadTravelTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleExtractFromJournal = async () => {
    if (!journalText.trim()) return;
    setExtracting(true);
    try {
      const res = await fetch('http://localhost:5000/api/travel/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          journalText,
          date: today
        })
      });
      await res.json();
      setJournalText('');
      loadTravelTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await taskService.deleteTask(id);
      loadTravelTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'driving': return '🚗';
      case 'walking': return '🚶';
      case 'cycling': return '🚲';
      case 'transit': return '🚌';
      default: return '🚗';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Travel
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
              Smart departure time calculator
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus size={16} /> Add Travel
          </button>
        </div>

        {/* Add Travel Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
            >
              <h2 className={`text-sm font-500 mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                Calculate Departure Time
              </h2>
              <form onSubmit={handleCalculateDeparture} className="space-y-3">
                <input
                  type="text"
                  placeholder="Title (e.g. Go to college)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Destination (e.g. College, Library)"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs mb-1 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      Need to arrive by
                    </label>
                    <input
                      type="time"
                      value={form.arrivalTime}
                      onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className={`text-xs mb-1 block ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      Travel Mode
                    </label>
                    <select
                      value={form.travelMode}
                      onChange={(e) => setForm({ ...form, travelMode: e.target.value })}
                      className="input"
                    >
                      {TRAVEL_MODES.map(m => (
                        <option key={m} value={m}>
                          {getModeIcon(m)} {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={calculating}
                    className="btn-primary"
                  >
                    {calculating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <><Navigation size={14} /> Calculate Departure</>
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

              {/* Departure Result */}
              {departureResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-dark-bg border-dark-border' : 'bg-light-bg border-light-border'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={16} className="text-primary-400" />
                    <span className={`text-sm font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                      Leave by: {departureResult.departureTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <Car size={16} className="text-info-400" />
                    <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      Travel time: ~{departureResult.estimatedDuration} minutes
                    </span>
                  </div>
                  {departureResult.tips && (
                    <p className={`text-xs mt-2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      💡 {departureResult.tips}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Extract from Journal */}
        <div className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
          <h2 className={`text-sm font-500 mb-3 flex items-center gap-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            <Sparkles size={14} className="text-primary-400" /> Extract Travel from Journal
          </h2>
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Paste your journal text here and AI will extract travel tasks..."
            className={`w-full h-24 p-3 rounded-lg text-sm resize-none outline-none border mb-3 ${isDark ? 'bg-dark-bg border-dark-border text-dark-text placeholder-dark-muted focus:border-primary-400' : 'bg-light-bg border-light-border text-light-text placeholder-light-muted focus:border-primary-400'}`}
          />
          <button
            onClick={handleExtractFromJournal}
            disabled={extracting || !journalText.trim()}
            className="btn-primary"
          >
            {extracting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Sparkles size={14} /> Extract Travel Tasks</>
            )}
          </button>
        </div>

        {/* Today's Travel Tasks */}
        <div>
          <h2 className={`text-sm font-500 mb-3 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Today's Travel Tasks
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : travelTasks.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
              <MapPin size={40} className={`mx-auto mb-3 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
              <p className={isDark ? 'text-dark-muted' : 'text-light-muted'}>
                No travel tasks for today
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {travelTasks.map((task) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl p-4 border flex items-center gap-4 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
                >
                  <div className="text-2xl">
                    {getModeIcon(task.travelMode)}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-500 text-sm ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      {task.location && (
                        <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                          <MapPin size={10} /> {task.location}
                        </span>
                      )}
                      {task.departureTime && (
                        <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                          <Clock size={10} /> Leave by {task.departureTime}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TravelPage;