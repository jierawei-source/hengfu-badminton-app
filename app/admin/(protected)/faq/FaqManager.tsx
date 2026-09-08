"use client";

import { useState, type CSSProperties } from "react";

type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "14px",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const buttonStyle: CSSProperties = {
  padding: "10px 18px",
  borderRadius: "8px",
  border: "none",
  background: "#111",
  color: "#fff",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
};

export default function FaqManager({ initialFaqs }: { initialFaqs: Faq[] }) {
  const [faqs, setFaqs] = useState<Faq[]>(
    [...initialFaqs].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!newQ.trim() || !newA.trim()) return;
    setError(null);
    setAdding(true);
    const nextOrder = faqs.length
      ? Math.max(...faqs.map((f) => f.sort_order)) + 1
      : 1;
    try {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQ, answer: newA, sort_order: nextOrder }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "新增失敗");
        return;
      }
      const { faq } = await res.json();
      setFaqs((prev) => [...prev, faq].sort((a, b) => a.sort_order - b.sort_order));
      setNewQ("");
      setNewA("");
    } finally {
      setAdding(false);
    }
  }

  async function handleSave(id: string, patch: Partial<Faq>) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/faq/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "儲存失敗");
        return;
      }
      const { faq } = await res.json();
      setFaqs((prev) =>
        prev.map((f) => (f.id === id ? faq : f)).sort((a, b) => a.sort_order - b.sort_order)
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("確定要刪除這則常見問題嗎？")) return;
    setError(null);
    const res = await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "刪除失敗");
      return;
    }
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>常見問題</h1>
      <p style={{ color: "#666", fontSize: "13px", marginBottom: "24px" }}>
        編輯後大約 1 分鐘內會反映到正式網站（首頁常見問題區塊）。排序數字越小越前面。
      </p>

      {error && (
        <p style={{ color: "#dc2626", marginBottom: "16px", fontSize: "13px" }}>{error}</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
        {faqs.map((faq) => (
          <FaqRow
            key={faq.id}
            faq={faq}
            saving={savingId === faq.id}
            onSave={(patch) => handleSave(faq.id, patch)}
            onDelete={() => handleDelete(faq.id)}
          />
        ))}
        {faqs.length === 0 && (
          <p style={{ color: "#999", fontSize: "13px" }}>目前還沒有任何常見問題。</p>
        )}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e3",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>
          新增常見問題
        </div>
        <input
          value={newQ}
          onChange={(e) => setNewQ(e.target.value)}
          placeholder="問題"
          style={inputStyle}
        />
        <textarea
          value={newA}
          onChange={(e) => setNewA(e.target.value)}
          placeholder="答案"
          rows={3}
          style={{ ...inputStyle, marginTop: "8px", resize: "vertical" }}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newQ.trim() || !newA.trim()}
          style={{
            ...buttonStyle,
            marginTop: "12px",
            background: adding || !newQ.trim() || !newA.trim() ? "#ccc" : "#111",
            cursor: adding || !newQ.trim() || !newA.trim() ? "not-allowed" : "pointer",
          }}
        >
          {adding ? "新增中…" : "新增"}
        </button>
      </div>
    </div>
  );
}

function FaqRow({
  faq,
  saving,
  onSave,
  onDelete,
}: {
  faq: Faq;
  saving: boolean;
  onSave: (patch: Partial<Faq>) => void;
  onDelete: () => void;
}) {
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [sortOrder, setSortOrder] = useState(faq.sort_order);

  const dirty =
    question !== faq.question || answer !== faq.answer || sortOrder !== faq.sort_order;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e3",
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          style={{ ...inputStyle, width: "70px", flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <input value={question} onChange={(e) => setQuestion(e.target.value)} style={inputStyle} />
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
            style={{ ...inputStyle, marginTop: "8px", resize: "vertical" }}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "flex-end" }}>
        <button
          onClick={onDelete}
          style={{
            ...buttonStyle,
            background: "transparent",
            color: "#dc2626",
            border: "1px solid #fca5a5",
          }}
        >
          刪除
        </button>
        <button
          onClick={() => onSave({ question, answer, sort_order: sortOrder })}
          disabled={!dirty || saving}
          style={{
            ...buttonStyle,
            background: !dirty || saving ? "#ccc" : "#111",
            cursor: !dirty || saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "儲存中…" : "儲存"}
        </button>
      </div>
    </div>
  );
}
