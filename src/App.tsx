import { useMemo, useState } from "react"
import {
  Activity,
  HeartPulse,
  LogIn,
  Menu,
  Search,
  ShieldPlus,
  Users,
} from "lucide-react"
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom"

import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { CHOWDECK_MEMBERS } from "@/lib/chowdeck-members"

const DUMMY_EMAIL = "emmanuel@chowdeck.com"

function riskBadgeVariant(risk: "Low" | "Moderate" | "High") {
  if (risk === "High") return "destructive"
  if (risk === "Moderate") return "secondary"
  return "outline"
}

function AppNavigation() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith("/dashboard")

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link className="inline-flex items-center gap-2 rounded-full text-left" to="/">
          <span className="rounded-full bg-primary/12 p-2 text-primary">
            <HeartPulse className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">Sync Health</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {isDashboard ? (
            <>
              <Button render={<NavLink to="/dashboard/admin" />} size="sm" variant="ghost">
                Admin
              </Button>
              <Button render={<NavLink to="/dashboard/staff" />} size="sm" variant="ghost">
                Staff
              </Button>
            </>
          ) : (
            <Button render={<Link to="/dashboard/admin" />} size="sm" variant="ghost">
              Dashboard
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button size="icon" variant="outline" />}>
                <Menu className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isDashboard ? (
                  <>
                    <DropdownMenuItem render={<NavLink to="/dashboard/admin" />}>Admin</DropdownMenuItem>
                    <DropdownMenuItem render={<NavLink to="/dashboard/staff" />}>Staff</DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem render={<Link to="/dashboard/admin" />}>Dashboard</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isDashboard ? (
            <Button render={<Link to="/" />} size="sm" variant="outline">
              Back Home
            </Button>
          ) : (
            <Button render={<Link to="/dashboard/admin" />} size="sm" className="rounded-full px-4">
              <LogIn className="mr-1.5 size-4" />
              Login
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}

function LandingPage() {
  const navigate = useNavigate()

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
      <Card className="border-border/70 bg-card/85">
        <CardHeader className="gap-4">
          <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs">
            Chowdeck Corporate Wellness Console
          </Badge>
          <CardTitle className="text-balance text-2xl leading-tight sm:text-3xl lg:text-4xl">
            Turn employee health data into clear, preventive action.
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm sm:text-base">
            Build early warning signals for chronic disease risk using annual screening data,
            then prioritize who needs intervention first.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button onClick={() => navigate("/dashboard/admin")} className="w-full sm:w-auto" size="lg">
            <LogIn className="mr-2 size-4" />
            Login as {DUMMY_EMAIL}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Card className="border-border/70 bg-card/85">
          <CardHeader className="gap-1">
            <CardDescription>Total workforce modeled</CardDescription>
            <CardTitle className="text-2xl">50 members</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Covers all MVP fields: vitals, lifestyle factors, family history, and risk outputs.
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/85">
          <CardHeader className="gap-1">
            <CardDescription>Risk detection focus</CardDescription>
            <CardTitle className="text-2xl">Early signals</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Highlight employees that need attention before chronic conditions escalate.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
        <Card className="border-border/70 bg-card/85">
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center gap-2">
              <Users className="size-4" /> Team Coverage
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Cross-functional employees across engineering, finance, operations, and growth.
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/85">
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center gap-2">
              <Activity className="size-4" /> Risk Scoring
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Hypertension, diabetes, and cardiovascular probability for each employee.
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/85">
          <CardHeader className="pb-1">
            <CardDescription className="flex items-center gap-2">
              <ShieldPlus className="size-4" /> Action Layer
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Practical recommendations grouped by risk level for wellness admins.
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function AdminDashboardPage() {
  const [query, setQuery] = useState("")

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) return CHOWDECK_MEMBERS

    return CHOWDECK_MEMBERS.filter((member) => {
      return (
        member.fullName.toLowerCase().includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery) ||
        member.department.toLowerCase().includes(normalizedQuery) ||
        member.overallRisk.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [query])

  const totals = useMemo(() => {
    const highRisk = CHOWDECK_MEMBERS.filter((member) => member.overallRisk === "High").length
    const moderateRisk = CHOWDECK_MEMBERS.filter(
      (member) => member.overallRisk === "Moderate"
    ).length
    const lowRisk = CHOWDECK_MEMBERS.filter((member) => member.overallRisk === "Low").length

    const hypertensionAvg = Math.round(
      CHOWDECK_MEMBERS.reduce((acc, member) => acc + member.hypertensionRiskPct, 0) /
        CHOWDECK_MEMBERS.length
    )

    return { highRisk, moderateRisk, lowRisk, hypertensionAvg }
  }, [])

  return (
    <section className="space-y-4 sm:space-y-6">
      <Card className="border-border/70 bg-card/90">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl sm:text-2xl">Chowdeck Admin Dashboard</CardTitle>
            <CardDescription>
              Logged in as {DUMMY_EMAIL} (authentication is mocked for MVP)
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="destructive">High: {totals.highRisk}</Badge>
            <Badge variant="secondary">Moderate: {totals.moderateRisk}</Badge>
            <Badge variant="outline">Low: {totals.lowRisk}</Badge>
            <Badge>Avg Hypertension Risk: {totals.hypertensionAvg}%</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, department, or risk"
              value={query}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Employee Risk Register ({filteredMembers.length})</CardTitle>
          <CardDescription>50 Chowdeck members with complete screening and risk fields.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/70">
            <table className="w-full min-w-[1480px] text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Age</th>
                  <th className="px-3 py-2">BMI</th>
                  <th className="px-3 py-2">Blood Pressure</th>
                  <th className="px-3 py-2">Fasting Glucose</th>
                  <th className="px-3 py-2">Cholesterol</th>
                  <th className="px-3 py-2">Smoking</th>
                  <th className="px-3 py-2">Exercise</th>
                  <th className="px-3 py-2">Family History</th>
                  <th className="px-3 py-2">Stress</th>
                  <th className="px-3 py-2">HTN Risk</th>
                  <th className="px-3 py-2">Diabetes Risk</th>
                  <th className="px-3 py-2">Cardio Risk</th>
                  <th className="px-3 py-2">Overall</th>
                  <th className="px-3 py-2">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    className="border-t border-border/60 align-top transition-colors hover:bg-muted/30"
                    key={member.id}
                  >
                    <td className="space-y-0.5 px-3 py-2">
                      <p className="font-medium">{member.fullName}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </td>
                    <td className="px-3 py-2">{member.department}</td>
                    <td className="px-3 py-2">{member.age}</td>
                    <td className="px-3 py-2">{member.bmi}</td>
                    <td className="px-3 py-2">{member.bloodPressure}</td>
                    <td className="px-3 py-2">{member.fastingBloodGlucoseMgDl} mg/dL</td>
                    <td className="px-3 py-2">{member.cholesterolMgDl} mg/dL</td>
                    <td className="px-3 py-2">{member.smokingStatus}</td>
                    <td className="px-3 py-2">{member.exerciseFrequency}</td>
                    <td className="px-3 py-2">{member.familyHistory}</td>
                    <td className="px-3 py-2">{member.stressLevel}</td>
                    <td className="px-3 py-2">{member.hypertensionRiskPct}%</td>
                    <td className="px-3 py-2">{member.diabetesRiskPct}%</td>
                    <td className="px-3 py-2">{member.cardiovascularRiskPct}%</td>
                    <td className="px-3 py-2">
                      <Badge variant={riskBadgeVariant(member.overallRisk)}>{member.overallRisk}</Badge>
                    </td>
                    <td className="max-w-80 px-3 py-2 text-muted-foreground">{member.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function StaffDashboardPage() {
  return (
    <section className="space-y-4 sm:space-y-6">
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Chowdeck Staff Dashboard</CardTitle>
          <CardDescription>
            Route is live at /dashboard/staff. Staff-facing modules will be implemented next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Current MVP shows core workforce records while we build individualized staff workflows.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Staff Directory Snapshot</CardTitle>
          <CardDescription>50 members currently loaded from the MVP seed dataset.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CHOWDECK_MEMBERS.map((member) => (
              <div className="rounded-xl border border-border/70 p-3" key={member.id}>
                <p className="text-sm font-medium">{member.fullName}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">{member.department}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_45%),radial-gradient(circle_at_90%_0%,color-mix(in_oklch,var(--chart-2)_12%,transparent),transparent_40%)]" />
      <AppNavigation />
      <main className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Navigate replace to="/dashboard/admin" />} />
          <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
          <Route path="/dashboard/staff" element={<StaffDashboardPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
