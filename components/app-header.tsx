import { Blocks } from "lucide-react";
import Link from "next/link";
import { WalletConnectButton } from "@/components/wallet-connect";

const nav = [
  ["Client", "/dashboard/client"],
  ["Freelancer", "/dashboard/freelancer"],
  ["Admin", "/admin"],
  ["Docs", "/docs"],
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/82 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
            <Blocks className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-white">
              TrustPay AI
            </span>
            <span className="block text-xs text-slate-400">
              Escrow and dispute review
            </span>
          </span>
        </Link>
        <nav className="flex flex-1 justify-center gap-1 overflow-x-auto text-sm text-slate-300">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 transition hover:bg-white/8 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
        <WalletConnectButton />
      </div>
    </header>
  );
}
