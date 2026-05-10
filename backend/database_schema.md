# Database Schema - traveloop

Generated: 10/5/2026

================================================================================

## TABLE: users
--------------------------------------------------------------------------------
Purpose: Stores all registered users and authentication-related information.

### Columns
1. id (bigint unsigned) [NOT NULL] [PRIMARY KEY] [AUTO_INCREMENT]
2. full_name (varchar(120)) [NOT NULL]
3. email (varchar(150)) [NOT NULL] [UNIQUE]
4. password_hash (varchar(255)) [NOT NULL]
5. phone (varchar(20))
6. profile_photo (varchar(255))
7. bio (text)
8. preferred_currency (char(3)) [DEFAULT: USD]
9. language_preference (varchar(20)) [DEFAULT: en]
10. is_verified (boolean) [DEFAULT: false]
11. is_admin (boolean) [DEFAULT: false]
12. status (enum('active','blocked','deleted')) [DEFAULT: active]

### Indexes
- PRIMARY (id) [UNIQUE]
- idx_users_email (email)
- idx_users_status (status)

================================================================================

## TABLE: trips
--------------------------------------------------------------------------------
Purpose: Stores main trip information created by users.

### Columns
1. id (bigint unsigned) [PRIMARY KEY] [AUTO_INCREMENT]
2. user_id (bigint unsigned) [NOT NULL]
3. title (varchar(200)) [NOT NULL]
4. slug (varchar(255)) [UNIQUE]
5. start_date (date)
6. end_date (date)
7. visibility (enum('private','public','friends'))
8. total_budget (decimal(12,2))

### Indexes
- PRIMARY (id)
- idx_trips_user (user_id)
- idx_trips_dates (start_date, end_date)

### Foreign Keys
- user_id → users.id

================================================================================

## TABLE: countries
--------------------------------------------------------------------------------
Purpose: Master country data.

### Columns
1. id (bigint unsigned) [PRIMARY KEY]
2. iso_code (char(2)) [UNIQUE]
3. name (varchar(120))
4. currency_code (char(3))

### Indexes
- PRIMARY (id)
- iso_code (iso_code)

================================================================================

## TABLE: cities
--------------------------------------------------------------------------------
Purpose: Stores travel destination cities.

### Columns
1. id (bigint unsigned) [PRIMARY KEY]
2. country_id (bigint unsigned)
3. name (varchar(120))
4. latitude (decimal)
5. longitude (decimal)
6. popularity_score (decimal)

### Indexes
- PRIMARY (id)
- idx_cities_country (country_id)
- idx_cities_name (name)

### Foreign Keys
- country_id → countries.id

================================================================================

## TABLE: trip_stops
--------------------------------------------------------------------------------
Purpose: Stores each stop inside a trip itinerary.

### Columns
1. id (bigint unsigned) [PRIMARY KEY]
2. trip_id (bigint unsigned)
3. city_id (bigint unsigned)
4. arrival_date (date)
5. departure_date (date)
6. stop_order (int)

### Indexes
- PRIMARY (id)
- idx_trip_stops_trip (trip_id)
- idx_trip_stops_order (trip_id, stop_order)

### Foreign Keys
- trip_id → trips.id
- city_id → cities.id

================================================================================

## TABLE: activities
--------------------------------------------------------------------------------
Purpose: Stores activities for cities and itineraries.

### Columns
1. id (bigint unsigned) [PRIMARY KEY]
2. city_id (bigint unsigned)
3. title (varchar(255))
4. estimated_cost (decimal)
5. duration_minutes (int)

### Indexes
- PRIMARY (id)
- idx_activities_city (city_id)
- FULLTEXT idx_activity_search (title)

### Foreign Keys
- city_id → cities.id

================================================================================

## TABLE: stop_activities
--------------------------------------------------------------------------------
Purpose: Connects activities to trip stops.

### Columns
1. id (bigint unsigned) [PRIMARY KEY]
2. trip_stop_id (bigint unsigned)
3. activity_id (bigint unsigned)
4. activity_date (date)

### Indexes
- PRIMARY (id)
- idx_stop_activities_stop (trip_stop_id)

### Foreign Keys
- trip_stop_id → trip_stops.id
- activity_id → activities.id

================================================================================

## TABLE: budgets
--------------------------------------------------------------------------------
Purpose: Stores trip budget breakdowns.

### Columns
1. id (bigint unsigned) [PRIMARY KEY]
2. trip_id (bigint unsigned) [UNIQUE]
3. transport_budget (decimal)
4. accommodation_budget (decimal)
5. food_budget (decimal)

### Indexes
- PRIMARY (id)
- trip_id (trip_id)

### Foreign Keys
- trip_id → trips.id

================================================================================

## TABLE: packing_items
--------------------------------------------------------------------------------
Purpose: Stores packing checklist items.

### Columns
1. id (bigint unsigned) [PRIMARY KEY]
2. trip_id (bigint unsigned)
3. item_name (varchar(255))
4. is_packed (boolean)

### Indexes
- PRIMARY (id)
- idx_packing_trip (trip_id)

### Foreign Keys
- trip_id → trips.id

================================================================================

## TABLE: trip_notes
--------------------------------------------------------------------------------
Purpose: Stores trip notes and reminders.

### Columns
1. id (bigint unsigned) [PRIMARY KEY]
2. trip_id (bigint unsigned)
3. note (text)
4. created_by (bigint unsigned)

### Indexes
- PRIMARY (id)
- trip_id (trip_id)

### Foreign Keys
- trip_id → trips.id
- created_by → users.id

================================================================================
