import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  ChevronDown,
  ChevronLeft,
  FileSpreadsheet,
  Filter,
  Heart,
  HeartPulse,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Send,
  Settings,
  Shield,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  Users,
  X,
  Zap,
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
  useParams,
  useSearchParams,
} from "react-router-dom"

import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { CHOWDECK_MEMBERS, type MemberRiskRecord, type RiskLevel } from "@/lib/chowdeck-members"
import { importMembersFromSpreadsheet } from "@/lib/member-import"

const COMPANY_NAME = "Chowdeck"

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const config = {
    Low: {
      className: "bg-success/15 text-success border-success/30 glow-success",
      icon: <TrendingDown className="size-3" />,
    },
    Moderate: {
      className: "bg-warning/15 text-warning border-warning/30 glow-warning",
      icon: <Activity className="size-3" />,
    },
    High: {
      className: "bg-destructive/15 text-destructive border-destructive/30 glow-destructive",
      icon: <AlertTriangle className="size-3" />,
    },
  }
  
  const { className, icon } = config[risk]
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
      {icon}
      {risk}
    </span>
  )
}

function MetricRing({ 
  value, 
  maxValue = 100, 
  size = 80, 
  strokeWidth = 6,
  risk,
}: { 
  value: number
  maxValue?: number
  size?: number
  strokeWidth?: number
  risk: RiskLevel
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / maxValue, 1)
  const offset = circumference * (1 - progress)
  
  const colorMap = {
    Low: "stroke-success",
    Moderate: "stroke-warning",
    High: "stroke-destructive",
  }
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${colorMap[risk]} animate-ring-fill`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="metric-value text-lg font-semibold">{value}%</span>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  trend,
  className = "",
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon: typeof Activity
  trend?: { value: number; positive: boolean }
  className?: string
}) {
  return (
    <Card className={`border-border/50 bg-card/80 backdrop-blur-sm transition-smooth hover:border-primary/30 hover:shadow-lg ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="metric-value text-3xl font-bold tracking-tight">{value}</span>
              {trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.positive ? 'text-success' : 'text-destructive'}`}>
                  {trend.positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

function SidebarNav({ 
  isOpen, 
  onClose,
  isCollapsed,
  onToggleCollapse,
  currentPath,
}: { 
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  currentPath: string
}) {
  const navItems = [
    { path: "/dashboard", icon: Users, label: "Dashboard", exact: true },
    { path: "/dashboard/stats", icon: BarChart3, label: "Stats & Insights" },
    // { path: "/dashboard/staff", icon: User, label: "Staff Portal" }, // Commented out for later
    { path: "/dashboard/recommendations", icon: Zap, label: "Interventions" },
  ]
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transform border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link to="/" className={`flex items-center gap-3 group ${isCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md group-hover:blur-lg transition-all" />
                <div className="relative rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2.5 shadow-lg">
                  <HeartPulse className="size-5 text-primary-foreground" />
                </div>
              </div>
              {!isCollapsed && (
                <div>
                  <span className="text-lg font-semibold tracking-tight">Sync Health</span>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Wellness Intelligence</span>
                </div>
              )}
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={onClose}
            >
              <X className="size-5" />
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? currentPath === item.path 
                : currentPath.startsWith(item.path)
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-smooth
                    ${isCollapsed ? 'justify-center' : ''}
                    ${isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' 
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    }
                  `}
                >
                  <item.icon className={`size-5 ${isActive ? 'text-primary' : ''}`} />
                  {!isCollapsed && item.label}
                </NavLink>
              )
            })}
          </nav>
          
          {/* Collapse Toggle */}
          <div className="hidden lg:block border-t border-sidebar-border p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'}`}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="size-5" />
              ) : (
                <>
                  <PanelLeftClose className="size-5 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
          
          {/* User section */}
          <div className="border-t border-sidebar-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-smooth hover:bg-sidebar-accent/50 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="size-5" />
                </div>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Emmanuel O.</p>
                      <p className="text-xs text-muted-foreground truncate">{COMPANY_NAME} Admin</p>
                    </div>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link to="/" />}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  )
}

function DashboardHeader({ 
  onMenuClick,
  title,
  subtitle,
}: { 
  onMenuClick: () => void
  title: string
  subtitle?: string
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={onMenuClick}
          >
            <Menu className="size-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const pageConfig: Record<string, { title: string; subtitle?: string }> = {
    "/dashboard": { title: "Sync Health", subtitle: "Welcome, Emmanuel" },
    "/dashboard/stats": { title: "Stats & Insights", subtitle: "Workforce health analytics" },
    // "/dashboard/staff": { title: "Staff Portal", subtitle: "Individual health insights" },
    "/dashboard/recommendations": { title: "Interventions", subtitle: "Prevention recommendations by risk tier" },
  }
  
  const config = pageConfig[location.pathname] || { title: "Dashboard" }
  
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={location.pathname}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader 
          onMenuClick={() => setSidebarOpen(true)} 
          title={config.title}
          subtitle={config.subtitle}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// ============================================================================
// PAGE COMPONENTS
// ============================================================================

function LandingPage() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md group-hover:blur-lg transition-all" />
              <div className="relative rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2.5 shadow-lg">
                <HeartPulse className="size-5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xl font-semibold tracking-tight">Sync Health</span>
          </Link>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="hidden sm:inline-flex shadow-lg shadow-primary/20"
            >
              Dashboard
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </nav>
      </header>
      
      {/* Hero */}
      <section className="relative z-10 px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left column - Copy */}
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
                <Zap className="size-4" />
                <span className="font-medium">Predictive Health Analytics</span>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Syncing Data into{" "}
                <span className="text-primary">Protection</span>
              </h1>
              
              <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                Using AI to turn silent health records into proactive lifesavers. 
                Identify high-risk employees and trigger interventions before conditions escalate.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/dashboard")}
                  className="shadow-lg shadow-primary/25 text-base"
                >
                  Launch Dashboard
                  <ArrowUpRight className="ml-2 size-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base"
                >
                  View Demo Data
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                <div className="text-center">
                  <p className="metric-value text-2xl font-bold">50+</p>
                  <p className="text-xs text-muted-foreground">Employees Modeled</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="metric-value text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Risk Categories</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="metric-value text-2xl font-bold">Real-time</p>
                  <p className="text-xs text-muted-foreground">Risk Scoring</p>
                </div>
              </div>
            </div>
            
            {/* Right column - Visual */}
            <div className="relative animate-slide-up stagger-2">
              <div className="relative rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm shadow-2xl">
                {/* Mock dashboard preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Risk Overview</p>
                      <p className="text-lg font-semibold">Workforce Health Score</p>
                    </div>
                    <div className="rounded-full bg-success/15 px-3 py-1.5 text-sm font-medium text-success">
                      72% Healthy
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Low Risk", value: 28, color: "bg-success" },
                      { label: "Moderate", value: 15, color: "bg-warning" },
                      { label: "High Risk", value: 7, color: "bg-destructive" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-muted/50 p-3">
                        <div className={`mb-2 size-2 rounded-full ${item.color}`} />
                        <p className="metric-value text-xl font-bold">{item.value}</p>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Hypertension Risk Distribution</span>
                      <span>Avg: 42%</span>
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full bg-muted/50">
                      <div className="bg-success" style={{ width: '56%' }} />
                      <div className="bg-warning" style={{ width: '30%' }} />
                      <div className="bg-destructive" style={{ width: '14%' }} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 animate-slide-in-right stagger-3">
                <div className="rounded-xl border border-success/30 bg-card/90 p-3 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-success/15 p-2">
                      <TrendingDown className="size-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">This Month</p>
                      <p className="text-sm font-medium text-success">-12% Risk</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 animate-slide-in-right stagger-4">
                <div className="rounded-xl border border-primary/30 bg-card/90 p-3 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/15 p-2">
                      <Shield className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Interventions</p>
                      <p className="text-sm font-medium">15 Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="relative z-10 border-t border-border/30 bg-card/30 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From Data to Prevention
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete platform for corporate wellness intelligence
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Risk Scoring",
                description: "Calculate hypertension, diabetes, and cardiovascular risk probability from screening data.",
              },
              {
                icon: Users,
                title: "Team Coverage",
                description: "Cross-functional employee analytics across engineering, finance, operations, and growth teams.",
              },
              {
                icon: Shield,
                title: "Prevention Engine",
                description: "Risk-based interventions from lifestyle tips to clinic referrals based on severity.",
              },
              {
                icon: FileSpreadsheet,
                title: "Easy Import",
                description: "Upload employee CSV or Excel files. AI extraction coming for PDF health documents.",
              },
              {
                icon: Activity,
                title: "Real-time Analytics",
                description: "Live dashboard updates as new screening data flows in from annual checkups.",
              },
              {
                icon: Heart,
                title: "Employee Wellness",
                description: "Individual staff portal for personal health insights and intervention tracking.",
              },
            ].map((feature, i) => (
              <Card 
                key={feature.title}
                className={`border-border/50 bg-card/60 backdrop-blur-sm transition-smooth hover:border-primary/30 hover:shadow-lg animate-slide-up stagger-${i + 1}`}
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform your workforce health?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start analyzing your employee health data today. No complex setup required.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/dashboard")}
            className="mt-8 shadow-lg shadow-primary/25"
          >
            Get Started Now
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}

function DashboardOverviewPage({ members }: { members: MemberRiskRecord[] }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const tableRef = useRef<HTMLDivElement>(null)
  const [showScrollHint, setShowScrollHint] = useState(true)
  
  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const handleSearchChange = useCallback((value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value.trim() === "") {
      next.delete("q")
    } else {
      next.set("q", value)
    }
    setSearchParams(next, { replace: true })
    
    // Debounce the actual filtering
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(value)
    }, 300)
  }, [searchParams, setSearchParams])
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    bmiMin: "",
    bmiMax: "",
    bpSystolicMin: "",
    bpSystolicMax: "",
    glucoseMin: "",
    glucoseMax: "",
    cholesterolMin: "",
    cholesterolMax: "",
    pastDiseases: [] as string[],
  })
  
  // Hide scroll hint when user scrolls
  useEffect(() => {
    const table = tableRef.current
    if (!table) return
    
    const handleScroll = () => {
      if (table.scrollTop > 20) {
        setShowScrollHint(false)
      }
    }
    
    table.addEventListener("scroll", handleScroll)
    return () => table.removeEventListener("scroll", handleScroll)
  }, [])

  const filteredMembers = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase()

    return members.filter((member) => {
      // Text search
      if (normalizedQuery) {
        const matchesText = 
          member.fullName.toLowerCase().includes(normalizedQuery) ||
          member.department.toLowerCase().includes(normalizedQuery) ||
          member.overallRisk.toLowerCase().includes(normalizedQuery)
        if (!matchesText) return false
      }
      
      // BMI filter
      if (filters.bmiMin && member.bmi < parseFloat(filters.bmiMin)) return false
      if (filters.bmiMax && member.bmi > parseFloat(filters.bmiMax)) return false
      
      // BP filter (systolic)
      const systolic = parseInt(member.bloodPressure.split("/")[0])
      if (filters.bpSystolicMin && systolic < parseInt(filters.bpSystolicMin)) return false
      if (filters.bpSystolicMax && systolic > parseInt(filters.bpSystolicMax)) return false
      
      // Glucose filter
      if (filters.glucoseMin && member.fastingBloodGlucoseMgDl < parseInt(filters.glucoseMin)) return false
      if (filters.glucoseMax && member.fastingBloodGlucoseMgDl > parseInt(filters.glucoseMax)) return false
      
      // Cholesterol filter
      if (filters.cholesterolMin && member.cholesterolMgDl < parseInt(filters.cholesterolMin)) return false
      if (filters.cholesterolMax && member.cholesterolMgDl > parseInt(filters.cholesterolMax)) return false
      
      // Past diseases filter
      if (filters.pastDiseases.length > 0) {
        const hasPastDisease = filters.pastDiseases.some(disease => 
          member.pastDiseases.includes(disease as never)
        )
        if (!hasPastDisease) return false
      }
      
      return true
    })
  }, [members, debouncedQuery, filters])

  const totals = useMemo(() => {
    const highRisk = members.filter((member) => member.overallRisk === "High").length
    const moderateRisk = members.filter((member) => member.overallRisk === "Moderate").length
    const lowRisk = members.filter((member) => member.overallRisk === "Low").length
    return { highRisk, moderateRisk, lowRisk }
  }, [members])
  
  const clearFilters = () => {
    setFilters({
      bmiMin: "",
      bmiMax: "",
      bpSystolicMin: "",
      bpSystolicMax: "",
      glucoseMin: "",
      glucoseMax: "",
      cholesterolMin: "",
      cholesterolMax: "",
      pastDiseases: [],
    })
  }
  
  const hasActiveFilters = Object.values(filters).some(v => 
    Array.isArray(v) ? v.length > 0 : v !== ""
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Employee Dashboard</h2>
        <p className="text-muted-foreground">Manage and monitor employee health risk profiles</p>
      </div>
      
      {/* Quick Stats */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-success/15 px-4 py-2 text-sm">
          <span className="size-2 rounded-full bg-success" />
          <span className="text-success font-medium">{totals.lowRisk} Low Risk</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-warning/15 px-4 py-2 text-sm">
          <span className="size-2 rounded-full bg-warning" />
          <span className="text-warning font-medium">{totals.moderateRisk} Moderate</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-destructive/15 px-4 py-2 text-sm">
          <span className="size-2 rounded-full bg-destructive" />
          <span className="text-destructive font-medium">{totals.highRisk} High Risk</span>
        </div>
      </div>
      
      {/* Search & Filters */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10 bg-muted/30"
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, department, or risk level..."
                value={query}
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="size-4" />
              Filters
              {hasActiveFilters && (
                <span className="size-2 rounded-full bg-primary" />
              )}
            </Button>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* BMI Range */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">BMI Range</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.bmiMin}
                      onChange={(e) => setFilters(f => ({ ...f, bmiMin: e.target.value }))}
                      className="bg-muted/30"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.bmiMax}
                      onChange={(e) => setFilters(f => ({ ...f, bmiMax: e.target.value }))}
                      className="bg-muted/30"
                    />
                  </div>
                </div>
                
                {/* BP Range */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Systolic BP</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.bpSystolicMin}
                      onChange={(e) => setFilters(f => ({ ...f, bpSystolicMin: e.target.value }))}
                      className="bg-muted/30"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.bpSystolicMax}
                      onChange={(e) => setFilters(f => ({ ...f, bpSystolicMax: e.target.value }))}
                      className="bg-muted/30"
                    />
                  </div>
                </div>
                
                {/* Glucose Range */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Glucose (mg/dL)</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.glucoseMin}
                      onChange={(e) => setFilters(f => ({ ...f, glucoseMin: e.target.value }))}
                      className="bg-muted/30"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.glucoseMax}
                      onChange={(e) => setFilters(f => ({ ...f, glucoseMax: e.target.value }))}
                      className="bg-muted/30"
                    />
                  </div>
                </div>
                
                {/* Cholesterol Range */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cholesterol (mg/dL)</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.cholesterolMin}
                      onChange={(e) => setFilters(f => ({ ...f, cholesterolMin: e.target.value }))}
                      className="bg-muted/30"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.cholesterolMax}
                      onChange={(e) => setFilters(f => ({ ...f, cholesterolMax: e.target.value }))}
                      className="bg-muted/30"
                    />
                  </div>
                </div>
              </div>
              
              {/* Past Diseases */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Past Diseases</label>
                <div className="flex flex-wrap gap-2">
                  {["Type 2 Diabetes", "Hypertension", "Heart Disease", "Stroke", "Obesity", "High Cholesterol"].map((disease) => (
                    <Button
                      key={disease}
                      variant={filters.pastDiseases.includes(disease) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilters(f => ({
                          ...f,
                          pastDiseases: f.pastDiseases.includes(disease)
                            ? f.pastDiseases.filter(d => d !== disease)
                            : [...f.pastDiseases, disease]
                        }))
                      }}
                    >
                      {disease}
                    </Button>
                  ))}
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Employee Table */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Employee Registry</CardTitle>
            <span className="text-sm text-muted-foreground">
              {filteredMembers.length} of {members.length} employees
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative rounded-xl border border-border/50 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_0.5fr_0.5fr_auto] gap-4 bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Name</span>
              <span>Department</span>
              <span className="text-center">Age</span>
              <span className="text-center">Gender</span>
              <span className="text-right">Action</span>
            </div>
            
            {/* Scroll indicator */}
            {showScrollHint && filteredMembers.length > 8 && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none z-10 flex items-end justify-center pb-2">
                <div className="flex flex-col items-center gap-1 animate-bounce text-muted-foreground">
                  <ChevronDown className="size-4" />
                  <span className="text-xs">Scroll for more</span>
                </div>
              </div>
            )}
            
            {/* Table Body */}
            <div 
              ref={tableRef}
              className="divide-y divide-border/50 max-h-[500px] overflow-y-auto scrollbar-thin scroll-smooth"
            >
              {filteredMembers.length === 0 ? (
                <div className="px-4 py-12 text-center text-muted-foreground">
                  <Search className="mx-auto size-8 mb-3 opacity-50" />
                  <p>No employees match your criteria</p>
                </div>
              ) : (
                filteredMembers.map((member, i) => (
                  <div
                    key={member.id}
                    className="group transition-smooth hover:bg-muted/30"
                    style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
                  >
                    <div className="grid grid-cols-[2fr_1fr_0.5fr_0.5fr_auto] gap-4 p-4 items-center">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{member.department}</p>
                      <p className="text-sm text-center">{member.age}</p>
                      <p className="text-sm text-center">{member.gender}</p>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          onClick={() => navigate(`/dashboard/employee/${member.id}`)}
                          size="sm"
                          variant="outline"
                          className="opacity-70 group-hover:opacity-100 transition-opacity"
                        >
                          Details
                          <ArrowRight className="ml-1 size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Chat Placeholder */}
      <AIChatPlaceholder />
    </div>
  )
}

// AI Chat Placeholder Component
function AIChatPlaceholder() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  
  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="size-14 rounded-full shadow-lg shadow-primary/25 p-0"
        >
          {isOpen ? (
            <X className="size-6" />
          ) : (
            <MessageCircle className="size-6" />
          )}
        </Button>
      </div>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 animate-slide-up">
          <Card className="border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/15 p-2">
                  <Bot className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Health AI Assistant</CardTitle>
                  <CardDescription className="text-xs">Ask about employee health insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-64 rounded-lg bg-muted/30 p-4 mb-4 overflow-y-auto">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/15 p-1.5">
                    <Bot className="size-3 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Hello! I'm your health analytics assistant. I can help you:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>- Analyze risk patterns across departments</li>
                      <li>- Identify employees needing attention</li>
                      <li>- Generate intervention recommendations</li>
                      <li>- Explain health metrics</li>
                    </ul>
                    <p className="text-xs text-muted-foreground/60 italic">
                      (AI functionality coming soon)
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about health insights..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-muted/30"
                  disabled
                />
                <Button size="icon" disabled>
                  <Send className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

// Health Pie Chart Component for Employee Details
function HealthPieChart({ member }: { member: MemberRiskRecord }) {
  // 240° for general health (green), remaining 120° split among disease risks
  const generalHealthDegrees = 240
  const riskDegrees = 120
  
  // Calculate risk segments proportionally
  const totalRisk = member.hypertensionRiskPct + member.diabetesRiskPct + member.cardiovascularRiskPct
  const htPct = totalRisk > 0 ? (member.hypertensionRiskPct / totalRisk) : 0.33
  const dbPct = totalRisk > 0 ? (member.diabetesRiskPct / totalRisk) : 0.33
  const cvPct = totalRisk > 0 ? (member.cardiovascularRiskPct / totalRisk) : 0.34
  
  // Calculate degrees for each risk segment
  const htDegrees = riskDegrees * htPct
  const dbDegrees = riskDegrees * dbPct
  const cvDegrees = riskDegrees * cvPct
  
  // Risk severity colors (more dangerous = closer to red)
  const getColor = (risk: number) => {
    if (risk >= 67) return "#ef4444" // red
    if (risk >= 50) return "#f97316" // orange  
    if (risk >= 40) return "#eab308" // yellow
    return "#22c55e" // green
  }
  
  // Build conic gradient
  let currentDegree = 0
  const segments: string[] = []
  
  // General health segment (green)
  segments.push(`#22c55e ${currentDegree}deg ${currentDegree + generalHealthDegrees}deg`)
  currentDegree += generalHealthDegrees
  
  // Hypertension segment
  const htColor = getColor(member.hypertensionRiskPct)
  segments.push(`${htColor} ${currentDegree}deg ${currentDegree + htDegrees}deg`)
  currentDegree += htDegrees
  
  // Diabetes segment
  const dbColor = getColor(member.diabetesRiskPct)
  segments.push(`${dbColor} ${currentDegree}deg ${currentDegree + dbDegrees}deg`)
  currentDegree += dbDegrees
  
  // Cardiovascular segment
  const cvColor = getColor(member.cardiovascularRiskPct)
  segments.push(`${cvColor} ${currentDegree}deg ${currentDegree + cvDegrees}deg`)
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="size-48 rounded-full relative shadow-lg"
        style={{
          background: `conic-gradient(${segments.join(", ")})`,
        }}
      >
        <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold">{Math.round(100 - (totalRisk / 3))}%</p>
            <p className="text-xs text-muted-foreground">Overall Health</p>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-success" />
          <span className="text-muted-foreground">General Health</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ backgroundColor: htColor }} />
          <span className="text-muted-foreground">Hypertension ({member.hypertensionRiskPct}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ backgroundColor: dbColor }} />
          <span className="text-muted-foreground">Diabetes ({member.diabetesRiskPct}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ backgroundColor: cvColor }} />
          <span className="text-muted-foreground">Cardiovascular ({member.cardiovascularRiskPct}%)</span>
        </div>
      </div>
    </div>
  )
}

// Individual Employee Details Page
function EmployeeDetailsPage({ members }: { members: MemberRiskRecord[] }) {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  
  const employee = useMemo(
    () => members.find(m => m.id === employeeId) ?? null,
    [members, employeeId]
  )
  
  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <AlertTriangle className="size-12 mb-4 opacity-50" />
        <p>Employee not found</p>
        <Button variant="link" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }
  
  // Generate mailto with contextual message
  const getEmailSubject = () => {
    if (employee.overallRisk === "High") {
      return `Urgent: Health Intervention Required - ${employee.fullName}`
    }
    if (employee.overallRisk === "Moderate") {
      return `Health Check-in Recommended - ${employee.fullName}`
    }
    return `Quarterly Health Update - ${employee.fullName}`
  }
  
  const getEmailBody = () => {
    let body = `Dear ${employee.fullName.split(" ")[0]},\n\n`
    
    if (employee.overallRisk === "High") {
      body += `Based on your recent health screening, we'd like to schedule an urgent consultation to discuss your health profile and create a personalized intervention plan.\n\n`
      body += `Your current risk indicators:\n`
      body += `- Hypertension Risk: ${employee.hypertensionRiskPct}%\n`
      body += `- Diabetes Risk: ${employee.diabetesRiskPct}%\n`
      body += `- Cardiovascular Risk: ${employee.cardiovascularRiskPct}%\n\n`
      body += `Recommendation: ${employee.recommendation}\n\n`
    } else if (employee.overallRisk === "Moderate") {
      body += `As part of our wellness program, we'd like to discuss some personalized recommendations based on your health screening results.\n\n`
      body += `Recommendation: ${employee.recommendation}\n\n`
    } else {
      body += `Great news! Your recent health screening shows you're maintaining a healthy profile. Here are some tips to keep it up!\n\n`
      body += `Recommendation: ${employee.recommendation}\n\n`
    }
    
    body += `Please reply to schedule a convenient time for a wellness check-in.\n\nBest regards,\nSync Health Wellness Team`
    
    return encodeURIComponent(body)
  }
  
  const mailtoLink = `mailto:${employee.email}?subject=${encodeURIComponent(getEmailSubject())}&body=${getEmailBody()}`
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
        <ChevronLeft className="size-4" />
        Back to Dashboard
      </Button>
      
      {/* Employee Header */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-lg">
                {employee.fullName.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{employee.fullName}</h2>
                <p className="text-muted-foreground">{employee.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-card/80 px-2.5 py-1 text-xs font-medium">
                    {employee.department}
                  </span>
                  <span className="rounded-full bg-card/80 px-2.5 py-1 text-xs font-medium">
                    {employee.gender}
                  </span>
                  <RiskBadge risk={employee.overallRisk} />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <a 
                href={mailtoLink}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <Mail className="mr-2 size-4" />
                Send Email
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Health Pie Chart & Vitals */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Health Risk Breakdown</CardTitle>
            <CardDescription>Visual representation of health profile</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <HealthPieChart member={employee} />
          </CardContent>
        </Card>
        
        {/* Vitals Grid */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Health Metrics</CardTitle>
            <CardDescription>Latest screening data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Age", value: `${employee.age} years` },
                { label: "BMI", value: employee.bmi.toString() },
                { label: "Blood Pressure", value: employee.bloodPressure },
                { label: "Fasting Glucose", value: `${employee.fastingBloodGlucoseMgDl} mg/dL` },
                { label: "Cholesterol", value: `${employee.cholesterolMgDl} mg/dL` },
                { label: "Smoking Status", value: employee.smokingStatus },
                { label: "Exercise", value: employee.exerciseFrequency },
                { label: "Family History", value: employee.familyHistory },
                { label: "Stress Level", value: employee.stressLevel },
                { label: "Past Diseases", value: employee.pastDiseases.join(", ") },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Risk Scores */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Risk Assessment</CardTitle>
          <CardDescription>Disease risk probability scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Hypertension", value: employee.hypertensionRiskPct },
              { label: "Diabetes", value: employee.diabetesRiskPct },
              { label: "Cardiovascular", value: employee.cardiovascularRiskPct },
            ].map((score) => {
              const risk: RiskLevel = score.value >= 67 ? "High" : score.value >= 40 ? "Moderate" : "Low"
              return (
                <div key={score.label} className="rounded-xl border border-border/70 p-4">
                  <p className="text-sm font-medium text-muted-foreground">{score.label} Risk</p>
                  <p className={`mt-2 text-3xl font-bold ${
                    risk === "High" ? "text-destructive" : risk === "Moderate" ? "text-warning" : "text-success"
                  }`}>
                    {score.value}%
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={
                        risk === "High"
                          ? "h-full bg-destructive"
                          : risk === "Moderate"
                            ? "h-full bg-warning"
                            : "h-full bg-success"
                      }
                      style={{ width: `${score.value}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Recommendation */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/20 p-3">
              <Shield className="size-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Recommended Intervention</h3>
              <p className="mt-2 text-muted-foreground">{employee.recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Stats & Insights Page (formerly Overview)
function StatsInsightsPage({ members }: { members: MemberRiskRecord[] }) {
  const stats = useMemo(() => {
    const highRisk = members.filter(m => m.overallRisk === "High").length
    const moderateRisk = members.filter(m => m.overallRisk === "Moderate").length
    const lowRisk = members.filter(m => m.overallRisk === "Low").length
    
    const avgHypertension = Math.round(
      members.reduce((acc, m) => acc + m.hypertensionRiskPct, 0) / members.length
    )
    const avgDiabetes = Math.round(
      members.reduce((acc, m) => acc + m.diabetesRiskPct, 0) / members.length
    )
    const avgCardio = Math.round(
      members.reduce((acc, m) => acc + m.cardiovascularRiskPct, 0) / members.length
    )
    
    const healthyPct = Math.round((lowRisk / members.length) * 100)
    
    return { highRisk, moderateRisk, lowRisk, avgHypertension, avgDiabetes, avgCardio, healthyPct }
  }, [members])
  
  const departmentStats = useMemo(() => {
    const deptMap = new Map<string, { total: number; high: number; moderate: number; low: number }>()
    
    members.forEach(m => {
      const current = deptMap.get(m.department) || { total: 0, high: 0, moderate: 0, low: 0 }
      current.total++
      if (m.overallRisk === "High") current.high++
      else if (m.overallRisk === "Moderate") current.moderate++
      else current.low++
      deptMap.set(m.department, current)
    })
    
    return Array.from(deptMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.high - a.high)
  }, [members])
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Workforce"
          value={members.length}
          subtitle="Employees modeled"
          icon={Users}
          className="animate-slide-up"
        />
        <StatCard
          title="High Risk"
          value={stats.highRisk}
          subtitle="Need immediate attention"
          icon={AlertTriangle}
          trend={{ value: 8, positive: false }}
          className="animate-slide-up stagger-1"
        />
        <StatCard
          title="Workforce Health"
          value={`${stats.healthyPct}%`}
          subtitle="Low risk employees"
          icon={Heart}
          trend={{ value: 5, positive: true }}
          className="animate-slide-up stagger-2"
        />
        <StatCard
          title="Avg. HTN Risk"
          value={`${stats.avgHypertension}%`}
          subtitle="Hypertension probability"
          icon={Activity}
          className="animate-slide-up stagger-3"
        />
      </div>
      
      {/* Risk Distribution */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-slide-up stagger-2">
        <CardHeader>
          <CardTitle className="text-lg">Risk Distribution by Department</CardTitle>
          <CardDescription>Employee risk levels across teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentStats.map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{dept.name}</span>
                  <span className="text-muted-foreground">{dept.total} employees</span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-muted/50">
                  <div 
                    className="bg-success transition-all duration-700"
                    style={{ width: `${(dept.low / dept.total) * 100}%` }}
                  />
                  <div 
                    className="bg-warning transition-all duration-700"
                    style={{ width: `${(dept.moderate / dept.total) * 100}%` }}
                  />
                  <div 
                    className="bg-destructive transition-all duration-700"
                    style={{ width: `${(dept.high / dept.total) * 100}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-success" />
                    Low: {dept.low}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-warning" />
                    Moderate: {dept.moderate}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-destructive" />
                    High: {dept.high}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Risk Type Breakdown */}
      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { 
            title: "Hypertension Risk", 
            value: stats.avgHypertension, 
            icon: Activity,
            description: "Based on BP, BMI, stress & lifestyle factors",
            risk: stats.avgHypertension >= 67 ? "High" : stats.avgHypertension >= 40 ? "Moderate" : "Low" as RiskLevel,
          },
          { 
            title: "Diabetes Risk", 
            value: stats.avgDiabetes, 
            icon: Heart,
            description: "Glucose levels, BMI & exercise patterns",
            risk: stats.avgDiabetes >= 67 ? "High" : stats.avgDiabetes >= 40 ? "Moderate" : "Low" as RiskLevel,
          },
          { 
            title: "Cardiovascular Risk", 
            value: stats.avgCardio, 
            icon: HeartPulse,
            description: "Cholesterol, BP, smoking & stress",
            risk: stats.avgCardio >= 67 ? "High" : stats.avgCardio >= 40 ? "Moderate" : "Low" as RiskLevel,
          },
        ].map((metric, i) => (
          <Card 
            key={metric.title}
            className={`border-border/50 bg-card/80 backdrop-blur-sm text-center animate-slide-up stagger-${i + 1}`}
          >
            <CardContent className="pt-6">
              <MetricRing value={metric.value} risk={metric.risk} size={100} strokeWidth={8} />
              <h3 className="mt-4 font-semibold">{metric.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

type AdminDashboardPageProps = {
  members: MemberRiskRecord[]
  onMembersImported: (members: MemberRiskRecord[]) => void
  onResetSeedData: () => void
}

// Kept for future use - commenting out routes temporarily
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AdminDashboardPage({
  members,
  onMembersImported,
  onResetSeedData,
}: AdminDashboardPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const selectedMemberId = searchParams.get("member")
  const [importMessage, setImportMessage] = useState<string>("")
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  )

  useEffect(() => {
    if (!selectedMemberId || selectedMember) return

    const next = new URLSearchParams(searchParams)
    next.delete("member")
    setSearchParams(next, { replace: true })
  }, [searchParams, selectedMember, selectedMemberId, setSearchParams])

  function updateSearchParam(
    key: "q" | "member",
    value: string | null,
    replace = false
  ) {
    const next = new URLSearchParams(searchParams)

    if (!value || value.trim() === "") {
      next.delete(key)
    } else {
      next.set(key, value)
    }

    setSearchParams(next, { replace })
  }

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) return members

    return members.filter((member) => {
      return (
        member.fullName.toLowerCase().includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery) ||
        member.department.toLowerCase().includes(normalizedQuery) ||
        member.overallRisk.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [members, query])

  const totals = useMemo(() => {
    const highRisk = members.filter((member) => member.overallRisk === "High").length
    const moderateRisk = members.filter((member) => member.overallRisk === "Moderate").length
    const lowRisk = members.filter((member) => member.overallRisk === "Low").length

    return { highRisk, moderateRisk, lowRisk }
  }, [members])

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    setIsImporting(true)
    setImportMessage("")
    setImportErrors([])

    try {
      const result = await importMembersFromSpreadsheet(file)

      if (result.members.length === 0) {
        setImportMessage("No valid employee rows were imported.")
        setImportErrors(result.errors)
        return
      }

      onMembersImported(result.members)
      setImportMessage(`Imported ${result.members.length} employee records from ${file.name}.`)
      setImportErrors(result.errors)
    } catch {
      setImportMessage("Import failed. Please upload a valid CSV/XLSX file.")
      setImportErrors([])
    } finally {
      setIsImporting(false)
      event.target.value = ""
    }
  }

  function resetToSeed() {
    onResetSeedData()
    setImportMessage("Reverted to seeded dataset.")
    setImportErrors([])
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Stats */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-success/15 px-4 py-2 text-sm">
          <span className="size-2 rounded-full bg-success" />
          <span className="text-success font-medium">{totals.lowRisk} Low Risk</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-warning/15 px-4 py-2 text-sm">
          <span className="size-2 rounded-full bg-warning" />
          <span className="text-warning font-medium">{totals.moderateRisk} Moderate</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-destructive/15 px-4 py-2 text-sm">
          <span className="size-2 rounded-full bg-destructive" />
          <span className="text-destructive font-medium">{totals.highRisk} High Risk</span>
        </div>
      </div>
      
      {/* Data Import Card */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm border-dashed animate-slide-up">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Upload className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold">Import Employee Data</h3>
                <p className="text-sm text-muted-foreground">
                  Upload CSV or Excel files with health screening data
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <Input
                  accept=".csv,.xlsx,.xls"
                  disabled={isImporting}
                  onChange={handleFileUpload}
                  type="file"
                  className="hidden"
                />
                <Button variant="outline" disabled={isImporting} render={<span />}>
                  <FileSpreadsheet className="mr-2 size-4" />
                  {isImporting ? "Importing..." : "Choose File"}
                </Button>
              </label>
              <Button onClick={resetToSeed} variant="ghost">
                Reset to Demo
              </Button>
            </div>
          </div>
          
          {importMessage && (
            <div className="mt-4 rounded-lg bg-muted/50 px-4 py-3 text-sm">
              {importMessage}
            </div>
          )}
          
          {importErrors.length > 0 && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">Import warnings</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {importErrors.slice(0, 5).map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
              {importErrors.length > 5 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  +{importErrors.length - 5} more warning(s)
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Search & Employee List */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-slide-up stagger-1">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Employee Risk Register</CardTitle>
              <CardDescription>
                {filteredMembers.length} of {members.length} employees
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10 bg-muted/30"
                onChange={(event) => updateSearchParam("q", event.target.value, true)}
                placeholder="Search employees..."
                value={query}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_0.8fr_0.8fr_0.8fr_auto] gap-4 bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Employee</span>
              <span>Department</span>
              <span>Overall Risk</span>
              <span>HTN</span>
              <span>Diabetes</span>
              <span>Cardio</span>
              <span className="text-right">Action</span>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto scrollbar-thin">
              {filteredMembers.length === 0 ? (
                <div className="px-4 py-12 text-center text-muted-foreground">
                  <Search className="mx-auto size-8 mb-3 opacity-50" />
                  <p>No employees match your search</p>
                </div>
              ) : (
                filteredMembers.map((member, i) => (
                  <div
                    key={member.id}
                    className={`group transition-smooth hover:bg-muted/30 animate-slide-up`}
                    style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
                  >
                    <div className="grid grid-cols-[1fr_auto] gap-4 p-4 lg:grid-cols-[2fr_1fr_1fr_0.8fr_0.8fr_0.8fr_auto] lg:items-center">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                      <p className="hidden lg:block text-sm text-muted-foreground">{member.department}</p>
                      <div className="hidden lg:block">
                        <RiskBadge risk={member.overallRisk} />
                      </div>
                      <div className="hidden lg:block">
                        <span className={`metric-value text-sm ${
                          member.hypertensionRiskPct >= 67 ? 'text-destructive' :
                          member.hypertensionRiskPct >= 40 ? 'text-warning' : 'text-success'
                        }`}>
                          {member.hypertensionRiskPct}%
                        </span>
                      </div>
                      <div className="hidden lg:block">
                        <span className={`metric-value text-sm ${
                          member.diabetesRiskPct >= 67 ? 'text-destructive' :
                          member.diabetesRiskPct >= 40 ? 'text-warning' : 'text-success'
                        }`}>
                          {member.diabetesRiskPct}%
                        </span>
                      </div>
                      <div className="hidden lg:block">
                        <span className={`metric-value text-sm ${
                          member.cardiovascularRiskPct >= 67 ? 'text-destructive' :
                          member.cardiovascularRiskPct >= 40 ? 'text-warning' : 'text-success'
                        }`}>
                          {member.cardiovascularRiskPct}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <div className="lg:hidden">
                          <RiskBadge risk={member.overallRisk} />
                        </div>
                        <Button
                          onClick={() => updateSearchParam("member", member.id)}
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Details
                          <ArrowRight className="ml-1 size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Detail Modal */}
      <AlertDialog
        onOpenChange={(nextOpen) => {
          if (!nextOpen) updateSearchParam("member", null, true)
        }}
        open={Boolean(selectedMember)}
      >
        <AlertDialogContent
          className="w-[min(92vw,520px)] max-w-none rounded-2xl p-0 overflow-hidden"
          overlayProps={{
            onClick: () => updateSearchParam("member", null, true),
          }}
        >
          {selectedMember && (
            <div className="max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-card text-lg font-bold text-primary shadow-sm">
                    {selectedMember.fullName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <AlertDialogTitle className="text-lg leading-tight">{selectedMember.fullName}</AlertDialogTitle>
                    <AlertDialogDescription className="mt-0.5 text-xs sm:text-sm">{selectedMember.email}</AlertDialogDescription>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-card/80 px-2.5 py-1 text-[11px] font-medium">
                        {selectedMember.department}
                      </span>
                      <RiskBadge risk={selectedMember.overallRisk} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3 p-4 sm:p-5">
                {/* Risk Scores */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Hypertension", value: selectedMember.hypertensionRiskPct },
                    { label: "Diabetes", value: selectedMember.diabetesRiskPct },
                    { label: "Cardiovascular", value: selectedMember.cardiovascularRiskPct },
                  ].map((score) => {
                    const risk: RiskLevel = score.value >= 67 ? "High" : score.value >= 40 ? "Moderate" : "Low"
                    return (
                      <div key={score.label} className="rounded-lg border border-border/70 p-2">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{score.label}</p>
                        <p className={`mt-1 text-base font-semibold ${
                          risk === "High" ? "text-destructive" : risk === "Moderate" ? "text-warning" : "text-success"
                        }`}>
                          {score.value}%
                        </p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={
                              risk === "High"
                                ? "h-full bg-destructive"
                                : risk === "Moderate"
                                  ? "h-full bg-warning"
                                  : "h-full bg-success"
                            }
                            style={{ width: `${score.value}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Age", value: `${selectedMember.age} yrs` },
                    { label: "BMI", value: selectedMember.bmi.toString() },
                    { label: "Blood Pressure", value: selectedMember.bloodPressure },
                    { label: "Glucose", value: `${selectedMember.fastingBloodGlucoseMgDl} mg/dL` },
                    { label: "Cholesterol", value: `${selectedMember.cholesterolMgDl} mg/dL` },
                    { label: "Smoking", value: selectedMember.smokingStatus },
                    { label: "Exercise", value: selectedMember.exerciseFrequency },
                    { label: "Family History", value: selectedMember.familyHistory },
                    { label: "Stress", value: selectedMember.stressLevel },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border/70 bg-muted/20 p-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <p className="mt-0.5 text-xs sm:text-sm font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Recommended Intervention</p>
                  <p className="mt-1 text-sm">{selectedMember.recommendation}</p>
                </div>
              </div>

              <AlertDialogFooter className="border-t border-border/50 p-3 sm:p-4">
                <AlertDialogCancel className="w-full sm:w-auto">Close</AlertDialogCancel>
              </AlertDialogFooter>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Kept for future Staff Portal feature
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StaffDashboardPage({ members }: { members: MemberRiskRecord[] }) {
  // Simulated logged-in staff member (first employee for demo)
  const currentStaff = members[0]
  
  if (!currentStaff) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        No employee data available
      </div>
    )
  }
  
  const getRiskLevel = (value: number): RiskLevel => {
    if (value >= 67) return "High"
    if (value >= 40) return "Moderate"
    return "Low"
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personal Health Card */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden animate-slide-up">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-lg">
                {currentStaff.fullName.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentStaff.fullName}</h2>
                <p className="text-muted-foreground">{currentStaff.department}</p>
                <div className="mt-2">
                  <RiskBadge risk={currentStaff.overallRisk} />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 lg:gap-8">
              {[
                { label: "Hypertension", value: currentStaff.hypertensionRiskPct },
                { label: "Diabetes", value: currentStaff.diabetesRiskPct },
                { label: "Cardiovascular", value: currentStaff.cardiovascularRiskPct },
              ].map((score) => (
                <div key={score.label} className="text-center">
                  <MetricRing 
                    value={score.value} 
                    risk={getRiskLevel(score.value)} 
                    size={80} 
                    strokeWidth={6} 
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{score.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Health Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: User, label: "Age", value: `${currentStaff.age} years` },
          { icon: Activity, label: "BMI", value: currentStaff.bmi.toString() },
          { icon: Heart, label: "Blood Pressure", value: currentStaff.bloodPressure },
          { icon: Zap, label: "Exercise", value: currentStaff.exerciseFrequency },
        ].map((metric, i) => (
          <Card 
            key={metric.label}
            className={`border-border/50 bg-card/80 backdrop-blur-sm animate-slide-up stagger-${i + 1}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <metric.icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="font-semibold">{metric.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recommendation */}
      <Card className="border-primary/30 bg-primary/5 animate-slide-up stagger-3">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/20 p-3">
              <Shield className="size-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Your Wellness Plan</h3>
              <p className="mt-2 text-muted-foreground">{currentStaff.recommendation}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {currentStaff.overallRisk === "High" && (
                  <>
                    <Badge variant="outline" className="border-destructive/30 text-destructive">
                      Clinic Referral Pending
                    </Badge>
                    <Badge variant="outline" className="border-primary/30">
                      Wellness Program Active
                    </Badge>
                  </>
                )}
                {currentStaff.overallRisk === "Moderate" && (
                  <>
                    <Badge variant="outline" className="border-warning/30 text-warning">
                      Monthly Check-in Required
                    </Badge>
                    <Badge variant="outline" className="border-primary/30">
                      Diet Plan Assigned
                    </Badge>
                  </>
                )}
                {currentStaff.overallRisk === "Low" && (
                  <Badge variant="outline" className="border-success/30 text-success">
                    Quarterly Health Tips
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Directory */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-slide-up stagger-4">
        <CardHeader>
          <CardTitle className="text-lg">Team Directory</CardTitle>
          <CardDescription>Your colleagues in the wellness program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.slice(0, 9).map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 text-left transition-smooth hover:bg-muted/50"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {member.fullName.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.fullName}</p>
                  <p className="text-xs text-muted-foreground">{member.department}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RecommendationsPage({ members }: { members: MemberRiskRecord[] }) {
  const groupedByRisk = useMemo(() => {
    const high = members.filter(m => m.overallRisk === "High")
    const moderate = members.filter(m => m.overallRisk === "Moderate")
    const low = members.filter(m => m.overallRisk === "Low")
    return { high, moderate, low }
  }, [members])
  
  const interventions = [
    {
      risk: "High" as const,
      title: "Critical Interventions",
      description: "Immediate action required for high-risk employees",
      color: "destructive",
      actions: [
        "Schedule clinic referral appointments",
        "Enroll in tracked wellness intervention program",
        "Weekly health monitoring check-ins",
        "Assign dedicated wellness coordinator",
      ],
      employees: groupedByRisk.high,
    },
    {
      risk: "Moderate" as const,
      title: "Preventive Measures",
      description: "Proactive steps for moderate-risk employees",
      color: "warning",
      actions: [
        "Create personalized fitness plan",
        "Design custom diet recommendations",
        "Monthly blood pressure monitoring",
        "Quarterly wellness consultations",
      ],
      employees: groupedByRisk.moderate,
    },
    {
      risk: "Low" as const,
      title: "Maintenance Program",
      description: "Keep low-risk employees healthy",
      color: "success",
      actions: [
        "Maintain current lifestyle habits",
        "Quarterly health tips newsletter",
        "Annual comprehensive screening",
        "Optional wellness workshops",
      ],
      employees: groupedByRisk.low,
    },
  ]
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {interventions.map((tier, i) => (
          <Card 
            key={tier.risk}
            className={`border-${tier.color}/30 bg-${tier.color}/5 animate-slide-up stagger-${i + 1}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium text-${tier.color}`}>{tier.risk} Risk</p>
                  <p className="metric-value text-3xl font-bold mt-1">{tier.employees.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">employees</p>
                </div>
                <div className={`rounded-xl bg-${tier.color}/15 p-3`}>
                  {tier.risk === "High" && <AlertTriangle className={`size-6 text-${tier.color}`} />}
                  {tier.risk === "Moderate" && <Activity className={`size-6 text-${tier.color}`} />}
                  {tier.risk === "Low" && <Heart className={`size-6 text-${tier.color}`} />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Intervention Details */}
      {interventions.map((tier, i) => (
        <Card 
          key={tier.risk}
          className={`border-border/50 bg-card/80 backdrop-blur-sm animate-slide-up stagger-${i + 2}`}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <RiskBadge risk={tier.risk} />
                  <CardTitle className="text-lg">{tier.title}</CardTitle>
                </div>
                <CardDescription className="mt-1">{tier.description}</CardDescription>
              </div>
              <span className="metric-value text-2xl font-bold">{tier.employees.length}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Actions */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Recommended Actions</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {tier.actions.map((action) => (
                  <div 
                    key={action}
                    className="flex items-center gap-2 rounded-lg bg-muted/30 p-3"
                  >
                    <div className={`size-2 rounded-full bg-${tier.color}`} />
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Employees */}
            {tier.employees.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Affected Employees</h4>
                <div className="flex flex-wrap gap-2">
                  {tier.employees.slice(0, 10).map((emp) => (
                    <span 
                      key={emp.id}
                      className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-sm"
                    >
                      <span className="size-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-medium text-primary">
                        {emp.fullName.split(" ").map(n => n[0]).join("")}
                      </span>
                      {emp.fullName}
                    </span>
                  ))}
                  {tier.employees.length > 10 && (
                    <span className="inline-flex items-center rounded-full bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground">
                      +{tier.employees.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============================================================================
// APP ROUTES
// ============================================================================

type AppRoutesProps = {
  members: MemberRiskRecord[]
  onMembersImported: (members: MemberRiskRecord[]) => void
  onResetSeedData: () => void
}

function AppRoutes({ members }: AppRoutesProps) {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith("/dashboard")
  
  if (isDashboard) {
    return (
      <DashboardLayout>
        <Routes>
          <Route path="/dashboard" element={<DashboardOverviewPage members={members} />} />
          <Route path="/dashboard/employee/:employeeId" element={<EmployeeDetailsPage members={members} />} />
          <Route path="/dashboard/stats" element={<StatsInsightsPage members={members} />} />
          {/* Data import functionality moved - keeping AdminDashboardPage for reference */}
          {/* <Route
            path="/dashboard/admin"
            element={
              <AdminDashboardPage
                members={members}
                onMembersImported={onMembersImported}
                onResetSeedData={onResetSeedData}
              />
            }
          /> */}
          {/* Staff Portal commented out for later */}
          {/* <Route path="/dashboard/staff" element={<StaffDashboardPage members={members} />} /> */}
          <Route path="/dashboard/recommendations" element={<RecommendationsPage members={members} />} />
          <Route path="*" element={<Navigate replace to="/dashboard" />} />
        </Routes>
      </DashboardLayout>
    )
  }
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}

export function App() {
  const [members, setMembers] = useState<MemberRiskRecord[]>(CHOWDECK_MEMBERS)

  return (
    <ThemeProvider defaultTheme="dark" storageKey="sync-health-theme">
      <BrowserRouter>
        <AppRoutes
          members={members}
          onMembersImported={(nextMembers) => setMembers(nextMembers)}
          onResetSeedData={() => setMembers(CHOWDECK_MEMBERS)}
        />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
