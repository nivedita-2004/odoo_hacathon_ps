const { query } = require('../config/db');

const adminQueries = {
  getDashboardStats: async () => {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE status != 'deleted') as total_users,
        (SELECT COUNT(*) FROM users WHERE status = 'active' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_users_30d,
        (SELECT COUNT(*) FROM trips) as total_trips,
        (SELECT COUNT(*) FROM trips WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_trips_30d,
        (SELECT COUNT(*) FROM cities) as total_cities,
        (SELECT COUNT(*) FROM countries) as total_countries,
        (SELECT COUNT(*) FROM activities) as total_activities
    `;
    const results = await query(sql);
    return results[0];
  },

  getUserGrowthStats: async (days = 30) => {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND status != 'deleted'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    return await query(sql, [days]);
  },

  getTripCreationStats: async (days = 30) => {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM trips
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    return await query(sql, [days]);
  },

  getPopularCities: async (limit = 10) => {
    const sql = `
      SELECT 
        c.id,
        c.name,
        co.name as country_name,
        c.popularity_score,
        COUNT(DISTINCT ts.id) as trip_stop_count,
        COUNT(DISTINCT t.id) as unique_trips
      FROM cities c
      LEFT JOIN countries co ON c.country_id = co.id
      LEFT JOIN trip_stops ts ON c.id = ts.city_id
      LEFT JOIN trips t ON ts.trip_id = t.id
      GROUP BY c.id
      ORDER BY trip_stop_count DESC, c.popularity_score DESC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  },

  getPopularActivities: async (limit = 10) => {
    const sql = `
      SELECT 
        a.id,
        a.title,
        a.estimated_cost,
        c.name as city_name,
        COUNT(sa.id) as booking_count
      FROM activities a
      LEFT JOIN cities c ON a.city_id = c.id
      LEFT JOIN stop_activities sa ON a.id = sa.activity_id
      GROUP BY a.id
      ORDER BY booking_count DESC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  },

  getUserEngagementStats: async () => {
    const sql = `
      SELECT 
        AVG(trip_count) as avg_trips_per_user,
        MAX(trip_count) as max_trips_per_user
      FROM (
        SELECT u.id, COUNT(t.id) as trip_count
        FROM users u
        LEFT JOIN trips t ON u.id = t.user_id
        WHERE u.status != 'deleted'
        GROUP BY u.id
      ) as user_trip_counts
    `;
    const results = await query(sql);
    return results[0];
  },

  getAllUsersWithPagination: async (page = 1, limit = 20, status = null) => {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE status != "deleted"';
    const params = [];
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const dataSql = `
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.is_verified, 
        u.is_admin, u.status, u.created_at,
        COUNT(t.id) as trip_count
      FROM users u
      LEFT JOIN trips t ON u.id = t.user_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [countResult, users] = await Promise.all([
      query(countSql, params),
      query(dataSql, [...params, limit, offset])
    ]);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  },

  updateUserStatus: async (userId, status) => {
    const sql = 'UPDATE users SET status = ? WHERE id = ?';
    const result = await query(sql, [status, userId]);
    return result.affectedRows > 0;
  },

  setAdminStatus: async (userId, isAdmin) => {
    const sql = 'UPDATE users SET is_admin = ? WHERE id = ?';
    const result = await query(sql, [isAdmin, userId]);
    return result.affectedRows > 0;
  },

  getSystemHealth: async () => {
    const stats = await Promise.all([
      query('SELECT COUNT(*) as count FROM users WHERE status = "active"'),
      query('SELECT COUNT(*) as count FROM trips'),
      query('SELECT COUNT(*) as count FROM trip_stops'),
      query('SELECT COUNT(*) as count FROM activities'),
      query('SELECT COUNT(*) as count FROM cities'),
      query('SELECT COUNT(*) as count FROM trip_notes')
    ]);
    
    return {
      active_users: stats[0][0].count,
      total_trips: stats[1][0].count,
      total_stops: stats[2][0].count,
      total_activities: stats[3][0].count,
      total_cities: stats[4][0].count,
      total_notes: stats[5][0].count
    };
  }
};

module.exports = adminQueries;
