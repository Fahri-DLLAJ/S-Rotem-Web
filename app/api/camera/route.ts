import { NextRequest, NextResponse } from "next/server";

const AI_PORT = process.env.NEXT_PUBLIC_AI_STREAM_PORT ?? "5000";
const ESP32_IP = process.env.NEXT_PUBLIC_ESP32_CAM_IP ?? "192.168.1.101";
const VISION_BASE = `http://${ESP32_IP}:${AI_PORT}`;

/** POST /api/camera  body: { action: "wake" | "sleep" } */
export async function POST(req: NextRequest) {
  const { action } = await req.json();
  if (action !== "wake" && action !== "sleep") {
    return NextResponse.json({ error: "action must be wake or sleep" }, { status: 400 });
  }

  try {
    const res = await fetch(`${VISION_BASE}/${action}`, {
      method: "POST",
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Vision server not running — not a fatal error, just report it
    return NextResponse.json({ error: "vision server unreachable" }, { status: 503 });
  }
}

/** GET /api/camera  — proxy health check */
export async function GET() {
  try {
    const res = await fetch(`${VISION_BASE}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ active: false, clients: 0, error: "unreachable" }, { status: 503 });
  }
}
