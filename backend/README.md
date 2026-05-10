# Traveloop Backend API

A complete Node.js/Express backend for the Traveloop travel planning application with Socket.io real-time features.

## Features

- **Authentication**: JWT-based auth with access & refresh tokens, OTP password reset
- **Trip Management**: Create, update, delete, and clone trips
- **Itinerary Builder**: Add stops, cities, activities to trips
- **City Search**: Search and filter cities with popularity scores
- **Activity Management**: Browse and filter activities by cost/duration
- **Budget Tracking**: Cost breakdowns and budget alerts
- **Packing Checklist**: Add, toggle, and manage packing items
- **Trip Notes**: Create and manage trip notes/journal entries
- **Real-time Updates**: Socket.io for live collaboration
- **Admin Dashboard**: Analytics and user management

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection pool
├── controllers/
│   ├── auth.controller.js     # Auth (login, register, me)
│   ├── user.controller.js     # User profile & dashboard
│   ├── trip.controller.js     # Trip CRUD & itineraries
│   ├── tripStop.controller.js # Trip stops & activities
│   ├── city.controller.js      # Cities & countries
│   ├── activity.controller.js  # Activities search
│   ├── budget.controller.js    # Budget tracking
│   ├── packing.controller.js   # Packing checklist
│   ├── note.controller.js      # Trip notes
│   └── admin.controller.js     # Admin analytics
├── queries/
│   ├── user.queries.js       # User DB queries
│   ├── trip.queries.js       # Trip DB queries
│   ├── tripStop.queries.js   # Trip stops DB queries
│   ├── city.queries.js       # City DB queries
│   ├── activity.queries.js   # Activity DB queries
│   ├── budget.queries.js     # Budget DB queries
│   ├── packing.queries.js    # Packing DB queries
│   ├── note.queries.js       # Notes DB queries
│   └── admin.queries.js      # Admin DB queries
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── trip.routes.js
│   ├── city.routes.js
│   ├── activity.routes.js
│   ├── budget.routes.js
│   ├── packing.routes.js
│   ├── note.routes.js
│   └── admin.routes.js
├── middleware/
│   ├── auth.middleware.js      # JWT authentication
│   ├── validation.middleware.js  # Input validation
│   └── error.middleware.js       # Error handling
├── socket/
│   └── socket.handlers.js     # Real-time events
├── utils/
│   ├── helpers.js             # Utility functions
│   └── fileUpload.js          # File upload config
├── server.js                  # Main server entry
├── package.json               # Dependencies
├── .env                       # Environment variables
└── database_setup.sql         # Database schema
```

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
Edit `.env` file with your database credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=traveloop
DB_USER=root
DB_PASSWORD=your_password
ACCESS_TOKEN_SECRET=your_jwt_secret_key
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

3. **Setup database:**
Run the SQL script in MySQL:
```bash
mysql -u root -p < database_setup.sql
```

4. **Start server:**
```bash
# Development
npm run dev

# Production
npm start
```

## JWT Authentication Flow

### Token Types

| Token | Type | Storage | Expiry | Purpose |
|-------|------|---------|--------|---------|
| **Access Token** | JWT (Signed) | Memory/Client | 15 minutes | API Authentication |
| **Refresh Token** | Random String | Database + Client | 7 days | Get new Access Token |

### Authentication Flow

1. **Login/Register** → Receive `access_token` (15min) + `refresh_token` (7 days)
2. **API Calls** → Include `Authorization: Bearer {access_token}`
3. **Token Expired (401)** → Call `/api/auth/refresh-token` with `refresh_token`
4. **Receive New Tokens** → New access_token + NEW refresh_token (rotation)
5. **Logout** → Call `/api/auth/logout` to revoke refresh token

### Security Features

- **Token Type Verification**: Access tokens are verified to be type='access'
- **Refresh Token Rotation**: New refresh token issued on every refresh (prevents replay attacks)
- **Database Storage**: Refresh tokens stored in DB with `is_revoked` flag for instant invalidation
- **Short-lived Access**: 15 minute expiry for access tokens limits exposure window

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh-token` | Get new access token |
| POST | `/api/auth/logout` | Logout (revoke refresh token) |
| POST | `/api/auth/logout-all` | Logout from all devices |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| POST | `/api/auth/reset-password` | Reset password with OTP |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/dashboard` | User dashboard stats |
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/:id/trips` | Get user's trips |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | Get my trips |
| GET | `/api/trips/public` | Get public trips |
| POST | `/api/trips` | Create trip |
| GET | `/api/trips/:id` | Get trip by ID |
| GET | `/api/trips/slug/:slug` | Get trip by slug |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |
| GET | `/api/trips/:id/itinerary` | Full itinerary |
| POST | `/api/trips/:id/clone` | Clone trip |

### Trip Stops
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips/:tripId/stops` | Get trip stops |
| POST | `/api/trips/:tripId/stops` | Add stop |
| PUT | `/api/trips/:tripId/stops/:stopId` | Update stop |
| DELETE | `/api/trips/:tripId/stops/:stopId` | Remove stop |
| PUT | `/api/trips/:tripId/stops/reorder` | Reorder stops |
| POST | `/api/trips/:tripId/stops/:stopId/activities` | Add activity |
| DELETE | `/api/trips/:tripId/stops/:stopId/activities/:id` | Remove activity |

### Cities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cities` | List cities |
| GET | `/api/cities/search?q=` | Search cities |
| GET | `/api/cities/popular` | Popular cities |
| GET | `/api/cities/countries` | List countries |
| GET | `/api/cities/:id` | City details |
| GET | `/api/cities/:id/activities` | City activities |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities?city_id=` | List activities |
| GET | `/api/activities/search?q=` | Search activities |
| GET | `/api/activities/categories` | Get categories |
| GET | `/api/activities/:id` | Activity details |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets/:tripId` | Get budget |
| POST | `/api/budgets/:tripId` | Set budget |
| GET | `/api/budgets/:tripId/breakdown` | Cost breakdown |
| GET | `/api/budgets/:tripId/categories` | By category |
| GET | `/api/budgets/:tripId/status` | Budget status |

### Packing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packing/:tripId` | Get packing list |
| POST | `/api/packing/:tripId` | Add item |
| PUT | `/api/packing/:tripId/:itemId` | Update item |
| PATCH | `/api/packing/:tripId/:itemId/toggle` | Toggle packed |
| DELETE | `/api/packing/:tripId/:itemId` | Delete item |
| POST | `/api/packing/:tripId/reset` | Reset all |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes/:tripId` | Get notes |
| POST | `/api/notes/:tripId` | Create note |
| PUT | `/api/notes/:tripId/:noteId` | Update note |
| DELETE | `/api/notes/:tripId/:noteId` | Delete note |
| GET | `/api/notes/:tripId/search?q=` | Search notes |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id/status` | Update status |
| PUT | `/api/admin/users/:id/admin` | Set admin |
| GET | `/api/admin/analytics/*` | Various analytics |

## Socket.io Events

### Client Events (Emit from client)
| Event | Description |
|-------|-------------|
| `join-trip` | Join a trip room for real-time updates |
| `leave-trip` | Leave a trip room |
| `trip-updated` | Notify trip was updated |
| `stop-added` | New stop added |
| `stop-updated` | Stop modified |
| `packing-item-toggled` | Packing item checked/unchecked |
| `note-added` | New note added |
| `budget-updated` | Budget modified |
| `typing` | User is typing |

### Server Events (Listen on client)
| Event | Description |
|-------|-------------|
| `authenticated` | Auth confirmed |
| `user-joined` | User joined trip |
| `user-left` | User left trip |
| `trip-updated` | Trip data changed |
| `stop-added` | New stop available |
| `stop-updated` | Stop data changed |
| `stop-removed` | Stop deleted |
| `packing-item-toggled` | Packing status changed |
| `note-added` | New note available |
| `budget-updated` | Budget changed |
| `user-typing` | Someone is typing |

## Database Schema

See `database_schema.md` for full schema documentation.

## Response Format

All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev only)"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | traveloop |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | - |
| `ACCESS_TOKEN_SECRET` | JWT signing key | - |
| `ACCESS_TOKEN_EXPIRES_IN` | Token expiry | 15m |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiry | 7d |
| `CORS_ORIGIN` | Allowed frontend | http://localhost:3000 |
