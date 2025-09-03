import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../../types/api'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          <div className="text-right">
            <span className={`text-sm px-2 py-1 rounded-full ${
              product.stock_quantity > 10 
                ? 'bg-green-100 text-green-800' 
                : product.stock_quantity > 0 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {product.stock_quantity > 10 
                ? `${product.stock_quantity} in stock` 
                : product.stock_quantity > 0 
                ? `Only ${product.stock_quantity} left!`
                : 'Out of stock'
              }
            </span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <button 
            onClick={() => navigate(`/product/${product.id}`)}
            className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            View Details
          </button>
          
          {product.stock_quantity > 0 && (
            <button 
              onClick={async () => {
                if (!isAuthenticated) {
                  navigate('/login')
                  return
                }
                
                try {
                  setIsAddingToCart(true)
                  await addToCart(product.id, 1)
                } catch (error) {
                  console.error('Failed to add to cart:', error)
                } finally {
                  setIsAddingToCart(false)
                }
              }}
              disabled={isAddingToCart}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 