import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useUpdateSubscriptionPlan,
  useSubscriptionPlans,
  useCreateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useGetSubscriptionPlan,
} from "@/hooks/use-SubscriptionPlan";
import { CreateSubscriptionPlanModal } from "@/pages/subscriptionPlan/CreateSubscriptionPlanModal";
import { EditSubscriptionPlanModal } from "@/pages/subscriptionPlan/EditSubscriptionPlanModal";
import { DeleteSubscriptionPlanModal } from "@/pages/subscriptionPlan/DeleteSubscriptionPlanModal";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import {
  COLUMNS,
  SUBSCRIPTION_PLAN_PAGE,
  BUTTON_LABELS,
  ERROR_MESSAGES,
  ACTION_BUTTONS,
  SORTABLE_FIELDS,
  SORT_CONFIG,
  type SortField,
  type SortOrder,
  TOTAL_PAGES,
} from "@/pages/subscriptionPlan";
import type { SubscriptionPlan } from "@/models/SubscriptionPlan";

export default function SubscriptionPlans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(
    SUBSCRIPTION_PLAN_PAGE.CURRENT_PAGE
  );
  const [pageSize, setPageSize] = useState(SUBSCRIPTION_PLAN_PAGE.PAGE_SIZE_LENGTH);
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { data: plansData, isLoading, refetch } = useSubscriptionPlans({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy: sortBy,
    sortOrder: sortOrder,
  });

  const { data: selectedPlan } = useGetSubscriptionPlan(selectedPlanId);
  const createPlanMutation = useCreateSubscriptionPlan();
  const updatePlanMutation = useUpdateSubscriptionPlan();
  const deletePlanMutation = useDeleteSubscriptionPlan();
  const { toast } = useToast();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (planId: string) => {
    setSelectedPlanId(planId);
    setShowEditModal(true);
  };

  const handleDelete = (planId: string) => {
    setSelectedPlanId(planId);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: any) => {
    try {
      await createPlanMutation.mutateAsync(data);
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_PLAN_FAILED, error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedPlanId) return;
    try {
      await updatePlanMutation.mutateAsync({ id: selectedPlanId, ...data });
      setShowEditModal(false);
      setSelectedPlanId(null);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_PLAN_FAILED, error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlanId) return;
    try {
      await deletePlanMutation.mutateAsync(selectedPlanId);
      setShowDeleteModal(false);
      setSelectedPlanId(null);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_PLAN_FAILED, error);
    }
  };

  const handleSort = (field: keyof SubscriptionPlan) => {
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

  const renderActions = (row: SubscriptionPlan) => (
    <ActionButtons
      onEdit={() => handleEdit(row?.id)}
      onDelete={() => handleDelete(row?.id)}
    />
  );

  const totalPages = TOTAL_PAGES(plansData!);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {SUBSCRIPTION_PLAN_PAGE.TITLE}
          </h1>
          <p className="text-muted-foreground mt-1">
            {SUBSCRIPTION_PLAN_PAGE.SUBTITLE}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {BUTTON_LABELS.ADD_PLAN}
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={SUBSCRIPTION_PLAN_PAGE.SEARCH_PLACEHOLDER}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table with Pagination */}
      <PaginatedDataTable
        columns={COLUMNS}
        data={plansData?.items}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage={SUBSCRIPTION_PLAN_PAGE.NO_PLANS_MESSAGE}
        renderActions={renderActions}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={plansData?.total || 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Modals */}
      <CreateSubscriptionPlanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={createPlanMutation.isPending}
      />

      <EditSubscriptionPlanModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPlanId(null);
        }}
        plan={selectedPlan}
        onSubmit={handleUpdate}
        isLoading={updatePlanMutation.isPending}
      />

      <DeleteSubscriptionPlanModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPlanId(null);
        }}
        plan={selectedPlan}
        onConfirm={handleDeleteConfirm}
        isLoading={deletePlanMutation.isPending}
      />
    </div>
  );
}
