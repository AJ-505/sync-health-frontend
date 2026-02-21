import { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { AlertTriangle, ArrowLeft, HeartPulse, Mail } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MemberRiskRecord } from "@/lib/chowdeck-members"

export function EmployeeDetailsPage({ members }: { members: MemberRiskRecord[] }) {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  
  const employee = useMemo(
    () => members.find(m => m.id === employeeId) ?? null,
    [members, employeeId]
  )
  
  if (!employee) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
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

  const handleSendEmailClick = () => {
    window.open(mailtoLink, "_blank", "noopener,noreferrer")
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="size-5" />
            </Button>
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md group-hover:blur-lg transition-all" />
                <div className="relative rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2.5 shadow-lg">
                  <HeartPulse className="size-5 text-primary-foreground" />
                </div>
              </div>
              <span className="text-xl font-semibold tracking-tight">Sync Health</span>
            </Link>
          </div>
          <ModeToggle />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6 animate-fade-in">
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
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSendEmailClick}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    <Mail className="mr-2 size-4" />
                    Send Email
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Risk Percentages & Vitals */}
          <div className="grid gap-6 lg:grid-cols-1">
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
                    { label: "Past Diseases", value: employee.pastDiseases.length > 0 ? employee.pastDiseases.join(", ") : "None" },
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
        </div>
      </main>
    </div>
  )
}
