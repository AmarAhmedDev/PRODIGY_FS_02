import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/lib/auth-context";
import {
  subscribeEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/employees";
import type { Employee } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus, Search, Filter, MoreHorizontal, Pencil, Trash2, Download,
  Mail, Phone, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { EmployeeForm, type EmployeeInput } from "@/components/app/EmployeeForm";
import { toast } from "sonner";
import Papa from "papaparse";

export const Route = createFileRoute("/employees")({
  component: () => (
    <RequireAuth>
      <EmployeesPage />
    </RequireAuth>
  ),
});

const PAGE_SIZE = 9;

function EmployeesPage() {
  const { user } = useAuth();
  const [emps, setEmps] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);

  useEffect(() => {
    const unsub = subscribeEmployees((list) => {
      setEmps(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(emps.map((e) => e.department).filter(Boolean))).sort(),
    [emps]
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return emps.filter((e) => {
      if (dept !== "all" && e.department !== dept) return false;
      if (status !== "all" && e.status !== status) return false;
      if (!s) return true;
      return (
        e.fullName.toLowerCase().includes(s) ||
        e.email.toLowerCase().includes(s) ||
        e.position.toLowerCase().includes(s) ||
        e.department.toLowerCase().includes(s)
      );
    });
  }, [emps, search, dept, status]);

  useEffect(() => { setPage(1); }, [search, dept, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = async (data: EmployeeInput) => {
    try {
      await createEmployee(data, user?.email ?? "unknown");
      toast.success("Employee added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add employee");
      throw e;
    }
  };
  const handleUpdate = async (data: EmployeeInput) => {
    if (!editing) return;
    try {
      await updateEmployee(editing.id, data, user?.email ?? "unknown");
      toast.success("Employee updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update employee");
      throw e;
    }
  };
  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteEmployee(deleting.id, deleting.fullName, user?.email ?? "unknown");
      toast.success("Employee deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const exportCSV = () => {
    const rows = filtered.map((e) => ({
      Name: e.fullName, Email: e.email, Phone: e.phone,
      Position: e.position, Department: e.department,
      Status: e.status, Salary: e.salary ?? "",
      "Hire Date": e.hireDate ?? "",
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  return (
    <AppShell
      title="Employees"
      subtitle={`${filtered.length} of ${emps.length} shown`}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            size="sm"
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="gradient-primary text-primary-foreground shadow-glow hover:opacity-95 transition-smooth"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Candidate
          </Button>
        </>
      }
    >
      {/* Filters */}
      <div className="rounded-2xl border bg-card p-4 shadow-soft mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, position…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
              maxLength={100}
            />
          </div>
          <div className="flex gap-2">
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-full md:w-44 h-10">
                <Filter className="h-3.5 w-3.5 mr-1" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-36 h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border bg-card p-16 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary opacity-90">
            <Plus className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No employees found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {emps.length === 0 ? "Get started by adding your first team member." : "Try adjusting your filters."}
          </p>
          {emps.length === 0 && (
            <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="mt-4 gradient-primary text-primary-foreground shadow-glow">
              <Plus className="h-4 w-4 mr-1" /> Add employee
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((e, i) => (
              <article
                key={e.id}
                className="group relative rounded-2xl border bg-card p-5 shadow-soft transition-smooth hover:shadow-elevated hover:-translate-y-0.5 animate-fade-in-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        <AvatarImage src={e.avatarUrl} alt={e.fullName} />
                        <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                          {e.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${
                          e.status === "active" ? "bg-success" : "bg-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{e.fullName}</h3>
                      <p className="truncate text-xs text-muted-foreground">{e.position}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(e); setFormOpen(true); }}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleting(e)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-accent/40 p-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Department</div>
                    <div className="mt-0.5 text-sm font-medium truncate">{e.department || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hire Date</div>
                    <div className="mt-0.5 text-sm font-medium truncate">
                      {e.hireDate ? new Date(e.hireDate).toLocaleDateString() : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{e.email}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{e.phone}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={editing ? handleUpdate : handleCreate}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong className="text-foreground">{deleting?.fullName}</strong> from your records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
