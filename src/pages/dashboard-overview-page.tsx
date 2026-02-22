import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowRight, ChevronDown, Filter, HeartPulse, LogOut, Search, Sparkles, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MemberRiskRecord } from "@/lib/chowdeck-members"
import type { User, AIRiskFilterData } from "@/lib/api"
import { AIChatPlaceholder, AIChatSidebar } from "@/features/dashboard/components"
import { capitalizeFirstLetter } from "@/lib/utils"

// Get unique departments from members
function getUniqueDepartments(members: MemberRiskRecord[]): string[] {
  return [...new Set(members.map(m => m.department))].sort()
}

const ALL_DEPARTMENTS_VALUE = "__all_departments__"
const ALL_GENDERS_VALUE = "__all_genders__"

interface DashboardOverviewPageProps {
  members: MemberRiskRecord[]
  user: User
  onLogout: () => void
}

/**
 * Get a color class for a risk score percentage.
 */
function getRiskScoreColor(score: number): string {
  if (score >= 67) return "text-destructive"
  if (score >= 40) return "text-warning"
  return "text-success"
}

/**
 * Get a background class for a risk score badge.
 */
function getRiskScoreBg(score: number): string {
  if (score >= 67) return "bg-destructive/15"
  if (score >= 40) return "bg-warning/15"
  return "bg-success/15"
}

export function DashboardOverviewPage({ members, user, onLogout }: DashboardOverviewPageProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const tableRef = useRef<HTMLDivElement>(null)
  const [showScrollHint, setShowScrollHint] = useState(true)
  
  // AI risk filter state
  const [aiRiskFilter, setAIRiskFilter] = useState<AIRiskFilterData | null>(null)
  
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
  
  // Simplified filter states
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    ageMin: "",
    ageMax: "",
    department: "", // dropdown
    weightMin: "",
    weightMax: "",
    gender: "", // dropdown
  })
  
  const departments = useMemo(() => getUniqueDepartments(members), [members])
  
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

  // Build a lookup map of memberId -> riskScore when AI filter is active
  const aiRiskMap = useMemo(() => {
    if (!aiRiskFilter) return null
    const map = new Map<string, number>()
    for (const entry of aiRiskFilter.entries) {
      if (entry.memberId) {
        map.set(entry.memberId, entry.riskScore)
      }
    }
    return map
  }, [aiRiskFilter])

  const hasUnmatchedAIResults = useMemo(() => {
    if (!aiRiskFilter || aiRiskFilter.entries.length === 0) return false
    return (aiRiskMap?.size ?? 0) === 0
  }, [aiRiskFilter, aiRiskMap])

  const filteredMembers = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase()

    let result = members.filter((member) => {
      // Text search
      if (normalizedQuery) {
        const matchesText = 
          member.fullName.toLowerCase().includes(normalizedQuery) ||
          member.department.toLowerCase().includes(normalizedQuery) ||
          member.overallRisk.toLowerCase().includes(normalizedQuery)
        if (!matchesText) return false
      }
      
      // Age filter
      if (filters.ageMin && member.age < parseInt(filters.ageMin)) return false
      if (filters.ageMax && member.age > parseInt(filters.ageMax)) return false
      
      // Department filter (dropdown)
      if (filters.department && member.department !== filters.department) return false
      
      // Weight filter (in kg)
      if (filters.weightMin && member.weight < parseInt(filters.weightMin)) return false
      if (filters.weightMax && member.weight > parseInt(filters.weightMax)) return false
      
      // Gender filter (dropdown)
      if (filters.gender && member.gender !== filters.gender) return false
      
      return true
    })

    // When AI risk filter is active, further restrict to matched members and sort by risk score
    if (aiRiskMap) {
      result = result
        .filter((member) => aiRiskMap.has(member.id))
        .sort((a, b) => {
          const scoreA = aiRiskMap.get(a.id) ?? 0
          const scoreB = aiRiskMap.get(b.id) ?? 0
          return scoreB - scoreA
        })
    }

    return result
  }, [members, debouncedQuery, filters, aiRiskMap])
  
  const clearFilters = useCallback(() => {
    setFilters({
      ageMin: "",
      ageMax: "",
      department: "",
      weightMin: "",
      weightMax: "",
      gender: "",
    })
  }, [])
  
  const clearAllFilters = useCallback(() => {
    clearFilters()
    setAIRiskFilter(null)
    // Also clear search
    handleSearchChange("")
  }, [clearFilters, handleSearchChange])
  
  const hasActiveFilters = Object.values(filters).some(v => v !== "")
  const hasAnyFilter = hasActiveFilters || aiRiskFilter !== null || debouncedQuery.trim() !== ""

  const handleLogout = () => {
    onLogout()
    navigate("/")
  }

  const handleAIRiskFilter = useCallback((data: AIRiskFilterData | null) => {
    setAIRiskFilter(data)
    // Scroll table to top when AI filter is applied
    if (data && tableRef.current) {
      tableRef.current.scrollTop = 0
      setShowScrollHint(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md group-hover:blur-lg transition-all" />
              <div className="relative rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2.5 shadow-lg">
                <HeartPulse className="size-5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xl font-semibold tracking-tight">Sync Health</span>
          </Link>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content - Two Column Layout */}
      <main className="relative z-10 mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Left Column - Main Content */}
          <div className="flex-1 min-w-0 space-y-6 animate-fade-in">
            {/* Welcome Message */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome, {capitalizeFirstLetter(user.name)}!
              </h2>
              <p className="text-muted-foreground">Manage and monitor employee health risk profiles</p>
            </div>

            {/* AI Risk Filter Banner */}
            {aiRiskFilter && (
              <div className="animate-slide-up">
                <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-lg bg-primary/15 p-2 flex-shrink-0">
                          <Sparkles className="size-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-primary">
                            AI Risk Analysis Active
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Showing top {aiRiskFilter.entries.length} employees at risk for{" "}
                            <span className="font-medium text-foreground">{aiRiskFilter.disease}</span>
                            {" "}(above 30% risk score)
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAIRiskFilter(null)}
                        className="gap-2 flex-shrink-0 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <X className="size-3" />
                        Clear AI Filter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
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
                  <div className="flex items-center gap-2">
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
                    {hasAnyFilter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3" />
                        Clear all
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Simplified Filter Panel */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-fade-in">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Age Range */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Age Range</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Min"
                            type="number"
                            value={filters.ageMin}
                            onChange={(e) => setFilters(f => ({ ...f, ageMin: e.target.value }))}
                            className="bg-muted/30"
                          />
                          <Input
                            placeholder="Max"
                            type="number"
                            value={filters.ageMax}
                            onChange={(e) => setFilters(f => ({ ...f, ageMax: e.target.value }))}
                            className="bg-muted/30"
                          />
                        </div>
                      </div>
                      
                      {/* Department Dropdown */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</label>
                        <Select
                          items={[
                            { label: "All Departments", value: ALL_DEPARTMENTS_VALUE },
                            ...departments.map((dept) => ({ label: dept, value: dept })),
                          ]}
                          value={filters.department || ALL_DEPARTMENTS_VALUE}
                          onValueChange={(value) =>
                            setFilters((f) => ({
                              ...f,
                              department: value === ALL_DEPARTMENTS_VALUE ? "" : value ?? "",
                            }))
                          }
                        >
                          <SelectTrigger className="w-full bg-muted/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="start">
                            <SelectGroup>
                              <SelectItem value={ALL_DEPARTMENTS_VALUE}>All Departments</SelectItem>
                              {departments.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Weight Range */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Weight (kg)</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Min"
                            type="number"
                            value={filters.weightMin}
                            onChange={(e) => setFilters(f => ({ ...f, weightMin: e.target.value }))}
                            className="bg-muted/30"
                          />
                          <Input
                            placeholder="Max"
                            type="number"
                            value={filters.weightMax}
                            onChange={(e) => setFilters(f => ({ ...f, weightMax: e.target.value }))}
                            className="bg-muted/30"
                          />
                        </div>
                      </div>
                      
                      {/* Gender Dropdown */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender</label>
                        <Select
                          items={[
                            { label: "All Genders", value: ALL_GENDERS_VALUE },
                            { label: "Male", value: "Male" },
                            { label: "Female", value: "Female" },
                          ]}
                          value={filters.gender || ALL_GENDERS_VALUE}
                          onValueChange={(value) =>
                            setFilters((f) => ({
                              ...f,
                              gender: value === ALL_GENDERS_VALUE ? "" : value ?? "",
                            }))
                          }
                        >
                          <SelectTrigger className="w-full bg-muted/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="start">
                            <SelectGroup>
                              <SelectItem value={ALL_GENDERS_VALUE}>All Genders</SelectItem>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {hasActiveFilters && (
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                          <X className="size-3" />
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
                  <CardTitle className="text-lg">
                    {aiRiskFilter ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        {aiRiskFilter.disease} Risk Analysis
                      </span>
                    ) : (
                      "Employee Registry"
                    )}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {filteredMembers.length} of {members.length} employees
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="relative rounded-xl border border-border/50 overflow-hidden">
                  {/* Table Header — changes based on whether AI filter is active */}
                  {aiRiskFilter ? (
                    <div className="grid grid-cols-[0.4fr_2fr_1fr_0.7fr_auto] gap-4 bg-primary/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-primary/20">
                      <span className="text-center text-primary">#</span>
                      <span>Name</span>
                      <span>Department</span>
                      <span className="text-center text-primary">Risk Score</span>
                      <span className="text-right">Action</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[2fr_1fr_0.5fr_0.5fr_auto] gap-4 bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span>Name</span>
                      <span>Department</span>
                      <span className="text-center">Age</span>
                      <span className="text-center">Gender</span>
                      <span className="text-right">Action</span>
                    </div>
                  )}
                  
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
                        <p>
                          {hasUnmatchedAIResults
                            ? "Could not match AI results to employee records."
                            : "No employees match your criteria"}
                        </p>
                        {hasUnmatchedAIResults && (
                          <p className="mt-1 text-xs text-muted-foreground/80">
                            Check member ID matching between AI `employee_id` values and dashboard records.
                          </p>
                        )}
                        {aiRiskFilter && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setAIRiskFilter(null)}
                            className="mt-2 text-primary"
                          >
                            Clear AI filter
                          </Button>
                        )}
                      </div>
                    ) : aiRiskFilter ? (
                      /* AI Risk-filtered rows — with rank + risk score column */
                      filteredMembers.map((member, i) => {
                        const riskScore = aiRiskMap?.get(member.id) ?? 0
                        return (
                          <div
                            key={member.id}
                            className="group transition-smooth hover:bg-primary/5 animate-slide-up"
                            style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                          >
                            <div className="grid grid-cols-[0.4fr_2fr_1fr_0.7fr_auto] gap-4 p-4 items-center">
                              {/* Rank */}
                              <div className="flex items-center justify-center">
                                <span className="text-xs font-bold text-muted-foreground w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                                  {i + 1}
                                </span>
                              </div>
                              {/* Name + email */}
                              <div className="min-w-0">
                                <p className="font-medium truncate">{member.fullName}</p>
                                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                              </div>
                              {/* Department */}
                              <p className="text-sm text-muted-foreground truncate">{member.department}</p>
                              {/* Risk Score */}
                              <div className="flex items-center justify-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold metric-value risk-score-shimmer ${getRiskScoreColor(riskScore)} ${getRiskScoreBg(riskScore)}`}
                                >
                                  {riskScore.toFixed(1)}%
                                </span>
                              </div>
                              {/* Action */}
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
                        )
                      })
                    ) : (
                      /* Normal rows */
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
          </div>
          
          {/* Right Column - AI Chat Sidebar */}
          <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-24">
              <AIChatSidebar
                members={members}
                onAIRiskFilter={handleAIRiskFilter}
                activeFilter={aiRiskFilter}
              />
            </div>
          </div>
        </div>

        <AIChatPlaceholder
          members={members}
          onAIRiskFilter={handleAIRiskFilter}
          activeFilter={aiRiskFilter}
        />
      </main>
    </div>
  )
}
