import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCreatePage, useDeletePage, usePages, useUpdatePage } from "@/hooks/use-Page";
import type { AdminPage, CreatePageRequest } from "@/models/Page";

const emptyForm: CreatePageRequest = {
  title: "",
  slug: "",
  icon: "",
  parentId: null,
  sortOrder: 0,
  routePath: "/admin/",
  isActive: true,
};

export default function Pages() {
  const { data: pages = [], isLoading } = usePages();
  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage();
  const deleteMutation = useDeletePage();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<AdminPage | null>(null);
  const [form, setForm] = useState<CreatePageRequest>(emptyForm);

  useEffect(() => {
    if (!selectedPage) {
      setForm(emptyForm);
      return;
    }

    setForm({
      title: selectedPage.title,
      slug: selectedPage.slug,
      icon: selectedPage.icon || "",
      parentId: selectedPage.parentId || null,
      sortOrder: selectedPage.sortOrder,
      routePath: selectedPage.routePath,
      isActive: selectedPage.isActive,
    });
  }, [selectedPage]);

  const sortedPages = useMemo(
    () => [...pages].sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title)),
    [pages]
  );

  const handleSubmit = async () => {
    if (selectedPage) {
      await updateMutation.mutateAsync({ id: selectedPage.id, ...form });
    } else {
      await createMutation.mutateAsync(form);
    }

    setIsEditorOpen(false);
    setSelectedPage(null);
    setForm(emptyForm);
  };

  const handleDelete = async () => {
    if (!selectedPage) {
      return;
    }

    await deleteMutation.mutateAsync(selectedPage.id);
    setIsDeleteOpen(false);
    setSelectedPage(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="mt-1 text-muted-foreground">
            Manage the admin page catalog that drives navigation and permission assignment.
          </p>
        </div>
        <Button className="gap-2" onClick={() => { setSelectedPage(null); setForm(emptyForm); setIsEditorOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add Page
        </Button>
      </div>

      <Alert>
        <AlertTitle>System pages stay protected</AlertTitle>
        <AlertDescription>
          Seeded pages can be renamed visually and re-ordered, but their core route and slug stay locked so authorization remains consistent.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Page Directory</CardTitle>
          <CardDescription>{sortedPages.length} total pages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={7}>Loading pages...</TableCell>
                </TableRow>
              ) : sortedPages.length === 0 ? (
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={7}>No pages found.</TableCell>
                </TableRow>
              ) : (
                sortedPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>{page.slug}</TableCell>
                    <TableCell>{page.routePath}</TableCell>
                    <TableCell>{page.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={page.isActive ? "default" : "secondary"}>{page.isActive ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.isSystem ? "outline" : "secondary"}>{page.isSystem ? "System" : "Custom"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="outline" onClick={() => { setSelectedPage(page); setIsEditorOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={page.isSystem}
                          onClick={() => { setSelectedPage(page); setIsDeleteOpen(true); }}
                        >
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPage ? "Edit Page" : "Create Page"}</DialogTitle>
            <DialogDescription>
              {selectedPage?.isSystem
                ? "System pages keep their slug, route, and active state locked."
                : "Create or update a page that can later be assigned to roles."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="page-title">Title</Label>
              <Input id="page-title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="page-icon">Icon</Label>
              <Input id="page-icon" value={form.icon || ""} onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))} placeholder="Shield" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="page-slug">Slug</Label>
              <Input
                id="page-slug"
                disabled={!!selectedPage?.isSystem}
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value.toLowerCase() }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="page-route">Route Path</Label>
              <Input
                id="page-route"
                disabled={!!selectedPage?.isSystem}
                value={form.routePath}
                onChange={(event) => setForm((prev) => ({ ...prev, routePath: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="page-order">Sort Order</Label>
              <Input
                id="page-order"
                type="number"
                value={form.sortOrder}
                onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value || 0) }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Inactive custom pages stay out of navigation and permission flows.</p>
              </div>
              <Switch
                checked={!!form.isActive}
                disabled={!!selectedPage?.isSystem}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button onClick={() => void handleSubmit()} disabled={createMutation.isPending || updateMutation.isPending}>
              {selectedPage ? "Save Changes" : "Create Page"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Remove {selectedPage?.title} from the page catalog. Existing role links will be removed with it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteMutation.isPending}>
              Delete Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}