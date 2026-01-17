import { useState } from "react";
import { useCategories } from "@/hooks/use-Category";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { EditCategoryModal } from "./EditCategoryModal";
import { DeleteCategoryModal } from "./DeleteCategoryModal";
import { COLUMNS, TOTAL_PAGES } from "./index";
import type { Category } from "@/models/Category";
import { SORT_ORDERS } from "@/lib/constants";

export default function Categories() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data, isLoading } = useCategories({
    page,
    pageSize,
    search: search || undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      if (sortOrder === SORT_ORDERS.ASC) {
        setSortOrder(SORT_ORDERS.DESC);
      } else if (sortOrder === SORT_ORDERS.DESC) {
        setSortBy(undefined);
        setSortOrder(undefined);
      } else {
        setSortOrder(SORT_ORDERS.ASC);
      }
    } else {
      setSortBy(field);
      setSortOrder(SORT_ORDERS.ASC);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const renderActions = (row: any) => (
        <ActionButtons
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row)}
        />
      );
      
    const totalPages = TOTAL_PAGES(data!);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <p className="text-muted-foreground mt-2">Manage your product categories</p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>

      <PaginatedDataTable<Category>
        columns={COLUMNS}
        data={data?.items || []}
        totalItems={data?.total || 0}
        totalPages={totalPages}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onSort={handleSort}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isLoading={isLoading}
        renderActions={renderActions}
      />

      <CreateCategoryModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {selectedCategory && (
        <>
          <EditCategoryModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedCategory(null);
            }}
            categoryId={selectedCategory.id}
          />

          <DeleteCategoryModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedCategory(null);
            }}
            categoryId={selectedCategory.id}
            categoryName={selectedCategory.name || ""}
          />
        </>
      )}
    </div>
  );
}
