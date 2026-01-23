
import React from 'react';
import { RequestType } from '../types';

interface NewRequestModalProps {
  onSelect: (type: RequestType) => void;
  onClose: () => void;
}

const NewRequestModal: React.FC<NewRequestModalProps> = ({ onSelect, onClose }) => {
  const options: { type: RequestType; icon: string; label: string; desc: string; color: string }[] = [
    { 
      type: 'http', 
      icon: 'fa-bolt', 
      label: 'HTTP Request', 
      desc: 'Standard REST API request (GET, POST, etc.)',
      color: 'text-orange-500'
    },
    { 
      type: 'graphql', 
      icon: 'fa-diagram-project', 
      label: 'GraphQL Query', 
      desc: 'Query language for APIs',
      color: 'text-pink-500'
    },
    { 
      type: 'websocket', 
      icon: 'fa-plug', 
      label: 'WebSocket', 
      desc: 'Bi-directional real-time communication',
      color: 'text-green-500'
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="bg-[#111111] border border-[#2a2a2a] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-[#0d0d0d]">
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-widest flex items-center">
            <i className="fa-solid fa-plus-circle mr-3 text-orange-500"></i>
            Create New Request
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-500 text-xs mb-6 uppercase tracking-widest font-bold">Select Request Type</p>
          <div className="grid grid-cols-2 gap-4">
            {options.map((opt) => (
              <button
                key={opt.type}
                onClick={() => onSelect(opt.type)}
                className="flex items-start p-4 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-left group"
              >
                <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mr-4 group-hover:bg-white/10 transition-colors ${opt.color}`}>
                  <i className={`fa-solid ${opt.icon} text-xl`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-200 font-bold mb-1 text-sm">{opt.label}</h3>
                  <p className="text-gray-500 text-[10px] leading-relaxed">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#0d0d0d] border-t border-[#2a2a2a] flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewRequestModal;
