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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
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

function buildMember(index: number): MemberRiskRecord {
  const firstName = firstNames[index % firstNames.length]
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length]

  const age = 22 + ((index * 3) % 28)
  const bmi = Number((18.6 + ((index * 1.65) % 13.8)).toFixed(1))
  const systolic = 104 + ((index * 5) % 48)
  const diastolic = 66 + ((index * 3) % 30)
  const fastingBloodGlucoseMgDl = 76 + ((index * 4) % 58)
  const cholesterolMgDl = 145 + ((index * 7) % 120)

  const smokingStatus: SmokingStatus =
    index % 8 === 0 ? "Current smoker" : index % 5 === 0 ? "Former smoker" : "Non-smoker"

  const exerciseFrequency = exercisePatterns[index % exercisePatterns.length]
  const familyHistory = index % 3 === 0 ? "Yes" : "No"
  const stressLevel = stressPatterns[(index + 1) % stressPatterns.length]

  const hypertensionRiskPct = clamp(
    Math.round(
      (age - 20) * 1.2 +
        (bmi - 20) * 2 +
        (systolic - 110) * 0.8 +
        (stressLevel === "High" ? 12 : stressLevel === "Moderate" ? 6 : 2) +
        (smokingStatus === "Current smoker" ? 10 : smokingStatus === "Former smoker" ? 4 : 0) +
        (familyHistory === "Yes" ? 8 : 0)
    ),
    5,
    95
  )

  const diabetesRiskPct = clamp(
    Math.round(
      (fastingBloodGlucoseMgDl - 80) * 1.05 +
        (bmi - 21) * 1.8 +
        (age - 22) * 0.55 +
        (exerciseFrequency === "Rarely"
          ? 10
          : exerciseFrequency === "1-2x / week"
            ? 5
            : exerciseFrequency === "3-4x / week"
              ? 2
              : 0) +
        (familyHistory === "Yes" ? 9 : 0)
    ),
    4,
    94
  )

  const cardiovascularRiskPct = clamp(
    Math.round(
      (cholesterolMgDl - 150) * 0.55 +
        (systolic - 110) * 0.7 +
        (age - 22) * 0.65 +
        (smokingStatus === "Current smoker" ? 12 : smokingStatus === "Former smoker" ? 5 : 0) +
        (stressLevel === "High" ? 8 : stressLevel === "Moderate" ? 4 : 0)
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
    id: `chowdeck-${index + 1}`,
    fullName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@chowdeck.com`,
    department: departments[index % departments.length],
    age,
    bmi,
    bloodPressure: `${systolic}/${diastolic}`,
    fastingBloodGlucoseMgDl,
    cholesterolMgDl,
    smokingStatus,
    exerciseFrequency,
    familyHistory,
    stressLevel,
    hypertensionRiskPct,
    diabetesRiskPct,
    cardiovascularRiskPct,
    overallRisk,
    recommendation: getRecommendation(overallRisk),
  }
}

export const CHOWDECK_MEMBERS: MemberRiskRecord[] = Array.from({ length: 50 }, (_, index) =>
  buildMember(index)
)
