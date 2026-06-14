"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { History, Trash2, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";

interface PrdHistoryItem {
  id: string;
  created_at: string;
  title: string;
  content: string;
}

interface HistorySidebarProps {
  onSelect: (content: string, id: string, title: string) => void;
}

export function HistorySidebar({ onSelect }: HistorySidebarProps) {
  const [history, setHistory] = useState<PrdHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkVisibility = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsVisible(true);
      } else {
        const saved = JSON.parse(localStorage.getItem("prd_history") || "[]");
        setIsVisible(saved.length > 0);
      }
    };
    
    checkVisibility();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setIsVisible(true);
        } else {
          const saved = JSON.parse(localStorage.getItem("prd_history") || "[]");
          setIsVisible(saved.length > 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (isOpen) {
      const fetchHistory = async () => {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Fallback to local storage if not logged in
          const saved = JSON.parse(localStorage.getItem("prd_history") || "[]");
          setHistory(saved.sort((a: any, b: any) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()).map((item: any) => ({
            id: item.id,
            created_at: item.date || item.created_at,
            title: item.content.split('\\n')[0].replace(/#/g, '').trim() || "PRD Document",
            content: item.content
          })));
        } else {
          // Fetch from Supabase
          const { data, error } = await supabase
            .from('prds')
            .select('id, title, content, created_at')
            .order('created_at', { ascending: false });
          
          if (!error && data) {
            setHistory(data as any);
          }
        }
        setIsLoading(false);
      };
      fetchHistory();
    }
  }, [isOpen]);

  const initiateDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      await supabase.from('prds').delete().eq('id', itemToDelete);
      setHistory(history.filter(item => item.id !== itemToDelete));
    } else {
      const newHistory = history.filter(item => item.id !== itemToDelete);
      localStorage.setItem("prd_history", JSON.stringify(newHistory.map(item => ({
        id: item.id,
        date: item.created_at,
        content: item.content
      }))));
      setHistory(newHistory);
    }
    setIsDeleting(false);
    setItemToDelete(null);
  };

  const handleSelect = (item: PrdHistoryItem) => {
    const title = item.title || item.content.split('\\n')[0].replace(/#/g, '').trim() || "PRD Document";
    onSelect(item.content, item.id, title);
    setIsOpen(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <button 
        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors tooltip-trigger relative group"
        onClick={() => setIsOpen(true)}
        aria-label="Riwayat PRD"
      >
        <History className="w-5 h-5" />
        <span className="absolute -bottom-10 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Riwayat PRD
        </span>
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-background border-l-2 border-indigo-200">
        <SheetHeader className="mb-6 border-b-2 border-indigo-50 pb-4">
          <SheetTitle className="text-2xl font-bold font-heading text-primary">Riwayat PRD</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Kumpulan PRD yang pernah Anda simpan di {isLoading ? '...' : (history.length > 0 && history[0]?.id?.length > 20 ? 'Cloud' : 'Browser')}.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground mt-10 font-medium bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-xl p-8 animate-pulse">
              Memuat riwayat PRD...
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-16 p-8 text-center bg-gradient-to-b from-indigo-50/50 to-transparent rounded-3xl border border-indigo-100/50">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center mb-4 text-indigo-300">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold font-heading text-indigo-950 mb-1">Riwayat Kosong</h3>
              <p className="text-sm text-slate-500 max-w-[250px] leading-relaxed">Belum ada mahakarya di sini. Mulai buat PRD pertamamu sekarang!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="card-block !p-4 bg-white flex items-center justify-between cursor-pointer group hover:scale-[1.02] hover:shadow-md hover:border-indigo-200 transition-all duration-300 ease-out border border-slate-100"
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-center gap-4 overflow-hidden pr-2">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-indigo-600 shadow-sm rounded-xl group-hover:shadow transition-all flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-base font-bold font-heading text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {item.title || item.content.split('\\n')[0].replace(/#/g, '').trim() || "PRD Document"}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(item.created_at))}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="p-2 text-rose-400 bg-rose-50 hover:text-white hover:bg-rose-500 rounded-lg transition-all flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 -translate-x-2 group-hover:translate-x-0"
                    onClick={(e) => initiateDelete(item.id, e)}
                    title="Hapus PRD"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>

    {/* Modern Custom Delete Confirmation Modal */}
    {itemToDelete && typeof document !== "undefined" && createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
          
          {/* Modal Header & Icon */}
          <div className="p-6 pb-2 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 text-rose-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-heading text-slate-900">
              Hapus Dokumen?
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Tindakan ini permanen. Dokumen PRD ini tidak dapat dikembalikan lagi setelah dihapus.
            </p>
          </div>

          {/* Modal Footer */}
          <div className="p-6 flex gap-3">
            <button 
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors" 
              onClick={() => !isDeleting && setItemToDelete(null)}
              disabled={isDeleting}
            >
              Batal
            </button>
            <button 
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
