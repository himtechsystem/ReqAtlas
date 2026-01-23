
import React from 'react';
import { ConsoleLog } from '../types';

interface ConsoleOverlayProps {
  isOpen: boolean;
  logs: ConsoleLog[];
  onClose: () => void;
  onClear: () => void;
}

const ConsoleOverlay: React.FC<ConsoleOverlayProps> = ({ isOpen, logs, onClose, onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-64 bg-[#0d0d0d] border-t border-[#2a2a2a] flex flex-col z-40 animate-in slide-in-from-bottom duration-300 shadow-2xl">
      <header className="flex items-center justify-between px-6 h-10 border-b border-[#2a2a2a] bg-[#111] flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
            <i className="fa-solid fa-terminal mr-2 text-orange-500"></i>
            Console
          </span>
          <span className="text-[10px] bg-white/10 text-gray-500 px-2 py-0.5 rounded-full">{logs.length}</span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onClear}
            className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            Clear
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] no-scrollbar">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-700 italic">No logs yet. Try sending a request!</div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="border-l-2 border-[#2a2a2a] pl-4 group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600 text-[9px]">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={`uppercase text-[9px] font-black tracking-widest ${
                      log.type === 'error' ? 'text-red-500' : 
                      log.type === 'request' ? 'text-blue-500' :
                      log.type === 'response' ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-gray-300 break-all">{log.message}</span>
                  </div>
                </div>
                {log.details && (
                  <pre className="mt-2 p-2 bg-black/30 rounded text-gray-500 overflow-x-auto max-h-32 text-[10px]">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsoleOverlay;
