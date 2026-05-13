const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false   // never returned by default — callers must add .select('+password')
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'state_admin', 'district_admin'],
    required: true
  },
  // For state_admin: which state they manage
  state: {
    type: String,
    default: null
  },
  // For district_admin: which district they manage
  district: {
    type: String,
    default: null
  },
  // Who created this admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  permissions: {
    canCreateElection: { type: Boolean, default: false },
    canManageVoters:   { type: Boolean, default: false },
    canViewResults:    { type: Boolean, default: true },
    canManageAdmins:   { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// ── Single pre-save hook: set permissions first, then hash password ──────────
adminSchema.pre('save', async function(next) {
  // 1. Set default permissions when a new admin is created
  if (this.isNew) {
    switch (this.role) {
      case 'super_admin':
        this.permissions = {
          canCreateElection: true,
          canManageVoters:   true,
          canViewResults:    true,
          canManageAdmins:   true
        };
        break;
      case 'state_admin':
        this.permissions = {
          canCreateElection: true,
          canManageVoters:   true,
          canViewResults:    true,
          canManageAdmins:   true   // can create district admins
        };
        break;
      case 'district_admin':
        this.permissions = {
          canCreateElection: false,
          canManageVoters:   true,
          canViewResults:    true,
          canManageAdmins:   false
        };
        break;
    }
  }

  // 2. Hash the password only when it has been modified
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain-text password against stored hash
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.index({ role: 1 });
adminSchema.index({ state: 1 });
adminSchema.index({ state: 1, district: 1 });

module.exports = mongoose.model('Admin', adminSchema);
