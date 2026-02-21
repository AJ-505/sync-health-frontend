export type SmokingStatus = "Non-smoker" | "Former smoker" | "Current smoker"
export type ExerciseFrequency = "Rarely" | "1-2x / week" | "3-4x / week" | "5+x / week"
export type StressLevel = "Low" | "Moderate" | "High"
export type RiskLevel = "Low" | "Moderate" | "High"
export type Gender = "Male" | "Female"

// Past diseases that could be relevant for health risk assessment
export type PastDisease = 
  | "None"
  | "Type 2 Diabetes"
  | "Hypertension"
  | "Heart Disease"
  | "Stroke"
  | "Asthma"
  | "Obesity"
  | "High Cholesterol"
  | "Kidney Disease"
  | "Thyroid Disorder"

export type MemberRiskRecord = {
  id: string
  fullName: string
  email: string
  department: string
  gender: Gender
  age: number
  bmi: number
  bloodPressure: string
  fastingBloodGlucoseMgDl: number
  cholesterolMgDl: number
  smokingStatus: SmokingStatus
  exerciseFrequency: ExerciseFrequency
  familyHistory: "Yes" | "No"
  stressLevel: StressLevel
  pastDiseases: PastDisease[]
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
  gender: Gender
  age: number
  bmi: number
  bloodPressure: string
  fastingBloodGlucoseMgDl: number
  cholesterolMgDl: number
  smokingStatus: SmokingStatus
  exerciseFrequency: ExerciseFrequency
  familyHistory: "Yes" | "No"
  stressLevel: StressLevel
  pastDiseases: PastDisease[]
}

export type ParsedMembersResult = {
  members: MemberRiskRecord[]
  errors: string[]
}

// Diverse Nigerian first names with associated genders
const maleFirstNames = [
  "Emeka", "Chinedu", "Ifeanyi", "Oluwaseun", "Adebayo", 
  "Tunde", "Chukwudi", "Obinna", "Femi", "Yusuf",
  "Ibrahim", "Musa", "Kunle", "Segun", "Kayode",
  "Nnadi", "Obiora", "Ikenna", "Uchenna", "Nnamdi"
]

const femaleFirstNames = [
  "Aisha", "Chioma", "Zainab", "Ngozi", "Funke",
  "Adaeze", "Blessing", "Kemi", "Tosin", "Amina",
  "Fatima", "Halima", "Bola", "Yetunde", "Damilola",
  "Chiamaka", "Nneka", "Ifeoma", "Oluchi", "Adanna"
]

// More diverse last names
const lastNames = [
  "Adeyemi", "Okafor", "Ibrahim", "Afolayan", "Balogun",
  "Umeh", "Nwosu", "Bello", "Lawal", "Ogunleye",
  "Eze", "Okoro", "Musa", "Abdullahi", "Okonkwo",
  "Abubakar", "Mohammed", "Yusuf", "Chukwu", "Nnamdi",
  "Olawale", "Adeniyi", "Oyelaran", "Akinyemi", "Babatunde",
  "Ogundipe", "Ajayi", "Oladipo", "Fashola", "Onuoha",
  "Nwachukwu", "Igwe", "Onyeka", "Anyanwu", "Nwankwo"
]

const departments = [
  "Operations",
  "People & Culture",
  "Finance",
  "Engineering",
  "Growth",
  "Customer Success",
  "Product",
  "Compliance",
  "Marketing",
  "Legal"
]

const exercisePatterns: ExerciseFrequency[] = [
  "Rarely",
  "1-2x / week",
  "3-4x / week",
  "5+x / week",
]

const stressPatterns: StressLevel[] = ["Low", "Moderate", "High"]

const pastDiseaseOptions: PastDisease[] = [
  "None",
  "Type 2 Diabetes",
  "Hypertension", 
  "Heart Disease",
  "Stroke",
  "Asthma",
  "Obesity",
  "High Cholesterol",
  "Kidney Disease",
  "Thyroid Disorder"
]

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

const genderMap: Record<string, Gender> = {
  "male": "Male",
  "m": "Male",
  "female": "Female",
  "f": "Female",
}

const importHeaderAliases: Record<string, keyof MemberInputRecord> = {
  fullname: "fullName",
  name: "fullName",
  email: "email",
  department: "department",
  gender: "gender",
  sex: "gender",
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
  pastdiseases: "pastDiseases",
  diseases: "pastDiseases",
}

const requiredInputFields: Array<keyof MemberInputRecord> = [
  "fullName",
  "email",
  "department",
  "gender",
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

function getRecommendation(overallRisk: RiskLevel, pastDiseases: PastDisease[]): string {
  const hasPastConditions = pastDiseases.some(d => d !== "None")
  
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

// Seeded random for consistent generation
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
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
        (input.familyHistory === "Yes" ? 8 : 0) +
        (input.pastDiseases.includes("Hypertension") ? 15 : 0)
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
        (input.familyHistory === "Yes" ? 9 : 0) +
        (input.pastDiseases.includes("Type 2 Diabetes") ? 20 : 0) +
        (input.pastDiseases.includes("Obesity") ? 10 : 0)
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
        (input.stressLevel === "High" ? 8 : input.stressLevel === "Moderate" ? 4 : 0) +
        (input.pastDiseases.includes("Heart Disease") ? 25 : 0) +
        (input.pastDiseases.includes("Stroke") ? 20 : 0) +
        (input.pastDiseases.includes("High Cholesterol") ? 12 : 0)
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
    recommendation: getRecommendation(overallRisk, input.pastDiseases),
  }
}

function buildMember(index: number): MemberRiskRecord {
  const random = seededRandom(index * 7919) // Prime seed for variety
  
  // Randomly assign gender
  const gender: Gender = random() > 0.5 ? "Male" : "Female"
  
  // Pick first name based on gender
  const firstNameList = gender === "Male" ? maleFirstNames : femaleFirstNames
  const firstName = firstNameList[Math.floor(random() * firstNameList.length)]
  
  // Pick last name with more variety - use combination of index and random
  const lastNameIndex = Math.floor(random() * lastNames.length)
  const lastName = lastNames[lastNameIndex]

  const age = 22 + Math.floor(random() * 38) // 22-60 years
  const bmi = Number((18.5 + random() * 14).toFixed(1)) // 18.5-32.5
  const systolic = 100 + Math.floor(random() * 60) // 100-160
  const diastolic = 60 + Math.floor(random() * 40) // 60-100

  // Generate past diseases - most people have none, some have 1-2
  const pastDiseases: PastDisease[] = []
  if (random() < 0.3) { // 30% chance of having a past disease
    const numDiseases = random() < 0.7 ? 1 : 2
    const availableDiseases = pastDiseaseOptions.filter(d => d !== "None")
    for (let i = 0; i < numDiseases; i++) {
      const diseaseIndex = Math.floor(random() * availableDiseases.length)
      const disease = availableDiseases[diseaseIndex]
      if (!pastDiseases.includes(disease)) {
        pastDiseases.push(disease)
      }
    }
  }
  if (pastDiseases.length === 0) {
    pastDiseases.push("None")
  }

  const input: MemberInputRecord = {
    fullName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@chowdeck.com`,
    department: departments[index % departments.length],
    gender,
    age,
    bmi,
    bloodPressure: `${systolic}/${diastolic}`,
    fastingBloodGlucoseMgDl: 70 + Math.floor(random() * 60), // 70-130
    cholesterolMgDl: 140 + Math.floor(random() * 120), // 140-260
    smokingStatus:
      random() < 0.1 ? "Current smoker" : random() < 0.25 ? "Former smoker" : "Non-smoker",
    exerciseFrequency: exercisePatterns[Math.floor(random() * exercisePatterns.length)],
    familyHistory: random() < 0.35 ? "Yes" : "No",
    stressLevel: stressPatterns[Math.floor(random() * stressPatterns.length)],
    pastDiseases,
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

    const genderResult = parseEnum(rowIndex, "gender", mapped.gender, genderMap)
    if (genderResult.error) {
      errors.push(genderResult.error)
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

    // Parse past diseases - could be comma-separated string or array
    let pastDiseases: PastDisease[] = ["None"]
    if (mapped.pastDiseases) {
      const diseasesStr = normalizeText(mapped.pastDiseases)
      if (diseasesStr && diseasesStr.toLowerCase() !== "none") {
        pastDiseases = diseasesStr.split(",").map(d => d.trim()) as PastDisease[]
      }
    }

    try {
      members.push(
        buildRiskRecord(
          {
            fullName: normalizeText(mapped.fullName),
            email: normalizeText(mapped.email),
            department: normalizeText(mapped.department),
            gender: genderResult.value!,
            age,
            bmi,
            bloodPressure,
            fastingBloodGlucoseMgDl,
            cholesterolMgDl,
            smokingStatus: smokingResult.value!,
            exerciseFrequency: exerciseResult.value!,
            familyHistory: familyResult.value!,
            stressLevel: stressResult.value!,
            pastDiseases,
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
