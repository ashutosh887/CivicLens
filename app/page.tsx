import config from "@/config";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-center">{config.appName}</h1>
      <h4 className="text-lg text-gray-500 text-center mt-4">{config.appDescription}</h4>
    </div>
  )
}