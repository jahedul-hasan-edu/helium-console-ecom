import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useTenantSubscriptions,
  useGetTenantSubscription,
  useDeleteTenantSubscription,
} from "@/hooks/use-TenantSubscription";
import { CreateTenantSubscriptionModal } from "./CreateTenantSubscriptionModal";
import { EditTenantSubscriptionModal } from "./EditTenantSubscriptionModal";
import { DeleteTenantSubscriptionModal } from "./DeleteTenantSubscriptionModal";
import { Column, PaginatedDataTable } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import {
  TENANT_SUBSCRIPTIONS_PAGE,
  BUTTON_LABELS,
  ERROR_MESSAGES,
  SORT_CONFIG,
  type SortField,
  type SortOrder,
  TOTAL_PAGES,
  BASE_COLUMNS,
} from "./index";
import { TenantSubscription } from "@/models/TenantSubscription";

export default function TenantSubscriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(TENANT_SUBSCRIPTIONS_PAGE.CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(TENANT_SUBSCRIPTIONS_PAGE.PAGE_SIZE_LENGTH);
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);

  const { data: subscriptionsData, isLoading, refetch } = useTenantSubscriptions({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy: sortBy,
    sortOrder: sortOrder,
  });

  const { data: selectedSubscription } = useGetTenantSubscription(selectedSubscriptionId);
  const deleteMutation = useDeleteTenantSubscription();
  const { toast } = useToast();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (subscriptionId: string) => {
    setSelectedSubscriptionId(subscriptionId);
    setShowEditModal(true);
  };

  const handleDelete = (subscriptionId: string) => {
    setSelectedSubscriptionId(subscriptionId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubscriptionId) return;
    try {
      await deleteMutation.mutateAsync(selectedSubscriptionId);
      setShowDeleteModal(false);
      setSelectedSubscriptionId(null);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_SUBSCRIPTION_FAILED, error);
    }
  };

  const handleSort = (field: keyof TenantSubscription) => {
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

  const renderActions = (row: TenantSubscription) => (
    <ActionButtons onEdit={() => handleEdit(row?.id)} onDelete={() => handleDelete(row?.id)} />
  );

    const COLUMNS: Column<TenantSubscription>[] = useMemo(() => 
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

 

  const totalPages = TOTAL_PAGES(subscriptionsData!);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {TENANT_SUBSCRIPTIONS_PAGE.TITLE}
          </h1>
          <p className="text-muted-foreground mt-1">{TENANT_SUBSCRIPTIONS_PAGE.SUBTITLE}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {BUTTON_LABELS.ADD_SUBSCRIPTION}
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={TENANT_SUBSCRIPTIONS_PAGE.SEARCH_PLACEHOLDER}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table with Pagination */}
      <PaginatedDataTable
        columns={COLUMNS}
        data={subscriptionsData?.items}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage={TENANT_SUBSCRIPTIONS_PAGE.NO_SUBSCRIPTIONS_MESSAGE}
        renderActions={renderActions}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={subscriptionsData?.total || 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Modals */}
      <CreateTenantSubscriptionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <EditTenantSubscriptionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSubscriptionId(null);
        }}
        subscriptionId={selectedSubscriptionId!}
      />

      <DeleteTenantSubscriptionModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSubscriptionId(null);
        }}
        subscription={selectedSubscription}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
