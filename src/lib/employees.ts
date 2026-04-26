import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Employee, ActivityLog } from "./types";

const EMP = "employees";
const LOG = "activity_logs";

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}

export function subscribeEmployees(cb: (emps: Employee[]) => void) {
  const q = query(collection(db, EMP));
  return onSnapshot(q, (snap) => {
    const list: Employee[] = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      const created = data.createdAt as Timestamp | undefined;
      const updated = data.updatedAt as Timestamp | undefined;
      return {
        id: d.id,
        fullName: (data.fullName as string) ?? "",
        email: (data.email as string) ?? "",
        phone: (data.phone as string) ?? "",
        position: (data.position as string) ?? "",
        department: (data.department as string) ?? "",
        salary: data.salary as number | undefined,
        avatarUrl: data.avatarUrl as string | undefined,
        hireDate: data.hireDate as string | undefined,
        status: ((data.status as string) ?? "active") as "active" | "inactive",
        createdAt: created?.toMillis(),
        updatedAt: updated?.toMillis(),
      };
    });
    list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    cb(list);
  }, (err) => {
    console.error("subscribeEmployees error:", err);
    cb([]);
  });
}

export async function createEmployee(data: Omit<Employee, "id" | "createdAt" | "updatedAt">, actor: string) {
  const ref = await addDoc(collection(db, EMP), {
    ...stripUndefined(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logActivity({ action: "create", employeeId: ref.id, employeeName: data.fullName, actorEmail: actor });
  return ref.id;
}

export async function updateEmployee(id: string, data: Partial<Employee>, actor: string) {
  await updateDoc(doc(db, EMP, id), { ...stripUndefined(data), updatedAt: serverTimestamp() });
  await logActivity({ action: "update", employeeId: id, employeeName: data.fullName ?? "", actorEmail: actor });
}

export async function deleteEmployee(id: string, name: string, actor: string) {
  await deleteDoc(doc(db, EMP, id));
  await logActivity({ action: "delete", employeeId: id, employeeName: name, actorEmail: actor });
}

async function logActivity(entry: Omit<ActivityLog, "id" | "timestamp">) {
  try {
    await addDoc(collection(db, LOG), { ...entry, timestamp: serverTimestamp() });
  } catch {
    // non-critical
  }
}

export function subscribeActivity(cb: (logs: ActivityLog[]) => void) {
  const q = query(collection(db, LOG));
  return onSnapshot(q, (snap) => {
    const list: ActivityLog[] = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      const ts = data.timestamp as Timestamp | undefined;
      return {
        id: d.id,
        action: data.action as ActivityLog["action"],
        employeeId: (data.employeeId as string) ?? "",
        employeeName: (data.employeeName as string) ?? "",
        actorEmail: (data.actorEmail as string) ?? "",
        timestamp: ts?.toMillis() ?? Date.now(),
      };
    });
    list.sort((a, b) => b.timestamp - a.timestamp);
    cb(list.slice(0, 100));
  }, (err) => {
    console.error("subscribeActivity error:", err);
    cb([]);
  });
}
