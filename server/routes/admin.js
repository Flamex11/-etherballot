const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const Admin = require('../models/Admin');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, authorize, superAdminOnly, generateToken } = require('../middleware/auth');

// Escape special regex characters to prevent ReDoS attacks
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Indian states and their districts for validation
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

// ═══════════════════════════════════════════
//  ADMIN AUTH
// ═══════════════════════════════════════════

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    const admin = await Admin.findOne({ username }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateModifiedOnly: true });

    const token = generateToken(admin._id, admin.role);

    await AuditLog.create({
      action: 'ADMIN_LOGIN',
      performedBy: { userId: admin._id, userType: admin.role },
      details: `Admin ${admin.username} logged in`,
      success: true
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        state: admin.state,
        district: admin.district,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════
//  SUPER ADMIN: MANAGE STATE ADMINS
// ═══════════════════════════════════════════

// POST /api/admin/create-state-admin (Super Admin only)
router.post('/create-state-admin', protect, superAdminOnly, async (req, res) => {
  try {
    const { username, password, name, email, state } = req.body;

    if (!INDIAN_STATES.includes(state)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state name'
      });
    }

    // Check if state already has an admin
    const existingAdmin = await Admin.findOne({ role: 'state_admin', state, isActive: true });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: `State admin already exists for ${state}`
      });
    }

    const admin = await Admin.create({
      username,
      password,
      name,
      email,
      role: 'state_admin',
      state,
      createdBy: req.user._id
    });

    await AuditLog.create({
      action: 'ADMIN_CREATED',
      performedBy: { userId: req.user._id, userType: 'super_admin' },
      targetResource: { type: 'Admin', id: admin._id },
      details: `State admin created for ${state}: ${name}`,
      success: true
    });

    res.status(201).json({
      success: true,
      message: `State Admin created for ${state}`,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        state: admin.state
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════
//  STATE ADMIN: MANAGE DISTRICT ADMINS
// ═══════════════════════════════════════════

// POST /api/admin/create-district-admin (State Admin or Super Admin)
router.post('/create-district-admin', protect, authorize('super_admin', 'state_admin'), async (req, res) => {
  try {
    const { username, password, name, email, state, district } = req.body;

    // State admin can only create district admins for their state
    if (req.userRole === 'state_admin' && req.user.state !== state) {
      return res.status(403).json({
        success: false,
        message: 'You can only create district admins for your state'
      });
    }

    // Check if district already has an admin
    const existingAdmin = await Admin.findOne({
      role: 'district_admin',
      state,
      district,
      isActive: true
    });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: `District admin already exists for ${district}, ${state}`
      });
    }

    const admin = await Admin.create({
      username,
      password,
      name,
      email,
      role: 'district_admin',
      state,
      district,
      createdBy: req.user._id
    });

    await AuditLog.create({
      action: 'ADMIN_CREATED',
      performedBy: { userId: req.user._id, userType: req.userRole },
      targetResource: { type: 'Admin', id: admin._id },
      details: `District admin created for ${district}, ${state}: ${name}`,
      success: true
    });

    res.status(201).json({
      success: true,
      message: `District Admin created for ${district}, ${state}`,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        state: admin.state,
        district: admin.district
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════
//  ADMIN LISTING & MANAGEMENT
// ═══════════════════════════════════════════

// GET /api/admin/list
router.get('/list', protect, authorize('super_admin', 'state_admin'), async (req, res) => {
  try {
    let filter = {};
    
    if (req.userRole === 'state_admin') {
      // State admin can only see district admins in their state
      filter = { role: 'district_admin', state: req.user.state };
    } else if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.state) filter.state = req.query.state;

    const admins = await Admin.find(filter)
      .select('-password')
      .sort({ role: 1, state: 1, createdAt: -1 });

    res.json({ success: true, count: admins.length, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/:id/toggle-status
router.put('/:id/toggle-status', protect, authorize('super_admin', 'state_admin'), async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // State admin can only toggle district admins
    if (req.userRole === 'state_admin') {
      if (admin.role !== 'district_admin' || admin.state !== req.user.state) {
        return res.status(403).json({
          success: false,
          message: 'You can only manage district admins in your state'
        });
      }
    }

    admin.isActive = !admin.isActive;
    await admin.save({ validateModifiedOnly: true });

    res.json({
      success: true,
      message: `Admin ${admin.isActive ? 'activated' : 'deactivated'}`,
      admin: { id: admin._id, isActive: admin.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════

// GET /api/admin/stats
router.get('/stats', protect, authorize('super_admin', 'state_admin', 'district_admin'), async (req, res) => {
  try {
    let voterFilter = {};
    let adminFilter = {};

    if (req.userRole === 'state_admin') {
      voterFilter = { 'address.state': req.user.state };
      adminFilter = { state: req.user.state, role: 'district_admin' };
    } else if (req.userRole === 'district_admin') {
      voterFilter = { 'address.state': req.user.state, 'address.district': req.user.district };
    }

    const totalVoters = await User.countDocuments(voterFilter);
    const activeVoters = await User.countDocuments({ ...voterFilter, isActive: true });
    
    let managedAdmins = 0;
    if (req.userRole !== 'district_admin') {
      managedAdmins = await Admin.countDocuments(adminFilter);
    }

    // State-wise voter distribution
    let stateWiseVoters = [];
    if (req.userRole === 'super_admin') {
      stateWiseVoters = await User.aggregate([
        { $group: { _id: '$address.state', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 29 }
      ]);
    }

    // District-wise voter distribution
    let districtWiseVoters = [];
    if (req.userRole === 'state_admin') {
      districtWiseVoters = await User.aggregate([
        { $match: { 'address.state': req.user.state } },
        { $group: { _id: '$address.district', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
    }

    // Recent audit logs
    let auditFilter = {};
    if (req.userRole !== 'super_admin') {
      auditFilter = { 'performedBy.userType': { $in: [req.userRole, 'voter'] } };
    }
    const recentLogs = await AuditLog.find(auditFilter)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      stats: {
        totalVoters,
        activeVoters,
        managedAdmins,
        stateWiseVoters,
        districtWiseVoters,
        recentLogs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/voters
router.get('/voters', protect, authorize('super_admin', 'state_admin', 'district_admin'), async (req, res) => {
  try {
    let filter = {};
    
    if (req.userRole === 'state_admin') {
      filter = { 'address.state': req.user.state };
    } else if (req.userRole === 'district_admin') {
      filter = {
        'address.state': req.user.state,
        'address.district': req.user.district
      };
    }

    // Pagination (capped at 100 to prevent data exfiltration)
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Search — escape user input to prevent ReDoS
    if (req.query.search) {
      const safeSearch = escapeRegex(String(req.query.search));
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { aadhaarNumber: { $regex: safeSearch } }
      ];
    }

    const total = await User.countDocuments(filter);
    const voters = await User.find(filter)
      .select('-faceDescriptor -otpSecret')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      voters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', protect, authorize('super_admin', 'state_admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    let filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.success !== undefined) filter.success = req.query.success === 'true';

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/voters/:id (Super Admin only)
router.delete('/voters/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const voter = await User.findById(req.params.id);
    if (!voter) {
      return res.status(404).json({ success: false, message: 'Voter not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    // Hash the Aadhaar number before logging — never store raw PII in audit logs
    const aadhaarHash = CryptoJS.SHA256(voter.aadhaarNumber).toString().slice(0, 12);
    await AuditLog.create({
      action: 'VOTER_DELETED',
      performedBy: { userId: req.user._id, userType: 'super_admin' },
      details: `Voter ${voter.name} (hash:${aadhaarHash}...) was deleted by Super Admin`,
      success: true
    });

    res.json({
      success: true,
      message: 'Voter deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/states
router.get('/states', (req, res) => {
  res.json({ success: true, states: INDIAN_STATES });
});

module.exports = router;
