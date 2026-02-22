/**
 * AI Response Parser
 *
 * Handles the response from POST /ai/analyse which can be:
 *
 * 1. A structured JSON object (when already parsed by fetch .json()):
 *    { condition: "...", scored_employees: [...] }
 *
 * 2. A JSON-encoded string (the Swagger schema says response is "string",
 *    so the HTTP body may be a JSON string containing JSON):
 *    '{"condition":"...","scored_employees":[...]}'
 *
 * 3. A plain text string (non-health queries):
 *    "I can only answer health-related questions."
 */

import type {
  AIAnalyseResponse,
  AIAnalyseStructuredResponse,
  AIScoredEmployee,
  AIRiskEntry,
  AIRiskFilterData,
} from "@/lib/api"
import type { MemberRiskRecord } from "@/lib/chowdeck-members"

const RISK_SCORE_THRESHOLD = 30
const EMPTY_AI_RESPONSE_MESSAGE = "No response received from the AI service."

/**
 * Type guard: check if a value looks like our structured response.
 */
function isStructuredShape(
  value: unknown
): value is AIAnalyseStructuredResponse {
  if (!value || typeof value !== "object") return false
  const obj = value as Record<string, unknown>
  return "scored_employees" in obj && Array.isArray(obj.scored_employees)
}

/**
 * Normalize the API response into either a structured object or a plain string.
 *
 * The backend Swagger declares the 200 response as type "string", which means
 * the HTTP body may arrive as a JSON-encoded string. When fetch's .json()
 * parses it, we get a JavaScript string that itself contains JSON.
 *
 * This function handles all three shapes:
 *   - Already an object with scored_employees -> return as-is
 *   - A string containing JSON with scored_employees -> parse and return object
 *   - A plain string -> return as-is
 */
export function normalizeAIResponse(
  raw: AIAnalyseResponse
): AIAnalyseStructuredResponse | string {
  if (raw === null || raw === undefined) {
    return EMPTY_AI_RESPONSE_MESSAGE
  }

  // Case 1: Already a parsed object
  if (typeof raw !== "string") {
    if (isStructuredShape(raw)) return raw
    // Unknown object shape — stringify for display
    try {
      const serialized = JSON.stringify(raw)
      return serialized ?? "The AI service returned an empty response."
    } catch {
      return "The AI service returned an unreadable response."
    }
  }

  // Case 2 & 3: It's a string. Try to parse as JSON.
  const trimmed = raw.trim()
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed)

      // Could be double-encoded (string inside string)
      if (typeof parsed === "string") {
        try {
          const doubleParsed: unknown = JSON.parse(parsed)
          if (isStructuredShape(doubleParsed)) return doubleParsed
        } catch {
          // Not double-encoded, that's fine
        }
        // The parsed string itself might be a plain message
        return parsed
      }

      if (isStructuredShape(parsed)) return parsed

      // Parsed to some other shape — return the original string
      return raw
    } catch {
      // Not valid JSON — return as plain text
      return raw
    }
  }

  // Plain text response (non-health query)
  return raw
}

/**
 * Extract a human-readable disease name from the condition string.
 */
function extractDiseaseName(condition: string): string {
  const knownDiseases: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /hypertension/i, label: "Hypertension" },
    { pattern: /diabetes/i, label: "Diabetes" },
    { pattern: /cardiovascular/i, label: "Cardiovascular Disease" },
    { pattern: /heart\s*disease/i, label: "Heart Disease" },
    { pattern: /stroke/i, label: "Stroke" },
    { pattern: /obesity|obese/i, label: "Obesity" },
    { pattern: /cholesterol/i, label: "High Cholesterol" },
    { pattern: /kidney/i, label: "Kidney Disease" },
    { pattern: /asthma/i, label: "Asthma" },
    { pattern: /thyroid/i, label: "Thyroid Disorder" },
  ]

  for (const { pattern, label } of knownDiseases) {
    if (pattern.test(condition)) return label
  }

  const riskOfMatch = condition.match(
    /(?:risk\s+(?:of|for)|likely\s+to\s+(?:have|get|develop))\s+(.+?)(?:\?|$|\.)/i
  )
  if (riskOfMatch) {
    return riskOfMatch[1].replace(/\b\w/g, (c) => c.toUpperCase()).trim()
  }

  return "Health Risk"
}

/**
 * Build a lookup map from employee_id -> MemberRiskRecord.
 * Supports case-insensitive matching.
 */
function buildMemberLookup(
  members: MemberRiskRecord[]
): Map<string, MemberRiskRecord> {
  const map = new Map<string, MemberRiskRecord>()
  for (const member of members) {
    map.set(normalizeMemberId(member.id), member)
  }
  return map
}

/**
 * Normalize IDs for lookup consistency across backend/frontend.
 */
function normalizeMemberId(value: unknown): string {
  return String(value ?? "").trim().toLowerCase()
}

/**
 * Make debug logging safe for arbitrary response shapes.
 */
function toPreview(value: unknown): string {
  if (typeof value === "string") {
    return value.slice(0, 200)
  }

  try {
    const serialized = JSON.stringify(value)
    return (serialized ?? String(value)).slice(0, 200)
  } catch {
    return String(value).slice(0, 200)
  }
}

/**
 * Main entry point: convert a raw AI API response into AIRiskFilterData.
 *
 * Returns null if the response is not a structured risk analysis.
 */
export function parseAIRiskResponse(
  raw: AIAnalyseResponse,
  userPrompt: string,
  members: MemberRiskRecord[]
): AIRiskFilterData | null {
  console.warn("[AI Parser] Raw /ai/analyse response received", {
    type: raw === null ? "null" : typeof raw,
    preview: toPreview(raw),
  })

  const response = normalizeAIResponse(raw)
  console.warn("[AI Parser] normalizeAIResponse result", {
    type: typeof response === "string" ? "string" : "object",
  })

  // If it normalized to a string, there's no structured data
  if (typeof response === "string") return null

  if (!response.scored_employees || response.scored_employees.length === 0) {
    return null
  }

  const disease = extractDiseaseName(response.condition || userPrompt)
  const memberLookup = buildMemberLookup(members)
  const availableMemberIds = members.map((member) => member.id)

  const entries: AIRiskEntry[] = []

  for (const scored of response.scored_employees) {
    // Convert 0-1 probability to 0-100 percentage
    const riskScore = Math.round(scored.risk_probability * 100 * 10) / 10

    if (riskScore < RISK_SCORE_THRESHOLD) continue

    const normalizedEmployeeId = normalizeMemberId(scored.employee_id)
    const member = memberLookup.get(normalizedEmployeeId) ?? null

    if (!member) {
      console.warn("[AI Parser] Failed to match scored employee to member record", {
        employeeId: scored.employee_id,
        normalizedEmployeeId,
        availableMemberIds,
      })
    }

    entries.push({
      employeeId: scored.employee_id,
      employeeName: member?.fullName ?? scored.employee_id,
      memberId: member?.id ?? null,
      riskScore,
      confidence: scored.confidence ?? "unknown",
      evidence: scored.evidence ?? [],
    })
  }

  entries.sort((a, b) => b.riskScore - a.riskScore)
  const topEntries = entries.slice(0, 10)

  if (topEntries.length === 0) return null

  return {
    disease,
    entries: topEntries,
    rawResponse: JSON.stringify(response, null, 2),
  }
}

/**
 * Format the AI response as a human-readable chat message.
 * Converts structured risk data into a readable summary with employee names.
 */
export function formatAIResponseForChat(
  raw: AIAnalyseResponse,
  members: MemberRiskRecord[]
): string {
  const response = normalizeAIResponse(raw)

  // Plain string response (non-health query)
  if (typeof response === "string") return response

  const { scored_employees } = response

  if (!scored_employees || scored_employees.length === 0) {
    return "I analysed your query but found no employees with significant risk scores."
  }

  const memberLookup = buildMemberLookup(members)

  const formatEmployee = (emp: AIScoredEmployee): string => {
    const member = memberLookup.get(normalizeMemberId(emp.employee_id))
    return member ? member.fullName : emp.employee_id
  }

  const lines: string[] = [
    "Here are the employees identified with significant risk:",
    "",
  ]

  for (let i = 0; i < scored_employees.length; i++) {
    const emp = scored_employees[i]
    const pct = Math.round(emp.risk_probability * 100)
    const name = formatEmployee(emp)
    lines.push(`${i + 1}. ${name} — ${pct}% risk`)

    if (emp.evidence && emp.evidence.length > 0) {
      const topEvidence = emp.evidence.slice(0, 2)
      for (const ev of topEvidence) {
        lines.push(`   • ${ev}`)
      }
    }
  }

  return lines.join("\n").trim()
}
