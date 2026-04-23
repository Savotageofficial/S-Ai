"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";

/* =============================================
   Icons
   ============================================= */
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="2" y1="2" x2="10" y2="10" />
    <line x1="10" y1="2" x2="2" y2="10" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2.5 2.5L14 8L2.5 13.5V9.5L10 8L2.5 6.5V2.5Z" />
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 4.5L6 7.5L9 4.5" />
  </svg>
);

const StopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <rect x="2" y="2" width="10" height="10" rx="2" />
  </svg>
);

const NewChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
    <path d="M13.5 2.5L6.5 9.5L4 10L4.5 7.5L11.5 0.5L13.5 2.5Z" />
    <path d="M2 13H14" />
  </svg>
);

/* =============================================
   Main Component
   ============================================= */
export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInChat, setIsInChat] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Safwat-ai");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [pdfContext, setPdfContext] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");

  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const conversationHistoryRef = useRef([]);
  const fileInputRef = useRef(null);

  /* =============================================
     FIXED PDF HANDLER 🔥
     ============================================= */
  const handlePdfSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFileName(file.name);

    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      const extractedText = fullText.trim();
      setPdfContext(extractedText);

      /* ✅ UX FIX */
      setInputValue("");
      setModelDropdownOpen(false);
      setIsInChat(true);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.focus();
        }
      });

      /* 🔥 AUTO MESSAGE */
      setTimeout(() => {
        handleSendMessage("Summarize this PDF");
      }, 0);

    } catch (err) {
      console.error(err);
      setPdfContext("");
      setPdfFileName("");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  /* =============================================
     SEND MESSAGE
     ============================================= */
  const handleSendMessage = async (text) => {
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsInChat(true);
  };

  /* =============================================
     UI
     ============================================= */
  return (
    <div className="app-container">
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />

      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        onChange={handlePdfSelect}
      />
    </div>
  );
}