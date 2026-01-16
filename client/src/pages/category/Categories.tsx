import { useState, useMemo } from "react";
import { useCategories } from "@/hooks/use-Category";
import { useMainCategories } from "@/hooks/use-MainCategory";
import { PaginatedDataTable, Column } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { EditCategoryModal } from "./EditCategoryModal";
import { DeleteCategoryModal } from "./DeleteCategoryModal";
import { CATEGORY_PAGE_SIZE_OPTIONS, CATEGORY_SORT_FIELDS, CATEGORY_FEATURE_TITLE, CATEGORY_FEATURE_DESCRIPTION } from "./index";
import type { Category } from "@/models/Category";

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

  // Fetch all main categories for lookup
  const { data: mainCategoriesData } = useMainCategories({
    pageSize: 1000, // Fetch all for lookup
  });

  const mainCategoriesMap = useMemo(() => {
    const map = new Map();
    if (mainCategoriesData?.items) {
      mainCategoriesData.items.forEach((mc) => {
        map.set(mc.id, mc);
      });
    }
    return map;
  }, [mainCategoriesData]);

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

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const columns: Column<Category>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (_: any, category: Category) => category.name || "-",
    },
    {
      key: "slug",
      label: "Slug",
      sortable: true,
      render: (_: any, category: Category) => category.slug || "-",
    },
    {
      key: "id",
      label: "Main Category",
      sortable: false,
      render: (_: any, category: Category) => {
        if (!category.mainCategoryId) return "-";
        const mainCategory = mainCategoriesMap.get(category.mainCategoryId);
        return mainCategory?.name || category.mainCategoryId;
      },
    },
    {
      key: "createdOn",
      label: "Created On",
      sortable: true,
      render: (_: any, category: Category) =>
        category.createdOn
          ? new Date(category.createdOn).toLocaleDateString()
          : "-",
    },
    {
      key: "id",
      label: "Actions",
      sortable: false,
      render: (_: any, category: Category) => (
        <ActionButtons
          onEdit={() => handleEdit(category)}
          onDelete={() => handleDelete(category)}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{CATEGORY_FEATURE_TITLE}</h1>
        <p className="text-muted-foreground mt-2">{CATEGORY_FEATURE_DESCRIPTION}</p>
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
