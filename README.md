# 恆富創新｜智慧羽球館・匹克球館官網

Next.js（App Router）+ Supabase + Vercel。目前為 **Phase 1**：官網內容上線，
「免費開店評估」表單會即時寫入 Supabase。後台管理系統（照片上傳、方案價格
編輯、同業比較表、名單查看等）規劃在 Phase 2。

## 專案結構

```
app/
  layout.tsx          根 layout：<title>、字型、載入 globals.css
  page.tsx            首頁 — 讀取 content/body.html 原樣輸出
  globals.css         整站樣式（從原本的行銷頁面搬過來，未經改動）
  SiteScripts.tsx      把 content/site.js 以真正的 <script> 標籤注入頁面
  api/leads/route.ts   表單送出 API：驗證必填欄位後寫入 Supabase leads 表
content/
  body.html            首頁全部內容（header + main + footer 的原始 HTML）
  site.js              滾動動畫、數字動畫、FAQ 手風琴、門禁 demo、
                        計算機、表單送出等前端互動邏輯
lib/supabase/admin.ts  Service-role Supabase client（僅限伺服器端使用）
supabase/migrations/   資料庫 schema（目前只有 leads 表）
```

`content/body.html`、`content/site.js`、`app/globals.css` 是直接從原本驗收過的
單頁 HTML 版本搬過來的，內容和視覺應該完全一致——之後要改文案、樣式或
互動效果，就直接編輯這三個檔案即可，不需要動 `app/page.tsx`。

## 本機開發

```bash
npm install
cp .env.example .env.local   # 填入下面「Supabase 設定」拿到的三個值
npm run dev
```

開啟 http://localhost:3000。

## Supabase 設定

1. 到 [Supabase Dashboard](https://supabase.com/dashboard) 建立新專案（或使用現有專案）。
2. 進到專案的 **SQL Editor**，貼上 `supabase/migrations/0001_leads.sql` 整份內容並執行。
3. 到專案 **Settings → API**，複製三個值填進 `.env.local`：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（⚠️ 絕對不能外流，只用在伺服器端 API route）

`leads` 表沒有開放任何 public 的 RLS policy，前端不會直接連 Supabase，
只有 `/api/leads` 用 service-role key 寫入，安全性上比較單純。

## 部署（Vercel）

1. 把這個 repo push 到 GitHub。
2. 到 [Vercel](https://vercel.com/new) → Import Git Repository → 選這個 repo。
3. 在 Vercel 專案的 **Settings → Environment Variables**，把 `.env.local`
   裡的三個 Supabase 值貼進去（Production / Preview / Development 都加）。
4. Deploy。之後每次 push 到 `main` 都會自動重新部署。

## Phase 2（後續規劃）

- `/admin` 登入保護的後台（照片上傳、方案價格編輯、同業比較表管理、FAQ 管理）
- `/admin/leads`：名單列表、篩選、CSV 匯出
- 表單防灌水（rate limit / reCAPTCHA）
- SEO / OG 圖片 / 效能優化
