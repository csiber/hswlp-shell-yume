"use client";

import CommunityFeedV3 from "../community/CommunityFeedV3";
import { Alert } from "@heroui/react";
import { motion } from "framer-motion";

export default function FeedCenter() {
  return (
    <div className="flex-1 flex flex-col gap-2 sm:gap-4 px-2 md:px-4 py-6">
      <div className="flex justify-center mt-4 mb-6">
        <motion.div
          className="max-w-xl w-full"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="rounded-lg border backdrop-blur-sm
        border-slate-200 dark:border-slate-700
        bg-white/50 dark:bg-slate-800/70
        shadow-sm dark:shadow-md"
            animate={{
              boxShadow: [
                "0 0 0px rgba(0,0,0,0.05)",
                "0 0 12px rgba(0,0,0,0.08)",
                "0 0 0px rgba(0,0,0,0.05)",
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Alert
              color="secondary"
              title="Welcome to Yume 1.0"
              description="The platform is now stable and ready for you to explore."
              className="px-4 py-3"
            />
          </motion.div>
        </motion.div>
      </div>

      <CommunityFeedV3 endpoint="/api/my-feed" />
    </div>
  );
}
