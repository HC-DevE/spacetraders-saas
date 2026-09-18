import { metaHelper, tableFeatures, type ColumnDef, type RowData } from '@tanstack/vue-table'

export type DataTableAlign = 'left' | 'center' | 'right'

export type DataTableColumnMeta = {
  align?: DataTableAlign

  /**
   * Applied to both the header and cells of the column.
   */
  className?: string

  /**
   * Applied only to the header.
   */
  headerClassName?: string

  /**
   * Applied only to body cells.
   */
  cellClassName?: string
}

export const dataTableFeatures = tableFeatures({
  columnMeta: metaHelper<DataTableColumnMeta>(),
})

export type DataTableFeatures = typeof dataTableFeatures

export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData>
