import { createAdminClient } from "@/lib/supabase/admin";
import FaqManager from "./FaqManager";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("badminton_faqs")
    .select("*")
    .order("sort_order", { ascending: true });

  return <FaqManager initialFaqs={data ?? []} />;
}
