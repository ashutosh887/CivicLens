import { create } from "zustand";

interface ChatStore {
  chatTitle: string | null;
  setChatTitle: (title: string | null) => void;
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chatTitle: null,
  setChatTitle: (title) => set({ chatTitle: title }),
  currentChatId: null,
  setCurrentChatId: (id) => set({ currentChatId: id }),
}));
