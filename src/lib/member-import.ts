import * as XLSX from "xlsx"

import { parseImportedMembers, type ParsedMembersResult } from "@/lib/chowdeck-members"

export async function importMembersFromSpreadsheet(file: File): Promise<ParsedMembersResult> {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: "array" })
  const firstSheetName = workbook.SheetNames[0]

  if (!firstSheetName) {
    return {
      members: [],
      errors: ["The uploaded file has no sheets."],
    }
  }

  const sheet = workbook.Sheets[firstSheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  })

  if (rows.length === 0) {
    return {
      members: [],
      errors: ["No rows found in the first sheet."],
    }
  }

  return parseImportedMembers(rows)
}
