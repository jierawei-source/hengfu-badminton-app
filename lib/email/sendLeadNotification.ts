import "server-only";
import { Resend } from "resend";

/**
 * 客人送出開店評估表單後，寄一封通知信給內部信箱。
 *
 * 設計原則（沿用恆富創新麻將站 hengfu-app 的做法）：
 * - Email 通知是「錦上添花」，不是資料的正式來源。Lead 資料一律以資料庫（badminton_leads 表）
 *   為準，即使這裡寄信失敗，也不能影響表單送出成功與否，所以呼叫端一律用 try/catch 包起來、
 *   失敗只記 log，不拋出錯誤。
 * - 沒有設定 RESEND_API_KEY 或 LEAD_NOTIFICATION_EMAIL 時直接跳過，
 *   不會讓整個網站因為缺環境變數而壞掉。
 */

interface LeadNotificationInput {
  name: string;
  phone: string;
  lineId?: string | null;
  email?: string | null;
  status?: string | null;
  region?: string | null;
  budget?: string | null;
  area?: string | null;
  timeline?: string | null;
  courtType?: string | null;
  concern?: string | null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function row(label: string, value?: string | null) {
  if (!value) return "";
  return `<tr><td style="padding:4px 12px 4px 0;color:#666;white-space:nowrap;">${label}</td><td style="padding:4px 0;color:#111;">${escapeHtml(
    value
  )}</td></tr>`;
}

export async function sendLeadNotificationEmail(lead: LeadNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_NOTIFICATION_EMAIL;

  if (!apiKey || !toEmail) {
    console.warn(
      "[sendLeadNotificationEmail] 未設定 RESEND_API_KEY 或 LEAD_NOTIFICATION_EMAIL，跳過寄信。"
    );
    return;
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "恆富創新網站 <onboarding@resend.dev>";

  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px;">
      <h2 style="color:#101A2E;">網站有新的開店評估名單</h2>
      <table style="border-collapse:collapse;font-size:14px;">
        ${row("姓名", lead.name)}
        ${row("電話", lead.phone)}
        ${row("LINE", lead.lineId)}
        ${row("Email", lead.email)}
        ${row("目前狀態", lead.status)}
        ${row("預計地區", lead.region)}
        ${row("總預算區間", lead.budget)}
        ${row("預計坪數", lead.area)}
        ${row("預計開店時間", lead.timeline)}
        ${row("希望做", lead.courtType)}
        ${row("最擔心的問題", lead.concern)}
      </table>
      <p style="margin-top:16px;font-size:12px;color:#999;">
        完整資料請至後台 /admin/leads 查看。
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `新的開店評估名單：${lead.name}`,
      html,
    });
  } catch (err) {
    // 寄信失敗只記 log，不影響表單送出結果（名單已經寫進資料庫了）
    console.error("[sendLeadNotificationEmail] 寄信失敗：", err);
  }
}
