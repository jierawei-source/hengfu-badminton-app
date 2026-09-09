"use client";

import { useState } from "react";

export type Lead = {
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
  "", // 刪除按鈕欄，不需要標題
];

export default function LeadsTable({
  initialLeads,
  loadError,
}: {
  initialLeads: Lead[];
  loadError: string | null;
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`確定要刪除「${name}」這筆名單嗎？此動作無法復原。`)) return;
    setError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "刪除失敗");
        return;
      }
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

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

      {loadError && <p style={{ color: "#dc2626" }}>讀取名單失敗：{loadError}</p>}
      {error && <p style={{ color: "#dc2626", marginBottom: "12px" }}>{error}</p>}

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
              {HEADERS.map((h, i) => (
                <th
                  key={h || `col-${i}`}
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
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                  <button
                    onClick={() => handleDelete(lead.id, lead.name)}
                    disabled={deletingId === lead.id}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #fca5a5",
                      background: "transparent",
                      color: "#dc2626",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: deletingId === lead.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {deletingId === lead.id ? "刪除中…" : "刪除"}
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && !loadError && (
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
