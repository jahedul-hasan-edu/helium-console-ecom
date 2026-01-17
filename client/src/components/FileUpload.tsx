import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ExistingImage {
  id: string;
  imageUrl: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  existingImages?: ExistingImage[];
  onRemoveExistingImage?: (imageId: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
}

export function FileUpload({
  onFilesSelected,
  existingImages = [],
  onRemoveExistingImage,
  maxFiles = 10,
  maxFileSize = 1, // 1MB default
  acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [removedExistingImages, setRemovedExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSizeBytes = maxFileSize * 1024 * 1024;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    validateAndAddFiles(files);
    event.target.value = ""; // Reset input
  };

  const validateAndAddFiles = (files: File[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    const totalFiles = selectedFiles.length + existingImages.length - removedExistingImages.length + files.length;

    if (totalFiles > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} images allowed`);
    }

    for (const file of files) {
      // Check file type
      if (!acceptedFormats.includes(file.type)) {
        newErrors.push(`${file.name} is not a supported image format. Use JPG, PNG, or WebP.`);
        continue;
      }

      // Check file size
      if (file.size > maxFileSizeBytes) {
        newErrors.push(`${file.name} exceeds ${maxFileSize}MB limit`);
        continue;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      setErrors([]);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
      onFilesSelected(updatedFiles);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = Array.from(event.dataTransfer.files);
    validateAndAddFiles(files);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onFilesSelected(newFiles);
    setErrors([]);
  };

  const removeExistingImage = (imageId: string) => {
    setRemovedExistingImages((prev) => [...prev, imageId]);
    onRemoveExistingImage?.(imageId);
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          "hover:border-blue-500 hover:bg-blue-50",
          errors.length > 0 ? "border-red-500 bg-red-50" : "border-gray-300"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700">Drag and drop images here</p>
        <p className="text-xs text-gray-500">or click to select files</p>
        <p className="text-xs text-gray-500 mt-2">
          Max {maxFiles} images, {maxFileSize}MB each
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Current Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {existingImages.map((image) => (
              !removedExistingImages.includes(image.id) && (
                <div key={image.id} className="relative group">
                  <img
                    src={image.imageUrl}
                    alt="Product"
                    className="w-full h-24 object-cover rounded border border-gray-200"
                  />
                  <button
                    onClick={() => removeExistingImage(image.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">New Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative group">
                {previews[index] ? (
                  <>
                    <img
                      src={previews[index]}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded border border-blue-200 bg-blue-50"
                    />
                    <div className="absolute top-1 left-1 bg-green-500 text-white px-2 py-1 rounded text-xs">
                      New
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Count */}
      <p className="text-sm text-gray-600">
        Total images: {existingImages.length - removedExistingImages.length + selectedFiles.length}
        {maxFiles && ` / ${maxFiles}`}
      </p>
    </div>
  );
}
