import { createAdminClient } from "@/lib/supabase/admin";
import { PHOTO_BUCKET } from "@/lib/photo-slots";
import CaseManager from "./CaseManager";

export const dynamic = "force-dynamic";

export default async function AdminCasesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("badminton_cases")
    .select("id, name, location, storage_path, sort_order, updated_at")
    .order("sort_order", { ascending: true });

  const cases = (data ?? []).map((row) => {
    let url: string | null = null;
    if (row.storage_path) {
      const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(row.storage_path);
      url = `${pub.publicUrl}?v=${encodeURIComponent(row.updated_at ?? "")}`;
    }
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      sort_order: row.sort_order,
      url,
    };
  });

  return <CaseManager initialCases={cases} />;
}
