"use client";

import { useMemo } from "react";
import { Provider } from "react-redux";

import { makeStore, AppStore } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const store = useMemo<AppStore>(() => makeStore(), []);

  return <Provider store={store}>{children}</Provider>;
}
