'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Undo,
    Redo,
} from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none min-h-[120px] p-3 text-sm text-gray-800 leading-relaxed',
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '', { emitUpdate: false });
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-gray-300 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-dark-grey transition-all">
            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                        editor.isActive('bold') ? 'bg-gray-200 text-black font-bold' : 'text-gray-600'
                    }`}
                    title="Negrito"
                >
                    <Bold className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                        editor.isActive('italic') ? 'bg-gray-200 text-black font-bold' : 'text-gray-600'
                    }`}
                    title="Itálico"
                >
                    <Italic className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                        editor.isActive('underline') ? 'bg-gray-200 text-black font-bold' : 'text-gray-600'
                    }`}
                    title="Sublinhado"
                >
                    <UnderlineIcon className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                        editor.isActive('strike') ? 'bg-gray-200 text-black font-bold' : 'text-gray-600'
                    }`}
                    title="Tachado"
                >
                    <Strikethrough className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-gray-300 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                        editor.isActive('bulletList') ? 'bg-gray-200 text-black font-bold' : 'text-gray-600'
                    }`}
                    title="Lista com Marcadores"
                >
                    <List className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                        editor.isActive('orderedList') ? 'bg-gray-200 text-black font-bold' : 'text-gray-600'
                    }`}
                    title="Lista Numerada"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-gray-300 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Desfazer"
                >
                    <Undo className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Refazer"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>

            {/* ── Área de Edição ── */}
            <EditorContent editor={editor} />
        </div>
    );
}
