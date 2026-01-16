import { useState, useMemo } from "react";
import { useSubSubCategories } from "@/hooks/use-SubSubCategory";
import { useSubCategories } from "@/hooks/use-SubCategory";
import { PaginatedDataTable, Column } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CreateSubSubCategoryModal } from "./CreateSubSubCategoryModal";
import { EditSubSubCategoryModal } from "./EditSubSubCategoryModal";
import { DeleteSubSubCategoryModal } from "./DeleteSubSubCategoryModal";
import { SUB_SUB_CATEGORY_PAGE_SIZE_OPTIONS, SUB_SUB_CATEGORY_SORT_FIELDS, SUB_SUB_CATEGORY_FEATURE_TITLE, SUB_SUB_CATEGORY_FEATURE_DESCRIPTION } from "./index";
import type { SubSubCategory } from "@/models/SubSubCategory";

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

  // Fetch all sub categories for lookup
  const { data: subCategoriesData } = useSubCategories({
    pageSize: 1000, // Fetch all for lookup
  });

  const subCategoriesMap = useMemo(() => {
    const map = new Map();
    if (subCategoriesData?.items) {
      subCategoriesData.items.forEach((sc) => {
        map.set(sc.id, sc);
      });
    }
    return map;
  }, [subCategoriesData]);

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

  const handleEdit = (subSubCategory: SubSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
    setEditModalOpen(true);
  };

  const handleDelete = (subSubCategory: SubSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
    setDeleteModalOpen(true);
  };

  const columns: Column<SubSubCategory>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (_: any, subSubCategory: SubSubCategory) => subSubCategory.name || "-",
    },
    {
      key: "slug",
      label: "Slug",
      sortable: true,
      render: (_: any, subSubCategory: SubSubCategory) => subSubCategory.slug || "-",
    },
    {
      key: "id",
      label: "Sub Category",
      sortable: false,
      render: (_: any, subSubCategory: SubSubCategory) => {
        if (!subSubCategory.subCategoryId) return "-";
        const subCategory = subCategoriesMap.get(subSubCategory.subCategoryId);
        return subCategory?.name || subSubCategory.subCategoryId;
      },
    },
    {
      key: "createdOn",
      label: "Created On",
      sortable: true,
      render: (_: any, subSubCategory: SubSubCategory) =>
        subSubCategory.createdOn
          ? new Date(subSubCategory.createdOn).toLocaleDateString()
          : "-",
    },
    {
      key: "id",
      label: "Actions",
      sortable: false,
      render: (_: any, subSubCategory: SubSubCategory) => (
        <ActionButtons
          onEdit={() => handleEdit(subSubCategory)}
          onDelete={() => handleDelete(subSubCategory)}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{SUB_SUB_CATEGORY_FEATURE_TITLE}</h1>
        <p className="text-muted-foreground mt-2">{SUB_SUB_CATEGORY_FEATURE_DESCRIPTION}</p>
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
          Create Sub-Sub-Category
        </Button>
      </div>

      <PaginatedDataTable<SubSubCategory>
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
