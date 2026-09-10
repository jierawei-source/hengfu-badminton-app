"use client";

import { useRef, useState, type CSSProperties } from "react";

type CaseItem = {
  id: string;
  name: string;
  location: string;
  sort_order: number;
  url: string | null;
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

export default function CaseManager({ initialCases }: { initialCases: CaseItem[] }) {
  const [cases, setCases] = useState<CaseItem[]>(
    [...initialCases].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateCase(id: string, patch: Partial<CaseItem>) {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  async function handleAdd() {
    if (!newName.trim() || !newLocation.trim()) return;
    setError(null);
    setAdding(true);
    const nextOrder = cases.length
      ? Math.max(...cases.map((c) => c.sort_order)) + 1
      : 1;
    try {
      const res = await fetch("/api/admin/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, location: newLocation, sort_order: nextOrder }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "新增失敗");
        return;
      }
      const { case: created } = await res.json();
      setCases((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
      setNewName("");
      setNewLocation("");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("確定要刪除這個案例嗎？照片也會一併刪除，此動作無法復原。")) return;
    setError(null);
    const res = await fetch(`/api/admin/cases/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "刪除失敗");
      return;
    }
    setCases((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>真實案例</h1>
      <p style={{ color: "#666", fontSize: "13px", marginBottom: "24px" }}>
        對應首頁「全台羽球館、匹克球館都在用」區塊的卡片，可自由新增、編輯、刪除，並可各自上傳照片
        （建議比例 4:3，8MB 以內；沒有上傳照片時會顯示預留圖示）。編輯後大約 1 分鐘內會反映到正式網站。
        排序數字越小越前面。
      </p>

      {error && (
        <p style={{ color: "#dc2626", marginBottom: "16px", fontSize: "13px" }}>{error}</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
        {cases.map((c) => (
          <CaseRow
            key={c.id}
            item={c}
            onChange={(patch) => updateCase(c.id, patch)}
            onDelete={() => handleDelete(c.id)}
          />
        ))}
        {cases.length === 0 && (
          <p style={{ color: "#999", fontSize: "13px" }}>目前還沒有任何案例。</p>
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
          新增案例
        </div>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="館名，例如：南區羽球館"
          style={inputStyle}
        />
        <input
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          placeholder="地區，例如：高雄"
          style={{ ...inputStyle, marginTop: "8px" }}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim() || !newLocation.trim()}
          style={{
            ...buttonStyle,
            marginTop: "12px",
            background: adding || !newName.trim() || !newLocation.trim() ? "#ccc" : "#111",
            cursor: adding || !newName.trim() || !newLocation.trim() ? "not-allowed" : "pointer",
          }}
        >
          {adding ? "新增中…" : "新增"}
        </button>
        <p style={{ color: "#999", fontSize: "12px", marginTop: "8px" }}>
          新增後可以在上面的清單裡幫這個案例上傳照片。
        </p>
      </div>
    </div>
  );
}

function CaseRow({
  item,
  onChange,
  onDelete,
}: {
  item: CaseItem;
  onChange: (patch: Partial<CaseItem>) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [location, setLocation] = useState(item.location);
  const [sortOrder, setSortOrder] = useState(item.sort_order);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty = name !== item.name || location !== item.location || sortOrder !== item.sort_order;

  async function handleSave() {
    setSaving(true);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/cases/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location, sort_order: sortOrder }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRowError(data.error ?? "儲存失敗");
        return;
      }
      const { case: updated } = await res.json();
      onChange(updated);
    } finally {
      setSaving(false);
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRowError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/cases/${item.id}/photo`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRowError(data.error ?? "上傳失敗");
        return;
      }
      const { case: updated } = await res.json();
      onChange(updated);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemovePhoto() {
    if (!confirm("確定要移除這張照片嗎？移除後會恢復成預留圖示。")) return;
    setRowError(null);
    setRemovingPhoto(true);
    try {
      const res = await fetch(`/api/admin/cases/${item.id}/photo`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRowError(data.error ?? "移除失敗");
        return;
      }
      onChange({ url: null });
    } finally {
      setRemovingPhoto(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e5e3",
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: "120px",
          aspectRatio: "4 / 3",
          borderRadius: "8px",
          background: "#f3f3f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          color: "#999",
          fontSize: "11px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {item.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ padding: "0 8px" }}>尚未上傳，顯示預留圖示</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: "220px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            style={{ ...inputStyle, width: "70px", flexShrink: 0 }}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="館名"
            style={inputStyle}
          />
        </div>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="地區"
          style={{ ...inputStyle, marginTop: "8px" }}
        />
        {rowError && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "8px" }}>{rowError}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelected}
          style={{ display: "none" }}
        />
        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ ...buttonStyle, background: uploading ? "#ccc" : "#111" }}
          >
            {uploading ? "上傳中…" : item.url ? "更換照片" : "上傳照片"}
          </button>
          {item.url && (
            <button
              onClick={handleRemovePhoto}
              disabled={removingPhoto}
              style={{
                ...buttonStyle,
                background: "transparent",
                color: "#dc2626",
                border: "1px solid #fca5a5",
              }}
            >
              {removingPhoto ? "移除中…" : "移除照片"}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            style={{
              ...buttonStyle,
              background: !dirty || saving ? "#ccc" : "#111",
              cursor: !dirty || saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "儲存中…" : "儲存文字"}
          </button>
          <button
            onClick={onDelete}
            style={{
              ...buttonStyle,
              background: "transparent",
              color: "#dc2626",
              border: "1px solid #fca5a5",
            }}
          >
            刪除案例
          </button>
        </div>
      </div>
    </div>
  );
}
