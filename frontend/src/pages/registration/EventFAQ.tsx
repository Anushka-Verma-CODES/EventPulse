import { useState } from "react";
import { mockEventDetail } from "../../lib/registrationMockData";

export default function EventFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1E293B]">FAQ</h2>
      <div className="mt-3 flex flex-col divide-y divide-[#E2E8F0]">
        {mockEventDetail.faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-3 text-left text-sm font-medium text-[#1E293B]"
              >
                {faq.question}
                <span className={`text-[#64748B] transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  &#9660;
                </span>
              </button>
              {isOpen && <p className="pb-3 text-sm text-[#64748B]">{faq.answer}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
