/**
 * Configuration for Cart Service
 */

const config = {
  // Service config
  serviceName: 'cart-service',
  version: '1.0.0',
  port: process.env.CART_PORT || 8082,
  
  // Redis config
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    keyPrefix: 'cart:'
  },
  
  // Database config (PostgreSQL - shared with catalog service)
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'catalog_user',
    password: process.env.DB_PASSWORD || 'catalog_password',
    name: process.env.DB_NAME || 'localmart'
  },
  
  // JWT config (shared with users service)
  jwt: {
    secret: process.env.JWT_SECRET_KEY || 'your-secret-key-change-in-production',
    algorithm: 'HS256'
  },
  
  // External services
  services: {
    catalog: {
      baseUrl: process.env.CATALOG_SERVICE_URL || 'http://catalog:8080',
      timeout: 5000
    },
    users: {
      baseUrl: process.env.USERS_SERVICE_URL || 'http://users:8081',
      timeout: 5000
    }
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'simple'
  },
  
  // Cart settings
  cart: {
    maxItems: 100,
    ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    defaultQuantity: 1
  }
}

module.exports = config