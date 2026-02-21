/**
 * API Client for Sync Health Backend
 */

import type {
  ApiError,
  FilterEmployeesParams,
  FilterEmployeesResponse,
  GetAllEmployeesResponse,
  HTTPValidationError,
  LegacyLoginRequest,
  LoginRequest,
  RegisterUserResponse,
  Token,
  UserCreate,
} from "./types"

const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || "https://sync-health-backend-production.up.railway.app"

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    return localStorage.getItem("sync-health-token")
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const error = this.toApiError(response.status, response.statusText, payload)
      throw new Error(error.message || "Request failed")
    }

    return payload as T
  }

  private toApiError(
    statusCode: number,
    fallbackStatusText: string,
    payload: unknown
  ): ApiError {
    let message = fallbackStatusText || "Request failed"
    let details: unknown

    if (payload && typeof payload === "object") {
      const body = payload as Record<string, unknown>
      details = body

      if (typeof body.message === "string" && body.message.trim() !== "") {
        message = body.message
      } else if (typeof body.detail === "string" && body.detail.trim() !== "") {
        message = body.detail
      } else if (Array.isArray(body.detail)) {
        const validationError = payload as HTTPValidationError
        const joined = validationError.detail
          .map((item) => item.msg)
          .filter((msg) => typeof msg === "string" && msg.trim() !== "")
          .join(", ")

        if (joined) {
          message = joined
        }
      }
    }

    return {
      statusCode,
      message,
      details,
    }
  }

  private buildQueryString(params: FilterEmployeesParams): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return
      searchParams.set(key, String(value))
    })

    const query = searchParams.toString()
    return query ? `?${query}` : ""
  }

  // ===========================================================================
  // AUTH
  // ===========================================================================

  async register(payload: UserCreate): Promise<RegisterUserResponse> {
    return this.request<RegisterUserResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async login(credentials: LoginRequest | LegacyLoginRequest): Promise<Token> {
    const usernameOrEmail =
      "username_or_email" in credentials
        ? credentials.username_or_email
        : credentials.email

    const response = await this.request<Token>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username_or_email: usernameOrEmail,
        password: credentials.password,
      }),
    })

    // Store token on successful login
    if (response.access_token) {
      localStorage.setItem("sync-health-token", response.access_token)
    }

    return response
  }

  logout(): void {
    localStorage.removeItem("sync-health-token")
  }

  // ===========================================================================
  // EMPLOYEES
  // ===========================================================================

  async filterEmployees(params: FilterEmployeesParams = {}): Promise<FilterEmployeesResponse> {
    const query = this.buildQueryString(params)
    return this.request<FilterEmployeesResponse>(`/filter/employees${query}`)
  }

  async getAllEmployees(): Promise<GetAllEmployeesResponse> {
    return this.request<GetAllEmployeesResponse>("/filter/employees/all")
  }

  // Backwards-compatible alias
  async getEmployees(): Promise<GetAllEmployeesResponse> {
    return this.getAllEmployees()
  }
}

export const apiClient = new ApiClient(BACKEND_URL)
