/**
 * Structured logging for Cart Service
 */

const winston = require('winston')
const config = require('../config')

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    config.logging.format === 'json' 
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
  ),
  defaultMeta: { 
    service: config.serviceName,
    version: config.version
  },
  transports: [
    new winston.transports.Console()
  ]
})

module.exports = logger