import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import sendEmail from '../utils/sendEmail.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB
    await OTP.findOneAndDelete({ email });
    await OTP.create({ email, otp });

    // Send Email
    const message = `Your verification code for NovaCart registration is ${otp}. This code is valid for 5 minutes.`;
    
    try {
      await sendEmail({
        email,
        subject: 'NovaCart Registration OTP',
        message,
      });
      res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (error) {
      await OTP.findOneAndDelete({ email });
      res.status(500).json({ message: 'Email could not be sent. Please check configuration.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, storeName, otp } = req.body;
  try {
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }
    
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }
    
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      storeName: role === 'vendor' ? storeName : undefined,
      status: role === 'vendor' ? 'Pending Approval' : 'Approved'
    });

    await OTP.findOneAndDelete({ email });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      storeName: user.storeName,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Code-configured credentials
const CODE_CREDENTIALS = {
  admin: {
    email: 'smily.shanvi6597@gmail.com',
    password: 'password123'
  },
  vendor: {
    email: 'shanvi06051997@gmail.com',
    password: 'password123'
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let user;
    const isAdminCred = email === CODE_CREDENTIALS.admin.email && password === CODE_CREDENTIALS.admin.password;
    const isVendorCred = email === CODE_CREDENTIALS.vendor.email && password === CODE_CREDENTIALS.vendor.password;

    if (isAdminCred || isVendorCred) {
      const targetRole = isAdminCred ? 'admin' : 'vendor';

      if (role && role !== targetRole) {
        return res.status(401).json({ message: `Invalid credentials for role: ${role}` });
      }

      user = await User.findOne({ email });
      if (!user) {
        // Auto-create user with correct role if not exists in database
        user = await User.create({
          name: targetRole === 'admin' ? 'Super Admin' : 'TechNova Solutions',
          email,
          password,
          role: targetRole,
          storeName: targetRole === 'vendor' ? 'TechNova Solutions' : undefined,
          status: 'Approved',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
        });
      } else if (user.role !== targetRole) {
        // Ensure the database record is updated to the correct role
        user.role = targetRole;
        if (targetRole === 'admin') user.name = 'Super Admin';
        if (targetRole === 'vendor') {
          user.name = 'TechNova Solutions';
          user.storeName = 'TechNova Solutions';
        }
        await user.save();
      }
    } else {
      user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (role && user.role !== role) {
        return res.status(401).json({ message: `Invalid credentials for role: ${role}` });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ message: 'Your store account is suspended. Contact administration.' });
    }

    if (user.role === 'admin' || user.role === 'vendor') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.findOneAndDelete({ email });
      await OTP.create({ email, otp });

      try {
        await sendEmail({
          email,
          subject: 'NovaCart Admin/Vendor Login OTP',
          message: `Your One-Time Password for login is: ${otp}. It is valid for 5 minutes.`,
        });
        return res.json({ requiresOtp: true, email: user.email, role: user.role });
      } catch (error) {
        console.log(`[Dev Mode] Email failed. Login OTP for ${email} is: ${otp}`);
        return res.json({ requiresOtp: true, email: user.email, role: user.role, message: 'Email skipped. Check backend console for OTP.' });
      }
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      storeName: user.storeName,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify login OTP for admin/vendor
// @route   POST /api/auth/verify-login-otp
router.post('/verify-login-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ message: 'Your store account is suspended. Contact administration.' });
    }

    await OTP.findOneAndDelete({ email });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      storeName: user.storeName,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      if (req.body.storeName) user.storeName = req.body.storeName;
      if (req.body.storeDescription) user.storeDescription = req.body.storeDescription;
      if (req.body.storeLogo) user.storeLogo = req.body.storeLogo;
      if (req.body.avatar) user.avatar = req.body.avatar;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        storeName: updatedUser.storeName
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB
    await OTP.findOneAndDelete({ email });
    await OTP.create({ email, otp });

    // Send Email
    const message = `You requested a password reset. Your OTP is ${otp}. It expires in 5 minutes.`;
    
    try {
      await sendEmail({
        email,
        subject: 'NovaCart Password Reset',
        message,
      });
      res.status(200).json({ success: true, message: 'Password reset OTP sent to email' });
    } catch (error) {
      await OTP.findOneAndDelete({ email });
      res.status(500).json({ message: 'Email could not be sent. Please check configuration.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ message: 'OTP and new password are required' });
    }

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();
    
    // delete OTP after successful reset
    await OTP.findOneAndDelete({ email });

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
