"use client";

import { useEffect, useState } from "react";
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
  onSelect: (content: string) => void;
}

export function HistorySidebar({ onSelect }: HistorySidebarProps) {
  const [history, setHistory] = useState<PrdHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      await supabase.from('prds').delete().eq('id', id);
      setHistory(history.filter(item => item.id !== id));
    } else {
      const newHistory = history.filter(item => item.id !== id);
      localStorage.setItem("prd_history", JSON.stringify(newHistory.map(item => ({
        id: item.id,
        date: item.created_at,
        content: item.content
      }))));
      setHistory(newHistory);
    }
  };

  const handleSelect = (content: string) => {
    onSelect(content);
    setIsOpen(false);
  };

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
            <div className="text-center text-muted-foreground mt-10 font-medium bg-white border-2 border-dashed border-indigo-200 rounded-xl p-8">
              Belum ada PRD yang disimpan.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="card-block !p-4 bg-white flex items-center justify-between cursor-pointer group"
                  onClick={() => handleSelect(item.content)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-3 bg-indigo-50 group-hover:bg-indigo-100 transition-colors rounded-xl">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="truncate">
                      <p className="text-base font-bold font-heading text-foreground truncate">
                        {item.title || item.content.split('\n')[0].replace(/#/g, '').trim() || "PRD Document"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="p-2 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-colors flex-shrink-0"
                    onClick={(e) => handleDelete(item.id, e)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
    </>
  );
}
