/**
 * API Client for Sync Health Backend
 */

import type { LoginRequest, LoginResponse, FilterAllResponse, ApiError } from "./types"

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

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        status: "error",
        code: response.status,
        message: response.statusText,
      }))
      throw new Error(error.message || "Request failed")
    }

    return response.json()
  }

  // ===========================================================================
  // AUTH
  // ===========================================================================

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    // Store token on successful login
    if (response.token) {
      localStorage.setItem("sync-health-token", response.token)
    }

    return response
  }

  logout(): void {
    localStorage.removeItem("sync-health-token")
  }

  // ===========================================================================
  // EMPLOYEES
  // ===========================================================================

  async getEmployees(): Promise<FilterAllResponse> {
    return this.request<FilterAllResponse>("/filter/all")
  }
}

export const apiClient = new ApiClient(BACKEND_URL)
