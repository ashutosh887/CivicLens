import Image from "next/image";
import Link from "next/link";
import config from "@/config";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export function PageHeader({ title, subtitle, showLogo = true }: PageHeaderProps) {
  return (
    <div className="min-h-[140px] sm:min-h-[160px] flex flex-col justify-center space-y-3 text-center">
      {showLogo && (
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 pr-4 transition-all hover:bg-white/90 hover:shadow-sm border border-border/50"
          >
            <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-border/50">
              <Image
                src="/logo.png"
                alt={config.appName}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                priority
              />
            </div>
            <span className="text-xs font-semibold text-foreground sm:text-sm tracking-tight">
              {config.appName}
            </span>
          </Link>
        </div>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xs text-muted-foreground md:text-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
}
