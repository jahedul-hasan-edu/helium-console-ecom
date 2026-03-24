import { useEffect, useMemo, useState } from "react";
import { Save, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { usePagePermissions, useUpdatePagePermissions } from "@/hooks/use-PagePermission";
import { useRoles } from "@/hooks/use-Role";
import type { PagePermissionEntry } from "@/models/PagePermission";

export default function PagePermissions() {
  const { isSuperAdmin, selectedTenantId } = useAuth();
  const tenantScoped = !isSuperAdmin || !!selectedTenantId;
  const { data: roles = [], isLoading: rolesLoading } = useRoles(selectedTenantId, tenantScoped);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const { data, isLoading } = usePagePermissions(selectedRoleId, tenantScoped && !!selectedRoleId);
  const [entries, setEntries] = useState<PagePermissionEntry[]>([]);
  const updateMutation = useUpdatePagePermissions(selectedRoleId);

  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  useEffect(() => {
    setEntries(data?.pages || []);
  }, [data]);

  const isTenantAdminRole = data?.role.name === "tenant_admin";
  const dirty = useMemo(() => JSON.stringify(entries) !== JSON.stringify(data?.pages || []), [data?.pages, entries]);

  const updateEntry = (pageId: string, updates: Partial<PagePermissionEntry>) => {
    setEntries((current) =>
      current.map((entry) => {
        if (entry.id !== pageId) {
          return entry;
        }

        const next = { ...entry, ...updates };
        if (!next.enabled) {
          return {
            ...next,
            canView: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canPreview: false,
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
      })
    );
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      return;
    }

    await updateMutation.mutateAsync({
      entries: entries.map((entry) => ({
        pageId: entry.id,
        enabled: entry.enabled,
        canView: entry.canView,
        canCreate: entry.canCreate,
        canUpdate: entry.canUpdate,
        canDelete: entry.canDelete,
        canPreview: entry.canPreview,
      })),
    });
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
          <p className="mt-1 text-muted-foreground">
            Choose a role, then decide which pages it can reach and which actions it can perform.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedRoleId || undefined} onValueChange={setSelectedRoleId}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select a role"} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>{role.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="gap-2" disabled={!dirty || updateMutation.isPending || !selectedRoleId} onClick={() => void handleSave()}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {data?.role && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{data.role.displayName}</AlertTitle>
          <AlertDescription>
            {isTenantAdminRole
              ? "Tenant Admin access is page-level only. Enabling a page here makes it available in the tenant admin navigation."
              : "Regular and custom roles use the full permission matrix below."}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Enable a page first, then fine-tune the actions for that role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Enable</TableHead>
                <TableHead>View</TableHead>
                <TableHead>Create</TableHead>
                <TableHead>Update</TableHead>
                <TableHead>Delete</TableHead>
                <TableHead>Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">Loading page permissions...</TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">Select a role to manage permissions.</TableCell>
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
                      <Checkbox checked={entry.enabled} disabled={!entry.isActive} onCheckedChange={(checked) => updateEntry(entry.id, { enabled: checked === true })} />
                    </TableCell>
                    {(["canView", "canCreate", "canUpdate", "canDelete", "canPreview"] as const).map((permissionKey) => (
                      <TableCell key={permissionKey}>
                        <Checkbox
                          checked={entry[permissionKey]}
                          disabled={!entry.enabled || isTenantAdminRole}
                          onCheckedChange={(checked) => updateEntry(entry.id, { [permissionKey]: checked === true } as Partial<PagePermissionEntry>)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}