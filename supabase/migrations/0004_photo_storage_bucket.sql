-- 建立照片上傳功能要用的 Supabase Storage bucket。
-- 設為 public，這樣網站前台才能直接用公開網址顯示照片，
-- 上傳／刪除則一律透過後台 API（service-role key）執行，不開放給前台直接寫入。

insert into storage.buckets (id, name, public)
values ('badminton-photos', 'badminton-photos', true)
on conflict (id) do nothing;
