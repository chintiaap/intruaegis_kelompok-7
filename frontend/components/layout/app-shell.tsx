"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-dvh md:flex">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#E1E8F1] bg-white/95 px-5 backdrop-blur md:px-7">
          <button
            className="rounded-lg border border-[#E1E8F1] p-2 text-[#77869B] transition hover:bg-[#F3F6FB] md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="hidden text-[11px] font-bold uppercase tracking-[0.16em] text-[#77869B] md:block">
              IntruAegis Control Center
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <b className="block text-sm text-[#192B45]">Security Analysis</b>
              <small className="text-xs text-[#77869B]">Defensive AI</small>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#DDE6F0] bg-[#EDF3FA] text-xs font-bold text-[#315F9F]">
              IA
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-[1540px] p-5 md:p-7">{children}</main>
      </div>
    </div>
  );
}
