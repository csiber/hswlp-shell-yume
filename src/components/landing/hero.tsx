"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      {/* animált háttér glow */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="pointer-events-none absolute -top-64 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-indigo-500 opacity-20 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-40 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold sm:text-6xl lg:text-7xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
        >
          A kreativitás jövője itt kezdődik
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-6 text-lg text-zinc-300"
        >
          Építs, alkoss, inspirálj – a Yume egy olyan hely, ahol a közösség, a
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
            className="rounded-full bg-white px-8 py-3 text-lg font-medium text-zinc-900 shadow-lg transition hover:bg-zinc-200"
          >
            Csatlakozz most
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-zinc-700 px-8 py-3 text-lg font-medium text-white transition hover:bg-zinc-900"
          >
            Tudj meg többet
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
