// components/ui/image-uploader.tsx
import * as React from "react";
import { Upload, X, FileVideo, Image as ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
    /** The current list of files. */
    files: File[];
    /** Callback function to update the file list. */
    onChange: (files: File[]) => void;
    /** Maximum number of files allowed. Defaults to 5. */
    maxFiles?: number;
    /** Maximum file size in MB. Defaults to 50. */
    maxSize?: number;
    /** Accepted file types. Defaults to "image/*". */
    accept?: string;
    /** ClassName for the root element. */
    className?: string;
    /** Show file size validation errors */
    showErrors?: boolean;
}

/**
 * A reusable file uploader component with drag-and-drop, previews, and animations.
 * Supports both images and videos.
 */
export const ImageUploader = React.forwardRef<HTMLDivElement, ImageUploaderProps>(
    (
        {
            files,
            onChange,
            maxFiles = 5,
            maxSize = 50, // Changed default to 50MB
            accept = "image/*,video/*", // Accept both images and videos
            className,
            showErrors = true,
            ...props
        },
        ref,
    ) => {
        const [isDragging, setIsDragging] = React.useState(false);
        const [error, setError] = React.useState<string | null>(null);
        const fileInputRef = React.useRef<HTMLInputElement>(null);

        // Create preview URLs and detect file types
        const previews = React.useMemo(() => {
            return files.map((file) => ({
                url: URL.createObjectURL(file),
                isVideo: file.type.startsWith("video/"),
                name: file.name,
                size: file.size,
            }));
        }, [files]);

        // Cleanup object URLs
        React.useEffect(() => {
            return () => {
                previews.forEach((preview) => URL.revokeObjectURL(preview.url));
            };
        }, [previews]);

        const validateFiles = (newFiles: File[]): { valid: File[]; errors: string[] } => {
            const errors: string[] = [];
            const valid: File[] = [];

            newFiles.forEach((file) => {
                // Check file size
                const fileSizeMB = file.size / (1024 * 1024);
                if (fileSizeMB > maxSize) {
                    errors.push(`${file.name}: File size (${fileSizeMB.toFixed(2)}MB) exceeds ${maxSize}MB limit`);
                    return;
                }

                // Check file type
                const acceptedTypes = accept.split(",").map((type) => type.trim());
                const isAccepted = acceptedTypes.some((type) => {
                    if (type === "image/*") return file.type.startsWith("image/");
                    if (type === "video/*") return file.type.startsWith("video/");
                    return file.type === type;
                });

                if (!isAccepted) {
                    errors.push(`${file.name}: File type not supported`);
                    return;
                }

                valid.push(file);
            });

            return { valid, errors };
        };

        const handleFileChange = (newFiles: FileList | null) => {
            if (!newFiles) return;

            setError(null);

            const filesArray = Array.from(newFiles);

            // Remove duplicates
            const uniqueNewFiles = filesArray.filter((newFile) => !files.some((existingFile) => existingFile.name === newFile.name));

            // Validate files
            const { valid, errors } = validateFiles(uniqueNewFiles);

            if (errors.length > 0 && showErrors) {
                setError(errors.join(", "));
            }

            // Check max files limit
            const remainingSlots = maxFiles - files.length;
            const filesToAdd = valid.slice(0, remainingSlots);

            if (valid.length > remainingSlots) {
                setError(`Only ${remainingSlots} more file(s) can be added (max ${maxFiles} files)`);
            }

            const updatedFiles = [...files, ...filesToAdd];
            onChange(updatedFiles);
        };

        const handleRemoveFile = (index: number) => {
            const updatedFiles = files.filter((_, i) => i !== index);
            onChange(updatedFiles);
            setError(null);
        };

        const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        };

        const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        };

        const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            handleFileChange(e.dataTransfer.files);
        };

        const formatFileSize = (bytes: number): string => {
            if (bytes < 1024) return bytes + " B";
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
            return (bytes / (1024 * 1024)).toFixed(2) + " MB";
        };

        const getAcceptedFormats = (): string => {
            const formats: string[] = [];
            if (accept.includes("image/*")) formats.push("Images");
            if (accept.includes("video/*")) formats.push("Videos");
            return formats.join(" & ") || "Files";
        };

        return (
            <div ref={ref} className={cn("space-y-4", className)} {...props}>
                {/* Upload Area */}
                <div
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer",
                        isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-muted-foreground/30 bg-transparent hover:border-primary/50 hover:bg-primary/5",
                    )}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    aria-label="File uploader dropzone"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            fileInputRef.current?.click();
                        }
                    }}
                >
                    <input ref={fileInputRef} type="file" multiple accept={accept} className="hidden" onChange={(e) => handleFileChange(e.target.files)} />
                    <div className="flex flex-col items-center gap-4">
                        <Button type="button" variant="outline" size="icon" className="h-14 w-14 rounded-full pointer-events-none">
                            <Upload className="h-6 w-6" />
                        </Button>
                        <div>
                            <p className="font-medium">Choose {getAcceptedFormats().toLowerCase()} or drag & drop them here</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {getAcceptedFormats()}. Max {maxSize}MB per file, up to {maxFiles} files.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && showErrors && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </motion.div>
                )}

                {/* File Previews */}
                {previews.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">
                            Uploaded Files ({files.length}/{maxFiles})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            <AnimatePresence>
                                {previews.map((preview, index) => (
                                    <motion.div
                                        key={`${preview.name}-${index}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                        className="relative group aspect-square"
                                    >
                                        {preview.isVideo ? (
                                            // Video Preview
                                            <div className="relative w-full h-full rounded-md overflow-hidden bg-slate-900">
                                                <video src={preview.url} className="object-cover w-full h-full" muted />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <FileVideo className="h-8 w-8 text-white" />
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                    <p className="text-xs text-white truncate">{preview.name}</p>
                                                    <p className="text-xs text-white/70">{formatFileSize(preview.size)}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            // Image Preview
                                            <div className="relative w-full h-full">
                                                <img src={preview.url} alt={`Preview of ${preview.name}`} className="object-cover w-full h-full rounded-md" />
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-xs text-white truncate">{preview.name}</p>
                                                    <p className="text-xs text-white/70">{formatFileSize(preview.size)}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Remove Button */}
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile(index);
                                            }}
                                            aria-label={`Remove ${preview.name}`}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>

                                        {/* File Type Badge */}
                                        <div className="absolute top-2 left-2">
                                            <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                                                {preview.isVideo ? <FileVideo className="h-3 w-3 text-white" /> : <ImageIcon className="h-3 w-3 text-white" />}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        );
    },
);

ImageUploader.displayName = "ImageUploader";
