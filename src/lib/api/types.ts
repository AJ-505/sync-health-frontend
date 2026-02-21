/**
 * API Types for Sync Health Backend
 * 
 * TODO: Verify these types against actual backend responses once the backend is up.
 * Run curl commands to confirm the exact response shapes.
 */

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface LoginRequest {
  email: string
  password: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  organization: string
}

export interface LoginResponse {
  token: string
  user: User
}

// =============================================================================
// EMPLOYEE / FILTER TYPES
// =============================================================================

/** 
 * Employee record from /filter/all endpoint
 * TODO: Confirm field names and types with backend
 */
export interface EmployeeRecord {
  id: string
  fullName: string
  email: string
  age: number
  gender: "Male" | "Female"
  department: string
  weight: number
  bmi: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  fastingBloodGlucose: number
  cholesterol: number
  smokingStatus: string
  exerciseFrequency: string
  overallRisk: "Low" | "Moderate" | "High"
  hypertensionRisk: number
  diabetesRisk: number
  cardiovascularRisk: number
}

export interface FilterAllResponse {
  employees: EmployeeRecord[]
}

// =============================================================================
// API ERROR
// =============================================================================

export interface ApiError {
  status: "error"
  code: number
  message: string
  request_id?: string
}
