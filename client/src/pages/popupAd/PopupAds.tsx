import { useState, useMemo } from "react";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionButtons } from "@/components/ActionButtons";
import { useToast } from "@/hooks/use-toast";
import {
  usePopupAds,
  useCreatePopupAd,
  useUpdatePopupAd,
  useDeletePopupAd,
  usePopupAd,
} from "@/hooks/use-PopupAd";
import { useTenants } from "@/hooks/use-Tenant";
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
import { Tenant } from "@/models/Tenant";

export default function PopupAds() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({
      pageSize: 1000,
    });

  // Data fetching hooks
  const { data: popupAdsData, isLoading } = usePopupAds({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy,
    sortOrder,
  });

  const { data: selectedPopupAdData } = usePopupAd(selectedId);

  // Mutations
  const createMutation = useCreatePopupAd();
  const updateMutation = useUpdatePopupAd();
  const deleteMutation = useDeletePopupAd();

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTenantChange = (value: string) => {
    setSelectedTenantId(value);
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
          >
            <Plus className="h-4 w-4" />
            {BUTTON_LABELS.add}
          </Button>
        </div>

          {/* Tenant Filter and Search */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedTenantId} onValueChange={handleTenantChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenantsData?.items?.map((tenant: Tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={POPUP_AD_PAGE.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <PaginatedDataTable
          columns={[...columns] as any}
          data={(popupAdsData?.items as PopupAd[]) || undefined}
          isLoading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={popupAdsData?.total || 0}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          renderActions={renderActions as any}
          />
      </div>

      {/* Modals */}
      <CreatePopupAdModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
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
