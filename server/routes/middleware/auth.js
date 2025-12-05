const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const requireUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'No token provided', code: 'UNAUTHORIZED' } 
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Invalid token format', code: 'UNAUTHORIZED' } 
      });
    }

    console.log('Verifying token for user...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', { sub: decoded.sub, email: decoded.email });
    
    // Find user by either sub or _id (depending on how JWT was created)
    const userId = decoded.sub || decoded._id || decoded.id;
    const user = await User.findById(userId).lean().exec();
    
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(401).json({ 
        success: false, 
        error: { message: 'User not found', code: 'UNAUTHORIZED' } 
      });
    }

    console.log('User found:', { id: user._id, email: user.email, role: user.role });
    req.user = { id: user._id.toString(), ...user };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Invalid token', code: 'FORBIDDEN' } 
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Token expired', code: 'TOKEN_EXPIRED' } 
      });
    }
    return res.status(500).json({ 
      success: false, 
      error: { message: 'Authentication error', code: 'INTERNAL_ERROR' } 
    });
  }
};

module.exports = {
  requireUser,
};
