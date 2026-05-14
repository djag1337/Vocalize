"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2 } from "lucide-react";

type Props = {
  reportId: string;
  targetType: "post" | "comment" | "unknown";
  targetId: string;
  communityId: string;
};

export default function ModActions({ reportId, targetType, targetId, communityId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function call(action: string, opts?: { targetId?: string; targetType?: string; reason?: string }) {
    setBusy(true);
    const body = {
      action,
      communityId,
      targetType: opts?.targetType ?? "report",
      targetId: opts?.targetId ?? reportId,
      reason: opts?.reason,
    };
    await fetch("/api/mod", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    router.refresh();
  }

  async function removeAndResolve() {
    const reason = prompt("Reason for removal (optional)?") || "";
    if (targetType === "post") {
      await call("remove_post", { targetId, targetType: "post", reason });
    } else if (targetType === "comment") {
      await call("remove_comment", { targetId, targetType: "comment", reason });
    }
    await call("resolve_report");
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {targetType !== "unknown" && (
        <button
          onClick={removeAndResolve}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 text-xs font-medium disabled:opacity-50"
        >
          <Trash2 size={14} /> Remove + Resolve
        </button>
      )}
      <button
        onClick={() => call("resolve_report")}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-medium disabled:opacity-50"
      >
        <Check size={14} /> Resolve
      </button>
      <button
        onClick={() => call("dismiss_report")}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 text-xs font-medium disabled:opacity-50"
      >
        <X size={14} /> Dismiss
      </button>
    </div>
  );
}
