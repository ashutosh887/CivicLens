import { Button } from "@/components/ui/button";

interface FooterProps {
  footer: {
    disclaimer: string;
    links: Array<{ label: string; href: string }>;
  };
}

export function Footer({ footer }: FooterProps) {
  return (
    <footer className="border-t border-border shrink-0">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:gap-4 px-4 py-6 sm:py-8 md:py-10 text-center text-xs text-muted-foreground md:px-6">
        <div className="space-y-2">
          <p className="mx-auto max-w-md text-[10px] sm:text-[11px] leading-relaxed text-muted-foreground px-2 sm:px-0">
            {footer.disclaimer}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
          {footer.links.map((link) => (
            <Button
              key={link.href}
              variant="link"
              size="sm"
              asChild
              className="text-[10px] sm:text-[11px] text-muted-foreground h-auto p-0"
            >
              <a href={link.href}>
                {link.label}
              </a>
            </Button>
          ))}
        </div>
      </div>
    </footer>
  );
}
