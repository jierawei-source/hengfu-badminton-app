import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const COLUMNS = [
  "created_at",
  "name",
  "phone",
  "line_id",
  "email",
  "status",
  "region",
  "budget",
  "area",
  "timeline",
  "has_store",
  "store_address",
  "court_type",
  "concern",
  "consent",
  "page_url",
] as const;

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("badminton_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "匯出失敗" }, { status: 500 });
  }

  const header = COLUMNS.join(",");
  const rows = (data ?? []).map((row) =>
    COLUMNS.map((col) => csvEscape((row as Record<string, unknown>)[col])).join(",")
  );
  // 開頭加 BOM，讓 Excel 開啟時中文不會亂碼。
  const csv = "\uFEFF" + [header, ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="badminton_leads_${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
