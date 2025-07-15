"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const features = [
  "AI-alapú generálás: képek, szövegek, zene",
  "Sablon alapú projektindítás (portfólió, galéria, blog)",
  "Egy kattintásos kiadás Cloudflare Pages-re",
  "Saját domain + tárhely csatolás",
  "Közösségi visszajelzések, szavazások",
  "Beépített kreditrendszer és piactér",
];

export default function Features() {
  return (
    <section className="bg-[#0b0e1a] text-white py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-extrabold mb-8"
        >
          Minden, amire egy kreatívnak szüksége lehet
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-zinc-400 mb-12 max-w-2xl mx-auto"
        >
          A Yumekaira egy helyre hozza össze az AI-t, a design-t és a webet. Nem kell
          többé máshol regisztrálnod, ha alkotni szeretnél.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
          {features.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="text-indigo-500 mt-1" size={20} />
              <p>{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
