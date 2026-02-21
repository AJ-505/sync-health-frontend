import { useState } from "react"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ThemeProvider } from "@/components/theme-provider"
import { CHOWDECK_MEMBERS, type MemberRiskRecord } from "@/lib/chowdeck-members"
import type { User } from "@/lib/api"
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

// ============================================================================
// APP ROUTES
// ============================================================================

interface AppRoutesProps {
  members: MemberRiskRecord[]
  user: User | null
  onLogin: (user: User) => void
  onLogout: () => void
}

function AppRoutes({ members, user, onLogin, onLogout }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        user ? <Navigate replace to="/dashboard" /> : <LoginPage onLogin={onLogin} />
      } />
      <Route path="/dashboard" element={
        user ? (
          <DashboardOverviewPage members={members} user={user} onLogout={onLogout} />
        ) : (
          <Navigate replace to="/login" />
        )
      } />
      <Route path="/dashboard/employee/:employeeId" element={
        user ? (
          <EmployeeDetailsPage members={members} />
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
  const [members] = useState<MemberRiskRecord[]>(CHOWDECK_MEMBERS)
  const [user, setUser] = useState<User | null>(() => {
    // Check if user data exists in localStorage
    const stored = localStorage.getItem("sync-health-user")
    return stored ? JSON.parse(stored) : null
  })

  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem("sync-health-user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("sync-health-user")
    localStorage.removeItem("sync-health-token")
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="sync-health-theme">
        <BrowserRouter>
          <AppRoutes 
            members={members} 
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
