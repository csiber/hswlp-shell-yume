"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

const faqs = [
  {
    q: "What is Yumekai?",
    a: "A creative sharing site where you can post images, music and prompts or get inspired by others.",
  },
  {
    q: "Who can use it?",
    a: "Anyone interested in AI, music or visual arts. The platform is open to both beginners and advanced users.",
  },
  {
    q: "What content can I upload?",
    a: "Currently images, audio files and AI prompts. We moderate everything to keep the community safe and inspiring.",
  },
  {
    q: "Is it free to use?",
    a: "Yumekai is completely free. Credit based features may arrive later but browsing and uploading will remain free.",
  },
  {
    q: "How do I start?",
    a: "Create an account and you can immediately upload, like or save content. No technical skills required.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-gray-100 text-gray-900 py-24 dark:bg-[#0e111f] dark:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
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
