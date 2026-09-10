import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PHOTO_BUCKET } from "@/lib/photo-slots";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "請選擇要上傳的照片檔案" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "檔案太大，請上傳 8MB 以內的圖片" }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "只支援 JPG、PNG、WebP 格式的圖片" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: existing, error: findError } = await supabase
    .from("badminton_cases")
    .select("id, storage_path")
    .eq("id", params.id)
    .maybeSingle();

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "找不到這筆案例，請重新整理頁面" }, { status: 404 });
  }

  // 換照片格式時（例如原本 jpg 換成 png），舊檔案路徑不同會變成孤兒檔案，
  // 先把舊的清掉，避免 Storage 裡累積用不到的檔案。
  if (existing.storage_path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([existing.storage_path]);
  }

  const storagePath = `cases/${params.id}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const updatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("badminton_cases")
    .update({ storage_path: storagePath, updated_at: updatedAt })
    .eq("id", params.id)
    .select("id, name, location, storage_path, sort_order, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath);
  return NextResponse.json({
    case: {
      ...data,
      url: `${pub.publicUrl}?v=${encodeURIComponent(data.updated_at ?? "")}`,
    },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("badminton_cases")
    .select("storage_path")
    .eq("id", params.id)
    .maybeSingle();

  if (existing?.storage_path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([existing.storage_path]);
  }

  const { error } = await supabase
    .from("badminton_cases")
    .update({ storage_path: null, updated_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
