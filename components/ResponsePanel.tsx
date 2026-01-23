
import React, { useState } from 'react';
import { ApiResponse } from '../types';

interface ResponsePanelProps {
  response: ApiResponse | null;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ response }) => {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  if (!response) {
    return (
      <div className="flex-[0.7] border-t border-[#2a2a2a] bg-[#0d0d0d] flex flex-col items-center justify-center text-gray-600">
        <div className="text-center flex flex-col items-center">
          <i className="fa-solid fa-rocket text-6xl mb-6 text-gray-800 animate-bounce"></i>
          <h2 className="text-xl font-bold text-gray-400 mb-2">Hit Send to get a response</h2>
          <p className="text-xs text-gray-600 max-w-[200px] leading-relaxed">
            Explore your API requests here. Your response data will appear in this area.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 400) return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div className="flex-[0.7] border-t border-[#2a2a2a] bg-[#111111] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] bg-[#0d0d0d]">
        <div className="flex space-x-6 text-[10px] font-bold">
          <div className="flex items-center">
            <span className="text-gray-500 mr-2 uppercase tracking-tighter">STATUS:</span>
            <span className={`${getStatusColor(response.status)}`}>
              {response.status} {response.statusText}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2 uppercase tracking-tighter">TIME:</span>
            <span className="text-green-500">{response.time} ms</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2 uppercase tracking-tighter">SIZE:</span>
            <span className="text-green-500">{response.size}</span>
          </div>
        </div>
        
        <div className="flex space-x-6">
          <button 
            onClick={() => setActiveTab('body')}
            className={`text-[10px] uppercase font-black tracking-widest transition-all ${activeTab === 'body' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            BODY
          </button>
          <button 
            onClick={() => setActiveTab('headers')}
            className={`text-[10px] uppercase font-black tracking-widest transition-all ${activeTab === 'headers' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            HEADERS
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#090909]">
        {activeTab === 'body' && (
          <div className="p-4 h-full">
            {response.isImage ? (
              <div className="flex items-center justify-center h-full">
                <img src={response.data} alt="Response content" className="max-w-full max-h-full rounded shadow-2xl border border-white/5" />
              </div>
            ) : (
              <pre className="text-[11px] font-mono text-gray-300 whitespace-pre-wrap selection:bg-orange-500/30">
                {typeof response.data === 'object' 
                  ? JSON.stringify(response.data, null, 2) 
                  : response.data}
              </pre>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-[#2a2a2a]">
                  <th className="pb-2 font-black">Header</th>
                  <th className="pb-2 font-black">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers).map(([key, val]) => (
                  <tr key={key} className="border-b border-[#1a1a1a] hover:bg-white/5 transition-colors">
                    <td className="py-2 text-gray-400 font-bold text-[10px] pr-4 uppercase tracking-tighter">{key}</td>
                    <td className="py-2 text-gray-500 font-mono text-[11px]">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsePanel;
