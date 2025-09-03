/**
 * Redis client for cart storage
 */

const redis = require('redis')
const config = require('../config')
const logger = require('./logger')

class RedisClient {
  constructor() {
    this.client = null
    this.isConnected = false
  }

  async connect() {
    try {
      this.client = redis.createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port
        },
        password: config.redis.password,
        database: config.redis.db
      })

      this.client.on('error', (err) => {
        logger.error('Redis connection error', { error: err.message })
        this.isConnected = false
      })

      this.client.on('connect', () => {
        logger.info('Redis connected', { 
          host: config.redis.host, 
          port: config.redis.port 
        })
        this.isConnected = true
      })

      this.client.on('disconnect', () => {
        logger.warn('Redis disconnected')
        this.isConnected = false
      })

      await this.client.connect()
      return this.client
      
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error.message })
      throw error
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect()
      this.isConnected = false
      logger.info('Redis disconnected')
    }
  }

  getClient() {
    return this.client
  }

  isReady() {
    return this.isConnected && this.client?.isReady
  }

  // Cart-specific Redis operations
  getCartKey(userId) {
    return `${config.redis.keyPrefix}user:${userId}`
  }

  async getCart(userId) {
    try {
      const cartData = await this.client.get(this.getCartKey(userId))
      return cartData ? JSON.parse(cartData) : { items: [], total: 0 }
    } catch (error) {
      logger.error('Error getting cart from Redis', { userId, error: error.message })
      return { items: [], total: 0 }
    }
  }

  async setCart(userId, cartData) {
    try {
      await this.client.setEx(
        this.getCartKey(userId),
        config.cart.ttl,
        JSON.stringify(cartData)
      )
      return true
    } catch (error) {
      logger.error('Error setting cart in Redis', { userId, error: error.message })
      return false
    }
  }

  async deleteCart(userId) {
    try {
      await this.client.del(this.getCartKey(userId))
      return true
    } catch (error) {
      logger.error('Error deleting cart from Redis', { userId, error: error.message })
      return false
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient()

module.exports = redisClient