import { Sparkles, BrainCircuit, Download } from "lucide-react";
import { motion } from "framer-motion";

export function HowItWorks() {
  const steps = [
    {
      title: "1. Tulis Ide Kasar",
      description: "Tidak perlu pusing dengan struktur. Ketik saja ide fitur atau produk yang ada di kepala Anda dengan bahasa sehari-hari.",
      icon: <Sparkles className="w-8 h-8 text-indigo-600" />,
      color: "bg-indigo-50",
    },
    {
      title: "2. AI Merumuskan",
      description: "AI kami akan langsung menganalisa, mencari target pengguna, hingga menyusun metrik sukses (KPI) dan model bisnis yang pas.",
      icon: <BrainCircuit className="w-8 h-8 text-indigo-600" />,
      color: "bg-indigo-50",
    },
    {
      title: "3. Export & Bagikan",
      description: "Review hasilnya, revisi bagian yang kurang cocok, lalu export ke PDF atau Markdown. Siap diserahkan ke tim developer!",
      icon: <Download className="w-8 h-8 text-indigo-600" />,
      color: "bg-indigo-50",
    },
  ];

  return (
    <section id="cara-kerja" className="py-16 md:py-20 max-w-7xl mx-auto px-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#1E1B4B]">Cara Kerjanya</h2>
        <p className="text-slate-600 mt-4 text-lg">Dari ide acak jadi dokumen siap tempur hanya dalam 3 langkah.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Decorative connecting line for desktop */}
        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1 bg-indigo-100 -z-10 rounded-full" />
        
        {steps.map((step, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.15, ease: "easeOut" }}
            className="flex flex-col items-center text-center relative z-10 group"
          >
            <div className={`w-24 h-24 ${step.color} rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border-4 border-white`}>
              {step.icon}
            </div>
            <h3 className="text-2xl font-bold mb-3 font-heading text-[#1E1B4B]">{step.title}</h3>
            <p className="text-slate-600 leading-relaxed max-w-xs">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
