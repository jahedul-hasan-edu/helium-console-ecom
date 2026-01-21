import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useUpdateTenantSubscription,
  useGetTenantSubscription,
} from "@/hooks/use-TenantSubscription";
import { useTenants } from "@/hooks/use-Tenant";
import { useSubscriptionPlans } from "@/hooks/use-SubscriptionPlan";
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TenantSubscriptionFormValidator } from "./formValidator";
import { BUTTON_LABELS, TENANT_SUBSCRIPTION_FORM } from "./index";
import { Switch } from "@/components/ui/switch";

interface EditTenantSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
}

export function EditTenantSubscriptionModal({
  isOpen,
  onClose,
  subscriptionId,
}: EditTenantSubscriptionModalProps) {
  const [tenantId, setTenantId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [planId, setPlanId] = useState("");
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [tenantSearch, setTenantSearch] = useState("");
  const [planSearch, setPlanSearch] = useState("");
  const [tenantOpen, setTenantOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  const { data: subscription } = useGetTenantSubscription(subscriptionId);
  const updateMutation = useUpdateTenantSubscription();

  // Fetch tenants with search
  const { data: tenantsData } = useTenants({
    search: tenantSearch,
    pageSize: 50,
  });

  // Fetch subscription plans with search
  const { data: plansData } = useSubscriptionPlans({
    search: planSearch,
    pageSize: 50,
  });

  const tenants = tenantsData?.items || [];
  const plans = plansData?.items || [];

  useEffect(() => {
    if (isOpen && subscription) {
      setTenantId(subscription.tenantId || "");
      setPlanId(subscription.planId || "");
      setStartDate(subscription.startDate || "");
      setEndDate(subscription.endDate || "");
      setIsActive(subscription.isActive ?? false);
      setValidationErrors([]);
      setTenantSearch("");
      setPlanSearch("");
    }
  }, [isOpen, subscription]);

  // Update tenant name when tenants are loaded
  useEffect(() => {
    if (tenantId && tenants.length > 0) {
      const tenant = tenants.find((t) => t.id === tenantId);
      if (tenant) {
        setTenantName(tenant.name || "");
      }
    }
  }, [tenants, tenantId]);

  // Update plan name when plans are loaded
  useEffect(() => {
    if (planId && plans.length > 0) {
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        setPlanName(plan.name || "");
      }
    }
  }, [plans, planId]);

  // Reactive validation
  useEffect(() => {
    const result = TenantSubscriptionFormValidator.validateUpdateTenantSubscription({
      tenantId,
      planId,
      startDate,
      endDate,
      isActive,
    });
    setValidationErrors(result.errors);
  }, [tenantId, planId, startDate, endDate, isActive]);

  const handleSubmit = async () => {
    const result = TenantSubscriptionFormValidator.validateUpdateTenantSubscription({
      tenantId,
      planId,
      startDate,
      endDate,
      isActive,
    });
    setValidationErrors(result.errors);

    if (!result.isValid) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: subscriptionId,
        tenantId,
        planId,
        startDate,
        endDate,
        isActive,
      });
      onClose();
    } catch (error) {
      console.error("Error updating tenant subscription:", error);
    }
  };

  const tenantIdError = getFieldError("tenantId", validationErrors);
  const planIdError = getFieldError("planId", validationErrors);
  const startDateError = getFieldError("startDate", validationErrors);
  const endDateError = getFieldError("endDate", validationErrors);

  const isFormValid =
    !tenantIdError &&
    !planIdError &&
    !startDateError &&
    !endDateError &&
    tenantId &&
    planId &&
    startDate &&
    endDate;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{TENANT_SUBSCRIPTION_FORM.MODALS.EDIT_TITLE}</DialogTitle>
          <DialogDescription>
            All fields are required. Update the information below to edit the tenant
            subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Tenant Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="tenantId">
              {TENANT_SUBSCRIPTION_FORM.LABELS.TENANT}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Popover open={tenantOpen} onOpenChange={setTenantOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={tenantOpen}
                  className={cn(
                    "w-full justify-between",
                    !tenantId && "text-muted-foreground",
                    tenantIdError && "border-red-500"
                  )}
                >
                  {tenantId ? tenantName : TENANT_SUBSCRIPTION_FORM.PLACEHOLDERS.TENANT}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[460px] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search tenant..."
                    value={tenantSearch}
                    onValueChange={setTenantSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No tenant found.</CommandEmpty>
                    <CommandGroup>
                      {tenants.map((tenant) => (
                        <CommandItem
                          key={tenant.id}
                          value={tenant.id}
                          onSelect={() => {
                            setTenantId(tenant.id);
                            setTenantName(tenant.name || "");
                            setTenantOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              tenantId === tenant.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {tenant.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {tenantIdError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{tenantIdError}</span>
              </div>
            )}
          </div>

          {/* Subscription Plan Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="planId">
              {TENANT_SUBSCRIPTION_FORM.LABELS.PLAN}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Popover open={planOpen} onOpenChange={setPlanOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={planOpen}
                  className={cn(
                    "w-full justify-between",
                    !planId && "text-muted-foreground",
                    planIdError && "border-red-500"
                  )}
                >
                  {planId ? planName : TENANT_SUBSCRIPTION_FORM.PLACEHOLDERS.PLAN}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[460px] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search subscription plan..."
                    value={planSearch}
                    onValueChange={setPlanSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No subscription plan found.</CommandEmpty>
                    <CommandGroup>
                      {plans.map((plan) => (
                        <CommandItem
                          key={plan.id}
                          value={plan.id}
                          onSelect={() => {
                            setPlanId(plan.id);
                            setPlanName(plan.name || "");
                            setPlanOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              planId === plan.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {plan.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {planIdError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{planIdError}</span>
              </div>
            )}
          </div>

          {/* Start Date */}
          <div className="grid gap-2">
            <Label htmlFor="startDate">
              {TENANT_SUBSCRIPTION_FORM.LABELS.START_DATE}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={cn(startDateError && "border-red-500")}
            />
            {startDateError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{startDateError}</span>
              </div>
            )}
          </div>

          {/* End Date */}
          <div className="grid gap-2">
            <Label htmlFor="endDate">
              {TENANT_SUBSCRIPTION_FORM.LABELS.END_DATE}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={cn(endDateError && "border-red-500")}
            />
            {endDateError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{endDateError}</span>
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">
              {TENANT_SUBSCRIPTION_FORM.LABELS.IS_ACTIVE}
            </Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {BUTTON_LABELS.CANCEL}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || updateMutation.isPending}
          >
            {updateMutation.isPending ? "Updating..." : BUTTON_LABELS.UPDATE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
