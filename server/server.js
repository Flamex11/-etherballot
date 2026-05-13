require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const electionRoutes = require('./routes/election');
const votingRoutes = require('./routes/voting');

// Import Admin model for seeding
const Admin = require('./models/Admin');

const app = express();

// ═══════════════════════════════════════════
//  SECURITY: Disable fingerprinting
// ═══════════════════════════════════════════
app.disable('x-powered-by');

// ═══════════════════════════════════════════
//  MIDDLEWARE
// ═══════════════════════════════════════════

// Security Headers (hardened)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      frameSrc: ["'self'", "https://maps.google.com"],
    }
  },
  hsts: {
    maxAge: 31536000,     // 1 year
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  noSniff: true,
  xssFilter: true,
}));

// CORS (strict origin list)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser with strict size limits
app.use(express.json({ limit: '5mb' }));  // Reduced from 10mb
app.use(express.urlencoded({ extended: false }));  // extended: false is safer

// ═══════════════════════════════════════════
//  SECURITY: Input sanitization middleware
//  Prevents NoSQL injection via $ operators
// ═══════════════════════════════════════════
const sanitizeInput = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeInput);
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      // Block keys starting with $ (MongoDB operators)
      if (key.startsWith('$')) continue;
      sanitized[key] = sanitizeInput(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  next();
});

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ═══════════════════════════════════════════
//  RATE LIMITING (hardened)
// ═══════════════════════════════════════════

// General API rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,    // Return rate limit info in headers
  legacyHeaders: false,     // Disable X-RateLimit headers
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,                  // Reduced from 20
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts.' }
});
app.use('/api/auth/', authLimiter);

// Even stricter for admin login
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many admin login attempts. Try again later.' }
});
app.use('/api/admin/login', adminAuthLimiter);

// Strict limit on voting endpoint to prevent abuse
const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Voting rate limit exceeded.' }
});
app.use('/api/voting/cast', voteLimiter);

// ═══════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/voting', votingRoutes);

// Health check (no sensitive info exposed)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'EtherBallot API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler — don't echo the requested URL back (prevents reflected XSS)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler — never leak stack traces or internal error messages to client
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// ═══════════════════════════════════════════
//  SEED SUPER ADMIN
// ═══════════════════════════════════════════

const seedSuperAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ role: 'super_admin' });
    if (!existingAdmin) {
      await Admin.create({
        username: 'superadmin',
        password: 'Admin@123456',
        name: 'Super Administrator',
        email: 'admin@etherballot.com',
        role: 'super_admin'
      });
      console.log('🔐 Super Admin seeded (change default password immediately!)');
    }
  } catch (error) {
    console.error('Error seeding super admin:', error.message);
  }
};

// ═══════════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════════

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedSuperAdmin();
  
  app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║   🗳️  EtherBallot API Server              ║
    ║   📡  Port: ${PORT}                        ║
    ║   🌍  Env: ${process.env.NODE_ENV || 'development'}                ║
    ║   📁  DB: MongoDB                         ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
    `);
  });
};

startServer();
