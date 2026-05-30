import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { ActionButtons } from "@/components/ActionButtons";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { useCreatePage, useDeletePage, usePages, useUpdatePage } from "@/hooks/use-Page";
import type { AdminPage, CreatePageRequest, PageSortField } from "@/models/Page";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<PageSortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);
  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage();
  const deleteMutation = useDeletePage();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<AdminPage | null>(null);
  const [form, setForm] = useState<CreatePageRequest>(emptyForm);

  const { data: pagesData, isLoading } = usePages({
    page: currentPage,
    pageSize,
    search: searchTerm || undefined,
    sortBy,
    sortOrder,
  });
  const { data: pageOptionsData } = usePages({
    page: 1,
    pageSize: 100,
    sortBy: "title",
    sortOrder: "asc",
  });
  const pages = pagesData?.items || [];

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

  const parentOptions = useMemo(
    () => (pageOptionsData?.items || []).filter((page) => page.id !== selectedPage?.id),
    [pageOptionsData?.items, selectedPage?.id]
  );

  const pageTitleById = useMemo(
    () => new Map(parentOptions.map((page) => [page.id, page.title])),
    [parentOptions]
  );

  const totalPages = pagesData?.total ? Math.ceil(pagesData.total / (pagesData.pageSize || pageSize)) : 0;

  const columns = useMemo(
    () => [
      {
        key: "title" as const,
        label: "Title",
        sortable: true,
      },
      {
        key: "slug" as const,
        label: "Slug",
        sortable: true,
      },
      {
        key: "routePath" as const,
        label: "Route",
        sortable: true,
      },
      {
        key: "parentId" as const,
        label: "Parent",
        render: (value: string | null | undefined) => value ? pageTitleById.get(value) || "Unknown page" : "Top level",
      },
      {
        key: "sortOrder" as const,
        label: "Order",
        sortable: true,
      },
      {
        key: "isActive" as const,
        label: "Status",
        render: (value: boolean) => <StatusBadge status={value ? "active" : "inactive"} />,
      },
      {
        key: "isSystem" as const,
        label: "Type",
        render: (value: boolean) => <StatusBadge status={value ? "system" : "custom"} />,
      },
    ],
    [pageTitleById]
  );

  const handleSort = (field: keyof AdminPage) => {
    const nextField = field as PageSortField;

    if (sortBy === nextField) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortBy(undefined);
        setSortOrder(undefined);
      }
    } else {
      setSortBy(nextField);
      setSortOrder("asc");
    }

    setCurrentPage(1);
  };

  const handleSubmit = async () => {
    try {
      if (selectedPage) {
        await updateMutation.mutateAsync({ id: selectedPage.id, ...form });
      } else {
        await createMutation.mutateAsync(form);
      }

      setIsEditorOpen(false);
      setSelectedPage(null);
      setForm(emptyForm);
      setCurrentPage(1);
    } catch {
      // apiService already surfaces a toast; keep the dialog open so the user can correct the form.
    }
  };

  const handleDelete = async () => {
    if (!selectedPage) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(selectedPage.id);
      setIsDeleteOpen(false);
      setSelectedPage(null);
    } catch {
      // apiService already surfaces a toast; keep the confirmation open on failure.
    }
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

      <div className="mb-4 max-w-sm">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                className="pl-9"
                placeholder="Search pages by title, slug, or route..."
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <PaginatedDataTable
            columns={columns}
            data={pages}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyMessage="No pages found."
            renderActions={(page) => (
              <ActionButtons
                onEdit={() => {
                  setSelectedPage(page);
                  setIsEditorOpen(true);
                }}
                onDelete={() => {
                  setSelectedPage(page);
                  setIsDeleteOpen(true);
                }}
                deleteDisabled={page.isSystem}
              />
            )}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={pagesData?.total || 0}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />

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
            <div className="space-y-2">
              <Label htmlFor="page-parent">Parent Page</Label>
              <Select
                value={form.parentId || "__none__"}
                onValueChange={(value) => setForm((prev) => ({ ...prev, parentId: value === "__none__" ? null : value }))}
              >
                <SelectTrigger id="page-parent">
                  <SelectValue placeholder="Select a parent page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Top level page</SelectItem>
                  {parentOptions.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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