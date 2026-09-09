import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PHOTO_SLOTS, PHOTO_BUCKET } from "@/lib/photo-slots";

export const runtime = "nodejs";

const VALID_SLOTS = new Set(PHOTO_SLOTS.map((s) => s.key));

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slotKey: string } }
) {
  const { slotKey } = params;
  if (!VALID_SLOTS.has(slotKey)) {
    return NextResponse.json({ error: "不明的照片欄位" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("badminton_photos")
    .select("storage_path")
    .eq("slot_key", slotKey)
    .maybeSingle();

  if (existing?.storage_path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([existing.storage_path]);
  }

  const { error } = await supabase
    .from("badminton_photos")
    .delete()
    .eq("slot_key", slotKey);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
