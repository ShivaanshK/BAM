import { TabSelector } from "./_components";

export default function Home() {
  return (
    <div className="flex flex-col items-center place-content-start min-h-screen p-5 pb-5 gap-5 pt-20 font-[family-name:var(--font-geist-sans)] bg-gray-200">
      <main className="flex flex-col gap-8 row-start-2 items-center place-content-start">
        <TabSelector />
      </main>
    </div>
  );
}
