import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useUpdateUser, useUsers, useCreateUser, useDeleteUser, useGetUser } from "@/hooks/use-User";
import { CreateUserModal } from "@/pages/user/CreateUserModal";
import { EditUserModal } from "@/pages/user/EditUserModal";
import { DeleteUserModal } from "@/pages/user/DeleteUserModal";
import { DataTable, Column } from "@/components/DataTable";
import { PaginationControls } from "@/components/PaginationControls";
import type { User } from "@/models/User";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<"firstName" | "lastName" | "email" | "createdOn">("createdOn");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Modal states
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
      console.error("Failed to create user:", error);
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
      console.error("Failed to update user:", error);
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
      console.error("Failed to delete user:", error);
    }
  };

  const handleSort = (field: keyof User) => {
    const sortableField = field as "firstName" | "lastName" | "email" | "createdOn";
    if (sortBy === sortableField) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Change field and default to desc
      setSortBy(sortableField);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const columns: Column<User>[] = [
    {
      key: "firstName",
      label: "First Name",
      sortable: true,
    },
    {
      key: "lastName",
      label: "Last Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "mobile",
      label: "Mobile",
    },
    {
      key: "createdOn",
      label: "Created On",
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : "N/A",
    },
  ];

  const renderActions = (user: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          ⋯
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEdit(user.id)} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDelete(user.id)}
          className="gap-2 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const totalPages = usersData ? Math.ceil(usersData.total / usersData.pageSize) : 0;
  const startRow = usersData ? (currentPage - 1) * pageSize + 1 : 0;
  const endRow = usersData ? Math.min(currentPage * pageSize, usersData.total) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">Manage system users and permissions.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={usersData?.items}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No users found."
        renderActions={renderActions}
      />

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={usersData?.total || 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        isLoading={isLoading}
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
