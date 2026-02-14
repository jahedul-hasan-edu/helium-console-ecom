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
import { useUpdateFaq, useFaqs, useCreateFaq, useDeleteFaq } from "@/hooks/use-Faq";
import { useTenants } from "@/hooks/use-Tenant";
import { CreateFaqModal } from "@/pages/faq/CreateFaqModal";
import { EditFaqModal } from "@/pages/faq/EditFaqModal";
import { DeleteFaqModal } from "@/pages/faq/DeleteFaqModal";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { COLUMNS, FAQS_PAGE, BUTTON_LABELS, ERROR_MESSAGES, ACTION_BUTTONS, SORTABLE_FIELDS, SORT_CONFIG, type SortField, type SortOrder, TOTAL_PAGES } from "@/pages/faq";
import type { Faq } from "@/models/Faq";

export default function Faqs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [currentPage, setCurrentPage] = useState(FAQS_PAGE.CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(FAQS_PAGE.PAGE_SIZE_LENGTH);
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);

  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({
    pageSize: 1000,
  });

  const { data: faqsData, isLoading } = useFaqs({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy: sortBy,
    sortOrder: sortOrder,
    tenantId: selectedTenantId,
  } as any);

  const selectedFaq = useMemo(
    () => faqsData?.items?.find((faq) => faq.id === selectedFaqId),
    [faqsData?.items, selectedFaqId]
  );
  const createFaqMutation = useCreateFaq();
  const updateFaqMutation = useUpdateFaq();
  const deleteFaqMutation = useDeleteFaq();
  const { toast } = useToast();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setCurrentPage(1);
  };

  const handleEdit = (faqId: string) => {
    setSelectedFaqId(faqId);
    setShowEditModal(true);
  };

  const handleDelete = (faqId: string) => {
    setSelectedFaqId(faqId);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: any) => {
    try {
      await createFaqMutation.mutateAsync(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_FAQ_FAILED, error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedFaqId) return;
    try {
      await updateFaqMutation.mutateAsync({ id: selectedFaqId, ...data });
      setShowEditModal(false);
      setSelectedFaqId(null);
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_FAQ_FAILED, error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFaqId) return;
    try {
      await deleteFaqMutation.mutateAsync(selectedFaqId);
      setShowDeleteModal(false);
      setSelectedFaqId(null);
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_FAQ_FAILED, error);
    }
  };

  const handleSort = (field: keyof Faq) => {
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

  const renderActions = (row: Faq) => (
    <ActionButtons
      onEdit={() => handleEdit(row?.id)}
      onDelete={() => handleDelete(row?.id)}
    />
  );

  const totalPages = TOTAL_PAGES(faqsData);

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
          <h1 className="text-3xl font-bold tracking-tight">{FAQS_PAGE.TITLE}</h1>
          <p className="text-muted-foreground mt-1">{FAQS_PAGE.SUBTITLE}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {BUTTON_LABELS.ADD_FAQ}
        </Button>
      </div>

      {/* Filters: Tenant Dropdown and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tenant Dropdown Filter */}
        <div className="w-full sm:w-48">
          <Select value={selectedTenantId} onValueChange={handleTenantChange} disabled={tenantsLoading}>
            <SelectTrigger>
              <SelectValue placeholder={FAQS_PAGE.TENANT_FILTER_PLACEHOLDER} />
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
            placeholder={FAQS_PAGE.SEARCH_PLACEHOLDER}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table with Pagination */}
      <PaginatedDataTable
        columns={columns}
        data={faqsData?.items}
        isLoading={isLoading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={faqsData?.total || 0}
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
      <CreateFaqModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={createFaqMutation.isPending}
      />

      <EditFaqModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedFaqId(null);
        }}
        onSubmit={handleUpdate}
        isLoading={updateFaqMutation.isPending}
        faq={selectedFaq}
      />

      <DeleteFaqModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedFaqId(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteFaqMutation.isPending}
        faq={selectedFaq}
      />
    </div>
  );
}
