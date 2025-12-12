"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/stores/chat-store";

export function Breadcrumbs() {
  const pathname = usePathname();
  const chatTitle = useChatStore((state) => state.chatTitle);
  
  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + "...";
  };
  
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];
    
    if (segments.includes("chats")) {
      if (segments.length > 1 && segments[1] !== "chats") {
        breadcrumbs.push({ label: "Chats", href: "/chats" });
        const displayTitle = chatTitle ? truncateTitle(chatTitle) : "Chat";
        breadcrumbs.push({ label: displayTitle, href: pathname });
      } else if (pathname === "/chats") {
        breadcrumbs.push({ label: "Chats", href: "/chats" });
      }
    } else if (segments.includes("settings")) {
      breadcrumbs.push({ label: "Settings", href: "/settings" });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const isLast = (index: number) => index === breadcrumbs.length - 1;

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <div key={`${crumb.href}-${index}`} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          {isLast(index) ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors rounded-sm px-1 py-0.5 cursor-pointer"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
