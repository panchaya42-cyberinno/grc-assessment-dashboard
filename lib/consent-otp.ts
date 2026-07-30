import crypto from "crypto"

export function generateOTP(): string {
  return String(crypto.randomInt(100000, 999999))
}

export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp + process.env.OTP_SECRET).digest("hex")
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@")
  const masked = user.slice(0, 2) + "***"
  return `${masked}@${domain}`
}

export function maskPhone(phone: string): string {
  return phone.slice(0, 3) + "***" + phone.slice(-3)
}

export async function sendOTPEmail(to: string, otp: string, templateName: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — OTP:", otp)
    return true // dev mode: log only
  }
  const { Resend } = await import("resend")
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@aigrc.app",
    to,
    subject: `รหัส OTP สำหรับการให้ความยินยอม — ${templateName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#1a1a2e;margin-bottom:8px">รหัสยืนยันตัวตน</h2>
        <p style="color:#555;margin-bottom:24px">
          กรุณาใช้รหัสด้านล่างเพื่อยืนยันการให้ความยินยอม (${templateName})
        </p>
        <div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;
                    padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:900;letter-spacing:12px;color:#15803d">
            ${otp}
          </span>
        </div>
        <p style="color:#888;font-size:13px">รหัสนี้หมดอายุใน 10 นาที</p>
        <p style="color:#888;font-size:13px">
          หากคุณไม่ได้ร้องขอ กรุณาเพิกเฉยต่ออีเมลนี้
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:11px">
          ส่งโดยระบบ AI GRC Platform — CyberInno
        </p>
      </div>
    `,
  })
  return !error
}

export async function sendWithdrawalConfirmEmail(to: string, templateName: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  const { Resend } = await import("resend")
  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@aigrc.app",
    to,
    subject: `ยืนยันการถอนความยินยอม — ${templateName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#1a1a2e">ถอนความยินยอมเรียบร้อยแล้ว</h2>
        <p style="color:#555">
          ระบบได้รับคำขอถอนความยินยอมของคุณสำหรับ <strong>${templateName}</strong> แล้ว
        </p>
        <p style="color:#555">
          ข้อมูลของคุณจะถูกดำเนินการตามนโยบายของเราภายใน 30 วัน
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:11px">AI GRC Platform — CyberInno</p>
      </div>
    `,
  })
}
