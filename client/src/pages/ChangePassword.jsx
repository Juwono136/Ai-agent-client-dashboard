import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { logoutUser, reset } from "../features/auth/authSlice";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Konfirmasi password tidak cocok.");
    }
    if (password.length < 8) {
      return toast.error("Password minimal 8 karakter.");
    }

    setIsLoading(true);
    try {
      await axiosInstance.put("/auth/change-password", { password });

      toast.success("Password berhasil diperbarui! Silakan login ulang.");

      await dispatch(logoutUser());
      dispatch(reset());
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal mengubah password";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-[#1C4D8D] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <FaLock />
          </div>
          <h2 className="text-2xl font-bold text-[#1C4D8D]">Selamat Datang, {user?.name}</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Untuk keamanan akun, Anda wajib mengubah password sementara Anda sebelum melanjutkan.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Password Baru */}
          <div className="form-control">
            <label className="label text-xs font-bold text-gray-500 uppercase">Password Baru</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full rounded-xl pr-12"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div className="form-control">
            <label className="label text-xs font-bold text-gray-500 uppercase">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="input input-bordered w-full rounded-xl pr-12"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn w-full bg-[#1C4D8D] hover:bg-[#153e75] text-white border-none rounded-xl mt-4 disabled:opacity-80"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Menyimpan...</span>
              </span>
            ) : (
              "Simpan & Lanjutkan"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
