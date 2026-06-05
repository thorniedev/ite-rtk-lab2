"use client";

import Counter from "./Counter";
import ResetButton from "./ResetButton";
import Result from "./Result";

export default function CounterLayout() {
  return (
    <main className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl p-8 rounded-2xl shadow-lg dark:shadow-md bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <Header />

        <section className="flex flex-col gap-8 items-center mt-6">
          {/* Counter and Result Section */}
          <div className="w-full flex flex-col gap-4 items-center">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Component 1
            </h2>
            <Counter />
            <Result />
          </div>

          {/* Reset Button Section */}
          <div className="w-full flex justify-center">
            <ResetButton />
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-50">
        Redux Counter
      </h1>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-6 text-sm text-gray-500 dark:text-gray-300 text-center">
      <p>Counter App with Next.js 15, Redux Toolkit, and TypeScript</p>
    </footer>
  );
}