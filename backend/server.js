const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tripRoutes = require('./routes/trip.routes');
const cityRoutes = require('./routes/city.routes');
const activityRoutes = require('./routes/activity.routes');
const budgetRoutes = require('./routes/budget.routes');
const packingRoutes = require('./routes/packing.routes');
const noteRoutes = require('./routes/note.routes');
const adminRoutes = require('./routes/admin.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { initializeSocketHandlers } = require('./socket/socket.handlers');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Traveloop API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      trips: '/api/trips',
      cities: '/api/cities',
      activities: '/api/activities',
      budgets: '/api/budgets',
      packing: '/api/packing',
      notes: '/api/notes',
      admin: '/api/admin'
    }
  });
});

initializeSocketHandlers(io);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Traveloop Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Socket.IO ready for real-time connections`);
});

module.exports = { app, io };
