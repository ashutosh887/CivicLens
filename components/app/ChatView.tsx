"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSendMessage, useChatState } from "@/hooks";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatViewProps {
  chatId: string;
  initialMessages?: Message[];
  chatTitle?: string;
}

export function ChatView({ chatId, initialMessages = [], chatTitle }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  
  useChatState({ chatId, chatTitle });

  const { message, setMessage, isLoading, sendMessage, handleKeyDown, inputRef } = useSendMessage({
    chatId,
    onSuccess: (assistantMessage) => {
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (errorMessage) => {
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
    if (!trimmedMessage || isLoading) return;
    
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
      createdAt: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    await sendMessage();
  };

  const handleKeyDownWrapper = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(e);
  };

  const emptyState = (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Start a conversation</h3>
        <p className="text-sm text-muted-foreground">
          Ask questions about public services, government schemes, or civic information.
        </p>
      </div>
    </div>
  );

  const messagesList = (
    <div className="space-y-6 max-w-3xl mx-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-lg px-4 py-2.5 shadow-sm",
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground border border-border/50"
            )}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? emptyState : messagesList}
      </div>

      <div className="border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto p-4 flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDownWrapper}
            placeholder="Ask about any public service..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            size="icon" 
            disabled={isLoading || !message.trim()}
            aria-label="Send message"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

