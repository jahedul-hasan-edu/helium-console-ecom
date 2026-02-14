import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUpdateHomeSetting, useHomeSettings, useCreateHomeSetting, useDeleteHomeSetting } from "@/hooks/use-HomeSetting";
import { useTenants } from "@/hooks/use-Tenant";
import { CreateHomeSettingModal } from "@/pages/homeSetting/CreateHomeSettingModal";
import { EditHomeSettingModal } from "@/pages/homeSetting/EditHomeSettingModal";
import { DeleteHomeSettingModal } from "@/pages/homeSetting/DeleteHomeSettingModal";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { COLUMNS, HOME_SETTING_PAGE, BUTTON_LABELS, ERROR_MESSAGES, ACTION_BUTTONS, SORTABLE_FIELDS, SORT_CONFIG, type SortField, type SortOrder, TOTAL_PAGES } from "@/pages/homeSetting";
import type { HomeSetting } from "@/models/HomeSetting";

export default function HomeSettings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHomeSettingId, setSelectedHomeSettingId] = useState<string | null>(null);

  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({
    pageSize: 1000,
  });

  const { data: homeSettingsData, isLoading } = useHomeSettings({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy: sortBy,
    sortOrder: sortOrder,
    tenantId: selectedTenantId,
  } as any);

  const selectedHomeSetting = useMemo(
    () => homeSettingsData?.items?.find((hs) => hs.id === selectedHomeSettingId),
    [homeSettingsData?.items, selectedHomeSettingId]
  );

  const createMutation = useCreateHomeSetting();
  const updateMutation = useUpdateHomeSetting();
  const deleteMutation = useDeleteHomeSetting();
  const { toast } = useToast();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setCurrentPage(1);
  };

  const handleEdit = (homeSettingId: string) => {
    setSelectedHomeSettingId(homeSettingId);
    setShowEditModal(true);
  };

  const handleDelete = (homeSettingId: string) => {
    setSelectedHomeSettingId(homeSettingId);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_HOME_SETTING_FAILED, error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedHomeSettingId) return;
    try {
      await updateMutation.mutateAsync({ id: selectedHomeSettingId, ...data });
      setShowEditModal(false);
      setSelectedHomeSettingId(null);
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_HOME_SETTING_FAILED, error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedHomeSettingId) return;
    try {
      await deleteMutation.mutateAsync(selectedHomeSettingId);
      setShowDeleteModal(false);
      setSelectedHomeSettingId(null);
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_HOME_SETTING_FAILED, error);
    }
  };

  const handleSort = (field: keyof HomeSetting) => {
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

  const renderActions = (row: HomeSetting) => (
    <ActionButtons
      onEdit={() => handleEdit(row?.id)}
      onDelete={() => handleDelete(row?.id)}
    />
  );

  const totalPages = TOTAL_PAGES(homeSettingsData);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{HOME_SETTING_PAGE.TITLE}</h1>
          <p className="text-muted-foreground mt-1">{HOME_SETTING_PAGE.SUBTITLE}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {BUTTON_LABELS.ADD_HOME_SETTING}
        </Button>
      </div>

      {/* Filters: Tenant Dropdown and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tenant Dropdown Filter */}
        <div className="w-full sm:w-48">
          <Select value={selectedTenantId} onValueChange={handleTenantChange} disabled={tenantsLoading}>
            <SelectTrigger>
              <SelectValue placeholder={HOME_SETTING_PAGE.TENANT_FILTER_PLACEHOLDER} />
            </SelectTrigger>
            <SelectContent>
              {tenantsData?.items?.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={HOME_SETTING_PAGE.SEARCH_PLACEHOLDER}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table with Pagination */}
      <PaginatedDataTable
        columns={columns}
        data={homeSettingsData?.items}
        isLoading={isLoading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={homeSettingsData?.total || 0}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        onSort={handleSort}
        sortBy={sortBy}
        sortOrder={sortOrder}
        renderActions={renderActions}
      />

      {/* Modals */}
      <CreateHomeSettingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      <EditHomeSettingModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedHomeSettingId(null);
        }}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
        homeSetting={selectedHomeSetting}
      />

      <DeleteHomeSettingModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedHomeSettingId(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        homeSetting={selectedHomeSetting}
      />
    </div>
  );
}
