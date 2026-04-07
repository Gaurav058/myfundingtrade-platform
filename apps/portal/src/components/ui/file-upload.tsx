"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@myfundingtrade/ui";

interface FileUploadProps {
  accept?: string;
  maxSizeMb?: number;
  onFile: (file: File) => void;
  label?: string;
  className?: string;
}

export function FileUpload({
  accept = "image/*,.pdf",
  maxSizeMb = 10,
  onFile,
  label = "Upload document",
  className,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File must be under ${maxSizeMb}MB`);
        return;
      }
      setSelected(file);
      onFile(file);
    },
    [maxSizeMb, onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className={cn("w-full", className)}>
      {label && <p className="mb-2 text-sm font-medium text-neutral-300">{label}</p>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
          dragOver
            ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5"
            : "border-[var(--color-border)] hover:border-neutral-500",
        )}
      >
        <Upload className="mb-2 h-6 w-6 text-neutral-500" />
        <p className="text-sm text-neutral-400">
          Drag & drop or <span className="text-[var(--color-brand)] underline">browse</span>
        </p>
        <p className="mt-1 text-xs text-neutral-500">Max {maxSizeMb}MB · PDF, JPG, PNG</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {selected && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2">
          <FileText className="h-4 w-4 text-neutral-400" />
          <span className="flex-1 truncate text-sm text-neutral-300">{selected.name}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelected(null);
            }}
            className="text-neutral-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
