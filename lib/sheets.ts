import axios from "axios";

const SHEETS_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || "";

export interface SheetRow {
  timestamp: string;
  type: string;
  location: string;
  severity: string;
  status: string;
  description: string;
  lat?: string;
  lng?: string;
  [key: string]: string | undefined;
}

/**
 * Append a row to the Google Sheet via Apps Script Web App.
 * The Apps Script doPost() handler should write e.parameter fields as a new row.
 */
export async function appendToSheet(data: Record<string, unknown>): Promise<void> {
  if (!SHEETS_URL) return;
  // Apps Script expects form-encoded or JSON body depending on your doPost impl.
  // We send JSON and let the script parse e.postData.contents.
  await axios.post(SHEETS_URL, data, {
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Fetch all rows from the Google Sheet.
 * Apps Script doGet() should return JSON: { data: SheetRow[] }
 */
export async function fetchFromSheet(): Promise<SheetRow[]> {
  if (!SHEETS_URL) return [];
  try {
    const res = await axios.get<{ data: SheetRow[] }>(SHEETS_URL);
    return res.data?.data ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetch rows filtered by date range (ISO strings).
 * Filtering is done client-side since Apps Script Web Apps don’t support query params by default.
 */
export async function fetchSheetByDateRange(from: Date, to: Date): Promise<SheetRow[]> {
  const rows = await fetchFromSheet();
  return rows.filter((r) => {
    const t = new Date(r.timestamp).getTime();
    return t >= from.getTime() && t <= to.getTime();
  });
}
