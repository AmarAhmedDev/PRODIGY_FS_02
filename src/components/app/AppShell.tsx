import { type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Activity,
  LogOut,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/activity", label: "Activity", icon: Activity },
] as const;

export function AppShell({ children, title, subtitle, actions }: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { user, signOutUser } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = async () => {
    await signOutUser();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  const initial = (user?.email ?? "A").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-lg font-bold gradient-text leading-none">EMS</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Admin Console</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace
          </div>
          {NAV.map((item) => {
            const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-primary")} />
                <span>{item.label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <Avatar className="h-9 w-9 ring-2 ring-primary/30">
              <AvatarImage src={user?.photoURL ?? undefined} alt={user?.email ?? "Admin"} />
              <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user?.email ?? "Admin"}</div>
              <div className="text-xs text-muted-foreground">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-xl md:text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2">
          {NAV.map((item) => {
            const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-smooth",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
