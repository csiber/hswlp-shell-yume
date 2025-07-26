import { Metadata } from "next";
import BugReportClient from "./bug-report.client";

export const metadata: Metadata = {
  title: "Hibajelentés",
  description: "Hiba bejelentése az oldal fejlesztőinek",
};

export default function BugReportPage() {
  return <BugReportClient />;
}
