import type { Metadata } from "next";
import config from "@/config";
import { PageLayout } from "@/components/home/PageLayout";
import { PageHeader } from "@/components/home/PageHeader";

export const metadata: Metadata = {
  title: "About",
  description: config.pages.about.description,
};

export default function AboutPage() {
  const page = config.pages.about;

  return (
    <PageLayout>
      <div className="w-full space-y-6">
        <PageHeader title={page.title} subtitle={config.appDescription} showLogo={true} />

        <div className="min-h-[280px] space-y-4 rounded-xl border border-border bg-background p-4 sm:p-6 shadow-sm">
          <div className="space-y-3">
            {page.content.sections.map((section, index) => (
              <div key={index} className="space-y-1">
                <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {section.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
