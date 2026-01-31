import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAgentById,
  createAgent,
  updateAgent,
  addKnowledge,
  resetAgentState,
  clearCurrentAgent,
} from "../../features/agents/agentSlice";
import {
  FaSave,
  FaArrowLeft,
  FaBrain,
  FaDatabase,
  FaClock,
  FaChartBar,
  FaSpinner,
} from "react-icons/fa";
import toast from "react-hot-toast";
import {
  getDefaultHandoffConfig,
  parseHandoffConfig,
  serializeHandoffConfig,
  validateHandoffConfig,
} from "../../utils/handoff";

// Tabs
import GeneralTab from "./tabs/GeneralTab";
import KnowledgeTab from "./tabs/KnowledgeTab";
import FollowupTab from "./tabs/FollowupTab";
import EvaluationTab from "./tabs/EvaluationTab";
import ChatPreview from "../../components/agents/ChatPreview";

const AgentBuilder = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentAgent, isLoading, isSuccess, message } = useSelector((state) => state.agents);

  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false); // Local loading state for custom flow

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemInstruction: "",
    welcomeMessage: "",
    transferCondition: "",
    whatsappNumber: "",
    isActive: false,
  });
  const [welcomeImageFile, setWelcomeImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Smart Knowledge State (Untuk Create Mode)
  const [pendingKnowledge, setPendingKnowledge] = useState([]);

  const [followupConfig, setFollowupConfig] = useState({
    isEnabled: false,
    delay: 15,
    unit: "minutes",
    prompt: "",
  });
  const [handoffConfig, setHandoffConfig] = useState(getDefaultHandoffConfig());

  // 1. INIT
  useEffect(() => {
    if (isEditMode) {
      dispatch(getAgentById(id));
    } else {
      dispatch(clearCurrentAgent());
      setFormData({
        name: "",
        description: "",
        systemInstruction: "",
        welcomeMessage: "",
        transferCondition: "",
        whatsappNumber: "",
        isActive: false,
      });
      setPreviewImage(null);
      setPendingKnowledge([]);
      setHandoffConfig(getDefaultHandoffConfig());
    }
    return () => dispatch(resetAgentState());
  }, [id, isEditMode, dispatch]);

  // 2. POPULATE DATA
  useEffect(() => {
    if (isEditMode && currentAgent) {
      setFormData({
        name: currentAgent.name || "",
        description: currentAgent.description || "",
        systemInstruction: currentAgent.systemInstruction || "",
        welcomeMessage: currentAgent.welcomeMessage || "",
        transferCondition: currentAgent.transferCondition || "",
        whatsappNumber: currentAgent.whatsappNumber || "",
        isActive: currentAgent.isActive || false,
      });
      if (currentAgent.welcomeImageUrl) setPreviewImage(currentAgent.welcomeImageUrl);
      if (currentAgent.followupConfig) {
        setFollowupConfig(currentAgent.followupConfig);
      }
      setHandoffConfig(parseHandoffConfig(currentAgent.transferCondition));
    } else {
      setFollowupConfig({ isEnabled: false, delay: 15, unit: "minutes", prompt: "" });
      setHandoffConfig(getDefaultHandoffConfig());
    }
  }, [currentAgent, isEditMode]);

  // 3. HANDLERS
  const handleInputChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWelcomeImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Logic untuk Knowledge di Create Mode
  const handleAddPendingKnowledge = (knowledgeItem) => {
    // knowledgeItem = { description, file, tempId }
    setPendingKnowledge((prev) => [...prev, knowledgeItem]);
  };

  const handleRemovePendingKnowledge = (tempId) => {
    setPendingKnowledge((prev) => prev.filter((k) => k.tempId !== tempId));
  };

  // 4. SAVE LOGIC (SOPHISTICATED)
  const handleSave = async () => {
    if (!formData.name) return toast.error("Nama Agent wajib diisi.");
    const handoffValidation = validateHandoffConfig(handoffConfig);
    if (!handoffValidation.isValid) {
      setActiveTab("general");
      return toast.error(handoffValidation.message);
    }

    setIsSaving(true);
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => dataToSend.append(key, formData[key]));
      if (welcomeImageFile) dataToSend.append("welcomeImage", welcomeImageFile);

      dataToSend.append("followupConfig", JSON.stringify(followupConfig));
      dataToSend.append("transferCondition", serializeHandoffConfig(handoffConfig));

      let agentId = id;
      if (isEditMode) {
        await dispatch(updateAgent({ id, agentData: dataToSend })).unwrap();
      } else {
        const result = await dispatch(createAgent(dataToSend)).unwrap();
        agentId = result.data.id;
      }

      // --- UPLOAD PENDING KNOWLEDGE (PERBAIKAN DISINI) ---
      if (pendingKnowledge.length > 0 && agentId) {
        const uploadPromises = pendingKnowledge.map((k) => {
          // PERBAIKAN: Pastikan ini Object biasa, bukan FormData
          const kData = {
            title: k.title,
            description: k.description,
          };

          // Dispatch action addKnowledge
          return dispatch(addKnowledge({ agentId, knowledgeData: kData })).unwrap();
        });

        await Promise.all(uploadPromises);
        setPendingKnowledge([]);
      }

      toast.success(
        isEditMode ? "Agent berhasil diperbarui!" : "Agent berhasil dibuat & Knowledge diupload!",
      );

      // Redirect ke edit mode jika create baru, agar data tersinkron
      if (!isEditMode) navigate(`/ai-agents/${agentId}`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Gagal menyimpan agent.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-20 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* HEADER STICKY (Mobile Friendly) */}
      <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm py-4 border-b border-gray-200 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/ai-agents")}
              className="btn btn-circle btn-ghost btn-sm text-gray-500 hover:bg-gray-200"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-tight">
                {isEditMode ? formData.name : "New AI Agent"}
              </h1>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                {isEditMode ? <span className="text-blue-600">Editing Mode</span> : "Creation Mode"}
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <span
                className={`w-2 h-2 rounded-full ${formData.isActive ? "bg-green-500" : "bg-gray-300"}`}
              ></span>
              <span className="text-xs font-medium text-gray-600">Active</span>
              <input
                type="checkbox"
                name="isActive"
                className="toggle toggle-xs toggle-success ml-1"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-sm bg-[#1C4D8D] hover:bg-[#153e75] text-white border-none rounded-lg shadow-md gap-2 px-6"
            >
              {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {isEditMode ? "Update" : "Create Agent"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT: CONFIGURATION (Full width on mobile, 7 cols on LG) */}
        <div
          className={`flex flex-col gap-6 transition-all duration-300 
             ${activeTab === "general" ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-12"}`}
        >
          {/* TABS NAVIGATION (Modern Pills) */}
          <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {[
              { id: "general", label: "General", icon: <FaBrain /> },
              { id: "knowledge", label: "Knowledge Base", icon: <FaDatabase /> },
              { id: "followups", label: "Follow-ups", icon: <FaClock /> },
              { id: "evaluation", label: "Evaluation", icon: <FaChartBar /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                            ${
                              activeTab === tab.id
                                ? "bg-[#1C4D8D] text-white shadow-lg shadow-blue-900/10"
                                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100"
                            }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT AREA */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-150 relative overflow-hidden">
            <div className={activeTab === "general" ? "block" : "hidden"}>
              <GeneralTab
                formData={formData}
                handleChange={handleInputChange}
                handleFileChange={handleFileChange}
                previewImage={previewImage || currentAgent?.welcomeImageUrl}
                handoffConfig={handoffConfig}
                setHandoffConfig={setHandoffConfig}
              />
            </div>

            <div className={activeTab === "knowledge" ? "block" : "hidden"}>
              <KnowledgeTab
                agentId={id}
                isEditMode={isEditMode}
                knowledgeSources={currentAgent?.KnowledgeSources || []}
                pendingKnowledge={pendingKnowledge} // Pass pending state
                onAddPending={handleAddPendingKnowledge}
                onRemovePending={handleRemovePendingKnowledge}
              />
            </div>

            {activeTab === "followups" && (
              <FollowupTab config={followupConfig} setConfig={setFollowupConfig} />
            )}
            {activeTab === "evaluation" && <EvaluationTab agentId={id} />}
          </div>
        </div>

        {/* RIGHT: PREVIEW (Hidden on mobile initially, or stacked) */}
        {activeTab === "general" && (
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 animate-[fadeIn_0.5s]">
            <div className="bg-linear-to-br from-gray-100 to-gray-50 rounded-3xl p-1 border border-gray-200 shadow-inner">
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Simulator
                </span>
                <span className="badge badge-sm bg-white border-gray-200 text-xs">
                  Live Preview
                </span>
              </div>
              <ChatPreview
                agentName={formData.name}
                systemInstruction={formData.systemInstruction}
                handoffConfig={handoffConfig}
              />
              <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100 text-xs text-blue-800 leading-relaxed">
                <p className="font-semibold mb-1">AI agent chat preview</p>
                <p>Silahkan tes ai agent kamu di melalui chat tersebut untuk simulasi.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentBuilder;
