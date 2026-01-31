const normalizeHandoffConfig = (raw) => {
  const defaults = {
    enabled: false,
    keywords: [],
    conditionText: "",
    responseMessage: "",
  };

  if (!raw) return defaults;

  if (typeof raw === "object") {
    return {
      enabled: !!raw.enabled,
      keywords: Array.isArray(raw.keywords)
        ? raw.keywords.map((k) => String(k).trim()).filter(Boolean)
        : [],
      conditionText: raw.conditionText ? String(raw.conditionText).trim() : "",
      responseMessage: raw.responseMessage ? String(raw.responseMessage).trim() : "",
    };
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return normalizeHandoffConfig(parsed);
    } catch (error) {
      const legacyText = raw.trim();
      return {
        ...defaults,
        enabled: !!legacyText,
        conditionText: legacyText,
      };
    }
  }

  return defaults;
};

const buildHandoffSystemPrompt = (basePrompt, rawConfig) => {
  const config = normalizeHandoffConfig(rawConfig);
  if (!config.enabled) return basePrompt;

  const rules = [];
  rules.push("HUMAN HANDOFF RULES:");
  if (config.conditionText) {
    rules.push(`- Kondisi utama: ${config.conditionText}`);
  }
  if (config.keywords.length > 0) {
    rules.push(`- Kata kunci pemicu: ${config.keywords.join(", ")}`);
  }
  if (config.responseMessage) {
    rules.push(`- Pesan saat handoff: "${config.responseMessage}"`);
  }
  rules.push(
    '- Jika handoff diperlukan, balas user dengan pesan yang sopan, lalu tambahkan JSON di baris terakhir: {"escalate": true, "reason": "<alasan singkat>"}',
  );
  rules.push('- Jika tidak handoff, jangan sertakan "escalate": true.');

  return `${basePrompt}\n\n${rules.join("\n")}`;
};

export { normalizeHandoffConfig, buildHandoffSystemPrompt };
