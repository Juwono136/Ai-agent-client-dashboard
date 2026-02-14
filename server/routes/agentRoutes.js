import express from "express";
import multer from "multer"; // Import Multer
import AppError from "../utils/AppError.js"; // Untuk error handling multer

import {
  createAgent,
  getMyAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  addKnowledge, // Controller Baru
  deleteKnowledge, // Controller Baru
  getIntegrationConfig,
  updateKnowledge,
  testChatAgent, // Controller Baru (n8n)
} from "../controllers/agentController.js";
import { getAgentAnalytics } from "../controllers/analyticsController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { runValidation } from "../validators/validatorHandler.js";
import {
  validateCreateAgent,
  validateUpdateAgent,
  validateAgentId,
  // Pastikan Anda nanti menambahkan validator untuk knowledge jika perlu
  // atau kita gunakan validasi di controller untuk file existence
} from "../validators/agentValidator.js";

// --- SETUP MULTER (Security & Config) ---
const storage = multer.memoryStorage(); // Simpan di RAM agar cepat diproses ke MinIO

const ALLOWED_IMAGE_MIMETYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Hanya file gambar JPG, JPEG, atau PNG yang diizinkan. Maks. 2MB.", 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
});

const router = express.Router();

// ==========================================
// 1. PUBLIC ROUTES (Integrasi n8n)
// ==========================================
router.get("/integration/config", getIntegrationConfig);

// ==========================================
// 2. PROTECTED ROUTES (Dashboard User)
// ==========================================
// Semua route di bawah ini wajib Login
router.use(protect);

router
  .route("/")
  .get(getMyAgents)
  .post(
    // Tambahkan middleware upload agar bisa baca req.body format FormData
    upload.fields([{ name: "welcomeImage", maxCount: 1 }]),
    validateCreateAgent, // Pastikan validator ini tidak reject field tambahan
    runValidation,
    createAgent,
  );

// --- AGENT DETAIL ROUTES ---
router
  .route("/:id")
  // Get Detail
  .get(validateAgentId, runValidation, getAgentById)

  // Update Agent (PENTING: Urutan Middleware)
  // 1. validateAgentId: Cek ID valid dulu
  // 2. upload.fields: Parse form-data (agar req.body terisi untuk validator)
  // 3. validateUpdateAgent: Validasi input text (nama, prompt, dll)
  // 4. runValidation: Cek hasil validasi
  // 5. updateAgent: Eksekusi controller
  .put(
    validateAgentId,
    upload.fields([{ name: "welcomeImage", maxCount: 1 }]),
    validateUpdateAgent,
    runValidation,
    updateAgent,
  )

  // Delete Agent
  .delete(validateAgentId, runValidation, deleteAgent);

router.post("/test-chat", testChatAgent);

// --- KNOWLEDGE BASE ROUTES ---
// Add Knowledge (Wajib ada Image)
router.post("/:id/knowledge", validateAgentId, runValidation, addKnowledge);

// Update Knowledge
router.put("/knowledge/:knowledgeId", updateKnowledge);

// Delete Knowledge
// (Kita asumsikan ID knowledge juga UUID, bisa pakai validateAgentId kalau regex-nya sama,
// atau buat validateKnowledgeId terpisah)
router.delete("/knowledge/:knowledgeId", deleteKnowledge);

// --- ANALYTICS ROUTES ---
router.get("/:id/analytics", validateAgentId, runValidation, getAgentAnalytics);

export default router;
