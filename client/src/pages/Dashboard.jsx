import { useSelector } from "react-redux";
import {
  FaUsers,
  FaRobot,
  FaWhatsapp,
  FaChartLine,
  FaServer,
  FaComments,
  FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

// --- WIDGET CARD COMPONENT ---
const StatCard = ({ title, value, icon, colorClass, desc }) => (
  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
    </div>
    {desc && <p className="text-xs text-gray-400">{desc}</p>}
  </div>
);

// --- ADMIN VIEW ---
const AdminDashboard = ({ user }) => (
  <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
    {/* Welcome Section */}
    <div className="bg-linear-to-r from-[#1C4D8D] to-[#153e75] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg shadow-blue-900/20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Selamat Datang, Admin! 🚀</h1>
        <p className="text-blue-100 opacity-90 max-w-xl">
          Pantau pertumbuhan user dan performa sistem secara realtime. Kelola akses pelanggan dengan
          mudah dari sini.
        </p>
      </div>
      <div className="hidden md:block opacity-80">
        <FaServer size={80} />
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <StatCard
        title="Total Customer"
        value="12"
        icon={<FaUsers className="text-blue-600" />}
        colorClass="bg-blue-50"
        desc="↗ 2 user baru minggu ini"
      />
      <StatCard
        title="Active Subscription"
        value="8"
        icon={<FaChartLine className="text-green-600" />}
        colorClass="bg-green-50"
        desc="100% operational status"
      />
      <StatCard
        title="System Health"
        value="98%"
        icon={<FaServer className="text-purple-600" />}
        colorClass="bg-purple-50"
        desc="Server load normal"
      />
    </div>

    {/* Quick Actions Table Preview */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">Customer Terbaru</h3>
        <Link to="/users" className="text-sm text-[#1C4D8D] font-bold hover:underline">
          Lihat Semua
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full min-w-125">
          <thead>
            <tr className="bg-gray-50 text-gray-500 border-b-0">
              <th>Nama</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Dummy Data */}
            <tr className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="font-bold whitespace-nowrap">Budi Santoso</td>
              <td>budi@example.com</td>
              <td>
                <span className="badge badge-success gap-2 text-white">Active</span>
              </td>
            </tr>
            <tr className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="font-bold whitespace-nowrap">Siti Aminah</td>
              <td>siti@corp.com</td>
              <td>
                <span className="badge badge-warning gap-2 text-white">Pending</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// --- CUSTOMER VIEW ---
const CustomerDashboard = ({ user }) => (
  <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
    {/* Welcome Section */}
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm max-w-7xl mx-auto">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Halo, {user?.name} 👋</h1>
        <p className="text-gray-500 mb-6">
          AI Agent Anda siap melayani pelanggan. Cek performa chatbot Anda hari ini.
        </p>
        <Link
          to="/ai-agents"
          className="btn bg-[#1C4D8D] hover:bg-[#153e75] text-white border-none rounded-xl normal-case px-6 shadow-lg shadow-blue-900/10"
        >
          Buat Agent Baru <FaArrowRight className="ml-2" />
        </Link>
      </div>
      <div className="w-full md:w-1/3 bg-blue-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <div className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-1">
          Status Koneksi
        </div>
        <div className="text-green-600 font-bold text-lg flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          WhatsApp Connected
        </div>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <StatCard
        title="Total Agents"
        value="1"
        icon={<FaRobot className="text-indigo-600" />}
        colorClass="bg-indigo-50"
      />
      <StatCard
        title="Messages Today"
        value="142"
        icon={<FaComments className="text-orange-600" />}
        colorClass="bg-orange-50"
      />
      <StatCard
        title="Platform"
        value="WA Business"
        icon={<FaWhatsapp className="text-green-600" />}
        colorClass="bg-green-50"
      />
    </div>

    {/* Graph Placeholder */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-50 sm:min-h-75 flex flex-col items-center justify-center text-center">
      <div className="bg-gray-50 p-4 rounded-full mb-4">
        <FaChartLine size={32} className="text-gray-300" />
      </div>
      <h3 className="font-bold text-gray-400">Statistik Percakapan</h3>
      <p className="text-sm text-gray-400">
        Grafik aktivitas chatbot akan muncul di sini setelah ada interaksi.
      </p>
    </div>
  </div>
);

// --- MAIN CONTROLLER ---
const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="w-full space-y-6">
      {user?.role === "admin" ? <AdminDashboard user={user} /> : <CustomerDashboard user={user} />}
    </div>
  );
};

export default Dashboard;
