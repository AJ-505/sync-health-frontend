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

export interface EmployeeFamilyHistory {
  asthma?: boolean | null
  cancer?: boolean | null
  diabetes?: boolean | null
  heart_disease?: boolean | null
  hypertension?: boolean | null
  stroke?: boolean | null
}

export interface EmployeeHealth {
  bmi?: number | null
  weight_kg?: number | null
  fasting_glucose_mg_dl?: number | null
  total_cholesterol_mg_dl?: number | null
  blood_pressure_systolic?: number | null
  blood_pressure_diastolic?: number | null
  smokes?: boolean | null
  cigarettes_per_day?: number | null
  exercise_days_per_week?: number | null
  stress_level_1_10?: number | null
  family_history?: EmployeeFamilyHistory | null
  past_conditions?: string[] | null
  current_conditions?: string[] | null
  risk_flags?: string[] | null
}

export interface Employee {
  org_id?: number
  name?: string | null
  gender?: string | null
  department?: string | null
  job_level?: string | null
  marital_status?: string | null
  summary?: string | null
  dob?: string | null
  employee_id?: string | null
  location_city?: string | null
  health?: EmployeeHealth | null
}

export interface GetAllEmployeesResponse {
  count: number
  employees: Employee[]
}

export type FilterEmployeesResponse = GetAllEmployeesResponse

// =============================================================================
// AI TYPES
// =============================================================================

export interface AIAnalyseRequest {
  prompt: string
}

/**
 * A single scored employee from the backend AI pipeline.
 * The backend returns risk_probability as a 0-1 float.
 */
export interface AIScoredEmployee {
  employee_id: string
  risk_probability: number
  confidence: string
  evidence: string[]
}

/**
 * Structured response from POST /ai/analyse.
 * The backend returns this JSON when the prompt is health-related.
 * When the prompt is NOT health-related, the backend returns a plain string.
 */
export interface AIAnalyseStructuredResponse {
  condition: string
  scored_employees: AIScoredEmployee[]
}

/**
 * The endpoint can return either a structured object (health query)
 * or a plain string (non-health query / classification failure).
 */
export type AIAnalyseResponse = AIAnalyseStructuredResponse | string

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

/**
 * Represents a single employee's AI-derived risk score for a specific disease.
 * Resolved client-side from the backend's scored_employees.
 */
export interface AIRiskEntry {
  /** Employee ID from the backend (e.g. "CS-0007") */
  employeeId: string
  /** Resolved display name from MemberRiskRecord */
  employeeName: string
  /** Matched MemberRiskRecord id */
  memberId: string | null
  /** Risk score percentage (0-100) */
  riskScore: number
  /** Confidence level from AI */
  confidence: string
  /** Evidence strings from AI */
  evidence: string[]
}

/**
 * The parsed result of an AI risk analysis response.
 * Passed from the chat sidebar to the dashboard to drive the filtered table view.
 */
export interface AIRiskFilterData {
  /** The disease/condition the user asked about */
  disease: string
  /** Employees with their risk scores, sorted descending */
  entries: AIRiskEntry[]
  /** The raw AI response for reference */
  rawResponse: string
}

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
