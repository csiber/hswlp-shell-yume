import { Metadata } from "next";
import RulesClient from "./rules-client";

export const metadata: Metadata = {
  title: "Rules",
  description: "Community guidelines and moderation principles on Yumekai.",
};

export default function RulesPage() {
  return <RulesClient />;
}
