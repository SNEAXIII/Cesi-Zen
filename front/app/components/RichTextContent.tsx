'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

type RichTextContentProps = {
  content: string;
  className?: string;
};

export default function RichTextContent({ content, className = '' }: RichTextContentProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    editable: false,
  });

  // Mettre à jour le contenu si la prop content change
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className={`prose max-w-none ${className}`}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  return (
    <div className={`prose max-w-none ${className}`}>
      <EditorContent editor={editor} className={className} />
    </div>
  );
}
