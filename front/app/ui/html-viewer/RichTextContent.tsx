'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';
type RichTextContentProps = {
  content: string;
  className?: string;
};

export default function RichTextContent({ content, className = '' }: RichTextContentProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: false,
  });

  if (!editor) {
    return (
      <div
        className={`simple-editor ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return <EditorContent editor={editor} />;
}
