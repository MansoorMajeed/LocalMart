/**
 * PostgreSQL database utility
 */

const { Pool } = require('pg')
const logger = require('./logger')
const config = require('../config')

class Database {
  constructor() {
    this.pool = null
  }

  async connect() {
    try {
      this.pool = new Pool({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.name,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })

      // Test connection
      const client = await this.pool.connect()
      await client.query('SELECT NOW()')
      client.release()

      logger.info('Connected to PostgreSQL database', {
        host: config.db.host,
        database: config.db.name
      })

      // Initialize schema
      await this.initializeSchema()

    } catch (error) {
      logger.error('Failed to connect to database', { error: error.message })
      throw error
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end()
      logger.info('Disconnected from PostgreSQL database')
    }
  }

  async query(text, params) {
    if (!this.pool) {
      throw new Error('Database not connected')
    }

    const start = Date.now()
    const client = await this.pool.connect()
    
    try {
      const result = await client.query(text, params)
      const duration = Date.now() - start
      
      logger.debug('Database query executed', {
        duration: `${duration}ms`,
        rows: result.rowCount
      })
      
      return result
    } finally {
      client.release()
    }
  }

  async transaction(callback) {
    if (!this.pool) {
      throw new Error('Database not connected')
    }

    const client = await this.pool.connect()
    
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async initializeSchema() {
    try {
      logger.info('Initializing database schema...')

      // Create orders table
      await this.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          subtotal DECIMAL(10,2) NOT NULL,
          tax DECIMAL(10,2) DEFAULT 0,
          shipping DECIMAL(10,2) DEFAULT 0,
          total DECIMAL(10,2) NOT NULL,
          shipping_address TEXT NOT NULL,
          payment_method VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `)

      // Create order_items table
      await this.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL,
          product_name VARCHAR(255) NOT NULL,
          product_price DECIMAL(10,2) NOT NULL,
          quantity INTEGER NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL
        )
      `)

      // Create indexes
      await this.query(`
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)
      `)
      
      await this.query(`
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)
      `)
      
      await this.query(`
        CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)
      `)

      logger.info('Database schema initialized successfully')

    } catch (error) {
      logger.error('Failed to initialize database schema', { error: error.message })
      throw error
    }
  }
}

// Create singleton instance
const database = new Database()

module.exports = database