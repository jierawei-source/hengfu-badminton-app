-- 首頁「真實案例」卡片（館名、地區、照片），後台可新增／編輯／刪除／排序。
-- 跟其他後台表一樣，只透過 service-role key（伺服器端 /api/admin/* 或 /admin/* 後台頁面）存取，
-- 不開放任何 public 的 anon policy。照片實際檔案存在 badminton-photos 這個 Storage bucket
-- （跟球館實景照、產品圖片共用同一個 bucket，路徑用 cases/ 開頭區分）。

create table if not exists public.badminton_cases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  storage_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.badminton_cases is '首頁「真實案例」卡片（後台可新增／編輯／刪除／排序，可上傳照片）';
alter table public.badminton_cases enable row level security;
