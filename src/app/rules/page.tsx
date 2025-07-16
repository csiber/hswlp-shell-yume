import { Metadata } from "next";
import RulesClient from "./rules-client";

export const metadata: Metadata = {
  title: "Szabályzat",
  description: "Közösségi szabályzat és moderációs elvek a Yumekai platformon.",
};

export default function RulesPage() {
  return <RulesClient />;
}
