/**
 * Cart Context for managing cart state
 */

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Cart } from '../types/api'
import { cartApi } from '../services/cartApi'
import { useAuth } from './AuthContext'

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  error: string | null
  addToCart: (productId: number, quantity?: number) => Promise<void>
  updateCartItem: (productId: number, quantity: number) => Promise<void>
  removeFromCart: (productId: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  getCartItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { isAuthenticated, user } = useAuth()

  // Load cart when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshCart()
    } else {
      // Clear cart when user logs out
      setCart(null)
      setError(null)
    }
  }, [isAuthenticated, user])

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const cartData = await cartApi.getCart()
      setCart(cartData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cart'
      setError(errorMessage)
      console.error('Error loading cart:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart')
    }

    try {
      setError(null)
      const updatedCart = await cartApi.addItem(productId, quantity)
      setCart(updatedCart)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart'
      setError(errorMessage)
      throw err
    }
  }

  const updateCartItem = async (productId: number, quantity: number) => {
    if (!isAuthenticated) return

    try {
      setError(null)
      const updatedCart = await cartApi.updateItem(productId, quantity)
      setCart(updatedCart)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item'
      setError(errorMessage)
      throw err
    }
  }

  const removeFromCart = async (productId: number) => {
    if (!isAuthenticated) return

    try {
      setError(null)
      const updatedCart = await cartApi.removeItem(productId)
      setCart(updatedCart)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from cart'
      setError(errorMessage)
      throw err
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated) return

    try {
      setError(null)
      const clearedCart = await cartApi.clearCart()
      setCart(clearedCart)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart'
      setError(errorMessage)
      throw err
    }
  }

  const getCartItemCount = (): number => {
    return cart?.itemCount || 0
  }

  const contextValue: CartContextType = {
    cart,
    isLoading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    getCartItemCount
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}