import Agent from "../models/Agent.js";
import KnowledgeSource from "../models/KnowledgeSource.js";
import ConnectedPlatform from "../models/ConnectedPlatform.js";
import AppError from "../utils/AppError.js";
import minioClient, { bucketName } from "../config/minio.js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

// --- HELPER: Upload to MinIO ---
const uploadToMinio = async (file) => {
  const fileName = `${uuidv4()}-${file.originalname.replace(/\s/g, "-")}`;
  await minioClient.putObject(bucketName, fileName, file.buffer);

  // Return Public URL (Sesuaikan dengan ENV Anda)
  // Contoh: http://localhost:9000/cekat-agents/gambar.jpg
  const minioUrl =
    process.env.MINIO_PUBLIC_URL || `http://localhost:${process.env.MINIO_PORT || 9000}`;
  return `${minioUrl}/${bucketName}/${fileName}`;
};

// @desc    Get Agent Config for n8n Integration
// @route   GET /api/agents/integration/:waNumber
export const getAgentByWa = async (req, res) => {
  try {
    const { waNumber } = req.params;

    // Cari agent berdasarkan nomor WA yg terdaftar
    const agent = await Agent.findOne({
      where: { whatsappNumber: waNumber, isActive: true },
      include: ["KnowledgeSources"], // Pastikan relasi diload
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found or inactive" });
    }

    // Gabungkan semua deskripsi knowledge jadi satu teks konteks
    const knowledgeText = agent.KnowledgeSources.map((k) => k.description) // Description sudah HTML/Text dari Rich Text
      .join("\n\n---\n\n");

    res.json({
      systemInstruction: agent.systemInstruction,
      transferCondition: agent.transferCondition,
      welcomeMessage: agent.welcomeMessage,
      knowledgeContext: knowledgeText,
      // Kirim juga URL gambar knowledge jika perlu diproses vision model n8n
      knowledgeImages: agent.KnowledgeSources.map((k) => k.imageUrl),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Agent (Basic Info)
// @route   POST /api/agents
export const createAgent = async (req, res, next) => {
  try {
    // 1. Handle Upload Welcome Image (Jika ada)
    let welcomeImageUrl = null;
    if (req.files && req.files["welcomeImage"]) {
      const file = req.files["welcomeImage"][0];
      welcomeImageUrl = await uploadToMinio(file);
    }

    // 2. Ambil data dari body
    const {
      name,
      description,
      systemInstruction,
      welcomeMessage,
      transferCondition,
      whatsappNumber,
      isActive,
      followupConfig,
    } = req.body;

    // 3. Helper: Parse JSON followupConfig
    // PENTING: Karena request ini pakai FormData (multipart/form-data),
    // objek nested seperti followupConfig akan diterima sebagai STRING JSON.
    let parsedFollowup = undefined; // Biarkan undefined agar Sequelize pakai defaultValue jika kosong

    if (followupConfig) {
      try {
        parsedFollowup =
          typeof followupConfig === "string" ? JSON.parse(followupConfig) : followupConfig;
      } catch (e) {
        console.error("Error parsing followupConfig on create:", e);
        // Jika error parse, kita biarkan undefined (fallback ke default DB)
      }
    }

    const agent = await Agent.create({
      name,
      description,
      systemInstruction,
      welcomeMessage,
      transferCondition,
      whatsappNumber,
      // Konversi string 'true'/'false' ke boolean
      isActive: isActive === "true" || isActive === true,
      welcomeImageUrl,
      // Masukkan config follow-up
      followupConfig: parsedFollowup,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "AI Agent berhasil dibuat.",
      data: agent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All My Agents
// @route   GET /api/agents
export const getMyAgents = async (req, res, next) => {
  try {
    const agents = await Agent.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ success: true, count: agents.length, data: agents });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Agent Detail (Include Knowledge)
// @route   GET /api/agents/:id
export const getAgentById = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [KnowledgeSource], // Include Data Knowledge
    });

    if (!agent) return next(new AppError("Agent tidak ditemukan.", 404));

    res.status(200).json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Agent (General, System Prompt, Welcome Image)
// @route   PUT /api/agents/:id
export const updateAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!agent) return next(new AppError("Agent tidak ditemukan.", 404));

    // Handle Upload Welcome Image
    let newWelcomeImageUrl = agent.welcomeImageUrl;
    if (req.files && req.files["welcomeImage"]) {
      const file = req.files["welcomeImage"][0];
      newWelcomeImageUrl = await uploadToMinio(file);
    }

    // Ambil fields dari body
    const {
      name,
      description,
      systemInstruction,
      welcomeMessage,
      transferCondition,
      whatsappNumber,
      isActive,
      followupConfig,
    } = req.body;

    // Helper: Parse JSON jika dikirim sebagai string (karena FormData)
    let parsedFollowup = null;
    if (followupConfig) {
      try {
        parsedFollowup =
          typeof followupConfig === "string" ? JSON.parse(followupConfig) : followupConfig;
      } catch (e) {
        console.error("Error parsing followupConfig", e);
      }
    }

    // Update
    if (name) agent.name = name;
    if (description !== undefined) agent.description = description;
    if (systemInstruction !== undefined) agent.systemInstruction = systemInstruction;
    if (welcomeMessage !== undefined) agent.welcomeMessage = welcomeMessage;
    if (transferCondition !== undefined) agent.transferCondition = transferCondition;
    if (whatsappNumber !== undefined) agent.whatsappNumber = whatsappNumber;
    if (isActive !== undefined) agent.isActive = isActive === "true" || isActive === true;

    // Update Followup Config (JSONB)
    if (parsedFollowup) {
      agent.followupConfig = parsedFollowup;
    }

    agent.welcomeImageUrl = newWelcomeImageUrl;

    await agent.save();

    res.status(200).json({ success: true, message: "Agent berhasil diupdate.", data: agent });
  } catch (error) {
    next(error);
  }
};

// @desc    Add Knowledge Source (Image + Desc)
// @route   POST /api/agents/:id/knowledge
export const addKnowledge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!description) {
      return next(new AppError("Deskripsi konten wajib diisi.", 400));
    }

    const knowledge = await KnowledgeSource.create({
      agentId: id, // Gunakan 'id' yang dari params tadi
      title: title || "Untitled Resource",
      description: description,
    });

    res.status(201).json({ success: true, data: knowledge });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Knowledge Source
// @route   PUT /api/agents/knowledge/:knowledgeId
export const updateKnowledge = async (req, res, next) => {
  try {
    const { knowledgeId } = req.params;
    const { title, description } = req.body;

    const knowledge = await KnowledgeSource.findByPk(knowledgeId);

    if (!knowledge) {
      return next(new AppError("Knowledge source tidak ditemukan.", 404));
    }

    // Update fields
    knowledge.title = title || knowledge.title;
    knowledge.description = description || knowledge.description;

    await knowledge.save();

    res.status(200).json({ success: true, data: knowledge });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Knowledge Source
// @route   DELETE /api/agents/knowledge/:knowledgeId
export const deleteKnowledge = async (req, res, next) => {
  try {
    // Cari knowledge dan pastikan agent-nya milik user yg login
    const knowledge = await KnowledgeSource.findByPk(req.params.knowledgeId, {
      include: {
        model: Agent,
        where: { userId: req.user.id },
      },
    });

    if (!knowledge) return next(new AppError("Data knowledge tidak ditemukan.", 404));

    await knowledge.destroy();
    res.status(200).json({ success: true, message: "Knowledge deleted." });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Agent
// @route   DELETE /api/agents/:id
export const deleteAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!agent) return next(new AppError("Agent tidak ditemukan.", 404));

    await agent.destroy();
    res.status(200).json({ success: true, message: "Agent berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

// --- SPECIAL: N8N INTEGRATION ---
// @desc    Get Agent Config by WhatsApp Number (Untuk n8n)
// @route   GET /api/agents/integration/:waNumber
// Note: Endpoint ini sebaiknya diproteksi API Key, tapi untuk MVP kita public-kan dulu atau cek header custom
export const getIntegrationConfig = async (req, res, next) => {
  try {
    // n8n akan mengirim query: ?sessionId=mysession_01
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID required" });
    }

    // 1. Cari Platform berdasarkan Session ID WAHA
    const platform = await ConnectedPlatform.findOne({
      where: {
        // Kita cari di dalam kolom credentials JSONB
        "credentials.sessionId": sessionId,
      },
      include: [
        {
          model: Agent,
          include: ["KnowledgeSources"], // Include Knowledge
        },
      ],
    });

    if (!platform || !platform.Agent) {
      return res.status(404).json({ message: "No active agent found for this session." });
    }

    const agent = platform.Agent;

    // 2. Format Knowledge Base jadi satu teks
    const knowledgeText = agent.KnowledgeSources
      ? agent.KnowledgeSources.map((k) => `[${k.title}]:\n${k.description}`).join("\n\n---\n\n")
      : "";

    // 3. Return JSON Config siap pakai untuk n8n
    res.json({
      agentName: agent.name,
      systemInstruction: agent.systemInstruction,
      welcomeMessage: agent.welcomeMessage,
      knowledgeBase: knowledgeText,
      // Sertakan Followup Config juga
      followupConfig: agent.followupConfig || { isEnabled: false },
    });
  } catch (error) {
    console.error("Integration Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Test Chat Agent (Simulator)
// @route   POST /api/agents/:id/test-chat
export const testChatAgent = async (req, res, next) => {
  try {
    const { message, sessionId, systemInstruction, name, knowledgeBase } = req.body;

    if (!message) return next(new AppError("Pesan tidak boleh kosong.", 400));
    if (!systemInstruction) return next(new AppError("System Instruction harus diisi.", 400));

    const N8N_SIMULATOR_URL = process.env.N8N_SIMULATOR_URL;
    if (!N8N_SIMULATOR_URL) return next(new AppError("Server AI belum dikonfigurasi.", 500));

    const uniqueSession = sessionId || `preview-${Date.now()}`;

    const payload = {
      mode: "simulation",
      sessionId: uniqueSession,
      message: message,
      agentConfig: {
        name: name || "Test Agent",
        systemInstruction: systemInstruction,
        knowledgeBase: knowledgeBase || "",
      },
    };

    // Kirim ke n8n
    const response = await axios.post(N8N_SIMULATOR_URL, payload);
    const responseData = response.data;

    // --- LOGIC BARU: MENERIMA 'output' ---
    let aiResponse = "";

    // Cek apakah response berupa Array (Format [ { output: "..." } ])
    if (Array.isArray(responseData)) {
      aiResponse = responseData[0]?.output || responseData[0]?.reply || responseData[0]?.text;
    } else {
      // Cek apakah response berupa Object (Format { output: "..." })
      aiResponse = responseData?.output || responseData?.reply || responseData?.text;
    }

    if (!aiResponse) {
      console.warn("n8n Empty Response:", responseData);
      aiResponse = "Maaf, AI tidak merespon (Empty Output).";
    }

    // Kirim ke Frontend dengan key 'output' (SESUAI REQUEST ANDA)
    res.status(200).json({
      success: true,
      output: aiResponse, // <--- Kita kirim sebagai 'output'
    });
  } catch (error) {
    console.error("Simulator Error:", error.message);
    next(new AppError("Gagal menghubungi AI Brain.", 502));
  }
};
