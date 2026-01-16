import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateMainCategory, useMainCategories, useCreateMainCategory, useDeleteMainCategory, useGetMainCategory } from "@/hooks/use-MainCategory";
import { CreateMainCategoryModal } from "@/pages/mainCategory/CreateMainCategoryModal";
import { EditMainCategoryModal } from "@/pages/mainCategory/EditMainCategoryModal";
import { DeleteMainCategoryModal } from "@/pages/mainCategory/DeleteMainCategoryModal";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { COLUMNS, MAIN_CATEGORIES_PAGE, BUTTON_LABELS, ERROR_MESSAGES, ACTION_BUTTONS, SORTABLE_FIELDS, SORT_CONFIG, type SortField, type SortOrder, TOTAL_PAGES } from "@/pages/mainCategory";
import type { MainCategory } from "@/models/MainCategory";

export default function MainCategories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(MAIN_CATEGORIES_PAGE.CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(MAIN_CATEGORIES_PAGE.PAGE_SIZE_LENGTH);
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string | null>(null);

  const { data: mainCategoriesData, isLoading, refetch } = useMainCategories({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy: sortBy,
    sortOrder: sortOrder,
  });

  const { data: selectedMainCategory } = useGetMainCategory(selectedMainCategoryId);
  const createMainCategoryMutation = useCreateMainCategory();
  const updateMainCategoryMutation = useUpdateMainCategory();
  const deleteMainCategoryMutation = useDeleteMainCategory();
  const { toast } = useToast();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (mainCategoryId: string) => {
    setSelectedMainCategoryId(mainCategoryId);
    setShowEditModal(true);
  };

  const handleDelete = (mainCategoryId: string) => {
    setSelectedMainCategoryId(mainCategoryId);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: any) => {
    try {
      await createMainCategoryMutation.mutateAsync(data);
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_MAIN_CATEGORY_FAILED, error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedMainCategoryId) return;
    try {
      await updateMainCategoryMutation.mutateAsync({ id: selectedMainCategoryId, ...data });
      setShowEditModal(false);
      setSelectedMainCategoryId(null);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_MAIN_CATEGORY_FAILED, error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMainCategoryId) return;
    try {
      await deleteMainCategoryMutation.mutateAsync(selectedMainCategoryId);
      setShowDeleteModal(false);
      setSelectedMainCategoryId(null);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_MAIN_CATEGORY_FAILED, error);
    }
  };

  const handleSort = (field: keyof MainCategory) => {
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

  const renderActions = (mainCategory: MainCategory) => (
    <ActionButtons
      onEdit={() => handleEdit(mainCategory.id)}
      onDelete={() => handleDelete(mainCategory.id)}
      showLabel={ACTION_BUTTONS.SHOW_LABEL}
      size={ACTION_BUTTONS.SIZE}
      variant={ACTION_BUTTONS.VARIANT}
    />
  );

  const totalPages = TOTAL_PAGES(mainCategoriesData!);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{MAIN_CATEGORIES_PAGE.TITLE}</h1>
          <p className="text-muted-foreground mt-1">{MAIN_CATEGORIES_PAGE.SUBTITLE}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {BUTTON_LABELS.ADD_MAIN_CATEGORY}
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={MAIN_CATEGORIES_PAGE.SEARCH_PLACEHOLDER}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table with Pagination */}
      <PaginatedDataTable
        columns={COLUMNS}
        data={mainCategoriesData?.items}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage={MAIN_CATEGORIES_PAGE.NO_MAIN_CATEGORIES_MESSAGE}
        renderActions={renderActions}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={mainCategoriesData?.total || 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Modals */}
      <CreateMainCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={createMainCategoryMutation.isPending}
      />

      <EditMainCategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMainCategoryId(null);
        }}
        mainCategory={selectedMainCategory}
        onSubmit={handleUpdate}
        isLoading={updateMainCategoryMutation.isPending}
      />

      <DeleteMainCategoryModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMainCategoryId(null);
        }}
        mainCategory={selectedMainCategory}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMainCategoryMutation.isPending}
      />
    </div>
  );
}
