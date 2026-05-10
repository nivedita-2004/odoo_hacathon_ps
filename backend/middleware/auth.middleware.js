const jwt = require('jsonwebtoken');
const userQueries = require('../queries/user.queries');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Invalid token format.' 
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Verify token type is 'access'
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Use access token.'
      });
    }
    
    const user = await userQueries.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is not active.' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      is_admin: user.is_admin
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error.', 
      error: error.message 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Verify token type is 'access'
    if (decoded.type !== 'access') {
      req.user = null;
      return next();
    }
    
    const user = await userQueries.findById(decoded.userId);
    
    if (user && user.status === 'active') {
      req.user = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_admin: user.is_admin
      };
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin
};
