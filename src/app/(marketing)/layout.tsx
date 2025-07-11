import NavFooterLayout from "@/layouts/NavFooterLayout";
import { metadata } from "./page-metadata";

export { metadata };

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <NavFooterLayout>{children}</NavFooterLayout>;
}
