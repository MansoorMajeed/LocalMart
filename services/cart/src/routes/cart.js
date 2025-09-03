/**
 * Cart API routes
 */

const express = require('express')
const cartService = require('../services/cartService')
const { authenticateToken } = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

/**
 * GET /api/v1/cart
 * Get user's cart
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id)
    
    res.json({
      data: cart
    })

  } catch (error) {
    logger.error('Error getting cart', { 
      userId: req.user.id, 
      error: error.message 
    })
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve cart'
    })
  }
})

/**
 * POST /api/v1/cart/items
 * Add item to cart
 */
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    // Validation
    if (!productId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Product ID is required'
      })
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Product ID must be a positive integer'
      })
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Quantity must be a positive integer'
      })
    }

    const cart = await cartService.addItem(req.user.id, productId, quantity)
    
    res.status(201).json({
      data: cart,
      message: 'Item added to cart'
    })

  } catch (error) {
    logger.error('Error adding item to cart', { 
      userId: req.user.id, 
      body: req.body,
      error: error.message 
    })
    
    // Handle business logic errors vs system errors
    if (error.message.includes('not found') || 
        error.message.includes('stock') || 
        error.message.includes('full')) {
      res.status(400).json({
        error: 'Bad request',
        message: error.message
      })
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to add item to cart'
      })
    }
  }
})

/**
 * PUT /api/v1/cart/items/:productId
 * Update item quantity in cart
 */
router.put('/items/:productId', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId)
    const { quantity } = req.body

    // Validation
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Product ID must be a positive integer'
      })
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Quantity must be a non-negative integer'
      })
    }

    const cart = await cartService.updateItem(req.user.id, productId, quantity)
    
    res.json({
      data: cart,
      message: quantity === 0 ? 'Item removed from cart' : 'Item quantity updated'
    })

  } catch (error) {
    logger.error('Error updating cart item', { 
      userId: req.user.id, 
      params: req.params,
      body: req.body,
      error: error.message 
    })
    
    if (error.message.includes('not found') || 
        error.message.includes('stock')) {
      res.status(400).json({
        error: 'Bad request',
        message: error.message
      })
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update cart item'
      })
    }
  }
})

/**
 * DELETE /api/v1/cart/items/:productId
 * Remove item from cart
 */
router.delete('/items/:productId', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId)

    // Validation
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Product ID must be a positive integer'
      })
    }

    const cart = await cartService.removeItem(req.user.id, productId)
    
    res.json({
      data: cart,
      message: 'Item removed from cart'
    })

  } catch (error) {
    logger.error('Error removing cart item', { 
      userId: req.user.id, 
      params: req.params,
      error: error.message 
    })
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to remove item from cart'
    })
  }
})

/**
 * DELETE /api/v1/cart
 * Clear entire cart
 */
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user.id)
    
    res.json({
      data: cart,
      message: 'Cart cleared'
    })

  } catch (error) {
    logger.error('Error clearing cart', { 
      userId: req.user.id, 
      error: error.message 
    })
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to clear cart'
    })
  }
})

module.exports = router