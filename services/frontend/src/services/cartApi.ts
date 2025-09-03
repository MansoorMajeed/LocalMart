/**
 * Cart API client for Cart Service (Node.js)
 */

import type { 
  Cart, 
  CartResponse, 
  AddToCartRequest, 
  UpdateCartItemRequest 
} from '../types/api'
import { tokenStorage } from './authApi'

const CART_API_BASE = '/api/cart/v1'

// Auth headers helper
const getAuthHeaders = (): Record<string, string> => {
  const token = tokenStorage.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// Cart API functions
export const cartApi = {
  /**
   * Get user's cart
   */
  async getCart(): Promise<Cart> {
    const response = await fetch(`${CART_API_BASE}/cart`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please login to view your cart')
      }
      throw new Error('Failed to get cart')
    }
    
    const cartData: CartResponse = await response.json()
    return cartData.data
  },
  
  /**
   * Add item to cart
   */
  async addItem(productId: number, quantity: number = 1): Promise<Cart> {
    const data: AddToCartRequest = { productId, quantity }
    
    const response = await fetch(`${CART_API_BASE}/cart/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to add item to cart' }))
      throw new Error(error.message || 'Failed to add item to cart')
    }
    
    const cartData: CartResponse = await response.json()
    return cartData.data
  },
  
  /**
   * Update item quantity in cart
   */
  async updateItem(productId: number, quantity: number): Promise<Cart> {
    const data: UpdateCartItemRequest = { quantity }
    
    const response = await fetch(`${CART_API_BASE}/cart/items/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update cart item' }))
      throw new Error(error.message || 'Failed to update cart item')
    }
    
    const cartData: CartResponse = await response.json()
    return cartData.data
  },
  
  /**
   * Remove item from cart
   */
  async removeItem(productId: number): Promise<Cart> {
    const response = await fetch(`${CART_API_BASE}/cart/items/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to remove item from cart' }))
      throw new Error(error.message || 'Failed to remove item from cart')
    }
    
    const cartData: CartResponse = await response.json()
    return cartData.data
  },
  
  /**
   * Clear entire cart
   */
  async clearCart(): Promise<Cart> {
    const response = await fetch(`${CART_API_BASE}/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to clear cart' }))
      throw new Error(error.message || 'Failed to clear cart')
    }
    
    const cartData: CartResponse = await response.json()
    return cartData.data
  }
}