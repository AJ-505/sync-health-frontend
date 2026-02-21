import { useState } from "react"
import { Bot, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function AIChatSidebar() {
  const [message, setMessage] = useState("")
  
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 flex-shrink-0">
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
      <CardContent className="flex-1 flex flex-col p-4 min-h-0">
        <div className="flex-1 rounded-lg bg-muted/30 p-4 mb-4 overflow-y-auto">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/15 p-1.5 flex-shrink-0">
              <Bot className="size-3 text-primary" />
            </div>
            <div className="flex-1 space-y-2 min-w-0">
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
        <div className="flex gap-2 flex-shrink-0">
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
  )
}
