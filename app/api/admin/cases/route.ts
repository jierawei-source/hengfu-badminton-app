import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PHOTO_BUCKET } from "@/lib/photo-slots";

export const runtime = "nodejs";

function withUrl(
  supabase: ReturnType<typeof createAdminClient>,
  row: { id: string; name: string; location: string; storage_path: string | null; sort_order: number; updated_at: string }
) {
  let url: string | null = null;
  if (row.storage_path) {
    const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(row.storage_path);
    url = `${pub.publicUrl}?v=${encodeURIComponent(row.updated_at ?? "")}`;
  }
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    sort_order: row.sort_order,
    updated_at: row.updated_at,
    url,
  };
}

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("badminton_cases")
    .select("id, name, location, storage_path, sort_order, updated_at")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ cases: (data ?? []).map((row) => withUrl(supabase, row)) });
}

export async function POST(req: NextRequest) {
  let body: { name?: string; location?: string; sort_order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.location?.trim()) {
    return NextResponse.json({ error: "館名與地區為必填" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("badminton_cases")
    .insert({
      name: body.name.trim(),
      location: body.location.trim(),
      sort_order: body.sort_order ?? 0,
    })
    .select("id, name, location, storage_path, sort_order, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ case: withUrl(supabase, data) });
}
