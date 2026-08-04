const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

require('dotenv').config();

const authRoutes         = require('./src/routes/auth');
const clearanceRoutes    = require('./src/routes/clearance');
const documentRoutes     = require('./src/routes/documents');
const notificationRoutes = require('./src/routes/notifications');
const certificateRoutes  = require('./src/routes/certificates');
const adminRoutes        = require('./src/routes/admin');
const errorHandler       = require('./src/middleware/errorHandler');
const connectDB          = require('./src/config/db');

const app = express();

/* ── Database ── */
connectDB();

/* ── Security middleware ── */
app.use(helmet());
console.log("CLIENT_URL =", process.env.CLIENT_URL);
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

/* ── Rate limiting ── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      15,
  message:  { message: 'Too many login attempts. Please try again later.' },
});

/* ── General middleware ── */
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ── Simple NoSQL injection guard (custom, no dependency issues) ── */
const sanitizeInput = (req, res, next) => {
  const clean = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          clean(obj[key]);
        }
      }
    }
  };
  clean(req.body);
  clean(req.params);
  next();
};

app.use(sanitizeInput);

/* ── Static files ── */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ── Routes ── */
app.use('/api/v1/auth',          authLimiter, authRoutes);
app.use('/api/v1/clearance',     clearanceRoutes);
app.use('/api/v1/documents',     documentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/certificates',  certificateRoutes);
app.use('/api/v1/admin',         adminRoutes);

/* ── Health check ── */
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'SOCS API is running', timestamp: new Date() });
});

/* ── 404 handler ── */
app.use("/*splat", (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* ── Error handler ── */
app.use(errorHandler);

/* ── Start server ── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 SOCS Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Client URL:  ${process.env.CLIENT_URL}\n`);
});

module.exports = app;