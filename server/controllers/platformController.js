import ConnectedPlatform from "../models/ConnectedPlatform.js";
import Agent from "../models/Agent.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import * as wahaService from "../services/wahaService.js";

// @desc    Init Connection (Create Session)
// @route   POST /api/platforms
export const createPlatform = async (req, res, next) => {
  try {
    const { name, agentId } = req.body;

    // 1. Validasi Input
    if (!name || !agentId) {
      return next(new AppError("Nama Platform dan Agent wajib dipilih", 400));
    }

    // 2. Cek Webhook URL User
    const user = await User.findByPk(req.user.id);
    const targetWebhookUrl = user.n8nWebhookUrl;

    if (!targetWebhookUrl) {
      return next(new AppError("Admin belum setup Workflow URL untuk user ini.", 403));
    }

    // --- LOGIKA BARU UNTUK WAHA CORE (TESTING) ---
    let finalSessionId;
    const isWahaCore = process.env.WAHA_EDITION === "CORE";

    if (isWahaCore) {
      // MODE TEST: Paksa pakai session 'default'
      finalSessionId = "default";

      // PENTING: Karena session 'default' cuma boleh ada 1 di DB,
      // Kita cek apakah ada platform lain yang pakai 'default'.
      // Jika ada, kita hapus dulu biar tidak bentrok (UNIQUE constraint).
      const existingPlatform = await ConnectedPlatform.findOne({
        where: { sessionId: "default" },
      });

      if (existingPlatform) {
        // Opsional: Stop dulu sesi di WAHA biar bersih
        await wahaService.stopWahaSession("default");
        // Hapus dari DB
        await existingPlatform.destroy();
        console.log("Old 'default' session platform deleted for testing.");
      }
    } else {
      // MODE PRODUCTION (WAHA PLUS): Generate unik
      finalSessionId = `u${req.user.id.split("-")[0]}_${Date.now()}`;
    }
    // ----------------------------------------------

    // 3. Simpan ke Database
    const newPlatform = await ConnectedPlatform.create({
      userId: req.user.id,
      name,
      agentId,
      sessionId: finalSessionId, // Pakai ID yang sudah ditentukan
      status: "SCANNING",
      provider: "waha",
    });

    // 4. Start Session di WAHA
    // Param ke-2: Webhook URL n8n
    await wahaService.startWahaSession(finalSessionId, targetWebhookUrl);

    const platformWithAgent = await ConnectedPlatform.findOne({
      where: { id: newPlatform.id },
      include: [{ model: Agent, attributes: ["id", "name"] }],
    });

    res.status(201).json({
      success: true,
      data: platformWithAgent, // Kirim data yang sudah lengkap
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get QR Code Image (Base64)
// @route   GET /api/platforms/:id/qr
export const getPlatformQR = async (req, res, next) => {
  try {
    const platform = await ConnectedPlatform.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!platform) return next(new AppError("Platform tidak ditemukan", 404));

    const qrImage = await wahaService.getWahaScreenshot(platform.sessionId);

    if (!qrImage) {
      return res.status(202).json({
        success: false,
        message: "QR Code sedang digenerate, coba 2 detik lagi...",
      });
    }

    res.status(200).json({ success: true, qr: qrImage });
  } catch (error) {
    next(error);
  }
};

// @desc    Check Status Real-time
// @route   GET /api/platforms/:id/status
export const getPlatformStatus = async (req, res, next) => {
  try {
    const platform = await ConnectedPlatform.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!platform) return next(new AppError("Platform tidak ditemukan", 404));

    // 1. Ambil status mentah dari WAHA
    // Kemungkinan output WAHA: 'STOPPED', 'STARTING', 'SCAN_QR_CODE', 'WORKING', 'FAILED'
    const wahaStatus = await wahaService.getWahaStatus(platform.sessionId);

    // 2. MAPPING: Terjemahkan bahasa WAHA ke bahasa Database kita
    let dbStatus = "STOPPED"; // Default fallback

    switch (wahaStatus) {
      case "WORKING":
        dbStatus = "WORKING";
        break;
      case "SCAN_QR_CODE":
        dbStatus = "SCANNING"; // <--- INI PERBAIKANNYA
        break;
      case "STARTING":
        dbStatus = "SCANNING"; // Anggap starting sebagai proses scanning/loading
        break;
      case "FAILED":
        dbStatus = "FAILED";
        break;
      default:
        dbStatus = "STOPPED";
    }

    // 3. Update DB hanya jika status berbeda
    if (platform.status !== dbStatus) {
      platform.status = dbStatus;
      await platform.save();
    }

    res.status(200).json({
      success: true,
      status: dbStatus, // Kirim status yang sudah bersih ke frontend
      rawStatus: wahaStatus, // (Opsional) Kirim status asli untuk debug
      isConnected: dbStatus === "WORKING",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All My Platforms
export const getMyPlatforms = async (req, res, next) => {
  try {
    const platforms = await ConnectedPlatform.findAll({
      where: { userId: req.user.id },
      include: [{ model: Agent, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ success: true, data: platforms });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Platform
// @route   PUT /api/platforms/:id
export const updatePlatform = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, agentId } = req.body;

    const platform = await ConnectedPlatform.findOne({
      where: { id, userId: req.user.id },
    });

    if (!platform) return next(new AppError("Platform not found", 404));

    // Update field
    if (name) platform.name = name;
    if (agentId !== undefined) platform.agentId = agentId;

    await platform.save();

    // --- FIX UTAMA DISINI ---
    // Reload data agar frontend mendapat nama agent terbaru
    const updatedPlatform = await ConnectedPlatform.findOne({
      where: { id: platform.id },
      include: [{ model: Agent, attributes: ["id", "name"] }],
    });

    res.status(200).json({ success: true, data: updatedPlatform });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Platform
export const deletePlatform = async (req, res, next) => {
  try {
    const platform = await ConnectedPlatform.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!platform) return next(new AppError("Platform not found", 404));

    // Stop di WAHA
    await wahaService.stopWahaSession(platform.sessionId);
    // Hapus di DB
    await platform.destroy();

    res.status(200).json({ success: true, message: "Platform deleted" });
  } catch (error) {
    next(error);
  }
};
