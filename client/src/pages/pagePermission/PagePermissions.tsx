import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Save, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { usePagePermissions, useUpdatePagePermissions } from "@/hooks/use-PagePermission";
import { useCreateRole, useDeleteRole, useRoles, useUpdateRole } from "@/hooks/use-Role";
import type { CreateRoleRequest } from "@/models/Role";
import type { PagePermissionEntry } from "@/models/PagePermission";

const emptyRoleForm: CreateRoleRequest = {
  displayName: "",
  description: "",
  isActive: true,
};

const permissionKeys = ["canView", "canCreate", "canUpdate", "canDelete", "canPreview"] as const;

function getPredefinedScopes(slug: string): string[] {
  return [`read:${slug}`, `write:${slug}`, `manage:${slug}`];
}

function getDefaultFullScopes(slug: string): string[] {
  return [`read:${slug}`, `manage:${slug}`];
}

function isEntryFullySelected(entry: PagePermissionEntry) {
  return entry.enabled && permissionKeys.every((permissionKey) => entry[permissionKey]);
}

export default function PagePermissions() {
  const { isSuperAdmin, selectedTenantId } = useAuth();
  const tenantScoped = !isSuperAdmin || !!selectedTenantId;
  const { data: roles = [], isLoading: rolesLoading } = useRoles(selectedTenantId, tenantScoped);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [preferredRoleId, setPreferredRoleId] = useState<string | null>(null);
  const { data, isLoading } = usePagePermissions(selectedRoleId, selectedTenantId, tenantScoped && !!selectedRoleId);
  const [entries, setEntries] = useState<PagePermissionEntry[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState<CreateRoleRequest>(emptyRoleForm);
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const updateMutation = useUpdatePagePermissions(selectedRoleId, selectedTenantId);
  const [scopeTargetPageId, setScopeTargetPageId] = useState<string | null>(null);

  useEffect(() => {
    if (roles.length === 0) {
      if (selectedRoleId !== null) {
        setSelectedRoleId(null);
      }
      if (preferredRoleId !== null) {
        setPreferredRoleId(null);
      }
      return;
    }

    if (preferredRoleId && roles.some((role) => role.id === preferredRoleId)) {
      if (selectedRoleId !== preferredRoleId) {
        setSelectedRoleId(preferredRoleId);
      }
      setPreferredRoleId(null);
      return;
    }

    if (selectedRoleId && roles.some((role) => role.id === selectedRoleId)) {
      return;
    }

    const defaultRole = roles.find((role) => !role.isSystem) ?? roles[0];
    if (defaultRole && selectedRoleId !== defaultRole.id) {
      setSelectedRoleId(defaultRole.id);
    }
  }, [preferredRoleId, roles, selectedRoleId]);

  useEffect(() => {
    setEntries(data?.pages || []);
  }, [data]);

  useEffect(() => {
    if (!entries.length) {
      setScopeTargetPageId(null);
      return;
    }

    if (scopeTargetPageId && entries.some((entry) => entry.id === scopeTargetPageId)) {
      return;
    }

    setScopeTargetPageId(entries[0].id);
  }, [entries, scopeTargetPageId]);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );
  const isTenantAdminRole = data?.role.name === "tenant_admin";
  const canEditSelectedRole = !!selectedRole && !selectedRole.isSystem;
  const canDeleteSelectedRole = !!selectedRole && !selectedRole.isSystem;
  const isRoleMutationPending = createRoleMutation.isPending || updateRoleMutation.isPending;
  const dirty = useMemo(() => JSON.stringify(entries) !== JSON.stringify(data?.pages || []), [data?.pages, entries]);
  const selectableEntries = useMemo(() => entries.filter((entry) => entry.isActive), [entries]);
  const allEnabledSelected = selectableEntries.length > 0 && selectableEntries.every((entry) => entry.enabled);
  const allPermissionsSelected = selectableEntries.length > 0 && selectableEntries.every(isEntryFullySelected);
  const scopeTargetEntry = useMemo(
    () => entries.find((entry) => entry.id === scopeTargetPageId) || null,
    [entries, scopeTargetPageId]
  );
  const availableScopesForTarget = useMemo(
    () => (scopeTargetEntry ? getPredefinedScopes(scopeTargetEntry.slug) : []),
    [scopeTargetEntry]
  );

  const getColumnCheckedState = (permissionKey: typeof permissionKeys[number]) =>
    selectableEntries.length > 0 && selectableEntries.every((entry) => entry.enabled && entry[permissionKey]);

  const applyEntryUpdates = (entry: PagePermissionEntry, updates: Partial<PagePermissionEntry>): PagePermissionEntry => {
    const next = { ...entry, ...updates };

    if (!entry.isActive) {
      return {
        ...next,
        enabled: false,
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canPreview: false,
        scopes: [],
      };
    }

    if (!next.enabled) {
      return {
        ...next,
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canPreview: false,
        scopes: [],
      };
    }

    if (!isTenantAdminRole && (next.canCreate || next.canUpdate || next.canDelete || next.canPreview)) {
      next.canView = true;
    }

    if (isTenantAdminRole) {
      return {
        ...next,
        canView: next.enabled,
        canCreate: next.enabled,
        canUpdate: next.enabled,
        canDelete: next.enabled,
        canPreview: next.enabled,
      };
    }

    return next;
  };

  const openCreateRoleDialog = () => {
    setEditingRoleId(null);
    setRoleForm(emptyRoleForm);
    setIsRoleDialogOpen(true);
  };

  const openEditRoleDialog = () => {
    if (!selectedRole || selectedRole.isSystem) {
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

  const updateEntry = (pageId: string, updates: Partial<PagePermissionEntry>) => {
    setEntries((current) =>
      current.map((entry) => (entry.id === pageId ? applyEntryUpdates(entry, updates) : entry))
    );
  };

  const updateAllEntries = (updates: Partial<PagePermissionEntry>) => {
    setEntries((current) => current.map((entry) => applyEntryUpdates(entry, updates)));
  };

  const updatePermissionColumn = (permissionKey: typeof permissionKeys[number], checked: boolean) => {
    setEntries((current) =>
      current.map((entry) => {
        if (!entry.isActive || isTenantAdminRole) {
          return entry;
        }

        return applyEntryUpdates(entry, {
          enabled: checked ? true : entry.enabled,
          [permissionKey]: checked,
        } as Partial<PagePermissionEntry>);
      })
    );
  };

  const updateEntryAllPermissions = (pageId: string, checked: boolean) => {
    updateEntry(pageId, {
      enabled: checked,
      canView: checked,
      canCreate: checked,
      canUpdate: checked,
      canDelete: checked,
      canPreview: checked,
      scopes: checked
        ? (() => {
            const target = entries.find((entry) => entry.id === pageId);
            return target ? getDefaultFullScopes(target.slug) : [];
          })()
        : [],
    });
  };

  const grantAllPermissionsWithScopes = () => {
    setEntries((current) =>
      current.map((entry) =>
        applyEntryUpdates(entry, {
          enabled: true,
          canView: true,
          canCreate: true,
          canUpdate: true,
          canDelete: true,
          canPreview: true,
          scopes: getDefaultFullScopes(entry.slug),
        })
      )
    );
  };

  const toggleScope = (pageId: string, scope: string) => {
    setEntries((current) =>
      current.map((entry) => {
        if (entry.id !== pageId) {
          return entry;
        }

        const existingScopes = entry.scopes || [];
        const nextScopes = existingScopes.includes(scope)
          ? existingScopes.filter((item) => item !== scope)
          : [...existingScopes, scope];

        return applyEntryUpdates(entry, {
          enabled: nextScopes.length > 0 ? true : entry.enabled,
          scopes: nextScopes,
        });
      })
    );
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

    const savedRole = editingRoleId
      ? await updateRoleMutation.mutateAsync({ id: editingRoleId, ...payload })
      : await createRoleMutation.mutateAsync(payload);

    setPreferredRoleId(savedRole.id);
    setSelectedRoleId(savedRole.id);

    closeRoleDialog();
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      entries: entries.map((entry) => ({
        pageId: entry.id,
        enabled: entry.enabled,
        canView: entry.canView,
        canCreate: entry.canCreate,
        canUpdate: entry.canUpdate,
        canDelete: entry.canDelete,
        canPreview: entry.canPreview,
        scopes: entry.scopes || [],
      })),
    });

    setEntries(response.pages);
  };

  const handleDeleteSelectedRole = async () => {
    if (!selectedRole || selectedRole.isSystem) {
      return;
    }

    const deletedRoleId = selectedRole.id;
    await deleteRoleMutation.mutateAsync(deletedRoleId);
    setSelectedRoleId((current) => (current === deletedRoleId ? null : current));
    setPreferredRoleId(null);
  };

  if (!tenantScoped) {
    return (
      <Alert>
        <AlertTitle>Select a tenant first</AlertTitle>
        <AlertDescription>
          Page permissions are always applied inside a tenant. Choose a tenant from the header dropdown first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Page Permissions</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedRoleId || undefined} onValueChange={setSelectedRoleId}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select a role"} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>{role.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            variant="outline"
            disabled={!canEditSelectedRole || isRoleMutationPending}
            onClick={openEditRoleDialog}
            aria-label="Edit selected role"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            disabled={!canDeleteSelectedRole || deleteRoleMutation.isPending}
            onClick={() => void handleDeleteSelectedRole()}
            aria-label="Delete selected role"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={openCreateRoleDialog}
            disabled={isRoleMutationPending}
            aria-label="Create role"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            disabled={entries.length === 0 || updateMutation.isPending}
            onClick={grantAllPermissionsWithScopes}
          >
            Permission All
          </Button>
          <Button className="gap-2" disabled={!dirty || updateMutation.isPending || !selectedRoleId} onClick={() => void handleSave()}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scope Picker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Label className="min-w-32">Target page</Label>
            <Select value={scopeTargetPageId || undefined} onValueChange={setScopeTargetPageId}>
              <SelectTrigger className="w-full md:w-[320px]">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                {entries.map((entry) => (
                  <SelectItem key={entry.id} value={entry.id}>{entry.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableScopesForTarget.map((scope) => {
              const selected = !!scopeTargetEntry?.scopes?.includes(scope);
              return (
                <Button
                  key={scope}
                  type="button"
                  variant={selected ? "default" : "outline"}
                  size="sm"
                  disabled={!scopeTargetEntry || updateMutation.isPending}
                  onClick={() => scopeTargetEntry && toggleScope(scopeTargetEntry.id, scope)}
                >
                  {scope}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <span>All</span>
                    <Checkbox
                      checked={allPermissionsSelected}
                      disabled={selectableEntries.length === 0 || updateMutation.isPending}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          grantAllPermissionsWithScopes();
                          return;
                        }

                        updateAllEntries({ enabled: false, canView: false, canCreate: false, canUpdate: false, canDelete: false, canPreview: false, scopes: [] });
                      }}
                    />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <span>Enable</span>
                    <Checkbox
                      checked={allEnabledSelected}
                      disabled={selectableEntries.length === 0 || updateMutation.isPending}
                      onCheckedChange={(checked) => updateAllEntries({ enabled: checked === true })}
                    />
                  </div>
                </TableHead>
                {permissionKeys.map((permissionKey) => (
                  <TableHead key={permissionKey}>
                    <div className="flex items-center gap-2">
                      <span>{permissionKey.replace(/^can/, "")}</span>
                      <Checkbox
                        checked={getColumnCheckedState(permissionKey)}
                        disabled={selectableEntries.length === 0 || isTenantAdminRole || updateMutation.isPending}
                        onCheckedChange={(checked) => updatePermissionColumn(permissionKey, checked === true)}
                      />
                    </div>
                  </TableHead>
                ))}
                <TableHead>Scopes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground">Loading page permissions...</TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground">No roles found for this tenant.</TableCell>
                </TableRow>
              ) : !selectedRoleId ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground">Select a role to manage permissions.</TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground">No pages available.</TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.title}</span>
                          {entry.isSystem && <Badge variant="outline">System</Badge>}
                          {!entry.isActive && <Badge variant="secondary">Globally inactive</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{entry.routePath}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={isEntryFullySelected(entry)}
                        disabled={!entry.isActive || updateMutation.isPending}
                        onCheckedChange={(checked) => updateEntryAllPermissions(entry.id, checked === true)}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={entry.enabled} disabled={!entry.isActive} onCheckedChange={(checked) => updateEntry(entry.id, { enabled: checked === true })} />
                    </TableCell>
                    {permissionKeys.map((permissionKey) => (
                      <TableCell key={permissionKey}>
                        <Checkbox
                          checked={entry[permissionKey]}
                          disabled={!entry.enabled || isTenantAdminRole || updateMutation.isPending}
                          onCheckedChange={(checked) => updateEntry(entry.id, { [permissionKey]: checked === true } as Partial<PagePermissionEntry>)}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getPredefinedScopes(entry.slug).map((scope) => {
                          const selected = entry.scopes?.includes(scope);
                          return (
                            <Button
                              key={scope}
                              type="button"
                              variant={selected ? "default" : "outline"}
                              size="sm"
                              disabled={!entry.enabled || updateMutation.isPending}
                              onClick={() => toggleScope(entry.id, scope)}
                            >
                              {scope}
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoleId ? "Edit Role" : "Create Role"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-display-name">Display Name</Label>
              <Input
                id="role-display-name"
                value={roleForm.displayName}
                onChange={(event) => setRoleForm((current) => ({ ...current, displayName: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                rows={4}
                value={roleForm.description || ""}
                onChange={(event) => setRoleForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Active</p>
              </div>
              <Switch
                checked={!!roleForm.isActive}
                onCheckedChange={(checked) => setRoleForm((current) => ({ ...current, isActive: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeRoleDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleRoleSubmit()}
              disabled={isRoleMutationPending || !roleForm.displayName.trim()}
            >
              {editingRoleId ? "Save Role" : "Create Role"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}