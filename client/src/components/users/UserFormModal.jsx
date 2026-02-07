import { useState, useEffect } from "react";
import { FaTimes, FaUser, FaEnvelope, FaUserTag, FaCalendarAlt, FaLink } from "react-icons/fa";

const UserFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "customer",
    isActive: true,
    subscriptionMonths: "",
    n8nWebhookUrl: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // For edit mode, subscriptionMonths is used to extend subscription
        // We don't calculate from expiry date, just leave it empty for admin to set extension
        setFormData({
          name: initialData.name,
          email: initialData.email,
          role: initialData.role,
          isActive: initialData.isActive,
          subscriptionMonths: "", // Empty for edit - admin will set extension months
          n8nWebhookUrl: initialData.n8nWebhookUrl || "",
        });
      } else {
        setFormData({
          name: "",
          email: "",
          role: "customer",
          isActive: true,
          subscriptionMonths: "",
          n8nWebhookUrl: "",
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        {/* Header */}
        <div className="bg-[#1C4D8D] px-6 py-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">
            {initialData ? "Edit User" : "Tambah Customer Baru"}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="hover:text-gray-300 disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <fieldset disabled={isLoading} className="space-y-4">
            {/* Nama */}
            <div className="form-control">
              <label className="label text-xs font-bold text-gray-500 uppercase">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <FaUser />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10 rounded-xl"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label text-xs font-bold text-gray-500 uppercase">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10 rounded-xl"
                  placeholder="email@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!initialData}
                  required
                />
              </div>
              {!initialData && (
                <span className="text-[10px] text-gray-400 mt-1">
                  *Password sementara akan dikirim ke email ini.
                </span>
              )}
            </div>

            {/* Role & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label text-xs font-bold text-gray-500 uppercase">Role</label>
                <div className="relative">
                  <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <FaUserTag />
                  </div>
                  <select
                    className="select select-bordered w-full pl-10 rounded-xl"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {initialData && (
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-500 uppercase">
                    Status Akun
                  </label>
                  <select
                    className={`select select-bordered w-full rounded-xl font-bold ${
                      formData.isActive ? "text-green-600" : "text-red-500"
                    }`}
                    value={formData.isActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive / Suspend</option>
                  </select>
                </div>
              )}
            </div>

            {/* Subscription Validity - Only for Customer */}
            {formData.role === "customer" && (
              <div className="form-control">
                <label className="label text-xs font-bold text-gray-500 uppercase">
                  Masa Berlaku Langganan
                </label>
                <div className="relative">
                  <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <FaCalendarAlt />
                  </div>
                  <select
                    className="select select-bordered w-full pl-10 rounded-xl"
                    value={formData.subscriptionMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, subscriptionMonths: e.target.value })
                    }
                    required={formData.role === "customer"}
                  >
                    <option value="">Pilih Masa Berlaku</option>
                    {/* TESTING OPTION: Opsi 1 hari untuk testing - HAPUS atau KOMENTARI setelah testing selesai */}
                    <option value="0" className="text-orange-600 font-bold">
                      1 Hari (Testing)
                    </option>
                    {/* END TESTING OPTION */}
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {month} {month === 1 ? "Bulan" : "Bulan"}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">
                  *Pilih durasi langganan (1-12 bulan)
                </span>
              </div>
            )}

            {/* n8n Webhook URL - Only for Customer */}
            {formData.role === "customer" && (
              <div className="form-control">
                <label className="label text-xs font-bold text-gray-500 uppercase">
                  URL Webhook n8n
                </label>
                <div className="relative">
                  <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <FaLink />
                  </div>
                  <input
                    type="url"
                    className="input input-bordered w-full pl-10 rounded-xl"
                    placeholder="https://n8n.example.com/webhook/..."
                    value={formData.n8nWebhookUrl}
                    onChange={(e) => setFormData({ ...formData, n8nWebhookUrl: e.target.value })}
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1">
                  *URL webhook n8n untuk menghubungkan workflow dengan sistem
                </span>
              </div>
            )}
          </fieldset>

          {/* Actions */}
          <div className="flex gap-3 pt-4 mt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn flex-1 bg-white border-gray-300 text-gray-600 hover:bg-gray-50 normal-case disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="btn flex-1 bg-[#1C4D8D] hover:bg-[#153e75] text-white border-none normal-case disabled:opacity-80"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="text-sm font-semibold">
                    {initialData ? "Menyimpan..." : "Memproses..."}
                  </span>
                </span>
              ) : initialData ? (
                "Simpan Perubahan"
              ) : (
                "Tambah User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
