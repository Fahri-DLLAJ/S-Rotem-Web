import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOADS_DIR  = path.join(process.cwd(), "public", "uploads");
const REPORTS_FILE = path.join(UPLOADS_DIR, "reports.json");

async function read(): Promise<Record<string, unknown>[]> {
  try { return JSON.parse(await readFile(REPORTS_FILE, "utf-8")); }
  catch { return []; }
}

async function save(data: unknown) {
  if (!existsSync(UPLOADS_DIR)) await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(REPORTS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/** PATCH /api/admin/reports  body: { id, action, payload? } */
export async function PATCH(req: NextRequest) {
  const { id, action, payload } = await req.json();
  const reports = await read();
  const idx = reports.findIndex((r) => r.id === id);
  if (idx === -1) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const r = { ...reports[idx] } as Record<string, unknown>;
  const now = new Date().toISOString();
  const history = (r.statusHistory as unknown[]) ?? [];

  switch (action) {
    case "verify":
      r.status = "active";
      history.push({ status: "active", note: "Laporan diverifikasi oleh admin.", timestamp: now });
      r.statusHistory = history;
      break;
    case "changeStatus":
      r.status = payload.status;
      history.push({ status: payload.status, note: payload.note ?? "", timestamp: now });
      r.statusHistory = history;
      break;
    case "addNote":
      r.notes = [...((r.notes as string[]) ?? []), payload.note];
      break;
    case "complete":
      r.status = "resolved";
      history.push({ status: "resolved", note: payload.note ?? "Laporan diselesaikan.", timestamp: now });
      r.statusHistory = history;
      break;
    case "sendResponse":
      r.response = payload.response;
      break;
    default:
      return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  }

  reports[idx] = r;
  await save(reports);
  return NextResponse.json({ ok: true, report: r });
}
