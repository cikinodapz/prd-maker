"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, RefreshCw, AlertCircle, FileDown, Zap, MessageSquarePlus, Check, X, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { savePrd } from "@/app/actions/prd-actions";

interface PrdEditorProps {
  content: string;
  isRoast?: boolean;
  prdId?: string | null;
  prdTitle?: string | null;
  onReset: () => void;
  onGeneratePRD?: () => void;
  onRevise?: (comments: any[]) => void;
  onSaveComplete?: (id: string, title: string) => void;
}

interface Comment {
  id: string;
  textToRevise: string;
  feedback: string;
}

// Create a context to pass state to stable markdown components
const PrdEditorContext = createContext<any>(null);

const extractText = (node: any): string => {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (node.children) return node.children.map(extractText).join('');
  return '';
};

const CommentableBlock = ({ children, node, as: Tag = "p", className = "" }: any) => {
  const {
    comments, setComments,
    activeCommentNode, setActiveCommentNode,
    commentInput, setCommentInput,
    isRoast
  } = useContext(PrdEditorContext);

  const rawText = extractText(node);
  const existingComment = comments.find((c: any) => c.textToRevise === rawText);
  const isCommenting = activeCommentNode === rawText;
  const canComment = rawText.trim().length > 0 && !isRoast;

  return (
    <div className={`group relative rounded-md transition-colors ${existingComment ? 'bg-yellow-50 outline outline-2 outline-yellow-200' : (canComment ? 'hover:bg-indigo-50/50' : '')}`}>
      <Tag className={className}>{children}</Tag>

      {canComment && !isCommenting && !existingComment && (
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={() => { setActiveCommentNode(rawText); setCommentInput(""); }}
            className="bg-white text-indigo-600 border border-indigo-200 shadow-sm rounded-full p-1.5 hover:bg-indigo-50 transform translate-x-2 -translate-y-2"
            title="Beri instruksi revisi"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>
      )}

      {existingComment && !isCommenting && (
        <div className="absolute -top-3 -right-2 bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs px-2 py-1 rounded-md shadow-sm flex items-center gap-2 z-10">
          <span className="font-medium truncate max-w-[150px]">{existingComment.feedback}</span>
          <button
            onClick={() => setComments((c: any[]) => c.filter(x => x.textToRevise !== rawText))}
            className="text-yellow-600 hover:text-yellow-900"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {isCommenting && (
        <div className="absolute top-full left-0 w-full mt-1 z-20 bg-white border-2 border-indigo-400 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
          <textarea
            autoFocus
            className="w-full text-sm p-3 focus:outline-none resize-none bg-transparent"
            placeholder="Ketik instruksi revisi untuk bagian ini..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end gap-2 px-3 pb-3 bg-white">
            <button
              onClick={() => setActiveCommentNode(null)}
              className="text-xs px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-md font-medium transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => {
                if (commentInput.trim()) {
                  setComments([...comments, { id: Date.now().toString(), textToRevise: rawText, feedback: commentInput.trim() }]);
                }
                setActiveCommentNode(null);
              }}
              className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-md flex items-center gap-1 hover:bg-indigo-700 font-medium transition-colors"
            >
              <Check className="w-3 h-3" /> Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Define components outside to ensure stability
const markdownComponents = {
  p: (props: any) => <CommentableBlock {...props} as="p" />,
  h1: (props: any) => <CommentableBlock {...props} as="h1" className="mt-8 mb-4 font-heading font-bold text-4xl" />,
  h2: (props: any) => <CommentableBlock {...props} as="h2" className="mt-8 mb-4 font-heading font-bold text-2xl" />,
  h3: (props: any) => <CommentableBlock {...props} as="h3" className="mt-6 mb-3 font-heading font-bold text-xl" />,
  li: (props: any) => <CommentableBlock {...props} as="li" />,
};

export function PrdEditor({ content, isRoast = false, prdId, prdTitle, onReset, onGeneratePRD, onRevise, onSaveComplete }: PrdEditorProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCommentNode, setActiveCommentNode] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const { data: session } = useSession();
  const user = session?.user;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const contextValue = {
    comments, setComments,
    activeCommentNode, setActiveCommentNode,
    commentInput, setCommentInput,
    isRoast
  };

  const handleExportMd = () => {
    const blob = new Blob([content], { type: "text/markdown" });
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
    const prdContent = document.getElementById("prd-content-export");
    if (!prdContent) return;

    let iframe = document.getElementById("print-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "print-iframe";
      iframe.style.visibility = "hidden";
      iframe.style.position = "absolute";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      document.body.appendChild(iframe);
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((s) => s.outerHTML)
      .join("\n");

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${isRoast ? "Roast Result" : "Generated PRD"}</title>
          ${styles}
          <style>
            @media print {
              body { background: white !important; padding: 0; margin: 0; }
              @page { margin: 20mm; }
            }
            body { background: white; padding: 2rem; color: #0f172a; }
          </style>
        </head>
        <body>
          <div class="prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-h1:text-4xl prose-a:text-primary">
            ${prdContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Wait for styles to apply before printing
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 500);
  };

  const handleInitiateSave = () => {
    if (isRoast || !user) return;

    // Use existing title if available, otherwise extract from content
    let defaultTitle = prdTitle || "Untitled PRD";
    if (!prdTitle) {
      const headingMatch = content.match(/^#+\s+(.*)/m);
      if (headingMatch) {
        defaultTitle = headingMatch[1].trim();
      } else {
        const firstLine = content.split('\\n').find(line => line.trim().length > 0);
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
        content: content,
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

  return (
    <PrdEditorContext.Provider value={contextValue}>
      <div className="card-block w-full max-w-4xl mx-auto flex flex-col relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-indigo-50 pb-6 gap-4">
          <div>
            <h2 className={`text-3xl font-bold font-heading ${isRoast ? "text-rose-600" : "text-primary"}`}>
              {isRoast ? "Roast Result" : "Generated PRD"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isRoast
                ? "Feedback brutal untuk ide SaaS Anda."
                : "Product Requirements Document siap pakai."}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            {!isRoast && content && user && (
              <button
                className="btn-secondary py-2"
                onClick={handleInitiateSave}
              >
                Simpan
              </button>
            )}
            <button className="btn-secondary py-2" onClick={handleExportMd}>
              <Download className="w-4 h-4 mr-2" />
              Export .md
            </button>
            <button className="btn-secondary py-2" onClick={handleExportPdf}>
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </button>
            {isRoast && onGeneratePRD && (
              <button onClick={onGeneratePRD} className="btn-primary py-2" style={{ backgroundColor: "var(--cta)" }}>
                <Zap className="w-4 h-4 mr-2" />
                Lanjut Generate PRD
              </button>
            )}
            <button onClick={onReset} className="btn-primary py-2" style={{ backgroundColor: isRoast ? "var(--destructive)" : "var(--cta)" }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {isRoast ? "Revisi Ide" : "Buat Baru"}
            </button>
          </div>
        </div>

        <div className="pt-6 flex-1 relative">
          {isRoast && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg">
              <div className="flex items-center gap-2 text-rose-700 font-bold mb-1">
                <AlertCircle className="h-5 w-5" />
                <h4>Warning!</h4>
              </div>
              <p className="text-rose-600 text-sm">
                Ini adalah mode Roast. Feedback di bawah mungkin terasa pedas, tapi ini untuk memastikan ide Anda benar-benar valid sebelum membuang waktu dan biaya.
              </p>
            </div>
          )}

          <ScrollArea className="h-[600px] w-full pr-4 pb-16">
            <div id="prd-content-export" className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-h1:text-4xl prose-a:text-primary">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {content}
                </ReactMarkdown>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[300px] text-indigo-300 font-bold text-xl animate-pulse">
                  Generating content...
                </div>
              )}
            </div>
          </ScrollArea>

          {comments.length > 0 && (
            <div className="absolute bottom-4 left-0 w-full flex justify-center z-50 animate-in slide-in-from-bottom-4">
              <div className="bg-white border-2 border-indigo-200 shadow-xl rounded-full px-4 py-3 flex items-center gap-4">
                <span className="font-bold text-sm text-indigo-800">
                  {comments.length} Komentar Revisi
                </span>
                <button
                  onClick={() => {
                    onRevise?.(comments);
                    setComments([]);
                  }}
                  className="btn-primary py-2 px-5 shadow-md flex items-center gap-2"
                  style={{ backgroundColor: "var(--cta)" }}
                >
                  <Sparkles className="w-4 h-4" />
                  Sesuaikan PRD dengan AI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Custom Save Modal */}
      {showSaveModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

            {/* Modal Header */}
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

            {/* Modal Body */}
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

            {/* Modal Footer */}
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
    </PrdEditorContext.Provider>
  );
}
