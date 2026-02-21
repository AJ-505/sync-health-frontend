/**
 * API Types for Sync Health Backend
 * Aligned with the provided FastAPI OpenAPI contract.
 */

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface UserCreate {
  username: string
  email: string
  password: string
  phone_number: string
}

export interface LoginRequest {
  username_or_email: string
  password: string
}

/**
 * Backward-compatible shape for callers that still send `email`.
 * The client normalizes this to `username_or_email` before sending.
 */
export interface LegacyLoginRequest {
  email: string
  password: string
}

export interface Token {
  access_token: string
  token_type: string
  role?: string
}

/**
 * Frontend session user used by UI state.
 * This is derived client-side because `/auth/login` returns token + role only.
 */
export interface User {
  id: string
  name: string
  email: string
  role: string
  organization: string
}

export type RegisterUserResponse = unknown

// =============================================================================
// EMPLOYEE / FILTER TYPES
// =============================================================================

export interface FilterEmployeesParams {
  gender?: string | null
  department?: string | null
  age?: number | null
  min_age?: number | null
  max_age?: number | null
  weight?: number | null
  min_weight?: number | null
  max_weight?: number | null
}

export type FilterEmployeesResponse = unknown
export type GetAllEmployeesResponse = unknown

// =============================================================================
// API ERROR TYPES
// =============================================================================

export interface ValidationError {
  loc: Array<string | number>
  msg: string
  type: string
  input?: unknown
  ctx?: Record<string, unknown>
}

export interface HTTPValidationError {
  detail: ValidationError[]
}

export interface ApiError {
  statusCode: number
  message: string
  details?: unknown
}
