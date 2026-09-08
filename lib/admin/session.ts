// Edge + Node 都能執行（會被 middleware 以 Edge Runtime 載入，也會被
// /api/admin/* 這類一般 Node.js API route 載入），所以刻意只用
// Web Crypto（globalThis.crypto.subtle）與 TextEncoder，不用 Node 專屬的
// "crypto" 套件或 Buffer，避免 Edge Runtime 打包失敗。

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 天

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

async function hmacHex(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** 建立一組簽章過的 session token，格式為 `到期時間.簽章`。 */
export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  const signature = await hmacHex(payload);
  return `${payload}.${signature}`;
}

/** 驗證 session token 的簽章是否正確、是否過期。 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  let expected: string;
  try {
    expected = await hmacHex(payload);
  } catch {
    return false;
  }
  if (!timingSafeEqualStr(signature, expected)) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  return true;
}

/** 驗證輸入的密碼是否等於 ADMIN_PASSWORD 環境變數。 */
export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqualStr(input, expected);
}
