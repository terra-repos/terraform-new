"use client";

import { useState, useRef } from "react";
import { X, Send, ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";

type AskQuestionModalProps = {
  open: boolean;
  onClose: () => void;
  orderItemId: string;
  onSubmit: (
    orderItemId: string,
    question: string,
    attachments?: string[]
  ) => Promise<{ success: boolean; error?: string }>;
};

export default function AskQuestionModal({
  open,
  onClose,
  orderItemId,
  onSubmit,
}: AskQuestionModalProps) {
  const [question, setQuestion] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      // Handle each file
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError("Please upload only image files");
          continue;
        }

        // Create form data for upload
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setAttachments((prev) => [...prev, data.url]);
        } else {
          setError("Failed to upload image. Please try again.");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSubmit(
        orderItemId,
        question.trim(),
        attachments.length > 0 ? attachments : undefined
      );

      if (result.success) {
        setQuestion("");
        setAttachments([]);
        onClose();
      } else {
        setError(result.error || "Failed to submit question");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Ask a Question
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-neutral-500">
            Have a question about your sample order? Ask our team and we&apos;ll get
            back to you as soon as possible.
          </p>

          {/* Question input */}
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Your Question
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              rows={4}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Attachments (optional)
            </label>

            {/* Uploaded images preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {attachments.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200">
                      <Image
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  Add Images
                </>
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Question
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
