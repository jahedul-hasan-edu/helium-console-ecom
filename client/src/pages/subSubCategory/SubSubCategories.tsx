import { useState } from "react";
import { useSubSubCategories } from "@/hooks/use-SubSubCategory";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CreateSubSubCategoryModal } from "./CreateSubSubCategoryModal";
import { EditSubSubCategoryModal } from "./EditSubSubCategoryModal";
import { DeleteSubSubCategoryModal } from "./DeleteSubSubCategoryModal";
import { TOTAL_PAGES, COLUMNS } from "./index";
import type { SubSubCategory } from "@/models/SubSubCategory";
import { SORT_ORDERS } from "@/lib/constants";
import { ActionButtons } from "@/components/ActionButtons";

export default function SubSubCategories() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<SubSubCategory | null>(null);

  const { data, isLoading } = useSubSubCategories({
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

  const handleEdit = (subSubCategory: SubSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
    setEditModalOpen(true);
  };

  const handleDelete = (subSubCategory: SubSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
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
        <h1 className="text-3xl font-bold">Sub Sub Category Management</h1>
        <p className="text-muted-foreground mt-2">Manage all your sub sub categories here. You can create, edit, and delete sub sub categories as needed.</p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sub-sub-categories..."
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
           Create New Sub-Sub-Category
        </Button>
      </div>

      <PaginatedDataTable<SubSubCategory>
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

      <CreateSubSubCategoryModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {selectedSubSubCategory && (
        <>
          <EditSubSubCategoryModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedSubSubCategory(null);
            }}
            subSubCategoryId={selectedSubSubCategory.id}
          />

          <DeleteSubSubCategoryModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedSubSubCategory(null);
            }}
            subSubCategoryId={selectedSubSubCategory.id}
            subSubCategoryName={selectedSubSubCategory.name || ""}
          />
        </>
      )}
    </div>
  );
}
