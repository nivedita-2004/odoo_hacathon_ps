const jwt = require('jsonwebtoken');
const userQueries = require('../queries/user.queries');

const connectedUsers = new Map();

const initializeSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        socket.userId = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      // Verify token type is 'access'
      if (decoded.type !== 'access') {
        socket.userId = null;
        return next();
      }
      
      const user = await userQueries.findById(decoded.userId);
      
      if (user && user.status === 'active') {
        socket.userId = user.id;
        socket.user = {
          id: user.id,
          full_name: user.full_name,
          email: user.email
        };
      } else {
        socket.userId = null;
      }
      
      next();
    } catch (error) {
      socket.userId = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    if (socket.userId) {
      connectedUsers.set(socket.userId, socket.id);
      socket.join(`user:${socket.userId}`);
      
      socket.emit('authenticated', {
        success: true,
        user: socket.user
      });
    }

    socket.on('join-trip', (tripId) => {
      if (!tripId) return;
      
      const roomName = `trip:${tripId}`;
      socket.join(roomName);
      
      socket.to(roomName).emit('user-joined', {
        userId: socket.userId,
        user: socket.user,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Socket ${socket.id} joined trip ${tripId}`);
    });

    socket.on('leave-trip', (tripId) => {
      if (!tripId) return;
      
      const roomName = `trip:${tripId}`;
      socket.leave(roomName);
      
      socket.to(roomName).emit('user-left', {
        userId: socket.userId,
        user: socket.user,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Socket ${socket.id} left trip ${tripId}`);
    });

    socket.on('trip-updated', (data) => {
      const { tripId, updates } = data;
      if (!tripId) return;
      
      socket.to(`trip:${tripId}`).emit('trip-updated', {
        tripId,
        updates,
        updatedBy: socket.user,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('stop-added', (data) => {
      const { tripId, stop } = data;
      if (!tripId) return;
      
      socket.to(`trip:${tripId}`).emit('stop-added', {
        tripId,
        stop,
        addedBy: socket.user,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('stop-updated', (data) => {
      const { tripId, stopId, updates } = data;
      if (!tripId) return;
      
      socket.to(`trip:${tripId}`).emit('stop-updated', {
        tripId,
        stopId,
        updates,
        updatedBy: socket.user,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('stop-removed', (data) => {
      const { tripId, stopId } = data;
      if (!tripId) return;
      
      socket.to(`trip:${tripId}`).emit('stop-removed', {
        tripId,
        stopId,
        removedBy: socket.user,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('packing-item-toggled', (data) => {
      const { tripId, itemId, isPacked } = data;
      if (!tripId) return;
      
      socket.to(`trip:${tripId}`).emit('packing-item-toggled', {
        tripId,
        itemId,
        isPacked,
        updatedBy: socket.user,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('note-added', (data) => {
      const { tripId, note } = data;
      if (!tripId) return;
      
      socket.to(`trip:${tripId}`).emit('note-added', {
        tripId,
        note,
        addedBy: socket.user,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('budget-updated', (data) => {
      const { tripId, budget } = data;
      if (!tripId) return;
      
      socket.to(`trip:${tripId}`).emit('budget-updated', {
        tripId,
        budget,
        updatedBy: socket.user,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('typing', (data) => {
      const { tripId, isTyping } = data;
      if (!tripId) return;
      
      socket.to(`trip:${tripId}`).emit('user-typing', {
        userId: socket.userId,
        user: socket.user,
        isTyping,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        
        socket.rooms.forEach((room) => {
          if (room.startsWith('trip:')) {
            socket.to(room).emit('user-left', {
              userId: socket.userId,
              user: socket.user,
              timestamp: new Date().toISOString()
            });
          }
        });
      }
    });
  });

  global.io = io;
};

const notifyTripUpdate = (tripId, event, data) => {
  if (global.io) {
    global.io.to(`trip:${tripId}`).emit(event, data);
  }
};

const notifyUser = (userId, event, data) => {
  if (global.io) {
    global.io.to(`user:${userId}`).emit(event, data);
  }
};

const broadcastToAll = (event, data) => {
  if (global.io) {
    global.io.emit(event, data);
  }
};

module.exports = {
  initializeSocketHandlers,
  notifyTripUpdate,
  notifyUser,
  broadcastToAll,
  getConnectedUsers: () => Array.from(connectedUsers.keys())
};
