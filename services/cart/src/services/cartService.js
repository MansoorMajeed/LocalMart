/**
 * Cart business logic service
 */

const redisClient = require('../utils/redis')
const catalogService = require('./catalogService')
const logger = require('../utils/logger')
const config = require('../config')

class CartService {
  /**
   * Get user's cart with product details
   */
  async getCart(userId) {
    try {
      const cart = await redisClient.getCart(userId)
      
      if (!cart.items || cart.items.length === 0) {
        return { items: [], total: 0, itemCount: 0 }
      }

      // Enrich cart items with product details from catalog service
      const productIds = cart.items.map(item => item.productId)
      const products = await catalogService.getProducts(productIds)
      
      // Create product lookup map
      const productMap = new Map()
      products.forEach(product => {
        productMap.set(product.id, product)
      })

      // Enrich cart items with product data
      const enrichedItems = cart.items
        .map(item => {
          const product = productMap.get(item.productId)
          if (!product) {
            logger.warn('Product not found for cart item', { 
              userId, 
              productId: item.productId 
            })
            return null // Filter out invalid items
          }

          return {
            productId: item.productId,
            quantity: item.quantity,
            addedAt: item.addedAt,
            product: {
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              stock_quantity: product.stock_quantity
            },
            subtotal: product.price * item.quantity
          }
        })
        .filter(item => item !== null) // Remove invalid items

      // Calculate total
      const total = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0)
      const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        items: enrichedItems,
        total: Math.round(total * 100) / 100, // Round to 2 decimal places
        itemCount
      }

    } catch (error) {
      logger.error('Error getting cart', { userId, error: error.message })
      throw new Error('Failed to retrieve cart')
    }
  }

  /**
   * Add item to cart
   */
  async addItem(userId, productId, quantity = 1) {
    try {
      // Validate product and stock
      const validation = await catalogService.validateProduct(productId, quantity)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Get current cart
      const cart = await redisClient.getCart(userId)
      
      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId)
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity
        
        // Validate total quantity against stock
        const stockValidation = await catalogService.validateProduct(productId, newQuantity)
        if (!stockValidation.valid) {
          throw new Error(stockValidation.error)
        }
        
        cart.items[existingItemIndex].quantity = newQuantity
        cart.items[existingItemIndex].updatedAt = new Date().toISOString()
      } else {
        // Check cart item limit
        if (cart.items.length >= config.cart.maxItems) {
          throw new Error(`Cart is full. Maximum ${config.cart.maxItems} items allowed`)
        }
        
        // Add new item
        cart.items.push({
          productId,
          quantity,
          addedAt: new Date().toISOString()
        })
      }

      // Save updated cart
      await redisClient.setCart(userId, cart)
      
      logger.info('Item added to cart', { userId, productId, quantity })
      
      // Return updated cart with product details
      return await this.getCart(userId)

    } catch (error) {
      logger.error('Error adding item to cart', { 
        userId, 
        productId, 
        quantity, 
        error: error.message 
      })
      throw error
    }
  }

  /**
   * Update item quantity in cart
   */
  async updateItem(userId, productId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeItem(userId, productId)
      }

      // Validate product and stock
      const validation = await catalogService.validateProduct(productId, quantity)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Get current cart
      const cart = await redisClient.getCart(userId)
      
      // Find item in cart
      const itemIndex = cart.items.findIndex(item => item.productId === productId)
      if (itemIndex === -1) {
        throw new Error('Item not found in cart')
      }

      // Update quantity
      cart.items[itemIndex].quantity = quantity
      cart.items[itemIndex].updatedAt = new Date().toISOString()

      // Save updated cart
      await redisClient.setCart(userId, cart)
      
      logger.info('Cart item updated', { userId, productId, quantity })
      
      // Return updated cart with product details
      return await this.getCart(userId)

    } catch (error) {
      logger.error('Error updating cart item', { 
        userId, 
        productId, 
        quantity, 
        error: error.message 
      })
      throw error
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId, productId) {
    try {
      // Get current cart
      const cart = await redisClient.getCart(userId)
      
      // Remove item
      cart.items = cart.items.filter(item => item.productId !== productId)

      // Save updated cart
      await redisClient.setCart(userId, cart)
      
      logger.info('Item removed from cart', { userId, productId })
      
      // Return updated cart with product details
      return await this.getCart(userId)

    } catch (error) {
      logger.error('Error removing item from cart', { 
        userId, 
        productId, 
        error: error.message 
      })
      throw error
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId) {
    try {
      await redisClient.deleteCart(userId)
      
      logger.info('Cart cleared', { userId })
      
      return { items: [], total: 0, itemCount: 0 }

    } catch (error) {
      logger.error('Error clearing cart', { userId, error: error.message })
      throw new Error('Failed to clear cart')
    }
  }
}

// Create singleton instance
const cartService = new CartService()

module.exports = cartService