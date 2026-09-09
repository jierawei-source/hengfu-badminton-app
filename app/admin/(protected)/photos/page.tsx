import { createAdminClient } from "@/lib/supabase/admin";
import { PHOTO_SLOTS, PHOTO_BUCKET } from "@/lib/photo-slots";
import PhotoManager from "./PhotoManager";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("badminton_photos")
    .select("slot_key, storage_path, updated_at");

  const rows = data ?? [];

  const slots = PHOTO_SLOTS.map((slot) => {
    const row = rows.find((r) => r.slot_key === slot.key);
    let url: string | null = null;
    if (row) {
      const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(row.storage_path);
      url = `${pub.publicUrl}?v=${encodeURIComponent(row.updated_at ?? "")}`;
    }
    return {
      key: slot.key,
      label: slot.label,
      url,
      updatedAt: row?.updated_at ?? null,
    };
  });

  return <PhotoManager initialSlots={slots} />;
}
