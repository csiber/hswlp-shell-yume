"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

const faqs = [
  {
    q: "Mit tud a Yume?",
    a: "Egy AI-alapú kreatív platform, ahol weboldalakat, képeket, szövegeket és zenei projekteket indíthatsz el pár kattintással.",
  },
  {
    q: "Kell hozzá technikai tudás?",
    a: "Nem. A felületet úgy terveztük, hogy kezdők is elindulhassanak, de fejlesztőknek is van mélyebb hozzáférés (pl. custom kód, API).",
  },
  {
    q: "Ingyenes a használata?",
    a: "Van ingyenes kezdőcsomag, de a prémium funkciókhoz kredites rendszer tartozik (pl. generálás, domain, exportálás).",
  },
  {
    q: "Milyen AI-modellek vannak benne?",
    a: "ComfyUI (kép), Workers AI (szöveg, zene), és saját kisebb modellek. A lista folyamatosan bővül.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-[#0e111f] text-white py-24">
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
                className="border border-zinc-700 rounded-xl p-5 bg-zinc-900 cursor-pointer"
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
                {isOpen && <p className="mt-4 text-zinc-300">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
