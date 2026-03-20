import { FormEvent, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { AUTH_ROUTES, AUTH_STORAGE_KEYS, TWO_FACTOR_METHOD } from "@/lib/auth";

export default function TwoFactorVerify() {
  const [, navigate] = useLocation();
  const { verifyTwoFactor } = useAuth();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingData = useMemo(() => {
    const rawValue = sessionStorage.getItem(AUTH_STORAGE_KEYS.PENDING_TWO_FACTOR);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as { tempToken: string; method: string };
    } catch {
      return null;
    }
  }, []);

  if (!pendingData) {
    navigate(AUTH_ROUTES.LOGIN, { replace: true });
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== 6) {
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyTwoFactor(pendingData.tempToken, code);
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_TWO_FACTOR);
      navigate(AUTH_ROUTES.ADMIN_HOME, { replace: true });
    } catch {
      // The API layer already surfaces auth failures via toast notifications.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.45)_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-border/60 shadow-xl shadow-sky-950/5 backdrop-blur-sm">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Helium Easy Ecom</p>
              <CardTitle>Two-Factor Verification</CardTitle>
              <CardDescription>
                Enter the 6-digit code from your {pendingData.method === TWO_FACTOR_METHOD.EMAIL ? "email" : "authenticator app"}.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button className="w-full" disabled={isSubmitting || code.length !== 6} type="submit">
                {isSubmitting ? "Verifying..." : "Verify"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}