/**
 * Authentication Context for managing user state
 */

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types/api'
import { authApi } from '../services/authApi'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a stored token
        if (authApi.isAuthenticated()) {
          // Try to get current user data
          const userData = await authApi.getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        // Token might be expired, clear it
        authApi.logout()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const authData = await authApi.login({ email, password })
      setUser(authData.user)
    } catch (error) {
      throw error // Re-throw to let components handle the error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const authData = await authApi.signup({ name, email, password })
      setUser(authData.user)
    } catch (error) {
      throw error // Re-throw to let components handle the error
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  const updateProfile = async (data: { name?: string; email?: string }) => {
    try {
      const updatedUser = await authApi.updateProfile(data)
      setUser(updatedUser)
    } catch (error) {
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      if (authApi.isAuthenticated()) {
        const userData = await authApi.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      // Token might be expired
      logout()
      throw error
    }
  }

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    refreshUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}