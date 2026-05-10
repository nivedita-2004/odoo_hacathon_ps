const { query } = require('../config/db');

const noteQueries = {
  findById: async (id) => {
    const sql = `
      SELECT tn.*, u.full_name as creator_name, u.profile_photo as creator_photo
      FROM trip_notes tn
      JOIN users u ON tn.created_by = u.id
      WHERE tn.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  findByTripId: async (tripId, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    const countSql = 'SELECT COUNT(*) as total FROM trip_notes WHERE trip_id = ?';
    const dataSql = `
      SELECT tn.*, u.full_name as creator_name, u.profile_photo as creator_photo
      FROM trip_notes tn
      JOIN users u ON tn.created_by = u.id
      WHERE tn.trip_id = ?
      ORDER BY tn.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, notes] = await Promise.all([
      query(countSql, [tripId]),
      query(dataSql, [tripId, limit, offset])
    ]);
    
    return {
      notes,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  },

  create: async (noteData) => {
    const { trip_id, note, created_by } = noteData;
    const sql = `
      INSERT INTO trip_notes (trip_id, note, created_by) 
      VALUES (?, ?, ?)
    `;
    const result = await query(sql, [trip_id, note, created_by]);
    return result.insertId;
  },

  update: async (id, note, userId) => {
    const sql = `
      UPDATE trip_notes 
      SET note = ? 
      WHERE id = ? AND created_by = ?
    `;
    const result = await query(sql, [note, id, userId]);
    return result.affectedRows > 0;
  },

  delete: async (id, userId) => {
    const sql = 'DELETE FROM trip_notes WHERE id = ? AND created_by = ?';
    const result = await query(sql, [id, userId]);
    return result.affectedRows > 0;
  },

  deleteByTripId: async (tripId) => {
    const sql = 'DELETE FROM trip_notes WHERE trip_id = ?';
    const result = await query(sql, [tripId]);
    return result.affectedRows;
  },

  searchNotes: async (tripId, searchTerm, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    const countSql = 'SELECT COUNT(*) as total FROM trip_notes WHERE trip_id = ? AND note LIKE ?';
    const dataSql = `
      SELECT tn.*, u.full_name as creator_name, u.profile_photo as creator_photo
      FROM trip_notes tn
      JOIN users u ON tn.created_by = u.id
      WHERE tn.trip_id = ? AND tn.note LIKE ?
      ORDER BY tn.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const [countResult, notes] = await Promise.all([
      query(countSql, [tripId, searchPattern]),
      query(dataSql, [tripId, searchPattern, limit, offset])
    ]);
    
    return {
      notes,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  },

  getRecentNotes: async (tripId, limit = 5) => {
    const sql = `
      SELECT tn.*, u.full_name as creator_name
      FROM trip_notes tn
      JOIN users u ON tn.created_by = u.id
      WHERE tn.trip_id = ?
      ORDER BY tn.created_at DESC
      LIMIT ?
    `;
    return await query(sql, [tripId, limit]);
  },

  getNoteCount: async (tripId) => {
    const sql = 'SELECT COUNT(*) as count FROM trip_notes WHERE trip_id = ?';
    const results = await query(sql, [tripId]);
    return results[0].count;
  }
};

module.exports = noteQueries;
