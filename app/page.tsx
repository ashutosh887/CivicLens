import config from "@/config";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-center text-primary">{config.appName}</h1>
      <h4 className="text-lg text-gray-500 text-center mt-4">{config.appDescription}</h4>

      <div className="mt-4 space-x-2">
        <Button variant="default" className="cursor-pointer">Get Started</Button>
        <Button variant="outline" className="cursor-pointer">Learn More</Button>
      </div>
    </div>
  )
}