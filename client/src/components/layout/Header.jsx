import { FaBars } from "react-icons/fa";
import { useSelector } from "react-redux"; // Hapus useDispatch & useNavigate

// Import Komponen
import Breadcrumbs from "../Breadcrumbs"; // Sesuaikan path jika perlu
import UserDropdown from "../UserDropdown"; // Pastikan path benar

const Header = ({ toggleSidebar, onLogout }) => {
  // Hanya butuh data user untuk ditampilkan
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200 h-16 px-4 sm:px-6 flex items-center justify-between shadow-sm transition-all">
      {/* KIRI: Breadcrumbs & Toggle */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <FaBars size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <Breadcrumbs />
        </div>
      </div>

      {/* KANAN: User Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Divider Vertical */}
        <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

        {/* UserDropdown sekarang menerima onLogout dari props Header.
            Saat user klik "Logout" di dropdown, ini akan memicu modal di MainLayout.
        */}
        <UserDropdown user={user} onLogout={onLogout} />
      </div>
    </header>
  );
};

export default Header;
