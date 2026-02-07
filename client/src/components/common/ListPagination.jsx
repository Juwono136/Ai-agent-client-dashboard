import { FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

/**
 * General Reusable Component untuk Pagination
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Halaman saat ini
 * @param {number} props.totalPages - Total halaman
 * @param {number} props.totalItems - Total item
 * @param {number} props.itemsPerPage - Item per halaman
 * @param {Function} props.onPageChange - Handler untuk perubahan halaman
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.itemLabel - Label untuk item (default: "item")
 */
const ListPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
  itemLabel = "item",
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
      {/* Info - Compact */}
      <div className="text-xs text-gray-600">
        Menampilkan <span className="font-semibold text-gray-700">{startItem}</span> -{" "}
        <span className="font-semibold text-gray-700">{endItem}</span> dari{" "}
        <span className="font-semibold text-gray-700">{totalItems}</span> {itemLabel}
      </div>

      {/* Pagination Controls - Compact */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="btn btn-xs btn-outline rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <FaSpinner className="animate-spin text-xs" />
          ) : (
            <FaChevronLeft className="text-xs" />
          )}
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span key={`ellipsis-${index}`} className="px-1 text-gray-400 text-xs">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={`btn btn-xs rounded-lg min-w-[2rem] h-8 ${
                  currentPage === page
                    ? "bg-[#1C4D8D] text-white border-[#1C4D8D]"
                    : "btn-outline hover:bg-gray-50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="btn btn-xs btn-outline rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <FaSpinner className="animate-spin text-xs" />
          ) : (
            <FaChevronRight className="text-xs" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ListPagination;
