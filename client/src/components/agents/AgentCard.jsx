import { Link } from "react-router-dom";
import { FaRobot, FaEdit, FaTrash, FaCheckCircle, FaPowerOff } from "react-icons/fa";

const AgentCard = ({ agent, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group relative flex flex-col h-full">
      {/* Header Card */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-indigo-50 text-[#1C4D8D] rounded-xl flex items-center justify-center text-xl shadow-sm">
          <FaRobot />
        </div>

        {agent.isActive ? (
          <span className="badge bg-green-50 text-green-600 border-none font-bold gap-1 px-3 py-3">
            <FaCheckCircle size={10} /> Active
          </span>
        ) : (
          <span className="badge bg-gray-100 text-gray-500 border-none font-bold gap-1 px-3 py-3">
            <FaPowerOff size={10} /> Inactive
          </span>
        )}
      </div>

      {/* Body Card */}
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1" title={agent.name}>
          {agent.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 min-h-10">
          {agent.description || "Tidak ada deskripsi tersedia untuk agent ini."}
        </p>
      </div>

      {/* Footer / Actions */}
      <div className="border-t border-gray-50 mt-4 pt-4 flex gap-2">
        <Link
          to={`/ai-agents/${agent.id}`}
          className="btn btn-sm flex-1 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#1C4D8D] normal-case"
        >
          <FaEdit /> Kelola
        </Link>
        <button
          onClick={() => onDelete(agent.id)}
          className="btn btn-sm btn-square btn-ghost text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Hapus Agent"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default AgentCard;
