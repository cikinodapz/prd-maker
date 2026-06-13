import { Star, User, Briefcase, Paintbrush } from "lucide-react";
import { motion } from "framer-motion";

export function Testimonials() {
  const reviews = [
    {
      name: "Budi Santoso",
      role: "Product Manager @ TechCorp",
      content: "Sejak pakai Prodify, saya bisa hemat waktu berjam-jam untuk nulis dokumen dari nol. Hasilnya terstruktur rapi dan siap dikasih ke engineer.",
      icon: <User className="w-6 h-6 text-slate-600" />,
      bg: "bg-white",
    },
    {
      name: "Siti Aminah",
      role: "Startup Founder",
      content: "Mode 'Roast' nya brutal tapi sangat berguna! Benar-benar membuka mata tentang bolong-bolong di ide bisnis yang belum saya pikirkan sebelumnya.",
      icon: <Briefcase className="w-6 h-6 text-slate-600" />,
      bg: "bg-white",
    },
    {
      name: "Andi Wijaya",
      role: "Senior UX Designer",
      content: "Suka banget fitur revisi inline-nya. Kayak Google Docs tapi AI-nya langsung benerin dokumen secara otomatis. Highly recommended buat tim produk!",
      icon: <Paintbrush className="w-6 h-6 text-slate-600" />,
      bg: "bg-white",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-bold text-sm shadow-sm mb-4">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>Wall of Love</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#1E1B4B]">Apa Kata PMs?</h2>
          <p className="text-slate-600 mt-4 text-lg">Jangan hanya percaya pada kami. Percayalah pada 1,000+ pengguna kami.</p>
        </motion.div>
      </div>

      <div className="relative overflow-hidden w-full max-w-[100vw]">
        {/* Fading Edges for the Marquee */}
        <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-[#F5F3FF] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-[#F5F3FF] to-transparent z-10 pointer-events-none" />
        
        <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] w-max py-4">
          {[...reviews, ...reviews].map((review, idx) => (
            <div key={idx} className={`w-[320px] md:w-[400px] flex-shrink-0 p-8 rounded-2xl ${review.bg} shadow-sm hover:shadow-md border border-slate-200 hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}>
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 italic mb-6 leading-relaxed">"{review.content}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 group-hover:bg-indigo-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:border-indigo-100 transition-colors">
                  {review.icon}
                </div>
                <div>
                  <h4 className="font-bold text-[#1E1B4B]">{review.name}</h4>
                  <p className="text-sm text-slate-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
