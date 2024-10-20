import { TabSelector } from "./_components";

export default function Home() {
  return (
    <div className="flex flex-col items-center place-content-start min-h-screen p-5 pb-5 gap-5 pt-20 font-[family-name:var(--font-geist-sans)] bg-white">
      <main className="flex flex-col gap-8 row-start-2 items-center place-content-start">
        <img src="/logo.png" className="w-60 h-28 object-cover mb-2" />

        <div className="text-2xl font-bold text-slate-800 italic -mt-8 decoration-slate-700 decoration-dotted underline underline-offset-4">
          Bimodal Action Market
        </div>

        <TabSelector />
      </main>
    </div>
  );
}
