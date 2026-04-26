import {
  createContext,
  useContext,
  type ReactNode,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
} from 'react';
import { clsx } from 'clsx';
import s from './Table.module.scss';

// ---------------------------------------------------------------------------
// Sort context — shared between Table.Head and calling code
// ---------------------------------------------------------------------------
interface SortState {
  sortBy:    string;
  sortOrder: 'asc' | 'desc';
}

interface TableContextValue {
  sort:         SortState | undefined;
  onSort:       ((column: string) => void) | undefined;
  isLoading:    boolean;
  skeletonRows: number;
  columnCount:  number;
}

const TableContext = createContext<TableContextValue>({
  sort: undefined,
  onSort: undefined,
  isLoading: false,
  skeletonRows: 5,
  columnCount: 1,
});
const useTableContext = () => useContext(TableContext);

// ---------------------------------------------------------------------------
// Root <Table>
// ---------------------------------------------------------------------------
export interface TableProps {
  sort?:         SortState;
  onSort?:       (column: string) => void;
  isLoading?:    boolean;
  skeletonRows?: number;   // how many skeleton rows to show (default 5)
  columnCount:   number;   // needed for colSpan on empty/skeleton cells
  className?:    string;
  children:      ReactNode;
}

export function Table({
  sort,
  onSort,
  isLoading = false,
  skeletonRows = 5,
  columnCount,
  className,
  children,
}: TableProps) {
  return (
    <TableContext.Provider value={{ sort, onSort, isLoading, skeletonRows, columnCount }}>
      <div className={clsx(s.wrapper, className)}>
        <table className={s.table}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Table.Toolbar — search + filter bar above the table
// ---------------------------------------------------------------------------
Table.Toolbar = function TableToolbar({
  left,
  right,
}: {
  left?:  ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className={s.toolbar}>
      <div className={s.toolbarLeft}>{left}</div>
      <div className={s.toolbarRight}>{right}</div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Table.Head
// ---------------------------------------------------------------------------
Table.Head = function TableHead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
};

// ---------------------------------------------------------------------------
// Table.HeadRow
// ---------------------------------------------------------------------------
Table.HeadRow = function TableHeadRow({ children }: { children: ReactNode }) {
  return <tr>{children}</tr>;
};

// ---------------------------------------------------------------------------
// Table.Th — with optional sort behaviour
// ---------------------------------------------------------------------------
export interface TableThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Column key — pass to enable sorting for this column */
  sortKey?: string;
  children?: ReactNode;
}

Table.Th = function TableTh({ sortKey, children, className, ...rest }: TableThProps) {
  const { sort, onSort } = useTableContext();
  const isSorted = sort?.sortBy === sortKey;

  function handleClick() {
    if (sortKey && onSort) onSort(sortKey);
  }

  return (
    <th
      className={clsx(sortKey && s.sortable, isSorted && s[sort!.sortOrder], className)}
      onClick={sortKey ? handleClick : undefined}
      aria-sort={isSorted ? (sort!.sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}
      {...rest}
    >
      {children}
      {sortKey && (
        <span className={s.sortIcon} aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1L5 9M5 1L2 4M5 1L8 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </th>
  );
};

// ---------------------------------------------------------------------------
// Table.Body — renders skeleton rows when isLoading
// ---------------------------------------------------------------------------
Table.Body = function TableBody({ children }: { children: ReactNode }) {
  const { isLoading, skeletonRows = 5, columnCount } = useTableContext();

  if (isLoading) {
    return (
      <tbody>
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <tr key={i} className={s.skeletonRow}>
            {Array.from({ length: columnCount }).map((_, j) => (
              <td key={j}>
                <div className={s.skeletonCell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  return <tbody>{children}</tbody>;
};

// ---------------------------------------------------------------------------
// Table.Row
// ---------------------------------------------------------------------------
Table.Row = function TableRow({
  children,
  selected,
  className,
  ...rest
}: {
  children:  ReactNode;
  selected?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      aria-selected={selected}
      className={clsx(selected && 'selected', className)}
      {...rest}
    >
      {children}
    </tr>
  );
};

// ---------------------------------------------------------------------------
// Table.Td
// ---------------------------------------------------------------------------
Table.Td = function TableTd({
  children,
  muted,
  mono,
  className,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & {
  muted?: boolean;
  mono?:  boolean;
}) {
  return (
    <td
      className={clsx(muted && 'muted', mono && 'mono', className)}
      {...rest}
    >
      {children}
    </td>
  );
};

// ---------------------------------------------------------------------------
// Table.Empty — no-data placeholder spanning all columns
// ---------------------------------------------------------------------------
Table.Empty = function TableEmpty({
  title   = 'No results',
  description,
  action,
}: {
  title?:        string;
  description?:  string;
  action?:       ReactNode;
}) {
  const { columnCount } = useTableContext();
  return (
    <tbody>
      <tr>
        <td colSpan={columnCount}>
          <div className={s.empty}>
            {/* Inbox icon */}
            <svg className={s.emptyIcon} viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 22h10l3 4h6l3-4h10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <p className={s.emptyTitle}>{title}</p>
            {description && <p className={s.emptyDesc}>{description}</p>}
            {action}
          </div>
        </td>
      </tr>
    </tbody>
  );
};

// ---------------------------------------------------------------------------
// Table.Pagination
// ---------------------------------------------------------------------------
export interface TablePaginationProps {
  page:        number;
  totalPages:  number;
  total:       number;
  limit:       number;
  onPageChange: (page: number) => void;
}

Table.Pagination = function TablePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: TablePaginationProps) {
  const from  = Math.min((page - 1) * limit + 1, total);
  const to    = Math.min(page * limit, total);

  // Build page numbers: always show first, last, current ± 1, with ellipsis
  function getPages(): (number | '…')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className={s.pagination}>
      <span className={s.paginationInfo}>
        {total === 0 ? 'No results' : `${from}–${to} of ${total}`}
      </span>
      <div className={s.paginationControls}>
        {/* Prev */}
        <button
          className={s.pageBtn}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 9L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className={s.pageBtn} style={{ cursor: 'default', pointerEvents: 'none' }}>…</span>
          ) : (
            <button
              key={p}
              className={clsx(s.pageBtn, p === page && s.active)}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              type="button"
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <button
          className={s.pageBtn}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 9L7.5 6L4.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};