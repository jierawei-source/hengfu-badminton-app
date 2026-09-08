import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CONTENT_FIELDS } from "@/lib/site-content";

export const runtime = "nodejs";

const VALID_KEYS = new Set(CONTENT_FIELDS.map((f) => f.key));

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("badminton_site_content")
    .select("key, value, updated_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ content: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  let body: { key?: string; value?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body.key || !VALID_KEYS.has(body.key)) {
    return NextResponse.json({ error: "不明的欄位 key" }, { status: 400 });
  }
  if (typeof body.value !== "string") {
    return NextResponse.json({ error: "value 為必填字串" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("badminton_site_content")
    .upsert(
      { key: body.key, value: body.value.trim(), updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ content: data });
}
