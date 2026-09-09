import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PHOTO_SLOTS, PHOTO_BUCKET } from "@/lib/photo-slots";

export const runtime = "nodejs";

const VALID_SLOTS = new Set(PHOTO_SLOTS.map((s) => s.key));
const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("badminton_photos")
    .select("slot_key, storage_path, updated_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const photos = (data ?? []).map((row) => {
    const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(row.storage_path);
    return {
      slot_key: row.slot_key,
      updated_at: row.updated_at,
      url: `${pub.publicUrl}?v=${encodeURIComponent(row.updated_at ?? "")}`,
    };
  });

  return NextResponse.json({ photos });
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form data" }, { status: 400 });
  }

  const slotKey = form.get("slotKey");
  const file = form.get("file");

  if (typeof slotKey !== "string" || !VALID_SLOTS.has(slotKey)) {
    return NextResponse.json({ error: "不明的照片欄位" }, { status: 400 });
  }
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
  const storagePath = `${slotKey}/current.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const updatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("badminton_photos")
    .upsert(
      { slot_key: slotKey, storage_path: storagePath, updated_at: updatedAt },
      { onConflict: "slot_key" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath);
  return NextResponse.json({
    photo: {
      slot_key: data.slot_key,
      updated_at: data.updated_at,
      url: `${pub.publicUrl}?v=${encodeURIComponent(data.updated_at ?? "")}`,
    },
  });
}
