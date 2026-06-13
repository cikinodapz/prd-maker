import { Rocket } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { motion } from "framer-motion";

export function CtaSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-12 md:py-16 bg-indigo-600 relative z-10 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center px-6 max-w-5xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading text-white mb-4 leading-tight">
          Siap Membuat PRD Pertamamu?
        </h2>
        <p className="text-indigo-100 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Ubah ide brilian Anda menjadi dokumen PRD yang solid dalam hitungan detik dengan bantuan AI.
        </p>
        
        <div className="w-full max-w-sm mx-auto flex justify-center">
          <ShimmerButton onClick={scrollToTop}>
            <span className="flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base font-semibold">
              Mulai Buat Sekarang
              <Rocket className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </ShimmerButton>
        </div>
        <p className="mt-6 text-indigo-200/80 text-xs md:text-sm font-medium tracking-wide uppercase">
          Tidak perlu kartu kredit. Langsung pakai.
        </p>
      </motion.div>
    </section>
  );
}
