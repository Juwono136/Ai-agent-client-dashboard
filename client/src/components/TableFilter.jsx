import { FaFilter } from "react-icons/fa";

const TableFilter = ({ options, value, onChange, label = "Filter" }) => {
  return (
    <div className="w-full md:w-48 relative">
      <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        <FaFilter size={12} />
      </div>
      <select
        className="select select-bordered w-full pl-9 rounded-xl bg-gray-50 focus:bg-white border-gray-200 focus:border-[#1C4D8D] text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TableFilter;
