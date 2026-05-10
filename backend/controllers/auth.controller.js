const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userQueries = require('../queries/user.queries');
const otpQueries = require('../queries/otp.queries');
const refreshTokenQueries = require('../queries/refreshToken.queries');
const { sendOTPEmail } = require('../config/email');
const { asyncHandler } = require('../middleware/error.middleware');

const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = () => {
  return refreshTokenQueries.generateToken();
};

const register = asyncHandler(async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  const existingUser = await userQueries.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const userId = await userQueries.create({
    full_name,
    email,
    password_hash,
    phone
  });

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken();
  
  const refreshExpires = new Date();
  refreshExpires.setDate(refreshExpires.getDate() + 7);
  await refreshTokenQueries.create(userId, refreshToken, refreshExpires);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900,
      user: {
        id: userId,
        full_name,
        email,
        phone: phone || null
      }
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userQueries.findByEmailWithPassword(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken();
  
  const refreshExpires = new Date();
  refreshExpires.setDate(refreshExpires.getDate() + 7);
  await refreshTokenQueries.create(user.id, refreshToken, refreshExpires);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        profile_photo: user.profile_photo,
        is_admin: user.is_admin,
        preferred_currency: user.preferred_currency,
        language_preference: user.language_preference
      }
    }
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await userQueries.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  const userId = req.user.id;

  const user = await userQueries.findByEmailWithPassword(req.user.email);
  
  const isMatch = await bcrypt.compare(current_password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(new_password, salt);

  await userQueries.updatePassword(userId, password_hash);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await userQueries.findByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found with this email'
    });
  }

  if (user.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Account is not active'
    });
  }

  const otp = otpQueries.generateOTP();
  await otpQueries.createOTP(email, otp);

  const emailResult = await sendOTPEmail(email, otp, user.full_name);
  
  if (!emailResult.success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP email'
    });
  }

  res.status(200).json({
    success: true,
    message: 'OTP sent to your email',
    data: {
      email: email,
      expires_in_minutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10
    }
  });
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await userQueries.findByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const validOTP = await otpQueries.verifyOTP(email, otp);
  if (!validOTP) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP'
    });
  }

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
    data: {
      email,
      verified: true
    }
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, new_password } = req.body;

  const user = await userQueries.findByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const validOTP = await otpQueries.verifyOTP(email, otp);
  if (!validOTP) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP'
    });
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(new_password, salt);

  await userQueries.updatePassword(user.id, password_hash);
  await otpQueries.markOTPUsed(email, otp);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  const tokenData = await refreshTokenQueries.findByToken(refresh_token);
  
  if (!tokenData) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }

  if (tokenData.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'User account is not active'
    });
  }

  // Generate new tokens
  const accessToken = generateAccessToken(tokenData.user_id);
  const newRefreshToken = generateRefreshToken();
  
  // Refresh token rotation: revoke old, create new
  await refreshTokenQueries.revoke(refresh_token);
  
  const refreshExpires = new Date();
  refreshExpires.setDate(refreshExpires.getDate() + 7);
  await refreshTokenQueries.create(tokenData.user_id, newRefreshToken, refreshExpires);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: 900
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;
  const userId = req.user?.id;

  if (refresh_token) {
    await refreshTokenQueries.revoke(refresh_token);
  } else if (userId) {
    await refreshTokenQueries.revokeAllUserTokens(userId);
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

const logoutAll = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const revokedCount = await refreshTokenQueries.revokeAllUserTokens(userId);

  res.status(200).json({
    success: true,
    message: `Logged out from all devices (${revokedCount} sessions revoked)`
  });
});

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  verifyOTP,
  resetPassword,
  refreshAccessToken,
  logout,
  logoutAll
};
