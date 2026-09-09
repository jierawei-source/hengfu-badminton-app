import { createAdminClient } from "@/lib/supabase/admin";
import LeadsTable, { type Lead } from "./LeadsTable";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("badminton_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const leads = (data ?? []) as Lead[];

  return <LeadsTable initialLeads={leads} loadError={error?.message ?? null} />;
}
