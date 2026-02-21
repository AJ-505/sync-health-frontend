import { Link, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  ArrowUpRight,
  Filter,
  HeartPulse,
  Mail,
  Search,
  Shield,
  Users,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function LandingPage() {
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
              onClick={() => navigate("/login")} 
              className="hidden sm:inline-flex shadow-lg shadow-primary/20"
            >
              Sign In
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
                <Shield className="size-4" />
                <span className="font-medium">Corporate Wellness Platform</span>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Syncing Data into{" "}
                <span className="text-primary">Protection</span>
              </h1>
              
              <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                Using AI to turn silent health records into proactive lifesavers. 
                View employee health profiles, filter by demographics, and take action with personalized outreach.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/login")}
                  className="shadow-lg shadow-primary/25 text-base"
                >
                  Sign In to Dashboard
                  <ArrowUpRight className="ml-2 size-5" />
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                <div className="text-center">
                  <p className="metric-value text-2xl font-bold">50+</p>
                  <p className="text-xs text-muted-foreground">Employees Tracked</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="metric-value text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Disease Risks</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="metric-value text-2xl font-bold">AI</p>
                  <p className="text-xs text-muted-foreground">Risk Prediction</p>
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
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Employee Dashboard</p>
                      <p className="text-lg font-semibold">Health Risk Profiles</p>
                    </div>
                  </div>
                  
                  {/* Mock filter bar */}
                  <div className="flex gap-2">
                    <div className="flex-1 h-9 rounded-md bg-muted/50 flex items-center px-3 gap-2">
                      <Search className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Search employees...</span>
                    </div>
                    <div className="h-9 rounded-md bg-muted/50 flex items-center px-3 gap-2">
                      <Filter className="size-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Filters</span>
                    </div>
                  </div>
                  
                  {/* Mock table rows */}
                  <div className="space-y-2">
                    {[
                      { name: "Yetunde E.", dept: "Operations", risk: "High" },
                      { name: "Ngozi B.", dept: "People", risk: "Low" },
                      { name: "Kayode B.", dept: "Finance", risk: "Moderate" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            {item.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.dept}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.risk === 'High' ? 'bg-destructive/15 text-destructive' :
                          item.risk === 'Moderate' ? 'bg-warning/15 text-warning' :
                          'bg-success/15 text-success'
                        }`}>
                          {item.risk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 animate-slide-in-right stagger-4">
                <div className="rounded-xl border border-primary/30 bg-card/90 p-3 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/15 p-2">
                      <Mail className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quick Actions</p>
                      <p className="text-sm font-medium">Email Outreach</p>
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
              What You Can Do
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simple, focused tools for employee health management
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Users,
                title: "Employee Registry",
                description: "View all employees with their health profiles, demographics, and AI-predicted disease risks.",
              },
              {
                icon: Filter,
                title: "Smart Filtering",
                description: "Filter by age range, department, weight, and gender to find specific employee groups.",
              },
              {
                icon: Shield,
                title: "Risk Assessment",
                description: "See hypertension, diabetes, and cardiovascular risk percentages for each employee.",
              },
              {
                icon: Mail,
                title: "Direct Outreach",
                description: "Send personalized emails to employees with contextual health recommendations.",
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
            Ready to manage your workforce health?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sign in to access your organization's employee health dashboard.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/login")}
            className="mt-8 shadow-lg shadow-primary/25"
          >
            Sign In Now
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HeartPulse className="size-4 text-primary" />
            <span>Sync Health</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Corporate Wellness Intelligence
          </p>
        </div>
      </footer>
    </div>
  )
}
