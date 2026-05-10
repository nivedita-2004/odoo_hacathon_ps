const { query } = require('../config/db');
const crypto = require('crypto');

const refreshTokenQueries = {
  generateToken: () => {
    return crypto.randomBytes(40).toString('hex');
  },

  create: async (userId, token, expiresAt) => {
    const sql = `
      INSERT INTO refresh_tokens (user_id, token, expires_at) 
      VALUES (?, ?, ?)
    `;
    const result = await query(sql, [userId, token, expiresAt]);
    return result.insertId;
  },

  findByToken: async (token) => {
    const sql = `
      SELECT rt.*, u.id as user_id, u.email, u.status
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token = ? 
        AND rt.is_revoked = FALSE 
        AND rt.expires_at > NOW()
    `;
    const results = await query(sql, [token]);
    return results[0] || null;
  },

  findByUserId: async (userId) => {
    const sql = `
      SELECT * FROM refresh_tokens 
      WHERE user_id = ? 
        AND is_revoked = FALSE 
        AND expires_at > NOW()
      ORDER BY created_at DESC
    `;
    return await query(sql, [userId]);
  },

  revoke: async (token) => {
    const sql = `
      UPDATE refresh_tokens 
      SET is_revoked = TRUE 
      WHERE token = ?
    `;
    const result = await query(sql, [token]);
    return result.affectedRows > 0;
  },

  revokeAllUserTokens: async (userId) => {
    const sql = `
      UPDATE refresh_tokens 
      SET is_revoked = TRUE 
      WHERE user_id = ? AND is_revoked = FALSE
    `;
    const result = await query(sql, [userId]);
    return result.affectedRows;
  },

  deleteExpired: async () => {
    const sql = 'DELETE FROM refresh_tokens WHERE expires_at < NOW()';
    const result = await query(sql);
    return result.affectedRows;
  },

  cleanup: async () => {
    const sql = 'DELETE FROM refresh_tokens WHERE expires_at < DATE_SUB(NOW(), INTERVAL 30 DAY)';
    const result = await query(sql);
    return result.affectedRows;
  }
};

module.exports = refreshTokenQueries;
