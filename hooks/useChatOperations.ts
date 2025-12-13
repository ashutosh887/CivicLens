import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Chat {
  id: string;
  title: string;
  updatedAt: Date;
}

export function useChatOperations() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createChat = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        const query = searchParams.get("q");
        const url = query 
          ? `/chats/${data.chat.id}?q=${encodeURIComponent(query)}`
          : `/chats/${data.chat.id}`;
        router.push(url);
        router.refresh();
        return { success: true, chatId: data.chat.id };
      }
      return { success: false, error: "Failed to create chat" };
    } catch (error) {
      console.error("Error creating chat:", error);
      return { success: false, error: "Failed to create chat" };
    } finally {
      setIsCreating(false);
    }
  };

  const updateChat = async (chatId: string, title: string) => {
    if (!title.trim()) {
      return { success: false, error: "Title cannot be empty" };
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (response.ok) {
        router.refresh();
        return { success: true };
      }

      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("Error updating chat:", errorData);
      return { success: false, error: errorData.error || "Failed to update chat" };
    } catch (error) {
      console.error("Error updating chat:", error);
      return { success: false, error: "Failed to update chat. Please check your connection." };
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteChat = async (chat: Chat) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/chats/${chat.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const deletedChatId = chat.id;
        
        if (pathname === `/chats/${deletedChatId}`) {
          router.push("/chats");
        }
        
        return { success: true };
      }

      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      console.error("Error deleting chat:", errorData);
      return { success: false, error: errorData.error || "Failed to delete chat" };
    } catch (error) {
      console.error("Error deleting chat:", error);
      return { success: false, error: "Failed to delete chat. Please check your connection." };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    createChat,
    updateChat,
    deleteChat,
    isCreating,
    isUpdating,
    isDeleting,
    isLoading: isCreating || isUpdating || isDeleting,
  };
}

