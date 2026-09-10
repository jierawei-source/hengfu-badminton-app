import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PHOTO_BUCKET } from "@/lib/photo-slots";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: { name?: string; location?: string; sort_order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.location === "string") patch.location = body.location.trim();
  if (typeof body.sort_order === "number") patch.sort_order = body.sort_order;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("badminton_cases")
    .update(patch)
    .eq("id", params.id)
    .select("id, name, location, storage_path, sort_order, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let url: string | null = null;
  if (data.storage_path) {
    const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(data.storage_path);
    url = `${pub.publicUrl}?v=${encodeURIComponent(data.updated_at ?? "")}`;
  }
  return NextResponse.json({ case: { ...data, url } });
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

  const { error } = await supabase.from("badminton_cases").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
