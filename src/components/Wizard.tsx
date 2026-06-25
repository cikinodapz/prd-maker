"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2, Zap, Sparkles, Target, DollarSign, Rocket, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";

interface WizardProps {
  onGenerate: (data: any) => void;
  onRoast: (data: any) => void;
  isLoading: boolean;
  initialData?: any;
}

interface SuggestionData {
  audiences: string[];
  metrics: string[];
  monetizations: string[];
}

export function Wizard({ onGenerate, onRoast, isLoading, initialData }: WizardProps) {
  const [step, setStep] = useState(1);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionData | null>(null);
  const { data: session } = useSession();
  const user = session?.user;

  const [formData, setFormData] = useState(initialData || {
    idea: "",
    audience: "",
    metrics: "",
    monetization: "",
  });

  const getSuggestions = async () => {
    if (formData.idea.trim().length < 10) return;
    
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: formData.idea }),
      });
      
      if (!res.ok) throw new Error("Failed to get suggestions");
      
      const data = await res.json();
      setSuggestions(data);
      
      // Pre-select the first options to make it even easier
      setFormData(prev => ({
        ...prev,
        audience: data.audiences[0] || "",
        metrics: data.metrics[0] || "",
        monetization: data.monetizations[0] || "",
      }));
      
      setStep(2);
    } catch (error) {
      console.error(error);
      alert("Gagal mendapatkan saran AI. Silakan coba lagi.");
    } finally {
      setIsSuggesting(false);
    }
  };

  useEffect(() => {
    if (step === 2) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [step]);

  const handleBack = () => setStep(1);

  const handleAction = async (action: 'generate' | 'roast') => {
    // // Check if user is logged in
    // if (!user) {
    //   const hasGenerated = localStorage.getItem("has_generated_guest");
    //   if (hasGenerated) {
    //     // Limit reached, redirect to login
    //     alert("Anda sudah mencoba 1x gratis sebagai Tamu. Silakan login dengan Google untuk lanjut menggunakan Prodify! 🚀");
    //     await signIn("google", {
    //       callbackUrl: `${window.location.origin}`,
    //     });
    //     return;
    //   } else {
    //     localStorage.setItem("has_generated_guest", "true");
    //   }
    // }

    document.body.style.overflow = ""; // Prevent scroll lock bug before navigation
    if (action === 'generate') {
      onGenerate(formData);
    } else {
      onRoast(formData);
    }
  };

  const isStep1Valid = formData.idea.trim().length > 10;
  const isStep2Valid = formData.audience.trim() !== "" && formData.metrics.trim() !== "" && formData.monetization.trim() !== "";

  return (
    <>
      {/* Inline Form - Always visible but inactive when step=2 */}
      <div className="card-block w-full max-w-3xl mx-auto relative z-10">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold font-heading text-foreground">
              Ceritakan Ide Anda
            </h2>
            <div className="text-sm font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> AI Assisted
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            Tuliskan ide atau masalah yang ingin Anda pecahkan. Kami akan bantu merumuskan sisanya!
          </p>
        </div>
        
        <div className="min-h-[250px] py-4">
          <div className="space-y-4">
            <div className="space-y-3">
              <label htmlFor="idea" className="block text-sm font-bold text-foreground">Apa ide atau masalah utama yang mau dipecahkan?</label>
              <textarea 
                id="idea" 
                placeholder="Contoh: Aplikasi pencatat keuangan untuk mahasiswa yang susah nabung. Bisa scan struk belanja..." 
                className="input-block w-full min-h-[160px] resize-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.idea}
                onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                disabled={isSuggesting || isLoading}
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                className="btn-primary w-full md:w-auto transition-all duration-300" 
                onClick={getSuggestions} 
                disabled={!isStep1Valid || isSuggesting || isLoading}
                style={{ opacity: (!isStep1Valid || isSuggesting) ? 0.6 : 1 }}
              >
                {isSuggesting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menganalisis Ide...</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-2" /> Dapatkan Saran AI</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theater Mode Modal for Step 2 */}
      {step === 2 && suggestions && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 md:px-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-heading text-indigo-950 mb-2">
                  Pilih Saran AI
                </h2>
                <p className="text-slate-500">
                  AI telah menganalisis ide Anda. Pilih opsi yang paling sesuai.
                </p>
              </div>
              <button 
                onClick={handleBack}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                title="Batal dan kembali edit ide"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-10 custom-scrollbar">
              
              {/* Audience Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-xl font-heading text-slate-800">Target Audience</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestions.audiences.map((opt, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setFormData({ ...formData, audience: opt })}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${
                        formData.audience === opt 
                          ? "border-indigo-600 bg-indigo-50/50 shadow-md transform -translate-y-1" 
                          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-900 transition-colors leading-relaxed">{opt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-xl font-heading text-slate-800">Goals & Metrics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestions.metrics.map((opt, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setFormData({ ...formData, metrics: opt })}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${
                        formData.metrics === opt 
                          ? "border-indigo-600 bg-indigo-50/50 shadow-md transform -translate-y-1" 
                          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-900 transition-colors leading-relaxed">{opt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monetization Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-xl font-heading text-slate-800">Monetization</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestions.monetizations.map((opt, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setFormData({ ...formData, monetization: opt })}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${
                        formData.monetization === opt 
                          ? "border-indigo-600 bg-indigo-50/50 shadow-md transform -translate-y-1" 
                          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-900 transition-colors leading-relaxed">{opt}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer (Sticky Actions) */}
            <div className="p-6 md:px-8 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex flex-col-reverse md:flex-row justify-between gap-4">
              <button className="btn-secondary w-full md:w-auto border-slate-200" onClick={handleBack} disabled={isLoading}>
                Batal
              </button>
              
              <div className="flex flex-col md:flex-row gap-3">
                <button 
                  className="w-full md:w-auto px-6 py-3 rounded-xl font-bold transition-all text-rose-600 bg-rose-100 hover:bg-rose-200 focus:ring-4 focus:ring-rose-100 flex items-center justify-center" 
                  onClick={() => handleAction('roast')}
                  disabled={!isStep2Valid || isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  Roast Ide Ini
                </button>
                <button 
                  className="btn-primary w-full md:w-auto px-8"
                  onClick={() => handleAction('generate')} 
                  disabled={!isStep2Valid || isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
                  Generate PRD
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
