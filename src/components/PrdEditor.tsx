"use client";

import { useState, createContext, useContext } from "react";
import ReactMarkdown from "react-markdown";
import { Download, RefreshCw, AlertCircle, FileDown, Zap, MessageSquarePlus, Check, X, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrdEditorProps {
  content: string;
  isRoast?: boolean;
  onReset: () => void;
  onGeneratePRD?: () => void;
  onRevise?: (comments: any[]) => void;
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

export function PrdEditor({ content, isRoast = false, onReset, onGeneratePRD, onRevise }: PrdEditorProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeCommentNode, setActiveCommentNode] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

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

  const handleExportPdf = async () => {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const M = { top: 25, bottom: 20, left: 22, right: 22 };
    const W = pageWidth - M.left - M.right; // usable content width
    const LH = 5; // standard line height for body text
    let y = M.top;
    let pageNum = 1;

    type RGB = [number, number, number];
    const C = {
      text:     [30, 41, 59]    as RGB,
      h1:       [15, 23, 42]    as RGB,
      h2:       [30, 41, 59]    as RGB,
      h3:       [51, 65, 85]    as RGB,
      muted:    [100, 116, 139] as RGB,
      accent:   [99, 102, 241]  as RGB,
      rule:     [226, 232, 240] as RGB,
      codeBg:   [241, 245, 249] as RGB,
      quoteBg:  [248, 250, 252] as RGB,
    };

    const strip = (s: string) =>
      s.replace(/\*\*(.*?)\*\*/g, "$1")
       .replace(/\*(.*?)\*/g, "$1")
       .replace(/`([^`]+)`/g, "$1");

    const footer = () => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.muted);
      doc.setDrawColor(...C.rule);
      doc.setLineWidth(0.3);
      doc.line(M.left, pageHeight - 15, pageWidth - M.right, pageHeight - 15);
      doc.text("Generated by PRD Maker", M.left, pageHeight - 10);
      doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      doc.text(
        new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }),
        pageWidth - M.right, pageHeight - 10, { align: "right" }
      );
    };

    const newPageIf = (need: number) => {
      if (y + need > pageHeight - M.bottom - 6) {
        footer();
        doc.addPage();
        pageNum++;
        y = M.top;
      }
    };

    const printText = (
      text: string, x: number, maxW: number,
      size: number, style: string, lh: number
    ): number => {
      doc.setFontSize(size);
      doc.setFont("helvetica", style);
      const clean = strip(text);
      const wrapped: string[] = doc.splitTextToSize(clean, maxW);
      let advanced = 0;
      for (const wl of wrapped) {
        newPageIf(lh);
        doc.text(wl, x, y);
        y += lh;
        advanced += lh;
      }
      return advanced;
    };

    const indentOf = (raw: string): number => {
      const m = raw.match(/^(\s*)/);
      return m ? Math.floor(m[1].length / 2) : 0;
    };

    const lines = content.split("\n");
    let inCode = false;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const t = raw.trim();

      if (t.startsWith("```")) {
        inCode = !inCode;
        y += 2;
        continue;
      }

      if (inCode) {
        newPageIf(5.5);
        doc.setFillColor(...C.codeBg);
        doc.rect(M.left, y - 3.5, W, 5.5, "F");
        doc.setFontSize(8);
        doc.setFont("courier", "normal");
        doc.setTextColor(...C.text);
        const codeLine = raw.length > 100 ? raw.substring(0, 97) + "..." : raw;
        doc.text(codeLine || " ", M.left + 3, y);
        y += 5.5;
        continue;
      }

      if (t === "") { y += 3; continue; }

      if (/^[-*_]{3,}$/.test(t)) {
        newPageIf(10);
        y += 4;
        doc.setDrawColor(...C.rule);
        doc.setLineWidth(0.4);
        doc.line(M.left, y, pageWidth - M.right, y);
        y += 6;
        continue;
      }

      if (/^# [^#]/.test(t)) {
        newPageIf(20);
        y += 10;
        doc.setTextColor(...C.h1);
        printText(t.replace(/^#\s*/, ""), M.left, W, 20, "bold", 8);
        doc.setDrawColor(...C.accent);
        doc.setLineWidth(0.8);
        doc.line(M.left, y + 1, M.left + 40, y + 1);
        y += 5;
        doc.setTextColor(...C.text);
        continue;
      }

      if (/^## [^#]/.test(t)) {
        newPageIf(16);
        y += 8;
        doc.setTextColor(...C.h2);
        printText(t.replace(/^##\s*/, ""), M.left, W, 15, "bold", 6.5);
        doc.setDrawColor(...C.rule);
        doc.setLineWidth(0.3);
        doc.line(M.left, y + 1, pageWidth - M.right, y + 1);
        y += 4;
        doc.setTextColor(...C.text);
        continue;
      }

      if (/^### [^#]/.test(t)) {
        newPageIf(14);
        y += 6;
        doc.setTextColor(...C.h3);
        printText(t.replace(/^###\s*/, ""), M.left, W, 13, "bold", 5.5);
        y += 3;
        doc.setTextColor(...C.text);
        continue;
      }

      if (/^#### /.test(t)) {
        newPageIf(12);
        y += 5;
        doc.setTextColor(...C.h3);
        printText(t.replace(/^####\s*/, ""), M.left + 2, W - 2, 11, "bold", 5);
        y += 2;
        doc.setTextColor(...C.text);
        continue;
      }

      if (t.startsWith("> ")) {
        const qt = strip(t.replace(/^>\s*/, ""));
        doc.setFontSize(10);
        const wrapped: string[] = doc.splitTextToSize(qt, W - 14);
        const bh = wrapped.length * LH + 6;
        newPageIf(bh);
        doc.setFillColor(...C.quoteBg);
        doc.roundedRect(M.left, y - 1, W, bh, 1.5, 1.5, "F");
        doc.setFillColor(...C.accent);
        doc.rect(M.left, y - 1, 1.2, bh, "F");
        doc.setTextColor(...C.h3);
        doc.setFont("helvetica", "italic");
        y += 2;
        for (const wl of wrapped) {
          doc.text(wl, M.left + 6, y);
          y += LH;
        }
        y += 3;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.text);
        continue;
      }

      if (/^\s*[-*]\s/.test(raw)) {
        const lvl = indentOf(raw);
        const off = lvl * 5;
        const bx = M.left + 2 + off;
        const tx = bx + 4;
        const aw = W - off - 6;
        const bullet = ["•", "◦", "–"][Math.min(lvl, 2)];

        const bodyText = strip(t.replace(/^[-*]\s*/, ""));
        doc.setFontSize(10);
        const wrapped: string[] = doc.splitTextToSize(bodyText, aw);
        const needed = wrapped.length * LH;
        newPageIf(needed);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.text);
        doc.text(bullet, bx, y);
        for (const wl of wrapped) {
          doc.text(wl, tx, y);
          y += LH;
        }
        continue;
      }

      if (/^\s*\d+\.\s/.test(raw)) {
        const lvl = indentOf(raw);
        const off = lvl * 5;
        const nx = M.left + 2 + off;
        const tx = nx + 7;
        const aw = W - off - 9;

        const m = t.match(/^(\d+\.)\s*(.*)/);
        if (m) {
          const bodyText = strip(m[2]);
          doc.setFontSize(10);
          const wrapped: string[] = doc.splitTextToSize(bodyText, aw);
          const needed = wrapped.length * LH;
          newPageIf(needed);

          doc.setTextColor(...C.text);
          doc.setFont("helvetica", "bold");
          doc.text(m[1], nx, y);
          doc.setFont("helvetica", "normal");
          for (const wl of wrapped) {
            doc.text(wl, tx, y);
            y += LH;
          }
        }
        continue;
      }

      doc.setTextColor(...C.text);
      const bodyText = strip(t);
      doc.setFontSize(10);
      const wrapped: string[] = doc.splitTextToSize(bodyText, W);
      const needed = wrapped.length * LH;
      newPageIf(needed);
      doc.setFont("helvetica", "normal");
      for (const wl of wrapped) {
        doc.text(wl, M.left, y);
        y += LH;
      }
    }

    footer();
    doc.save(isRoast ? "roast-result.pdf" : "saas-prd.pdf");
  };

  const handleSaveToHistory = () => {
    if (isRoast) return;
    const history = JSON.parse(localStorage.getItem("prd_history") || "[]");
    history.push({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: content,
    });
    localStorage.setItem("prd_history", JSON.stringify(history));
    alert("Berhasil disimpan di Local Storage browser!");
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
            {!isRoast && content && (
              <button className="btn-secondary py-2" onClick={handleSaveToHistory} title="Simpan di Browser">
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
                <ReactMarkdown components={markdownComponents}>
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
    </PrdEditorContext.Provider>
  );
}
