import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("badminton_faqs")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ faqs: data ?? [] });
}

export async function POST(req: NextRequest) {
  let body: { question?: string; answer?: string; sort_order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body.question?.trim() || !body.answer?.trim()) {
    return NextResponse.json({ error: "問題與答案為必填" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("badminton_faqs")
    .insert({
      question: body.question.trim(),
      answer: body.answer.trim(),
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ faq: data });
}
