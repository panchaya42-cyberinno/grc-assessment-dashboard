import { createClient } from "@/lib/supabase/server"
import dns from "dns/promises"

// ─── Disposable / temporary email domains ────────────────────────────────────
// รายชื่อ domain ที่ใช้สร้าง email ชั่วคราว

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamail.de", "guerrillamail.info", "guerrillamail.biz",
  "tempmail.com", "temp-mail.org", "temp-mail.io", "throwam.com",
  "yopmail.com", "yopmail.fr", "cool.fr.nf", "jetable.fr.nf",
  "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr",
  "courriel.fr.nf", "moncourrier.fr.nf", "monemail.fr.nf",
  "monmail.fr.nf", "maildrop.cc", "spamgourmet.com", "spamgourmet.net",
  "spamgourmet.org", "trashmail.at", "trashmail.com", "trashmail.io",
  "trashmail.me", "trashmail.net", "trashmail.org", "trashmail.xyz",
  "dispostable.com", "mailnull.com", "spamcorner.com", "discard.email",
  "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu",
  "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com",
  "teleworm.us", "armyspy.com", "cuvox.de", "dayrep.com",
  "10minutemail.com", "10minutemail.net", "10minutemail.org",
  "10minutemail.co.uk", "10minutemail.de", "10minutemail.ru",
  "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "spam4.me", "spamfree24.org", "spamfree24.de", "spamfree24.eu",
  "spamfree24.info", "spamfree24.net", "spamfree.eu",
  "spam.la", "spam.su", "spam.org.tr", "spam.nl",
  "fakeinbox.com", "fakemail.fr", "getonemail.com",
  "mohmal.com", "mailnesia.com", "meltmail.com", "throwam.com",
  "getnada.com", "filzmail.com", "binkmail.com", "bobmail.info",
  "chammy.info", "devnullmail.com", "letthemeatspam.com",
  "mailinblack.com", "pookmail.com", "rklips.com", "spambog.com",
  "spamfighter.info", "spamthis.co.uk", "spamtrap.ro",
  "spoofmail.de", "supergreatmail.com", "thetimezone.com",
  "incognitomail.com", "incognitomail.net", "incognitomail.org",
])

// ─── Rate Limit Config ────────────────────────────────────────────────────────

const RATE_LIMIT = {
  maxPerEmail: 5,     // สูงสุด 5 ครั้ง ต่อ email
  windowMinutes: 60,  // ใน 60 นาที
  maxPerIP: 10,       // สูงสุด 10 ครั้ง ต่อ IP
}

// ─── Validate Email Format ────────────────────────────────────────────────────

export function isValidEmailFormat(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  return re.test(email.toLowerCase())
}

// ─── Check Disposable Domain ──────────────────────────────────────────────────

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase()
  if (!domain) return true
  return DISPOSABLE_DOMAINS.has(domain)
}

// ─── Check MX Record (domain รับ email ได้จริง) ──────────────────────────────

export async function hasMXRecord(email: string): Promise<boolean> {
  const domain = email.split("@")[1]
  if (!domain) return false
  try {
    const records = await dns.resolveMx(domain)
    return records.length > 0
  } catch {
    return false
  }
}

// ─── Check Rate Limit ─────────────────────────────────────────────────────────

export async function checkRateLimit(
  email: string,
  ip?: string
): Promise<{ allowed: boolean; reason?: string; retryAfterMinutes?: number }> {
  const supabase = await createClient()
  const windowStart = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60 * 1000).toISOString()

  // ตรวจสอบจำนวน OTP ที่ส่งให้ email นี้ใน 1 ชั่วโมงที่ผ่านมา
  const { count: emailCount } = await supabase
    .from("consent_verifications")
    .select("*", { count: "exact", head: true })
    .eq("otp_sent_to_raw", email)   // ใช้ column พิเศษที่เก็บ email ดิบ (ไม่ mask)
    .gte("otp_sent_at", windowStart)

  // fallback: ถ้าไม่มี column นั้น ข้ามการเช็คตาม email ไป
  // เช็ค IP แทน
  if (ip) {
    const { count: ipCount } = await supabase
      .from("consent_audit_log")
      .select("*", { count: "exact", head: true })
      .eq("action", "otp_sent")
      .eq("actor_ip", ip)
      .gte("occurred_at", windowStart)

    if ((ipCount ?? 0) >= RATE_LIMIT.maxPerIP) {
      return {
        allowed: false,
        reason: "Too many OTP requests from this IP",
        retryAfterMinutes: RATE_LIMIT.windowMinutes,
      }
    }
  }

  if ((emailCount ?? 0) >= RATE_LIMIT.maxPerEmail) {
    return {
      allowed: false,
      reason: "Too many OTP requests for this email",
      retryAfterMinutes: RATE_LIMIT.windowMinutes,
    }
  }

  return { allowed: true }
}

// ─── Full Validation (ใช้ใน send-otp API) ────────────────────────────────────

export async function validateEmail(
  email: string,
  ip?: string
): Promise<{ valid: boolean; error?: string; retryAfterMinutes?: number }> {
  const emailLower = email.toLowerCase().trim()

  // 1. รูปแบบ email
  if (!isValidEmailFormat(emailLower)) {
    return { valid: false, error: "รูปแบบ email ไม่ถูกต้อง" }
  }

  // 2. disposable email
  if (isDisposableEmail(emailLower)) {
    return { valid: false, error: "ไม่รองรับ email ชั่วคราว (disposable email) กรุณาใช้ email จริง" }
  }

  // 3. MX record (domain สามารถรับ email ได้)
  const hasMX = await hasMXRecord(emailLower)
  if (!hasMX) {
    return { valid: false, error: "ไม่พบ email server ของ domain นี้ กรุณาตรวจสอบ email อีกครั้ง" }
  }

  // 4. rate limit
  const rateCheck = await checkRateLimit(emailLower, ip)
  if (!rateCheck.allowed) {
    return {
      valid: false,
      error: `ส่ง OTP บ่อยเกินไป กรุณารอ ${rateCheck.retryAfterMinutes} นาทีแล้วลองใหม่`,
      retryAfterMinutes: rateCheck.retryAfterMinutes,
    }
  }

  return { valid: true }
}
