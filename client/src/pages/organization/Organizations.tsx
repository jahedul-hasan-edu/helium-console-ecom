import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization, useOrganizations, useCreateOrganization, useDeleteOrganization, useUpdateOrganization } from "@/hooks/use-Organization";
import type { Organization } from "@/models/Organization";
import { CreateOrganizationModal } from "@/pages/organization/CreateOrganizationModal";
import { DeleteOrganizationModal } from "@/pages/organization/DeleteOrganizationModal";
import { EditOrganizationModal } from "@/pages/organization/EditOrganizationModal";
import {
  BUTTON_LABELS,
  COLUMNS,
  ORGANIZATION_PAGE,
  SORT_CONFIG,
  SortField,
  SortOrder,
  TOTAL_PAGES,
} from "@/pages/organization";
import { Plus, Search } from "lucide-react";

export default function Organizations() {
  const { isSuperAdmin, selectedTenantId, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const activeTenantId = selectedTenantId || user?.tenantId || undefined;
  const tenantScopeReady = !isSuperAdmin || !!activeTenantId;
  const createNeedsTenantSelection = isSuperAdmin && !activeTenantId;

  const { data: organizationsData, isLoading } = useOrganizations({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy,
    sortOrder,
    tenantId: activeTenantId,
  });

  const selectedOrganizationFromList = useMemo(
    () => organizationsData?.items?.find((organization) => organization.id === selectedOrganizationId),
    [organizationsData?.items, selectedOrganizationId]
  );

  const selectedOrganizationTenantId = selectedOrganizationFromList?.tenantId || activeTenantId;
  const { data: selectedOrganizationFromApi } = useOrganization(selectedOrganizationId, selectedOrganizationTenantId);

  const selectedOrganization = selectedOrganizationFromList || selectedOrganizationFromApi;
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();
  const deleteMutation = useDeleteOrganization();

  const handleSort = (field: keyof Organization) => {
    const sortableField = field as SortField;

    if (sortBy === sortableField) {
      if (sortOrder === SORT_CONFIG.ORDERS.ASC) {
        setSortOrder(SORT_CONFIG.ORDERS.DESC);
      } else if (sortOrder === SORT_CONFIG.ORDERS.DESC) {
        setSortBy(undefined);
        setSortOrder(undefined);
      }
    } else {
      setSortBy(sortableField);
      setSortOrder(SORT_CONFIG.ORDERS.ASC);
    }

    setCurrentPage(1);
  };

  const columns = useMemo(
    () =>
      COLUMNS.map((column) => {
        if (column.key === "imageUrl") {
          return {
            ...column,
            render: (value: string | null, organization: Organization) =>
              value ? (
                <img
                  src={value}
                  alt={organization.title || "Organization"}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                  No image
                </div>
              ),
          };
        }

        if (column.key === "isActive") {
          return {
            ...column,
            render: (value: boolean | null) => <StatusBadge status={value ? "active" : "inactive"} />,
          };
        }

        return column;
      }),
    []
  );

  const totalPages = TOTAL_PAGES(organizationsData);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{ORGANIZATION_PAGE.TITLE}</h1>
          <p className="mt-1 text-muted-foreground">{ORGANIZATION_PAGE.SUBTITLE}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2" disabled={!tenantScopeReady}>
          <Plus className="h-4 w-4" />
          {BUTTON_LABELS.ADD_ORGANIZATION}
        </Button>
      </div>

      {!tenantScopeReady ? (
        <Alert>
          <AlertTitle>Tenant required</AlertTitle>
          <AlertDescription>Select a tenant from the top navigation to view or create organizations.</AlertDescription>
        </Alert>
      ) : null}

      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          className="pl-9"
          placeholder={ORGANIZATION_PAGE.SEARCH_PLACEHOLDER}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          disabled={!tenantScopeReady}
        />
      </div>

      <PaginatedDataTable
        columns={columns}
        data={tenantScopeReady ? organizationsData?.items : []}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage={ORGANIZATION_PAGE.EMPTY_MESSAGE}
        renderActions={(organization) => (
          <ActionButtons
            onEdit={() => {
              setSelectedOrganizationId(organization.id);
              setShowEditModal(true);
            }}
            onDelete={() => {
              setSelectedOrganizationId(organization.id);
              setShowDeleteModal(true);
            }}
          />
        )}
        currentPage={currentPage}
        totalPages={tenantScopeReady ? totalPages : 0}
        pageSize={pageSize}
        totalItems={tenantScopeReady ? organizationsData?.total || 0 : 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      <CreateOrganizationModal
        isOpen={showCreateModal}
        isLoading={createMutation.isPending}
        tenantId={activeTenantId}
        requireTenantSelection={createNeedsTenantSelection}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
          setShowCreateModal(false);
        }}
      />

      <EditOrganizationModal
        isOpen={showEditModal}
        organization={selectedOrganization}
        isLoading={updateMutation.isPending}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrganizationId(null);
        }}
        onSubmit={async (data) => {
          if (!selectedOrganizationId) {
            return;
          }

          await updateMutation.mutateAsync({
            id: selectedOrganizationId,
            data,
            currentTenantId: selectedOrganization?.tenantId || activeTenantId,
          });

          setShowEditModal(false);
          setSelectedOrganizationId(null);
        }}
      />

      <DeleteOrganizationModal
        isOpen={showDeleteModal}
        organization={selectedOrganization}
        isLoading={deleteMutation.isPending}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOrganizationId(null);
        }}
        onConfirm={async () => {
          if (!selectedOrganizationId) {
            return;
          }

          await deleteMutation.mutateAsync({
            id: selectedOrganizationId,
            tenantId: selectedOrganization?.tenantId || activeTenantId,
          });

          setShowDeleteModal(false);
          setSelectedOrganizationId(null);
        }}
      />
    </div>
  );
}