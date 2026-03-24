import { useMemo, useState } from "react";
import { KeyRound, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/apiService";
import { TWO_FACTOR_METHOD } from "@/lib/auth";

interface TwoFactorSetupResponse {
  method: string;
  message?: string;
  qrCode?: string;
  secret?: string;
}

export default function MyAccount() {
  const { user, refreshUser } = useAuth();
  const [setupResponse, setSetupResponse] = useState<TwoFactorSetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const twoFactorLabel = useMemo(() => {
    if (!user?.twoFactorMethod) {
      return "Disabled";
    }

    if (user.twoFactorMethod === TWO_FACTOR_METHOD.EMAIL) {
      return user.twoFactorEnabled ? "Email OTP enabled" : "Email OTP pending";
    }

    return user.twoFactorEnabled ? "Authenticator enabled" : "Authenticator setup pending";
  }, [user?.twoFactorEnabled, user?.twoFactorMethod]);

  const startSetup = async (method: "email" | "app") => {
    setIsWorking(true);
    try {
      const response = await apiService.post<TwoFactorSetupResponse>(
        "/api/auth/2fa/setup",
        { method },
        { successMessage: method === "email" ? "Verification code sent" : "Authenticator setup started" }
      );
      setSetupResponse(response);
      setVerificationCode("");
    } finally {
      setIsWorking(false);
    }
  };

  const confirmSetup = async () => {
    setIsWorking(true);
    try {
      await apiService.post("/api/auth/2fa/verify-setup", { code: verificationCode }, { successMessage: "Two-factor authentication enabled" });
      await refreshUser();
      setSetupResponse(null);
      setVerificationCode("");
    } finally {
      setIsWorking(false);
    }
  };

  const sendDisableCode = async () => {
    if (user?.twoFactorMethod !== TWO_FACTOR_METHOD.EMAIL) {
      return;
    }

    setIsWorking(true);
    try {
      await apiService.post("/api/auth/2fa/setup", { method: TWO_FACTOR_METHOD.EMAIL }, { successMessage: "Disable code sent to your email" });
    } finally {
      setIsWorking(false);
    }
  };

  const disableTwoFactor = async () => {
    setIsWorking(true);
    try {
      await apiService.post("/api/auth/2fa/disable", { code: disableCode }, { successMessage: "Two-factor authentication disabled" });
      await refreshUser();
      setDisableCode("");
      setSetupResponse(null);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
        <p className="mt-1 text-muted-foreground">Review your account details and manage how two-factor authentication works for you.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your current identity and security posture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-lg font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-muted-foreground">{user?.roleName?.replace(/_/g, " ")}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /> {user?.email}</div>
              <div className="flex items-center gap-3"><Smartphone className="h-4 w-4 text-muted-foreground" /> {user?.mobile || "No mobile saved"}</div>
              <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-muted-foreground" /> <Badge variant={user?.twoFactorEnabled ? "default" : "secondary"}>{twoFactorLabel}</Badge></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>Use email OTP for faster rollout or an authenticator app for stronger protection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="email">
              <TabsList>
                <TabsTrigger value="email">Email OTP</TabsTrigger>
                <TabsTrigger value="app">Authenticator App</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <Alert>
                  <AlertTitle>Email OTP</AlertTitle>
                  <AlertDescription>A six-digit code will be emailed to you during sign-in and while enabling or disabling protection.</AlertDescription>
                </Alert>
                <Button onClick={() => void startSetup("email")} disabled={isWorking}>
                  {user?.twoFactorMethod === TWO_FACTOR_METHOD.EMAIL && user?.twoFactorEnabled ? "Re-send setup code" : "Enable with Email OTP"}
                </Button>
              </TabsContent>

              <TabsContent value="app" className="space-y-4">
                <Alert>
                  <AlertTitle>Authenticator App</AlertTitle>
                  <AlertDescription>Scan the QR code with Google Authenticator, Microsoft Authenticator, or any TOTP-compatible app.</AlertDescription>
                </Alert>
                <Button onClick={() => void startSetup("app")} disabled={isWorking}>
                  Start App Setup
                </Button>
              </TabsContent>
            </Tabs>

            {setupResponse && (
              <div className="space-y-4 rounded-xl border p-4">
                <div>
                  <p className="font-medium">Finish setup</p>
                  <p className="text-sm text-muted-foreground">
                    Enter the six-digit code from your {setupResponse.method === TWO_FACTOR_METHOD.EMAIL ? "email" : "authenticator app"}.
                  </p>
                </div>

                {setupResponse.qrCode && (
                  <div className="space-y-3">
                    <img alt="Authenticator QR code" className="w-48 rounded-lg border" src={setupResponse.qrCode} />
                    <p className="text-xs text-muted-foreground break-all">Secret: {setupResponse.secret}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="setup-code">Verification Code</Label>
                  <Input id="setup-code" inputMode="numeric" maxLength={6} value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} />
                </div>
                <Button onClick={() => void confirmSetup()} disabled={isWorking || verificationCode.length !== 6}>
                  Confirm Setup
                </Button>
              </div>
            )}

            {user?.twoFactorMethod && (
              <div className="space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div>
                  <p className="font-medium text-destructive">Disable two-factor authentication</p>
                  <p className="text-sm text-muted-foreground">
                    {user.twoFactorMethod === TWO_FACTOR_METHOD.EMAIL
                      ? "Request a disable code by email, then enter it below."
                      : "Enter a current authenticator code to disable protection."}
                  </p>
                </div>

                {user.twoFactorMethod === TWO_FACTOR_METHOD.EMAIL && (
                  <Button variant="outline" onClick={() => void sendDisableCode()} disabled={isWorking}>
                    Send Disable Code
                  </Button>
                )}

                <div className="space-y-2">
                  <Label htmlFor="disable-code">Disable Code</Label>
                  <Input id="disable-code" inputMode="numeric" maxLength={6} value={disableCode} onChange={(event) => setDisableCode(event.target.value)} />
                </div>
                <Button variant="destructive" onClick={() => void disableTwoFactor()} disabled={isWorking || disableCode.length !== 6}>
                  Disable 2FA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}