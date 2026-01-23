
import React, { useState, useRef, useEffect } from 'react';
import { Collection, NavTab, RequestData, RequestType } from '../types';

interface SidebarProps {
  collections: Collection[];
  history: RequestData[];
  activeNavTab: NavTab;
  activeRequestId: string;
  onSelectRequest: (id: string) => void;
  onAddRequest: () => void;
  onDeleteRequest: (id: string) => void;
  onAddCollection: () => void;
  onDeleteCollection: (id: string) => void;
  onUpdateCollectionName: (id: string, newName: string) => void;
  onToggleSidebar: () => void;
  onRunCollection: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  collections, 
  history,
  activeNavTab,
  activeRequestId, 
  onSelectRequest, 
  onAddRequest,
  onDeleteRequest,
  onAddCollection,
  onDeleteCollection,
  onUpdateCollectionName,
  onToggleSidebar,
  onRunCollection
}) => {
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCollectionId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCollectionId]);

  const handleStartEdit = (e: React.MouseEvent, collection: Collection) => {
    e.stopPropagation();
    setEditValue(collection.name);
    setEditingCollectionId(collection.id);
  };

  const handleFinishEdit = () => {
    if (editingCollectionId && editValue.trim()) {
      onUpdateCollectionName(editingCollectionId, editValue.trim());
    }
    setEditingCollectionId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFinishEdit();
    if (e.key === 'Escape') setEditingCollectionId(null);
  };

  const getMethodColor = (method: string) => {
    switch(method) {
      case 'GET': return 'text-green-500';
      case 'POST': return 'text-yellow-500';
      case 'PUT': return 'text-blue-500';
      case 'PATCH': return 'text-purple-500';
      case 'DELETE': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getRequestTypeIcon = (type?: RequestType) => {
    switch (type) {
      case 'graphql': return { icon: 'fa-diagram-project', color: 'text-pink-500' };
      case 'websocket': return { icon: 'fa-plug', color: 'text-green-500' };
      default: return { icon: 'fa-bolt', color: 'text-orange-500' };
    }
  };

  return (
    <aside className="w-72 flex flex-col border-r border-[#2a2a2a] bg-[#111111] flex-shrink-0 animate-in slide-in-from-left duration-200">
      <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#0d0d0d] h-12">
        <div className="flex items-center">
          <span className="font-black text-gray-200 tracking-widest text-xs uppercase pl-4">
            {activeNavTab === 'collections' ? 'Collections' : 'History'}
          </span>
        </div>
        {activeNavTab === 'collections' && (
           <button onClick={onAddCollection} className="text-gray-500 hover:text-white transition-colors px-2" title="New Collection">
             <i className="fa-solid fa-folder-plus text-xs"></i>
           </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto pt-2 no-scrollbar">
        {activeNavTab === 'collections' ? (
          <div className="mt-1">
            {collections.map(col => (
              <div key={col.id} className="mb-2">
                <div className="flex items-center px-6 py-2 text-gray-400 group hover:text-white transition-colors cursor-pointer">
                  <i className="fa-solid fa-chevron-down text-[10px] mr-2 transition-transform"></i>
                  <i className="fa-solid fa-folder mr-2 text-yellow-600/80"></i>
                  
                  {editingCollectionId === col.id ? (
                    <input
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleFinishEdit}
                      onKeyDown={handleKeyDown}
                      className="bg-[#090909] border border-orange-500 text-xs px-1 rounded flex-1 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div 
                      className="truncate flex-1 font-medium flex items-center group/title"
                      onClick={(e) => handleStartEdit(e, col)}
                    >
                      <span className="truncate">{col.name}</span>
                      <i className="fa-solid fa-pencil text-[9px] ml-2 opacity-0 group-hover/title:opacity-100 transition-opacity text-gray-600 hover:text-orange-500"></i>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRunCollection(col.id); }}
                      className="text-gray-500 hover:text-orange-500 transition-colors"
                      title="Run Collection (Batch)"
                    >
                      <i className="fa-solid fa-play text-[9px]"></i>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAddRequest(); }}
                      className="text-gray-500 hover:text-green-500 transition-colors"
                      title="Add Request"
                    >
                      <i className="fa-solid fa-plus text-[10px]"></i>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteCollection(col.id); }}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete Collection"
                    >
                      <i className="fa-solid fa-trash text-[10px]"></i>
                    </button>
                  </div>
                </div>
                
                <div className="ml-8 border-l border-[#2a2a2a]">
                  {col.requests.map(req => {
                    const { icon, color } = getRequestTypeIcon(req.requestType);
                    return (
                      <div 
                        key={req.id}
                        onClick={() => onSelectRequest(req.id)}
                        className={`flex items-center px-6 py-2 cursor-pointer transition-all border-l-2 group ${
                          activeRequestId === req.id 
                            ? 'bg-orange-500/5 text-white border-orange-500' 
                            : 'text-gray-400 hover:bg-white/5 border-transparent'
                        }`}
                      >
                        <i className={`fa-solid ${icon} text-[10px] w-4 mr-2 ${color}`}></i>
                        <span className={`text-[9px] font-black w-8 mr-1 ${getMethodColor(req.method)}`}>
                          {req.method}
                        </span>
                        <span className="truncate flex-1 text-xs">{req.name}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteRequest(req.id); }}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 p-1 transition-opacity"
                        >
                          <i className="fa-solid fa-xmark text-[10px]"></i>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            {history.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-600 italic text-xs">
                No history yet
              </div>
            ) : (
              history.map(req => {
                const { icon, color } = getRequestTypeIcon(req.requestType);
                return (
                  <div 
                    key={req.id}
                    onClick={() => onSelectRequest(req.id)}
                    className={`flex items-center px-6 py-3 cursor-pointer transition-all border-l-2 group ${
                      activeRequestId === req.id 
                        ? 'bg-orange-500/5 text-white border-orange-500' 
                        : 'text-gray-400 hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <i className={`fa-solid ${icon} text-[10px] w-4 mr-2 ${color}`}></i>
                        <span className={`text-[9px] font-black w-10 mr-1 ${getMethodColor(req.method)}`}>
                          {req.method}
                        </span>
                        <span className="truncate text-xs font-bold">{req.name}</span>
                      </div>
                      <span className="truncate text-[10px] text-gray-500 font-mono ml-6">{req.url}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteRequest(req.id); }}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 p-1 transition-opacity ml-2"
                    >
                      <i className="fa-solid fa-trash-can text-[10px]"></i>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer signature */}
      <div className="p-3 border-t border-[#2a2a2a] bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-600 select-none opacity-50 hover:opacity-100 transition-opacity">
          Author <span className="text-orange-500">@HanHuan</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
