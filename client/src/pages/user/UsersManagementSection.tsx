import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionButtons } from "@/components/ActionButtons";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateUser, useDeleteUser, useGetUser, useUpdateUser, useUsers } from "@/hooks/use-User";
import type { User } from "@/models/User";
import { CreateUserModal } from "@/pages/user/CreateUserModal";
import { DeleteUserModal } from "@/pages/user/DeleteUserModal";
import { EditUserModal } from "@/pages/user/EditUserModal";
import {
  BUTTON_LABELS,
  COLUMNS,
  ERROR_MESSAGES,
  SORT_CONFIG,
  TOTAL_PAGES,
  USERS_PAGE,
  type SortField,
  type SortOrder,
} from "@/pages/user";
import type { Column } from "@/components/PaginatedDataTable";
import { Plus, Search } from "lucide-react";

interface UsersManagementSectionProps {
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

export function UsersManagementSection({
  title = USERS_PAGE.TITLE,
  subtitle = USERS_PAGE.SUBTITLE,
  showHeader = true,
}: UsersManagementSectionProps) {
  const { isSuperAdmin, selectedTenantId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(USERS_PAGE.CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(USERS_PAGE.PAGE_SIZE_LENGTH);
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: usersData, isLoading, refetch } = useUsers({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy,
    sortOrder,
  });

  const { data: selectedUser } = useGetUser(selectedUserId);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const columns = useMemo<Column<User>[]>(() => {
    const nextColumns: Column<User>[] = [
      ...COLUMNS.map((column) => ({
        ...column,
        render:
          column.key === "roleDisplayName"
            ? (_value: unknown, item: User) => item.roleDisplayName || item.roleName?.replace(/_/g, " ") || "Not assigned"
            : column.render,
      })),
      {
        key: "twoFactorMethod",
        label: "2FA",
        render: (_value: unknown, item: User) => {
          if (!item.twoFactorMethod) {
            return <Badge variant="secondary">Disabled</Badge>;
          }

          const label = item.twoFactorMethod === "email"
            ? item.twoFactorEnabled ? "Email OTP" : "Email pending"
            : item.twoFactorEnabled ? "Authenticator" : "App pending";

          return <Badge variant={item.twoFactorEnabled ? "default" : "outline"}>{label}</Badge>;
        },
      },
    ];

    if (isSuperAdmin) {
      nextColumns.splice(0, 0, {
        key: "tenantName",
        label: "Tenant",
        render: (_value: unknown, item: User) => item.tenantName || item.tenantId,
      });
    }

    return nextColumns;
  }, [isSuperAdmin]);

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
    if (!selectedUserId) {
      return;
    }

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
    if (!selectedUserId) {
      return;
    }

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
      if (sortOrder === SORT_CONFIG.ORDERS.ASC) {
        setSortOrder(SORT_CONFIG.ORDERS.DESC);
      } else if (sortOrder === SORT_CONFIG.ORDERS.DESC) {
        setSortBy(undefined);
        setSortOrder(undefined);
      }
    } else {
      setSortBy(sortableField);
      setSortOrder(SORT_CONFIG.ORDERS.ASC);
    }

    setCurrentPage(1);
  };

  const renderActions = (row: User) => (
    <ActionButtons onEdit={() => handleEdit(row.id)} onDelete={() => handleDelete(row.id)} />
  );

  const totalPages = TOTAL_PAGES(usersData!);

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2" disabled={isSuperAdmin && !selectedTenantId}>
            <Plus className="h-4 w-4" />
            {BUTTON_LABELS.ADD_USER}
          </Button>
        </div>
      )}

      {!showHeader && (
        <div className="flex justify-end">
          <Button onClick={() => setShowCreateModal(true)} className="gap-2" disabled={isSuperAdmin && !selectedTenantId}>
            <Plus className="h-4 w-4" />
            {BUTTON_LABELS.ADD_USER}
          </Button>
        </div>
      )}

      {isSuperAdmin && !selectedTenantId && (
        <Alert>
          <AlertTitle>Select a tenant to create users</AlertTitle>
          <AlertDescription>
            Super admins can review all users, but creating new users requires a tenant context so roles and permissions stay scoped correctly.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={USERS_PAGE.SEARCH_PLACEHOLDER}
            className="pl-9"
            value={searchTerm}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </div>
      </div>

      <PaginatedDataTable
        columns={columns}
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

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={createUserMutation.isPending}
        tenantId={selectedTenantId}
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
        tenantId={selectedUser?.tenantId || selectedTenantId}
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