"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSendMessage, useChatState } from "@/hooks";
import { InsightsSidebar } from "./InsightsSidebar";
import { FileUpload } from "./FileUpload";
import { MessageContent } from "./MessageContent";
import { CHAT_CONFIG } from "@/config/chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  attachments?: Array<{ id: string; filename: string; originalName: string; mimeType: string; size: number }>;
}

interface ChatViewProps {
  chatId: string;
  initialMessages?: Message[];
  chatTitle?: string;
}

export function ChatView({ chatId, initialMessages = [], chatTitle }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; filename: string; originalName: string; mimeType: string; size: number }>>([]);
  
  useChatState({ chatId, chatTitle });

  const { message, setMessage, isLoading, sendMessage, handleKeyDown, inputRef } = useSendMessage({
    chatId,
    stream: true,
    fileIds: attachedFiles.map(f => f.id),
    onSuccess: (assistantMessage) => {
      setStreamingMessageId(null);
      setAttachedFiles([]);
      setMessages((prev) => {
        // Remove any temporary streaming message and ensure we don't duplicate
        const filtered = prev.filter((m) => m.id !== streamingMessageId && m.id !== assistantMessage.id);
        // Also remove any temp user messages that might have been added
        const withoutTemp = filtered.filter((m) => !m.id.startsWith("temp-"));
        return [...withoutTemp, assistantMessage];
      });
      // Focus input after message is sent
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    },
    onStreamChunk: (chunk: string, messageId: string) => {
      setStreamingMessageId(messageId);
      setMessages((prev) => {
        const existingIndex = prev.findIndex((m) => m.id === messageId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            content: updated[existingIndex].content + chunk,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: messageId,
              role: "assistant" as const,
              content: chunk,
              createdAt: new Date(),
            },
          ];
        }
      });
    },
    onError: (errorMessage) => {
      setStreamingMessageId(null);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: errorMessage,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && attachedFiles.length === 0) || isLoading) return;
    
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmedMessage || (attachedFiles.length > 0 ? `[Attached ${attachedFiles.length} file(s)]` : ""),
      createdAt: new Date(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setMessage(""); // Clear message input
    await sendMessage();
  };

  const handleKeyDownWrapper = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(e);
  };

  const sampleQueries = CHAT_CONFIG.sampleQueries;

  const handleSampleQueryClick = (query: string) => {
    setMessage(query);
    inputRef.current?.focus();
  };

  const emptyState = (
    <div className="flex h-full items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-3xl w-full">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h3 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Start a conversation
            </h3>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Ask questions about public services, government schemes, or civic information across multiple countries.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs text-muted-foreground font-medium">
              Try these examples
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleQueries.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSampleQueryClick(item.text)}
                className={cn(
                  "group text-left p-4 rounded-lg border border-border bg-background hover:bg-accent hover:border-primary/30 transition-all duration-200 cursor-pointer",
                  "hover:shadow-md active:scale-[0.98]"
                )}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">
                    {item.category}
                  </Badge>
                </div>
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  {item.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const messagesList = (
    <div className="space-y-6 max-w-3xl mx-auto py-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted/80 text-foreground border border-border/50 rounded-bl-md"
            )}
          >
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {msg.attachments.map((file) => (
                  <Badge
                    key={file.id}
                    variant="secondary"
                    className="text-xs flex items-center gap-1.5"
                  >
                    <span className="text-base">
                      {file.mimeType.startsWith("image/") ? "🖼️" : 
                       file.mimeType === "application/pdf" ? "📄" : 
                       file.mimeType.includes("word") || file.mimeType.includes("document") ? "📝" : "📎"}
                    </span>
                    <span className="font-medium truncate max-w-[120px]">{file.originalName}</span>
                  </Badge>
                ))}
              </div>
            )}
            {msg.content && <MessageContent content={msg.content} isUser={msg.role === "user"} />}
          </div>
        </div>
      ))}
      {isLoading && !streamingMessageId && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm bg-muted/80 text-foreground border border-border/50 rounded-bl-md">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {messages.length === 0 ? emptyState : messagesList}
        </div>
        {messages.length > 0 && (
          <InsightsSidebar 
            query={message || (messages[messages.length - 1]?.role === "user" ? messages[messages.length - 1].content : "")} 
            className="w-64 hidden lg:block"
          />
        )}
      </div>

      <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 flex items-center h-14">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-2 h-full">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 border-r border-border/50 pr-2 mr-2">
              {attachedFiles.map((file) => (
                <Badge
                  key={file.id}
                  variant="secondary"
                  className="group flex items-center gap-2 px-2 py-1 text-xs"
                >
                  <span className="text-base">
                    {file.mimeType.startsWith("image/") ? "🖼️" : 
                     file.mimeType === "application/pdf" ? "📄" : 
                     file.mimeType.includes("word") || file.mimeType.includes("document") ? "📝" : "📎"}
                  </span>
                  <span className="font-medium truncate max-w-[100px]">{file.originalName}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}
                    className="p-0.5 hover:bg-destructive/20 hover:text-destructive rounded opacity-0 group-hover:opacity-100"
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDownWrapper}
            placeholder="Ask about any public service..."
            className="flex-1 h-10 pl-3 pr-3 rounded-lg border border-border bg-background shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-sm placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <FileUpload
            onFilesChange={(newFiles) => {
              setAttachedFiles(prev => [...prev, ...newFiles]);
            }}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            size="icon"
            disabled={isLoading || (!message.trim() && attachedFiles.length === 0)}
            aria-label="Send message"
            className="h-10 w-10 rounded-lg shadow-sm hover:shadow-md"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

