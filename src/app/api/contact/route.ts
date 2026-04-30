import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FROM_EMAIL = "Studio—E <noreply@studioe.digital>";
const TO_EMAILS  = ["ilay@studioe.digital", "grace@studioe.digital"];

interface ContactPayload {
  name:     string;
  email:    string;
  services: string[];
  budget:   string;
  referral: string;
  message:  string;
}

function validate(body: Partial<ContactPayload>): string | null {
  if (!body.name?.trim())        return "Name is required.";
  if (!body.email?.trim())       return "Email is required.";
  if (!/\S+@\S+\.\S+/.test(body.email)) return "Valid email is required.";
  if (!body.services?.length)    return "At least one service is required.";
  if (!body.budget?.trim())      return "Budget range is required.";
  return null;
}

function buildEmailHtml(p: ContactPayload, timestamp: string): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 16px 8px 0;font-weight:600;color:#555;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:#151514;">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Courier New',monospace;color:#151514;">
  <div style="max-width:580px;margin:40px auto;background:#fff;border:1px solid #e0e0d8;">

    <!-- Header -->
    <div style="background:#B2B41F;padding:24px 32px;">
      <p style="margin:0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#151514;opacity:0.6;">Studio—E</p>
      <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#151514;letter-spacing:-0.02em;">New Inquiry</h1>
    </div>

    <!-- Fields -->
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;">
        ${row("Name",     p.name)}
        ${row("Email",    `<a href="mailto:${p.email}" style="color:#422DA2;">${p.email}</a>`)}
        ${row("Services", p.services.join(", "))}
        ${row("Budget",   p.budget)}
        ${row("Source",   p.referral || "—")}
        ${row("Message",  p.message  || "—")}
        ${row("Received", timestamp)}
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid #e0e0d8;">
      <p style="margin:0;font-size:11px;color:#999;letter-spacing:0.1em;text-transform:uppercase;">
        Studio—E · studioe.digital
      </p>
    </div>

  </div>
</body>
</html>`;
}

async function sendEmail(p: ContactPayload, timestamp: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from:    FROM_EMAIL,
    to:      TO_EMAILS,
    subject: `New Studio—E Inquiry — ${p.name}`,
    html:    buildEmailHtml(p, timestamp),
  });
}

async function postToSheet(p: ContactPayload) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) return;

  await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name:     p.name,
      email:    p.email,
      services: p.services.join(", "),
      budget:   p.budget,
      source:   p.referral || "",
      message:  p.message  || "",
    }),
  });
}

export async function POST(request: NextRequest) {
  let body: Partial<ContactPayload>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 });
  }

  const payload = body as ContactPayload;
  const timestamp = new Date().toLocaleString("en-US", {
    timeZone:  "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const [emailResult, sheetsResult] = await Promise.allSettled([
    sendEmail(payload, timestamp),
    postToSheet(payload),
  ]);

  if (emailResult.status === "rejected") {
    console.error("Resend error:", emailResult.reason);
    return NextResponse.json(
      { error: "Failed to send — please email us directly at ilay@studioe.digital." },
      { status: 500 },
    );
  }

  // Sheets failure is non-fatal: email already sent, log and continue
  if (sheetsResult.status === "rejected") {
    console.error("Apps Script error:", sheetsResult.reason);
  }

  return NextResponse.json({ success: true });
}
