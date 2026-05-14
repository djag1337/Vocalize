/**
 * Email utility using Resend.
 * Requires env vars:
 *   RESEND_API_KEY  — from resend.com (free tier: 3k emails/month)
 *   NEXT_PUBLIC_APP_URL — e.g. https://vocalize.app or http://localhost:3000
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.EMAIL_FROM || "Vocalize <noreply@vocalize.app>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!RESEND_API_KEY) {
    // Dev fallback — log to console so the flow still works locally without an API key
    console.log("\n📧 [EMAIL — no RESEND_API_KEY set]");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html.replace(/<[^>]+>/g, "").trim());
    console.log("");
    return { ok: true, dev: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Resend error: ${JSON.stringify(err)}`);
  }

  return res.json();
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: "Reset your Vocalize password",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#0c0c0e;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c0e;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block;width:56px;height:56px;border-radius:14px;background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.3);text-align:center;line-height:56px;font-size:30px;font-weight:900;color:#a855f7;letter-spacing:-1px;">
                &amp;
              </div>
              <p style="margin:10px 0 0;font-size:20px;font-weight:800;color:#f5f4fa;letter-spacing:-0.5px;">Vocalize</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:36px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#f5f4fa;letter-spacing:-0.5px;">Reset your password</p>
              <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.6;">
                Someone requested a password reset for your account. If that was you, click below. The link expires in 1 hour.
              </p>
              <a href="${resetUrl}"
                style="display:block;text-align:center;background:#a855f7;color:#fff;font-weight:700;font-size:15px;padding:14px 0;border-radius:9999px;text-decoration:none;">
                Reset password
              </a>
              <p style="margin:24px 0 0;font-size:13px;color:rgba(255,255,255,0.3);line-height:1.5;">
                If you didn't request this, ignore this email — your password won't change.<br/>
                Link expires in 1 hour.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">
                Vocalize · by the people, for the people
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };
}

export { APP_URL };
