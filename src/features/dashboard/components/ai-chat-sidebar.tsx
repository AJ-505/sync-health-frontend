import { useCallback, useEffect, useRef, useState } from "react"
import { Bot, Send, Sparkles, User, X, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api/client"
import { ApiRequestError } from "@/lib/api/client"
import type { ChatMessage, AIRiskFilterData } from "@/lib/api"
import type { MemberRiskRecord } from "@/lib/chowdeck-members"
import { parseAIRiskResponse } from "@/lib/ai-response-parser"

let messageIdCounter = 0
function nextMessageId(): string {
  messageIdCounter += 1
  return `msg-${Date.now()}-${messageIdCounter}`
}

const GREETING_MESSAGE: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Hello! I'm your health analytics assistant. Ask me about employee health risks — for example:\n\n\"Show me employees most likely to have diabetes\"\n\"Who is at risk of hypertension?\"\n\"Which employees have high cardiovascular risk?\"",
  timestamp: Date.now(),
}

interface AIChatSidebarProps {
  members: MemberRiskRecord[]
  onAIRiskFilter: (data: AIRiskFilterData | null) => void
  activeFilter: AIRiskFilterData | null
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-primary/15 p-1.5 flex-shrink-0 mt-0.5">
        <Bot className="size-3 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-sm text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          <span className="ai-typing-text">Analysing health data</span>
          <span className="ai-typing-dots">
            <span className="ai-dot">.</span>
            <span className="ai-dot" style={{ animationDelay: "0.2s" }}>.</span>
            <span className="ai-dot" style={{ animationDelay: "0.4s" }}>.</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end animate-slide-up">
        <div className="flex-1 min-w-0 flex justify-end">
          <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm bg-primary text-primary-foreground text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
        <div className="rounded-full bg-secondary p-1.5 flex-shrink-0 mt-0.5">
          <User className="size-3 text-secondary-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 animate-slide-up">
      <div className="rounded-full bg-primary/15 p-1.5 flex-shrink-0 mt-0.5">
        <Bot className="size-3 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="max-w-[95%] text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  )
}

export function AIChatSidebar({ members, onAIRiskFilter, activeFilter }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING_MESSAGE])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  const handleSend = useCallback(async () => {
    const prompt = inputValue.trim()
    if (!prompt || isLoading) return

    setError(null)

    // Add user message
    const userMessage: ChatMessage = {
      id: nextMessageId(),
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await apiClient.analyseWithAI(prompt)

      // Add AI response message
      const assistantMessage: ChatMessage = {
        id: nextMessageId(),
        role: "assistant",
        content: typeof response === "string" ? response : JSON.stringify(response),
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Try to parse risk data from the response
      const responseText = typeof response === "string" ? response : JSON.stringify(response)
      const riskData = parseAIRiskResponse(responseText, prompt, members)

      if (riskData) {
        // We found risk data — push it up to the dashboard
        onAIRiskFilter(riskData)

        // Append a system-like message informing the user about the filter
        const filterNote: ChatMessage = {
          id: nextMessageId(),
          role: "assistant",
          content: `I've updated the employee table to show the top ${riskData.entries.length} employees at risk for ${riskData.disease} (above 30% risk score). You can clear this filter anytime.`,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, filterNote])
      }
    } catch (err) {
      const errorMessage =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again."

      setError(errorMessage)

      const errorResponse: ChatMessage = {
        id: nextMessageId(),
        role: "assistant",
        content: `I'm sorry, I encountered an error while processing your request. ${errorMessage}`,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
      // Refocus input after response
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [inputValue, isLoading, members, onAIRiskFilter])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        void handleSend()
      }
    },
    [handleSend]
  )

  const handleClearFilter = useCallback(() => {
    onAIRiskFilter(null)
  }, [onAIRiskFilter])

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/15 p-2">
            <Bot className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">Health AI Assistant</CardTitle>
            <CardDescription className="text-xs">
              Ask about employee health risks
            </CardDescription>
          </div>
          {activeFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearFilter}
              className="size-7 text-muted-foreground hover:text-foreground flex-shrink-0"
              title="Clear AI filter"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {/* Active filter indicator */}
        {activeFilter && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs">
            <Sparkles className="size-3 text-primary flex-shrink-0" />
            <span className="text-primary font-medium truncate">
              Filtering: {activeFilter.disease} risk — {activeFilter.entries.length} employees
            </span>
            <button
              onClick={handleClearFilter}
              className="ml-auto text-primary/70 hover:text-primary transition-colors flex-shrink-0"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}

          {error && !isLoading && (
            <div className="flex items-center gap-2 text-xs text-destructive px-2">
              <AlertTriangle className="size-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border/50 p-3 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask about employee health risks..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-muted/30 text-sm"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={() => void handleSend()}
              disabled={isLoading || !inputValue.trim()}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
