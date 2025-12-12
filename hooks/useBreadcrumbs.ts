import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useChatStore } from "@/lib/stores/chatStore";

interface Breadcrumb {
  label: string;
  href: string;
}

export function useBreadcrumbs() {
  const pathname = usePathname();
  const chatTitle = useChatStore((state) => state.chatTitle);

  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + "...";
  };

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs: Breadcrumb[] = [];

    if (segments.includes("chats")) {
      if (segments.length > 1 && segments[1] !== "chats") {
        crumbs.push({ label: "Chats", href: "/chats" });
        const displayTitle = chatTitle ? truncateTitle(chatTitle) : "Chat";
        crumbs.push({ label: displayTitle, href: pathname });
      } else if (pathname === "/chats") {
        crumbs.push({ label: "Chats", href: "/chats" });
      }
    } else if (segments.includes("settings")) {
      crumbs.push({ label: "Settings", href: "/settings" });
    }

    return crumbs;
  }, [pathname, chatTitle]);

  return breadcrumbs;
}

