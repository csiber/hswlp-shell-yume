import { Metadata } from "next";
import BugReportClient from "./bug-report.client";

export const metadata: Metadata = {
  title: "Bug Report",
  description: "Report a bug to the site developers",
};

export default function BugReportPage() {
  return <BugReportClient />;
}
