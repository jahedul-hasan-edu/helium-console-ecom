import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { PaginationControls } from "@/components/PaginationControls";

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => ReactNode;
  width?: string;
}

interface EnhancedTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  isLoading: boolean;
  sortBy?: keyof T | string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: keyof T) => void;
  emptyMessage?: string;
  renderActions?: (item: T) => ReactNode;
  // Pagination props
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * Enhanced table component that includes built-in pagination controls
 * Combines DataTable with PaginationControls for a seamless experience
 */
export function PaginatedDataTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  sortBy,
  sortOrder = "asc",
  onSort,
  emptyMessage = "No data found.",
  renderActions,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: EnhancedTableProps<T>) {
  const getSortIcon = (field: keyof T) => {
    if (sortBy !== field) return null;
    if (!sortOrder) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const columnCount = columns.length + (renderActions ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  style={column.width ? { width: column.width } : undefined}
                  className={column.sortable ? "cursor-pointer hover:bg-muted/50 select-none" : ""}
                  onClick={() => column.sortable && onSort && onSort(column.key)}
                >
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </TableHead>
              ))}
              {renderActions && <TableHead className="text-center">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-32 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/5">
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      style={column.width ? { width: column.width } : undefined}
                      className={column.key === "id" ? "font-medium" : ""}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || "N/A")}
                    </TableCell>
                  ))}
                  {renderActions && (
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center">
                        {renderActions(item)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
      />
    </div>
  );
}
