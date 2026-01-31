import axiosInstance from "../../api/axiosInstance";

const API_URL = "/platforms";

// Get All Platforms
const getPlatforms = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

// Create Platform (Init Session)
const createPlatform = async (platformData) => {
  const response = await axiosInstance.post(API_URL, platformData);
  return response.data;
};

// Update Platform (Ganti Nama/Agent)
const updatePlatform = async ({ id, platformData }) => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, platformData);
  return response.data;
};

// Delete Platform
const deletePlatform = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
};

// --- NEW FEATURES ---

// Get QR Code Image (Base64)
const getPlatformQR = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}/qr`);
  return response.data;
};

// Check Status Real-time
const getPlatformStatus = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}/status`);
  return response.data;
};

const platformService = {
  getPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
  getPlatformQR,
  getPlatformStatus,
};

export default platformService;
