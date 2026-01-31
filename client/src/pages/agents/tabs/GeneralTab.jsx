import { FaRobot, FaCommentDots, FaExchangeAlt, FaImage, FaCloudUploadAlt } from "react-icons/fa";

// Helper Component untuk Character Counter
const CharCount = ({ current, max }) => (
  <span className={`text-xs ${current > max ? "text-red-500 font-bold" : "text-gray-400"}`}>
    {current || 0} / {max} chars
  </span>
);

// Terima prop baru: previewImage dan handleRemoveImage (opsional jika ingin fitur remove)
const GeneralTab = ({ formData, handleChange, handleFileChange, previewImage }) => {
  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out] max-w-4xl mx-auto">
      {/* 1. IDENTITY SECTION (Tetap Sama) */}
      <section className="bg-white p-1">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
          <FaRobot className="text-[#1C4D8D]" /> Identitas & Behavior
        </h3>
        <div className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-control">
              <label className="label-text font-semibold text-gray-700 mb-1">
                Nama Agent <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered w-full rounded-lg focus:ring-1 focus:ring-[#1C4D8D]"
                placeholder="Ex: CS Toko Batik"
              />
            </div>
            <div className="form-control">
              <label className="label-text font-semibold text-gray-700 mb-1">
                Deskripsi Internal
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input input-bordered w-full rounded-lg focus:ring-1 focus:ring-[#1C4D8D]"
                placeholder="Catatan untuk admin..."
              />
            </div>
          </div>

          <div className="form-control">
            <div className="flex justify-between items-center mb-1">
              <label className="label-text font-semibold text-gray-700">
                AI Agent Behavior (System Prompt)
              </label>
              <CharCount current={formData.systemInstruction?.length} max={15000} />
            </div>
            <textarea
              name="systemInstruction"
              value={formData.systemInstruction}
              onChange={handleChange}
              maxLength={15000}
              className="textarea textarea-bordered w-full rounded-lg h-64 font-mono text-sm leading-relaxed focus:ring-1 focus:ring-[#1C4D8D]"
              placeholder="Anda adalah asisten virtual..."
            />
          </div>
        </div>
      </section>

      {/* 2. GREETING SECTION (Updated Preview) */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
          <FaCommentDots className="text-[#1C4D8D]" /> Sapaan (Greeting)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Text Greeting */}
          <div className="lg:col-span-2 form-control">
            <div className="flex justify-between items-center mb-1">
              <label className="label-text font-semibold text-gray-700">Welcome Message</label>
              <CharCount current={formData.welcomeMessage?.length} max={5000} />
            </div>
            <textarea
              name="welcomeMessage"
              value={formData.welcomeMessage}
              onChange={handleChange}
              maxLength={5000}
              className="textarea textarea-bordered w-full rounded-lg h-40 focus:ring-1 focus:ring-[#1C4D8D]"
              placeholder="Halo! Ada yang bisa saya bantu hari ini?"
            />
          </div>

          {/* Image Upload dengan PREVIEW LANGSUNG */}
          <div className="form-control">
            <label className="label-text font-semibold text-gray-700 mb-1">
              Gambar Sapaan (Opsional)
            </label>

            {previewImage ? (
              // TAMPILKAN PREVIEW JIKA ADA GAMBAR
              <div className="relative group rounded-xl overflow-hidden border border-gray-200 h-40 bg-gray-50 flex items-center justify-center">
                <img
                  src={previewImage}
                  alt="Preview Welcome"
                  className="w-full h-full object-cover"
                />
                {/* Overlay ganti gambar */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                  <FaCloudUploadAlt size={24} />
                  <span className="text-xs font-medium mt-1">Ganti Gambar</span>
                  <input
                    type="file"
                    name="welcomeImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              // TAMPILKAN UPLOAD BOX JIKA KOSONG
              <div className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-[#1C4D8D] transition-all relative cursor-pointer group">
                <input
                  type="file"
                  name="welcomeImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="text-gray-400 group-hover:text-[#1C4D8D] transition-colors flex flex-col items-center">
                  <FaImage size={24} className="mb-2" />
                  <span className="text-xs font-medium">Upload Image</span>
                </div>
              </div>
            )}

            <p className="text-[10px] text-gray-400 mt-2">
              Gambar ini akan dikirim bersamaan dengan pesan sambutan saat user pertama kali chat.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HANDOFF SECTION (Tetap Sama) */}
      <section>
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
          <FaExchangeAlt className="text-[#1C4D8D]" /> Human Handoff
        </h3>
        <div className="form-control">
          <div className="flex justify-between items-center mb-1">
            <label className="label-text font-semibold text-gray-700">
              Agent Transfer Conditions
            </label>
            <CharCount current={formData.transferCondition?.length} max={750} />
          </div>
          <textarea
            name="transferCondition"
            value={formData.transferCondition}
            onChange={handleChange}
            maxLength={750}
            className="textarea textarea-bordered w-full rounded-lg h-24 focus:ring-1 focus:ring-[#1C4D8D]"
            placeholder="Contoh: Jika user meminta berbicara dengan manusia..."
          />
        </div>
      </section>
    </div>
  );
};

export default GeneralTab;
