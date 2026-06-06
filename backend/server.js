const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const {errorHandler} = require('./middleware/error.middleware');


dotenv.config();

connectDB();

const app = express();

// ─── Security & Utility Middleware ────────────
app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://enchanting-gnome-be450b.netlify.app',
        process.env.CLIENT_URL
    ],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/journal', require('./routes/journal.routes'));
app.use('/api/goals', require('./routes/goal.routes'));
app.use('/api/insights', require('./routes/insights.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/notes', require('./routes/note.routes'));
app.use('/api/focus', require('./routes/focus.routes'));
app.use('/api/travel', require('./routes/travel.routes'));
app.use('/api/mocktests', require('./routes/mocktests.routes'));

// ─── Health Check ─────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AI Productivity Backend Running',
        timestamp: new Date().toISOString()
    });
});

// ─── Global Error Handler ─────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});