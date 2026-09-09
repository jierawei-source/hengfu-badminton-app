"use client";

import { useRef, useState, type CSSProperties } from "react";

type Slot = {
  key: string;
  label: string;
  url: string | null;
  updatedAt: string | null;
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

export default function PhotoManager({ initialSlots }: { initialSlots: Slot[] }) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);

  function updateSlot(key: string, patch: Partial<Slot>) {
    setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>照片管理</h1>
      <p style={{ color: "#666", fontSize: "13px", marginBottom: "24px" }}>
        支援 JPG／PNG／WebP，檔案大小 8MB 以內，建議比例 4:3。上傳後大約 1 分鐘內會反映到正式網站；
        沒有上傳照片的欄位會維持原本的預留畫面，不會讓網站開天窗。
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {slots.map((slot) => (
          <PhotoSlotCard key={slot.key} slot={slot} onChange={(patch) => updateSlot(slot.key, patch)} />
        ))}
      </div>
    </div>
  );
}

function PhotoSlotCard({
  slot,
  onChange,
}: {
  slot: Slot;
  onChange: (patch: Partial<Slot>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("slotKey", slot.key);
      formData.append("file", file);
      const res = await fetch("/api/admin/photos", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "上傳失敗");
        return;
      }
      const { photo } = await res.json();
      onChange({ url: photo.url, updatedAt: photo.updated_at });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!confirm("確定要移除這張照片嗎？移除後會恢復成預留畫面。")) return;
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/photos/${slot.key}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "移除失敗");
        return;
      }
      onChange({ url: null, updatedAt: null });
    } finally {
      setDeleting(false);
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
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "14px" }}>{slot.label}</div>
      <div
        style={{
          aspectRatio: "4 / 3",
          borderRadius: "8px",
          background: "#f3f3f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          color: "#999",
          fontSize: "12px",
        }}
      >
        {slot.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slot.url} alt={slot.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span>尚未上傳，目前顯示預留畫面</span>
        )}
      </div>
      {error && <p style={{ color: "#dc2626", fontSize: "12px" }}>{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ ...buttonStyle, flex: 1, background: uploading ? "#ccc" : "#111" }}
        >
          {uploading ? "上傳中…" : slot.url ? "更換照片" : "上傳照片"}
        </button>
        {slot.url && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              ...buttonStyle,
              background: "transparent",
              color: "#dc2626",
              border: "1px solid #fca5a5",
            }}
          >
            {deleting ? "移除中…" : "移除"}
          </button>
        )}
      </div>
    </div>
  );
}
