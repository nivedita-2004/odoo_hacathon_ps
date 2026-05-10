
> A modern, full-stack travel planning application for organizing trips, exploring destinations, and managing travel itineraries.



##  Features

###  Core Functionality
- ** Trip Management** - Create, edit, and manage your travel itineraries
- ** Destination Explorer** - Browse popular cities with photos and ratings
- ** Budget Tracking** - Monitor expenses and set trip budgets
- ** Packing Lists** - Create and manage packing checklists
- ** User Authentication** - Secure login and registration system

###  UI/UX Highlights
- Modern, responsive design with Tailwind CSS
- Interactive sidebar with smooth hover animations
- Beautiful gradient cards with hover effects
- Real city photos from Unsplash
- Loading skeletons and smooth transitions
- Mobile-friendly interface

##  Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast development build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management and caching
- **Zustand** - Client state management
- **React Router v6** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing



### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nivedita-2004/odoo_hacathon_ps.git
   cd odoo_hacathon_ps
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=traveloop
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Setup Database**
   ```bash
   # Create MySQL database
   mysql -u root -p -e "CREATE DATABASE traveloop;"
   
   # Import schema (if available)
   mysql -u root -p traveloop < database/schema.sql
   ```

5. **Start Backend Server**
   ```bash
   npm start
   # Server will run on http://localhost:5000
   ```

6. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

7. **Configure Frontend Environment**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

8. **Start Frontend Development Server**
   ```bash
   npm run dev
   # Application will open at http://localhost:3000
   ```




## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Trips
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Cities
- `GET /api/cities` - Get all cities
- `GET /api/cities/popular` - Get popular cities
- `GET /api/cities/:id` - Get city details

### Users
- `GET /api/users/dashboard` - Get dashboard data
- `GET /api/users/trips` - Get user trips
- `PUT /api/users/profile` - Update profile

##  UI Components

### Pages
- **Dashboard** - Overview with stats, recent trips, and quick actions
- **Trips** - Trip listing with search and pagination
- **Create Trip** - Trip creation form
- **Cities** - Destination explorer with photos
- **City Detail** - City information and activities
- **Profile** - User profile management

### Key Components
- `MainLayout` - App layout with sidebar and header
- `ProtectedRoute` - Authentication guard
- `StatCard` - Dashboard statistics display
- `TripCard` - Trip information card
- `CityCard` - Destination card with photos

## Authentication Flow

1. User registers/logs in
2. Backend validates credentials and returns JWT token
3. Token stored in localStorage
4. Protected routes check authentication via `ProtectedRoute` component
5. Axios interceptors add token to API requests

## Key Features Implementation

### Trip Management
- CRUD operations for trips
- Date validation and budget tracking
- Public/private visibility settings
- Pagination with React Query

### Destination Explorer
- City search with debouncing
- Popular cities ranking
- Unsplash integration for photos
- Dynamic gradient backgrounds based on popularity

### Budget Tracking
- Expense categories
- Budget vs actual spending
- Visual progress indicators

### Packing Lists
- Pre-defined packing categories
- Check/uncheck items
- Custom item addition

## Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md/lg)
- **Desktop**: > 1024px (xl/2xl)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Protected API routes
- SQL injection prevention with parameterized queries
- XSS protection through React's built-in escaping










