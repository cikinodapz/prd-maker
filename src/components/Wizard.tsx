"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap, Target, DollarSign, Rocket } from "lucide-react";

interface WizardProps {
  onGenerate: (data: any) => void;
  onRoast: (data: any) => void;
  isLoading: boolean;
}

export function Wizard({ onGenerate, onRoast, isLoading }: WizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    idea: "",
    audience: "",
    metrics: "",
    monetization: "",
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.idea.trim().length > 10;
      case 2: return formData.audience.trim().length > 5;
      case 3: return formData.metrics.trim().length > 5;
      case 4: return formData.monetization.trim().length > 5;
      default: return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-border/50 bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            Build Your SaaS
          </CardTitle>
          <div className="text-sm font-medium text-muted-foreground">Step {step} of 4</div>
        </div>
        <CardDescription>
          Isi detail project Anda untuk menghasilkan PRD kelas profesional.
        </CardDescription>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-secondary rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="min-h-[250px]">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
              <h3 className="text-lg font-semibold">Ide & Masalah</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idea">Apa masalah utama yang mau dipecahkan & ide solusinya?</Label>
              <Textarea 
                id="idea" 
                placeholder="Contoh: Aplikasi pencatat keuangan untuk mahasiswa yang susah nabung. Bisa scan struk belanja..." 
                className="min-h-[120px] resize-none"
                value={formData.idea}
                onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><Target className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
              <h3 className="text-lg font-semibold">Target Audience</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Siapa spesifik target penggunanya?</Label>
              <Textarea 
                id="audience" 
                placeholder="Contoh: Mahasiswa umur 18-24 tahun, tinggal di kota besar, yang sering kehabisan uang di akhir bulan..." 
                className="min-h-[120px] resize-none"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><Rocket className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
              <h3 className="text-lg font-semibold">Goals & Metrics</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metrics">Apa indikator kesuksesan aplikasi ini?</Label>
              <Textarea 
                id="metrics" 
                placeholder="Contoh: 1000 active users di bulan pertama, 50 paid users, retention rate 40%..." 
                className="min-h-[120px] resize-none"
                value={formData.metrics}
                onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
              <h3 className="text-lg font-semibold">Monetization (Freemium)</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monetization">Bagaimana model freemium-nya bekerja?</Label>
              <Textarea 
                id="monetization" 
                placeholder="Contoh: Free tier bisa catat manual max 50 per bulan. Pro ($5/mo) bisa scan struk tanpa batas dan export ke Excel..." 
                className="min-h-[120px] resize-none"
                value={formData.monetization}
                onChange={(e) => setFormData({ ...formData, monetization: e.target.value })}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-border/50 pt-4">
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              Kembali
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {step === 1 && formData.idea.length > 10 && (
            <Button 
              variant="destructive" 
              onClick={() => onRoast(formData)}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Roast My Idea
            </Button>
          )}
          
          {step < 4 ? (
            <Button onClick={handleNext} disabled={!isStepValid() || isLoading}>
              Lanjut
            </Button>
          ) : (
            <Button 
              onClick={() => onGenerate(formData)} 
              disabled={!isStepValid() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Generate PRD
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
