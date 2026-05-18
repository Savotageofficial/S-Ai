"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";

/* =============================================
   Icons (inline SVGs)
   ============================================= */
const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
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
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 4.5L6 7.5L9 4.5" />
  </svg>
);

const StopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <rect x="2" y="2" width="10" height="10" rx="2" />
  </svg>
);

const NewChatIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
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
   Shared Input JSX (extracted as a plain function
   returning JSX, NOT a component — avoids remount)
   ============================================= */
const MODELS = [
  { id: "GLM-4.5-air", label: "GLM 4.5 air" },
  { id: "LongCat-Flash-Lite", label: "LongCat Flash Lite" },
  { id: "DeepSeek-V4-Flash", label: "DeepSeek V4 Flash" },
  { id: "Qwen3-Coder" , label: "Qwen3-Coder"}
];

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
          placeholder="How can I help you today?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          id="chat-input"
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
            />
            <button
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload PDF"
              id="pdf-upload-btn"
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
                disabled={!inputValue.trim() && !pdfFileName}
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
   Message Renderers (extracted outside component
   to avoid recreation on every render)
   ============================================= */

function MessageRenderer({ content }) {
  // Split into paragraphs and handle basic code blocks
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

        // Handle inline formatting
        const paragraphs = block.split("\n\n").filter(Boolean);
        return paragraphs.map((para, j) => {
          // Handle single newlines as line breaks within paragraphs
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
  // Handle inline code
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i}>{part.slice(1, -1)}</code>;
        }
        // Handle bold
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
  const [selectedModel, setSelectedModel] = useState("DeepSeek-V4-Flash");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [pdfContext, setPdfContext] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const conversationHistoryRef = useRef([]);
  const fileInputRef = useRef(null);
  // Auto-resize textarea (fixed: removed redundant height assignment)
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

  // Cleanup on unmount (FIX: added cleanup for abort controller)
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ---- PDF handlers ----
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

      setPdfContext(fullText.trim());
    } catch (err) {
      console.error("PDF extraction error:", err);
      setPdfContext("");
      setPdfFileName("");
    }

    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handlePdfRemove = useCallback(() => {
    setPdfContext("");
    setPdfFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSendMessage = useCallback(
    async (messageText) => {
      const text = messageText || inputValue.trim();
      if ((!text && !pdfContext) || isStreaming) return;

      setInputValue("");
      const currentPdfFileName = pdfFileName; // Capture before clearing
      const currentPdfContext = pdfContext; // Capture PDF context

      // Only clear filename from UI, keep context in history
      setPdfFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsInChat(true);

      conversationHistoryRef.current = [
        ...conversationHistoryRef.current,
        { role: "user", content: text },
      ];

      // Add user message with file info if PDF was attached
      const userMessage = {
        role: "user",
        content: text,
        file: currentPdfFileName || undefined,
      };
      const aiMessage = { role: "ai", content: "", isStreaming: true };

      setMessages((prev) => [...prev, userMessage, aiMessage]);
      setIsStreaming(true);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`/api/${selectedModel}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversationHistoryRef.current,
            context: currentPdfContext || "",
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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
                  // Use flushSync to force React to render each chunk immediately
                  // instead of batching — this gives the streaming effect
                  const contentSnapshot = fullContent;
                  flushSync(() => {
                    setMessages((prev) => {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        role: "ai",
                        content: contentSnapshot,
                        isStreaming: true,
                      };
                      return updated;
                    });
                  });
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        }

        // push assistant reply into conversation history after streaming completes
        conversationHistoryRef.current = [
          ...conversationHistoryRef.current,
          { role: "assistant", content: fullContent },
        ];

        // Mark streaming as done
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            isStreaming: false,
          };
          return updated;
        });
      } catch (err) {
        if (err.name === "AbortError") {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              isStreaming: false,
              content:
                updated[updated.length - 1].content || "Message cancelled.",
            };
            return updated;
          });
        } else {
          // FIX: Added better error handling for network errors
          console.error("Chat error:", err);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "ai",
              content:
                "Sorry, I couldn't connect to the server. Please try again later.",
              isStreaming: false,
            };
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [inputValue, isStreaming, selectedModel, pdfContext],
  );

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleNewChat = () => {
    if (isStreaming) handleStopStreaming();
    setMessages([]);
    setIsInChat(false);
    setInputValue("");
    setPdfContext("");
    setPdfFileName("");
    conversationHistoryRef.current = [];
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Build the shared input props to pass to renderChatInput
  const inputProps = useMemo(
    () => ({
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
    }),
    [
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
    ],
  );

  /* =============================================
     CHAT VIEW
     ============================================= */
  if (isInChat) {
    return (
      <div className="app-container">
        <div className="bg-gradient" />
        <div className="chat-view">
          {/* Header */}
          <header className="chat-header">
            <div className="chat-header-left">
              <Image
                src="/astrict_dark.png"
                alt="Asterisk"
                width={36}
                height={36}
                className="chat-logo-small"
              />
              <span className="chat-header-title">Asterisk</span>
            </div>
            <button
              className="new-chat-btn"
              onClick={handleNewChat}
              id="new-chat-btn"
            >
              <NewChatIcon /> New Chat
            </button>
          </header>

          {/* Messages */}
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${
                  msg.role === "user" ? "message-user" : "message-ai"
                }`}
              >
                {msg.role === "ai" && (
                  <Image
                    src="/astrict_dark.png"
                    alt="Astrict"
                    width={32}
                    height={32}
                    className="message-ai-avatar"
                  />
                )}
                {msg.role === "user" ? (
                  <div className="message-bubble">
                    {msg.file && (
                      <div className="message-file-info">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{msg.file}</span>
                      </div>
                    )}
                    {msg.content}
                  </div>
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

          {/* Bottom Input — rendered inline, NOT as a component */}
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
      <div className="bg-gradient" />
      <div className="welcome-screen">
        <div className="logo-container">
          <Image
            src="/astrict_dark.png"
            alt="Astrict Logo"
            width={80}
            height={80}
            className="logo"
            priority
          />
        </div>

        <h1 className="greeting">
          How can I <span className="highlight">help you</span> today?
        </h1>

        {/* Input — rendered inline, NOT as a component */}
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
