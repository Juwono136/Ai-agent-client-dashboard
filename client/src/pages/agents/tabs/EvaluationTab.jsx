import { FaChartBar, FaChartLine, FaHistory, FaSmile } from "react-icons/fa";

const EvaluationTab = () => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="alert bg-purple-50 border-purple-100 text-purple-700 text-sm">
        <FaChartLine />
        <span>
          Data analitik akan tersedia setelah AI Agent mulai berinteraksi dengan pengguna nyata.
        </span>
      </div>

      {/* Grid Stats Mockup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50 pointer-events-none grayscale">
        <div className="stats shadow border border-gray-100">
          <div className="stat">
            <div className="stat-figure text-[#1C4D8D]">
              <FaChartBar size={24} />
            </div>
            <div className="stat-title">Total Percakapan</div>
            <div className="stat-value text-[#1C4D8D]">0</div>
            <div className="stat-desc">Bulan ini</div>
          </div>
        </div>

        <div className="stats shadow border border-gray-100">
          <div className="stat">
            <div className="stat-figure text-green-600">
              <FaSmile size={24} />
            </div>
            <div className="stat-title">Sentiment Score</div>
            <div className="stat-value text-green-600">0%</div>
            <div className="stat-desc">Kepuasan User</div>
          </div>
        </div>

        <div className="stats shadow border border-gray-100">
          <div className="stat">
            <div className="stat-figure text-orange-500">
              <FaHistory size={24} />
            </div>
            <div className="stat-title">Handover Rate</div>
            <div className="stat-value text-orange-500">0%</div>
            <div className="stat-desc">Transfer ke Manusia</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-gray-400 text-sm italic">Menunggu data interaksi...</p>
      </div>
    </div>
  );
};

export default EvaluationTab;
