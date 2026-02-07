import { Link } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

/**
 * Komponen untuk menampilkan tabel customer terbaru
 */
const RecentCustomersTable = ({ customers, isLoading }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <span className="badge badge-success gap-2 text-white">Active</span>;
      case "Expired":
        return <span className="badge badge-error gap-2 text-white">Expired</span>;
      case "Inactive":
        return <span className="badge badge-warning gap-2 text-white">Inactive</span>;
      default:
        return <span className="badge badge-ghost gap-2">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Customer Terbaru</h3>
          <Link to="/users" className="text-sm text-[#1C4D8D] font-bold hover:underline">
            Lihat Semua
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-gray-400 text-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">Customer Terbaru</h3>
        <Link to="/users" className="text-sm text-[#1C4D8D] font-bold hover:underline">
          Lihat Semua
        </Link>
      </div>
      <div className="overflow-x-auto">
        {customers && customers.length > 0 ? (
          <table className="table w-full min-w-125">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b-0">
                <th>Nama</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, idx) => (
                <tr
                  key={customer.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <td className="font-bold whitespace-nowrap">{customer.name}</td>
                  <td className="text-gray-600">{customer.email}</td>
                  <td>{getStatusBadge(customer.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Belum ada customer</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentCustomersTable;
