"use client";

import { useState } from "react";
import { Wizard } from "@/components/Wizard";
import { PrdEditor } from "@/components/PrdEditor";
import { HistorySidebar } from "@/components/HistorySidebar";
import { useCompletion } from "@ai-sdk/react";

export default function Home() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [isRoastMode, setIsRoastMode] = useState(false);
  
  const { completion, complete, isLoading, setCompletion } = useCompletion({
    api: '/api/generate',
    streamProtocol: 'text',
  });

  const handleGenerate = async (formData: any) => {
    setIsRoastMode(false);
    setIsGenerated(true);
    setCompletion(""); // Reset previous content
    
    await complete("", {
      body: { ...formData, roastMode: false }
    });
  };

  const handleRoast = async (formData: any) => {
    setIsRoastMode(true);
    setIsGenerated(true);
    setCompletion(""); // Reset previous content
    
    await complete("", {
      body: { ...formData, roastMode: true }
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
    <main className="min-h-screen relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <HistorySidebar onSelect={handleLoadHistory} />
      
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-4 py-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              PRD Maker
            </span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Ubah ide kasar Anda menjadi Product Requirements Document yang solid dan siap dieksekusi.
          </p>
        </header>

        <div className="flex justify-center w-full">
           {!isGenerated ? (
             <Wizard 
               onGenerate={handleGenerate} 
               onRoast={handleRoast} 
               isLoading={isLoading} 
             />
           ) : (
             <PrdEditor 
               content={completion} 
               isRoast={isRoastMode} 
               onReset={handleReset} 
             />
           )}
        </div>
      </div>
    </main>
  );
}
