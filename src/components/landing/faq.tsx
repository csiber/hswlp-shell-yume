"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

const faqs = [
  {
    q: "Mi az a Yumekai?",
    a: "Egy kreatív megosztó oldal, ahol képeket, zenéket és promptokat oszthatsz meg másokkal, vagy inspirálódhatsz mások tartalmaiból.",
  },
  {
    q: "Kik használhatják?",
    a: "Bárki, aki érdeklődik a mesterséges intelligencia, zene vagy vizuális művészetek iránt. A platform nyitott mind kezdők, mind haladók számára.",
  },
  {
    q: "Milyen tartalmakat tölthetek fel?",
    a: "Jelenleg képeket, zenei fájlokat és AI promptokat. Minden feltöltést moderálunk, hogy biztonságos és inspiráló közösség maradjon.",
  },
  {
    q: "Ingyenes a használata?",
    a: "A Yumekai használata teljesen ingyenes. Később lesznek kreditalapú funkciók, de a böngészés és feltöltés továbbra is szabadon elérhető marad.",
  },
  {
    q: "Hogyan kezdjek neki?",
    a: "Regisztrálj egy fiókot, majd máris feltölthetsz, kedvelhetsz vagy menthetsz tartalmakat saját listádba. Nincs szükség technikai tudásra.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-gray-100 text-gray-900 py-24 dark:bg-[#0e111f] dark:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          Gyakori kérdések
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border border-zinc-300 rounded-xl p-5 bg-white cursor-pointer dark:border-zinc-700 dark:bg-zinc-900"
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{faq.q}</h3>
                  <ChevronDown
                    className={clsx(
                      "transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </div>
                {isOpen && (
                  <p className="mt-4 text-zinc-700 dark:text-zinc-300">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
