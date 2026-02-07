import { FaSearch, FaFilter, FaSort, FaSpinner, FaTimes } from "react-icons/fa";

/**
 * General Reusable Component untuk Search, Filter, dan Sort
 * 
 * @param {Object} props
 * @param {Function} props.onSearchChange - Handler untuk perubahan search query
 * @param {Function} props.onFilterChange - Handler untuk perubahan filter
 * @param {Function} props.onSortChange - Handler untuk perubahan sort (menerima { sortBy, sortOrder })
 * @param {Object} props.filters - Object berisi { searchQuery, statusFilter, sortBy, sortOrder }
 * @param {boolean} props.isLoading - Loading state
 * @param {Object} props.config - Konfigurasi untuk kustomisasi
 * @param {string} props.config.searchPlaceholder - Placeholder untuk search input
 * @param {Array} props.config.filterOptions - Array of { value, label } untuk filter dropdown
 * @param {Array} props.config.sortOptions - Array of { value, label } untuk sort dropdown
 * @param {Function} props.config.getFilterLabel - Function untuk mendapatkan label filter yang aktif (optional)
 */
const ListFilters = ({
  onSearchChange,
  onFilterChange,
  onSortChange,
  filters,
  isLoading = false,
  config = {},
}) => {
  const {
    searchPlaceholder = "Cari...",
    filterOptions = [],
    sortOptions = [],
    getFilterLabel = (value) => value,
  } = config;

  const hasActiveFilters = filters.searchQuery || filters.statusFilter !== "all";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      {/* Single Row Layout - Professional */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Bar - Prominent */}
        <div className="flex-1 lg:max-w-sm">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Pencarian
          </label>
          <div className="relative">
            <div className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {isLoading && filters.searchQuery ? (
                <FaSpinner className="animate-spin text-sm text-[#1C4D8D]" title="Mencari..." />
              ) : (
                <FaSearch className="text-sm text-gray-400" />
              )}
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={filters.searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input input-bordered w-full pl-10 pr-10 rounded-lg focus:ring-2 focus:ring-[#1C4D8D] focus:border-[#1C4D8D] text-sm h-10 bg-white"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 z-20"
                type="button"
                title="Hapus pencarian"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Filter and Sort Controls - Clear Labels */}
        {filterOptions.length > 0 || sortOptions.length > 0 ? (
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-nowrap lg:items-end">
            {/* Status Filter */}
            {filterOptions.length > 0 && (
              <div className="flex-1 sm:flex-initial sm:w-44">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <FaFilter className="text-[#1C4D8D]" />
                  Filter Status
                </label>
                <select
                  value={filters.statusFilter || "all"}
                  onChange={(e) => onFilterChange(e.target.value)}
                  disabled={isLoading}
                  className="select select-bordered w-full rounded-lg focus:ring-2 focus:ring-[#1C4D8D] focus:border-[#1C4D8D] text-sm h-10 disabled:opacity-60 disabled:cursor-wait bg-white"
                >
                  {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort By */}
            {sortOptions.length > 0 && (
              <div className="flex-1 sm:flex-initial sm:w-44">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <FaSort className="text-[#1C4D8D]" />
                  Urutkan Berdasarkan
                </label>
                <select
                  value={filters.sortBy || sortOptions[0]?.value}
                  onChange={(e) => onSortChange({ sortBy: e.target.value, sortOrder: filters.sortOrder })}
                  disabled={isLoading}
                  className="select select-bordered w-full rounded-lg focus:ring-2 focus:ring-[#1C4D8D] focus:border-[#1C4D8D] text-sm h-10 disabled:opacity-60 disabled:cursor-wait bg-white"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Order */}
            {sortOptions.length > 0 && (
              <div className="flex-1 sm:flex-initial sm:w-36">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Urutan
                </label>
                <select
                  value={filters.sortOrder || "desc"}
                  onChange={(e) => onSortChange({ sortBy: filters.sortBy, sortOrder: e.target.value })}
                  disabled={isLoading}
                  className="select select-bordered w-full rounded-lg focus:ring-2 focus:ring-[#1C4D8D] focus:border-[#1C4D8D] text-sm h-10 disabled:opacity-60 disabled:cursor-wait bg-white"
                >
                  <option value="asc">A-Z / Terlama</option>
                  <option value="desc">Z-A / Terbaru</option>
                </select>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Filter Aktif:</span>
          {filters.searchQuery && (
            <span className="badge badge-sm badge-primary gap-1.5">
              Pencarian: "{filters.searchQuery}"
              <button
                onClick={() => onSearchChange("")}
                className="hover:bg-primary-focus rounded-full p-0.5"
                type="button"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          )}
          {filters.statusFilter && filters.statusFilter !== "all" && (
            <span className="badge badge-sm badge-secondary gap-1.5">
              Status: {getFilterLabel(filters.statusFilter)}
              <button
                onClick={() => onFilterChange("all")}
                className="hover:bg-secondary-focus rounded-full p-0.5"
                type="button"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ListFilters;
