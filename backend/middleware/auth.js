const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('Authentication failed: No token provided');
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }
    
    // Remove Bearer from token if it exists
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;
      
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'secret';
    console.log('Using JWT secret for verification:', secret);
    console.log('Token being verified:', token.substring(0, 20) + '...');
    
    try {
      const decoded = jwt.verify(token, secret);
      console.log('Decoded token:', JSON.stringify(decoded));
      
      // Ensure all required fields are present
      if (!decoded.id) {
        console.error('Token missing required field: id');
        return res.status(401).json({ message: 'Invalid token format - missing user ID' });
      }
      
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(403).json({ message: 'Token is not valid', error: jwtError.message });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({ message: 'Server error during authentication', error: error.message });
  }
};