"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "登入失敗");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("網路錯誤，請稍後再試");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f4",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          width: "320px",
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>
          恆富創新後台
        </h1>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>
          請輸入管理員密碼
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密碼"
          autoFocus
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            fontSize: "15px",
            marginBottom: "16px",
            boxSizing: "border-box",
          }}
        />
        {error && (
          <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            background: loading || !password ? "#ccc" : "#111",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 700,
            cursor: loading || !password ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "登入中…" : "登入"}
        </button>
      </form>
    </div>
  );
}
