-- Phase 2 後台管理系統所需資料表。
-- 全部只透過 service-role key（伺服器端 /api/admin/* 或 /admin/* 後台頁面）存取，
-- 不開放任何 public 的 anon policy，前端不會直接連線 Supabase。

create extension if not exists "pgcrypto";

-- 常見問題（首頁 FAQ 區塊，後台可新增／編輯／刪除／排序）
create table if not exists public.badminton_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.badminton_faqs is '首頁常見問題（後台可編輯）';
alter table public.badminton_faqs enable row level security;

-- 可編輯文字內容（key/value），例如方案費用說明、比較表文案等
create table if not exists public.badminton_site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
comment on table public.badminton_site_content is '首頁可編輯文字區塊，key 對應頁面上的欄位';
alter table public.badminton_site_content enable row level security;

-- 照片（球館實景照、產品圖片等，實際檔案存在 Supabase Storage）
create table if not exists public.badminton_photos (
  slot_key text primary key,
  storage_path text not null,
  updated_at timestamptz not null default now()
);
comment on table public.badminton_photos is '首頁照片欄位，slot_key 對應頁面上的圖片位置，storage_path 對應 Storage 裡的檔案路徑';
alter table public.badminton_photos enable row level security;
