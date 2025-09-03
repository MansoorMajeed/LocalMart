/**
 * Service for communicating with Catalog microservice
 */

const axios = require('axios')
const config = require('../config')
const logger = require('../utils/logger')

class CatalogService {
  constructor() {
    this.baseUrl = config.services.catalog.baseUrl
    this.timeout = config.services.catalog.timeout
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Catalog service request', {
          method: config.method,
          url: config.url,
          data: config.data
        })
        return config
      },
      (error) => {
        logger.error('Catalog service request error', { error: error.message })
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Catalog service response', {
          status: response.status,
          url: response.config.url
        })
        return response
      },
      (error) => {
        logger.error('Catalog service response error', {
          status: error.response?.status,
          url: error.config?.url,
          error: error.message
        })
        return Promise.reject(error)
      }
    )
  }

  /**
   * Get product by ID from catalog service
   */
  async getProduct(productId) {
    try {
      const response = await this.client.get(`/api/v1/products/${productId}`)
      return response.data.data // Extract product from API response wrapper
    } catch (error) {
      if (error.response?.status === 404) {
        logger.warn('Product not found', { productId })
        return null
      }
      logger.error('Error fetching product from catalog', { 
        productId, 
        error: error.message 
      })
      throw new Error(`Failed to fetch product ${productId}`)
    }
  }

  /**
   * Get multiple products by IDs
   */
  async getProducts(productIds) {
    try {
      const products = await Promise.allSettled(
        productIds.map(id => this.getProduct(id))
      )

      const results = []
      products.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value)
        } else {
          logger.warn('Failed to fetch product', { 
            productId: productIds[index],
            error: result.reason?.message 
          })
        }
      })

      return results
    } catch (error) {
      logger.error('Error fetching multiple products', { 
        productIds, 
        error: error.message 
      })
      throw new Error('Failed to fetch products')
    }
  }

  /**
   * Check if product exists and has sufficient stock
   */
  async validateProduct(productId, quantity = 1) {
    try {
      const product = await this.getProduct(productId)
      
      if (!product) {
        return { valid: false, error: 'Product not found' }
      }

      if (product.stock_quantity < quantity) {
        return { 
          valid: false, 
          error: 'Insufficient stock',
          available: product.stock_quantity
        }
      }

      return { valid: true, product }
    } catch (error) {
      logger.error('Error validating product', { 
        productId, 
        quantity, 
        error: error.message 
      })
      return { valid: false, error: 'Unable to validate product' }
    }
  }
}

// Create singleton instance
const catalogService = new CatalogService()

module.exports = catalogService