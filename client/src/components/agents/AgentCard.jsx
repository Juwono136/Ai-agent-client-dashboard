import { Link } from "react-router-dom";
import {
  FaRobot,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaPowerOff,
  FaDatabase,
} from "react-icons/fa";

/**
 * Enhanced Agent Card Component
 * Professional, clean design with essential information
 */
const AgentCard = ({ agent, onDelete, isSubscriptionExpired = false }) => {
  const getKnowledgeCount = () => {
    return agent.KnowledgeSources?.length || 0;
  };

  return (
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[#1C4D8D]/40 transition-all duration-200 flex flex-col h-full overflow-hidden">
      {/* Header - Professional Gradient */}
      <div className="relative bg-gradient-to-br from-[#1C4D8D] via-blue-600 to-blue-700 p-4 text-white">
        <div className="flex items-start justify-between mb-2.5">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-lg shadow-sm">
            <FaRobot />
          </div>

          {agent.isActive ? (
            <span className="badge badge-sm bg-green-500 text-white border-none font-medium gap-1.5 px-2.5 py-1 shadow-sm">
              <FaCheckCircle size={10} /> Active
            </span>
          ) : (
            <span className="badge badge-sm bg-gray-500/90 text-white border-none font-medium gap-1.5 px-2.5 py-1 shadow-sm">
              <FaPowerOff size={10} /> Inactive
            </span>
          )}
        </div>

        <h3
          className="font-bold text-base text-white mb-1 line-clamp-1 group-hover:text-white/90 transition-colors"
          title={agent.name}
        >
          {agent.name}
        </h3>
        <p className="text-white/80 text-xs line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {agent.description || "Tidak ada deskripsi tersedia untuk agent ini."}
        </p>
      </div>

      {/* Body - Essential Info */}
      <div className="p-4 flex-1 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FaDatabase className="text-[#1C4D8D] text-sm" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Knowledge Base</div>
            <div className="text-sm font-bold text-gray-800">{getKnowledgeCount()} Item</div>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="border-t border-gray-100 p-3 bg-white flex gap-2">
        <Link
          to={`/ai-agents/${agent.id}`}
          className={`btn btn-sm flex-1 border-none rounded-lg gap-2 normal-case font-medium transition-all h-9 ${
            isSubscriptionExpired
              ? "bg-gray-400 text-white cursor-not-allowed pointer-events-none"
              : "bg-[#1C4D8D] hover:bg-[#153e75] text-white"
          }`}
          onClick={(e) => {
            if (isSubscriptionExpired) {
              e.preventDefault();
            }
          }}
        >
          <FaEdit /> Kelola
        </Link>
        <button
          onClick={() => onDelete(agent.id)}
          className="btn btn-sm btn-square bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg transition-all h-9"
          title="Hapus Agent"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default AgentCard;
