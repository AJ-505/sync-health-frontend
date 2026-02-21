import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowRight, ChevronDown, Filter, HeartPulse, LogOut, Search, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { MemberRiskRecord } from "@/lib/chowdeck-members"
import type { User } from "@/lib/api"
import { AIChatSidebar } from "@/features/dashboard/components"

// Get unique departments from members
function getUniqueDepartments(members: MemberRiskRecord[]): string[] {
  return [...new Set(members.map(m => m.department))].sort()
}

interface DashboardOverviewPageProps {
  members: MemberRiskRecord[]
  user: User
  onLogout: () => void
}

export function DashboardOverviewPage({ members, user, onLogout }: DashboardOverviewPageProps) {
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
  }, [members, debouncedQuery, filters])
  
  const clearFilters = () => {
    setFilters({
      ageMin: "",
      ageMax: "",
      department: "",
      weightMin: "",
      weightMax: "",
      gender: "",
    })
  }
  
  const hasActiveFilters = Object.values(filters).some(v => v !== "")

  const handleLogout = () => {
    onLogout()
    navigate("/")
  }

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
                Welcome, {user.name}!
              </h2>
              <p className="text-muted-foreground">Manage and monitor employee health risk profiles</p>
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
                        <div className="relative">
                          <select
                            value={filters.department}
                            onChange={(e) => setFilters(f => ({ ...f, department: e.target.value }))}
                            className="w-full h-10 px-3 rounded-md border border-input bg-muted/30 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        </div>
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
                        <div className="relative">
                          <select
                            value={filters.gender}
                            onChange={(e) => setFilters(f => ({ ...f, gender: e.target.value }))}
                            className="w-full h-10 px-3 rounded-md border border-input bg-muted/30 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        </div>
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
          </div>
          
          {/* Right Column - AI Chat Sidebar */}
          <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-24">
              <AIChatSidebar />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
