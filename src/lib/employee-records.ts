import type { Employee, GetAllEmployeesResponse } from "@/lib/api"
import type {
  ExerciseFrequency,
  Gender,
  MemberRiskRecord,
  PastDisease,
  RiskLevel,
  SmokingStatus,
  StressLevel,
} from "@/lib/chowdeck-members"

const DEFAULT_AGE = 35
const DEFAULT_BMI = 24
const DEFAULT_WEIGHT_KG = 70
const DEFAULT_BLOOD_PRESSURE_SYSTOLIC = 120
const DEFAULT_BLOOD_PRESSURE_DIASTOLIC = 80
const DEFAULT_FASTING_GLUCOSE = 95
const DEFAULT_TOTAL_CHOLESTEROL = 180

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function normalizeString(value: unknown): string {
  return String(value ?? "").trim()
}

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function calculateAge(dob: string | null | undefined): number {
  if (!dob) {
    return DEFAULT_AGE
  }

  const parsed = new Date(dob)
  if (Number.isNaN(parsed.getTime())) {
    return DEFAULT_AGE
  }

  const today = new Date()
  let age = today.getFullYear() - parsed.getFullYear()
  const hasNotHadBirthdayYet =
    today.getMonth() < parsed.getMonth() ||
    (today.getMonth() === parsed.getMonth() && today.getDate() < parsed.getDate())

  if (hasNotHadBirthdayYet) {
    age -= 1
  }

  return clamp(age, 18, 100)
}

function mapGender(rawGender: string | null | undefined): Gender {
  const normalized = normalizeString(rawGender).toLowerCase()
  return normalized.startsWith("f") ? "Female" : "Male"
}

function mapSmokingStatus(employee: Employee): SmokingStatus {
  const smokes = employee.health?.smokes
  const cigarettesPerDay = toNumber(employee.health?.cigarettes_per_day) ?? 0

  if (smokes || cigarettesPerDay > 0) {
    return "Current smoker"
  }

  return "Non-smoker"
}

function mapExerciseFrequency(daysPerWeek: number): ExerciseFrequency {
  if (daysPerWeek <= 0) return "Rarely"
  if (daysPerWeek <= 2) return "1-2x / week"
  if (daysPerWeek <= 4) return "3-4x / week"
  return "5+x / week"
}

function mapStressLevel(level: number): StressLevel {
  if (level >= 7) return "High"
  if (level >= 4) return "Moderate"
  return "Low"
}

function hasFamilyHistory(employee: Employee): boolean {
  const familyHistory = employee.health?.family_history
  if (!familyHistory) {
    return false
  }

  return Object.values(familyHistory).some((value) => value === true)
}

function mapConditionToPastDisease(condition: string): PastDisease | null {
  const normalized = condition.toLowerCase()

  if (normalized.includes("diabet")) return "Type 2 Diabetes"
  if (normalized.includes("hypertens") || normalized.includes("high bp") || normalized.includes("blood pressure")) {
    return "Hypertension"
  }
  if (normalized.includes("heart")) return "Heart Disease"
  if (normalized.includes("stroke")) return "Stroke"
  if (normalized.includes("asthma")) return "Asthma"
  if (normalized.includes("obes") || normalized.includes("overweight")) return "Obesity"
  if (normalized.includes("cholesterol") || normalized.includes("ldl")) return "High Cholesterol"
  if (normalized.includes("kidney")) return "Kidney Disease"
  if (normalized.includes("thyroid")) return "Thyroid Disorder"

  return null
}

function mapPastDiseases(employee: Employee): PastDisease[] {
  const pastConditions = employee.health?.past_conditions ?? []
  const currentConditions = employee.health?.current_conditions ?? []
  const riskFlags = employee.health?.risk_flags ?? []
  const mapped = new Set<PastDisease>()

  ;[...pastConditions, ...currentConditions, ...riskFlags].forEach((condition) => {
    const disease = mapConditionToPastDisease(normalizeString(condition))
    if (disease) {
      mapped.add(disease)
    }
  })

  if (mapped.size === 0) {
    return ["None"]
  }

  return Array.from(mapped)
}

function getOverallRisk(
  hypertensionRiskPct: number,
  diabetesRiskPct: number,
  cardiovascularRiskPct: number
): RiskLevel {
  const peakRisk = Math.max(hypertensionRiskPct, diabetesRiskPct, cardiovascularRiskPct)

  if (peakRisk >= 67) return "High"
  if (peakRisk >= 40) return "Moderate"
  return "Low"
}

function getRecommendation(overallRisk: RiskLevel, pastDiseases: PastDisease[]): string {
  const hasPastConditions = pastDiseases.some((disease) => disease !== "None")

  if (overallRisk === "High") {
    if (hasPastConditions) {
      return "URGENT: Schedule immediate clinic referral. Enroll in intensive wellness monitoring program with weekly check-ins. Prior conditions require specialized attention."
    }

    return "Refer to partner clinic and enroll in tracked wellness intervention with bi-weekly monitoring."
  }

  if (overallRisk === "Moderate") {
    if (hasPastConditions) {
      return "Assign personalized fitness and diet plan with bi-weekly check-ins. Monitor prior conditions closely."
    }

    return "Assign a personalized fitness and diet plan with monthly check-ins."
  }

  return "Maintain current lifestyle and send quarterly prevention tips."
}

function calculateRiskPercentages({
  age,
  bmi,
  systolic,
  smokingStatus,
  exerciseFrequency,
  familyHistory,
  stressLevel,
  fastingGlucose,
  cholesterol,
  pastDiseases,
}: {
  age: number
  bmi: number
  systolic: number
  smokingStatus: SmokingStatus
  exerciseFrequency: ExerciseFrequency
  familyHistory: "Yes" | "No"
  stressLevel: StressLevel
  fastingGlucose: number
  cholesterol: number
  pastDiseases: PastDisease[]
}): {
  hypertensionRiskPct: number
  diabetesRiskPct: number
  cardiovascularRiskPct: number
} {
  const hypertensionRiskPct = clamp(
    Math.round(
      (age - 20) * 1.2 +
        (bmi - 20) * 2 +
        (systolic - 110) * 0.8 +
        (stressLevel === "High" ? 12 : stressLevel === "Moderate" ? 6 : 2) +
        (smokingStatus === "Current smoker"
          ? 10
          : smokingStatus === "Former smoker"
            ? 4
            : 0) +
        (familyHistory === "Yes" ? 8 : 0) +
        (pastDiseases.includes("Hypertension") ? 15 : 0)
    ),
    5,
    95
  )

  const diabetesRiskPct = clamp(
    Math.round(
      (fastingGlucose - 80) * 1.05 +
        (bmi - 21) * 1.8 +
        (age - 22) * 0.55 +
        (exerciseFrequency === "Rarely"
          ? 10
          : exerciseFrequency === "1-2x / week"
            ? 5
            : exerciseFrequency === "3-4x / week"
              ? 2
              : 0) +
        (familyHistory === "Yes" ? 9 : 0) +
        (pastDiseases.includes("Type 2 Diabetes") ? 20 : 0) +
        (pastDiseases.includes("Obesity") ? 10 : 0)
    ),
    4,
    94
  )

  const cardiovascularRiskPct = clamp(
    Math.round(
      (cholesterol - 150) * 0.55 +
        (systolic - 110) * 0.7 +
        (age - 22) * 0.65 +
        (smokingStatus === "Current smoker"
          ? 12
          : smokingStatus === "Former smoker"
            ? 5
            : 0) +
        (stressLevel === "High" ? 8 : stressLevel === "Moderate" ? 4 : 0) +
        (pastDiseases.includes("Heart Disease") ? 25 : 0) +
        (pastDiseases.includes("Stroke") ? 20 : 0) +
        (pastDiseases.includes("High Cholesterol") ? 12 : 0)
    ),
    6,
    93
  )

  return { hypertensionRiskPct, diabetesRiskPct, cardiovascularRiskPct }
}

function mapEmployeeToMember(employee: Employee, index: number): MemberRiskRecord {
  const age = calculateAge(employee.dob)
  const bmi = toNumber(employee.health?.bmi) ?? DEFAULT_BMI
  const weight = toNumber(employee.health?.weight_kg) ?? Math.round(bmi * 1.7 * 1.7)
  const systolic = toNumber(employee.health?.blood_pressure_systolic) ?? DEFAULT_BLOOD_PRESSURE_SYSTOLIC
  const diastolic = toNumber(employee.health?.blood_pressure_diastolic) ?? DEFAULT_BLOOD_PRESSURE_DIASTOLIC
  const fastingGlucose = toNumber(employee.health?.fasting_glucose_mg_dl) ?? DEFAULT_FASTING_GLUCOSE
  const cholesterol = toNumber(employee.health?.total_cholesterol_mg_dl) ?? DEFAULT_TOTAL_CHOLESTEROL
  const smokingStatus = mapSmokingStatus(employee)
  const exerciseDays = toNumber(employee.health?.exercise_days_per_week) ?? 0
  const exerciseFrequency = mapExerciseFrequency(exerciseDays)
  const familyHistory = hasFamilyHistory(employee) ? "Yes" : "No"
  const stressScore = toNumber(employee.health?.stress_level_1_10) ?? 5
  const stressLevel = mapStressLevel(stressScore)
  const pastDiseases = mapPastDiseases(employee)
  const { hypertensionRiskPct, diabetesRiskPct, cardiovascularRiskPct } = calculateRiskPercentages({
    age,
    bmi,
    systolic,
    smokingStatus,
    exerciseFrequency,
    familyHistory,
    stressLevel,
    fastingGlucose,
    cholesterol,
    pastDiseases,
  })
  const overallRisk = getOverallRisk(hypertensionRiskPct, diabetesRiskPct, cardiovascularRiskPct)

  const name = normalizeString(employee.name) || `Employee ${index + 1}`
  const id = normalizeString(employee.employee_id) || `employee-${index + 1}`
  const normalizedId = normalizeSlug(id) || `employee-${index + 1}`
  const email = `${normalizedId}@company.com`

  return {
    id,
    fullName: name,
    email,
    department: normalizeString(employee.department) || "Unassigned",
    gender: mapGender(employee.gender),
    age,
    weight: weight > 0 ? weight : DEFAULT_WEIGHT_KG,
    bmi,
    bloodPressure: `${Math.round(systolic)}/${Math.round(diastolic)}`,
    fastingBloodGlucoseMgDl: fastingGlucose,
    cholesterolMgDl: cholesterol,
    smokingStatus,
    exerciseFrequency,
    familyHistory,
    stressLevel,
    pastDiseases,
    hypertensionRiskPct,
    diabetesRiskPct,
    cardiovascularRiskPct,
    overallRisk,
    recommendation: getRecommendation(overallRisk, pastDiseases),
  }
}

function isEmployeeResponse(payload: unknown): payload is GetAllEmployeesResponse {
  if (!payload || typeof payload !== "object") {
    return false
  }

  const response = payload as GetAllEmployeesResponse
  return Array.isArray(response.employees)
}

export function mapGetAllEmployeesResponseToMembers(payload: unknown): MemberRiskRecord[] {
  if (!isEmployeeResponse(payload)) {
    return []
  }

  return payload.employees.map((employee, index) => mapEmployeeToMember(employee, index))
}
