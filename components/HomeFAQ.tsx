"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQ {
    q: string;
    a: string;
}

export default function HomeFAQ() {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const faqs: FAQ[] = [
        { q: "How do I buy notes?", a: "Simply browse for the notes you need, click 'Buy Now', and complete the payment using bKash, Nagad, or Rocket. You'll get instant access." },
        { q: "Can I sell my handwritten notes?", a: "Yes! Scan your notes clearly (PDF preferred), upload them via the 'Sell' page, and set your price. Once approved, they'll be listed." },
        { q: "Is it free to join?", a: "Absolutely! creating an account is 100% free. We only charge a small commission when you sell a note." }
    ];

    return (
        <div className="space-y-4">
            {faqs.map((faq, i) => (
                <div key={i} className="group bg-surface border border-border rounded-2xl overflow-hidden">
                    <button 
                        onClick={() => toggleFAQ(i)}
                        className="w-full flex cursor-pointer items-center justify-between gap-1.5 p-6 text-text-main font-bold hover:bg-pastel-purple/30 transition-colors text-left"
                    >
                        <span className="text-lg">{faq.q}</span>
                        <span className={`shrink-0 rounded-full bg-white p-1.5 text-text-main sm:p-3 shadow-sm border border-border transition-transform duration-300 ${openFAQ === i ? "-rotate-180" : ""}`}>
                            <ChevronDown size={20} />
                        </span>
                    </button>
                    <AnimatePresence>
                        {openFAQ === i && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 pb-6 pt-2 leading-relaxed text-text-secondary">
                                    {faq.a}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
