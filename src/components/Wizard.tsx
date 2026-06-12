"use client";

import { useState } from "react";
import { Loader2, Zap, Sparkles, Target, DollarSign, Rocket } from "lucide-react";

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

  const handleBack = () => setStep(1);

  const isStep1Valid = formData.idea.trim().length > 10;
  const isStep2Valid = formData.audience.trim() !== "" && formData.metrics.trim() !== "" && formData.monetization.trim() !== "";

  return (
    <div className="card-block w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold font-heading text-foreground">
            {step === 1 ? "Ceritakan Ide Anda" : "Pilih Saran AI"}
          </h2>
          <div className="text-sm font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> AI Assisted
          </div>
        </div>
        <p className="text-muted-foreground mb-4">
          {step === 1 
            ? "Tuliskan ide atau masalah yang ingin Anda pecahkan. Sisanya biar AI yang urus!" 
            : "AI telah menganalisis ide Anda. Pilih opsi yang paling relevan di bawah ini."}
        </p>
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-indigo-50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="min-h-[250px] py-4">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-3">
              <label htmlFor="idea" className="block text-sm font-bold text-foreground">Apa ide atau masalah utama yang mau dipecahkan?</label>
              <textarea 
                id="idea" 
                placeholder="Contoh: Aplikasi pencatat keuangan untuk mahasiswa yang susah nabung. Bisa scan struk belanja..." 
                className="input-block w-full min-h-[160px] resize-none"
                value={formData.idea}
                onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                disabled={isSuggesting || isLoading}
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                className="btn-primary w-full md:w-auto" 
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
        )}

        {step === 2 && suggestions && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Audience Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-lg font-heading">Target Audience</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {suggestions.audiences.map((opt, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setFormData({ ...formData, audience: opt })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.audience === opt 
                        ? "border-primary bg-indigo-50 shadow-md" 
                        : "border-input bg-white hover:border-indigo-300"
                    }`}
                  >
                    <p className="text-sm">{opt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg font-heading">Goals & Metrics</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {suggestions.metrics.map((opt, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setFormData({ ...formData, metrics: opt })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.metrics === opt 
                        ? "border-primary bg-indigo-50 shadow-md" 
                        : "border-input bg-white hover:border-indigo-300"
                    }`}
                  >
                    <p className="text-sm">{opt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Monetization Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-lg font-heading">Monetization</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {suggestions.monetizations.map((opt, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setFormData({ ...formData, monetization: opt })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.monetization === opt 
                        ? "border-primary bg-indigo-50 shadow-md" 
                        : "border-input bg-white hover:border-indigo-300"
                    }`}
                  >
                    <p className="text-sm">{opt}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-between border-t border-indigo-50 pt-6 mt-6 gap-4">
              <button className="btn-secondary w-full md:w-auto" onClick={handleBack} disabled={isLoading}>
                Kembali Edit Ide
              </button>
              
              <div className="flex flex-col md:flex-row gap-3">
                <button 
                  className="btn-primary bg-rose-500 hover:bg-rose-600 text-white w-full md:w-auto" 
                  onClick={() => onRoast(formData)}
                  disabled={!isStep2Valid || isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  Roast Ide Ini
                </button>
                <button 
                  className="btn-primary w-full md:w-auto"
                  onClick={() => onGenerate(formData)} 
                  disabled={!isStep2Valid || isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
                  Generate PRD
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
