import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";

const InfoModal = ({ isOpen, onClose, title, message, type = "success" }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative transform transition-all duration-300 scale-100 opacity-100 animate-[fadeIn_0.3s_ease-out]">
        <div className="flex flex-col items-center text-center mt-2">
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 text-3xl ${isSuccess ? "bg-green-100 text-green-600" : "bg-blue-100 text-[#1C4D8D]"}`}
          >
            {isSuccess ? <FaCheckCircle /> : <FaInfoCircle />}
          </div>

          <h3 className="text-xl font-bold text-[#1C4D8D] mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">{message}</p>

          <button
            onClick={onClose}
            className="btn w-full bg-[#1C4D8D] hover:bg-[#4988C4] text-white border-none normal-case font-bold rounded-xl"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
