import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, HeartPulse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { apiClient, type User } from "@/lib/api";

interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    usernameOrEmail: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await apiClient.login({
        username_or_email: credentials.usernameOrEmail,
        password: credentials.password,
      });

      const identity = credentials.usernameOrEmail.trim();
      const derivedName = identity.includes("@")
        ? identity.split("@")[0]
        : identity;

      // Call the onLogin callback with user data
      onLogin({
        id: derivedName || "1",
        name: derivedName || "User",
        email: identity.includes("@")
          ? identity
          : `${derivedName || "user"}@company.com`,
        role: data.role || "user",
        organization: "Organization",
      });

      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md group-hover:blur-lg transition-all" />
              <div className="relative rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2.5 shadow-lg">
                <HeartPulse className="size-5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Sync Health
            </span>
          </Link>
          <ModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your HR dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username_or_email">Email or username</Label>
                <Input
                  id="username_or_email"
                  type="text"
                  placeholder="you@company.com"
                  value={credentials.usernameOrEmail}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      usernameOrEmail: e.target.value,
                    }))
                  }
                  className="bg-muted/30 placeholder:text-black/50"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="pr-10 bg-muted/30 placeholder:text-black/50"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Demo credentials:</p>
              <p className="font-mono text-xs mt-1">
                jennie@chowstack.ng / ChangeMe!2026
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
