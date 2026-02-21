import { useCallback, useEffect, useState } from "react"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"
import { ApiRequestError, apiClient, type User } from "@/lib/api"
import { mapGetAllEmployeesResponseToMembers } from "@/lib/employee-records"
import {
  LandingPage,
  LoginPage,
  DashboardOverviewPage,
  EmployeeDetailsPage,
} from "@/pages"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

const USER_STORAGE_KEY = "sync-health-user"
const TOKEN_STORAGE_KEY = "sync-health-token"

function readStoredUser(): User | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)

  if (!token || !storedUser) {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    return null
  }

  try {
    const parsed = JSON.parse(storedUser)
    if (!parsed || typeof parsed !== "object") {
      localStorage.removeItem(USER_STORAGE_KEY)
      return null
    }

    return parsed as User
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof ApiRequestError) {
    return error.statusCode === 401
  }

  if (error instanceof Error) {
    return /could not validate credentials|not authenticated|unauthorized/i.test(error.message)
  }

  return false
}

// ============================================================================
// APP ROUTES
// ============================================================================

interface AppRoutesProps {
  isAuthenticated: boolean
  user: User | null
  onLogin: (user: User) => void
  onLogout: () => void
}

function EmployeeDataLoadingState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <p className="text-muted-foreground">Loading employees...</p>
    </div>
  )
}

interface EmployeeDataErrorStateProps {
  message: string
  onRetry: () => Promise<unknown>
}

function EmployeeDataErrorState({ message, onRetry }: EmployeeDataErrorStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-card p-6 text-center space-y-3">
        <p className="font-medium">Could not load employee data.</p>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button onClick={() => { void onRetry() }} variant="outline">
          Retry
        </Button>
      </div>
    </div>
  )
}

function AppRoutes({ isAuthenticated, user, onLogin, onLogout }: AppRoutesProps) {
  const employeesQuery = useQuery({
    queryKey: ["employees", "all", user?.id ?? "anonymous"],
    queryFn: () => apiClient.getAllEmployees(),
    enabled: isAuthenticated,
    select: mapGetAllEmployeesResponseToMembers,
    retry: (failureCount, error) =>
      !isUnauthorizedError(error) && failureCount < 1,
  })
  const hasUnauthorizedError =
    isAuthenticated &&
    employeesQuery.isError &&
    isUnauthorizedError(employeesQuery.error)

  useEffect(() => {
    if (hasUnauthorizedError) {
      onLogout()
    }
  }, [hasUnauthorizedError, onLogout])

  const members = employeesQuery.data ?? []
  const employeeDataError =
    employeesQuery.error instanceof Error
      ? employeesQuery.error.message
      : "An unexpected error occurred while fetching employee records."

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate replace to="/dashboard" /> : <LoginPage onLogin={onLogin} />
      } />
      <Route path="/dashboard" element={
        isAuthenticated ? (
          hasUnauthorizedError ? (
            <Navigate replace to="/login" />
          ) : (
          employeesQuery.isPending ? (
            <EmployeeDataLoadingState />
          ) : employeesQuery.isError ? (
            <EmployeeDataErrorState message={employeeDataError} onRetry={employeesQuery.refetch} />
          ) : (
            <DashboardOverviewPage members={members} user={user!} onLogout={onLogout} />
          )
          )
        ) : (
          <Navigate replace to="/login" />
        )
      } />
      <Route path="/dashboard/employee/:employeeId" element={
        isAuthenticated ? (
          hasUnauthorizedError ? (
            <Navigate replace to="/login" />
          ) : (
          employeesQuery.isPending ? (
            <EmployeeDataLoadingState />
          ) : employeesQuery.isError ? (
            <EmployeeDataErrorState message={employeeDataError} onRetry={employeesQuery.refetch} />
          ) : (
            <EmployeeDetailsPage members={members} />
          )
          )
        ) : (
          <Navigate replace to="/login" />
        )
      } />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}

// ============================================================================
// APP ROOT
// ============================================================================

export function App() {
  const [user, setUser] = useState<User | null>(readStoredUser)
  const isAuthenticated = user !== null && Boolean(localStorage.getItem(TOKEN_STORAGE_KEY))

  const handleLogin = useCallback((userData: User) => {
    setUser(userData)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
  }, [])

  const handleLogout = useCallback(() => {
    apiClient.logout()
    setUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    queryClient.removeQueries({ queryKey: ["employees", "all"] })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="sync-health-theme">
        <BrowserRouter>
          <AppRoutes 
            isAuthenticated={isAuthenticated}
            user={user} 
            onLogin={handleLogin} 
            onLogout={handleLogout} 
          />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
