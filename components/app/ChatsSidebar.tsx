"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MessageSquare, Pencil, Trash2, Check, X, MoreVertical, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  updatedAt: Date;
}

interface ChatsSidebarProps {
  chats: Chat[];
}

export function ChatsSidebar({ chats }: ChatsSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/chats/${data.chat.id}`);
        router.refresh();
      }
    } catch (error) {
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameClick = (chat: Chat, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleInlineRenameSave = async (chatId: string) => {
    if (!editingTitle.trim()) {
      setEditingChatId(null);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (response.ok) {
        setEditingChatId(null);
        setEditingTitle("");
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Error renaming chat:", errorData);
        alert(`Failed to rename chat: ${errorData.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Error renaming chat:", error);
      alert("Failed to rename chat. Please check your connection and try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInlineRenameCancel = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleDeleteClick = (chat: Chat) => {
    setChatToDelete(chat);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chatToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/chats/${chatToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const deletedChatId = chatToDelete.id;
        setDeleteDialogOpen(false);
        setChatToDelete(null);
        
        if (pathname === `/chats/${deletedChatId}`) {
          router.push("/chats");
        }
        
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Error deleting chat:", errorData);
        alert(`Failed to delete chat: ${errorData.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat. Please check your connection and try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 w-full">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Chats</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleNewChat}
          disabled={isCreating || isUpdating || isDeleting}
          aria-label="New chat"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No chats yet. Start a new conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chats.map((chat) => {
              const isActive = pathname === `/chats/${chat.id}`;
              const isHovered = hoveredChat === chat.id;
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg transition-colors w-full",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                    isHovered && !isActive && "bg-sidebar-accent/50"
                  )}
                  onMouseEnter={() => setHoveredChat(chat.id)}
                  onMouseLeave={() => {
                    if (editingChatId !== chat.id) {
                      setHoveredChat(null);
                    }
                  }}
                >
                  {editingChatId === chat.id ? (
                    <div className="flex items-center gap-2 flex-1 px-3 py-2">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && editingTitle.trim() && !isUpdating) {
                            e.preventDefault();
                            handleInlineRenameSave(chat.id);
                          } else if (e.key === "Escape" && !isUpdating) {
                            e.preventDefault();
                            handleInlineRenameCancel();
                          }
                        }}
                        className="h-7 text-sm flex-1"
                        autoFocus
                        disabled={isUpdating}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleInlineRenameSave(chat.id)}
                        disabled={isUpdating || !editingTitle.trim() || isDeleting}
                        title="Save"
                        type="button"
                        aria-label="Save rename"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleInlineRenameCancel}
                        disabled={isUpdating}
                        title="Cancel"
                        type="button"
                        aria-label="Cancel rename"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0 w-full">
                      <Link
                        href={`/chats/${chat.id}`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm flex-1 min-w-0 transition-colors",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="truncate flex-1">{chat.title}</span>
                      </Link>
                      <div 
                        className={cn(
                          "pr-2 transition-opacity duration-150 flex-shrink-0",
                          isHovered ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              title="More options"
                              type="button"
                              disabled={isUpdating || isDeleting || isCreating}
                              aria-label="More options"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isUpdating && !isDeleting) {
                                  handleRenameClick(chat, e);
                                }
                              }}
                              disabled={isUpdating || isDeleting}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isDeleting && !isUpdating) {
                                  handleDeleteClick(chat);
                                }
                              }}
                              className="text-destructive focus:text-destructive"
                              disabled={isDeleting || isUpdating}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {user?.fullName || user?.firstName || user?.username || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0",
              pathname === "/settings" && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
            asChild
          >
            <Link href="/settings" title="Settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <SignOutButton redirectUrl="/">
          <Button
            variant="default"
            size="sm"
            className="w-full justify-between"
            type="button"
          >
            <span>Logout</span>
            <LogOut className="h-4 w-4" />
          </Button>
        </SignOutButton>
      </div>

      <Dialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setChatToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete chat?</DialogTitle>
            <DialogDescription className="pt-2">
              This will delete <strong>{chatToDelete?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting || isUpdating || isCreating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting || isUpdating || isCreating}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

