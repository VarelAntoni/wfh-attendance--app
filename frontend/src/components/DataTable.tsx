import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox, Filter } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchFilter?: (row: T, search: string) => boolean;
  pageSize?: number;
  rightAction?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = 'Cari data...',
  searchFilter,
  pageSize = 10,
  rightAction,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    if (searchFilter) {
      return data.filter((row) => searchFilter(row, searchTerm.toLowerCase()));
    }
    return data.filter((row) =>
      Object.values(row as Record<string, any>).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [data, searchTerm, searchFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] border border-slate-200/90 overflow-hidden">
      {/* Header Toolbar */}
      <div className="px-5 py-3.5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b border-slate-200/80 bg-white">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 transition-colors text-slate-800 placeholder-slate-400"
          />
        </div>
        {rightAction && <div className="flex items-center gap-2">{rightAction}</div>}
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-slate-50/90 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-3 ${col.className || ''}`}>
                      {col.render
                        ? col.render(row, (currentPage - 1) * pageSize + rowIdx)
                        : col.accessor
                        ? String(row[col.accessor] ?? '-')
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                    <span className="text-xs font-medium text-slate-600">Tidak ada data ditemukan</span>
                    {searchTerm && (
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Tidak ada entri yang cocok dengan "{searchTerm}"
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer & Tabular Pagination */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 bg-slate-50/50 text-xs text-slate-500">
        <div className="font-mono tabular-nums text-[11px]">
          Menampilkan{' '}
          <span className="font-semibold text-slate-800">
            {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>
          -
          <span className="font-semibold text-slate-800">
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{' '}
          dari <span className="font-semibold text-slate-800">{filteredData.length}</span> baris data
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 py-0.5 text-[11px] font-mono tabular-nums text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
