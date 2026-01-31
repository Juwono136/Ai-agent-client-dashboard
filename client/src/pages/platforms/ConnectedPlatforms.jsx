import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
  resetPlatformState,
} from "../../features/platforms/platformSlice";
import { getAgents } from "../../features/agents/agentSlice";
import {
  FaWhatsapp,
  FaRobot,
  FaPlus,
  FaEllipsisV,
  FaTrash,
  FaPen,
  FaExclamationTriangle,
  FaQrcode,
} from "react-icons/fa";
import toast from "react-hot-toast";

import PlatformModal from "../../components/platforms/PlatformModal";
import Loader from "../../components/Loader";
import ConfirmationModal from "../../components/ConfirmationModal";

const ConnectedPlatforms = () => {
  const dispatch = useDispatch();
  const { platforms, isLoading, isError, message } = useSelector((state) => state.platforms);
  const { agents } = useSelector((state) => state.agents);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [confirmState, setConfirmState] = useState({ isOpen: false, platform: null });

  const [loadingText, setLoadingText] = useState("Memproses...");

  useEffect(() => {
    dispatch(getPlatforms());
    dispatch(getAgents());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(resetPlatformState());
    }
  }, [isError, message, dispatch]);

  const handleOpenCreate = () => {
    setSelectedPlatform(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (platform) => {
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (platform) => {
    setConfirmState({ isOpen: true, platform });
  };

  const handleCloseDeleteConfirm = () => {
    setConfirmState({ isOpen: false, platform: null });
  };

  const handleConfirmDelete = async () => {
    if (!confirmState.platform) return;
    setLoadingText("Menghapus koneksi...");
    const resultAction = await dispatch(deletePlatform(confirmState.platform.id));
    if (deletePlatform.fulfilled.match(resultAction)) {
      toast.success("Koneksi berhasil dihapus");
      handleCloseDeleteConfirm();
    }
  };

  // Handler Create/Update
  const handleModalSubmit = async (formData) => {
    setLoadingText("Menyimpan konfigurasi..."); // Set teks
    if (selectedPlatform) {
      const resultAction = await dispatch(
        updatePlatform({ id: selectedPlatform.id, platformData: formData }),
      );
      if (updatePlatform.fulfilled.match(resultAction)) {
        toast.success("Konfigurasi berhasil diperbarui");
      }
      return null;
    } else {
      const resultAction = await dispatch(createPlatform(formData));
      if (createPlatform.fulfilled.match(resultAction)) {
        const created = resultAction.payload.data;
        // Set agar modal langsung masuk mode scan QR
        setSelectedPlatform(created);
        toast.success("Koneksi berhasil ditambahkan");
        return created;
      }
      return null;
    }
  };

  if (isLoading && platforms.length === 0) {
    return <Loader type="block" text="Memuat koneksi..." />;
  }

  // Helper untuk Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "WORKING":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold border border-green-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            CONNECTED
          </div>
        );
      case "SCANNING":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600 text-xs font-bold border border-yellow-100">
            <FaQrcode className="animate-pulse" /> SCAN QR
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200">
            <FaExclamationTriangle /> {status}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {isLoading && platforms.length > 0 && (
        <Loader type="fullscreen" text="Memproses permintaan..." />
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Connected Platforms
          </h1>
          <p className="text-gray-500 mt-1">Kelola koneksi WhatsApp agar terhubung dengan AI Agent.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn bg-[#1C4D8D] hover:bg-[#153e75] text-white border-none shadow-lg shadow-blue-900/20 rounded-xl gap-2 px-6"
        >
          <FaPlus size={14} /> Tambah Nomor
        </button>
      </div>

      {/* CONTENT */}
      {platforms.length === 0 ? (
        // EMPTY STATE
        <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-3xl text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <FaWhatsapp size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Belum ada WhatsApp Terhubung</h3>
          <p className="text-gray-500 mt-2 max-w-md">
            Hubungkan platform anda dengan AI Agent untuk memulai bekerja.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl px-8"
          >
            Mulai Koneksi
          </button>
        </div>
      ) : (
        // CARD GRID
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((pf) => (
            <div
              key={pf.id}
              className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Card Top */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${pf.status === "WORKING" ? "bg-linear-to-br from-green-400 to-green-600 text-white" : "bg-gray-100 text-gray-400"}`}
                  >
                    <FaWhatsapp size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 truncate max-w-37.5">{pf.name}</h3>
                    <div className="mt-1">{getStatusBadge(pf.status)}</div>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-ghost btn-xs btn-circle text-gray-400 hover:bg-gray-100"
                  >
                    <FaEllipsisV />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-1 menu p-2 shadow-lg bg-white rounded-xl w-40 border border-gray-100 mt-2"
                  >
                    <li>
                      <a
                        onClick={() => handleOpenEdit(pf)}
                        className="gap-2 font-medium text-gray-600"
                      >
                        <FaPen className="text-xs" /> Edit
                      </a>
                    </li>
                    <li>
                      <a
                        onClick={() => handleOpenDeleteConfirm(pf)}
                        className="gap-2 text-red-600 hover:bg-red-50 font-medium"
                      >
                        <FaTrash className="text-xs" /> Hapus
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 transition-colors group-hover:bg-blue-50/50 group-hover:border-blue-100">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <FaRobot className="text-[#1C4D8D]" />
                    <span className="font-medium">AI Agent</span>
                  </div>
                  {/* FIX DISPLAY AGENT NAME: Sekarang pasti ada karena Backend sudah diperbaiki */}
                  <span className="text-sm font-bold text-gray-800 truncate max-w-30">
                    {pf.Agent ? (
                      pf.Agent.name
                    ) : (
                      <span className="text-red-400 text-xs italic">Belum Dipilih</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-[10px]">
                  {pf.sessionId?.substring(0, 8)}...
                </span>
                {pf.status === "SCANNING" && (
                  <button
                    onClick={() => handleOpenEdit(pf)}
                    className="text-blue-600 hover:underline font-bold cursor-pointer text-xs flex items-center gap-1"
                  >
                    Lanjut Scan <FaQrcode />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL WIZARD */}
      <PlatformModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedPlatform}
        agents={agents}
      />

      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Hapus koneksi?"
        message={`Koneksi ${confirmState.platform?.name || "ini"} akan dihapus permanen. Lanjutkan?`}
        variant="danger"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isLoading={isLoading}
      />
    </div>
  );
};

export default ConnectedPlatforms;
