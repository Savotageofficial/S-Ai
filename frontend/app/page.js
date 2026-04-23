"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";

/* =============================================
   Toast Component for Notifications
   ============================================= */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
}

/* =============================================
   Icons (inline SVGs)
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
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4.5L6 7.5L9 4.5" />
  </svg>
);

const StopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <rect x="2" y="2" width="10" height="10" rx="2" />
  </svg>
);

const NewChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 2.5L6.5 9.5L4 10L4.5 7.5L11.5 0.5L13.5 2.5Z" />
    <path d="M2 13H14" />
  </svg>
);

/* =============================================
   Quick action chip data
   ============================================= */
const QUICK_ACTIONS = [
  { icon: "", label: "Code", prompt: "Help me write some code" },
  { icon: "", label: "Learn", prompt: "Teach me something new" },
  { icon: "", label: "Explain", prompt: "Explain a concept to me" },
  { icon: "", label: "Debug", prompt: "Help me debug an issue" },
  { icon: "", label: "Build", prompt: "Help me build a project" },
];

/* =============================================
   Models Configuration
   ============================================= */
const MODELS = [
  { id: "Safwat-ai", label: "Safwat-ai" },
  { id: "Safwat-ai-flash", label: "Safwat-ai flash" },
  { id: "Safwat-ai-enhanced", label: "Safwat-ai enhanced" },
];

/* =============================================
   Shared Input JSX
   ============================================= */
function renderChatInput({
  textareaRef,
  inputValue,
  setInputValue,
  handleKeyDown,
  isStreaming,
  handleStopStreaming,
  handleSendMessage,
  selectedModel,
  setSelectedModel,
  modelDropdownOpen,
  setModelDropdownOpen,
  pdfFileName,
  fileInputRef,
  handlePdfSelect,
  handlePdfRemove,
  isProcessingPdf,
}) {
  return (
    <div className="input-wrapper">
      <div className="input-container">
        {pdfFileName && (
          <div className="pdf-chip" id="pdf-chip">
            <span className="pdf-chip-icon">📄</span>
            <span className="pdf-chip-name">{pdfFileName}</span>
            <button
              className="pdf-chip-remove"
              onClick={handlePdfRemove}
              title="Remove PDF"
              id="pdf-remove-btn"
            >
              <CloseIcon />
            </button>
          </div>
        )}
        <textarea
          ref={textareaRef}
          className="input-field"
          placeholder={isProcessingPdf ? "Processing PDF..." : "How can I help you today?"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          id="chat-input"
          disabled={isProcessingPdf}
        />
        <div className="input-actions">
          <div className="input-left-actions">
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handlePdfSelect}
              style={{ display: "none" }}
              id="pdf-file-input"
              disabled={isProcessingPdf}
            />
            <button
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload PDF"
              id="pdf-upload-btn"
              disabled={isProcessingPdf}
            >
              <PlusIcon />
            </button>
          </div>
          <div className="input-right-actions">
            <div className="model-selector-wrapper">
              <button
                className="model-selector"
                id="model-selector"
                onClick={() => setModelDropdownOpen((prev) => !prev)}
                disabled={isProcessingPdf}
              >
                {selectedModel} <ChevronDown />
              </button>
              {modelDropdownOpen && (
                <div className="model-dropdown" id="model-dropdown">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      className={`model-option${selectedModel === model.id ? " active" : ""}`}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setModelDropdownOpen(false);
                      }}
                      id={`model-option-${model.id}`}
                    >
                      {model.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isStreaming ? (
              <button
                className="send-btn loading"
                onClick={handleStopStreaming}
                title="Stop generating"
                id="stop-btn"
              >
                <StopIcon />
              </button>
            ) : (
              <button
                className="send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isProcessingPdf}
                title="Send message"
                id="send-btn"
              >
                <SendIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================
   Message Renderers
   ============================================= */
function MessageRenderer({ content }) {
  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("```")) {
          const lines = block.split("\n");
          const code = lines.slice(1, -1).join("\n");
          return (
            <pre key={i}>
              <code>{code || block.slice(3, -3)}</code>
            </pre>
          );
        }

        const paragraphs = block.split("\n\n").filter(Boolean);
        return paragraphs.map((para, j) => {
          const lines = para.split("\n");
          return (
            <p key={`${i}-${j}`}>
              {lines.map((line, k) => (
                <span key={k}>
                  {k > 0 && <br />}
                  <InlineRenderer text={line} />
                </span>
              ))}
            </p>
          );
        });
      })}
    </>
  );
}

function InlineRenderer({ text }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i}>{part.slice(1, -1)}</code>;
        }
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bp, j) => {
          if (bp.startsWith("**") && bp.endsWith("**")) {
            return <strong key={`${i}-${j}`}>{bp.slice(2, -2)}</strong>;
          }
          return <span key={`${i}-${j}`}>{bp}</span>;
        });
      })}
    </>
  );
}

/* =============================================
   Main Page Component
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
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const conversationHistoryRef = useRef([]);
  const fileInputRef = useRef(null);
  const queueRef = useRef([]);

  // Show toast notification
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Process message queue
  const processQueue = useCallback(async () => {
    if (isSending || queueRef.current.length === 0) return;

    const nextMessage = queueRef.current.shift();
    setIsSending(true);

    try {
      await handleSendMessage(nextMessage);
    } catch (error) {
      console.error("Queue processing error:", error);
    } finally {
      setIsSending(false);
      processQueue();
    }
  }, [isSending]);

  // Queue message handler
  const handleSendMessageQueued = useCallback((text) => {
    queueRef.current.push(text);
    processQueue();
  }, [processQueue]);

  // SEND MESSAGE
  const handleSendMessage = useCallback(async (messageText) => {
    const text = messageText || inputValue.trim();
    if (!text || isStreaming || isProcessingPdf) return;

    setInputValue("");
    setIsInChat(true);

    // Create temporary ID for rollback
    const tempId = Date.now();

    // Add user message to history
    const userMessageObj = { role: "user", content: text, tempId };
    conversationHistoryRef.current = [
      ...conversationHistoryRef.current,
      userMessageObj,
    ];

    const userMessage = { role: "user", content: text };
    const aiMessage = { role: "ai", content: "", isStreaming: true };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    // Set timeout for the request
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      showToast("Request timeout. Please try again.", 'error');
    }, 60000); // 60 second timeout

    try {
      const response = await fetch(`/api/${selectedModel}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistoryRef.current.map(({ role, content }) => ({ role, content })),
          context: pdfContext || "",
        }),
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                const snapshot = fullContent;

                flushSync(() => {
                  setMessages((prev) => {
                    const updated = [...prev];
                    if (updated[updated.length - 1]) {
                      updated[updated.length - 1] = {
                        role: "ai",
                        content: snapshot,
                        isStreaming: true,
                      };
                    }
                    return updated;
                  });
                });
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }

      // Add successful response to history
      conversationHistoryRef.current = [
        ...conversationHistoryRef.current,
        { role: "assistant", content: fullContent },
      ];

      setMessages((prev) => {
        const updated = [...prev];
        if (updated[updated.length - 1]) {
          updated[updated.length - 1].isStreaming = false;
        }
        return updated;
      });

    } catch (err) {
      clearTimeout(timeoutId);

      // Rollback - remove the failed user message from history
      conversationHistoryRef.current = conversationHistoryRef.current.filter(
        msg => msg.tempId !== tempId
      );

      let errorMessage = "An error occurred. Please try again.";

      if (err.name === 'AbortError') {
        errorMessage = "Request was cancelled or timed out.";
      } else if (err.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.message.includes('API Error')) {
        errorMessage = "Server error. Please try again later.";
      }

      // Remove streaming message and show error
      setMessages((prev) => {
        const updated = [...prev];
        updated.pop(); // Remove streaming message
        updated.pop(); // Remove user message
        updated.push({
          role: "ai",
          content: errorMessage,
          isStreaming: false,
          isError: true,
        });
        return updated;
      });

      showToast(errorMessage, 'error');
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [inputValue, isStreaming, selectedModel, pdfContext, isProcessingPdf, showToast]);

  // PDF HANDLER
  const handlePdfSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      showToast("Please upload a valid PDF file.", 'error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("PDF file too large. Maximum 10MB.", 'error');
      return;
    }

    setPdfFileName(file.name);
    setIsProcessingPdf(true);
    setInputValue("Processing PDF...");

    try {
      // Load PDF library with timeout
      const pdfjsLib = await Promise.race([
        import("pdfjs-dist/legacy/build/pdf.mjs"),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("PDF library failed to load")), 10000)
        )
      ]);

      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Limit to 50 pages maximum
      const maxPages = Math.min(pdf.numPages, 50);
      let fullText = "";

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";

        // Update progress every 10 pages
        if (i % 10 === 0) {
          setInputValue(`Processing PDF: ${i}/${maxPages} pages...`);
        }
      }

      if (!fullText.trim()) {
        throw new Error("No text could be extracted from this PDF.");
      }

      setPdfContext(fullText.trim());
      setInputValue("");
      setIsInChat(true);

      showToast("PDF uploaded and processed successfully!", 'success');

      // Auto focus on textarea
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });

      // Auto send summary request
      setTimeout(() => {
        handleSendMessageQueued(`Please provide a comprehensive summary of this PDF document. Focus on the main points and key information.`);
      }, 500);

    } catch (err) {
      console.error("PDF Error:", err);
      setPdfContext("");
      setPdfFileName("");
      setInputValue("");
      showToast(`Failed to process PDF: ${err.message}`, 'error');
    } finally {
      setIsProcessingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [handleSendMessageQueued, showToast]);

  const handlePdfRemove = useCallback(() => {
    setPdfContext("");
    setPdfFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("PDF removed successfully.", 'info');
  }, [showToast]);

  const handleStopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      showToast("Generation stopped.", 'info');
    }
  }, [showToast]);

  const handleNewChat = useCallback(() => {
    if (isStreaming) handleStopStreaming();
    setMessages([]);
    setIsInChat(false);
    setInputValue("");
    setPdfContext("");
    setPdfFileName("");
    conversationHistoryRef.current = [];
    queueRef.current = [];
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("New conversation started.", 'info');
  }, [isStreaming, handleStopStreaming, showToast]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey && !isStreaming && !isProcessingPdf) {
      e.preventDefault();
      handleSendMessageQueued(inputValue);
    }
  }, [inputValue, isStreaming, isProcessingPdf, handleSendMessageQueued]);

  // Build the shared input props
  const inputProps = useMemo(
    () => ({
      textareaRef,
      inputValue,
      setInputValue,
      handleKeyDown,
      isStreaming,
      handleStopStreaming,
      handleSendMessage: handleSendMessageQueued,
      selectedModel,
      setSelectedModel,
      modelDropdownOpen,
      setModelDropdownOpen,
      pdfFileName,
      fileInputRef,
      handlePdfSelect,
      handlePdfRemove,
      isProcessingPdf,
    }),
    [
      textareaRef,
      inputValue,
      setInputValue,
      handleKeyDown,
      isStreaming,
      handleStopStreaming,
      handleSendMessageQueued,
      selectedModel,
      setSelectedModel,
      modelDropdownOpen,
      setModelDropdownOpen,
      pdfFileName,
      fileInputRef,
      handlePdfSelect,
      handlePdfRemove,
      isProcessingPdf,
    ]
  );

  /* =============================================
     CHAT VIEW
     ============================================= */
  if (isInChat) {
    return (
      <div className="app-container">
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="bg-gradient" />
        <div className="chat-view">
          <header className="chat-header">
            <div className="chat-header-left">
              <Image
                src="/logo.png"
                alt="S-AI Logo"
                width={36}
                height={36}
                className="chat-logo-small"
              />
              <span className="chat-header-title">S-AI</span>
            </div>
            <button className="new-chat-btn" onClick={handleNewChat} id="new-chat-btn">
              <NewChatIcon /> New Chat
            </button>
          </header>

          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${
                  msg.role === "user" ? "message-user" : "message-ai"
                } ${msg.isError ? "message-error" : ""}`}
              >
                {msg.role === "ai" && (
                  <Image
                    src="/logo.png"
                    alt="S-AI"
                    width={32}
                    height={32}
                    className="message-ai-avatar"
                  />
                )}
                {msg.role === "user" ? (
                  <div className="message-bubble">{msg.content}</div>
                ) : (
                  <div className="message-content">
                    {msg.content ? (
                      <MessageRenderer content={msg.content} />
                    ) : msg.isStreaming ? (
                      <div className="typing-indicator">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-wrapper">
            {renderChatInput(inputProps)}
          </div>
        </div>
      </div>
    );
  }

  /* =============================================
     WELCOME SCREEN
     ============================================= */
  return (
    <div className="app-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="bg-gradient" />
      <div className="welcome-screen">
        <div className="logo-container">
          <Image
            src="/logo.png"
            alt="S-AI Logo"
            width={80}
            height={80}
            className="logo"
            priority
          />
        </div>

        <h1 className="greeting">
          How can I <span className="highlight">help you</span> today?
        </h1>

        {renderChatInput(inputProps)}

        <div className="quick-actions">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              className="chip"
              onClick={() => {
                setInputValue(action.prompt);
                textareaRef.current?.focus();
              }}
              id={`chip-${action.label.toLowerCase()}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}