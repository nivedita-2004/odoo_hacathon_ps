# 🎨 Traveloop Frontend

> React-based frontend for the Traveloop travel planning application

## 🚀 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev/) | 18.2.0 | UI Library |
| [Vite](https://vitejs.dev/) | 5.0.0 | Build Tool & Dev Server |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.0 | Styling |
| [React Query](https://tanstack.com/query/latest) | 3.39.3 | Server State Management |
| [Zustand](https://github.com/pmndrs/zustand) | 4.4.0 | Client State Management |
| [React Router](https://reactrouter.com/) | 6.20.0 | Routing |
| [Lucide React](https://lucide.dev/) | 0.294.0 | Icons |
| [Axios](https://axios-http.com/) | 1.6.0 | HTTP Client |
| [date-fns](https://date-fns.org/) | 2.30.0 | Date Formatting |

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layouts/        # Layout components
│   │   ├── MainLayout.jsx      # App layout with sidebar
│   │   └── ProtectedRoute.jsx  # Auth guard
│   └── ui/             # UI primitives
│       ├── Button.jsx
│       ├── Card.jsx
│       └── Input.jsx
│
├── pages/              # Page components (routes)
│   ├── Dashboard.jsx           # Dashboard overview
│   ├── trips/
│   │   ├── Trips.jsx           # Trip listing
│   │   ├── CreateTrip.jsx      # Create trip form
│   │   └── TripDetail.jsx      # Trip details
│   ├── Cities.jsx              # Destination explorer
│   ├── CityDetail.jsx          # City information
│   ├── Profile.jsx             # User profile
│   ├── Settings.jsx            # App settings
│   ├── Login.jsx               # Login page
│   └── Register.jsx            # Registration page
│
├── services/           # API services
│   └── api.js          # Axios instances & API calls
│
├── stores/             # Zustand stores
│   └── authStore.js    # Authentication state
│
├── hooks/              # Custom React hooks
│   └── useAuth.js      # Auth hook
│
├── utils/              # Utility functions
│   └── formatters.js   # Date/currency formatters
│
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles & Tailwind
```

## 🎯 Key Features

### 🎨 UI/UX
- **Modern Design** - Clean, professional interface with Tailwind CSS
- **Responsive** - Mobile-first design, works on all devices
- **Dark Mode Ready** - Theme support built-in
- **Smooth Animations** - Framer Motion transitions
- **Loading States** - Skeletons and spinners for better UX

### 📱 Pages

#### Dashboard
- Stats overview cards
- Recent trips list
- Quick action buttons
- Mini calendar widget
- Travel tips card

#### Trips
- Grid/list view of all trips
- Search and filter functionality
- Pagination
- Trip status badges
- Budget display

#### Create Trip
- Multi-step form
- Date picker with validation
- Budget input
- Visibility settings (public/private)
- Form validation

#### Cities (Destinations)
- Hero section with search
- Stats cards (total cities, countries, popular)
- Popular destinations grid with photos
- All cities grid with Unsplash images
- Rank badges for top cities (#1, #2, #3)
- Country flag emojis
- Popularity scores with star ratings

#### City Detail
- City information display
- Photo gallery
- Popular activities
- Trip planning button

### 🔐 Authentication
- JWT-based auth flow
- Protected routes
- Login/Register forms
- Persistent sessions
- Logout functionality

### 🔄 State Management

#### React Query (Server State)
```javascript
// Example: Fetch trips with caching
const { data, isLoading } = useQuery(
  ['trips', page],
  () => tripAPI.getTrips(page),
  { 
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000 // 5 minutes
  }
);
```

#### Zustand (Client State)
```javascript
// Auth store example
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- Backend API running (see backend README)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🔌 API Integration

### Axios Configuration
```javascript
// services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Services
```javascript
// services/api.js
export const tripAPI = {
  getTrips: (page = 1) => api.get(`/trips?page=${page}`),
  getTrip: (id) => api.get(`/trips/${id}`),
  createTrip: (data) => api.post('/trips', data),
  updateTrip: (id, data) => api.put(`/trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
};

export const cityAPI = {
  getCities: (params) => api.get('/cities', { params }),
  getPopularCities: () => api.get('/cities/popular'),
  getCity: (id) => api.get(`/cities/${id}`),
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};
```

## 🎨 Styling Guide

### Tailwind Configuration
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        500: '#14b8a6',
        600: '#0d9488',
        700: '#0f766e',
      },
      brand: {
        500: '#f97316',
        600: '#ea580c',
      },
    },
  },
}
```

### Common Classes
```css
/* Cards */
.card {
  @apply bg-white rounded-2xl shadow-sm border border-gray-100;
}

.card-hover {
  @apply card hover:shadow-lg hover:-translate-y-1 transition-all duration-300;
}

/* Buttons */
.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-xl 
         hover:bg-primary-700 transition-colors;
}

/* Text */
.text-gradient {
  @apply bg-gradient-to-r from-primary-600 to-brand-500 
         bg-clip-text text-transparent;
}
```

## 📱 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### Example Usage
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Responsive grid */}
</div>
```

## 🔒 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   Backend   │────▶│    JWT      │
│   Form      │     │   Validate  │     │   Token     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                                                ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Protected  │◀────│  Zustand    │◀────│ localStorage│
│   Routes    │     │   Store     │     │   Store     │
└─────────────┘     └─────────────┘     └─────────────┘
```

1. User submits login form
2. Backend validates and returns JWT
3. Token stored in localStorage
4. Zustand store updates auth state
5. Protected routes check auth state
6. Axios adds token to API requests

## 🌟 Component Examples

### Stat Card
```jsx
<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
</div>
```

### Trip Card
```jsx
<Link to={`/trips/${trip.id}`} className="card-hover group">
  <div className="h-40 bg-gradient-to-br from-primary-100 to-brand-100">
    {/* Card image or icon */}
  </div>
  <div className="p-4">
    <h3 className="font-semibold text-gray-900">{trip.title}</h3>
    <p className="text-sm text-gray-500">{trip.destination}</p>
    <div className="mt-3 flex items-center gap-2">
      <Calendar className="w-4 h-4" />
      <span>{formatDate(trip.start_date)}</span>
    </div>
  </div>
</Link>
```

### City Card with Photo
```jsx
<div className="relative h-48 overflow-hidden rounded-t-2xl">
  <img 
    src={cityImage} 
    alt={city.name}
    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
  <div className="absolute bottom-4 left-4">
    <span className="text-3xl">{countryFlag}</span>
  </div>
</div>
```

## 🛠️ Development Tips

### Hot Reload
Vite provides instant hot module replacement (HMR) for fast development.

### Environment Variables
```bash
# .env file
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Traveloop
```

> Note: Variables must be prefixed with `VITE_` to be accessible in the app.

### Proxy Configuration
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
};
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output will be in `dist/` folder.

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Drag `dist/` folder to Netlify drop zone

## 📦 Dependencies

### Production
- react
- react-dom
- react-router-dom
- @tanstack/react-query
- zustand
- axios
- lucide-react
- date-fns
- tailwindcss

### Development
- vite
- @vitejs/plugin-react
- eslint
- postcss
- autoprefixer

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**
- Ensure backend CORS is configured for frontend URL
- Check `CORS_ORIGIN` in backend `.env`

**Images Not Loading**
- Unsplash API rate limits may apply
- Check browser console for 429 errors
- Fallback images are provided

**Build Errors**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with ❤️ using React + Vite + Tailwind
