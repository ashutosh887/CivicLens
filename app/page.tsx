import config from "@/config";
import { Hero } from "@/components/home/Hero";
import { Footer } from "@/components/home/Footer";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/chats");
  }

  const hero = config.landing.hero;
  const footer = config.landing.footer;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 flex flex-col">
        <Hero hero={hero} />
      </main>

      <Footer footer={footer} />
    </div>
  );
}
