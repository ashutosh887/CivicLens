import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HeroProps {
  hero: {
    title: string;
    tagline: string;
    subheading: string;
    searchPlaceholder: string;
    primaryCta: string;
    secondaryCta: string;
    exampleLabel: string;
    examples: string[];
  };
}

export function Hero({ hero }: HeroProps) {
  return (
    <section className="h-screen md:h-auto md:flex-[0.8] flex flex-col items-center justify-center text-center px-4 py-6 md:py-12">
      <div className="w-full max-w-2xl space-y-6 md:space-y-10">
        <div className="flex items-center justify-center">
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center overflow-hidden rounded-full shadow-sm">
            <Image
              src="/logo.png"
              alt="CivicLens"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="space-y-3 md:space-y-5">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              {hero.title}
            </h1>

            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-border px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] text-muted-foreground bg-muted/50">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary shrink-0" />
              <span className="text-center">{hero.tagline}</span>
            </div>

            <p className="mx-auto max-w-xl text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed px-2 sm:px-0">
              {hero.subheading}
            </p>
          </div>
        </div>

        <div className="space-y-5 md:space-y-6">
          <div className="flex flex-col gap-2.5 sm:gap-3 rounded-xl border border-border bg-background p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Input
                placeholder={hero.searchPlaceholder}
                className="h-10 sm:h-11 flex-1 border-border bg-transparent text-sm focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button className="h-10 sm:h-11 w-full sm:w-auto shrink-0 text-sm" size="sm">
                {hero.primaryCta}
              </Button>
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {hero.exampleLabel}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {hero.examples.map((example) => (
                <Button
                  key={example}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full border-dashed",
                    "px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px]",
                    "hover:-translate-y-px hover:border-foreground"
                  )}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center">
            <Button variant="outline" size="sm" className="text-sm">
              {hero.secondaryCta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
