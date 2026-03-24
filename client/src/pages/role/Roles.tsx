import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateRole, useDeleteRole, useRoles, useUpdateRole } from "@/hooks/use-Role";
import type { CreateRoleRequest, Role } from "@/models/Role";

const emptyForm: CreateRoleRequest = {
  displayName: "",
  description: "",
  isActive: true,
};

export default function Roles() {
  const { isSuperAdmin, selectedTenantId } = useAuth();
  const tenantScoped = !isSuperAdmin || !!selectedTenantId;
  const { data: roles = [], isLoading } = useRoles(selectedTenantId, tenantScoped);
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form, setForm] = useState<CreateRoleRequest>(emptyForm);

  useEffect(() => {
    if (!selectedRole) {
      setForm(emptyForm);
      return;
    }

    setForm({
      displayName: selectedRole.displayName,
      description: selectedRole.description || "",
      isActive: selectedRole.isActive,
    });
  }, [selectedRole]);

  const handleSubmit = async () => {
    if (selectedRole) {
      await updateMutation.mutateAsync({ id: selectedRole.id, ...form });
    } else {
      await createMutation.mutateAsync(form);
    }

    setIsEditorOpen(false);
    setSelectedRole(null);
    setForm(emptyForm);
  };

  const handleDelete = async () => {
    if (!selectedRole) {
      return;
    }
    await deleteMutation.mutateAsync(selectedRole.id);
    setIsDeleteOpen(false);
    setSelectedRole(null);
  };

  if (!tenantScoped) {
    return (
      <Alert>
        <AlertTitle>Select a tenant first</AlertTitle>
        <AlertDescription>
          Roles are tenant-scoped. Choose a tenant from the header dropdown to manage role names and assignments.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="mt-1 text-muted-foreground">
            Create tenant-specific roles, keep built-in roles intact, and prepare roles for permission mapping.
          </p>
        </div>
        <Button className="gap-2" onClick={() => { setSelectedRole(null); setForm(emptyForm); setIsEditorOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Catalog</CardTitle>
          <CardDescription>Built-in roles stay read-only. Custom roles can be edited until users are assigned.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">Loading roles...</TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">No roles found for this tenant.</TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.displayName}</span>
                        <Badge variant={role.isSystem ? "outline" : "secondary"}>{role.isSystem ? "Built-in" : "Custom"}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md text-muted-foreground">{role.description || "No description"}</TableCell>
                    <TableCell>
                      <Badge variant={role.isActive ? "default" : "secondary"}>{role.isActive ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell>{role.assignedUserCount}</TableCell>
                    <TableCell>{role.activePageCount}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="outline" disabled={role.isSystem} onClick={() => { setSelectedRole(role); setIsEditorOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" disabled={role.isSystem} onClick={() => { setSelectedRole(role); setIsDeleteOpen(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRole ? "Edit Role" : "Create Role"}</DialogTitle>
            <DialogDescription>
              Custom roles become available immediately in user assignment and page permission workflows.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Display Name</Label>
              <Input id="role-name" value={form.displayName} onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea id="role-description" rows={4} value={form.description || ""} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Inactive roles stay hidden from new user assignments.</p>
              </div>
              <Switch checked={!!form.isActive} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button onClick={() => void handleSubmit()} disabled={createMutation.isPending || updateMutation.isPending}>
              {selectedRole ? "Save Changes" : "Create Role"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Delete {selectedRole?.displayName}. Assigned users must be moved off the role first.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteMutation.isPending}>
              Delete Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}