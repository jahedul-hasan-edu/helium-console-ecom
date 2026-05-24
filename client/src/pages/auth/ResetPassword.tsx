import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/lib/apiService";
import { AUTH_ROUTES } from "@/lib/auth";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    setIsSubmitting(true);

    try {
      await apiService.post(
        "/api/auth/reset-password",
        {
          token,
          password,
          confirmPassword,
        },
        {
          showSuccessToast: true,
          successMessage: "Password has been reset successfully",
          showErrorToast: true,
        }
      );
      setIsCompleted(true);
      setTimeout(() => navigate(AUTH_ROUTES.LOGIN, { replace: true }), 800);
    } catch {
      // The API layer already surfaces failures via toast notifications.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.5)_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-border/60 shadow-xl shadow-sky-950/10 backdrop-blur-sm">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Helium Easy Ecom</p>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Create a new password for your account.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="space-y-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">This reset link is invalid or missing.</p>
                <Link href={AUTH_ROUTES.FORGOT_PASSWORD}>
                  <a className="text-sm font-medium text-primary underline-offset-4 hover:underline">Request a new reset link</a>
                </Link>
              </div>
            ) : isCompleted ? (
              <div className="space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-sm text-emerald-800">Password reset complete. Redirecting to sign in...</p>
                <Link href={AUTH_ROUTES.LOGIN}>
                  <a className="text-sm font-medium text-primary underline-offset-4 hover:underline">Go to sign in now</a>
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter a new password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat the new password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
                <Button className="w-full" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Updating password..." : "Reset password"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Back to{" "}
                  <Link href={AUTH_ROUTES.LOGIN}>
                    <a className="font-medium text-primary underline-offset-4 hover:underline">Sign in</a>
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
