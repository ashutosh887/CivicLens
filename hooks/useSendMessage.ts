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
}

export function useSendMessage({ chatId, onSuccess, onError }: UseSendMessageOptions) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return null;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
      createdAt: new Date(),
    };

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: trimmedMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      onSuccess?.(data.assistantMessage);
      return { success: true, userMessage, assistantMessage: data.assistantMessage };
    } catch (error) {
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      onError?.(errorMessage);
      return { success: false, error: errorMessage, userMessage };
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [message, isLoading, chatId, onSuccess, onError]);

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

