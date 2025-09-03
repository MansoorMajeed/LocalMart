/**
 * JWT Authentication middleware for Cart Service
 */

const jwt = require('jsonwebtoken')
const config = require('../config')
const logger = require('../utils/logger')

/**
 * Middleware to verify JWT token from users service
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'Please provide a valid authorization token'
    })
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm]
    })
    
    // Add user info to request
    req.user = {
      id: parseInt(decoded.sub),
      email: decoded.email,
      isAdmin: decoded.is_admin || false
    }
    
    logger.debug('User authenticated', { 
      userId: req.user.id, 
      email: req.user.email 
    })
    
    next()
    
  } catch (error) {
    logger.warn('Invalid token', { 
      error: error.message,
      token: token.substring(0, 20) + '...' 
    })
    
    return res.status(401).json({
      error: 'Invalid token',
      message: 'The provided token is invalid or expired'
    })
  }
}

module.exports = {
  authenticateToken
}