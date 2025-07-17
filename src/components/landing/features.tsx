"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const features = [
  "Zenék, képek, promtok – egyetlen platformon",
  "Feltöltés, értékelés, komment – közösségi alkotás",
  "Valós idejű feed és globális zenelejátszó",
  "Kredit alapú rendszer, jutalmazott aktivitás",
  "Személyes gyűjtemények, lejátszási listák",
  "Beépített piactér – adj el vagy vásárolj tartalmakat",
];

export default function Features() {
  return (
    <section className="bg-gray-50 text-gray-900 py-24 dark:bg-[#0b0e1a] dark:text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-extrabold mb-8"
        >
          Egy kreatív játszótér az AI és a közösség határán
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-zinc-600 mb-12 max-w-2xl mx-auto dark:text-zinc-400"
        >
          A Yumekai segít, hogy ne csak alkoss, hanem visszajelzést is kapj,
          közösségbe kerülj, és akár bevételt is szerezz. A kreativitás itt nem
          magányos műfaj.
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
