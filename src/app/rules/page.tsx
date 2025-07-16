import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, AlertTriangle, CheckCircle, Pin } from "lucide-react";

export const metadata: Metadata = {
  title: "Szabályzat",
  description: "Közösségi szabályzat és moderációs elvek a Yumekai platformon.",
};

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <Card className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">
        <CardHeader>
          <CardTitle>Szabályzat</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Ban className="mt-1 text-red-500" />
              <span>NSFW tartalom tilos</span>
            </li>
            <li className="flex items-start gap-3">
              <Ban className="mt-1 text-red-500" />
              <span>Loli, hentai, szexuálisan explicit tartalom tilos</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="mt-1 text-yellow-500" />
              <span>Valós személyek megalázása, zaklatása tilos</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-1 text-green-500" />
              <span>Közösségi irányelvek betartása kötelező</span>
            </li>
            <li className="flex items-start gap-3">
              <Pin className="mt-1 text-blue-500" />
              <span>Tartalmakat a moderátorok indoklás nélkül is törölhetnek</span>
            </li>
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Az oldal később bővíthető linkekkel a moderációs elvekről vagy riport
            funkcióról.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
