"use client";

import { useState, useRef, useId } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Loader2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { FILE_CONFIG } from "@/config/files";

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

export function FileUpload({ onFilesChange, disabled }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newFiles: UploadedFile[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        newFiles.push(data.file);
      }

      onFilesChange(newFiles);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={FILE_CONFIG.acceptedExtensions}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="sr-only"
        id={fileInputId}
        style={{ display: 'none' }}
      />
      <Tooltip content="Choose a file" side="top">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          disabled={disabled || uploading}
          className="h-10 w-10 rounded-lg shadow-sm hover:shadow-md"
          aria-label="Choose a file"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            fileInputRef.current?.click();
          }}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>
      </Tooltip>
      <label htmlFor={fileInputId} className="sr-only">
        Choose a file
      </label>
    </>
  );
}
