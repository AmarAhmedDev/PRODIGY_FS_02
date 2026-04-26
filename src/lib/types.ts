export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary?: number;
  avatarUrl?: string;
  hireDate?: string; // ISO
  status: "active" | "inactive";
  createdAt?: number;
  updatedAt?: number;
}

export interface ActivityLog {
  id: string;
  action: "create" | "update" | "delete";
  employeeId: string;
  employeeName: string;
  actorEmail: string;
  timestamp: number;
  details?: string;
}
