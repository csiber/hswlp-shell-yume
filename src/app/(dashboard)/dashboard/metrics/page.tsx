import { requireAdmin } from "@/utils/auth";
import SlowRequestsDashboard from "./slow-requests-dashboard";

export const dynamic = "force-dynamic";

export default async function MetricsPage() {
  await requireAdmin();
  return <SlowRequestsDashboard />;
}
