import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { AUTH_ROUTES, AUTH_STORAGE_KEYS } from "@/lib/auth";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await login(email, password);
      if ("requires2FA" in response) {
        sessionStorage.setItem(AUTH_STORAGE_KEYS.PENDING_TWO_FACTOR, JSON.stringify(response));
        navigate(AUTH_ROUTES.TWO_FACTOR_VERIFY);
        return;
      }

      navigate(AUTH_ROUTES.ADMIN_HOME, { replace: true });
    } catch {
      // The API layer already surfaces auth failures via toast notifications.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_35%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.45)_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-border/60 shadow-xl shadow-orange-950/5 backdrop-blur-sm">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Helium Easy Ecom</p>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Access your tenant workspace with your assigned account.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Link href={AUTH_ROUTES.FORGOT_PASSWORD}>
                  <a className="text-sm font-medium text-primary underline-offset-4 hover:underline">Forgot password?</a>
                </Link>
              </div>
              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href={AUTH_ROUTES.REGISTER}>
                  <a className="font-medium text-primary underline-offset-4 hover:underline">Register</a>
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}