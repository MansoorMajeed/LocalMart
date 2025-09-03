/**
 * Orders API routes
 */

const express = require('express')
const orderService = require('../services/orderService')
const { authenticateToken } = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

/**
 * GET /api/v1/orders
 * Get user's order history
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0

    // Validation
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Limit must be between 1 and 100'
      })
    }

    if (offset < 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Offset must be non-negative'
      })
    }

    const orders = await orderService.getUserOrders(req.user.id, limit, offset)
    
    res.json({
      data: orders,
      pagination: {
        limit,
        offset,
        count: orders.length
      }
    })

  } catch (error) {
    logger.error('Error getting user orders', { 
      userId: req.user.id, 
      query: req.query,
      error: error.message 
    })
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve orders'
    })
  }
})

/**
 * GET /api/v1/orders/:orderId
 * Get specific order details
 */
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId)

    // Validation
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Order ID must be a positive integer'
      })
    }

    const order = await orderService.getOrderById(orderId, req.user.id)
    
    res.json({
      data: order
    })

  } catch (error) {
    logger.error('Error getting order', { 
      userId: req.user.id, 
      orderId: req.params.orderId,
      error: error.message 
    })
    
    if (error.message === 'Order not found') {
      res.status(404).json({
        error: 'Not found',
        message: 'Order not found'
      })
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve order'
      })
    }
  }
})

module.exports = router