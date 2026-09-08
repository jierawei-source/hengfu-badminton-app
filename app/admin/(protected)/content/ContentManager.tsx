"use client";

import { useState, type CSSProperties } from "react";

type Field = {
  key: string;
  label: string;
  defaultValue: string;
  multiline?: boolean;
  currentValue: string;
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

export default function ContentManager({ fields }: { fields: Field[] }) {
  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>
        方案／文案內容
      </h1>
      <p style={{ color: "#666", fontSize: "13px", marginBottom: "24px" }}>
        編輯後大約 1 分鐘內會反映到正式網站。留空會顯示預設文字，不會讓網站開天窗。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {fields.map((field) => (
          <ContentRow key={field.key} field={field} />
        ))}
      </div>
    </div>
  );
}

function ContentRow({ field }: { field: Field }) {
  const [value, setValue] = useState(field.currentValue);
  const [saved, setSaved] = useState(field.currentValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = value !== saved;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: field.key, value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "儲存失敗");
        return;
      }
      const { content } = await res.json();
      setSaved(content.value);
      setValue(content.value);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e3",
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
        {field.label}
      </div>
      <div style={{ color: "#999", fontSize: "12px", marginBottom: "10px" }}>
        預設值：{field.defaultValue}
      </div>
      {field.multiline ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      ) : (
        <input value={value} onChange={(e) => setValue(e.target.value)} style={inputStyle} />
      )}
      {error && (
        <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "8px" }}>{error}</p>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
        <button
          onClick={handleSave}
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
