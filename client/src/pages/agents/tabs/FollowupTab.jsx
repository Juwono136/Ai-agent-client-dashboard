import { FaClock, FaToggleOff, FaLightbulb } from "react-icons/fa";
import { FiActivity, FiMessageSquare } from "react-icons/fi";
import RichTextEditor from "../../../components/common/RichTextEditor";

const FollowupTab = ({ config, setConfig }) => {
  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* --- HEADER & MASTER SWITCH --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${config.isEnabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
          >
            <FiActivity size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Follow-up Automation</h3>
            <p className="text-sm text-gray-500">
              Otomatis menyapa kembali customer yang tidak merespon (Ghosting).
            </p>
          </div>
        </div>

        <label className="cursor-pointer flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border hover:bg-gray-100 transition-colors">
          <span
            className={`text-sm font-semibold ${config.isEnabled ? "text-green-600" : "text-gray-400"}`}
          >
            {config.isEnabled ? "Active" : "Disabled"}
          </span>
          <input
            type="checkbox"
            className="toggle toggle-success"
            checked={config.isEnabled}
            onChange={(e) => handleChange("isEnabled", e.target.checked)}
          />
        </label>
      </div>

      {/* --- CONFIGURATION PANEL (Only if Active) --- */}
      {config.isEnabled ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          {/* LEFT: SETTINGS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
              <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <FaClock className="text-orange-500" /> Timing Settings
              </h4>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-gray-600">
                    Jeda Waktu (Idle Time)
                  </span>
                </label>
                <div className="join w-full">
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered join-item w-full focus:outline-none focus:border-blue-500"
                    value={config.delay}
                    onChange={(e) => handleChange("delay", parseInt(e.target.value) || 15)}
                  />
                  <select
                    className="select select-bordered join-item bg-gray-50 focus:outline-none focus:border-blue-500"
                    value={config.unit}
                    onChange={(e) => handleChange("unit", e.target.value)}
                  >
                    <option value="minutes">Menit</option>
                    <option value="hours">Jam</option>
                  </select>
                </div>
                <label className="label">
                  <span className="label-text-alt text-gray-400">
                    Dihitung setelah respon terakhir AI.
                  </span>
                </label>
              </div>

              <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <FaLightbulb className="mt-1 text-blue-600 shrink-0" />
                  <p>
                    <strong>Tips:</strong> Jangan atur waktu terlalu cepat agar tidak dianggap spam.
                    Idealnya 15-30 menit untuk pesan "keranjang tertinggal".
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: PROMPT EDITOR */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                  <FiMessageSquare className="text-purple-500" /> Instruksi & Prompt
                </h4>
                <span className="badge badge-ghost text-xs">Text Only</span>
              </div>

              <div className="grow">
                <RichTextEditor
                  value={config.prompt}
                  onChange={(val) => handleChange("prompt", val)}
                  placeholder="Contoh: Halo Kak, apakah ada kendala saat pembayaran? Stok produk menipis lho..."
                  className="h-full min-h-50"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // --- EMPTY STATE ---
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 opacity-60">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FaToggleOff size={28} />
          </div>
          <h3 className="font-bold text-gray-500 text-lg">Fitur Non-aktif</h3>
          <p className="text-gray-400 max-w-md mx-auto mt-2">
            Aktifkan toggle di atas untuk mulai mengatur pesan follow-up otomatis kepada pelanggan
            Anda.
          </p>
        </div>
      )}
    </div>
  );
};

export default FollowupTab;
