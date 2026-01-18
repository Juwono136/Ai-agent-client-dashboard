import { useState, useRef, useEffect } from "react";
import { FaSignOutAlt, FaChevronDown, FaUserShield, FaUserTie } from "react-icons/fa";

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ikon berdasarkan Role
  const RoleIcon = user?.role === "admin" ? FaUserShield : FaUserTie;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-gray-50 py-1 px-2 rounded-lg transition-all border border-transparent hover:border-gray-200"
      >
        {/* Info Nama di Desktop (Tetap ada agar terlihat profesional) */}
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-gray-700 leading-tight">{user?.name}</p>
        </div>
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#1C4D8D] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <FaChevronDown
          size={10}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50 animate-[fadeIn_0.2s_ease-out] overflow-hidden">
          {/* Header: Informasi User Lengkap */}
          <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1C4D8D] flex items-center justify-center">
                <RoleIcon size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#1C4D8D] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {user?.role}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 wrap-break-word bg-white p-2 rounded border border-gray-100">
              {user?.email}
            </p>
          </div>

          {/* Tombol Logout */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg flex gap-2 items-center justify-start transition-colors font-medium group"
            >
              <FaSignOutAlt size={14} className="group-hover:translate-x-1 transition-transform" />
              <span>Keluar Aplikasi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
