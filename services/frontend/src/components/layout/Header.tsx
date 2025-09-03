import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

interface HeaderProps {
  showBackButton?: boolean
  title?: string
}

export default function Header({ showBackButton = false, title }: HeaderProps) {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { getCartItemCount } = useCart()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              🏪 LocalMart
            </button>
            {title && (
              <span className="ml-4 text-lg text-gray-600">• {title}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Products
              </button>
            )}
            
            {/* Cart Section */}
            {isAuthenticated && (
              <button
                onClick={() => navigate('/cart')}
                className="relative text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l-1.5-1.5M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6M9 19h6" />
                </svg>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            )}

            {/* User Authentication Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Hello, {user.name}
                  {user.is_admin && (
                    <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 font-medium transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
            
            <div className="text-sm text-gray-500 border-l border-gray-300 pl-4">
              Phase 3.1.0 - Auth + Microservices
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 