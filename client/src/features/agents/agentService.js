import axiosInstance from "../../api/axiosInstance";

const API_URL = "/agents";

// Create Agent (Support FormData jika nanti ada inisial file)
const createAgent = async (agentData) => {
  const response = await axiosInstance.post(API_URL, agentData);
  return response.data;
};

// Get All
const getAgents = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

// Get Single (Detail)
const getAgentById = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data;
};

// Update Agent (General Tab - Support File Upload)
const updateAgent = async ({ id, agentData }) => {
  // agentData harus berupa FormData object jika ada file
  const response = await axiosInstance.put(`${API_URL}/${id}`, agentData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Delete Agent
const deleteAgent = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
};

// --- KNOWLEDGE BASE ---

const addKnowledge = async ({ agentId, knowledgeData }) => {
  const response = await axiosInstance.post(`/agents/${agentId}/knowledge`, knowledgeData);
  return response.data;
};

const updateKnowledge = async ({ knowledgeId, knowledgeData }) => {
  const response = await axiosInstance.put(`/agents/knowledge/${knowledgeId}`, knowledgeData);
  return response.data;
};

const deleteKnowledge = async (knowledgeId) => {
  const response = await axiosInstance.delete(`${API_URL}/knowledge/${knowledgeId}`);
  return response.data;
};

const testChat = async (payload) => {
  // Perhatikan: URL-nya sekarang generic, payload dikirim di body
  const response = await axiosInstance.post(`/agents/test-chat`, payload);
  return response.data;
};

const agentService = {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  addKnowledge,
  deleteKnowledge,
  updateKnowledge,
  testChat,
};

export default agentService;
