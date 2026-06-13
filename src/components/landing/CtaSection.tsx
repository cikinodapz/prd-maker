import { Rocket } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function CtaSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto relative z-10">
      <div className="bg-indigo-600 rounded-3xl md:rounded-[2.5rem] px-6 py-12 md:p-16 text-center relative overflow-hidden shadow-2xl mx-auto w-full">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white mb-4 md:mb-6 leading-tight">
            Siap Membuat PRD Pertamamu?
          </h2>
          <p className="text-indigo-100 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-2">
            Berhenti membuang waktu berjam-jam menatap layar kosong. Biarkan AI membantu Anda merumuskan ide brilian menjadi dokumen yang solid.
          </p>
          
          <div className="w-full max-w-sm mx-auto flex justify-center">
            <ShimmerButton onClick={scrollToTop}>
              <span className="flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base font-semibold">
                Mulai Buat Sekarang
                <Rocket className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            </ShimmerButton>
          </div>
          <p className="mt-5 md:mt-6 text-indigo-200/80 text-xs md:text-sm font-medium tracking-wide uppercase">Tidak perlu kartu kredit. Langsung pakai.</p>
        </div>
      </div>
    </section>
  );
}
