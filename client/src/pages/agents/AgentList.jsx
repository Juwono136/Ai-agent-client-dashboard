import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaPlus, FaRobot } from "react-icons/fa";
import { getAgents, deleteAgent, resetAgentState } from "../../features/agents/agentSlice";
import toast from "react-hot-toast";

// IMPORT COMPONENT BARU
import AgentCard from "../../components/agents/AgentCard";
import Loader from "../../components/Loader"; // Pastikan loader ada
import ConfirmationModal from "../../components/ConfirmationModal";

const AgentList = () => {
  const dispatch = useDispatch();
  const { agents, isLoading, isError, message, isSuccess } = useSelector((state) => state.agents);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    agentId: null,
  });

  useEffect(() => {
    dispatch(getAgents());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message, { id: "agent-list-status" });
      dispatch(resetAgentState());
    }
    if (isSuccess && message) {
      toast.success(message, { id: "agent-list-status" });
      dispatch(resetAgentState());
    }
  }, [isError, isSuccess, message, dispatch]);

  const handleDelete = (id) => {
    setConfirmState({ isOpen: true, agentId: id });
  };

  const closeDeleteConfirm = () => {
    setConfirmState({ isOpen: false, agentId: null });
  };

  const handleConfirmDelete = async () => {
    if (!confirmState.agentId) return;
    try {
      await dispatch(deleteAgent(confirmState.agentId)).unwrap();
    } finally {
      closeDeleteConfirm();
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My AI Agents</h1>
          <p className="text-gray-500 text-sm">Kelola asisten AI Agent kamu disini</p>
        </div>
        <Link
          to="/ai-agents/create"
          className="btn bg-[#1C4D8D] text-white hover:bg-[#153e75] border-none rounded-xl gap-2 shadow-lg normal-case"
        >
          <FaPlus /> Buat Agent Baru
        </Link>
      </div>

      {/* CONTENT */}
      {isLoading && agents.length === 0 ? (
        <Loader type="block" text="Memuat daftar agents..." />
      ) : agents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <FaRobot />
          </div>
          <h3 className="font-bold text-gray-600">Belum ada Agent</h3>
          <p className="text-sm text-gray-400 mb-6">Mulai buat AI Agent pertamamu sekarang.</p>
          <Link to="/ai-agents/create" className="btn btn-sm btn-outline normal-case">
            Buat Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* MENGGUNAKAN AGENT CARD MODULAR */}
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Hapus Agent?"
        message="Yakin ingin menghapus agent ini? Data yang dihapus tidak dapat dikembalikan."
        variant="danger"
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
};

export default AgentList;
