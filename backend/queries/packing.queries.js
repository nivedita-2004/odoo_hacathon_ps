const { query } = require('../config/db');

const packingQueries = {
  findById: async (id) => {
    const sql = `
      SELECT pi.*, t.title as trip_title
      FROM packing_items pi
      JOIN trips t ON pi.trip_id = t.id
      WHERE pi.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  findByTripId: async (tripId, category = null) => {
    let sql = `
      SELECT pi.*
      FROM packing_items pi
      WHERE pi.trip_id = ?
    `;
    const params = [tripId];
    
    if (category) {
      sql += ' AND pi.category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY pi.category, pi.item_name';
    return await query(sql, params);
  },

  create: async (packingData) => {
    const { trip_id, item_name, category, is_packed } = packingData;
    const sql = `
      INSERT INTO packing_items (trip_id, item_name, is_packed) 
      VALUES (?, ?, ?)
    `;
    const result = await query(sql, [
      trip_id, item_name, is_packed || false
    ]);
    return result.insertId;
  },

  createMultiple: async (tripId, items) => {
    // Insert items one by one since MySQL2 doesn't support bulk insert with single ? placeholder
    const insertPromises = items.map(item => {
      const sql = `
        INSERT INTO packing_items (trip_id, item_name, is_packed) 
        VALUES (?, ?, ?)
      `;
      return query(sql, [tripId, item.item_name, item.is_packed || false]);
    });
    const results = await Promise.all(insertPromises);
    return results.reduce((total, result) => total + result.affectedRows, 0);
  },

  update: async (id, updateData) => {
    const allowedFields = ['item_name', 'is_packed'];
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
    const sql = `UPDATE packing_items SET ${updates.join(', ')} WHERE id = ?`;
    const result = await query(sql, values);
    return result.affectedRows > 0;
  },

  togglePacked: async (id) => {
    const sql = 'UPDATE packing_items SET is_packed = NOT is_packed WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const sql = 'DELETE FROM packing_items WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  },

  deleteByTripId: async (tripId) => {
    const sql = 'DELETE FROM packing_items WHERE trip_id = ?';
    const result = await query(sql, [tripId]);
    return result.affectedRows;
  },

  getPackingStats: async (tripId) => {
    const sql = `
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN is_packed = true THEN 1 ELSE 0 END) as packed_items,
        SUM(CASE WHEN is_packed = false THEN 1 ELSE 0 END) as unpacked_items,
        ROUND(
          (SUM(CASE WHEN is_packed = true THEN 1 ELSE 0 END) / COUNT(*)) * 100, 
          0
        ) as completion_percentage
      FROM packing_items
      WHERE trip_id = ?
    `;
    const results = await query(sql, [tripId]);
    return results[0] || { total_items: 0, packed_items: 0, unpacked_items: 0, completion_percentage: 0 };
  },

  resetAllItems: async (tripId) => {
    const sql = 'UPDATE packing_items SET is_packed = false WHERE trip_id = ?';
    const result = await query(sql, [tripId]);
    return result.affectedRows > 0;
  },

  getDefaultPackingList: async () => {
    return [
      { item_name: 'Passport/ID', category: 'documents', is_packed: false },
      { item_name: 'Travel Insurance Documents', category: 'documents', is_packed: false },
      { item_name: 'Boarding Passes/Tickets', category: 'documents', is_packed: false },
      { item_name: 'Hotel Reservations', category: 'documents', is_packed: false },
      { item_name: 'Underwear', category: 'clothing', is_packed: false },
      { item_name: 'Socks', category: 'clothing', is_packed: false },
      { item_name: 'T-Shirts/Tops', category: 'clothing', is_packed: false },
      { item_name: 'Pants/Shorts', category: 'clothing', is_packed: false },
      { item_name: 'Jacket/Sweater', category: 'clothing', is_packed: false },
      { item_name: 'Comfortable Walking Shoes', category: 'clothing', is_packed: false },
      { item_name: 'Phone & Charger', category: 'electronics', is_packed: false },
      { item_name: 'Power Bank', category: 'electronics', is_packed: false },
      { item_name: 'Camera & Memory Cards', category: 'electronics', is_packed: false },
      { item_name: 'Universal Adapter', category: 'electronics', is_packed: false },
      { item_name: 'Headphones', category: 'electronics', is_packed: false },
      { item_name: 'Toothbrush & Toothpaste', category: 'toiletries', is_packed: false },
      { item_name: 'Shampoo & Conditioner', category: 'toiletries', is_packed: false },
      { item_name: 'Deodorant', category: 'toiletries', is_packed: false },
      { item_name: 'Sunscreen', category: 'toiletries', is_packed: false },
      { item_name: 'Medications', category: 'health', is_packed: false },
      { item_name: 'First Aid Kit', category: 'health', is_packed: false },
      { item_name: 'Hand Sanitizer', category: 'health', is_packed: false }
    ];
  },

  getItemsByCategory: async (tripId) => {
    const sql = `
      SELECT 
        CASE 
          WHEN item_name LIKE '%passport%' OR item_name LIKE '%ticket%' OR item_name LIKE '%document%' OR item_name LIKE '%insurance%' OR item_name LIKE '%reservation%' THEN 'documents'
          WHEN item_name LIKE '%shirt%' OR item_name LIKE '%pant%' OR item_name LIKE '%sock%' OR item_name LIKE '%underwear%' OR item_name LIKE '%jacket%' OR item_name LIKE '%shoe%' OR item_name LIKE '%cloth%' THEN 'clothing'
          WHEN item_name LIKE '%phone%' OR item_name LIKE '%charger%' OR item_name LIKE '%camera%' OR item_name LIKE '%adapter%' OR item_name LIKE '%power%' OR item_name LIKE '%headphone%' OR item_name LIKE '%electronic%' THEN 'electronics'
          WHEN item_name LIKE '%tooth%' OR item_name LIKE '%shampoo%' OR item_name LIKE '%soap%' OR item_name LIKE '%deodorant%' OR item_name LIKE '%sunscreen%' OR item_name LIKE '%toilet%' THEN 'toiletries'
          WHEN item_name LIKE '%medic%' OR item_name LIKE '%first aid%' OR item_name LIKE '%sanitizer%' OR item_name LIKE '%health%' THEN 'health'
          ELSE 'other'
        END as category,
        COUNT(*) as item_count,
        SUM(CASE WHEN is_packed = true THEN 1 ELSE 0 END) as packed_count
      FROM packing_items
      WHERE trip_id = ?
      GROUP BY category
    `;
    return await query(sql, [tripId]);
  }
};

module.exports = packingQueries;
