"use client";

import { useState } from "react";
import { createStore, Provider } from "jotai";

export function JotaiProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => createStore());
  return <Provider store={store}>{children}</Provider>;
}
