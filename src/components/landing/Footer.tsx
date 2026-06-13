import { Rocket, MessageCircle, Code, Briefcase } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center transform hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="Prodify Logo" width={40} height={40} unoptimized className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold font-heading text-indigo-950 tracking-tight">Prodify</span>
            </div>
            <p className="text-slate-500 mb-6 max-w-sm">
              Alat andalan Product Manager untuk menyusun dokumen spesifikasi produk dengan cepat, terstruktur, dan berbasis AI.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#" className="hover:text-indigo-600 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                <Code className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-indigo-600 transition-colors">
                <Briefcase className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-[#1E1B4B] mb-4">Produk</h4>
            <ul className="space-y-3 text-slate-500">
              <li><a href="#fitur" className="hover:text-indigo-600 transition-colors">Fitur</a></li>
              <li><a href="#cara-kerja" className="hover:text-indigo-600 transition-colors">Cara Kerja</a></li>
              <li><a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Harga</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1E1B4B] mb-4">Legal</h4>
            <ul className="space-y-3 text-slate-500">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Prodify. Dibuat untuk para Product Manager.
          </p>
        </div>
      </div>
    </footer>
  );
}
