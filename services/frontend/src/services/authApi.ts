/**
 * Authentication API client for Users Service
 */

import type { 
  AuthResponse, 
  LoginRequest, 
  SignupRequest, 
  User, 
  UserResponse,
  UserUpdateRequest 
} from '../types/api'

const USERS_API_BASE = '/api/users/v1'

// JWT Token management
export const tokenStorage = {
  getToken: (): string | null => {
    return localStorage.getItem('auth_token')
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token)
  },
  
  removeToken: (): void => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  },
  
  getUser: (): User | null => {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  },
  
  setUser: (user: User): void => {
    localStorage.setItem('user_data', JSON.stringify(user))
  }
}

// Auth headers helper
const getAuthHeaders = (): Record<string, string> => {
  const token = tokenStorage.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// Auth API functions
export const authApi = {
  /**
   * User signup - creates account and returns JWT token
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${USERS_API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Signup failed' }))
      throw new Error(error.detail || 'Signup failed')
    }
    
    const authData: AuthResponse = await response.json()
    
    // Store token and user data
    tokenStorage.setToken(authData.access_token)
    tokenStorage.setUser(authData.user)
    
    return authData
  },
  
  /**
   * User login - authenticates and returns JWT token
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${USERS_API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }))
      throw new Error(error.detail || 'Invalid email or password')
    }
    
    const authData: AuthResponse = await response.json()
    
    // Store token and user data
    tokenStorage.setToken(authData.access_token)
    tokenStorage.setUser(authData.user)
    
    return authData
  },
  
  /**
   * User logout - clears local storage
   */
  logout(): void {
    tokenStorage.removeToken()
  },
  
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${USERS_API_BASE}/users/me`, {
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear storage
        tokenStorage.removeToken()
        throw new Error('Session expired')
      }
      throw new Error('Failed to get user profile')
    }
    
    const userData: UserResponse = await response.json()
    
    // Update stored user data
    tokenStorage.setUser(userData.data)
    
    return userData.data
  },
  
  /**
   * Update current user profile
   */
  async updateProfile(data: UserUpdateRequest): Promise<User> {
    const response = await fetch(`${USERS_API_BASE}/users/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Update failed' }))
      throw new Error(error.detail || 'Failed to update profile')
    }
    
    const userData: UserResponse = await response.json()
    
    // Update stored user data
    tokenStorage.setUser(userData.data)
    
    return userData.data
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenStorage.getToken()
  },
  
  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    return tokenStorage.getUser()
  }
}