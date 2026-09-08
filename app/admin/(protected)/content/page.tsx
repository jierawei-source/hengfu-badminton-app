import { createAdminClient } from "@/lib/supabase/admin";
import { CONTENT_FIELDS, getDefaultContentMap } from "@/lib/site-content";
import ContentManager from "./ContentManager";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("badminton_site_content").select("key, value");

  const map = getDefaultContentMap();
  for (const row of data ?? []) {
    map[row.key as string] = row.value as string;
  }

  const fields = CONTENT_FIELDS.map((f) => ({ ...f, currentValue: map[f.key] }));

  return <ContentManager fields={fields} />;
}
