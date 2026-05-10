const { query, transaction } = require('../config/db');

const budgetQueries = {
  findByTripId: async (tripId) => {
    const sql = 'SELECT * FROM budgets WHERE trip_id = ?';
    const results = await query(sql, [tripId]);
    return results[0] || null;
  },

  createOrUpdate: async (budgetData) => {
    const { trip_id, transport_budget, accommodation_budget, food_budget } = budgetData;
    
    const checkSql = 'SELECT id FROM budgets WHERE trip_id = ?';
    const existing = await query(checkSql, [trip_id]);
    
    if (existing.length > 0) {
      const sql = `
        UPDATE budgets 
        SET transport_budget = ?, accommodation_budget = ?, food_budget = ?
        WHERE trip_id = ?
      `;
      const result = await query(sql, [
        transport_budget || 0, accommodation_budget || 0, food_budget || 0, trip_id
      ]);
      return { id: existing[0].id, updated: true };
    } else {
      const sql = `
        INSERT INTO budgets (trip_id, transport_budget, accommodation_budget, food_budget) 
        VALUES (?, ?, ?, ?)
      `;
      const result = await query(sql, [
        trip_id, transport_budget || 0, accommodation_budget || 0, food_budget || 0
      ]);
      return { id: result.insertId, updated: false };
    }
  },

  update: async (tripId, updateData) => {
    const allowedFields = ['transport_budget', 'accommodation_budget', 'food_budget'];
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) return false;
    
    values.push(tripId);
    const sql = `UPDATE budgets SET ${updates.join(', ')} WHERE trip_id = ?`;
    const result = await query(sql, values);
    return result.affectedRows > 0;
  },

  delete: async (tripId) => {
    const sql = 'DELETE FROM budgets WHERE trip_id = ?';
    const result = await query(sql, [tripId]);
    return result.affectedRows > 0;
  },

  getTripBudgetBreakdown: async (tripId) => {
    const sql = `
      SELECT 
        b.transport_budget,
        b.accommodation_budget,
        b.food_budget,
        (b.transport_budget + b.accommodation_budget + b.food_budget) as total_budgeted,
        COALESCE(SUM(a.estimated_cost), 0) as activities_cost,
        t.total_budget as trip_total_budget
      FROM budgets b
      JOIN trips t ON b.trip_id = t.id
      LEFT JOIN trip_stops ts ON t.id = ts.trip_id
      LEFT JOIN stop_activities sa ON ts.id = sa.trip_stop_id
      LEFT JOIN activities a ON sa.activity_id = a.id
      WHERE b.trip_id = ?
      GROUP BY b.trip_id
    `;
    const results = await query(sql, [tripId]);
    return results[0] || null;
  },

  getCostBreakdownByCategory: async (tripId) => {
    const sql = `
      SELECT 
        'transport' as category,
        COALESCE(b.transport_budget, 0) as budgeted,
        0 as actual
      FROM budgets b
      WHERE b.trip_id = ?
      
      UNION ALL
      
      SELECT 
        'accommodation' as category,
        COALESCE(b.accommodation_budget, 0) as budgeted,
        0 as actual
      FROM budgets b
      WHERE b.trip_id = ?
      
      UNION ALL
      
      SELECT 
        'food' as category,
        COALESCE(b.food_budget, 0) as budgeted,
        0 as actual
      FROM budgets b
      WHERE b.trip_id = ?
      
      UNION ALL
      
      SELECT 
        'activities' as category,
        0 as budgeted,
        COALESCE(SUM(a.estimated_cost), 0) as actual
      FROM trip_stops ts
      JOIN stop_activities sa ON ts.id = sa.trip_stop_id
      JOIN activities a ON sa.activity_id = a.id
      WHERE ts.trip_id = ?
      GROUP BY ts.trip_id
    `;
    return await query(sql, [tripId, tripId, tripId, tripId]);
  },

  getDailyCostEstimate: async (tripId) => {
    const sql = `
      SELECT 
        t.start_date,
        t.end_date,
        DATEDIFF(t.end_date, t.start_date) + 1 as total_days,
        COALESCE(SUM(a.estimated_cost), 0) / NULLIF(DATEDIFF(t.end_date, t.start_date) + 1, 0) as avg_daily_cost
      FROM trips t
      LEFT JOIN trip_stops ts ON t.id = ts.trip_id
      LEFT JOIN stop_activities sa ON ts.id = sa.trip_stop_id
      LEFT JOIN activities a ON sa.activity_id = a.id
      WHERE t.id = ?
      GROUP BY t.id
    `;
    const results = await query(sql, [tripId]);
    return results[0] || null;
  },

  checkBudgetStatus: async (tripId) => {
    const sql = `
      SELECT 
        t.total_budget as trip_budget,
        COALESCE(b.transport_budget, 0) + COALESCE(b.accommodation_budget, 0) + COALESCE(b.food_budget, 0) as allocated_budget,
        COALESCE(SUM(a.estimated_cost), 0) as activities_cost,
        CASE 
          WHEN COALESCE(SUM(a.estimated_cost), 0) > t.total_budget THEN 'over_budget'
          WHEN COALESCE(SUM(a.estimated_cost), 0) > t.total_budget * 0.9 THEN 'near_limit'
          ELSE 'within_budget'
        END as status
      FROM trips t
      LEFT JOIN budgets b ON t.id = b.trip_id
      LEFT JOIN trip_stops ts ON t.id = ts.trip_id
      LEFT JOIN stop_activities sa ON ts.id = sa.trip_stop_id
      LEFT JOIN activities a ON sa.activity_id = a.id
      WHERE t.id = ?
      GROUP BY t.id
    `;
    const results = await query(sql, [tripId]);
    return results[0] || null;
  }
};

module.exports = budgetQueries;
