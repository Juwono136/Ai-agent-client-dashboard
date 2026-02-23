import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../features/auth/authSlice";

const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Saat mount/refresh: ambil data user terbaru dari DB (setelah admin update, cukup refresh halaman)
  useEffect(() => {
    if (user) {
      dispatch(getMe());
    }
  }, [dispatch]);

  // Jika tidak ada user (state kosong), tendang ke Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // --- LOGIC FIRST LOGIN ---
  // Jika user isFirstLogin = true, dia HANYA boleh akses /change-password
  if (user.isFirstLogin && location?.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  // Jika user sudah TIDAK FirstLogin, tapi mencoba akses /change-password, kembalikan ke dashboard
  if (!user.isFirstLogin && location.pathname === "/change-password") {
    return <Navigate to="/dashboard" replace />;
  }

  // Jika ada, render halaman tujuan (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
