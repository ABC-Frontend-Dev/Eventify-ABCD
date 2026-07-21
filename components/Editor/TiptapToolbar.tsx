"use client";

import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Underline as UnderlineIcon,
    Highlighter,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    ListChecks,
    Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TiptapToolbarProps {
    editor: Editor | null;
}

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const [linkNewTab, setLinkNewTab] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [imageAlt, setImageAlt] = useState("");

    if (!editor) return null;

    const setLink = useCallback(() => {
        if (linkUrl === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            setLinkDialogOpen(false);
            return;
        }

        const attributes: any = { href: linkUrl };
        if (linkNewTab) {
            attributes.target = "_blank";
            attributes.rel = "noopener noreferrer";
        }

        // If there's link text, insert it
        if (linkText && !editor.state.selection.empty === false) {
            editor
                .chain()
                .focus()
                .insertContent({
                    type: "text",
                    text: linkText,
                    marks: [{ type: "link", attrs: attributes }],
                })
                .run();
        } else {
            editor.chain().focus().extendMarkRange("link").setLink(attributes).run();
        }

        setLinkUrl("");
        setLinkText("");
        setLinkNewTab(false);
        setLinkDialogOpen(false);
    }, [editor, linkUrl, linkText, linkNewTab]);

    const addImage = useCallback(() => {
        if (imageUrl) {
            editor
                .chain()
                .focus()
                .setImage({ src: imageUrl, alt: imageAlt || undefined })
                .run();
            setImageUrl("");
            setImageAlt("");
            setImageDialogOpen(false);
        }
    }, [editor, imageUrl, imageAlt]);

    const openLinkDialog = () => {
        const previousUrl = editor.getAttributes("link").href || "";
        const previousTarget = editor.getAttributes("link").target || "";
        setLinkUrl(previousUrl);
        setLinkNewTab(previousTarget === "_blank");
        setLinkDialogOpen(true);
    };

    const removeLink = useCallback(() => {
        editor.chain().focus().unsetLink().run();
    }, [editor]);

    return (
        <>
            <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
                {/* Headings Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" type="button" className="gap-1">
                            {editor.isActive("heading", { level: 1 }) && "H1"}
                            {editor.isActive("heading", { level: 2 }) && "H2"}
                            {editor.isActive("heading", { level: 3 }) && "H3"}
                            {editor.isActive("heading", { level: 4 }) && "H4"}
                            {editor.isActive("heading", { level: 5 }) && "H5"}
                            {editor.isActive("heading", { level: 6 }) && "H6"}
                            {!editor.isActive("heading") && "Heading"}
                            <span className="ml-1">▼</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive("heading", { level: 1 }) ? "bg-gray-100" : ""}>
                            <span className="text-3xl font-bold">Heading 1</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? "bg-gray-100" : ""}>
                            <span className="text-2xl font-bold">Heading 2</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive("heading", { level: 3 }) ? "bg-gray-100" : ""}>
                            <span className="text-xl font-bold">Heading 3</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={editor.isActive("heading", { level: 4 }) ? "bg-gray-100" : ""}>
                            <span className="text-lg font-bold">Heading 4</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} className={editor.isActive("heading", { level: 5 }) ? "bg-gray-100" : ""}>
                            <span className="text-base font-bold">Heading 5</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} className={editor.isActive("heading", { level: 6 }) ? "bg-gray-100" : ""}>
                            <span className="text-sm font-bold">Heading 6</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>Paragraph</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-8" />

                {/* Text Formatting */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive("bold") ? "bg-gray-200" : ""}
                    type="button"
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "bg-gray-200" : ""}
                    type="button"
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive("underline") ? "bg-gray-200" : ""}
                    type="button"
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive("strike") ? "bg-gray-200" : ""}
                    type="button"
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={editor.isActive("highlight") ? "bg-gray-200" : ""}
                    type="button"
                    title="Highlight"
                >
                    <Highlighter className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon-sm" onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive("code") ? "bg-gray-200" : ""} type="button" title="Code">
                    <Code className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-8" />

                {/* Subscript/Superscript */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    className={editor.isActive("subscript") ? "bg-gray-200" : ""}
                    type="button"
                    title="Subscript"
                >
                    <SubscriptIcon className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    className={editor.isActive("superscript") ? "bg-gray-200" : ""}
                    type="button"
                    title="Superscript"
                >
                    <SuperscriptIcon className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-8" />

                {/* Lists */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
                    type="button"
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
                    type="button"
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    className={editor.isActive("taskList") ? "bg-gray-200" : ""}
                    type="button"
                    title="Task List"
                >
                    <ListChecks className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive("blockquote") ? "bg-gray-200" : ""}
                    type="button"
                    title="Blockquote"
                >
                    <Quote className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-8" />

                {/* Alignment */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    className={editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}
                    type="button"
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    className={editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}
                    type="button"
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    className={editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}
                    type="button"
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-8" />

                {/* Link & Image */}
                <Button variant="ghost" size="icon-sm" onClick={openLinkDialog} className={editor.isActive("link") ? "bg-gray-200" : ""} type="button" title="Add Link">
                    <LinkIcon className="h-4 w-4" />
                </Button>

                {editor.isActive("link") && (
                    <Button variant="ghost" size="icon-sm" onClick={removeLink} className="bg-gray-200" type="button" title="Remove Link">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}

                <Button variant="ghost" size="icon-sm" onClick={() => setImageDialogOpen(true)} type="button" title="Add Image">
                    <ImageIcon className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-8" />

                {/* Undo/Redo */}
                <Button variant="ghost" size="icon-sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} type="button" title="Undo">
                    <Undo className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon-sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} type="button" title="Redo">
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            {/* Link Dialog */}
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add/Edit Link</DialogTitle>
                        <DialogDescription>Enter link details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="link-text">Link Text (optional)</Label>
                            <Input id="link-text" placeholder="Click here" value={linkText} onChange={(e) => setLinkText(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link-url">URL</Label>
                            <Input
                                id="link-url"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") setLink();
                                }}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="new-tab" checked={linkNewTab} onCheckedChange={setLinkNewTab} />
                            <Label htmlFor="new-tab">Open in new tab</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={setLink}>{linkUrl ? "Update" : "Add"} Link</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Dialog */}
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Image</DialogTitle>
                        <DialogDescription>Enter image details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input
                                id="image-url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") addImage();
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-alt">Alt Text (optional)</Label>
                            <Input id="image-alt" placeholder="Description of the image" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={addImage}>Add Image</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
