import { useState } from "react";
import { faqs } from "../../data/homeContent";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-bold text-[#1E293B]">Frequently Asked Questions</h2>

        <div className="mt-8 flex flex-col divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-white">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-[#1E293B]"
                >
                  {faq.question}
                  <span className={`text-[#64748B] transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    &#9660;
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 text-sm leading-relaxed text-[#64748B]">{faq.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
