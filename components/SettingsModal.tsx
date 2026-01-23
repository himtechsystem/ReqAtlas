
import React from 'react';

interface SettingsModalProps {
  onExport: () => void;
  onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onExport, onLoad, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="bg-[#111111] border border-[#2a2a2a] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-[#0d0d0d]">
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-widest flex items-center">
            <i className="fa-solid fa-gear mr-3 text-orange-500"></i>
            Settings
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Configuration Management</h3>
            
            <button 
              onClick={onExport}
              className="w-full flex items-center justify-between p-4 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
            >
              <div className="flex items-center">
                <i className="fa-solid fa-file-export text-orange-500 mr-4 text-xl"></i>
                <div className="text-left">
                  <p className="text-gray-200 font-bold text-sm">Export Configuration</p>
                  <p className="text-gray-500 text-[10px]">Download your collections and environments as JSON</p>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-700 group-hover:text-orange-500 transition-colors"></i>
            </button>

            <label className="w-full flex items-center justify-between p-4 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group cursor-pointer">
              <div className="flex items-center">
                <i className="fa-solid fa-file-import text-orange-500 mr-4 text-xl"></i>
                <div className="text-left">
                  <p className="text-gray-200 font-bold text-sm">Load Configuration</p>
                  <p className="text-gray-500 text-[10px]">Import a previously saved configuration file</p>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-700 group-hover:text-orange-500 transition-colors"></i>
              <input type="file" className="hidden" accept=".json" onChange={onLoad} />
            </label>
          </div>
        </div>

        <div className="p-4 bg-[#0d0d0d] border-t border-[#2a2a2a] flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold rounded shadow-lg transition-all active:scale-95 uppercase tracking-widest"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
