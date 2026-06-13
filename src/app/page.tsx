"use client";

import { useState, useEffect } from "react";
import { Wizard } from "@/components/Wizard";
import { PrdEditor } from "@/components/PrdEditor";
import { HistorySidebar } from "@/components/HistorySidebar";
import { useCompletion } from "@ai-sdk/react";
import { Rocket, FileText, Share2, Sparkles, Target, User, Briefcase, Code, Zap } from "lucide-react";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/landing/Footer";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { WordPullUp } from "@/components/ui/word-pull-up";

export default function Home() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [isRoastMode, setIsRoastMode] = useState(false);
  const [savedFormData, setSavedFormData] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const { completion, complete, isLoading, setCompletion } = useCompletion({
    api: '/api/generate',
    streamProtocol: 'text',
  });

  const handleGenerate = async (formData: any) => {
    setIsRoastMode(false);
    setIsGenerated(true);
    setSavedFormData(formData);
    setCompletion(""); // Reset previous content
    
    await complete("", {
      body: { ...formData, roastMode: false }
    });
  };

  const handleRoast = async (formData: any) => {
    setIsRoastMode(true);
    setIsGenerated(true);
    setSavedFormData(formData);
    setCompletion(""); // Reset previous content
    
    await complete("", {
      body: { ...formData, roastMode: true }
    });
  };

  const handleGenerateFromRoast = async () => {
    if (savedFormData) {
      await handleGenerate(savedFormData);
    }
  };

  const handleRevise = async (comments: any[]) => {
    const currentPrd = completion;
    setCompletion(""); // Reset previous content to show generating state
    await complete("", {
      body: { mode: 'revise', originalPrd: currentPrd, comments }
    });
  };

  const handleReset = () => {
    setIsGenerated(false);
    setCompletion("");
  };

  const handleLoadHistory = (content: string) => {
    setIsRoastMode(false);
    setCompletion(content);
    setIsGenerated(true);
  };

  return (
    <main className="min-h-screen relative bg-[#F5F3FF] overflow-x-hidden font-sans pb-32">
      {/* Decorative Background for Landing Page */}
      {!isGenerated && (
        <>
          <div className="fixed top-0 left-0 w-full h-[500px] bg-indigo-50 dark:bg-indigo-950/20 -skew-y-3 transform origin-top-left -z-10" />
          <div className="fixed top-40 right-10 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob" />
          <div className="fixed top-40 left-10 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-2000" />
        </>
      )}
      
      {/* Floating Navbar */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
        <nav className={`w-full max-w-5xl px-6 py-3 rounded-2xl flex items-center justify-between pointer-events-auto transition-all duration-500 ease-in-out border ${
          isScrolled 
            ? "bg-white/70 backdrop-blur-md border-white/20 shadow-md translate-y-0" 
            : "bg-white/0 backdrop-blur-none border-white/0 shadow-none translate-y-1"
        }`}>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => !isLoading && handleReset()}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transform -rotate-6 shadow-md hover:rotate-0 transition-transform">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-heading text-indigo-950 tracking-tight">PRD Maker</span>
          </div>
          <div className="flex items-center gap-6">
            {!isGenerated && (
              <div className="hidden md:flex items-center gap-8 text-indigo-950/70 font-medium text-sm">
                <a href="#fitur" className="hover:text-indigo-600 transition-colors">Fitur</a>
                <a href="#cara-kerja" className="hover:text-indigo-600 transition-colors">Cara Kerja</a>
                <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
              </div>
            )}
            <HistorySidebar onSelect={handleLoadHistory} />
          </div>
        </nav>
      </div>

      {/* Editor Full Width Mode */}
      {isGenerated ? (
        <div className="max-w-6xl mx-auto px-4 py-4 mt-24 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <PrdEditor 
            content={completion} 
            isRoast={isRoastMode} 
            onReset={handleReset} 
            onGeneratePRD={handleGenerateFromRoast}
            onRevise={handleRevise}
          />
        </div>
      ) : (
        /* Landing Page Mode */
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
          
          {/* Split Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[60vh]">
            
            {/* Left: Copywriting */}
            <div className="space-y-8 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shadow-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Product Manager</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#1E1B4B] font-heading leading-[1.1]">
                <WordPullUp text="Build SaaS" delay={100} /> <br />
                <span className="text-indigo-600 relative inline-block mt-2">
                  <WordPullUp text="With Confidence" delay={400} />
                  <svg className="absolute w-full h-3 -bottom-2 left-0 text-emerald-400 opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Ubah ide kasar Anda menjadi Product Requirements Document (PRD) yang solid, terstruktur, dan siap dieksekusi oleh tim developer. Tanpa ribet, langsung di sini.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 text-sm font-bold text-slate-500">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600"><User className="w-5 h-5" /></div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center text-emerald-600"><Briefcase className="w-5 h-5" /></div>
                  <div className="w-10 h-10 rounded-full bg-rose-100 border-2 border-white shadow-sm flex items-center justify-center text-rose-600"><Code className="w-5 h-5" /></div>
                </div>
                <div className="text-left">
                  <p className="text-[#1E1B4B]">Dipercaya oleh 1,000+ PMs</p>
                  <p className="font-normal text-xs">Bergabunglah dengan mereka hari ini!</p>
                </div>
              </div>
            </div>

            {/* Right: Interactive App Area */}
            <div className="z-10 w-full max-w-2xl mx-auto lg:ml-auto">
              <div className="relative">
                {/* Decorative floating blobs behind the Wizard */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-rose-400 rounded-3xl -z-10 transform rotate-12 opacity-40 blur-xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400 rounded-full -z-10 transform opacity-40 blur-xl" />
                
                <Wizard 
                  onGenerate={handleGenerate} 
                  onRoast={handleRoast} 
                  isLoading={isLoading} 
                  initialData={savedFormData}
                />
              </div>
            </div>
            
          </div>

          {/* Bento Grid Features Section */}
          <div id="fitur" className="mt-40 scroll-mt-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 font-bold text-sm shadow-sm mb-4">
                <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span>Fitur Unggulan</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-[#1E1B4B]">Kenapa Pakai PRD Maker?</h2>
              <p className="text-slate-600 mt-4 text-lg">Semua yang Anda butuhkan untuk merumuskan ide brilian.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Feature 1 (Wide) */}
              <SpotlightCard className="md:col-span-2 group p-8" spotlightColor="rgba(99, 102, 241, 0.12)">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
                <div className="w-16 h-16 bg-white border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-sm">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-heading text-[#1E1B4B] relative z-10">AI-Assisted Workflow</h3>
                <p className="text-slate-600 relative z-10 text-lg leading-relaxed max-w-lg">
                  Tidak perlu memeras otak mengetik manual. Ketik ide kasarnya saja, biar AI merumuskan target audience, matriks, hingga model bisnis secara ajaib.
                </p>
              </SpotlightCard>

              {/* Feature 2 (Square) */}
              <SpotlightCard className="group p-8" spotlightColor="rgba(99, 102, 241, 0.12)">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
                <div className="w-16 h-16 bg-white border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-sm">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-heading text-[#1E1B4B] relative z-10">Validasi Ide Brutal</h3>
                <p className="text-slate-600 relative z-10">
                  Uji ide Anda dengan mode "Roast". Dapatkan feedback ala investor galak Silicon Valley.
                </p>
              </SpotlightCard>

              {/* Feature 3 (Square) */}
              <SpotlightCard className="group p-8" spotlightColor="rgba(99, 102, 241, 0.12)">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
                <div className="w-16 h-16 bg-white border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-sm">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-heading text-[#1E1B4B] relative z-10">Revisi Inline</h3>
                <p className="text-slate-600 relative z-10">
                  Komentari tiap baris dokumen layaknya Google Docs, dan minta AI menyesuaikannya.
                </p>
              </SpotlightCard>

              {/* Feature 4 (Wide) */}
              <SpotlightCard className="md:col-span-2 group p-8" spotlightColor="rgba(99, 102, 241, 0.12)">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
                <div className="w-16 h-16 bg-white border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-sm">
                  <Share2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-heading text-[#1E1B4B] relative z-10">Export & Bagikan</h3>
                <p className="text-slate-600 relative z-10 text-lg leading-relaxed max-w-lg">
                  Setelah PRD selesai direvisi, export langsung menjadi format Markdown (.md) atau PDF mulus siap diberikan ke tim developer Anda.
                </p>
              </SpotlightCard>
            </div>
          </div>
          
          <HowItWorks />
          <Testimonials />
          <FAQ />
          <CtaSection />
          
        </div>
      )}
      
      {!isGenerated && <Footer />}
    </main>
  );
}
