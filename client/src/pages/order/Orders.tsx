import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginatedDataTable } from "@/components/PaginatedDataTable";
import { ActionButtons } from "@/components/ActionButtons";
import { useCreateOrder, useDeleteOrder, useOrder, useOrders, useUpdateOrder } from "@/hooks/use-Order";
import type { Order } from "@/models/Order";
import { CreateOrderModal } from "@/pages/order/CreateOrderModal";
import { DeleteOrderModal } from "@/pages/order/DeleteOrderModal";
import { EditOrderModal } from "@/pages/order/EditOrderModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import {
  BUTTON_LABELS,
  COLUMNS,
  formatOrderStatusLabel,
  ORDERS_PAGE,
  SORTABLE_FIELDS,
  SORT_CONFIG,
  TOTAL_PAGES,
  type SortField,
  type SortOrder,
} from "@/pages/order";
import { Plus, Search } from "lucide-react";

function formatDate(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString();
}

function getStatusBadgeProps(status: string | null) {
  const normalizedStatus = status?.toLowerCase();

  if (normalizedStatus === "cancelled") {
    return {
      variant: "destructive" as const,
      className: "",
    };
  }

  if (normalizedStatus === "delivered") {
    return {
      variant: "default" as const,
      className: "bg-green-500 hover:bg-green-600",
    };
  }

  if (["confirmed", "processing", "shipped"].includes(normalizedStatus || "")) {
    return {
      variant: "default" as const,
      className: "bg-blue-500 hover:bg-blue-600",
    };
  }

  return {
    variant: "default" as const,
    className: "bg-amber-500 hover:bg-amber-600",
  };
}

export default function Orders() {
  const { isSuperAdmin, selectedTenantId, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortField>(SORTABLE_FIELDS.CREATED_ON);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_CONFIG.ORDERS.DESC);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const activeTenantId = selectedTenantId || user?.tenantId || undefined;
  const tenantScopeReady = !isSuperAdmin || !!activeTenantId;
  const { data: ordersData, isLoading } = useOrders({
    page: currentPage,
    pageSize,
    search: searchTerm,
    sortBy,
    sortOrder,
    tenantId: activeTenantId,
  }, tenantScopeReady);
  const { data: selectedOrderFromApi } = useOrder(selectedOrderId, activeTenantId, tenantScopeReady);

  const selectedOrderFromList = useMemo(
    () => ordersData?.items?.find((order) => order.id === selectedOrderId),
    [ordersData?.items, selectedOrderId]
  );
  const selectedOrder = selectedOrderFromList || selectedOrderFromApi;
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();
  const deleteMutation = useDeleteOrder();

  const columns = useMemo(
    () =>
      COLUMNS.map((column) => {
        if (column.key === "id") {
          return {
            ...column,
            render: (value: string | null) =>
              value ? (
                <span className="font-mono text-xs" title={value}>
                  {`${value.slice(0, 8)}...${value.slice(-4)}`}
                </span>
              ) : (
                "N/A"
              ),
          };
        }

        if (column.key === "tenantId") {
          return {
            ...column,
            render: (value: string | null) => value || "Unassigned",
          };
        }

        if (column.key === "status") {
          return {
            ...column,
            render: (value: string | null) => {
              const badgeProps = getStatusBadgeProps(value);
              return (
                <Badge variant={badgeProps.variant} className={badgeProps.className}>
                  {formatOrderStatusLabel(value)}
                </Badge>
              );
            },
          };
        }

        if (column.key === "email") {
          return {
            ...column,
            render: (_value: string | null, order: Order) => (
              <div className="space-y-1">
                <p>{order.email || "N/A"}</p>
                <p className="text-xs text-muted-foreground">{order.mobile || "No mobile"}</p>
              </div>
            ),
          };
        }

        if (column.key === "deliveryTime") {
          return {
            ...column,
            render: (_value: string | null, order: Order) => (
              <div className="space-y-1">
                <p>{order.deliveryTime || "N/A"}</p>
                <p className="text-xs text-muted-foreground">{order.timeZone || "No time zone"}</p>
              </div>
            ),
          };
        }

        if (column.key === "reusableBag") {
          return {
            ...column,
            render: (value: boolean | null) => (
              <Badge variant={value ? "default" : "outline"} className={value ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                {value ? "Yes" : "No"}
              </Badge>
            ),
          };
        }

        if (column.key === "createdOn") {
          return {
            ...column,
            render: (value: string | null) => formatDate(value),
          };
        }

        return column;
      }),
    []
  );

  const handleSort = (field: keyof Order) => {
    const sortableField = field as SortField;

    if (sortBy === sortableField) {
      setSortOrder((previous) =>
        previous === SORT_CONFIG.ORDERS.DESC ? SORT_CONFIG.ORDERS.ASC : SORT_CONFIG.ORDERS.DESC
      );
    } else {
      setSortBy(sortableField);
      setSortOrder(
        sortableField === SORTABLE_FIELDS.CREATED_ON ? SORT_CONFIG.ORDERS.DESC : SORT_CONFIG.ORDERS.ASC
      );
    }

    setCurrentPage(1);
  };

  const totalPages = TOTAL_PAGES(ordersData);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{ORDERS_PAGE.TITLE}</h1>
          <p className="mt-1 text-muted-foreground">{ORDERS_PAGE.SUBTITLE}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2" disabled={!tenantScopeReady}>
          <Plus className="h-4 w-4" />
          {BUTTON_LABELS.ADD_ORDER}
        </Button>
      </div>

      {!tenantScopeReady ? (
        <Alert>
          <AlertTitle>Select a tenant first</AlertTitle>
          <AlertDescription>Select a tenant from the top navigation to view or create orders.</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            className="pl-9"
            placeholder={ORDERS_PAGE.SEARCH_PLACEHOLDER}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <PaginatedDataTable
        columns={columns}
        data={ordersData?.items}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage={ORDERS_PAGE.EMPTY_MESSAGE}
        renderActions={(order) => (
          <ActionButtons
            onEdit={() => {
              setSelectedOrderId(order.id);
              setShowEditModal(true);
            }}
            onDelete={() => {
              setSelectedOrderId(order.id);
              setShowDeleteModal(true);
            }}
          />
        )}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={ordersData?.total || 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      <CreateOrderModal
        isOpen={showCreateModal}
        isLoading={createMutation.isPending}
        onClose={() => setShowCreateModal(false)}
        tenantId={activeTenantId}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
      />

      <EditOrderModal
        isOpen={showEditModal}
        order={selectedOrder}
        isLoading={updateMutation.isPending}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrderId(null);
        }}
        tenantId={selectedOrder?.tenantId || activeTenantId}
        onSubmit={async (data) => {
          if (!selectedOrderId) {
            return;
          }

          await updateMutation.mutateAsync({
            id: selectedOrderId,
            data,
            currentTenantId: selectedOrder?.tenantId || undefined,
          });
        }}
      />

      <DeleteOrderModal
        isOpen={showDeleteModal}
        order={selectedOrder}
        isLoading={deleteMutation.isPending}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOrderId(null);
        }}
        onConfirm={() => {
          if (!selectedOrderId) {
            return Promise.resolve();
          }

          return deleteMutation.mutateAsync({
            id: selectedOrderId,
            tenantId: selectedOrder?.tenantId || undefined,
          });
        }}
      />
    </div>
  );
}