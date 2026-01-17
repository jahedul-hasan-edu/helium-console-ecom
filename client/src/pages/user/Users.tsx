import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUser, useUsers, useCreateUser, useDeleteUser, useGetUser } from "@/hooks/use-User";
import { CreateUserModal } from "@/pages/user/CreateUserModal";
import { EditUserModal } from "@/pages/user/EditUserModal";
import { DeleteUserModal } from "@/pages/user/DeleteUserModal";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { COLUMNS, USERS_PAGE, BUTTON_LABELS, ERROR_MESSAGES, ACTION_BUTTONS, SORTABLE_FIELDS, SORT_CONFIG, type SortField, type SortOrder, TOTAL_PAGES } from "@/pages/user";
import type { User } from "@/models/User";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(USERS_PAGE.CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(USERS_PAGE.PAGE_SIZE_LENGTH);
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: usersData, isLoading, refetch } = useUsers({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy: sortBy,
    sortOrder: sortOrder,
  });

  const { data: selectedUser } = useGetUser(selectedUserId);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const { toast } = useToast();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (userId: string) => {
    setSelectedUserId(userId);
    setShowEditModal(true);
  };

  const handleDelete = (userId: string) => {
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  const handleCreate = async (data: any) => {
    try {
      await createUserMutation.mutateAsync(data);
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_USER_FAILED, error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedUserId) return;
    try {
      await updateUserMutation.mutateAsync({ id: selectedUserId, ...data });
      setShowEditModal(false);
      setSelectedUserId(null);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_USER_FAILED, error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUserId) return;
    try {
      await deleteUserMutation.mutateAsync(selectedUserId);
      setShowDeleteModal(false);
      setSelectedUserId(null);
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_USER_FAILED, error);
    }
  };

  const handleSort = (field: keyof User) => {
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

  const renderActions = (row: User) => (
    <ActionButtons
      onEdit={() => handleEdit(row?.id)}
      onDelete={() => handleDelete(row?.id)}
      />
    );

  const totalPages = TOTAL_PAGES(usersData!);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{USERS_PAGE.TITLE}</h1>
          <p className="text-muted-foreground mt-1">{USERS_PAGE.SUBTITLE}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {BUTTON_LABELS.ADD_USER}
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={USERS_PAGE.SEARCH_PLACEHOLDER}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table with Pagination */}
      <PaginatedDataTable
        columns={COLUMNS}
        data={usersData?.items}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage={USERS_PAGE.NO_USERS_MESSAGE}
        renderActions={renderActions}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={usersData?.total || 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={createUserMutation.isPending}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUserId(null);
        }}
        user={selectedUser}
        onSubmit={handleUpdate}
        isLoading={updateUserMutation.isPending}
      />

      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUserId(null);
        }}
        user={selectedUser}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
