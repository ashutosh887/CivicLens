"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumbs() {
  const pathname = usePathname();
  
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Home", href: "/chats" }];
    
    if (segments.includes("chats")) {
      if (segments.length > 1 && segments[1] !== "chats") {
        breadcrumbs.push({ label: "Chats", href: "/chats" });
        breadcrumbs.push({ label: "Chat", href: pathname });
      } else {
        breadcrumbs.push({ label: "Chats", href: "/chats" });
      }
    } else if (segments.includes("settings")) {
      breadcrumbs.push({ label: "Settings", href: "/settings" });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const isLast = (index: number) => index === breadcrumbs.length - 1;

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <div key={`${crumb.href}-${index}`} className="flex items-center gap-1.5">
          {index === 0 ? (
            <Link
              href={crumb.href}
              className={cn(
                "flex items-center text-muted-foreground hover:text-foreground transition-colors rounded-sm p-1 -ml-1",
                isLast(index) && "text-foreground"
              )}
            >
              <Home className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
              {isLast(index) ? (
                <span className="text-foreground font-medium">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors rounded-sm px-1 py-0.5"
                >
                  {crumb.label}
                </Link>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
}
