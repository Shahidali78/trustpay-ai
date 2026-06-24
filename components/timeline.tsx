import { MessageSquareText } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type TimelineItem = {
  id: string;
  author: string;
  role: string;
  content: string;
  kind: string;
  createdAt: Date;
};

export function Timeline({ items }: Readonly<{ items: TimelineItem[] }>) {
  if (!items.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">
        No timeline events yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-cyan-300">
            <MessageSquareText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-white">
                {item.author}{" "}
                <span className="font-normal text-slate-500">/{item.role}</span>
              </div>
              <div className="text-xs text-slate-500">
                {formatDateTime(item.createdAt)}
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {item.content}
            </p>
            <div className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-600">
              {item.kind}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
