import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("badminton_leads")
    .delete({ count: "exact" })
    .eq("id", params.id);

  console.log("[api/admin/leads DELETE] id=", params.id, "deletedCount=", count, "error=", error);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, deletedCount: count });
}
