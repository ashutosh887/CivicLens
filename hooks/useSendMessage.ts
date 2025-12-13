import { useState, useCallback, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface UseSendMessageOptions {
  chatId: string;
  onSuccess?: (message: Message) => void;
  onError?: (error: string) => void;
  onStreamChunk?: (chunk: string, messageId: string) => void;
  stream?: boolean;
  fileIds?: string[];
}

export function useSendMessage({ 
  chatId, 
  onSuccess, 
  onError,
  onStreamChunk,
  stream = true,
  fileIds = []
}: UseSendMessageOptions) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && (!fileIds || fileIds.length === 0)) || isLoading) return null;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
      createdAt: new Date(),
    };

    if (onStreamChunk) {
      onStreamChunk(`__USER_MESSAGE_UPDATE__${JSON.stringify(userMessage)}`, "");
    }

    setMessage("");
    setIsLoading(true);

    try {
      if (stream) {
        const response = await fetch(`/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: trimmedMessage, stream: true, fileIds }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantMessageId: string | null = null;
        let fullContent = "";

        if (!reader) {
          throw new Error("No response body");
        }

        let savedUserMessage: Message | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                if (assistantMessageId && fullContent) {
                  const assistantMessage: Message = {
                    id: assistantMessageId,
                    role: "assistant",
                    content: fullContent,
                    createdAt: new Date(),
                  };
                  onSuccess?.(assistantMessage);
                }
                setIsLoading(false);
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 50);
                return { success: true, userMessage: savedUserMessage || userMessage };
              }

              try {
                const parsed = JSON.parse(data);
                
                // Handle user message update from server
                if (parsed.type === 'userMessage' && parsed.userMessage) {
                  savedUserMessage = {
                    id: parsed.userMessage.id,
                    role: parsed.userMessage.role,
                    content: parsed.userMessage.content,
                    createdAt: new Date(parsed.userMessage.createdAt),
                  };
                  // Call a callback to update the user message in the UI
                  if (onStreamChunk) {
                    // Use a special marker to indicate this is a user message update
                    onStreamChunk?.(`__USER_MESSAGE_UPDATE__${JSON.stringify(savedUserMessage)}`, "");
                  }
                }
                
                // Handle streaming chunks
                if (parsed.type === 'chunk' && parsed.chunk) {
                  fullContent += parsed.chunk;
                  if (parsed.messageId) {
                    assistantMessageId = parsed.messageId;
                  }
                  onStreamChunk?.(parsed.chunk, parsed.messageId || "");
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      } else {
        const response = await fetch(`/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: trimmedMessage, stream: false, fileIds }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();
        onSuccess?.(data.assistantMessage);
        setIsLoading(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
        return { success: true, userMessage, assistantMessage: data.assistantMessage };
      }
    } catch (error) {
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      onError?.(errorMessage);
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return { success: false, error: errorMessage, userMessage };
    }
  }, [message, isLoading, chatId, onSuccess, onError, onStreamChunk, stream, fileIds]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !isLoading && message.trim()) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage, isLoading, message]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current && !isLoading) {
        inputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [chatId, isLoading]);

  return {
    message,
    setMessage,
    isLoading,
    sendMessage,
    handleKeyDown,
    inputRef,
  };
}

