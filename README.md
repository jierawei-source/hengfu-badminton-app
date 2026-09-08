# 恆富創新｜智慧羽球館・匹克球館官網

Next.js（App Router）+ Supabase + Vercel。**Phase 1**（官網上線、「免費開店
評估」表單寫入 Supabase）已完成。**Phase 2**（登入保護的後台管理系統）進行中。

## 專案結構

```
app/
  layout.tsx              根 layout：<title>、字型、載入 globals.css
  page.tsx                首頁 — 讀取 content/body.html 原樣輸出
  globals.css             整站樣式（從原本的行銷頁面搬過來，未經改動）
  SiteScripts.tsx          把 content/site.js 以真正的 <script> 標籤注入頁面
  api/leads/route.ts       表單送出 API：驗證必填欄位後寫入 Supabase badminton_leads 表
  admin/
    login/page.tsx         後台登入頁（單一管理員密碼）
    (protected)/           需要登入才能看的頁面，共用左側導覽 layout
      page.tsx              儀表板首頁
      leads/page.tsx         開店評估名單列表
  api/admin/
    login/route.ts          驗證密碼、簽發登入 cookie
    logout/route.ts         清除登入 cookie
    leads/export/route.ts   名單 CSV 匯出
content/
  body.html                首頁全部內容（header + main + footer 的原始 HTML）
  site.js                  滾動動畫、數字動畫、FAQ 手風琴、門禁 demo、
                            計算機、表單送出等前端互動邏輯
lib/
  supabase/admin.ts        Service-role Supabase client（僅限伺服器端使用）
  admin/session.ts          後台登入 session 簽章／驗證（Edge + Node 都能執行）
middleware.ts               保護所有 /admin/* 頁面與 /api/admin/* API
supabase/migrations/        資料庫 schema
  0001_badminton_leads.sql   開店評估名單表
  0002_admin_phase2.sql      後台用：badminton_faqs／badminton_site_content／badminton_photos
```

`content/body.html`、`content/site.js`、`app/globals.css` 是直接從原本驗收過的
單頁 HTML 版本搬過來的，內容和視覺應該完全一致——之後要改文案、樣式或
互動效果，就直接編輯這三個檔案即可，不需要動 `app/page.tsx`。

## 本機開發

```bash
npm install
cp .env.example .env.local   # 填入下面「Supabase 設定」與「後台登入設定」拿到的值
npm run dev
```

開啟 http://localhost:3000，後台在 http://localhost:3000/admin/login。

## Supabase 設定

1. 到 [Supabase Dashboard](https://supabase.com/dashboard) 建立新專案（或使用現有專案）。
2. 進到專案的 **SQL Editor**，依序貼上並執行：
   - `supabase/migrations/0001_badminton_leads.sql`（開店評估名單表）
   - `supabase/migrations/0002_admin_phase2.sql`（後台用的 FAQ／文字內容／照片表）

   （這個專案可以跟其他事業共用同一個 Supabase 專案，所有表名都加了 `badminton_`
   前綴，不會跟其他表衝突。）
3. 到專案 **Settings → API**，複製三個值填進 `.env.local`：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（⚠️ 絕對不能外流，只用在伺服器端 API route）

所有 `badminton_` 開頭的表都沒有開放任何 public 的 RLS policy，前端不會直接連
Supabase，只有伺服器端（`/api/leads`、`/api/admin/*`、後台頁面）用 service-role
key 存取，安全性上比較單純。

## 後台登入設定

`.env.local` 另外需要兩個值：

- `ADMIN_PASSWORD`：登入 `/admin` 用的密碼，自己設定一組即可（純密碼比對，
  沒有帳號系統，適合單一管理員使用）。
- `ADMIN_SESSION_SECRET`：用來簽章登入 session 的隨機字串，可用
  `openssl rand -hex 32` 產生一組，越長越亂越好，絕對不能外流。

## 部署（Vercel）

1. 把這個 repo push 到 GitHub。
2. 到 [Vercel](https://vercel.com/new) → Import Git Repository → 選這個 repo。
3. 在 Vercel 專案的 **Settings → Environment Variables**，把 `.env.local`
   裡的五個值都貼進去（Production / Preview / Development 都加）：
   `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、
   `SUPABASE_SERVICE_ROLE_KEY`、`ADMIN_PASSWORD`、`ADMIN_SESSION_SECRET`。
4. Deploy。之後每次 push 到 `main` 都會自動重新部署。

## Phase 2（後台管理系統，進行中）

- [x] `/admin` 登入保護（單一管理員密碼 + 簽章 cookie，middleware 統一擋 `/admin/*`）
- [x] `/admin/leads`：名單列表、CSV 匯出
- [ ] `/admin/faq`：常見問題新增／編輯／刪除
- [ ] `/admin/content`：方案費用說明、比較表等文案編輯
- [ ] `/admin/photos`：球館實景照、產品圖片上傳
- [ ] 表單防灌水（rate limit / reCAPTCHA）
- [ ] SEO / OG 圖片 / 效能優化
