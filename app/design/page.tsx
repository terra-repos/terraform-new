"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import {
  ArrowUp,
  Loader2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { uploadImage } from "../uploadImage";
import FinalizeModal from "@/components/finalize-modal";

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export default function DesignChat() {
  const [input, setInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [productTitle, setProductTitle] = useState("");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    height: "",
  });
  const [customDimensions, setCustomDimensions] = useState<
    Array<{ name: string; value: string }>
  >([]);
  const [notes, setNotes] = useState("");
  const [generatedAngles, setGeneratedAngles] = useState<string[]>([]);
  const [isGeneratingAngles, setIsGeneratingAngles] = useState(false);
  const [customizations, setCustomizations] = useState<string[]>([]);
  const [isGeneratingCustomizations, setIsGeneratingCustomizations] =
    useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // AI SDK v5/v6 useChat with DefaultChatTransport
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/design/chat",
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";
  const hasStarted = messages.length > 0;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Open finalize modal and auto-generate title
  const openFinalizeModal = async () => {
    setShowFinalizeModal(true);
    setIsGeneratingTitle(true);
    setIsGeneratingCustomizations(true);
    setCustomizations([]);

    // Set current image as reference image
    const currentImage = getCurrentImage();
    if (currentImage) {
      setReferenceImages([currentImage]);
    }

    try {
      const response = await fetch("/api/design/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await response.json();
      setProductTitle(data.title);
    } catch (error) {
      console.error("Failed to generate title:", error);
      setProductTitle("Untitled Product");
    } finally {
      setIsGeneratingTitle(false);
    }

    try {
      const response = await fetch("/api/design/generate-customizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await response.json();
      const items = Array.isArray(data.customizations)
        ? data.customizations
        : [];
      setCustomizations(items);
    } catch (error) {
      console.error("Failed to generate customizations:", error);
      setCustomizations([]);
    } finally {
      setIsGeneratingCustomizations(false);
    }
  };

  // Generate 3 angles of the current product
  const generateAngles = async () => {
    const currentImage = getCurrentImage();
    if (!currentImage) return;

    setIsGeneratingAngles(true);
    setGeneratedAngles([]);

    try {
      const response = await fetch("/api/design/generate-angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: currentImage }),
      });
      const data = await response.json();

      if (data.success && data.images) {
        setGeneratedAngles(data.images);
      }
    } catch (error) {
      console.error("Failed to generate angles:", error);
    } finally {
      setIsGeneratingAngles(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFiles(Array.from(files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Upload all files to GCS and get URLs
      const uploadPromises = files.map((file) =>
        uploadImage(file, "design-chat")
      );
      const imageUrls = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...imageUrls]);
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageFiles = items
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (imageFiles.length > 0) {
      e.preventDefault();
      await uploadFiles(imageFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Get all generated images from conversation history
  const getAllGeneratedImages = () => {
    const images: string[] = [];
    messages.forEach((message) => {
      if (message.role === "assistant") {
        message.parts.forEach((part) => {
          if (
            part.type === "tool-generateDesign" &&
            part.state === "output-available"
          ) {
            const result = part.output as {
              success: boolean;
              imageUrl?: string;
              imageBase64?: string;
              mediaType?: string;
            };
            if (result.success && (result.imageUrl || result.imageBase64)) {
              const imageUrl =
                result.imageUrl ||
                `data:${result.mediaType || "image/png"};base64,${
                  result.imageBase64
                }`;
              images.push(imageUrl);
            }
          }
        });
      }
    });
    return images;
  };

  // Get currently viewed image
  const getCurrentImage = () => {
    const allImages = getAllGeneratedImages();
    if (allImages.length === 0) return null;
    // Default to most recent (last in array)
    const index = Math.min(currentVersionIndex, allImages.length - 1);
    return allImages[allImages.length - 1 - index]; // Reverse index (newest first)
  };

  // Reset to latest version when new image is generated
  useEffect(() => {
    setCurrentVersionIndex(0);
    setGeneratedAngles([]); // Clear angles when new image is generated
  }, [messages.length]);

  // Clear angles when version changes
  useEffect(() => {
    setGeneratedAngles([]);
  }, [currentVersionIndex]);

  // Clear slide direction after animation
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  const handleSend = () => {
    if (
      (!input.trim() && uploadedImages.length === 0) ||
      isLoading ||
      isUploading
    )
      return;

    // Determine which images to send as context
    const imagesToSend = uploadedImages.length > 0 ? uploadedImages : [];

    // If no uploaded images, include the currently viewed generated image
    if (imagesToSend.length === 0) {
      const currentImage = getCurrentImage();
      if (currentImage) {
        imagesToSend.push(currentImage);
      }
    }

    // AI SDK v5/v6: Use sendMessage with text and optional files
    if (imagesToSend.length > 0) {
      // Send with file attachments
      sendMessage({
        text: input.trim() || "Please analyze these images",
        files: imagesToSend.map((url) => ({
          type: "file" as const,
          mediaType: "image/png",
          url: url,
        })),
      });
    } else {
      // Simple text message
      sendMessage({ text: input.trim() });
    }

    setInput("");
    setUploadedImages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Render message parts in order to separate text before/after tools
  const renderMessageParts = (message: (typeof messages)[0]) => {
    const orderedParts: React.ReactNode[] = [];

    message.parts.forEach((part, index) => {
      switch (part.type) {
        case "text":
          if (part.text.trim()) {
            orderedParts.push(
              <div
                key={index}
                className={cn(
                  "max-w-[80%]",
                  message.role === "user"
                    ? "rounded-2xl px-4 py-2 bg-neutral-900 text-white"
                    : "text-neutral-900"
                )}
              >
                <span className="whitespace-pre-wrap">{part.text}</span>
              </div>
            );
          }
          break;

        case "file":
          // Render file attachments (images uploaded by user)
          if (part.mediaType?.startsWith("image/")) {
            orderedParts.push(
              <Image
                key={index}
                src={part.url}
                alt="Uploaded image"
                width={400}
                height={400}
                className="rounded-lg object-contain"
              />
            );
          }
          break;

        case "tool-generateDesign":
          // Handle tool states according to v5/v6 spec
          switch (part.state) {
            case "input-streaming":
              orderedParts.push(
                <div
                  key={index}
                  className="flex items-center gap-2 text-neutral-500 bg-neutral-100 rounded-2xl px-4 py-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Preparing design...</span>
                </div>
              );
              break;

            case "input-available":
              orderedParts.push(
                <div
                  key={index}
                  className="flex items-center gap-2 text-neutral-500 bg-neutral-100 rounded-2xl px-4 py-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating design...</span>
                </div>
              );
              break;

            case "output-available": {
              const result = part.output as {
                success: boolean;
                imageUrl?: string;
                imageBase64?: string;
                mediaType?: string;
                error?: string;
              };

              if (result.success && (result.imageUrl || result.imageBase64)) {
                const imageSrc =
                  result.imageUrl ||
                  `data:${result.mediaType || "image/png"};base64,${
                    result.imageBase64
                  }`;
                orderedParts.push(
                  <Image
                    key={index}
                    src={imageSrc}
                    alt="Generated design"
                    width={500}
                    height={500}
                    className="rounded-lg object-contain"
                  />
                );
              } else {
                orderedParts.push(
                  <div
                    key={index}
                    className="text-red-500 bg-neutral-100 rounded-2xl px-4 py-2"
                  >
                    Failed to generate design: {result.error || "Unknown error"}
                  </div>
                );
              }
              break;
            }

            case "output-error":
              orderedParts.push(
                <div
                  key={index}
                  className="text-red-500 bg-neutral-100 rounded-2xl px-4 py-2"
                >
                  Error: {part.errorText}
                </div>
              );
              break;
          }
          break;
      }
    });

    return orderedParts;
  };

  return (
    <div className="flex max-h-screen flex-col w-full overflow-hidden">
      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {!hasStarted ? (
          // Initial state - centered prompt with input
          <div className="flex h-full flex-col items-center justify-center px-4">
            <h1 className="mb-2 text-2xl font-semibold text-neutral-900">
              What would you like to design?
            </h1>
            <p className="mb-8 text-sm text-neutral-500">
              You may combine images and text to make a design
            </p>

            {/* Centered input pill */}
            <div className="w-full max-w-4xl">
              {/* Image preview */}

              {/* Input pill */}
              <div
                className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white px-6 py-4 shadow-sm focus-within:border-neutral-300 focus-within:ring-1 focus-within:ring-neutral-300 w-full"
                onPaste={handlePaste}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {/* Image previews inside pill */}
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative inline-block">
                        <Image
                          src={imageUrl}
                          alt={`Upload preview ${index + 1}`}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover h-20 w-20"
                        />
                        <button
                          onClick={() => removeUploadedImage(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-neutral-900 p-1 text-white hover:bg-neutral-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {/* Upload button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    disabled={isLoading || isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Text input */}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      uploadedImages.length > 0
                        ? "Describe the changes you want..."
                        : "Describe your design..."
                    }
                    className="flex-1 bg-transparent text-base text-neutral-900 placeholder-neutral-400 outline-none"
                    disabled={isLoading || isUploading}
                  />

                  {/* Send button */}
                  <button
                    onClick={handleSend}
                    disabled={
                      (!input.trim() && uploadedImages.length === 0) ||
                      isLoading ||
                      isUploading
                    }
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      input.trim() || uploadedImages.length > 0
                        ? "bg-neutral-900 text-white hover:bg-neutral-700"
                        : "bg-neutral-200 text-neutral-400"
                    )}
                  >
                    {isLoading || isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {showChatHistory ? (
              /* Chat messages */
              <div className="min-h-full flex flex-col">
                <div className="mx-auto max-w-5xl space-y-4 p-12 w-full">
                  {messages.map((message) => {
                    const orderedParts = renderMessageParts(message);
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex flex-col gap-3",
                          isUser ? "items-end" : "items-start"
                        )}
                      >
                        {orderedParts}
                      </div>
                    );
                  })}

                  {/* Loading indicator */}
                  {status === "submitted" && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-2 text-neutral-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            ) : (
              /* Image-only view */
              <div className="flex items-center justify-center p-12 h-full">
                {(() => {
                  const allImages = getAllGeneratedImages();
                  const currentImage = getCurrentImage();
                  const isGenerating =
                    status === "streaming" || status === "submitted";

                  // Show loading state if currently generating
                  if (isGenerating) {
                    return (
                      <div className="flex flex-col items-center gap-6">
                        {/* Placeholder image with loading overlay */}
                        <div className="relative w-[600px] h-[400px] flex items-center justify-center bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200">
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm">
                            <Loader2 className="h-12 w-12 animate-spin text-neutral-400" />
                            <p className="text-sm text-neutral-600 font-medium">
                              Generating your design...
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (currentImage && allImages.length > 0) {
                    const totalVersions = allImages.length;
                    const displayIndex = totalVersions - currentVersionIndex;

                    return (
                      <div className="flex items-center gap-6">
                        {/* Left arrow */}
                        <button
                          onClick={() => {
                            setSlideDirection("left");
                            setCurrentVersionIndex((prev) =>
                              Math.min(prev + 1, totalVersions - 1)
                            );
                          }}
                          disabled={currentVersionIndex >= totalVersions - 1}
                          className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-6 w-6 text-neutral-600" />
                        </button>

                        {/* Image */}
                        <div className="flex flex-col items-center gap-3 relative">
                          <div className="overflow-hidden rounded-lg">
                            <div
                              key={currentVersionIndex}
                              style={{
                                animation:
                                  slideDirection === "left"
                                    ? "slideFromRight 0.3s ease-in-out"
                                    : slideDirection === "right"
                                    ? "slideFromLeft 0.3s ease-in-out"
                                    : "none",
                              }}
                            >
                              <Image
                                src={currentImage}
                                alt={`Design version ${displayIndex}`}
                                width={600}
                                height={600}
                                className="rounded-lg object-contain max-h-[70vh]"
                              />
                            </div>
                          </div>
                          {totalVersions > 1 && (
                            <p className="text-sm text-neutral-500">
                              Version {displayIndex} of {totalVersions}
                            </p>
                          )}
                        </div>

                        {/* Right arrow */}
                        <button
                          onClick={() => {
                            setSlideDirection("right");
                            setCurrentVersionIndex((prev) =>
                              Math.max(prev - 1, 0)
                            );
                          }}
                          disabled={currentVersionIndex === 0}
                          className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="h-6 w-6 text-neutral-600" />
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-neutral-500 text-center">
                        <p>No image generated yet.</p>
                        <p className="text-sm mt-2">
                          Start a conversation to create your design.
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </>
        )}
      </div>

      {/* Input area - only shown when chat has started */}
      {hasStarted && (
        <div className=" pb-12 w-full bg-white">
          {" "}
          <div className="mx-auto max-w-5xl px-4 md:px-12">
            {/* Image preview */}

            {/* Input pill */}
            <div
              className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white px-6 py-4 shadow-sm focus-within:border-neutral-300 focus-within:ring-1 focus-within:ring-neutral-300 w-full"
              onPaste={handlePaste}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Image previews inside pill */}
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="relative inline-block">
                      <Image
                        src={imageUrl}
                        alt={`Upload preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover h-20 w-20"
                      />
                      <button
                        onClick={() => removeUploadedImage(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-neutral-900 p-1 text-white hover:bg-neutral-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                  disabled={isLoading || isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Text input */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    uploadedImages.length > 0
                      ? "Describe the changes you want..."
                      : "Describe your design..."
                  }
                  className="flex-1 bg-transparent text-base text-neutral-900 placeholder-neutral-400 outline-none"
                  disabled={isLoading || isUploading}
                />

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={
                    (!input.trim() && uploadedImages.length === 0) ||
                    isLoading ||
                    isUploading
                  }
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    input.trim() || uploadedImages.length > 0
                      ? "bg-neutral-900 text-white hover:bg-neutral-700"
                      : "bg-neutral-200 text-neutral-400"
                  )}
                >
                  {isLoading || isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Action links */}
            <div className="mt-3 flex justify-center gap-4">
              <button
                onClick={() => setShowChatHistory(!showChatHistory)}
                className="text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
              >
                {showChatHistory ? "Hide edit history" : "View edit history"}
              </button>
              <button
                onClick={openFinalizeModal}
                className="text-sm text-neutral-600 hover:text-neutral-900 underline transition-colors"
              >
                Finalize design
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finalize Production Details Modal */}
      <FinalizeModal
        open={showFinalizeModal}
        onClose={() => setShowFinalizeModal(false)}
        productTitle={productTitle}
        setProductTitle={setProductTitle}
        isGeneratingTitle={isGeneratingTitle}
        referenceImages={referenceImages}
        setReferenceImages={setReferenceImages}
        customizations={customizations}
        setCustomizations={setCustomizations}
        isGeneratingCustomizations={isGeneratingCustomizations}
        dimensions={dimensions}
        setDimensions={setDimensions}
        customDimensions={customDimensions}
        setCustomDimensions={setCustomDimensions}
        notes={notes}
        setNotes={setNotes}
        onSaveForLater={() => setShowFinalizeModal(false)}
        onRequestSample={() => {
          // TODO: Implement request sample action
          console.log("Request sample:", {
            productTitle,
            referenceImages,
            dimensions,
            customDimensions,
            notes,
          });
        }}
      />
    </div>
  );
}
