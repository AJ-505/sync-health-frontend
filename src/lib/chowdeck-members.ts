export type SmokingStatus = "Non-smoker" | "Former smoker" | "Current smoker"
export type ExerciseFrequency = "Rarely" | "1-2x / week" | "3-4x / week" | "5+x / week"
export type StressLevel = "Low" | "Moderate" | "High"
export type RiskLevel = "Low" | "Moderate" | "High"

export type MemberRiskRecord = {
  id: string
  fullName: string
  email: string
  department: string
  age: number
  bmi: number
  bloodPressure: string
  fastingBloodGlucoseMgDl: number
  cholesterolMgDl: number
  smokingStatus: SmokingStatus
  exerciseFrequency: ExerciseFrequency
  familyHistory: "Yes" | "No"
  stressLevel: StressLevel
  hypertensionRiskPct: number
  diabetesRiskPct: number
  cardiovascularRiskPct: number
  overallRisk: RiskLevel
  recommendation: string
}

export type MemberInputRecord = {
  fullName: string
  email: string
  department: string
  age: number
  bmi: number
  bloodPressure: string
  fastingBloodGlucoseMgDl: number
  cholesterolMgDl: number
  smokingStatus: SmokingStatus
  exerciseFrequency: ExerciseFrequency
  familyHistory: "Yes" | "No"
  stressLevel: StressLevel
}

export type ParsedMembersResult = {
  members: MemberRiskRecord[]
  errors: string[]
}

const firstNames = [
  "Aisha",
  "Emeka",
  "Tosin",
  "Bolanle",
  "Chioma",
  "Ifeanyi",
  "Zainab",
  "Damilola",
  "Chinedu",
  "Kemi",
]

const lastNames = [
  "Adeyemi",
  "Okafor",
  "Ibrahim",
  "Afolayan",
  "Balogun",
  "Umeh",
  "Nwosu",
  "Bello",
  "Lawal",
  "Ogunleye",
]

const departments = [
  "Operations",
  "People",
  "Finance",
  "Engineering",
  "Growth",
  "Customer Success",
  "Product",
  "Compliance",
]

const exercisePatterns: ExerciseFrequency[] = [
  "Rarely",
  "1-2x / week",
  "3-4x / week",
  "5+x / week",
]

const stressPatterns: StressLevel[] = ["Low", "Moderate", "High"]

const smokingStatusMap: Record<string, SmokingStatus> = {
  "nonsmoker": "Non-smoker",
  "non-smoker": "Non-smoker",
  "never": "Non-smoker",
  "former": "Former smoker",
  "ex-smoker": "Former smoker",
  "formersmoker": "Former smoker",
  "former smoker": "Former smoker",
  "current": "Current smoker",
  "smoker": "Current smoker",
  "current smoker": "Current smoker",
}

const exerciseMap: Record<string, ExerciseFrequency> = {
  "rarely": "Rarely",
  "1-2x/week": "1-2x / week",
  "1-2x / week": "1-2x / week",
  "1-2": "1-2x / week",
  "3-4x/week": "3-4x / week",
  "3-4x / week": "3-4x / week",
  "3-4": "3-4x / week",
  "5+x/week": "5+x / week",
  "5+x / week": "5+x / week",
  "5+": "5+x / week",
}

const stressMap: Record<string, StressLevel> = {
  "low": "Low",
  "moderate": "Moderate",
  "medium": "Moderate",
  "high": "High",
}

const familyHistoryMap: Record<string, "Yes" | "No"> = {
  "yes": "Yes",
  "y": "Yes",
  "true": "Yes",
  "1": "Yes",
  "no": "No",
  "n": "No",
  "false": "No",
  "0": "No",
}

const importHeaderAliases: Record<string, keyof MemberInputRecord> = {
  fullname: "fullName",
  name: "fullName",
  email: "email",
  department: "department",
  age: "age",
  bmi: "bmi",
  bloodpressure: "bloodPressure",
  bp: "bloodPressure",
  fastingbloodglucosemgdl: "fastingBloodGlucoseMgDl",
  fastingbloodglucose: "fastingBloodGlucoseMgDl",
  glucose: "fastingBloodGlucoseMgDl",
  cholesterolmgdl: "cholesterolMgDl",
  cholesterol: "cholesterolMgDl",
  smokingstatus: "smokingStatus",
  smoking: "smokingStatus",
  exercisefrequency: "exerciseFrequency",
  exercise: "exerciseFrequency",
  familyhistory: "familyHistory",
  stresslevel: "stressLevel",
  stress: "stressLevel",
}

const requiredInputFields: Array<keyof MemberInputRecord> = [
  "fullName",
  "email",
  "department",
  "age",
  "bmi",
  "bloodPressure",
  "fastingBloodGlucoseMgDl",
  "cholesterolMgDl",
  "smokingStatus",
  "exerciseFrequency",
  "familyHistory",
  "stressLevel",
]

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim()
}

function toNumber(value: unknown): number {
  const parsed = Number(String(value ?? "").trim())
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function parseBloodPressure(value: string): { systolic: number; diastolic: number } | null {
  const match = value.match(/^(\d{2,3})\s*\/?\s*(\d{2,3})$/)

  if (!match) return null

  const systolic = Number(match[1])
  const diastolic = Number(match[2])

  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return null

  return { systolic, diastolic }
}

function getOverallRisk(
  hypertensionRiskPct: number,
  diabetesRiskPct: number,
  cardiovascularRiskPct: number
): RiskLevel {
  const peakRisk = Math.max(
    hypertensionRiskPct,
    diabetesRiskPct,
    cardiovascularRiskPct
  )

  if (peakRisk >= 67) return "High"
  if (peakRisk >= 40) return "Moderate"
  return "Low"
}

function getRecommendation(overallRisk: RiskLevel): string {
  if (overallRisk === "High") {
    return "Refer to partner clinic and enroll in tracked wellness intervention."
  }

  if (overallRisk === "Moderate") {
    return "Assign a personalized fitness and diet plan with monthly check-ins."
  }

  return "Maintain current lifestyle and send quarterly prevention tips."
}

export function buildRiskRecord(input: MemberInputRecord, id: string): MemberRiskRecord {
  const bp = parseBloodPressure(input.bloodPressure)

  if (!bp) {
    throw new Error("bloodPressure must be in systolic/diastolic format, e.g. 120/80")
  }

  const hypertensionRiskPct = clamp(
    Math.round(
      (input.age - 20) * 1.2 +
        (input.bmi - 20) * 2 +
        (bp.systolic - 110) * 0.8 +
        (input.stressLevel === "High" ? 12 : input.stressLevel === "Moderate" ? 6 : 2) +
        (input.smokingStatus === "Current smoker"
          ? 10
          : input.smokingStatus === "Former smoker"
            ? 4
            : 0) +
        (input.familyHistory === "Yes" ? 8 : 0)
    ),
    5,
    95
  )

  const diabetesRiskPct = clamp(
    Math.round(
      (input.fastingBloodGlucoseMgDl - 80) * 1.05 +
        (input.bmi - 21) * 1.8 +
        (input.age - 22) * 0.55 +
        (input.exerciseFrequency === "Rarely"
          ? 10
          : input.exerciseFrequency === "1-2x / week"
            ? 5
            : input.exerciseFrequency === "3-4x / week"
              ? 2
              : 0) +
        (input.familyHistory === "Yes" ? 9 : 0)
    ),
    4,
    94
  )

  const cardiovascularRiskPct = clamp(
    Math.round(
      (input.cholesterolMgDl - 150) * 0.55 +
        (bp.systolic - 110) * 0.7 +
        (input.age - 22) * 0.65 +
        (input.smokingStatus === "Current smoker"
          ? 12
          : input.smokingStatus === "Former smoker"
            ? 5
            : 0) +
        (input.stressLevel === "High" ? 8 : input.stressLevel === "Moderate" ? 4 : 0)
    ),
    6,
    93
  )

  const overallRisk = getOverallRisk(
    hypertensionRiskPct,
    diabetesRiskPct,
    cardiovascularRiskPct
  )

  return {
    ...input,
    id,
    hypertensionRiskPct,
    diabetesRiskPct,
    cardiovascularRiskPct,
    overallRisk,
    recommendation: getRecommendation(overallRisk),
  }
}

function buildMember(index: number): MemberRiskRecord {
  const firstName = firstNames[index % firstNames.length]
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length]

  const age = 22 + ((index * 3) % 28)
  const bmi = Number((18.6 + ((index * 1.65) % 13.8)).toFixed(1))
  const systolic = 104 + ((index * 5) % 48)
  const diastolic = 66 + ((index * 3) % 30)

  const input: MemberInputRecord = {
    fullName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@chowdeck.com`,
    department: departments[index % departments.length],
    age,
    bmi,
    bloodPressure: `${systolic}/${diastolic}`,
    fastingBloodGlucoseMgDl: 76 + ((index * 4) % 58),
    cholesterolMgDl: 145 + ((index * 7) % 120),
    smokingStatus:
      index % 8 === 0 ? "Current smoker" : index % 5 === 0 ? "Former smoker" : "Non-smoker",
    exerciseFrequency: exercisePatterns[index % exercisePatterns.length],
    familyHistory: index % 3 === 0 ? "Yes" : "No",
    stressLevel: stressPatterns[(index + 1) % stressPatterns.length],
  }

  return buildRiskRecord(input, `chowdeck-${index + 1}`)
}

function parseEnum<T extends string>(
  rowIndex: number,
  field: keyof MemberInputRecord,
  value: unknown,
  map: Record<string, T>
): { value?: T; error?: string } {
  const text = normalizeText(value)
  const normalized = normalizeKey(text)
  const mapped = map[text.toLowerCase()] ?? map[normalized]

  if (!mapped) {
    return {
      error: `Row ${rowIndex}: invalid ${String(field)} value "${text}"`,
    }
  }

  return { value: mapped }
}

function mapRowHeaders(row: Record<string, unknown>): Partial<Record<keyof MemberInputRecord, unknown>> {
  const mapped: Partial<Record<keyof MemberInputRecord, unknown>> = {}

  for (const [key, value] of Object.entries(row)) {
    const mappedKey = importHeaderAliases[normalizeKey(key)]

    if (!mappedKey) continue

    mapped[mappedKey] = value
  }

  return mapped
}

export function parseImportedMembers(rows: Array<Record<string, unknown>>): ParsedMembersResult {
  const members: MemberRiskRecord[] = []
  const errors: string[] = []

  rows.forEach((row, index) => {
    const rowIndex = index + 2
    const mapped = mapRowHeaders(row)

    const missing = requiredInputFields.filter((field) => {
      const value = mapped[field]
      return value === undefined || normalizeText(value) === ""
    })

    if (missing.length > 0) {
      errors.push(`Row ${rowIndex}: missing ${missing.join(", ")}`)
      return
    }

    const age = toNumber(mapped.age)
    const bmi = toNumber(mapped.bmi)
    const fastingBloodGlucoseMgDl = toNumber(mapped.fastingBloodGlucoseMgDl)
    const cholesterolMgDl = toNumber(mapped.cholesterolMgDl)

    if ([age, bmi, fastingBloodGlucoseMgDl, cholesterolMgDl].some((value) => Number.isNaN(value))) {
      errors.push(`Row ${rowIndex}: age, bmi, fastingBloodGlucoseMgDl, and cholesterolMgDl must be numeric`)
      return
    }

    const smokingResult = parseEnum(rowIndex, "smokingStatus", mapped.smokingStatus, smokingStatusMap)
    if (smokingResult.error) {
      errors.push(smokingResult.error)
      return
    }

    const exerciseResult = parseEnum(rowIndex, "exerciseFrequency", mapped.exerciseFrequency, exerciseMap)
    if (exerciseResult.error) {
      errors.push(exerciseResult.error)
      return
    }

    const familyResult = parseEnum(rowIndex, "familyHistory", mapped.familyHistory, familyHistoryMap)
    if (familyResult.error) {
      errors.push(familyResult.error)
      return
    }

    const stressResult = parseEnum(rowIndex, "stressLevel", mapped.stressLevel, stressMap)
    if (stressResult.error) {
      errors.push(stressResult.error)
      return
    }

    const bloodPressure = normalizeText(mapped.bloodPressure)

    if (!parseBloodPressure(bloodPressure)) {
      errors.push(`Row ${rowIndex}: bloodPressure must be like 120/80`)
      return
    }

    try {
      members.push(
        buildRiskRecord(
          {
            fullName: normalizeText(mapped.fullName),
            email: normalizeText(mapped.email),
            department: normalizeText(mapped.department),
            age,
            bmi,
            bloodPressure,
            fastingBloodGlucoseMgDl,
            cholesterolMgDl,
            smokingStatus: smokingResult.value!,
            exerciseFrequency: exerciseResult.value!,
            familyHistory: familyResult.value!,
            stressLevel: stressResult.value!,
          },
          `imported-${index + 1}`
        )
      )
    } catch (error) {
      errors.push(`Row ${rowIndex}: ${(error as Error).message}`)
    }
  })

  return { members, errors }
}

export const CHOWDECK_MEMBERS: MemberRiskRecord[] = Array.from({ length: 50 }, (_, index) =>
  buildMember(index)
)
