/**
 * AI Response Parser
 *
 * Parses the string returned by POST /ai/analyse to extract:
 * 1. Whether the response contains risk-analysis data (employee + score pairs)
 * 2. The disease/condition being analysed
 * 3. Individual employee risk entries
 *
 * The backend Gemini pipeline returns a free-form text string.
 * We parse it heuristically — looking for patterns like:
 *   "Employee Name - 72%" or "Employee Name: 72%" or "Employee Name (72%)"
 *   or tabular formats with name and percentage columns.
 */

import type { AIRiskEntry, AIRiskFilterData } from "@/lib/api"
import type { MemberRiskRecord } from "@/lib/chowdeck-members"

const RISK_SCORE_THRESHOLD = 30

/**
 * Detect whether the AI response contains structured risk data
 * (i.e. employee-name + percentage pairs).
 */
export function containsRiskData(response: string): boolean {
  // Look for patterns like "Name - 72%", "Name: 72%", "Name (72%)", or just "72%"
  const percentagePattern = /\d{1,3}(?:\.\d+)?%/g
  const matches = response.match(percentagePattern)
  // If there are at least 2 percentage values, likely risk data
  return matches !== null && matches.length >= 2
}

/**
 * Try to extract the disease/condition the user asked about from the AI response.
 * Falls back to the original user prompt if we can't find it in the response.
 */
export function extractDiseaseName(aiResponse: string, userPrompt: string): string {
  // Common diseases we support
  const knownDiseases = [
    "hypertension",
    "diabetes",
    "cardiovascular",
    "heart disease",
    "stroke",
    "obesity",
    "high cholesterol",
    "kidney disease",
    "asthma",
    "thyroid",
  ]

  const combinedText = `${userPrompt} ${aiResponse}`.toLowerCase()

  for (const disease of knownDiseases) {
    if (combinedText.includes(disease)) {
      // Capitalize first letter of each word
      return disease.replace(/\b\w/g, (c) => c.toUpperCase())
    }
  }

  // Fallback: try to extract from user prompt
  const promptLower = userPrompt.toLowerCase()
  // Look for "risk of <disease>" or "likely to have <disease>"
  const riskOfMatch = promptLower.match(
    /(?:risk\s+(?:of|for)|likely\s+to\s+(?:have|get|develop)|prone\s+to|susceptible\s+to)\s+(.+?)(?:\s+disease)?(?:\?|$|\.)/
  )
  if (riskOfMatch) {
    return riskOfMatch[1].replace(/\b\w/g, (c) => c.toUpperCase()).trim()
  }

  return "Health Risk"
}

/**
 * Fuzzy-match an employee name from the AI response to a MemberRiskRecord.
 *
 * Strategy:
 * 1. Exact match (case-insensitive)
 * 2. The AI name is contained in the member's full name
 * 3. The member's full name is contained in the AI name
 * 4. First + last name token overlap (at least 1 matching token)
 */
function findMatchingMember(
  aiName: string,
  members: MemberRiskRecord[]
): MemberRiskRecord | null {
  const normalized = aiName.trim().toLowerCase()
  if (!normalized) return null

  // 1. Exact match
  const exact = members.find((m) => m.fullName.toLowerCase() === normalized)
  if (exact) return exact

  // 2. Containment (either direction)
  const contains = members.find(
    (m) =>
      m.fullName.toLowerCase().includes(normalized) ||
      normalized.includes(m.fullName.toLowerCase())
  )
  if (contains) return contains

  // 3. Token overlap — at least one first/last name token must match
  const aiTokens = normalized.split(/\s+/).filter((t) => t.length > 1)
  if (aiTokens.length === 0) return null

  let bestMatch: MemberRiskRecord | null = null
  let bestScore = 0

  for (const member of members) {
    const memberTokens = member.fullName.toLowerCase().split(/\s+/)
    let matchCount = 0

    for (const aiToken of aiTokens) {
      if (memberTokens.some((mt) => mt === aiToken || mt.includes(aiToken) || aiToken.includes(mt))) {
        matchCount++
      }
    }

    const score = matchCount / Math.max(aiTokens.length, memberTokens.length)
    if (score > bestScore && matchCount >= 1) {
      bestScore = score
      bestMatch = member
    }
  }

  return bestScore >= 0.5 ? bestMatch : null
}

/**
 * Parse the AI response text into structured risk entries.
 *
 * Handles various formats the Gemini model may return:
 * - "1. Employee Name - 72%"
 * - "Employee Name: 72%"
 * - "Employee Name (72% risk)"
 * - "| Employee Name | 72% |" (table format)
 * - "Employee Name — Risk Score: 72%"
 */
function extractRiskEntries(
  response: string,
  members: MemberRiskRecord[]
): AIRiskEntry[] {
  const entries: AIRiskEntry[] = []
  const seenMemberIds = new Set<string>()

  // Split into lines for line-by-line parsing
  const lines = response.split("\n")

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Try multiple patterns to extract (name, score) pairs from a single line

    // Pattern 1: "Name - 72%" or "Name — 72%" or "Name: 72%"
    // Pattern 2: "1. Name - 72%" or "- Name - 72%"  (list items)
    // Pattern 3: "| Name | 72% |" (table rows)
    // Pattern 4: "Name (72%)" or "Name (72% risk)"
    // Pattern 5: "Name ... Risk Score: 72%"
    const patterns = [
      // List items with dash/colon separator before percentage
      /^(?:\d+[.)]\s*|-\s*|\*\s*)?(.+?)\s*[-–—:]\s*(\d{1,3}(?:\.\d+)?)\s*%/,
      // Table row: | name | score% |
      /^\|?\s*(.+?)\s*\|\s*(\d{1,3}(?:\.\d+)?)\s*%/,
      // Name (score%)
      /^(?:\d+[.)]\s*|-\s*|\*\s*)?(.+?)\s*\(\s*(\d{1,3}(?:\.\d+)?)\s*%/,
      // "Name ... Risk Score: 72%"
      /^(?:\d+[.)]\s*|-\s*|\*\s*)?(.+?)\s+(?:risk\s*score|score|risk)\s*[:=]\s*(\d{1,3}(?:\.\d+)?)\s*%/i,
    ]

    for (const pattern of patterns) {
      const match = trimmed.match(pattern)
      if (!match) continue

      const rawName = match[1]
        .replace(/\*+/g, "") // Remove markdown bold
        .replace(/^\||\|$/g, "") // Remove table pipe chars
        .trim()
      const score = parseFloat(match[2])

      // Skip if name looks like a header or is too short
      if (
        rawName.length < 2 ||
        /^(name|employee|person|#|no\.|risk|score)/i.test(rawName)
      ) {
        continue
      }

      // Skip unreasonable scores
      if (score < 0 || score > 100 || !Number.isFinite(score)) {
        continue
      }

      const member = findMatchingMember(rawName, members)
      const memberId = member?.id ?? null

      // Avoid duplicates for the same member
      if (memberId && seenMemberIds.has(memberId)) continue
      if (memberId) seenMemberIds.add(memberId)

      entries.push({
        employeeName: member?.fullName ?? rawName,
        memberId,
        riskScore: Math.round(score * 10) / 10,
      })

      break // Only match the first pattern per line
    }
  }

  return entries
}

/**
 * Main entry point: parse an AI response into a full AIRiskFilterData object.
 *
 * Returns null if the response doesn't contain parseable risk data.
 */
export function parseAIRiskResponse(
  aiResponse: string,
  userPrompt: string,
  members: MemberRiskRecord[]
): AIRiskFilterData | null {
  if (!containsRiskData(aiResponse)) {
    return null
  }

  const disease = extractDiseaseName(aiResponse, userPrompt)
  const allEntries = extractRiskEntries(aiResponse, members)

  // Filter to entries above threshold and that we could match to a member
  const filtered = allEntries
    .filter((e) => e.memberId !== null && e.riskScore >= RISK_SCORE_THRESHOLD)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10) // Top 10

  if (filtered.length === 0) {
    return null
  }

  return {
    disease,
    entries: filtered,
    rawResponse: aiResponse,
  }
}
