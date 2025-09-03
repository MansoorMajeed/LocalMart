/**
 * Auth Guard Component - protects routes that require authentication
 */

import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Loading from '../ui/Loading'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-8">
              You need to be logged in to access this page.
            </p>
            <div className="space-x-4">
              <a
                href="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
              >
                Login
              </a>
              <a
                href="/signup"
                className="text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}