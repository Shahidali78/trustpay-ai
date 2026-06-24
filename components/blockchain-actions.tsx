"use client";

import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { isAddress, parseEther } from "viem";
import {
  useAccount,
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  escrowAbi,
  escrowChainId,
  escrowContractAddress,
} from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/utils";

type BlockchainActionsProps = {
  projectId: string;
  budget: string;
  freelancerWallet: string;
  contractProjectId?: string | null;
  status: string;
};

type ChainAction =
  | "create"
  | "fund"
  | "submit"
  | "release"
  | "refund"
  | "dispute";

export function BlockchainActions({
  projectId,
  budget,
  freelancerWallet,
  contractProjectId,
  status,
}: BlockchainActionsProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const [lastAction, setLastAction] = useState<ChainAction | null>(null);
  const [recorded, setRecorded] = useState(false);
  const hasAddress =
    escrowContractAddress && isAddress(escrowContractAddress as `0x${string}`);
  const onExpectedChain = chainId === escrowChainId;
  const projectIdBigInt = useMemo(
    () => (contractProjectId ? BigInt(contractProjectId) : null),
    [contractProjectId],
  );
  const receipt = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!hash || !receipt.isSuccess || !lastAction || recorded) {
      return;
    }

    fetch(`/api/projects/${projectId}/transaction`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        hash,
        type: lastAction,
        chainId,
      }),
    })
      .then(() => setRecorded(true))
      .catch(() => setRecorded(false));
  }, [chainId, hash, lastAction, projectId, receipt.isSuccess, recorded]);

  function run(action: ChainAction) {
    if (!hasAddress) {
      return;
    }
    setLastAction(action);
    setRecorded(false);

    if (action === "create") {
      writeContract({
        address: escrowContractAddress as `0x${string}`,
        abi: escrowAbi,
        functionName: "createProject",
        args: [
          freelancerWallet as `0x${string}`,
          `local://trustpay-ai/projects/${projectId}`,
        ],
        value: parseEther(budget),
      });
      return;
    }

    if (!projectIdBigInt) {
      return;
    }

    if (action === "fund") {
      writeContract({
        address: escrowContractAddress as `0x${string}`,
        abi: escrowAbi,
        functionName: "fundProject",
        args: [projectIdBigInt],
        value: parseEther(budget),
      });
      return;
    }

    const functionName = {
      submit: "submitWork",
      release: "releasePayment",
      refund: "refundClient",
      dispute: "openDispute",
    }[action] as
      | "submitWork"
      | "releasePayment"
      | "refundClient"
      | "openDispute";

    writeContract({
      address: escrowContractAddress as `0x${string}`,
      abi: escrowAbi,
      functionName,
      args: [projectIdBigInt],
    });
  }

  const disabled = !isConnected || !hasAddress || !onExpectedChain || isPending;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">Blockchain escrow</h3>
          <p className="mt-1 text-sm text-slate-400">
            Contract{" "}
            {hasAddress ? shortAddress(escrowContractAddress) : "not deployed"}
            {" "}on chain {escrowChainId}
          </p>
        </div>
        {receipt.isSuccess ? (
          <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            Recorded
          </span>
        ) : null}
      </div>

      {!hasAddress ? (
        <div className="mt-4 flex gap-3 rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Deploy the contract locally and set
          NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS to enable wallet writes. Demo
          mode remains available.
        </div>
      ) : null}

      {hasAddress && !onExpectedChain ? (
        <div className="mt-4 flex gap-3 rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Switch your wallet to Hardhat chain {escrowChainId}.
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || status !== "Created"}
          onClick={() => run(contractProjectId ? "fund" : "create")}
        >
          {contractProjectId ? "Fund escrow" : "Create escrow"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || !projectIdBigInt || status !== "Funded"}
          onClick={() => run("submit")}
        >
          Submit on-chain
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || !projectIdBigInt || status !== "Submitted"}
          onClick={() => run("release")}
        >
          Release
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={
            disabled ||
            !projectIdBigInt ||
            !["Funded", "Submitted"].includes(status)
          }
          onClick={() => run("dispute")}
        >
          Open dispute
        </Button>
      </div>

      {hash ? (
        <a
          href={`https://etherscan.io/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex break-all text-sm text-cyan-200 hover:text-cyan-100"
        >
          <ExternalLink className="mr-2 h-4 w-4 shrink-0" />
          {hash}
        </a>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-rose-200">{error.message}</p>
      ) : null}
    </div>
  );
}
