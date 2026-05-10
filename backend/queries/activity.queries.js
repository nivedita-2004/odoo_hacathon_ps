const { query } = require('../config/db');

const activityQueries = {
  findById: async (id) => {
    const sql = `
      SELECT a.*, c.name as city_name, co.name as country_name
      FROM activities a
      LEFT JOIN cities c ON a.city_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      WHERE a.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  findByCityId: async (cityId, filters = {}, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE a.city_id = ?';
    const params = [cityId];
    
    if (filters.minCost !== undefined) {
      whereClause += ' AND a.estimated_cost >= ?';
      params.push(filters.minCost);
    }
    
    if (filters.maxCost !== undefined) {
      whereClause += ' AND a.estimated_cost <= ?';
      params.push(filters.maxCost);
    }
    
    if (filters.minDuration !== undefined) {
      whereClause += ' AND a.duration_minutes >= ?';
      params.push(filters.minDuration);
    }
    
    if (filters.maxDuration !== undefined) {
      whereClause += ' AND a.duration_minutes <= ?';
      params.push(filters.maxDuration);
    }
    
    if (filters.search) {
      whereClause += ' AND MATCH(a.title) AGAINST(?)';
      params.push(filters.search);
    }
    
    const countSql = `SELECT COUNT(*) as total FROM activities a ${whereClause}`;
    const dataSql = `
      SELECT a.*, c.name as city_name, co.name as country_name
      FROM activities a
      LEFT JOIN cities c ON a.city_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      ${whereClause}
      ORDER BY a.estimated_cost ASC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, activities] = await Promise.all([
      query(countSql, params),
      query(dataSql, [...params, limit, offset])
    ]);
    
    return {
      activities,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  },

  searchActivities: async (searchTerm, filters = {}, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE a.title LIKE ?';
    const params = [`%${searchTerm}%`];
    
    if (filters.cityId) {
      whereClause += ' AND a.city_id = ?';
      params.push(filters.cityId);
    }
    
    if (filters.minCost !== undefined) {
      whereClause += ' AND a.estimated_cost >= ?';
      params.push(filters.minCost);
    }
    
    if (filters.maxCost !== undefined) {
      whereClause += ' AND a.estimated_cost <= ?';
      params.push(filters.maxCost);
    }
    
    const countSql = `
      SELECT COUNT(*) as total 
      FROM activities a 
      ${whereClause}
    `;
    
    const dataSql = `
      SELECT a.*, c.name as city_name, co.name as country_name
      FROM activities a
      LEFT JOIN cities c ON a.city_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      ${whereClause}
      ORDER BY a.estimated_cost ASC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, activities] = await Promise.all([
      query(countSql, params),
      query(dataSql, [...params, limit, offset])
    ]);
    
    return {
      activities,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  },

  create: async (activityData) => {
    const { city_id, title, estimated_cost, duration_minutes } = activityData;
    const sql = `
      INSERT INTO activities (city_id, title, estimated_cost, duration_minutes) 
      VALUES (?, ?, ?, ?)
    `;
    const result = await query(sql, [
      city_id, title, estimated_cost || 0, duration_minutes || 60
    ]);
    return result.insertId;
  },

  update: async (id, updateData) => {
    const allowedFields = ['title', 'estimated_cost', 'duration_minutes'];
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
    const sql = `UPDATE activities SET ${updates.join(', ')} WHERE id = ?`;
    const result = await query(sql, values);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const sql = 'DELETE FROM activities WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  },

  getCategories: async () => {
    return [
      { id: 'sightseeing', name: 'Sightseeing' },
      { id: 'adventure', name: 'Adventure' },
      { id: 'food', name: 'Food & Dining' },
      { id: 'culture', name: 'Culture & History' },
      { id: 'entertainment', name: 'Entertainment' },
      { id: 'shopping', name: 'Shopping' },
      { id: 'relaxation', name: 'Relaxation' }
    ];
  },

  getCostRange: async (cityId = null) => {
    let sql = 'SELECT MIN(estimated_cost) as min_cost, MAX(estimated_cost) as max_cost FROM activities';
    const params = [];
    
    if (cityId) {
      sql += ' WHERE city_id = ?';
      params.push(cityId);
    }
    
    const results = await query(sql, params);
    return results[0];
  }
};

module.exports = activityQueries;
