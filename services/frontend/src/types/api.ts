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

// Cart Types - matching Node.js cart service
export interface CartItem {
  productId: number
  quantity: number
  addedAt: string
  product: {
    id: number
    name: string
    description: string
    price: number
    stock_quantity: number
  }
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

export interface AddToCartRequest {
  productId: number
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

// Order Types
export interface OrderItem {
  id: number
  productId: number
  productName: string
  productPrice: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: number
  userId: number
  status: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
  itemCount?: number
}

export interface CheckoutRequest {
  shippingAddress: string
  paymentMethod?: string
}

export interface OrdersResponse {
  data: Order[]
  pagination: {
    limit: number
    offset: number
    count: number
  }
}

// API Endpoint Response Types
export type ProductsResponse = PaginatedApiResponse<Product>
export type ProductResponse = ApiResponse<Product>
export type UserResponse = ApiResponse<User>
export type CartResponse = ApiResponse<Cart>
export type OrderResponse = ApiResponse<Order> 