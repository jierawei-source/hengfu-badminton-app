-- 開店評估表單的名單資料表。
-- 只透過 app/api/leads/route.ts 用 service-role key 寫入（繞過 RLS），
-- 前端不會直接連線 Supabase，所以這裡刻意不開放任何 public 的 insert/select policy。

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  status text,           -- 目前狀態（想創業／已找到場地…）
  region text,           -- 預計地區
  budget text,           -- 總預算區間
  area text,             -- 預計坪數
  timeline text,         -- 預計開店時間
  has_store text,        -- 已有店面（是／否）
  store_address text,    -- 店面地址（選填）
  court_type text,       -- 希望做（羽球館／匹克球館…）
  concern text,          -- 最擔心的問題

  name text not null,
  phone text not null,
  line_id text,
  email text,
  consent boolean not null default false,

  page_url text          -- 送出當下的頁面網址，方便追蹤來源
);

comment on table public.leads is '免費開店評估表單送出的名單';

alter table public.leads enable row level security;
-- 目前沒有任何 policy：anon / authenticated 角色完全無法讀寫這張表，
-- 只有 service-role key（伺服器端）可以存取。之後做後台名單頁時，
-- 會另外新增 admin_users 表 + 對應的 policy 讓已登入管理員可以讀取。
