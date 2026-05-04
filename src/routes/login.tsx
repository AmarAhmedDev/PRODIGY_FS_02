import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      toast.success("Welcome back");
      router.invalidate();
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      // sanitize firebase prefix
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/[^)]+\)\.?/, "").trim() || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden gradient-surface">
      <div className="pointer-events-none absolute inset-0 opacity-80" style={{ background: "var(--gradient-glow)" }} />
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl gradient-primary" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl gradient-primary" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-elevated">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="gradient-text">Employee Management System</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to your admin dashboard</p>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border bg-card/80 p-8 shadow-elevated backdrop-blur-xl"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="amar@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    disabled={submitting}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="12345678"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full gradient-primary text-primary-foreground shadow-glow hover:opacity-95 transition-smooth"
              >
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
                ) : (
                  "Sign in"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Authorized admin access only. All actions are logged.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
