import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateTenant, useTenants, useCreateTenant, useDeleteTenant, useGetTenant } from "@/hooks/use-Tenant";
import { CreateTenantModal } from "@/pages/tenant/CreateTenantModal";
import { EditTenantModal } from "@/pages/tenant/EditTenantModal";
import { DeleteTenantModal } from "@/pages/tenant/DeleteTenantModal";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { BASE_COLUMNS, TENANTS_PAGE, BUTTON_LABELS, ERROR_MESSAGES, ACTION_BUTTONS, SORTABLE_FIELDS, SORT_CONFIG, type SortField, type SortOrder, TOTAL_PAGES } from "@/pages/tenant";
import type { Tenant } from "@/models/Tenant";
import type { Column } from "@/components/PaginatedDataTable";

export default function Tenants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(TENANTS_PAGE.CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(TENANTS_PAGE.PAGE_SIZE_LENGTH);
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // Build columns with render function for isActive
  const COLUMNS: Column<Tenant>[] = useMemo(() => 
    BASE_COLUMNS.map(col => {
      if (col.key === 'isActive') {
        return {
          ...col,
          render: (value: any) => (
            <Badge 
              variant={value ? "default" : "destructive"} 
              className={value ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {value ? "Active" : "Inactive"}
            </Badge>
          )
        };
      }
      return col;
    }),
    []
  );

  const { data: tenantsData, isLoading, refetch } = useTenants({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy: sortBy,
    sortOrder: sortOrder,
  });

  const { data: selectedTenant } = useGetTenant(selectedTenantId);
  const createTenantMutation = useCreateTenant();
  const updateTenantMutation = useUpdateTenant();
  const deleteTenantMutation = useDeleteTenant();
  const { toast } = useToast();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (tenantId: string | undefined) => {
    if (!tenantId) return;
    setSelectedTenantId(tenantId);
    setShowEditModal(true);
  };

  const handleDelete = (tenantId: string | undefined) => {
    if (!tenantId) return;
    setSelectedTenantId(tenantId);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: any) => {
    try {
      await createTenantMutation.mutateAsync(data);
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_TENANT_FAILED, error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedTenantId) return;
    try {
      await updateTenantMutation.mutateAsync({ id: selectedTenantId, ...data });
      setShowEditModal(false);
      setSelectedTenantId(null);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_TENANT_FAILED, error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTenantId) return;
    try {
      await deleteTenantMutation.mutateAsync(selectedTenantId);
      setShowDeleteModal(false);
      setSelectedTenantId(null);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_TENANT_FAILED, error);
    }
  };

  const handleSort = (field: keyof Tenant) => {
    const sortableField = field as SortField;
    
    if (sortBy === sortableField) {
      // If clicking the same field, cycle through: asc -> desc -> clear
      if (sortOrder === SORT_CONFIG.ORDERS.ASC) {
        setSortOrder(SORT_CONFIG.ORDERS.DESC);
      } else if (sortOrder === SORT_CONFIG.ORDERS.DESC) {
        // Clear the sort
        setSortBy(undefined);
        setSortOrder(undefined);
      }
    } else {
      // If clicking a different field, start with ascending
      setSortBy(sortableField);
      setSortOrder(SORT_CONFIG.ORDERS.ASC);
    }
    setCurrentPage(1);
  };

  const renderActions = (row: Tenant) => (
      <ActionButtons
        onEdit={() => handleEdit(row?.id)}
        onDelete={() => handleDelete(row?.id)}
      />
    );

  const totalPages = TOTAL_PAGES(tenantsData!);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{TENANTS_PAGE.TITLE}</h1>
          <p className="text-muted-foreground mt-1">{TENANTS_PAGE.SUBTITLE}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {BUTTON_LABELS.ADD_TENANT}
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={TENANTS_PAGE.SEARCH_PLACEHOLDER}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table with Pagination */}
      <PaginatedDataTable
        columns={COLUMNS}
        data={tenantsData?.items}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage={TENANTS_PAGE.NO_TENANTS_MESSAGE}
        renderActions={renderActions}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={tenantsData?.total || 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Modals */}
      <CreateTenantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={createTenantMutation.isPending}
      />

      <EditTenantModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTenantId(null);
        }}
        tenant={selectedTenant}
        onSubmit={handleUpdate}
        isLoading={updateTenantMutation.isPending}
      />

      <DeleteTenantModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTenantId(null);
        }}
        tenant={selectedTenant}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteTenantMutation.isPending}
      />
    </div>
  );
}
