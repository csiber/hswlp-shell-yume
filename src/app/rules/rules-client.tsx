"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, AlertTriangle, CheckCircle, Pin } from "lucide-react";
import { motion } from "framer-motion";

export default function RulesClient() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-3xl"
    >
      <Card className="prose prose-gray dark:prose-invert w-full">
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
    </motion.div>
  );
}
