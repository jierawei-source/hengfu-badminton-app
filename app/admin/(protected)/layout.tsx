import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/admin/session";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) {
    redirect("/admin/login");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          background: "#111",
          color: "#fff",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "24px" }}>
          恆富創新後台
        </div>
        <AdminNavLink href="/admin">儀表板</AdminNavLink>
        <AdminNavLink href="/admin/leads">開店評估名單</AdminNavLink>
        <AdminNavLink href="/admin/faq">常見問題</AdminNavLink>
        <AdminNavLink href="/admin/content">方案／文案內容</AdminNavLink>
        <AdminNavLink href="/admin/photos">照片管理</AdminNavLink>
        <form
          action="/api/admin/logout"
          method="post"
          style={{ marginTop: "auto", paddingTop: "24px" }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "transparent",
              color: "#ccc",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            登出
          </button>
        </form>
      </aside>
      <main style={{ flex: 1, padding: "32px", background: "#f7f7f5", overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        padding: "10px 12px",
        borderRadius: "8px",
        color: "#eee",
        textDecoration: "none",
        fontSize: "14px",
      }}
    >
      {children}
    </Link>
  );
}
