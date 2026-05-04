import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import type { Employee } from "@/lib/types";

const schema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(4, "Phone is required").max(40),
  position: z.string().trim().min(2, "Position is required").max(100),
  department: z.string().trim().min(2, "Department is required").max(100),
  salary: z.union([z.string().length(0), z.coerce.number().min(0).max(10000000)]).optional(),
  avatarUrl: z.union([z.string().length(0), z.string().url()]).optional(),
  hireDate: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

const DEPTS = ["Engineering", "Design", "Product", "Marketing", "Sales", "HR", "Finance", "Operations"];

export type EmployeeInput = Omit<Employee, "id" | "createdAt" | "updatedAt">;

export function EmployeeForm({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Employee | null;
  onSubmit: (data: EmployeeInput) => Promise<void>;
}) {
  const [form, setForm] = useState<EmployeeInput>({
    fullName: "", email: "", phone: "", position: "", department: "",
    salary: undefined, avatarUrl: "", hireDate: "", status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm(initial ? {
        fullName: initial.fullName,
        email: initial.email,
        phone: initial.phone,
        position: initial.position,
        department: initial.department,
        salary: initial.salary,
        avatarUrl: initial.avatarUrl ?? "",
        hireDate: initial.hireDate ?? "",
        status: initial.status,
      } : {
        fullName: "", email: "", phone: "", position: "", department: "",
        salary: undefined, avatarUrl: "", hireDate: "", status: "active",
      });
    }
  }, [open, initial]);

  const update = <K extends keyof EmployeeInput>(k: K, v: EmployeeInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0];
        if (typeof k === "string") errs[k] = i.message;
      });
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const data: EmployeeInput = {
        ...parsed.data,
        salary: parsed.data.salary === "" ? undefined : (parsed.data.salary as number | undefined),
        avatarUrl: parsed.data.avatarUrl || undefined,
        hireDate: parsed.data.hireDate || undefined,
      };
      await onSubmit(data);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            {initial ? "Update the employee details below." : "Fill in the details to add a new team member."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" error={errors.fullName}>
              <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Cooper" maxLength={100} />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@company.com" maxLength={255} />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555 123 4567" maxLength={40} />
            </Field>
            <Field label="Position" error={errors.position}>
              <Input value={form.position} onChange={(e) => update("position", e.target.value)} placeholder="Project Manager" maxLength={100} />
            </Field>
            <Field label="Department" error={errors.department}>
              <Select value={form.department} onValueChange={(v) => update("department", v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {DEPTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v: "active" | "inactive") => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Hire Date">
              <Input type="date" value={form.hireDate ?? ""} onChange={(e) => update("hireDate", e.target.value)} />
            </Field>
            <Field label="Salary (optional)" error={errors.salary}>
              <Input
                type="number"
                min={0}
                value={form.salary ?? ""}
                onChange={(e) => update("salary", e.target.value === "" ? undefined : Number(e.target.value))}
                placeholder="50000"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Avatar URL (optional)" error={errors.avatarUrl}>
                <Input value={form.avatarUrl ?? ""} onChange={(e) => update("avatarUrl", e.target.value)} placeholder="https://…" />
              </Field>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gradient-primary text-primary-foreground shadow-glow">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : (initial ? "Save Changes" : "Add Employee")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
