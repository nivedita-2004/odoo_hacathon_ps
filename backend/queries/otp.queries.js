const { query } = require('../config/db');
const crypto = require('crypto');

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

const otpQueries = {
  generateOTP: () => {
    return crypto.randomInt(100000, 999999).toString();
  },

  createOTP: async (email, otp) => {
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
    
    await query('DELETE FROM password_resets WHERE email = ?', [email]);
    
    const sql = `
      INSERT INTO password_resets (email, otp, expires_at, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    
    await query(sql, [email, otp, expiresAt]);
    return { otp, expiresAt };
  },

  verifyOTP: async (email, otp) => {
    const sql = `
      SELECT * FROM password_resets 
      WHERE email = ? 
        AND otp = ? 
        AND expires_at > NOW()
        AND is_used = FALSE
    `;
    
    const results = await query(sql, [email, otp]);
    return results[0] || null;
  },

  markOTPUsed: async (email, otp) => {
    const sql = `
      UPDATE password_resets 
      SET is_used = TRUE 
      WHERE email = ? AND otp = ?
    `;
    
    const result = await query(sql, [email, otp]);
    return result.affectedRows > 0;
  },

  deleteOTP: async (email) => {
    const sql = 'DELETE FROM password_resets WHERE email = ?';
    await query(sql, [email]);
  },

  cleanupExpiredOTPs: async () => {
    const sql = 'DELETE FROM password_resets WHERE expires_at < NOW()';
    const result = await query(sql);
    return result.affectedRows;
  }
};

module.exports = otpQueries;
