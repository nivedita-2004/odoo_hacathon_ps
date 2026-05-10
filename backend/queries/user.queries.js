const { query, transaction } = require('../config/db');

const userQueries = {
  findById: async (id) => {
    const sql = `
      SELECT u.id, u.full_name, u.email, u.phone, u.profile_photo, 
             u.bio, u.preferred_currency, u.language_preference, 
             u.is_verified, u.is_admin, u.status, u.created_at
      FROM users u 
      WHERE u.id = ? AND u.status != 'deleted'
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  findByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ? AND status != "deleted"';
    const results = await query(sql, [email]);
    return results[0] || null;
  },

  findByEmailWithPassword: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ? AND status = "active"';
    const results = await query(sql, [email]);
    return results[0] || null;
  },

  create: async (userData) => {
    const { full_name, email, password_hash, phone } = userData;
    const sql = `
      INSERT INTO users (full_name, email, password_hash, phone, status) 
      VALUES (?, ?, ?, ?, 'active')
    `;
    const result = await query(sql, [full_name, email, password_hash, phone || null]);
    return result.insertId;
  },

  update: async (id, updateData) => {
    const allowedFields = ['full_name', 'phone', 'profile_photo', 'bio', 
                          'preferred_currency', 'language_preference'];
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) return false;
    
    values.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    const result = await query(sql, values);
    return result.affectedRows > 0;
  },

  updatePassword: async (id, password_hash) => {
    const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
    const result = await query(sql, [password_hash, id]);
    return result.affectedRows > 0;
  },

  updateStatus: async (id, status) => {
    const sql = 'UPDATE users SET status = ? WHERE id = ?';
    const result = await query(sql, [status, id]);
    return result.affectedRows > 0;
  },

  setVerified: async (id) => {
    const sql = 'UPDATE users SET is_verified = true WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const sql = 'UPDATE users SET status = "deleted" WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  },

  getDashboardStats: async (userId) => {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM trips WHERE user_id = ?) as total_trips,
        (SELECT COUNT(*) FROM trips WHERE user_id = ? AND start_date > CURDATE()) as upcoming_trips,
        (SELECT COUNT(*) FROM trips WHERE user_id = ? AND visibility = 'public') as public_trips
    `;
    const results = await query(sql, [userId, userId, userId]);
    return results[0];
  },

  getAllWithPagination: async (page = 1, limit = 10, status = null) => {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    let whereClause = 'WHERE status != "deleted"';
    const params = [];
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const dataSql = `
      SELECT id, full_name, email, phone, is_verified, is_admin, status, created_at 
      FROM users ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    
    const [countResult, users] = await Promise.all([
      query(countSql, params),
      query(dataSql, params)
    ]);
    
    return {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limitNum)
      }
    };
  },

  getRecentTrips: async (userId, limit = 5) => {
    const limitNum = Math.max(1, Number(limit) || 5);
    const sql = `
      SELECT t.id, t.title, t.slug, t.start_date, t.end_date, t.total_budget, t.visibility,
             COUNT(DISTINCT ts.id) as stop_count
      FROM trips t
      LEFT JOIN trip_stops ts ON t.id = ts.trip_id
      WHERE t.user_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT ${limitNum}
    `;
    return await query(sql, [userId]);
  }
};

module.exports = userQueries;
