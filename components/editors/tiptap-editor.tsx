"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import { useEffect, useRef } from "react";

import { AUTOSAVE_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type TipTapEditorProps = {
  initialContent?: Record<string, unknown>;
  onChange?: (payload: {
    content: Record<string, unknown>;
    contentText: string;
  }) => void;
  editable?: boolean;
  className?: string;
};

export function TipTapEditor({
  initialContent,
  onChange,
  editable = true,
  className,
}: TipTapEditorProps) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Type / for commands, or just start writing…",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: initialContent ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    editable,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[320px] focus:outline-none px-1",
      },
    },
    onUpdate: ({ editor: current }) => {
      if (!onChange) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        onChange({
          content: current.getJSON() as Record<string, unknown>,
          contentText: current.getText(),
        });
      }, AUTOSAVE_MS.notes);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-1">
        {(
          [
            ["Bold", () => editor.chain().focus().toggleBold().run()],
            ["Italic", () => editor.chain().focus().toggleItalic().run()],
            ["H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run()],
            ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run()],
            ["List", () => editor.chain().focus().toggleBulletList().run()],
            ["Tasks", () => editor.chain().focus().toggleTaskList().run()],
            ["Quote", () => editor.chain().focus().toggleBlockquote().run()],
            ["Code", () => editor.chain().focus().toggleCodeBlock().run()],
          ] as const
        ).map(([label, action]) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className="hover:bg-muted rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
