import { FaTrash, FaImage } from "react-icons/fa";

const KnowledgeItem = ({ item, onDelete }) => {
  return (
    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors group">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-200 flex items-center justify-center text-gray-300">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="Knowledge" className="w-full h-full object-cover" />
        ) : (
          <FaImage size={24} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-700 text-sm line-clamp-1" title={item.description}>
          {item.description}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          ID: {item.id.substring(0, 8)}... • Ditambahkan:{" "}
          {new Date(item.createdAt).toLocaleDateString("id-ID")}
        </p>
      </div>

      {/* Action */}
      <button
        onClick={() => onDelete(item.id)}
        className="btn btn-xs btn-square btn-ghost text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        title="Hapus Knowledge"
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default KnowledgeItem;
