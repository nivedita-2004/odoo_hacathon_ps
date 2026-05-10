const { query, transaction } = require('../config/db');

const tripQueries = {
  findById: async (id, includeUser = false) => {
    let sql = `
      SELECT t.*, 
             COUNT(DISTINCT ts.id) as stop_count,
             COUNT(DISTINCT pi.id) as packing_item_count,
             COUNT(DISTINCT tn.id) as note_count
      FROM trips t
      LEFT JOIN trip_stops ts ON t.id = ts.trip_id
      LEFT JOIN packing_items pi ON t.id = pi.trip_id
      LEFT JOIN trip_notes tn ON t.id = tn.trip_id
      WHERE t.id = ?
      GROUP BY t.id
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  findBySlug: async (slug) => {
    const sql = `
      SELECT t.*, u.full_name as creator_name, u.profile_photo as creator_photo
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.slug = ? AND (t.visibility = 'public' OR t.user_id = ?)
    `;
    const results = await query(sql, [slug]);
    return results[0] || null;
  },

  findByUserId: async (userId, visibility = null, page = 1, limit = 10) => {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    let whereClause = 'WHERE t.user_id = ?';
    const params = [userId];
    
    if (visibility) {
      whereClause += ' AND t.visibility = ?';
      params.push(visibility);
    }
    
    const countSql = `SELECT COUNT(*) as total FROM trips t ${whereClause}`;
    const dataSql = `
      SELECT t.id, t.title, t.slug, t.start_date, t.end_date, 
             t.visibility, t.total_budget, t.created_at,
             COUNT(DISTINCT ts.id) as stop_count
      FROM trips t
      LEFT JOIN trip_stops ts ON t.id = ts.trip_id
      ${whereClause}
      GROUP BY t.id
      ORDER BY t.start_date ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    
    const [countResult, trips] = await Promise.all([
      query(countSql, params),
      query(dataSql, params)
    ]);
    
    return {
      trips,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limitNum)
      }
    };
  },

  findPublicTrips: async (page = 1, limit = 10) => {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    const countSql = `SELECT COUNT(*) as total FROM trips WHERE visibility = 'public'`;
    const dataSql = `
      SELECT t.id, t.title, t.slug, t.start_date, t.end_date, t.total_budget,
             u.full_name as creator_name, u.profile_photo as creator_photo,
             COUNT(DISTINCT ts.id) as stop_count
      FROM trips t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN trip_stops ts ON t.id = ts.trip_id
      WHERE t.visibility = 'public'
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    
    const [countResult, trips] = await Promise.all([
      query(countSql),
      query(dataSql)
    ]);
    
    return {
      trips,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limitNum)
      }
    };
  },

  create: async (tripData) => {
    const { user_id, title, slug, start_date, end_date, visibility, total_budget } = tripData;
    const sql = `
      INSERT INTO trips (user_id, title, slug, start_date, end_date, visibility, total_budget) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      user_id, title, slug, start_date || null, end_date || null, 
      visibility || 'private', total_budget || 0
    ]);
    return result.insertId;
  },

  update: async (id, updateData) => {
    const allowedFields = ['title', 'slug', 'start_date', 'end_date', 'visibility', 'total_budget'];
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
    const sql = `UPDATE trips SET ${updates.join(', ')} WHERE id = ?`;
    const result = await query(sql, values);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    return await transaction(async (connection) => {
      await connection.execute('DELETE FROM stop_activities WHERE trip_stop_id IN (SELECT id FROM trip_stops WHERE trip_id = ?)', [id]);
      await connection.execute('DELETE FROM trip_stops WHERE trip_id = ?', [id]);
      await connection.execute('DELETE FROM budgets WHERE trip_id = ?', [id]);
      await connection.execute('DELETE FROM packing_items WHERE trip_id = ?', [id]);
      await connection.execute('DELETE FROM trip_notes WHERE trip_id = ?', [id]);
      const [result] = await connection.execute('DELETE FROM trips WHERE id = ?', [id]);
      return result.affectedRows > 0;
    });
  },

  getFullItinerary: async (tripId) => {
    const sql = `
      SELECT 
        t.id as trip_id, t.title, t.start_date, t.end_date, t.total_budget,
        ts.id as stop_id, ts.arrival_date, ts.departure_date, ts.stop_order,
        c.id as city_id, c.name as city_name, c.latitude, c.longitude,
        co.name as country_name,
        a.id as activity_id, a.title as activity_title, a.estimated_cost, a.duration_minutes,
        sa.id as stop_activity_id, sa.activity_date
      FROM trips t
      LEFT JOIN trip_stops ts ON t.id = ts.trip_id
      LEFT JOIN cities c ON ts.city_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      LEFT JOIN stop_activities sa ON ts.id = sa.trip_stop_id
      LEFT JOIN activities a ON sa.activity_id = a.id
      WHERE t.id = ?
      ORDER BY ts.stop_order, sa.activity_date
    `;
    return await query(sql, [tripId]);
  },

  cloneTrip: async (tripId, newUserId) => {
    return await transaction(async (connection) => {
      const [trip] = await connection.execute('SELECT * FROM trips WHERE id = ?', [tripId]);
      if (!trip[0]) throw new Error('Trip not found');
      
      const original = trip[0];
      const newSlug = `${original.slug}-copy-${Date.now()}`;
      
      const [insertResult] = await connection.execute(
        `INSERT INTO trips (user_id, title, slug, start_date, end_date, visibility, total_budget)
         VALUES (?, ?, ?, NULL, NULL, 'private', ?)`,
        [newUserId, `${original.title} (Copy)`, newSlug, original.total_budget]
      );
      
      const newTripId = insertResult.insertId;
      
      const [stops] = await connection.execute('SELECT * FROM trip_stops WHERE trip_id = ?', [tripId]);
      const stopMap = {};
      
      for (const stop of stops) {
        const [newStop] = await connection.execute(
          'INSERT INTO trip_stops (trip_id, city_id, stop_order) VALUES (?, ?, ?)',
          [newTripId, stop.city_id, stop.stop_order]
        );
        stopMap[stop.id] = newStop.insertId;
      }
      
      const [activities] = await connection.execute(
        'SELECT * FROM stop_activities WHERE trip_stop_id IN (?)',
        [stops.map(s => s.id)]
      );
      
      for (const activity of activities) {
        if (stopMap[activity.trip_stop_id]) {
          await connection.execute(
            'INSERT INTO stop_activities (trip_stop_id, activity_id) VALUES (?, ?)',
            [stopMap[activity.trip_stop_id], activity.activity_id]
          );
        }
      }
      
      return newTripId;
    });
  },

  generateSlug: (title) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  }
};

module.exports = tripQueries;
