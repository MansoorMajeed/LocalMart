/**
 * Cart Service - Node.js Express microservice
 * Part of LocalMart microservices architecture
 */

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')

const config = require('./config')
const logger = require('./utils/logger')
const redisClient = require('./utils/redis')

// Import routes
const cartRoutes = require('./routes/cart')
const healthRoutes = require('./routes/health')

// Create Express app
const app = express()

// Middleware
app.use(helmet()) // Security headers
app.use(compression()) // Gzip compression
app.use(cors()) // CORS for frontend
app.use(express.json({ limit: '10mb' })) // JSON parsing
app.use(express.urlencoded({ extended: true })) // URL-encoded parsing

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim(), { component: 'http' })
  }
}))

// Request timing middleware
app.use((req, res, next) => {
  req.startTime = Date.now()
  
  // Log request completion
  res.on('finish', () => {
    const duration = Date.now() - req.startTime
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    })
  })
  
  next()
})

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'LocalMart Cart Service',
    service: config.serviceName,
    version: config.version,
    docs: '/docs',
    endpoints: {
      health: '/health',
      cart: '/api/v1/cart'
    }
  })
})

app.use('/health', healthRoutes)
app.use('/api/v1/cart', cartRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    service: config.serviceName
  })
})

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path
  })

  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    service: config.serviceName
  })
})

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully`)
  
  try {
    // Close Redis connection
    await redisClient.disconnect()
    
    // Close server
    process.exit(0)
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message })
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    logger.info('Connecting to Redis...')
    await redisClient.connect()
    
    // Start HTTP server
    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info('Cart service started', {
        service: config.serviceName,
        version: config.version,
        port: config.port,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      })
    })

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error', { error: error.message })
      process.exit(1)
    })

  } catch (error) {
    logger.error('Failed to start server', { error: error.message })
    process.exit(1)
  }
}

// Start the application
startServer()