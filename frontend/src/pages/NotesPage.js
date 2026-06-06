// pages/NotesPage.js
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/common/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, StickyNote, Pin, Trash2, Sparkles, Tag, Search } from 'lucide-react';
import noteService from '../services/noteService';
import aiService from '../services/aiService';

const CATEGORIES = ['study', 'work', 'personal', 'other'];
const COLORS = ['#ffffff', '#EDE9FF', '#E1F5EE', '#E6F1FB', '#FAEEDA', '#FCEBEB'];

const NotesPage = () => {
  const { isDark } = useTheme();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'study',
    subject: '',
    color: '#ffffff',
    tags: ''
  });

  // eslint-disable-next-line
  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    try {
      const res = await noteService.getNotes();
      setNotes(res.data.notes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = form.tags
        ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      await noteService.createNote({
        ...form,
        tags: tagsArray
      });

      setShowForm(false);
      setForm({ title: '', content: '', category: 'study', subject: '', color: '#ffffff', tags: '' });
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtractKeyPoints = async (note) => {
    setExtracting(true);
    try {
      const res = await aiService.extractKeyPoints(note.content, note.title);
      const keyPoints = Array.isArray(res.data.keyPoints) ? res.data.keyPoints : [];
      await noteService.saveKeyPoints(note._id, keyPoints);
      loadNotes();
      if (activeNote?._id === note._id) {
        setActiveNote({ ...note, keyPoints, aiProcessed: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await noteService.togglePin(id);
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await noteService.deleteNote(id);
      if (activeNote?._id === id) setActiveNote(null);
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Notes
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
              {notes.length} notes — AI extracts key points
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus size={16} /> New Note
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-xl p-5 border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
            >
              <h2 className={`text-sm font-500 mb-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                Create New Note
              </h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <input
                  type="text"
                  placeholder="Note title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                  required
                />
                <textarea
                  placeholder="Write your notes here..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input h-32 resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Subject (e.g. DSA, DBMS)"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input"
                  />
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
                <input
                  type="text"
                  placeholder="Tags (comma separated e.g. arrays, sorting)"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="input"
                />
                {/* Color Picker */}
                <div>
                  <p className={`text-xs mb-2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    Note Color
                  </p>
                  <div className="flex gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, color })}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === color ? 'border-primary-400 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color === '#ffffff' ? (isDark ? '#1A1A2E' : '#ffffff') : color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Create Note</button>
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

        {/* Notes Grid + Detail */}
        <div className={`grid ${activeNote ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>

          {/* Notes Grid */}
          <div className={`${activeNote ? 'col-span-1' : 'col-span-3'} space-y-3`}>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}>
                <StickyNote size={40} className={`mx-auto mb-3 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                <p className={isDark ? 'text-dark-muted' : 'text-light-muted'}>
                  {searchQuery ? 'No notes match your search' : 'No notes yet'}
                </p>
              </div>
            ) : (
              <div className={`grid ${activeNote ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setActiveNote(activeNote?._id === note._id ? null : note)}
                    className={`
                      rounded-xl p-4 border cursor-pointer
                      transition-all duration-150 hover:shadow-medium
                      ${activeNote?._id === note._id
                        ? 'border-primary-400'
                        : isDark ? 'border-dark-border' : 'border-light-border'
                      }
                    `}
                    style={{
                      backgroundColor: isDark
                        ? '#1A1A2E'
                        : note.color || '#ffffff'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-sm font-500 flex-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-1 ml-2">
                        {note.isPinned && (
                          <Pin size={12} className="text-primary-400" />
                        )}
                        {note.aiProcessed && (
                          <Sparkles size={12} className="text-warn-400" />
                        )}
                      </div>
                    </div>

                    {note.subject && (
                      <span className={`text-xs px-2 py-0.5 rounded-full mb-2 inline-block ${isDark ? 'bg-dark-border text-dark-muted' : 'bg-light-border text-light-muted'}`}>
                        {note.subject}
                      </span>
                    )}

                    <p className={`text-xs line-clamp-3 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      {note.content || 'No content'}
                    </p>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-primary-50 text-primary-500">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Note Detail */}
          <AnimatePresence>
            {activeNote && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`rounded-xl border p-5 ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-light-border'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className={`font-500 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {activeNote.title}
                  </h2>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleTogglePin(activeNote._id)}
                      className={`p-1.5 rounded-lg ${activeNote.isPinned ? 'text-primary-400' : isDark ? 'text-dark-muted' : 'text-light-muted'} hover:bg-primary-50`}
                    >
                      <Pin size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(activeNote._id)}
                      className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className={`text-sm mb-4 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  {activeNote.content}
                </p>

                {/* Tags */}
                {activeNote.tags && activeNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {activeNote.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-500">
                        <Tag size={10} className="inline mr-1" />{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Key Points */}
                {activeNote.keyPoints && activeNote.keyPoints.length > 0 ? (
                  <div>
                    <p className={`text-xs font-500 mb-2 flex items-center gap-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                      <Sparkles size={12} className="text-warn-400" /> AI Key Points
                    </p>
                    <div className="space-y-1.5">
                      {activeNote.keyPoints.map((point, i) => (
                        <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1 flex-shrink-0" />
                          <span className={isDark ? 'text-dark-muted' : 'text-light-muted'}>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleExtractKeyPoints(activeNote)}
                    disabled={extracting}
                    className="btn-primary w-full justify-center mt-2"
                  >
                    {extracting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Sparkles size={14} /> Extract Key Points</>
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default NotesPage;