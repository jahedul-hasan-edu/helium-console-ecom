import { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { usePagePermissions, useUpdatePagePermissions } from "@/hooks/use-PagePermission";
import { useCreateRole, useRoles, useUpdateRole } from "@/hooks/use-Role";
import { getAdminIcon } from "@/lib/adminIcons";
import type { PagePermissionEntry } from "@/models/PagePermission";
import type { CreateRoleRequest } from "@/models/Role";

const visiblePermissionKeys = ["canView", "canCreate", "canUpdate", "canDelete"] as const;
const emptyRoleForm: CreateRoleRequest = {
  displayName: "",
  description: "",
  isActive: true,
};

type VisiblePermissionKey = (typeof visiblePermissionKeys)[number];

function sortEntries(entries: PagePermissionEntry[]) {
  return [...entries].sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
}

function getVisiblePermissionCount(entry: PagePermissionEntry) {
  return visiblePermissionKeys.filter((permissionKey) => entry[permissionKey]).length;
}

function getCheckedState(allChecked: boolean, partiallyChecked: boolean): boolean | "indeterminate" {
  if (allChecked) {
    return true;
  }

  if (partiallyChecked) {
    return "indeterminate";
  }

  return false;
}

function areEntriesEqual(left: PagePermissionEntry[], right: PagePermissionEntry[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function deriveEnabled(entry: PagePermissionEntry) {
  return visiblePermissionKeys.some((permissionKey) => entry[permissionKey]) || entry.canPreview || (entry.scopes?.length ?? 0) > 0;
}

export function UserSettingsPermissions() {
  const { isSuperAdmin, selectedTenantId } = useAuth();
  const tenantScoped = !isSuperAdmin || !!selectedTenantId;
  const { data: roles = [], isLoading: rolesLoading } = useRoles(selectedTenantId, tenantScoped);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [entries, setEntries] = useState<PagePermissionEntry[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState<CreateRoleRequest>(emptyRoleForm);

  const { data, isLoading } = usePagePermissions(selectedRoleId || null, selectedTenantId, tenantScoped && !!selectedRoleId);
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const updatePermissionsMutation = useUpdatePagePermissions(selectedRoleId || null, selectedTenantId);

  useEffect(() => {
    if (selectedRoleId && !roles.some((role) => role.id === selectedRoleId)) {
      setSelectedRoleId("");
    }
  }, [roles, selectedRoleId]);

  useEffect(() => {
    setEntries(sortEntries(data?.pages || []));
  }, [data]);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );
  const roleSelectValue = selectedRoleId || "__none__";
  const isTenantAdminRole = data?.role.name === "tenant_admin";
  const activeEntries = useMemo(() => entries.filter((entry) => entry.isActive), [entries]);
  const dirty = useMemo(() => !areEntriesEqual(entries, sortEntries(data?.pages || [])), [data?.pages, entries]);

  const openCreateDialog = () => {
    setEditingRoleId(null);
    setRoleForm(emptyRoleForm);
    setIsRoleDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!selectedRole) {
      return;
    }

    setEditingRoleId(selectedRole.id);
    setRoleForm({
      displayName: selectedRole.displayName,
      description: selectedRole.description || "",
      isActive: selectedRole.isActive,
    });
    setIsRoleDialogOpen(true);
  };

  const closeRoleDialog = () => {
    setIsRoleDialogOpen(false);
    setEditingRoleId(null);
    setRoleForm(emptyRoleForm);
  };

  const updateEntry = (pageId: string, updater: (entry: PagePermissionEntry) => PagePermissionEntry) => {
    setEntries((current) => current.map((entry) => (entry.id === pageId ? updater(entry) : entry)));
  };

  const updateEntries = (updater: (entry: PagePermissionEntry) => PagePermissionEntry) => {
    setEntries((current) => current.map(updater));
  };

  const getColumnCheckedState = (permissionKey: VisiblePermissionKey) => {
    const checkedCount = activeEntries.filter((entry) => entry[permissionKey]).length;
    return getCheckedState(activeEntries.length > 0 && checkedCount === activeEntries.length, checkedCount > 0 && checkedCount < activeEntries.length);
  };

  const handleRowToggle = (pageId: string, checked: boolean) => {
    updateEntry(pageId, (entry) => {
      if (!entry.isActive) {
        return entry;
      }

      return {
        ...entry,
        canView: checked,
        canCreate: checked,
        canUpdate: checked,
        canDelete: checked,
      };
    });
  };

  const handlePermissionToggle = (pageId: string, permissionKey: VisiblePermissionKey, checked: boolean) => {
    updateEntry(pageId, (entry) => {
      if (!entry.isActive) {
        return entry;
      }

      return {
        ...entry,
        [permissionKey]: checked,
      };
    });
  };

  const handleColumnToggle = (permissionKey: VisiblePermissionKey, checked: boolean) => {
    updateEntries((entry) => {
      if (!entry.isActive) {
        return entry;
      }

      return {
        ...entry,
        [permissionKey]: checked,
      };
    });
  };

  const handleRoleSubmit = async () => {
    const payload = {
      displayName: roleForm.displayName.trim(),
      description: roleForm.description?.trim() || "",
      isActive: !!roleForm.isActive,
    };

    if (!payload.displayName) {
      return;
    }

    if (editingRoleId) {
      await updateRoleMutation.mutateAsync({ id: editingRoleId, ...payload });
    } else {
      await createRoleMutation.mutateAsync(payload);
    }

    closeRoleDialog();
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      return;
    }

    const response = await updatePermissionsMutation.mutateAsync({
      entries: entries.map((entry) => ({
        pageId: entry.id,
        enabled: deriveEnabled(entry),
        canView: entry.canView,
        canCreate: entry.canCreate,
        canUpdate: entry.canUpdate,
        canDelete: entry.canDelete,
        canPreview: entry.canPreview,
        scopes: entry.scopes || [],
      })),
    });

    setEntries(sortEntries(response.pages));
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="gap-4 border-b bg-muted/20">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-1">
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Select a role, review the page matrix, and save CRUD access without changing the existing backend contract.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 xl:max-w-[640px]">
              <Select value={roleSelectValue} onValueChange={(value) => setSelectedRoleId(value === "__none__" ? "" : value)}>
                <SelectTrigger className="w-[240px] bg-background">
                  <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select a role"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No role selected</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>{role.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Edit role"
                disabled={!selectedRoleId || rolesLoading}
                onClick={openEditDialog}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Add role"
                disabled={!!selectedRoleId || createRoleMutation.isPending || updateRoleMutation.isPending}
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                className="gap-2"
                disabled={!selectedRoleId || !dirty || updatePermissionsMutation.isPending}
                onClick={() => void handleSave()}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table className="min-w-[760px] [&_td]:align-middle [&_th]:align-middle">
              <TableHeader>
                <TableRow className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                  <TableHead className="sticky left-0 top-0 z-20 min-w-[320px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    Page
                  </TableHead>
                  {visiblePermissionKeys.map((permissionKey) => (
                    <TableHead key={permissionKey} className="sticky top-0 z-10 w-[110px] bg-background/95 text-center backdrop-blur supports-[backdrop-filter]:bg-background/80">
                      <div className="flex flex-col items-center gap-2 whitespace-nowrap">
                        <span>{permissionKey.replace(/^can/, "")}</span>
                        <Checkbox
                          checked={getColumnCheckedState(permissionKey)}
                          disabled={!selectedRoleId || activeEntries.length === 0 || isTenantAdminRole || updatePermissionsMutation.isPending}
                          onCheckedChange={(checked) => handleColumnToggle(permissionKey, checked === true)}
                        />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">Loading page permissions...</TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">No roles found for the current tenant.</TableCell>
                  </TableRow>
                ) : !selectedRoleId ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">Select a role to load its page permissions.</TableCell>
                  </TableRow>
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">No page permissions are available for this role.</TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => {
                    const Icon = getAdminIcon(entry.icon);
                    const permissionCount = getVisiblePermissionCount(entry);
                    const rowCheckedState = getCheckedState(permissionCount === visiblePermissionKeys.length, permissionCount > 0 && permissionCount < visiblePermissionKeys.length);

                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="sticky left-0 z-[1] min-w-[320px] bg-background">
                          <div className="flex items-start gap-3 py-1">
                            <Checkbox
                              checked={rowCheckedState}
                              className="mt-2"
                              disabled={!entry.isActive || updatePermissionsMutation.isPending}
                              onCheckedChange={(checked) => handleRowToggle(entry.id, checked === true)}
                            />
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground">{entry.title}</span>
                                {entry.isSystem && <Badge variant="outline">System</Badge>}
                                {!entry.isActive && <Badge variant="secondary">Inactive</Badge>}
                              </div>
                              <p className="truncate text-xs text-muted-foreground">{entry.routePath}</p>
                            </div>
                          </div>
                        </TableCell>

                        {visiblePermissionKeys.map((permissionKey) => (
                          <TableCell key={permissionKey} className="text-center">
                            <Checkbox
                              checked={entry[permissionKey]}
                              disabled={!entry.isActive || !selectedRoleId || isTenantAdminRole || updatePermissionsMutation.isPending}
                              onCheckedChange={(checked) => handlePermissionToggle(entry.id, permissionKey, checked === true)}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isRoleDialogOpen} onOpenChange={(open) => {
        if (!open) {
          closeRoleDialog();
          return;
        }

        setIsRoleDialogOpen(true);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoleId ? "Edit Role" : "Create Role"}</DialogTitle>
            <DialogDescription>
              {selectedRole?.isSystem && editingRoleId
                ? "Built-in roles stay read-only. Select a custom role if you need to rename or deactivate it."
                : "Roles become available immediately in user assignment and permission workflows."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-settings-role-name">Display Name</Label>
              <Input
                id="user-settings-role-name"
                value={roleForm.displayName}
                disabled={!!selectedRole?.isSystem && !!editingRoleId}
                onChange={(event) => setRoleForm((current) => ({ ...current, displayName: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-settings-role-description">Description</Label>
              <Textarea
                id="user-settings-role-description"
                rows={4}
                value={roleForm.description || ""}
                disabled={!!selectedRole?.isSystem && !!editingRoleId}
                onChange={(event) => setRoleForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Inactive roles stay hidden from new user assignment.</p>
              </div>
              <Switch
                checked={!!roleForm.isActive}
                disabled={!!selectedRole?.isSystem && !!editingRoleId}
                onCheckedChange={(checked) => setRoleForm((current) => ({ ...current, isActive: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeRoleDialog}>Cancel</Button>
            <Button
              onClick={() => void handleRoleSubmit()}
              disabled={
                createRoleMutation.isPending ||
                updateRoleMutation.isPending ||
                !roleForm.displayName.trim() ||
                (!!selectedRole?.isSystem && !!editingRoleId)
              }
            >
              {editingRoleId ? "Save Role" : "Create Role"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}