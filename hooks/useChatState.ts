import { useEffect } from "react";
import { useChatStore } from "@/lib/stores/chatStore";

interface UseChatStateOptions {
  chatId: string;
  chatTitle?: string | null;
}

export function useChatState({ chatId, chatTitle }: UseChatStateOptions) {
  const setChatTitle = useChatStore((state) => state.setChatTitle);
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);

  useEffect(() => {
    setChatTitle(chatTitle || null);
    setCurrentChatId(chatId);
    return () => {
      setChatTitle(null);
      setCurrentChatId(null);
    };
  }, [chatTitle, chatId, setChatTitle, setCurrentChatId]);
}

