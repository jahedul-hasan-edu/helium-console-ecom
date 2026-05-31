import { useState, useMemo } from "react";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionButtons } from "@/components/ActionButtons";
import { useToast } from "@/hooks/use-toast";
import {
  usePopupAds,
  useCreatePopupAd,
  useUpdatePopupAd,
  useDeletePopupAd,
  usePopupAd,
} from "@/hooks/use-PopupAd";
import { CreatePopupAdModal } from "./CreatePopupAdModal";
import { EditPopupAdModal } from "./EditPopupAdModal";
import { DeletePopupAdModal } from "./DeletePopupAdModal";
import {
  POPUP_AD_PAGE,
  COLUMNS,
  SORTABLE_FIELDS,
  SORT_CONFIG,
  BUTTON_LABELS,
  ACTION_BUTTONS as ACTION_BUTTONS_CONFIG,
  TOTAL_PAGES,
  SortField,
  SortOrder,
} from "@/pages/popupAd";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PopupAd, CreatePopupAdRequest, UpdatePopupAdRequest } from "@/models/PopupAd";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

export default function PopupAds() {
  const { toast } = useToast();
  const { isSuperAdmin, selectedTenantId, user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const activeTenantId = selectedTenantId || user?.tenantId || undefined;
  const tenantScopeReady = !isSuperAdmin || !!activeTenantId;

  // Data fetching hooks
  const { data: popupAdsData, isLoading } = usePopupAds({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy,
    sortOrder,
    tenantId: activeTenantId,
  } as any, tenantScopeReady);

  const { data: selectedPopupAdData } = usePopupAd(selectedId, tenantScopeReady);

  // Mutations
  const createMutation = useCreatePopupAd();
  const updateMutation = useUpdatePopupAd();
  const deleteMutation = useDeletePopupAd();

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof PopupAd) => {
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

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (data: CreatePopupAdRequest) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Popup Ad created successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create Popup Ad",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateSubmit = async (id: string, data: UpdatePopupAdRequest) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      setIsEditModalOpen(false);
      setSelectedId(null);
      toast({
        title: "Success",
        description: "Popup Ad updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update Popup Ad",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    try {
      await deleteMutation.mutateAsync(selectedId);
      setIsDeleteModalOpen(false);
      setSelectedId(null);
      toast({
        title: "Success",
        description: "Popup Ad deleted successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete Popup Ad",
        variant: "destructive",
      });
      throw error;
    }
  };


  const renderActions = (item: PopupAd) => (
    <ActionButtons
      onEdit={() => item.id && handleEdit(item.id)}
      onDelete={() => item.id && handleDelete(item.id)}
    />
  );

  const totalPages = TOTAL_PAGES(popupAdsData);

  const columns = useMemo(() => 
      COLUMNS.map(col => {
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

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{POPUP_AD_PAGE.title}</h1>
            <p className="text-gray-600 mt-1">{POPUP_AD_PAGE.subtitle}</p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2"
            size="lg"
            disabled={!tenantScopeReady}
          >
            <Plus className="h-4 w-4" />
            {BUTTON_LABELS.add}
          </Button>
        </div>

          {!tenantScopeReady ? (
            <Alert>
              <AlertTitle>Select a tenant first</AlertTitle>
              <AlertDescription>Select a tenant from the top navigation to view or create popup ads.</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={POPUP_AD_PAGE.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <PaginatedDataTable<PopupAd>
           columns={columns}
          data={popupAdsData?.items}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          } }
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          isLoading={isLoading}
          emptyMessage={POPUP_AD_PAGE.emptyMessage} totalItems={popupAdsData?.total || 0}
          renderActions={renderActions}
          />
      </div>

      {/* Modals */}
      <CreatePopupAdModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        tenantId={activeTenantId}
      />

      <EditPopupAdModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedId(null);
        }}
        onSubmit={handleUpdateSubmit}
        isLoading={updateMutation.isPending}
        popupAd={selectedPopupAdData as PopupAd | undefined}
        tenantId={selectedPopupAdData?.tenantId || activeTenantId}
      />

      <DeletePopupAdModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedId(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        popupAd={
          ((popupAdsData?.items as any)?.find((item: any) => item.id === selectedId) ||
          selectedPopupAdData) as PopupAd | undefined
        }
      />
    </>
  );
}
