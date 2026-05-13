const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, generateToken } = require('../middleware/auth');

// Simulated OTP store (in production, use Redis or similar)
const otpStore = new Map();

// ═══════════════════════════════════════════
//  AADHAAR VALIDATION (SIMULATED)
// ═══════════════════════════════════════════

// POST /api/auth/validate-aadhaar
router.post('/validate-aadhaar', async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number. Must be 12 digits.'
      });
    }

    // Check if already registered
    const existingUser = await User.findOne({ aadhaarNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This Aadhaar number is already registered.',
        alreadyRegistered: true
      });
    }

    // Simulate Aadhaar validation (in production, call UIDAI API)
    const simulatedData = {
      valid: true,
      name: 'Verified Citizen',
      aadhaarLast4: aadhaarNumber.slice(-4)
    };

    res.json({
      success: true,
      message: 'Aadhaar number validated successfully',
      data: simulatedData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════
//  OTP MANAGEMENT
// ═══════════════════════════════════════════

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number. Must be 10 digits.'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5-minute expiry
    otpStore.set(mobile, {
      otp,
      expiry: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });

    // In production: send SMS via Twilio/MSG91
    console.log(`📱 OTP for ${mobile}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Include OTP in dev mode for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const stored = otpStore.get(mobile);
    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP.'
      });
    }

    if (Date.now() > stored.expiry) {
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (stored.attempts >= 3) {
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP.'
      });
    }

    if (stored.otp !== otp) {
      stored.attempts++;
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // OTP verified
    otpStore.delete(mobile);

    await AuditLog.create({
      action: 'OTP_VERIFIED',
      performedBy: { userType: 'voter' },
      details: `OTP verified for mobile: ${mobile.slice(-4)}`,
      success: true
    });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      verified: true
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════
//  REGISTRATION
// ═══════════════════════════════════════════

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      aadhaarNumber, name, email, mobile,
      dateOfBirth, gender, state, district,
      pincode, addressLine, faceDescriptor
    } = req.body;

    // Validations
    if (!aadhaarNumber || !name || !mobile || !dateOfBirth || !gender || !state || !district) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Input length validation
    if (name && name.length > 100) {
      return res.status(400).json({ success: false, message: 'Name is too long' });
    }
    if (email && email.length > 254) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        message: 'Valid face data (128-dimensional descriptor) is required for registration'
      });
    }

    // Validate face descriptor values are within expected range
    const isValidDescriptor = faceDescriptor.every(v => typeof v === 'number' && !isNaN(v) && v >= -1 && v <= 1);
    if (!isValidDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'Face data contains invalid values'
      });
    }

    // Check for duplicate
    const existingUser = await User.findOne({
      $or: [{ aadhaarNumber }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.aadhaarNumber === aadhaarNumber
          ? 'Aadhaar already registered'
          : 'Mobile number already registered'
      });
    }

    // Create face image hash for integrity
    const faceImageHash = CryptoJS.SHA256(JSON.stringify(faceDescriptor)).toString();

    const user = await User.create({
      aadhaarNumber,
      name,
      email,
      mobile,
      dateOfBirth,
      gender,
      address: { state, district, pincode, addressLine },
      faceDescriptor,
      faceImageHash,
      isVerified: true
    });

    // Generate token
    const token = generateToken(user._id, 'voter');

    await AuditLog.create({
      action: 'USER_REGISTER',
      performedBy: { userId: user._id, userType: 'voter' },
      details: `New voter registered: ${name}`,
      success: true
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        aadhaarLast4: user.aadhaarNumber.slice(-4),
        mobile: user.mobile,
        state: user.address.state,
        district: user.address.district,
        role: 'voter'
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry detected. User may already be registered.'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number'
      });
    }

    const user = await User.findOne({ aadhaarNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this Aadhaar number'
      });
    }

    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many attempts. Try again later.'
      });
    }

    // Check if voter account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Mask mobile: show first 2 and last 2 digits only
    const maskedMobile = user.mobile.slice(0, 2) + '******' + user.mobile.slice(-2);

    // Return user info for next steps (OTP + face verification)
    res.json({
      success: true,
      message: 'Aadhaar verified. Please complete OTP and face verification.',
      userId: user._id,
      mobile: maskedMobile,
      name: user.name,
      requiresOTP: true,
      requiresFace: true
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login/verify-face
router.post('/login/verify-face', async (req, res) => {
  try {
    const { userId, faceDescriptor } = req.body;

    if (!userId || !faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'User ID and face data are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Compare face descriptors: calculate Euclidean distance
    const storedDescriptor = user.faceDescriptor;
    if (!storedDescriptor || storedDescriptor.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No face data on record. Please re-register.'
      });
    }

    // Calculate Euclidean distance between descriptors
    let distance = 0;
    for (let i = 0; i < storedDescriptor.length; i++) {
      const diff = (faceDescriptor[i] || 0) - storedDescriptor[i];
      distance += diff * diff;
    }
    distance = Math.sqrt(distance);

    // Threshold for face match (face-api.js typically uses 0.6)
    const MATCH_THRESHOLD = 0.6;
    const isMatch = distance < MATCH_THRESHOLD;

    if (!isMatch) {
      await user.incrementLoginAttempts();
      
      await AuditLog.create({
        action: 'FACE_FAILED',
        performedBy: { userId: user._id, userType: 'voter' },
        details: `Face verification failed. Distance: ${distance.toFixed(4)}`,
        success: false
      });

      return res.status(401).json({
        success: false,
        message: 'Face verification failed. Please try again.'
      });
    }

    // Face matched — generate token
    await user.resetLoginAttempts();
    const token = generateToken(user._id, 'voter');

    await AuditLog.create({
      action: 'USER_LOGIN',
      performedBy: { userId: user._id, userType: 'voter' },
      details: `Voter logged in successfully. Face distance: ${distance.toFixed(4)}`,
      success: true
    });

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        aadhaarLast4: user.aadhaarNumber.slice(-4),
        mobile: user.mobile,
        state: user.address.state,
        district: user.address.district,
        role: 'voter'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    let userData;
    if (req.userRole === 'voter') {
      userData = await User.findById(req.user._id).select('-faceDescriptor');
    } else {
      userData = req.user;
    }

    res.json({
      success: true,
      user: userData,
      role: req.userRole
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
