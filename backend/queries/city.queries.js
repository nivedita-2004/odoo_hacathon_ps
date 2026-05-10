const { query } = require('../config/db');

const cityQueries = {
  findById: async (id) => {
    const sql = `
      SELECT c.*, co.name as country_name, co.iso_code, co.currency_code
      FROM cities c
      LEFT JOIN countries co ON c.country_id = co.id
      WHERE c.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  findAll: async (page = 1, limit = 20, countryId = null) => {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (countryId) {
      whereClause += ' AND c.country_id = ?';
      params.push(countryId);
    }
    
    const countSql = `
      SELECT COUNT(*) as total 
      FROM cities c 
      ${whereClause}
    `;
    
    const dataSql = `
      SELECT c.*, co.name as country_name, co.iso_code, co.currency_code
      FROM cities c
      LEFT JOIN countries co ON c.country_id = co.id
      ${whereClause}
      ORDER BY c.popularity_score DESC, c.name ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    
    const [countResult, cities] = await Promise.all([
      query(countSql, params),
      query(dataSql, params)
    ]);
    
    return {
      cities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limitNum)
      }
    };
  },

  search: async (searchTerm, page = 1, limit = 20, countryId = null) => {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    let whereClause = 'WHERE (c.name LIKE ? OR co.name LIKE ?)';
    const params = [`%${searchTerm}%`, `%${searchTerm}%`];
    
    if (countryId) {
      whereClause += ' AND c.country_id = ?';
      params.push(countryId);
    }
    
    const countSql = `
      SELECT COUNT(*) as total 
      FROM cities c
      LEFT JOIN countries co ON c.country_id = co.id
      ${whereClause}
    `;
    
    const dataSql = `
      SELECT c.*, co.name as country_name, co.iso_code, co.currency_code
      FROM cities c
      LEFT JOIN countries co ON c.country_id = co.id
      ${whereClause}
      ORDER BY c.popularity_score DESC, c.name ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    
    const [countResult, cities] = await Promise.all([
      query(countSql, params),
      query(dataSql, params)
    ]);
    
    return {
      cities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limitNum)
      }
    };
  },

  getPopularCities: async (limit = 10) => {
    const limitNum = Math.max(1, Number(limit) || 10);
    const sql = `
      SELECT c.*, co.name as country_name, co.iso_code,
             COUNT(DISTINCT ts.id) as trip_count
      FROM cities c
      LEFT JOIN countries co ON c.country_id = co.id
      LEFT JOIN trip_stops ts ON c.id = ts.city_id
      GROUP BY c.id
      ORDER BY c.popularity_score DESC, trip_count DESC
      LIMIT ${limitNum}
    `;
    return await query(sql);
  },

  create: async (cityData) => {
    const { country_id, name, latitude, longitude, popularity_score } = cityData;
    const sql = `
      INSERT INTO cities (country_id, name, latitude, longitude, popularity_score) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      country_id, name, latitude || null, longitude || null, popularity_score || 0
    ]);
    return result.insertId;
  },

  update: async (id, updateData) => {
    const allowedFields = ['name', 'latitude', 'longitude', 'popularity_score'];
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
    const sql = `UPDATE cities SET ${updates.join(', ')} WHERE id = ?`;
    const result = await query(sql, values);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const sql = 'DELETE FROM cities WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  },

  getCityActivities: async (cityId, page = 1, limit = 20) => {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    const countSql = 'SELECT COUNT(*) as total FROM activities WHERE city_id = ?';
    const dataSql = `
      SELECT * FROM activities 
      WHERE city_id = ? 
      ORDER BY estimated_cost ASC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    
    const [countResult, activities] = await Promise.all([
      query(countSql, [cityId]),
      query(dataSql, [cityId])
    ]);
    
    return {
      activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limitNum)
      }
    };
  },

  getCountries: async () => {
    const sql = `
      SELECT co.*, COUNT(c.id) as city_count
      FROM countries co
      LEFT JOIN cities c ON co.id = c.country_id
      GROUP BY co.id
      ORDER BY co.name
    `;
    return await query(sql);
  },

  findCountryById: async (id) => {
    const sql = 'SELECT * FROM countries WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }
};

module.exports = cityQueries;
