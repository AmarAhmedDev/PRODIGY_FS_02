import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppShell } from "@/components/app/AppShell";
import { subscribeActivity } from "@/lib/employees";
import type { ActivityLog } from "@/lib/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export const Route = createFileRoute("/activity")({
  component: () => (
    <RequireAuth>
      <ActivityPage />
    </RequireAuth>
  ),
});

function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  useEffect(() => subscribeActivity(setLogs), []);

  return (
    <AppShell title="Activity Log" subtitle="Audit trail of all changes">
      <div className="rounded-2xl border bg-card shadow-soft overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground">No activity recorded yet.</div>
        ) : (
          <ul className="divide-y">
            {logs.map((l) => {
              const Icon = l.action === "create" ? Plus : l.action === "update" ? Pencil : Trash2;
              const color = l.action === "create" ? "text-success bg-success/10" : l.action === "update" ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10";
              return (
                <li key={l.id} className="flex items-center gap-4 p-4 transition-smooth hover:bg-accent/30">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">
                      <span className="font-medium">{l.actorEmail}</span>
                      <span className="text-muted-foreground"> {l.action}d </span>
                      <span className="font-medium">{l.employeeName || "an employee"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {format(l.timestamp, "PPp")} · {formatDistanceToNow(l.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${color}`}>
                    {l.action}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
