import { useState } from "react"
import { Bot, MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AIRiskFilterData } from "@/lib/api"
import type { MemberRiskRecord } from "@/lib/chowdeck-members"
import { AIChatSidebar } from "./ai-chat-sidebar"

interface AIChatPlaceholderProps {
  members: MemberRiskRecord[]
  onAIRiskFilter: (data: AIRiskFilterData | null) => void
  activeFilter: AIRiskFilterData | null
}

export function AIChatPlaceholder({
  members,
  onAIRiskFilter,
  activeFilter,
}: AIChatPlaceholderProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen((prev) => !prev)}
          size="lg"
          className="size-14 rounded-full shadow-lg shadow-primary/25 p-0"
          aria-label={isOpen ? "Close health AI assistant" : "Open health AI assistant"}
        >
          {isOpen ? (
            <X className="size-6" />
          ) : (
            <MessageCircle className="size-6" />
          )}
        </Button>
      </div>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-background/65 backdrop-blur-sm"
          aria-label="Close health AI assistant"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 animate-slide-up">
          <div className="mx-auto w-full max-w-md space-y-2">
            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/90 px-3 py-2 backdrop-blur-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="rounded-lg bg-primary/15 p-1.5">
                  <Bot className="size-4 text-primary" />
                </div>
                <p className="text-sm font-medium truncate">Health AI Assistant</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="size-7"
              >
                <X className="size-4" />
              </Button>
            </div>

            <AIChatSidebar
              members={members}
              onAIRiskFilter={onAIRiskFilter}
              activeFilter={activeFilter}
              className="h-[min(78vh,42rem)]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
