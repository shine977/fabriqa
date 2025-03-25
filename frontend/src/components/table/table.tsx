
import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table as TanstackTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableToolbar, Options } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
interface TableProps<TData> {
  dataSource: TData[];
  columns: ColumnDef<TData>[];
  className?: string;
  enableRowSelection?: boolean;
  enableColumnFilters?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  searchOptions?: Options[];
  filterOptions?: {
    columnId: string;
    title: string;
    options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
  }[];
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  globalFilterColumnId?: string;
}

declare module "@tanstack/react-table" {
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string;
  }
}

export function Table<TData>({
  dataSource,
  columns,
  className,
  enableRowSelection = true,
  enableColumnFilters = true,
  enableSorting = true,
  enablePagination = true,
  filterOptions = [],
  searchOptions = [],
  onRowSelectionChange,
  globalFilterColumnId = "name",
}: TableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const { t } = useTranslation();
  const table = useReactTable({
    data: dataSource,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      if (onRowSelectionChange) {
        const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
        onRowSelectionChange(selectedRows);
      }
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: enableColumnFilters ? setColumnFilters : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableColumnFilters ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFacetedRowModel: enableColumnFilters ? getFacetedRowModel() : undefined,
    getFacetedUniqueValues: enableColumnFilters ? getFacetedUniqueValues() : undefined,
  });

  return (
    <div className={cn("space-y-4", className)}>
      {(enableColumnFilters || table.getAllColumns().some((col) => col.getCanHide())) && (
        <DataTableToolbar
          table={table}
          filterOptions={filterOptions}
          globalFilterColumnId={globalFilterColumnId}
          options={searchOptions}
        />
      )}
      <div className="rounded-md border">
        <TanstackTable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={header.column.columnDef.meta?.className ?? ""}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className ?? ""}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                {t("table.noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TanstackTable>
      </div>
      {enablePagination && <DataTablePagination table={table} />}
    </div>
  );
}