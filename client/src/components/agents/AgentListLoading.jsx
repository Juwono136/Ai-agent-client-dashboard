import { FaSpinner, FaRobot } from "react-icons/fa";

/**
 * Loading Component for Agent List
 * Modular loading indicator for search, filter, sort, and pagination
 */
const AgentListLoading = ({ type = "grid", message = "Memuat data..." }) => {
  if (type === "grid") {
    // Skeleton loading for grid
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
          >
            {/* Header skeleton */}
            <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-32"></div>
            {/* Body skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            {/* Footer skeleton */}
            <div className="border-t border-gray-100 p-3 bg-gray-50 flex gap-2">
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "inline") {
    // Inline loading indicator
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-2xl text-[#1C4D8D]" />
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      </div>
    );
  }

  if (type === "overlay") {
    // Overlay loading (for filters)
    return (
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
        <div className="flex flex-col items-center gap-2">
          <FaSpinner className="animate-spin text-xl text-[#1C4D8D]" />
          <p className="text-xs text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AgentListLoading;
