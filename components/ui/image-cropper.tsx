// components/ui/image-cropper.tsx
// components/ui/image-cropper.tsx
"use client";

import { useRef } from "react";
import Cropper, { type ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Button } from "@/components/ui/button";
import { X, Crop as CropIcon, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropperProps {
    /** Object URL or data URL of the image to crop */
    image: string;
    /** e.g. 1 for square, 16/9, 4/3 — omit for free-form cropping */
    aspectRatio?: number;
    open: boolean;
    onCancel: () => void;
    onCropComplete: (blob: Blob) => void;
    outputType?: string;
    quality?: number;
    title?: string;
}

export function ImageCropper({ image, aspectRatio, open, onCancel, onCropComplete, outputType = "image/jpeg", quality = 0.92, title = "Crop Image" }: ImageCropperProps) {
    const cropperRef = useRef<ReactCropperElement>(null);

    if (!open) return null;

    const handleConfirm = () => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;
        const canvas = cropper.getCroppedCanvas({ imageSmoothingQuality: "high" });
        if (!canvas) return;
        canvas.toBlob(
            (blob) => {
                if (blob) onCropComplete(blob);
            },
            outputType,
            quality,
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <button type="button" onClick={onCancel} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden bg-slate-900">
                    <Cropper
                        ref={cropperRef}
                        src={image}
                        style={{ height: 420, width: "100%" }}
                        aspectRatio={aspectRatio}
                        viewMode={1}
                        dragMode="move"
                        background={false}
                        responsive
                        autoCropArea={1}
                        checkOrientation={false}
                        guides
                    />
                </div>

                <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-slate-100 shrink-0">
                    <div className="flex items-center gap-1">
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => cropperRef.current?.cropper.zoom(0.1)}>
                            <ZoomIn className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => cropperRef.current?.cropper.zoom(-0.1)}>
                            <ZoomOut className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => cropperRef.current?.cropper.rotate(90)}>
                            <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => cropperRef.current?.cropper.reset()}>
                            Reset
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={onCancel} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={handleConfirm} className="h-8 text-xs bg-slate-900 hover:bg-slate-700 text-white">
                            <CropIcon className="h-3.5 w-3.5 mr-1.5" /> Apply Crop
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Converts a cropped Blob back into a File, preserving the original name/type
 *  so it survives your existing upload pipeline (FormData, size checks, etc). */
export function blobToFile(blob: Blob, originalFile: File): File {
    return new File([blob], originalFile.name, {
        type: blob.type || originalFile.type,
        lastModified: Date.now(),
    });
}

export default ImageCropper;