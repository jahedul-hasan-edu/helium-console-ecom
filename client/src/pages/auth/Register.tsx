import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Check, CreditCard, ShieldPlus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { AUTH_ROUTES, REGISTRATION_MODE } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { RegisterSuperAdminRequest, RegisterTenantAdminRequest } from "@/models/Auth";
import { usePublicSubscriptionPlans, useSystemStatus } from "@/hooks/use-Auth";

const registerSchema = z
  .object({
    planId: z.string().optional(),
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().email("Valid email is required"),
    mobile: z.string().trim().min(1, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const STEP_LABELS = ["Plan", "Details", "Security"] as const;

function formatPlan(price: string | null | undefined, durationDays: number | null | undefined): string {
  const currency = Number(price || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });

  if (!durationDays) {
    return currency;
  }

  return `${currency} / ${durationDays} day${durationDays === 1 ? "" : "s"}`;
}

function passwordStrength(password: string): { label: string; width: string } {
  if (password.length >= 10) {
    return { label: "Strong", width: "100%" };
  }
  if (password.length >= 8) {
    return { label: "Good", width: "70%" };
  }
  if (password.length >= 6) {
    return { label: "Fair", width: "45%" };
  }
  return { label: "Weak", width: "20%" };
}

export default function Register() {
  const [, navigate] = useLocation();
  const { register: registerAccount } = useAuth();
  const { data: systemStatus, isLoading: isLoadingStatus } = useSystemStatus();
  const { data: plans = [], isLoading: isLoadingPlans } = usePublicSubscriptionPlans();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      planId: "",
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const mode = systemStatus?.registrationMode || REGISTRATION_MODE.BOOTSTRAP;
  const isBootstrap = mode === REGISTRATION_MODE.BOOTSTRAP;
  const currentPassword = form.watch("password");
  const selectedPlanId = form.watch("planId");
  const strength = passwordStrength(currentPassword);

  const planOptions = useMemo(() => plans.filter((plan) => !!plan.id), [plans]);

  const nextStep = async () => {
    if (step === 0) {
      if (!selectedPlanId) {
        form.setError("planId", { message: "Please choose a subscription plan" });
        return;
      }
      setStep(1);
      return;
    }

    const isValid = await form.trigger(["firstName", "lastName", "email", "mobile"]);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      if (isBootstrap) {
        const payload: RegisterSuperAdminRequest = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          mobile: values.mobile,
          password: values.password,
          confirmPassword: values.confirmPassword,
          acceptTerms: values.acceptTerms,
        };
        await registerAccount(payload);
      } else {
        const payload: RegisterTenantAdminRequest = {
          planId: values.planId || "",
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          mobile: values.mobile,
          password: values.password,
          confirmPassword: values.confirmPassword,
          acceptTerms: values.acceptTerms,
        };
        await registerAccount(payload);
      }

      navigate(AUTH_ROUTES.ADMIN_HOME, { replace: true });
    } catch {
      // The API layer already surfaces auth failures via toast notifications.
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_35%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.45)_100%)] p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.18),_transparent_30%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.55)_100%)] p-6">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-border/60 bg-background/75 shadow-2xl shadow-orange-950/10 backdrop-blur-sm">
            <CardHeader className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  {isBootstrap ? <ShieldPlus className="h-7 w-7" /> : <Store className="h-7 w-7" />}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">Helium Easy Ecom</p>
                  <CardTitle className="mt-1 text-3xl font-semibold tracking-tight">
                    {isBootstrap ? "Create the first admin account" : "Start your store with confidence"}
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
                {isBootstrap
                  ? "You're creating the first admin account for Helium Easy Ecom. This account will have full system access."
                  : "Choose a subscription, create your tenant admin account, and land directly inside your workspace."}
              </CardDescription>
              {!isBootstrap ? (
                <div className="flex flex-wrap gap-3">
                  {STEP_LABELS.map((label, index) => (
                    <div
                      key={label}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
                        step === index
                          ? "border-primary bg-primary/10 text-primary"
                          : step > index
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                            : "border-border/70 text-muted-foreground"
                      )}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-semibold">
                        {step > index ? <Check className="h-4 w-4" /> : index + 1}
                      </span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={onSubmit}>
                {!isBootstrap && step === 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Choose Your Plan</h3>
                      <p className="text-sm text-muted-foreground">Select the subscription that matches the pace of your business.</p>
                    </div>
                    {isLoadingPlans ? (
                      <div className="flex items-center justify-center rounded-2xl border border-dashed p-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                      </div>
                    ) : planOptions.length === 0 ? (
                      <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                        No subscription plans available. Please contact the administrator.
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {planOptions.map((plan) => {
                          const isSelected = selectedPlanId === plan.id;
                          return (
                            <button
                              key={plan.id}
                              className={cn(
                                "rounded-3xl border p-5 text-left transition-all",
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                                  : "border-border/60 bg-background/50 hover:border-primary/40 hover:bg-primary/5"
                              )}
                              type="button"
                              onClick={() => {
                                form.clearErrors("planId");
                                form.setValue("planId", plan.id, { shouldValidate: true });
                              }}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-base font-semibold">{plan.name || "Plan"}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">{formatPlan(plan.price, plan.durationDays)}</p>
                                </div>
                                <div className={cn("rounded-full border p-2", isSelected ? "border-primary text-primary" : "border-border/70 text-muted-foreground")}>
                                  <CreditCard className="h-4 w-4" />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {form.formState.errors.planId ? (
                      <p className="text-sm text-destructive">{form.formState.errors.planId.message}</p>
                    ) : null}
                    <div className="flex justify-end">
                      <Button type="button" onClick={nextStep} disabled={planOptions.length === 0}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}

                {(isBootstrap || step === 1) ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" {...form.register("firstName")} />
                      {form.formState.errors.firstName ? <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" {...form.register("lastName")} />
                      {form.formState.errors.lastName ? <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p> : null}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" inputMode="email" placeholder="name@company.com" {...form.register("email")} />
                      {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="mobile">Phone</Label>
                      <Input id="mobile" placeholder="+1 555 123 4567" {...form.register("mobile")} />
                      {form.formState.errors.mobile ? <p className="text-sm text-destructive">{form.formState.errors.mobile.message}</p> : null}
                    </div>
                    {!isBootstrap ? (
                      <div className="sm:col-span-2 flex justify-between">
                        <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button type="button" onClick={nextStep}>
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {(isBootstrap || step === 2) ? (
                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Choose a secure password" {...form.register("password")} />
                        {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="Repeat your password" {...form.register("confirmPassword")} />
                        {form.formState.errors.confirmPassword ? <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p> : null}
                      </div>
                    </div>

                    <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/30 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Password strength</span>
                        <span className="text-muted-foreground">{strength.label}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: strength.width }} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                      <div className="flex items-start gap-3">
                        <Controller
                          control={form.control}
                          name="acceptTerms"
                          render={({ field }) => (
                            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium">I accept the terms and conditions</p>
                          <p className="text-sm text-muted-foreground">By creating an account, you agree to use Helium Easy Ecom responsibly.</p>
                        </div>
                      </div>
                      {form.formState.errors.acceptTerms ? <p className="mt-2 text-sm text-destructive">{form.formState.errors.acceptTerms.message}</p> : null}
                    </div>

                    <div className="flex justify-between">
                      {!isBootstrap ? (
                        <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                      ) : <span />}
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                          ? "Creating account..."
                          : isBootstrap
                            ? "Create Super Admin Account"
                            : "Create Account"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-orange-950/90 text-orange-50 shadow-2xl shadow-orange-950/20">
            <CardHeader className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200/80">Helium Easy Ecom</p>
              <CardTitle className="text-4xl font-semibold leading-tight">
                Manage tenants, products, orders, and growth from one console.
              </CardTitle>
              <CardDescription className="text-orange-100/80">
                Secure access, multi-tenant controls, subscription-aware onboarding, and a workspace built for commerce teams.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {[
                  "JWT auth with refresh rotation and optional 2FA",
                  "Tenant-aware onboarding with role-based page access",
                  "Responsive admin workspace for operations and merchandising",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/8 p-4">
                    <div className="mt-0.5 rounded-full bg-white/12 p-1.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-6 text-orange-50/90">{item}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/10 p-5">
                <p className="text-sm text-orange-100/75">Already have an account?</p>
                <Link href={AUTH_ROUTES.LOGIN}>
                  <a className="mt-2 inline-flex items-center text-sm font-semibold text-white underline-offset-4 hover:underline">
                    Go to sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}