import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  HeartPulse,
  LogIn,
  Menu,
  Search,
  ShieldPlus,
  Upload,
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
  AlertDialogHeader,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { CHOWDECK_MEMBERS, type MemberRiskRecord } from "@/lib/chowdeck-members"
import { importMembersFromSpreadsheet } from "@/lib/member-import"

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

type AdminDashboardPageProps = {
  members: MemberRiskRecord[]
  onMembersImported: (members: MemberRiskRecord[]) => void
  onResetSeedData: () => void
}

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

    const hypertensionAvg =
      members.length > 0
        ? Math.round(
            members.reduce((acc, member) => acc + member.hypertensionRiskPct, 0) /
              members.length
          )
        : 0

    return { highRisk, moderateRisk, lowRisk, hypertensionAvg }
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
    <section className="space-y-4 sm:space-y-6">
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Data Import</CardTitle>
          <CardDescription>
            Upload employee records in CSV or Excel format (`.csv`, `.xlsx`, `.xls`).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            accept=".csv,.xlsx,.xls"
            disabled={isImporting}
            onChange={handleFileUpload}
            type="file"
          />
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              <Upload className="mr-1 size-3" /> Supported: CSV, XLSX, XLS
            </Badge>
            <Button onClick={resetToSeed} size="sm" variant="outline">
              Use Seed Data
            </Button>
          </div>
          {importMessage ? <p className="text-sm text-muted-foreground">{importMessage}</p> : null}
          {importErrors.length > 0 ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive">Import warnings</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {importErrors.slice(0, 8).map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
              {importErrors.length > 8 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  +{importErrors.length - 8} more warning(s)
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

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
              onChange={(event) => updateSearchParam("q", event.target.value, true)}
              placeholder="Search by name, email, department, or risk"
              value={query}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Employee Risk Register ({filteredMembers.length})</CardTitle>
          <CardDescription>
            {members.length} employee records with complete screening and risk fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border/70">
            <div className="hidden grid-cols-[minmax(14rem,2fr)_minmax(7rem,1fr)_minmax(8rem,1fr)_minmax(6rem,0.8fr)_minmax(6rem,0.8fr)_minmax(6rem,0.8fr)_auto] gap-3 bg-muted/60 px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:grid">
              <span>Name</span>
              <span>Department</span>
              <span>Overall Risk</span>
              <span>HTN</span>
              <span>Diabetes</span>
              <span>Cardio</span>
              <span className="text-right">Action</span>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                No employee record matches your current search.
              </div>
            ) : null}

            {filteredMembers.map((member) => (
              <div
                className="border-t border-border/60 first:border-t-0 transition-colors hover:bg-muted/30"
                key={member.id}
              >
                <div className="grid grid-cols-[1fr_auto] items-start gap-3 px-4 py-3 sm:grid-cols-[minmax(14rem,2fr)_minmax(7rem,1fr)_minmax(8rem,1fr)_minmax(6rem,0.8fr)_minmax(6rem,0.8fr)_minmax(6rem,0.8fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{member.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate hidden sm:block">{member.email}</p>
                  </div>
                  <p className="hidden sm:block text-sm">{member.department}</p>
                  <div className="hidden sm:block">
                    <Badge variant={riskBadgeVariant(member.overallRisk)}>{member.overallRisk}</Badge>
                  </div>
                  <p className="hidden sm:block text-sm">{member.hypertensionRiskPct}%</p>
                  <p className="hidden sm:block text-sm">{member.diabetesRiskPct}%</p>
                  <p className="hidden sm:block text-sm">{member.cardiovascularRiskPct}%</p>
                  <div className="flex justify-end">
                    <Button
                      className="h-8 px-3"
                      onClick={() => updateSearchParam("member", member.id)}
                      size="sm"
                      variant="outline"
                    >
                      View more
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        onOpenChange={(nextOpen) => {
          if (!nextOpen) updateSearchParam("member", null, true)
        }}
        open={Boolean(selectedMember)}
      >
        <AlertDialogContent className="w-[min(92vw,720px)] max-w-none rounded-2xl p-5">
          {selectedMember ? (
            <>
              <AlertDialogHeader className="place-items-start text-left">
                <AlertDialogTitle>{selectedMember.fullName}</AlertDialogTitle>
                <AlertDialogDescription>{selectedMember.email}</AlertDialogDescription>
              </AlertDialogHeader>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="mt-1 text-sm font-medium">{selectedMember.department}</p>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Overall Risk</p>
                  <div className="mt-1">
                    <Badge variant={riskBadgeVariant(selectedMember.overallRisk)}>
                      {selectedMember.overallRisk}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Age / BMI</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedMember.age} years / {selectedMember.bmi}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Blood Pressure</p>
                  <p className="mt-1 text-sm font-medium">{selectedMember.bloodPressure}</p>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Fasting Glucose</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedMember.fastingBloodGlucoseMgDl} mg/dL
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Cholesterol</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedMember.cholesterolMgDl} mg/dL
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Lifestyle</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedMember.smokingStatus}, {selectedMember.exerciseFrequency}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Family History / Stress</p>
                  <p className="mt-1 text-sm font-medium">
                    {selectedMember.familyHistory}, {selectedMember.stressLevel}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Hypertension Risk</p>
                  <p className="mt-1 text-sm font-medium">{selectedMember.hypertensionRiskPct}%</p>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Diabetes Risk</p>
                  <p className="mt-1 text-sm font-medium">{selectedMember.diabetesRiskPct}%</p>
                </div>
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-xs text-muted-foreground">Cardiovascular Risk</p>
                  <p className="mt-1 text-sm font-medium">{selectedMember.cardiovascularRiskPct}%</p>
                </div>
                <div className="rounded-xl border border-border/70 p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Recommendation</p>
                  <p className="mt-1 text-sm font-medium">{selectedMember.recommendation}</p>
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          ) : null}
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

type StaffDashboardPageProps = {
  members: MemberRiskRecord[]
}

function StaffDashboardPage({ members }: StaffDashboardPageProps) {
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
          <CardDescription>{members.length} members currently loaded.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
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

type AppRoutesProps = {
  members: MemberRiskRecord[]
  onMembersImported: (members: MemberRiskRecord[]) => void
  onResetSeedData: () => void
}

function AppRoutes({ members, onMembersImported, onResetSeedData }: AppRoutesProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_45%),radial-gradient(circle_at_90%_0%,color-mix(in_oklch,var(--chart-2)_12%,transparent),transparent_40%)]" />
      <AppNavigation />
      <main className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Navigate replace to="/dashboard/admin" />} />
          <Route
            path="/dashboard/admin"
            element={
              <AdminDashboardPage
                members={members}
                onMembersImported={onMembersImported}
                onResetSeedData={onResetSeedData}
              />
            }
          />
          <Route path="/dashboard/staff" element={<StaffDashboardPage members={members} />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export function App() {
  const [members, setMembers] = useState<MemberRiskRecord[]>(CHOWDECK_MEMBERS)

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
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
