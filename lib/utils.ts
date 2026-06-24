import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function shortAddress(address?: string | null) {
  if (!address) {
    return "Not set";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getEnvChainId() {
  return Number(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
}
