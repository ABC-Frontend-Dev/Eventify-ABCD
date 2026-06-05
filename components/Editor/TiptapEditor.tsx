"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useCallback, useEffect, useRef, useState } from "react";
import { TiptapToolbar } from "./TiptapToolbar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Code, Eye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    onHeadingsChange?: (headings: HeadingItem[]) => void;
    placeholder?: string;
    editable?: boolean;
    className?: string;
}

export interface HeadingItem {
    id: string;
    level: number;
    text: string;
}

export default function TiptapEditor({ content, onChange, onHeadingsChange, placeholder = "Start writing your blog post...", editable = true, className }: TiptapEditorProps) {
    const [isCodeView, setIsCodeView] = useState(false);
    const [htmlCode, setHtmlCode] = useState("");

    // 👇 Stable ref so extractHeadings never changes identity
    const onHeadingsChangeRef = useRef(onHeadingsChange);
    useEffect(() => {
        onHeadingsChangeRef.current = onHeadingsChange;
    }, [onHeadingsChange]);

    const extractHeadings = useCallback((editor: Editor) => {
        if (!onHeadingsChangeRef.current) return;

        const headings: HeadingItem[] = [];
        const json = editor.getJSON();

        const traverse = (node: any) => {
            if (node.type === "heading" && node.content) {
                const text = node.content.map((n: any) => n.text || "").join("");
                const id = text
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
                headings.push({ id, level: node.attrs.level, text });
            }
            if (node.content) node.content.forEach(traverse);
        };

        traverse(json);
        onHeadingsChangeRef.current(headings);
    }, []); // 👈 stable — no deps needed since we use a ref

    const editor = useEditor({
        immediatelyRender: false, // 👈 fixes Next.js hydration warning
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                codeBlock: false,
                // 👇 disable built-in ones before adding configured versions
                link: false,
                underline: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 underline cursor-pointer hover:text-blue-800",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "max-w-full h-auto rounded-lg my-4",
                },
            }),
            Placeholder.configure({ placeholder }),
            Typography,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Subscript,
            Superscript,
            TaskList.configure({
                HTMLAttributes: { class: "not-prose pl-2" },
            }),
            TaskItem.configure({
                HTMLAttributes: { class: "flex items-start gap-2" },
                nested: true,
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: "bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto my-4",
                },
            }),
        ],
        content,
        editable,
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[400px] p-4",
                    "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
                    "[&_li]:my-1",
                    "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic",
                    className,
                ),
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
            setHtmlCode(html);
            extractHeadings(editor);
        },
    });

    // 👇 Only runs once when editor first mounts — no infinite loop
    useEffect(() => {
        if (!editor) return;
        const html = editor.getHTML();
        setHtmlCode(html);
        extractHeadings(editor);
    }, [editor]); // 👈 extractHeadings is stable so this is safe

    const toggleCodeView = () => {
        if (!editor) return;
        if (!isCodeView) {
            setHtmlCode(editor.getHTML());
        } else {
            editor.commands.setContent(htmlCode);
        }
        setIsCodeView(!isCodeView);
    };

    const handleCodeChange = (value: string) => {
        setHtmlCode(value);
        onChange(value);
    };

    if (!editor) return null;

    return (
        <div className="border rounded-lg overflow-hidden bg-white">
            <TiptapToolbar editor={editor} />

            <div className="border-b px-4 py-2 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-600">{isCodeView ? "HTML Source Code" : "Visual Editor"}</span>
                <Button variant="outline" size="sm" onClick={toggleCodeView} type="button" className="gap-2">
                    {isCodeView ? (
                        <>
                            <Eye className="h-4 w-4" /> Visual
                        </>
                    ) : (
                        <>
                            <Code className="h-4 w-4" /> Code
                        </>
                    )}
                </Button>
            </div>

            {isCodeView ? (
                <Textarea
                    value={htmlCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="min-h-[400px] font-mono text-sm p-4 border-0 rounded-none resize-none focus-visible:ring-0"
                    placeholder="<p>HTML code...</p>"
                />
            ) : (
                <EditorContent editor={editor} />
            )}
        </div>
    );
}
