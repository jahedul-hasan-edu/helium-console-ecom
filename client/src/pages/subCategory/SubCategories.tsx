import { useState } from "react";
import { useSubCategories } from "@/hooks/use-SubCategory";
import { PaginatedDataTable, Column } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CreateSubCategoryModal } from "./CreateSubCategoryModal";
import { EditSubCategoryModal } from "./EditSubCategoryModal";
import { DeleteSubCategoryModal } from "./DeleteSubCategoryModal";
import { SUB_CATEGORY_SORT_FIELDS, SUB_CATEGORY_FEATURE_TITLE, SUB_CATEGORY_FEATURE_DESCRIPTION } from "./index";
import type { SubCategory } from "@/models/SubCategory";

export default function SubCategories() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

  const { data, isLoading } = useSubCategories({
    page,
    pageSize,
    search: search || undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortBy(undefined);
        setSortOrder(undefined);
      } else {
        setSortOrder("asc");
      }
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleEdit = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setEditModalOpen(true);
  };

  const handleDelete = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setDeleteModalOpen(true);
  };

  const columns: Column<SubCategory>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (_: any, subCategory: SubCategory) => subCategory.name || "-",
    },
    {
      key: "slug",
      label: "Slug",
      sortable: true,
      render: (_: any, subCategory: SubCategory) => subCategory.slug || "-",
    },
    {
      key: "id",
      label: "Category",
      sortable: false,
      render: (_: any, subCategory: SubCategory) => {
        return subCategory.categoryName || "-";
      },
    },
    {
      key: "createdOn",
      label: "Created On",
      sortable: true,
      render: (_: any, subCategory: SubCategory) =>
        subCategory.createdOn
          ? new Date(subCategory.createdOn).toLocaleDateString()
          : "-",
    },
    {
      key: "id",
      label: "Actions",
      sortable: false,
      render: (_: any, subCategory: SubCategory) => (
        <ActionButtons
          onEdit={() => handleEdit(subCategory)}
          onDelete={() => handleDelete(subCategory)}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{SUB_CATEGORY_FEATURE_TITLE}</h1>
        <p className="text-muted-foreground mt-2">{SUB_CATEGORY_FEATURE_DESCRIPTION}</p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sub-categories..."
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
          Create Sub-Category
        </Button>
      </div>

      <PaginatedDataTable<SubCategory>
        columns={columns}
        data={data?.items || []}
        totalItems={data?.total || 0}
        totalPages={Math.ceil((data?.total || 0) / pageSize)}
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
      />

      <CreateSubCategoryModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {selectedSubCategory && (
        <>
          <EditSubCategoryModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedSubCategory(null);
            }}
            subCategoryId={selectedSubCategory.id}
          />

          <DeleteSubCategoryModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedSubCategory(null);
            }}
            subCategoryId={selectedSubCategory.id}
            subCategoryName={selectedSubCategory.name || ""}
          />
        </>
      )}
    </div>
  );
}
