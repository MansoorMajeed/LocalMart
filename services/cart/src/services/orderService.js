/**
 * Order business logic service
 */

const database = require('../utils/db')
const cartService = require('./cartService')
const catalogService = require('./catalogService')
const logger = require('../utils/logger')

class OrderService {
  /**
   * Process checkout and create order
   */
  async checkout(userId, checkoutData) {
    const { shippingAddress, paymentMethod = 'credit_card_placeholder' } = checkoutData

    if (!shippingAddress || shippingAddress.trim().length === 0) {
      throw new Error('Shipping address is required')
    }

    return await database.transaction(async (client) => {
      try {
        // Get current cart
        const cart = await cartService.getCart(userId)
        
        if (!cart.items || cart.items.length === 0) {
          throw new Error('Cart is empty')
        }

        // Validate inventory for all items
        const inventoryChecks = await Promise.all(
          cart.items.map(async (item) => {
            const validation = await catalogService.validateProduct(item.productId, item.quantity)
            if (!validation.valid) {
              throw new Error(`${item.product.name}: ${validation.error}`)
            }
            return validation
          })
        )

        // Calculate totals
        const subtotal = cart.total
        const tax = Math.round(subtotal * 0.08 * 100) / 100 // 8% tax
        const shipping = subtotal > 50 ? 0 : 9.99 // Free shipping over $50
        const total = Math.round((subtotal + tax + shipping) * 100) / 100

        // Create order
        const orderResult = await client.query(`
          INSERT INTO orders (user_id, status, subtotal, tax, shipping, total, shipping_address, payment_method)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [userId, 'confirmed', subtotal, tax, shipping, total, shippingAddress, paymentMethod])

        const order = orderResult.rows[0]

        // Create order items
        const orderItemsPromises = cart.items.map(item => 
          client.query(`
            INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            order.id,
            item.productId,
            item.product.name,
            item.product.price,
            item.quantity,
            item.subtotal
          ])
        )

        await Promise.all(orderItemsPromises)

        // Clear the cart
        await cartService.clearCart(userId)

        logger.info('Order created successfully', {
          userId,
          orderId: order.id,
          total: order.total,
          itemCount: cart.items.length
        })

        // Return basic order data (we'll fetch full details later if needed)
        return {
          id: order.id,
          userId: order.user_id,
          status: order.status,
          subtotal: parseFloat(order.subtotal),
          tax: parseFloat(order.tax),
          shipping: parseFloat(order.shipping),
          total: parseFloat(order.total),
          shippingAddress: order.shipping_address,
          paymentMethod: order.payment_method,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          items: cart.items.map(item => ({
            productId: item.productId,
            productName: item.product.name,
            productPrice: item.product.price,
            quantity: item.quantity,
            subtotal: item.subtotal
          }))
        }

      } catch (error) {
        logger.error('Checkout failed', { userId, error: error.message })
        throw error
      }
    })
  }

  /**
   * Get user's order history
   */
  async getUserOrders(userId, limit = 20, offset = 0) {
    try {
      const result = await database.query(`
        SELECT 
          o.*,
          COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset])

      const orders = result.rows.map(row => ({
        id: row.id,
        status: row.status,
        subtotal: parseFloat(row.subtotal),
        tax: parseFloat(row.tax),
        shipping: parseFloat(row.shipping),
        total: parseFloat(row.total),
        shippingAddress: row.shipping_address,
        paymentMethod: row.payment_method,
        itemCount: parseInt(row.item_count),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))

      return orders

    } catch (error) {
      logger.error('Error getting user orders', { userId, error: error.message })
      throw new Error('Failed to retrieve orders')
    }
  }

  /**
   * Get specific order by ID (with user verification)
   */
  async getOrderById(orderId, userId = null) {
    try {
      let query = `
        SELECT o.*, 
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'productId', oi.product_id,
                   'productName', oi.product_name,
                   'productPrice', oi.product_price,
                   'quantity', oi.quantity,
                   'subtotal', oi.subtotal
                 ) ORDER BY oi.id
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1
      `
      
      const params = [orderId]
      
      if (userId) {
        query += ' AND o.user_id = $2'
        params.push(userId)
      }
      
      query += ' GROUP BY o.id'

      const result = await database.query(query, params)

      if (result.rows.length === 0) {
        throw new Error('Order not found')
      }

      const row = result.rows[0]
      
      return {
        id: row.id,
        userId: row.user_id,
        status: row.status,
        subtotal: parseFloat(row.subtotal),
        tax: parseFloat(row.tax),
        shipping: parseFloat(row.shipping),
        total: parseFloat(row.total),
        shippingAddress: row.shipping_address,
        paymentMethod: row.payment_method,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        items: row.items.filter(item => item.id !== null) // Remove null items if no order items
      }

    } catch (error) {
      logger.error('Error getting order', { orderId, userId, error: error.message })
      
      if (error.message === 'Order not found') {
        throw error
      }
      
      throw new Error('Failed to retrieve order')
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, userId = null) {
    try {
      let query = `
        UPDATE orders 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
      `
      
      const params = [status, orderId]
      
      if (userId) {
        query += ' AND user_id = $3'
        params.push(userId)
      }
      
      query += ' RETURNING *'

      const result = await database.query(query, params)

      if (result.rows.length === 0) {
        throw new Error('Order not found or not authorized')
      }

      logger.info('Order status updated', { orderId, status, userId })

      return result.rows[0]

    } catch (error) {
      logger.error('Error updating order status', { orderId, status, userId, error: error.message })
      throw error
    }
  }
}

// Create singleton instance
const orderService = new OrderService()

module.exports = orderService