import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppShell } from "@/components/app/AppShell";
import { subscribeEmployees, subscribeActivity } from "@/lib/employees";
import type { Employee, ActivityLog } from "@/lib/types";
import { Users, UserCheck, Briefcase, TrendingUp, Plus, Pencil, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
});

function DashboardPage() {
  const [emps, setEmps] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => subscribeEmployees(setEmps), []);
  useEffect(() => subscribeActivity(setLogs), []);

  const stats = useMemo(() => {
    const active = emps.filter((e) => e.status === "active").length;
    const departments = new Set(emps.map((e) => e.department).filter(Boolean)).size;
    const recent = emps.filter((e) => (e.createdAt ?? 0) > Date.now() - 30 * 86400000).length;
    return [
      { label: "Total Employees", value: emps.length, icon: Users, accent: "from-violet-500 to-indigo-500" },
      { label: "Active", value: active, icon: UserCheck, accent: "from-emerald-500 to-teal-500" },
      { label: "Departments", value: departments, icon: Briefcase, accent: "from-cyan-500 to-blue-500" },
      { label: "New (30d)", value: recent, icon: TrendingUp, accent: "from-fuchsia-500 to-pink-500" },
    ];
  }, [emps]);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Overview of your team at a glance"
      actions={
        <Button asChild className="gradient-primary text-primary-foreground shadow-glow hover:opacity-95 transition-smooth">
          <Link to="/employees"><Plus className="h-4 w-4 mr-1" /> Manage</Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-soft transition-smooth hover:shadow-elevated hover:-translate-y-0.5 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.accent} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight">{s.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Recently Added</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/employees">View all →</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {emps.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center gap-4 rounded-xl border bg-background/40 p-3 transition-smooth hover:bg-accent/30">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={e.avatarUrl} alt={e.fullName} />
                  <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                    {(e.fullName || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{e.fullName}</div>
                  <div className="truncate text-xs text-muted-foreground">{e.position} · {e.department}</div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium uppercase ${e.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  {e.status}
                </span>
              </div>
            ))}
            {emps.length === 0 && (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No employees yet. <Link to="/employees" className="text-primary underline">Add your first one</Link>.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold mb-5">Activity Feed</h2>
          <div className="space-y-4">
            {logs.slice(0, 6).map((l) => {
              const Icon = l.action === "create" ? Plus : l.action === "update" ? Pencil : Trash2;
              const color = l.action === "create" ? "text-success" : l.action === "update" ? "text-primary" : "text-destructive";
              return (
                <div key={l.id} className="flex gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent ${color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 text-sm">
                    <div className="truncate"><span className="font-medium">{l.actorEmail}</span> {l.action}d <span className="font-medium">{l.employeeName || "an employee"}</span></div>
                    <div className="text-xs text-muted-foreground">{formatDistanceToNow(l.timestamp, { addSuffix: true })}</div>
                  </div>
                </div>
              );
            })}
            {logs.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">No activity yet.</div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
