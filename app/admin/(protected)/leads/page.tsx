import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  created_at: string;
  status: string | null;
  region: string | null;
  budget: string | null;
  area: string | null;
  timeline: string | null;
  has_store: string | null;
  store_address: string | null;
  court_type: string | null;
  concern: string | null;
  name: string;
  phone: string;
  line_id: string | null;
  email: string | null;
  consent: boolean;
  page_url: string | null;
};

const HEADERS = [
  "送出時間",
  "姓名",
  "電話",
  "LINE ID",
  "Email",
  "目前狀態",
  "地區",
  "預算",
  "坪數",
  "開店時間",
  "希望做",
  "最擔心的問題",
];

export default async function AdminLeadsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("badminton_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const leads = (data ?? []) as Lead[];

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800 }}>開店評估名單</h1>
          <p style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>
            共 {leads.length} 筆（最新 200 筆）
          </p>
        </div>
        <a
          href="/api/admin/leads/export"
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            background: "#111",
            color: "#fff",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          匯出 CSV
        </a>
      </div>

      {error && <p style={{ color: "#dc2626" }}>讀取名單失敗：{error.message}</p>}

      <div
        style={{
          overflowX: "auto",
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e5e3",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
              {HEADERS.map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 12px",
                    whiteSpace: "nowrap",
                    color: "#888",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} style={{ borderBottom: "1px solid #f2f2f0" }}>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  {new Date(lead.created_at).toLocaleString("zh-TW")}
                </td>
                <td style={{ padding: "10px 12px" }}>{lead.name}</td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{lead.phone}</td>
                <td style={{ padding: "10px 12px" }}>{lead.line_id ?? "-"}</td>
                <td style={{ padding: "10px 12px" }}>{lead.email ?? "-"}</td>
                <td style={{ padding: "10px 12px" }}>{lead.status ?? "-"}</td>
                <td style={{ padding: "10px 12px" }}>{lead.region ?? "-"}</td>
                <td style={{ padding: "10px 12px" }}>{lead.budget ?? "-"}</td>
                <td style={{ padding: "10px 12px" }}>{lead.area ?? "-"}</td>
                <td style={{ padding: "10px 12px" }}>{lead.timeline ?? "-"}</td>
                <td style={{ padding: "10px 12px" }}>{lead.court_type ?? "-"}</td>
                <td style={{ padding: "10px 12px", maxWidth: "220px" }}>{lead.concern ?? "-"}</td>
              </tr>
            ))}
            {leads.length === 0 && !error && (
              <tr>
                <td colSpan={HEADERS.length} style={{ padding: "24px", textAlign: "center", color: "#999" }}>
                  目前還沒有任何名單
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
