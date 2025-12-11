import { Footer } from "@/components/home/Footer";
import config from "@/config";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const footer = config.landing.footer;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center px-4 pt-12 pb-8 md:pt-16 md:pb-12">
          <div className="w-full max-w-2xl mx-auto">
            {children}
          </div>
        </section>
      </main>
      <Footer footer={footer} />
    </div>
  );
}
