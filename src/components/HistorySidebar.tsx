"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History, Trash2, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrdHistoryItem {
  id: string;
  date: string;
  content: string;
}

interface HistorySidebarProps {
  onSelect: (content: string) => void;
}

export function HistorySidebar({ onSelect }: HistorySidebarProps) {
  const [history, setHistory] = useState<PrdHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = JSON.parse(localStorage.getItem("prd_history") || "[]");
      // Sort by newest first
      setHistory(saved.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, [isOpen]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem("prd_history", JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const handleSelect = (content: string) => {
    onSelect(content);
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="absolute top-4 right-4 md:top-8 md:right-8"
        onClick={() => setIsOpen(true)}
      >
        <History className="w-4 h-4 mr-2" />
        History PRD
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="mb-6">
          <SheetTitle>Riwayat PRD</SheetTitle>
          <SheetDescription>
            Kumpulan PRD yang pernah Anda simpan di browser ini.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          {history.length === 0 ? (
            <div className="text-center text-muted-foreground mt-10">
              Belum ada PRD yang disimpan.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => handleSelect(item.content)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">
                        {/* Try to extract a title from content or just use date */}
                        {item.content.split('\n')[0].replace(/#/g, '').trim() || "PRD Document"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 flex-shrink-0"
                    onClick={(e) => handleDelete(item.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
