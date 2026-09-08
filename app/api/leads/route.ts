import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type LeadPayload = {
  status?: string;
  region?: string;
  budget?: string;
  area?: string;
  timeline?: string;
  hasStore?: string;
  storeAddress?: string;
  courtType?: string;
  concern?: string;
  name?: string;
  phone?: string;
  lineId?: string;
  email?: string;
  consent?: boolean;
  pageUrl?: string;
};

export async function POST(req: NextRequest) {
  let body: LeadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.phone?.trim() || !body.consent) {
    return NextResponse.json(
      { error: "姓名、電話與同意條款為必填" },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server is not configured (missing Supabase env vars)" },
      { status: 500 }
    );
  }

  const { error } = await supabase.from("badminton_leads").insert({
    status: body.status ?? null,
    region: body.region ?? null,
    budget: body.budget ?? null,
    area: body.area ?? null,
    timeline: body.timeline ?? null,
    has_store: body.hasStore ?? null,
    store_address: body.storeAddress ?? null,
    court_type: body.courtType ?? null,
    concern: body.concern ?? null,
    name: body.name.trim(),
    phone: body.phone.trim(),
    line_id: body.lineId ?? null,
    email: body.email ?? null,
    consent: !!body.consent,
    page_url: body.pageUrl ?? null,
  });

  if (error) {
    console.error("leads insert failed", error);
    return NextResponse.json({ error: "資料庫寫入失敗" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
