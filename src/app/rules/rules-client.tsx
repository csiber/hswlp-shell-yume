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
          <CardTitle>Community Rules & Content Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Ban className="mt-1 text-red-500" />
              <span>
                <strong>No NSFW content —</strong> includes nudity, pornography, and sexually explicit material. Yumekai is a safe-for-work platform and strictly adheres to Cloudflare’s acceptable use policies.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Ban className="mt-1 text-red-500" />
              <span>
                <strong>No loli or hentai content —</strong> any material that may be interpreted as child exploitation or drawn sexualized minors is strictly prohibited and will be removed without warning.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="mt-1 text-yellow-500" />
              <span>
                <strong>No harassment or abuse —</strong> do not target real individuals with hate speech, defamation, or harassment, including deepfakes or misleading representations.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-1 text-green-500" />
              <span>
                <strong>Respect community standards —</strong> artistic freedom is welcomed, but content must be constructive and respectful to others.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Pin className="mt-1 text-blue-500" />
              <span>
                <strong>Moderators may remove any content at their discretion —</strong> no justification required. Repeated violations may lead to suspension or permanent ban.
              </span>
            </li>
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            By using Yumekai, you agree to follow these rules. Violations may lead to content removal, account restrictions, or legal reporting. Detailed moderation policy and report system coming soon.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
