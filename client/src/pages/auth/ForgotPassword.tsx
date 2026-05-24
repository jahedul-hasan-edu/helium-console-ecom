import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/lib/apiService";
import { AUTH_ROUTES } from "@/lib/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await apiService.post(
        "/api/auth/forgot-password",
        { email },
        {
          showSuccessToast: true,
          successMessage: "If this email exists, a password reset link has been sent.",
          showErrorToast: true,
        }
      );
      setIsSubmitted(true);
    } catch {
      // The API layer already surfaces failures via toast notifications.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2),_transparent_30%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.5)_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-border/60 shadow-xl shadow-amber-950/10 backdrop-blur-sm">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <MailCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Helium Easy Ecom</p>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                Enter your account email and we will send a secure reset link.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-sm text-emerald-800">
                  If the email exists in our system, a password reset link has been sent.
                </p>
                <Link href={AUTH_ROUTES.LOGIN}>
                  <a className="text-sm font-medium text-primary underline-offset-4 hover:underline">Back to sign in</a>
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <Button className="w-full" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Sending link..." : "Send reset link"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Remembered your password?{" "}
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
