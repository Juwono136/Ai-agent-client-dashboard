import axios from "axios";
import AppError from "../utils/AppError.js";

// Ambil config dari .env
// WAHA_BASE_URL: API WAHA (worker langsung atau dashboard). Untuk Pro/Plus dengan dashboard, bisa pakai URL dashboard.
// WAHA_WORKER_URL (opsional): URL worker langsung. Jika set, create pakai WAHA_BASE_URL; get/start/screenshot/status pakai WAHA_WORKER_URL.
const WAHA_URL = process.env.WAHA_BASE_URL || "http://localhost:7575";
const WAHA_WORKER_URL = process.env.WAHA_WORKER_URL || null;
const API_KEY = process.env.WAHA_API_KEY;

const HEADERS = {
  "Content-Type": "application/json",
  ...(API_KEY && { "X-Api-Key": API_KEY }),
};

const baseUrl = (useWorker = false) => (useWorker && WAHA_WORKER_URL ? WAHA_WORKER_URL : WAHA_URL);

const getWahaSession = async (sessionId) => {
  const url = baseUrl(true);
  try {
    const response = await axios.get(`${url}/api/sessions/${sessionId}`, axiosOptions());
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

/** List semua session (untuk ambil nama persis setelah create - WAHA Pro/Plus) */
const listWahaSessions = async () => {
  const url = baseUrl(true);
  try {
    const response = await axios.get(`${url}/api/sessions`, axiosOptions());
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.sessions)) return data.sessions;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (error) {
    if (error?.response?.status === 404) return [];
    return [];
  }
};

const isRecoverableStartError = async (sessionId, error) => {
  const statusCode = error?.response?.status;
  if (!statusCode) return false;

  // Jika WAHA menolak karena sudah running / starting, anggap sukses
  if ([400, 409, 422, 500].includes(statusCode)) {
    try {
      const session = await getWahaSession(sessionId);
      if (!session) return false;
      if (["STARTING", "SCAN_QR_CODE", "WORKING"].includes(session.status)) {
        return true;
      }
    } catch (err) {
      return false;
    }

    const rawMessage = JSON.stringify(error?.response?.data || "");
    if (/already|running|started|start/i.test(rawMessage)) return true;
  }

  return false;
};

/** Delay (ms) setelah create session agar WAHA Pro/Plus sempat mendaftarkan session */
const POST_CREATE_DELAY_MS = parseInt(process.env.WAHA_POST_CREATE_DELAY_MS, 10) || 1200;
/** Delay (ms) setelah start sebelum return - biar response cepat, QR diserahkan ke polling frontend */
const POST_START_DELAY_MS = parseInt(process.env.WAHA_POST_START_DELAY_MS, 10) || 3500;
/** Timeout (ms) untuk request ke WAHA - hindari hang saat worker sibuk */
const WAHA_REQUEST_TIMEOUT_MS = parseInt(process.env.WAHA_REQUEST_TIMEOUT_MS, 10) || 15000;

const axiosOptions = (timeout = WAHA_REQUEST_TIMEOUT_MS) => ({ headers: HEADERS, timeout });

/** Poll sampai session ada di list (nama persis dari worker) - untuk Pro/Plus */
const resolveSessionNameFromList = async (sessionId, maxAttempts = 8) => {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 300 + i * 150));
    const list = await listWahaSessions();
    const byName = list.find((s) => s.name === sessionId || (s.name && String(s.name) === String(sessionId)));
    if (byName?.name) return byName.name;
    const byId = list.find((s) => s.id === sessionId);
    if (byId?.name) return byId.name;
  }
  return null;
};

/** Cek singkat apakah session sudah siap QR (beberapa kali saja); tidak block lama agar API responsif. */
const quickCheckSessionReady = async (sessionId, checks = 3, intervalMs = 1200) => {
  for (let i = 0; i < checks; i++) {
    const session = await getWahaSession(sessionId);
    if (session && ["SCAN_QR_CODE", "WORKING"].includes(session.status)) return true;
    if (session && session.status === "FAILED" && i === 0) {
      try {
        await axios.post(`${baseUrl(true)}/api/sessions/${sessionId}/start`, {}, axiosOptions(8000));
      } catch (_) {}
    }
    if (i < checks - 1) await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
};

/** Dari URL production n8n (/webhook/...) buat pasangan Test + Production untuk WAHA Trigger (events: message saja). */
const buildN8nWebhookPair = (productionUrl) => {
  if (!productionUrl || typeof productionUrl !== "string") return [];
  const url = productionUrl.trim();
  if (url.includes("/webhook/") && !url.includes("/webhook-test/")) {
    const testUrl = url.replace("/webhook/", "/webhook-test/");
    return [
      { url: testUrl, events: ["message"], hmac: null },
      { url, events: ["message"], hmac: null },
    ];
  }
  return [{ url, events: ["message"], hmac: null }];
};

// Create Session di WAHA (Core / Pro / Plus): buat session baru lalu start
export const startWahaSession = async (sessionId, webhookUrl) => {
  const createUrl = WAHA_URL;
  const workerUrl = baseUrl(true);

  try {
    // 1. Cek apakah session sudah ada (pakai worker URL agar konsisten dengan start)
    let existingSession = await getWahaSession(sessionId);

    if (!existingSession) {
      // 2. Webhook: otomatis pasangan Test + Production untuk n8n WAHA Trigger, events hanya "message"
      let webhooks = buildN8nWebhookPair(webhookUrl);
      if (!webhooks.length) webhooks = [{ url: webhookUrl, events: ["message"], hmac: null }];

      const payload = {
        name: sessionId,
        config: {
          proxy: null,
          webhooks,
        },
      };

      const createRes = await axios.post(`${createUrl}/api/sessions`, payload, axiosOptions());
      const nameFromCreate = createRes?.data?.name ? String(createRes.data.name) : null;

      // 3. Tunggu lalu pastikan session terdaftar di worker; pakai nama dari list (persis di worker) atau dari response create
      await new Promise((r) => setTimeout(r, POST_CREATE_DELAY_MS));
      const resolvedName = await resolveSessionNameFromList(sessionId);
      const sessionName = resolvedName || nameFromCreate || sessionId;

      // 4. Start session (selalu pakai worker URL)
      try {
        await axios.post(`${workerUrl}/api/sessions/${sessionName}/start`, {}, axiosOptions());
      } catch (startErr) {
        if (startErr?.response?.status === 404 && sessionName !== sessionId) {
          await axios.post(`${workerUrl}/api/sessions/${sessionId}/start`, {}, axiosOptions());
        } else {
          const recoverable = await isRecoverableStartError(sessionName, startErr);
          if (!recoverable) throw startErr;
        }
      }
      // 5. Delay singkat + cek cepat; tidak block 60s - QR diserahkan ke polling frontend (lebih efisien)
      await new Promise((r) => setTimeout(r, POST_START_DELAY_MS));
      await quickCheckSessionReady(sessionName);
      return;
    }

    // Session sudah ada: start saja (pakai worker URL)
    try {
      await axios.post(`${workerUrl}/api/sessions/${sessionId}/start`, {}, axiosOptions());
    } catch (startErr) {
      const recoverable = await isRecoverableStartError(sessionId, startErr);
      if (!recoverable) throw startErr;
    }
    await new Promise((r) => setTimeout(r, POST_START_DELAY_MS));
    await quickCheckSessionReady(sessionId);
  } catch (error) {
    const step = error?.config?.url?.includes("/start") ? "start" : "create";
    console.error("WAHA Service Error:", error?.response?.data || error.message, `(step: ${step})`);
    throw new AppError("Gagal menghubungkan ke Server WhatsApp Engine.", 502);
  }
};

export const getWahaScreenshot = async (sessionId) => {
  const url = baseUrl(true);
  try {
    const response = await axios.get(`${url}/api/screenshot`, {
      ...axiosOptions(10000),
      params: {
        session: sessionId,
        selector: 'canvas[aria-label="Scan me!"]',
      },
      responseType: "arraybuffer",
    });

    const base64Image = Buffer.from(response.data, "binary").toString("base64");

    // Validasi tambahan: Jika string terlalu pendek, anggap gagal (bukan gambar valid)
    if (base64Image.length < 100) return null;

    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    // Jangan log error heboh, cukup tahu bahwa WAHA sedang booting
    // console.log("WAHA QR not ready yet...");
    return null;
  }
};

export const getWahaStatus = async (sessionId) => {
  const url = baseUrl(true);
  try {
    const response = await axios.get(`${url}/api/sessions/${sessionId}`, axiosOptions());
    const status = response.data.status;

    // Hanya auto-start saat STOPPED. Jangan start saat FAILED agar tidak loop STARTING↔FAILED.
    if (status === "STOPPED") {
      try {
        await axios.post(`${url}/api/sessions/${sessionId}/start`, {}, axiosOptions(8000));
      } catch (error) {
        // Abaikan error start otomatis, biar status tetap terlapor
      }
    }
    return status;
  } catch (error) {
    return "STOPPED";
  }
};

export const stopWahaSession = async (sessionId) => {
  const url = baseUrl(true);
  try {
    await axios.post(`${url}/api/sessions/${sessionId}/logout`, {}, axiosOptions(10000));
  } catch (error) {
    console.error("WAHA Stop Error:", error.message);
  }
};

/** Hapus session dari WAHA dashboard (session hilang dari daftar). Plus: coba dashboard dulu, lalu worker. */
export const deleteWahaSession = async (sessionId) => {
  const urls = [WAHA_URL, baseUrl(true)].filter((u, i, a) => a.indexOf(u) === i);
  const paths = [`/api/sessions/${sessionId}`, `/api/sessions/${sessionId}/`];
  for (const base of urls) {
    for (const path of paths) {
      try {
        await axios.delete(`${base}${path}`, { headers: HEADERS, timeout: 15000 });
        return;
      } catch (error) {
        if (error?.response?.status === 404) continue;
        if (error?.code === "ECONNABORTED" || (error?.response?.status >= 500)) continue;
        console.error("WAHA Delete Session Error:", error?.response?.data || error.message);
      }
    }
  }
};
