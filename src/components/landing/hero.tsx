"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
      {/* animált háttér glow */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="pointer-events-none absolute -top-64 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-300 via-pink-300 to-indigo-300 opacity-30 blur-3xl dark:from-fuchsia-500 dark:via-pink-500 dark:to-indigo-500 dark:opacity-20"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-40 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold sm:text-6xl lg:text-7xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-pink-500 dark:via-purple-500 dark:to-indigo-500"
        >
          A kreativitás jövője itt kezdődik
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-6 text-lg text-zinc-700 dark:text-zinc-300"
        >
          Építs, alkoss, inspirálj – a Yumekaira egy olyan hely, ahol a közösség, a
          mesterséges intelligencia és a művészet összeolvad.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/sign-up"
            className="rounded-full bg-indigo-600 px-8 py-3 text-lg font-medium text-white shadow-lg transition hover:bg-indigo-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Csatlakozz most
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-zinc-300 px-8 py-3 text-lg font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
          >
            Tudj meg többet
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
