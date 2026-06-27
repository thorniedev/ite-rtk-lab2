import CounterLayout from "@/components/counter/Home";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function Home() {
  return (
    <div className="relative flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="absolute top-4 right-4 z-10">
        <Button asChild variant="outline">
          <Link href="/api/auth/logout">Logout</Link>
        </Button>
      </div>
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <CounterLayout />
      </main>
    </div>
  );
}
