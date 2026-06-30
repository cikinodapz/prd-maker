"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { useEffect, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Code } from 'lucide-react';

interface TiptapEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  className?: string;
  onEditorReady?: (editor: any) => void;
}

const ToolbarButton = ({ onClick, isActive, icon: Icon, title }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-md transition-colors ${
      isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

export function TiptapEditor({ initialContent, onChange, className = "", onEditorReady }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Get markdown output
      const markdown = (editor.storage as any).markdown.getMarkdown();
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none prose-headings:font-heading prose-headings:font-bold prose-h1:text-4xl prose-a:text-primary focus:outline-none min-h-[500px] p-6',
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Sync external content changes if it completely differs
  // Usually this happens when applying an AI snippet or replacing the whole content
  useEffect(() => {
    if (editor && initialContent !== (editor.storage as any).markdown.getMarkdown()) {
      // Prevent cursor jumping by only updating if the user isn't actively typing
      // or if we are streaming new generated content
      if (!editor.isFocused) {
        // preserveWhitespace: 'full' is sometimes passed in parseOptions, but false for emitUpdate is safe
        editor.commands.setContent(initialContent, { emitUpdate: false }); 
      }
    }
  }, [initialContent, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-indigo-100 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col ${className}`}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-indigo-50 bg-slate-50/50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          title="Italic"
        />
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          title="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          title="Heading 2"
        />
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          title="Ordered List"
        />
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={Quote}
          title="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          icon={Code}
          title="Code Block"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
