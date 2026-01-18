import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

const TableSearch = ({ onSearch, placeholder = "Cari data..." }) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Logic Debounce: Tunggu 500ms setelah user berhenti mengetik
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  return (
    <div className="flex-1 relative">
      <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        <FaSearch />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="input input-bordered w-full pl-10 rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus:border-[#1C4D8D] transition-all"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default TableSearch;
