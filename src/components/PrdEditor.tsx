"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, RefreshCw, AlertCircle, FileDown, Zap, Check, X, PanelRightClose, PanelRightOpen, ArrowUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { savePrd } from "@/app/actions/prd-actions";
import { TiptapEditor } from "./TiptapEditor";
import { AiChatSidebar } from "./AiChatSidebar";

interface PrdEditorProps {
  content: string;
  isRoast?: boolean;
  prdId?: string | null;
  prdTitle?: string | null;
  onReset: () => void;
  onGeneratePRD?: () => void;
  onSaveComplete?: (id: string, title: string) => void;
  // We can add onContentChange to notify parent, but for now we manage local state and only save to DB
}

export function PrdEditor({ content, isRoast = false, prdId, prdTitle, onReset, onGeneratePRD, onSaveComplete }: PrdEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [isChatOpen, setIsChatOpen] = useState(!isRoast); // Open by default if not roasting
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const { data: session } = useSession();
  const user = session?.user;
  
  const [editorInstance, setEditorInstance] = useState<any>(null);

  useEffect(() => {
    // If external content changes drastically (like a new generation), update local
    // But don't overwrite if it's just minor streaming differences unless it's a completely new PRD.
    // For simplicity, we sync it when component mounts or `prdId` changes
    setLocalContent(content);
  }, [content, prdId]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportMd = () => {
    const blob = new Blob([localContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isRoast ? "roast-result.md" : "saas-prd.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    // Basic PDF export (Note: Tiptap doesn't render HTML directly to DOM easily for print without a wrapper, 
    // so we might need a hidden markdown render or rely on window.print)
    window.print();
    // For production, you'd want to use a proper PDF library or render the HTML content to an iframe.
  };

  const handleInitiateSave = () => {
    if (isRoast || !user) return;

    let defaultTitle = prdTitle || "Untitled PRD";
    if (!prdTitle) {
      const headingMatch = localContent.match(/^#+\s+(.*)/m);
      if (headingMatch) {
        defaultTitle = headingMatch[1].trim();
      } else {
        const firstLine = localContent.split('\n').find(line => line.trim().length > 0);
        if (firstLine) {
          defaultTitle = firstLine.substring(0, 60);
        }
      }
    }

    setSaveTitle(defaultTitle);
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    if (!saveTitle.trim()) {
      showToast("Judul tidak boleh kosong.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const titleToSave = saveTitle.trim();
      const projectName = titleToSave.replace(/PRD\s*-?\s*/i, "").trim();

      const { data, error } = await savePrd({
        id: prdId || undefined,
        title: titleToSave,
        projectName: projectName || "Untitled Project",
        content: localContent,
      });

      if (error) throw new Error(error);
      if (onSaveComplete && data) onSaveComplete(data.id, data.title);

      setShowSaveModal(false);
      showToast("Berhasil disimpan!", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan dokumen. Silakan coba lagi.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplySnippet = (snippet: string) => {
    if (editorInstance) {
      const { from, to } = editorInstance.state.selection;
      
      // If the cursor is at the very beginning (default uninitialized state)
      // we forcefully append it to the bottom. Otherwise, we insert at cursor.
      if (from === 1 || from === 0) {
        editorInstance.chain().focus('end').insertContent("\n\n" + snippet).run();
        showToast("Teks ditambahkan di bagian bawah editor!", "success");
      } else {
        editorInstance.chain().focus().insertContent(snippet).run();
        showToast("Teks ditambahkan ke editor!", "success");
      }
    }
  };

  const handleReplaceEntireDocument = (newContent: string) => {
    setLocalContent(newContent);
    showToast("Seluruh dokumen berhasil diperbarui!", "success");
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 relative items-start">
      {/* Main Canvas */}
      <div className={`flex-col flex transition-all duration-300 ${isChatOpen ? 'md:w-2/3' : 'w-full'}`}>
        <div className="card-block flex flex-col min-h-[800px] h-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-indigo-50 pb-4 gap-4 mb-4">
            <div>
              <h2 className={`text-2xl font-bold font-heading ${isRoast ? "text-rose-600" : "text-primary"}`}>
                {isRoast ? "Roast Result" : "Generated PRD"}
              </h2>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {!isRoast && !isChatOpen && (
                <button 
                  onClick={() => setIsChatOpen(true)} 
                  className="btn-secondary py-1.5 px-3 flex items-center gap-2"
                >
                  <PanelRightOpen className="w-4 h-4" />
                  <span className="hidden md:inline">AI Assistant</span>
                  <span className="inline md:hidden">Chat AI</span>
                </button>
              )}
              
              {!isRoast && localContent && user && (
                <button className="btn-secondary py-1.5 px-3" onClick={handleInitiateSave}>
                  Simpan
                </button>
              )}
              <button className="btn-secondary py-1.5 px-3" onClick={handleExportMd} title="Export Markdown">
                <Download className="w-4 h-4" />
              </button>
              {isRoast && onGeneratePRD && (
                <button onClick={onGeneratePRD} className="btn-primary py-1.5 px-3" style={{ backgroundColor: "var(--cta)" }}>
                  <Zap className="w-4 h-4 mr-1" />
                  Lanjut PRD
                </button>
              )}
              <button onClick={onReset} className="btn-primary py-1.5 px-3" style={{ backgroundColor: isRoast ? "var(--destructive)" : "var(--cta)" }}>
                <RefreshCw className="w-4 h-4 mr-1" />
                {isRoast ? "Revisi Ide" : "Baru"}
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col relative print:overflow-visible">
            {isRoast && (
              <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg">
                <div className="flex items-center gap-2 text-rose-700 font-bold mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <h4>Warning!</h4>
                </div>
                <p className="text-rose-600 text-xs">
                  Ini adalah mode Roast. Feedback mungkin terasa pedas, tapi ini untuk memastikan ide valid.
                </p>
              </div>
            )}

            {!localContent ? (
               <div className="flex items-center justify-center h-full min-h-[300px] text-indigo-300 font-bold text-xl animate-pulse">
                 Generating content...
               </div>
            ) : (
              <TiptapEditor 
                initialContent={localContent} 
                onChange={setLocalContent} 
                onEditorReady={setEditorInstance}
                className="h-full border-0 shadow-none rounded-none print:border-none" 
              />
            )}
          </div>
        </div>
      </div>

      {/* AI Sidebar */}
      {!isRoast && (
        <>
          {/* Mobile Backdrop */}
          <div 
            className={`md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isChatOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsChatOpen(false)}
          />

          <div className={`
            z-50 transition-all duration-500 ease-out
            fixed inset-x-0 bottom-0 md:sticky md:top-24
            ${isChatOpen 
              ? 'md:w-1/3 translate-y-0 md:translate-x-0 opacity-100' 
              : 'md:w-0 translate-y-full md:translate-y-0 md:translate-x-8 opacity-0 pointer-events-none md:overflow-hidden'
            }
          `}>
            <div className="card-block bg-white w-full p-0 overflow-hidden relative flex flex-col shadow-2xl md:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/60 h-[85vh] md:h-[calc(100vh-120px)] md:min-h-[400px] rounded-t-3xl rounded-b-none md:rounded-2xl">
              <AiChatSidebar 
                documentContext={localContent} 
                onApplySnippet={handleApplySnippet} 
                onReplaceEntireDocument={handleReplaceEntireDocument}
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          </div>
        </>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 z-50 p-3 bg-white text-indigo-600 rounded-full shadow-xl border border-indigo-100 hover:bg-indigo-50 hover:scale-110 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${isChatOpen ? 'right-8 md:right-[calc(33.333%+2rem)]' : 'right-8'}`}
          title="Ke Atas"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Modern Custom Save Modal */}
      {showSaveModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold font-heading text-indigo-950">
                Simpan PRD
              </h2>
              <button
                onClick={() => !isSaving && setShowSaveModal(false)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                disabled={isSaving}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <label htmlFor="prd-title" className="block text-sm font-bold text-slate-700 mb-2">
                Nama Dokumen
              </label>
              <input
                id="prd-title"
                type="text"
                autoFocus
                className="input-block w-full focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-800"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Masukkan judul PRD..."
                disabled={isSaving}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSaving) {
                     confirmSave();
                  }
                }}
              />
              <p className="text-xs text-slate-500 mt-2">
                Tersimpan aman di cloud pribadi Anda.
              </p>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-end gap-3">
              <button
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                onClick={() => setShowSaveModal(false)}
                disabled={isSaving}
              >
                Batal
              </button>
              <button
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center min-w-[120px]"
                onClick={confirmSave}
                disabled={isSaving || !saveTitle.trim()}
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Global Toast Notification */}
      {toast && typeof document !== "undefined" && createPortal(
        <div className="fixed bottom-6 right-6 z-[200] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
            {toast.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
