import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { useProducts } from "@/hooks/use-Product";
import { useSubCategories } from "@/hooks/use-SubCategory";
import { useSubSubCategories } from "@/hooks/use-SubSubCategory";
import { CreateProductModal } from "./CreateProductModal";
import { EditProductModal } from "./EditProductModal";
import { DeleteProductModal } from "./DeleteProductModal";
import { PRODUCT_PAGE, BASE_COLUMNS, type SortField, type SortOrder, TOTAL_PAGES } from "./index";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/models/Product";
import { Column } from "@/components/PaginatedDataTable";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState("");

  // Build columns with render function for isActive
  const COLUMNS: Column<Product>[] = useMemo(() => 
    BASE_COLUMNS.map(col => {
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

  // Fetch products with pagination
  const { data: productsData, isLoading, error } = useProducts({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy,
    sortOrder,
  });

  // Fetch sub categories and sub-sub categories for display
  const { data: subCategoriesData } = useSubCategories({ pageSize: 1000 });
  const { data: subSubCategoriesData } = useSubSubCategories({ pageSize: 1000 });

  // Create lookup maps
  const subCategoriesMap = useMemo(() => {
    const map = new Map<string, string>();
    subCategoriesData?.items.forEach((sc) => {
      map.set(sc.id, sc.name || "");
    });
    return map;
  }, [subCategoriesData]);

  const subSubCategoriesMap = useMemo(() => {
    const map = new Map<string, string>();
    subSubCategoriesData?.items.forEach((ssc) => {
      map.set(ssc.id, ssc.name || "");
    });
    return map;
  }, [subSubCategoriesData]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (id: string) => {
    setSelectedProductId(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setSelectedProductId(id);
    setSelectedProductName(name);
    setIsDeleteModalOpen(true);
  };

  const handleSort = (field: keyof Product) => {
    const sortField = field as SortField;
    if (sortBy === sortField) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortBy(undefined);
        setSortOrder(undefined);
      }
    } else {
      setSortBy(sortField);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const renderActions = (row: any) => (
    <ActionButtons
      onEdit={() => handleEdit(row.id)}
      onDelete={() => handleDelete(row.id, row.name || "")}
    />
  );

  const totalPages = TOTAL_PAGES(productsData!);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{PRODUCT_PAGE.title}</h1>
          <p className="text-muted-foreground">{PRODUCT_PAGE.subtitle}</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={PRODUCT_PAGE.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <PaginatedDataTable<Product>
        columns={COLUMNS}
        data={productsData?.items || []}
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
        emptyMessage={PRODUCT_PAGE.emptyMessage} totalItems={productsData?.total || 0}
        renderActions={renderActions}
           />

      {/* Modals */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProductId(null);
        }}
        productId={selectedProductId}
      />
      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProductId(null);
          setSelectedProductName("");
        }}
        productId={selectedProductId}
        productName={selectedProductName}
      />
    </div>
  );
}
