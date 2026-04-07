"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "success" | "default";
  onConfirm: (note: string) => void;
  showNote?: boolean;
  noteLabel?: string;
  notePlaceholder?: string;
  noteRequired?: boolean;
}

const btnColors = {
  danger: "bg-[var(--color-danger)] hover:bg-red-600",
  success: "bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)]",
  default: "bg-[var(--color-info)] hover:bg-blue-600",
};

export function ConfirmModal({
  open, onOpenChange, title, description, confirmLabel = "Confirm",
  confirmVariant = "default", onConfirm, showNote = false,
  noteLabel = "Note", notePlaceholder = "Add a note...", noteRequired = false,
}: ConfirmModalProps) {
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    if (noteRequired && !note.trim()) return;
    onConfirm(note);
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-[var(--color-text-heading)]">{title}</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)]">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          {description && (
            <Dialog.Description className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</Dialog.Description>
          )}
          {showNote && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">{noteLabel}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={notePlaceholder}
                rows={3}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:outline-none"
              />
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${btnColors[confirmVariant]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
