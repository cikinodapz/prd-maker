import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export function FAQ() {
  const faqs = [
    {
      question: "Apakah data ide produk saya aman?",
      answer: "Ya, kami sangat menghargai privasi Anda. Ide dan data yang Anda masukkan hanya digunakan untuk menghasilkan PRD melalui model AI dan tidak disimpan secara permanen di database kami."
    },
    {
      question: "Bisa export hasil PRD ke format apa saja?",
      answer: "Saat ini Anda bisa meng-copy hasil teks secara langsung, atau mengekspornya ke format Markdown (.md) yang sangat cocok untuk ditempelkan ke Notion, GitHub, atau Jira."
    },
    {
      question: "Apakah layanan ini sepenuhnya gratis?",
      answer: "Untuk saat ini layanan Prodify sepenuhnya gratis untuk digunakan selama fase beta. Kami mungkin akan menerapkan sistem pricing di masa depan untuk fitur-fitur premium."
    },
    {
      question: "Apa bedanya pakai ini dibanding ChatGPT biasa?",
      answer: "Prodify memiliki prompt dan alur yang sudah disesuaikan khusus untuk product management. Kami memastikan format yang dihasilkan standar industri, plus ada mode Roast dan editor inline yang tidak ada di ChatGPT."
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-20 max-w-3xl mx-auto px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1E1B4B]">Pertanyaan Umum</h2>
        <p className="text-slate-600 mt-4 text-lg">Semua yang perlu Anda tahu sebelum memulai.</p>
      </motion.div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <motion.details 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
            className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between p-6 cursor-pointer text-[#1E1B4B] font-bold text-lg hover:bg-slate-50 transition-colors">
              {faq.question}
              <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-300" />
            </summary>
            <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
              {faq.answer}
            </div>
          </motion.details>
        ))}
      </div>
    </section>
  );
}
