const { query, transaction } = require('../config/db');

const tripStopQueries = {
  findById: async (id) => {
    const sql = `
      SELECT ts.*, c.name as city_name, co.name as country_name,
             COUNT(sa.id) as activity_count
      FROM trip_stops ts
      LEFT JOIN cities c ON ts.city_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      LEFT JOIN stop_activities sa ON ts.id = sa.trip_stop_id
      WHERE ts.id = ?
      GROUP BY ts.id
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  findByTripId: async (tripId) => {
    const sql = `
      SELECT ts.*, c.name as city_name, c.latitude, c.longitude,
             co.name as country_name, co.currency_code,
             COUNT(sa.id) as activity_count
      FROM trip_stops ts
      LEFT JOIN cities c ON ts.city_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      LEFT JOIN stop_activities sa ON ts.id = sa.trip_stop_id
      WHERE ts.trip_id = ?
      GROUP BY ts.id
      ORDER BY ts.stop_order
    `;
    return await query(sql, [tripId]);
  },

  create: async (stopData) => {
    const { trip_id, city_id, arrival_date, departure_date, stop_order } = stopData;
    const sql = `
      INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, stop_order) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      trip_id, city_id, arrival_date || null, departure_date || null, stop_order
    ]);
    return result.insertId;
  },

  update: async (id, updateData) => {
    const allowedFields = ['city_id', 'arrival_date', 'departure_date', 'stop_order'];
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
    const sql = `UPDATE trip_stops SET ${updates.join(', ')} WHERE id = ?`;
    const result = await query(sql, values);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    return await transaction(async (connection) => {
      await connection.execute('DELETE FROM stop_activities WHERE trip_stop_id = ?', [id]);
      const [result] = await connection.execute('DELETE FROM trip_stops WHERE id = ?', [id]);
      return result.affectedRows > 0;
    });
  },

  reorderStops: async (tripId, stopOrders) => {
    return await transaction(async (connection) => {
      for (const { stopId, newOrder } of stopOrders) {
        await connection.execute(
          'UPDATE trip_stops SET stop_order = ? WHERE id = ? AND trip_id = ?',
          [newOrder, stopId, tripId]
        );
      }
      return true;
    });
  },

  getNextStopOrder: async (tripId) => {
    const sql = 'SELECT MAX(stop_order) as max_order FROM trip_stops WHERE trip_id = ?';
    const results = await query(sql, [tripId]);
    return (results[0].max_order || 0) + 1;
  },

  addActivityToStop: async (tripStopId, activityId, activityDate = null) => {
    const sql = `
      INSERT INTO stop_activities (trip_stop_id, activity_id, activity_date) 
      VALUES (?, ?, ?)
    `;
    const result = await query(sql, [tripStopId, activityId, activityDate]);
    return result.insertId;
  },

  removeActivityFromStop: async (stopActivityId) => {
    const sql = 'DELETE FROM stop_activities WHERE id = ?';
    const result = await query(sql, [stopActivityId]);
    return result.affectedRows > 0;
  },

  getStopActivities: async (tripStopId) => {
    const sql = `
      SELECT sa.id, sa.activity_date, 
             a.id as activity_id, a.title, a.estimated_cost, a.duration_minutes
      FROM stop_activities sa
      JOIN activities a ON sa.activity_id = a.id
      WHERE sa.trip_stop_id = ?
      ORDER BY sa.activity_date
    `;
    return await query(sql, [tripStopId]);
  },

  updateActivityDate: async (stopActivityId, activityDate) => {
    const sql = 'UPDATE stop_activities SET activity_date = ? WHERE id = ?';
    const result = await query(sql, [activityDate, stopActivityId]);
    return result.affectedRows > 0;
  }
};

module.exports = tripStopQueries;
