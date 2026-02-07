import { FaSpinner } from "react-icons/fa";

/**
 * Komponen StatCard untuk Admin Dashboard
 * Menampilkan statistik dengan icon, value, dan description
 */
const AdminStatCard = ({ title, value, icon, colorClass, desc, isLoading }) => (
  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div className="flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{title}</p>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <FaSpinner className="animate-spin text-gray-400" />
            <span className="text-gray-400">Loading...</span>
          </div>
        ) : (
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{value}</h3>
        )}
      </div>
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
    </div>
    {desc && <p className="text-xs text-gray-400">{desc}</p>}
  </div>
);

export default AdminStatCard;
