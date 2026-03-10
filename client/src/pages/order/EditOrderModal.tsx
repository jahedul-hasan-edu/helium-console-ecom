import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { useTenants } from "@/hooks/use-Tenant";
import { Order, UpdateOrderRequest } from "@/models/Order";
import {
  BUTTON_LABELS,
  EMPTY_ORDER_FORM,
  formatOrderStatusLabel,
  ORDER_FORM,
  ORDER_STATUS_OPTIONS,
  OrderFormValues,
} from "@/pages/order";
import { FormValidator } from "@/pages/order/formValidator";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
  isLoading: boolean;
  onSubmit: (data: UpdateOrderRequest) => Promise<void>;
}

const basicFieldConfig: Array<{
  key: keyof Pick<OrderFormValues, "email" | "mobile" | "deliveryTime" | "timeZone">;
  label: string;
  placeholder: string;
  type?: "text" | "email";
}> = [
  { key: "email", label: ORDER_FORM.EMAIL_LABEL, placeholder: ORDER_FORM.EMAIL_PLACEHOLDER, type: "email" },
  { key: "mobile", label: ORDER_FORM.MOBILE_LABEL, placeholder: ORDER_FORM.MOBILE_PLACEHOLDER },
  {
    key: "deliveryTime",
    label: ORDER_FORM.DELIVERY_TIME_LABEL,
    placeholder: ORDER_FORM.DELIVERY_TIME_PLACEHOLDER,
  },
  { key: "timeZone", label: ORDER_FORM.TIME_ZONE_LABEL, placeholder: ORDER_FORM.TIME_ZONE_PLACEHOLDER },
];

function mapOrderToFormValues(order?: Order): OrderFormValues {
  if (!order) {
    return EMPTY_ORDER_FORM;
  }

  return {
    tenantId: order.tenantId || "",
    status: order.status || ORDER_STATUS_OPTIONS[0].value,
    address: order.address || "",
    mobile: order.mobile || "",
    email: order.email || "",
    deliveryTime: order.deliveryTime || "",
    timeZone: order.timeZone || "",
    reusableBag: order.reusableBag === true,
  };
}

export function EditOrderModal({ isOpen, onClose, order, isLoading, onSubmit }: EditOrderModalProps) {
  const [formData, setFormData] = useState<OrderFormValues>(EMPTY_ORDER_FORM);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({ pageSize: 1000 });

  useEffect(() => {
    if (!order || !isOpen) {
      return;
    }

    setFormData(mapOrderToFormValues(order));
    setErrors([]);
  }, [order, isOpen]);

  const statusOptions = useMemo(() => {
    if (!formData.status) {
      return ORDER_STATUS_OPTIONS;
    }

    const hasStatus = ORDER_STATUS_OPTIONS.some((status) => status.value === formData.status);
    if (hasStatus) {
      return ORDER_STATUS_OPTIONS;
    }

    return [
      { value: formData.status, label: formatOrderStatusLabel(formData.status) },
      ...ORDER_STATUS_OPTIONS,
    ];
  }, [formData.status]);

  const setFieldValue = (field: keyof OrderFormValues, value: string | boolean) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
    setErrors((previous) => previous.filter((error) => error.field !== field));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validation = FormValidator.validateUpdateOrder(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit({
        ...formData,
      });

      onClose();
    } catch {
      // Mutation toasts handle the visible error state.
    }
  };

  if (!order) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>
            Review the order information and update its status or delivery details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{ORDER_FORM.TENANT_LABEL}</Label>
              <Select
                value={formData.tenantId}
                disabled={isLoading || tenantsLoading}
                onValueChange={(value) => setFieldValue("tenantId", value)}
              >
                <SelectTrigger className={getFieldError("tenantId", errors) ? "border-destructive focus:ring-destructive" : ""}>
                  <SelectValue placeholder={ORDER_FORM.TENANT_PLACEHOLDER} />
                </SelectTrigger>
                <SelectContent>
                  {tenantsData?.items?.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError("tenantId", errors) ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{getFieldError("tenantId", errors)}</span>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">{ORDER_FORM.STATUS_LABEL}</Label>
              <Select
                value={formData.status}
                disabled={isLoading}
                onValueChange={(value) => setFieldValue("status", value)}
              >
                <SelectTrigger className={getFieldError("status", errors) ? "border-destructive focus:ring-destructive" : ""}>
                  <SelectValue placeholder={ORDER_FORM.STATUS_PLACEHOLDER} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError("status", errors) ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{getFieldError("status", errors)}</span>
                </div>
              ) : null}
            </div>

            {basicFieldConfig.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                </Label>
                <Input
                  id={field.key}
                  type={field.type || "text"}
                  value={formData[field.key]}
                  disabled={isLoading}
                  placeholder={field.placeholder}
                  className={getFieldError(field.key, errors) ? "border-destructive focus:ring-destructive" : ""}
                  onChange={(event) => setFieldValue(field.key, event.target.value)}
                />
                {getFieldError(field.key, errors) ? (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError(field.key, errors)}</span>
                  </div>
                ) : null}
              </div>
            ))}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-sm font-medium">
                {ORDER_FORM.ADDRESS_LABEL}
              </Label>
              <Textarea
                id="address"
                rows={4}
                value={formData.address}
                disabled={isLoading}
                placeholder={ORDER_FORM.ADDRESS_PLACEHOLDER}
                className={getFieldError("address", errors) ? "border-destructive focus:ring-destructive" : ""}
                onChange={(event) => setFieldValue("address", event.target.value)}
              />
              {getFieldError("address", errors) ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{getFieldError("address", errors)}</span>
                </div>
              ) : null}
            </div>

            {order.createdOn ? (
              <div className="rounded-xl border bg-muted/20 px-4 py-3 text-xs text-muted-foreground md:col-span-2">
                <p>Created: {new Date(order.createdOn).toLocaleString()}</p>
                {order.updatedOn ? <p>Updated: {new Date(order.updatedOn).toLocaleString()}</p> : null}
              </div>
            ) : null}

            <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3 md:col-span-2">
              <div>
                <Label htmlFor="reusableBag" className="text-sm font-medium">
                  {ORDER_FORM.REUSABLE_BAG_LABEL}
                </Label>
                <p className="text-xs text-muted-foreground">{ORDER_FORM.REUSABLE_BAG_HELPER}</p>
              </div>
              <Switch
                id="reusableBag"
                checked={formData.reusableBag}
                disabled={isLoading}
                onCheckedChange={(checked) => setFieldValue("reusableBag", checked)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" disabled={isLoading} onClick={onClose}>
              {BUTTON_LABELS.CANCEL}
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {BUTTON_LABELS.UPDATE_ORDER}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}