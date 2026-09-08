import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>儀表板</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        選擇下面其中一項開始管理網站內容。
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <DashCard href="/admin/leads" title="開店評估名單" desc="查看表單送出的所有名單，並匯出 CSV" />
        <DashCard href="/admin/faq" title="常見問題" desc="新增、編輯、刪除首頁 FAQ" />
        <DashCard href="/admin/content" title="方案／文案內容" desc="編輯建置費用說明等文字內容" />
        <DashCard href="/admin/photos" title="照片管理" desc="上傳球館實景照、產品圖片" />
      </div>
    </div>
  );
}

function DashCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "20px",
        borderRadius: "14px",
        background: "#fff",
        border: "1px solid #e5e5e3",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "#888" }}>{desc}</div>
    </Link>
  );
}
