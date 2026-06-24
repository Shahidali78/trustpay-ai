"use client";

import { LogOut, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortAddress } from "@/lib/utils";

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connector = connectors[0];

  if (isConnected) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/15"
      >
        <Wallet className="h-4 w-4" />
        {shortAddress(address)}
        <LogOut className="h-4 w-4 opacity-70" />
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!connector || isPending}
      onClick={() => connector && connect({ connector })}
      className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-50"
    >
      <Wallet className="h-4 w-4" />
      {isPending ? "Connecting" : "Connect Wallet"}
    </button>
  );
}
