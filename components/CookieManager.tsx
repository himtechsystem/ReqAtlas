
import React, { useState } from 'react';
import { Cookie } from '../types';

interface CookieManagerProps {
  cookies: Cookie[];
  onUpdateCookies: (cookies: Cookie[]) => void;
  onClose: () => void;
}

const CookieManager: React.FC<CookieManagerProps> = ({ cookies, onUpdateCookies, onClose }) => {
  const [newCookie, setNewCookie] = useState<Cookie>({ name: '', value: '', domain: '', path: '/' });

  const addCookie = () => {
    if (newCookie.name && newCookie.domain) {
      onUpdateCookies([...cookies, newCookie]);
      setNewCookie({ name: '', value: '', domain: '', path: '/' });
    }
  };

  const removeCookie = (index: number) => {
    onUpdateCookies(cookies.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111111] border border-[#2a2a2a] w-full max-w-3xl h-[500px] flex flex-col rounded-xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-[#0d0d0d]">
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-widest flex items-center">
            <i className="fa-solid fa-cookie-bite mr-3 text-orange-500"></i>
            Cookie Jar
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="p-6 flex flex-col h-full overflow-hidden">
          <div className="mb-6 bg-[#090909] border border-[#2a2a2a] p-4 rounded-lg">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Add New Cookie</h3>
            <div className="grid grid-cols-4 gap-3">
              <input 
                placeholder="Domain (e.g. google.com)" 
                value={newCookie.domain}
                onChange={e => setNewCookie({...newCookie, domain: e.target.value})}
                className="bg-[#111] border border-[#2a2a2a] p-2 rounded text-xs text-gray-300 focus:outline-none focus:border-orange-500"
              />
              <input 
                placeholder="Name" 
                value={newCookie.name}
                onChange={e => setNewCookie({...newCookie, name: e.target.value})}
                className="bg-[#111] border border-[#2a2a2a] p-2 rounded text-xs text-gray-300 focus:outline-none focus:border-orange-500"
              />
              <input 
                placeholder="Value" 
                value={newCookie.value}
                onChange={e => setNewCookie({...newCookie, value: e.target.value})}
                className="bg-[#111] border border-[#2a2a2a] p-2 rounded text-xs text-gray-300 focus:outline-none focus:border-orange-500"
              />
              <button 
                onClick={addCookie}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded text-xs transition-colors"
              >
                Add Cookie
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-[#2a2a2a]">
                    <th className="pb-2 px-2 font-black">Domain</th>
                    <th className="pb-2 px-2 font-black">Name</th>
                    <th className="pb-2 px-2 font-black">Value</th>
                    <th className="pb-2 text-right px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cookies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-600 italic text-xs">Your cookie jar is empty. Cookies added here are automatically sent with matching requests.</td>
                    </tr>
                  ) : (
                    cookies.map((cookie, idx) => (
                      <tr key={idx} className="border-b border-[#1a1a1a] hover:bg-white/5 group transition-colors">
                        <td className="p-2 text-xs font-mono text-gray-400">{cookie.domain}</td>
                        <td className="p-2 text-xs font-bold text-gray-200">{cookie.name}</td>
                        <td className="p-2 text-xs font-mono text-gray-500 truncate max-w-[200px]">{cookie.value}</td>
                        <td className="p-2 text-right">
                          <button 
                            onClick={() => removeCookie(idx)}
                            className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieManager;
