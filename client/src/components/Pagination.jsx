const Pagination = ({ currentPage, totalPages, totalData, onPageChange }) => {
  return (
    <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
      <span className="text-xs text-gray-500 font-medium">
        Menampilkan data {totalData > 0 ? currentPage : 0} dari total {totalData} entries
      </span>

      <div className="join shadow-sm">
        <button
          className="join-item btn btn-sm bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:bg-gray-50"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          « Prev
        </button>

        <button className="join-item btn btn-sm bg-[#1C4D8D] text-white border-none pointer-events-none">
          Page {currentPage} of {totalPages || 1}
        </button>

        <button
          className="join-item btn btn-sm bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:bg-gray-50"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
