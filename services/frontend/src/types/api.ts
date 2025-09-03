// API Response Types
export interface ApiResponse<T> {
  data: T
}

export interface PaginatedApiResponse<T> {
  data: T[]
  page: number
  limit: number
  count: number
}

// Product Types
export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock_quantity: number
  created_at: string
  updated_at: string
}

// User Types - matching Python users service
export interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface UserUpdateRequest {
  name?: string
  email?: string
}

// API Endpoint Response Types
export type ProductsResponse = PaginatedApiResponse<Product>
export type ProductResponse = ApiResponse<Product>
export type UserResponse = ApiResponse<User> 