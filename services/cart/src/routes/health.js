/**
 * Health check routes
 */

const express = require('express')
const redisClient = require('../utils/redis')
const catalogService = require('../services/catalogService')
const config = require('../config')
const logger = require('../utils/logger')

const router = express.Router()

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      service: config.serviceName,
      version: config.version,
      timestamp: new Date().toISOString(),
      redis: 'unknown',
      catalog: 'unknown'
    }

    // Check Redis connection
    try {
      if (redisClient.isReady()) {
        await redisClient.getClient().ping()
        health.redis = 'connected'
      } else {
        health.redis = 'disconnected'
        health.status = 'unhealthy'
      }
    } catch (error) {
      health.redis = 'error'
      health.status = 'unhealthy'
      logger.error('Redis health check failed', { error: error.message })
    }

    // Check Catalog service connection
    try {
      await catalogService.client.get('/health', { timeout: 2000 })
      health.catalog = 'connected'
    } catch (error) {
      health.catalog = 'unreachable'
      // Don't mark as unhealthy for external service issues
      logger.warn('Catalog service health check failed', { error: error.message })
    }

    const statusCode = health.status === 'healthy' ? 200 : 503
    
    res.status(statusCode).json({
      data: health
    })

  } catch (error) {
    logger.error('Health check failed', { error: error.message })
    
    res.status(503).json({
      data: {
        status: 'unhealthy',
        service: config.serviceName,
        version: config.version,
        timestamp: new Date().toISOString(),
        error: error.message
      }
    })
  }
})

module.exports = router