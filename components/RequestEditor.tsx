
import React, { useState, useEffect } from 'react';
import { HttpMethod, RequestData, KeyValue, RequestType, AuthConfig } from '../types';

interface RequestEditorProps {
  request: RequestData;
  onUpdate: (updated: RequestData) => void;
  onSend: () => void;
}

const RequestEditor: React.FC<RequestEditorProps> = ({ request, onUpdate, onSend }) => {
  const [activeTab, setActiveTab] = useState<string>('params');

  // Reset tab when type changes
  useEffect(() => {
    switch(request.requestType) {
      case 'graphql': setActiveTab('query'); break;
      case 'websocket': setActiveTab('message'); break;
      default: setActiveTab('params'); break;
    }
  }, [request.requestType]);

  const getAvailableMethods = (type?: RequestType) => {
    if (type === 'graphql') return [HttpMethod.POST];
    return Object.values(HttpMethod);
  };

  const methods = getAvailableMethods(request.requestType);

  const updateField = <K extends keyof RequestData>(key: K, value: RequestData[K]) => {
    onUpdate({ ...request, [key]: value });
  };

  const updateAuthField = (field: keyof AuthConfig, value: any) => {
    onUpdate({
      ...request,
      auth: { ...request.auth, [field]: value }
    });
  };

  const updateNestedAuthField = (type: 'basic' | 'bearer' | 'oauth2', field: string, value: string) => {
    const currentAuth = request.auth || { type: 'none' };
    const typeData = (currentAuth[type] as any) || {};
    onUpdate({
      ...request,
      auth: {
        ...currentAuth,
        [type]: { ...typeData, [field]: value }
      }
    });
  };

  const addKeyValue = (type: 'params' | 'headers') => {
    const list = [...request[type]];
    list.push({ key: '', value: '', enabled: true });
    updateField(type, list);
  };

  const removeKeyValue = (type: 'params' | 'headers', index: number) => {
    const list = [...request[type]];
    if (list.length > 1) {
      list.splice(index, 1);
      updateField(type, list);
    } else {
      list[0] = { key: '', value: '', enabled: true };
      updateField(type, list);
    }
  };

  const updateKeyValue = (type: 'params' | 'headers', index: number, field: keyof KeyValue, value: any) => {
    const list = [...request[type]];
    list[index] = { ...list[index], [field]: value };
    
    if (index === list.length - 1 && (field === 'key' || field === 'value') && value !== '') {
      list.push({ key: '', value: '', enabled: true });
    }
    
    updateField(type, list);
  };

  const getTabsForType = (type?: RequestType) => {
    switch (type) {
      case 'graphql': return [
        { id: 'query', label: 'Query' },
        { id: 'variables', label: 'Variables' },
        { id: 'auth', label: 'Auth' },
        { id: 'headers', label: 'Headers' }
      ];
      case 'websocket': return [
        { id: 'message', label: 'Message' },
        { id: 'auth', label: 'Auth' },
        { id: 'headers', label: 'Headers' }
      ];
      default: return [
        { id: 'params', label: 'Params' },
        { id: 'auth', label: 'Auth' },
        { id: 'headers', label: 'Headers' },
        { id: 'body', label: 'Body' }
      ];
    }
  };

  const tabs = getTabsForType(request.requestType);

  return (
    <div className="flex flex-col flex-1 bg-[#111111] overflow-hidden">
      <div className="p-4 flex flex-col space-y-4">
        <div className="flex items-center">
          <input 
            value={request.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="bg-transparent border-none text-gray-200 text-lg font-bold focus:ring-0 focus:outline-none w-full"
            placeholder="Untitled Request"
          />
        </div>
        
        <div className="flex space-x-2">
          <div className="flex flex-1 border border-[#2a2a2a] rounded overflow-hidden bg-[#090909]">
            {request.requestType !== 'websocket' && (
              <select 
                value={request.method}
                onChange={(e) => updateField('method', e.target.value as HttpMethod)}
                className="bg-[#1a1a1a] text-gray-300 px-4 py-2 border-r border-[#2a2a2a] focus:outline-none cursor-pointer hover:bg-[#252525] transition-colors font-bold text-xs"
              >
                {methods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}
            <input 
              value={request.url}
              onChange={(e) => updateField('url', e.target.value)}
              className="flex-1 bg-transparent px-4 py-2 text-gray-300 focus:outline-none placeholder-gray-600 font-mono text-xs"
              placeholder={request.requestType === 'websocket' ? "ws://localhost:8080" : "Enter URL or paste text"}
            />
          </div>
          <button 
            onClick={onSend}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2 rounded transition-all active:scale-95 flex items-center shadow-lg"
          >
            <span>{request.requestType === 'websocket' ? 'Connect' : 'Send'}</span>
            <i className={`fa-solid ${request.requestType === 'websocket' ? 'fa-plug' : 'fa-paper-plane'} ml-2 text-xs`}></i>
          </button>
        </div>
      </div>

      <div className="flex items-center border-b border-[#2a2a2a] px-4">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 ${
                activeTab === tab.id ? 'text-orange-500 border-orange-500' : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'auth' && (
          <div className="flex flex-col space-y-6 max-w-2xl mx-auto py-4">
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</label>
              <select 
                value={request.auth?.type || 'none'}
                onChange={(e) => updateAuthField('type', e.target.value)}
                className="bg-[#090909] border border-[#2a2a2a] rounded px-4 py-2 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
              >
                <option value="none">No Auth</option>
                <option value="basic">Basic Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="oauth2">OAuth 2.0</option>
              </select>
              <p className="text-[10px] text-gray-600">Selecting an auth type will automatically include the required headers when sending the request.</p>
            </div>

            {request.auth?.type === 'basic' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Username</label>
                  <input 
                    value={request.auth.basic?.username || ''}
                    onChange={(e) => updateNestedAuthField('basic', 'username', e.target.value)}
                    placeholder="Username"
                    className="bg-[#090909] border border-[#2a2a2a] rounded px-4 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Password</label>
                  <input 
                    type="password"
                    value={request.auth.basic?.password || ''}
                    onChange={(e) => updateNestedAuthField('basic', 'password', e.target.value)}
                    placeholder="Password"
                    className="bg-[#090909] border border-[#2a2a2a] rounded px-4 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {request.auth?.type === 'bearer' && (
              <div className="flex flex-col space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Token</label>
                <textarea 
                  value={request.auth.bearer?.token || ''}
                  onChange={(e) => updateNestedAuthField('bearer', 'token', e.target.value)}
                  placeholder="Token"
                  className="bg-[#090909] border border-[#2a2a2a] rounded px-4 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-orange-500 h-24 resize-none"
                />
              </div>
            )}

            {request.auth?.type === 'oauth2' && (
              <div className="flex flex-col space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Access Token</label>
                <textarea 
                  value={request.auth.oauth2?.accessToken || ''}
                  onChange={(e) => updateNestedAuthField('oauth2', 'accessToken', e.target.value)}
                  placeholder="Access Token"
                  className="bg-[#090909] border border-[#2a2a2a] rounded px-4 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-orange-500 h-24 resize-none"
                />
                <p className="text-[9px] text-gray-600">OAuth 2.0 access tokens are typically passed in the Authorization header as a Bearer token.</p>
              </div>
            )}

            {request.auth?.type === 'none' && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-600 italic">
                <i className="fa-solid fa-shield-slash text-4xl mb-4 opacity-10"></i>
                <p className="text-xs">This request does not use any authentication.</p>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'params' || activeTab === 'headers') && (
          <div className="flex flex-col">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-[#2a2a2a]">
                  <th className="w-10 pb-2"></th>
                  <th className="pb-2 px-2">Key</th>
                  <th className="pb-2 px-2">Value</th>
                  <th className="pb-2 px-2">Description</th>
                  <th className="w-20 pb-2 text-right px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'params' ? request.params : request.headers).map((item, idx) => (
                  <tr key={idx} className="border-b border-[#1a1a1a] hover:bg-white/5 transition-colors group">
                    <td className="p-2 text-center">
                      <input 
                        type="checkbox" 
                        checked={item.enabled} 
                        onChange={(e) => updateKeyValue(activeTab as 'params' | 'headers', idx, 'enabled', e.target.checked)}
                        className="accent-orange-500 w-3 h-3"
                      />
                    </td>
                    <td className="p-1 px-2">
                      <input 
                        value={item.key}
                        onChange={(e) => updateKeyValue(activeTab as 'params' | 'headers', idx, 'key', e.target.value)}
                        placeholder="Key"
                        className="bg-transparent w-full text-gray-300 focus:outline-none placeholder-gray-700 text-[11px] font-mono"
                      />
                    </td>
                    <td className="p-1 px-2">
                      <input 
                        value={item.value}
                        onChange={(e) => updateKeyValue(activeTab as 'params' | 'headers', idx, 'value', e.target.value)}
                        placeholder="Value"
                        className="bg-transparent w-full text-gray-300 focus:outline-none placeholder-gray-700 text-[11px] font-mono"
                      />
                    </td>
                    <td className="p-1 px-2">
                      <input 
                        value={item.description || ''}
                        onChange={(e) => updateKeyValue(activeTab as 'params' | 'headers', idx, 'description', e.target.value)}
                        placeholder="Description"
                        className="bg-transparent w-full text-gray-500 italic focus:outline-none placeholder-gray-800 text-[11px]"
                      />
                    </td>
                    <td className="p-2 text-right px-4">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => removeKeyValue(activeTab as 'params' | 'headers', idx)}
                          className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Row"
                        >
                          <i className="fa-solid fa-times text-[10px]"></i>
                        </button>
                        {idx === (activeTab === 'params' ? request.params.length : request.headers.length) - 1 && (
                          <button 
                            onClick={() => addKeyValue(activeTab as 'params' | 'headers')}
                            className="text-gray-500 hover:text-orange-500 transition-colors"
                            title="Add Row"
                          >
                            <i className="fa-solid fa-circle-plus text-xs"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 px-2">
              <button 
                onClick={() => addKeyValue(activeTab as 'params' | 'headers')}
                className="text-gray-500 hover:text-gray-200 text-[11px] font-bold uppercase tracking-widest flex items-center transition-colors"
              >
                <i className="fa-solid fa-plus mr-2 text-[10px]"></i> 
                ADD {activeTab === 'params' ? 'PARAMETER' : 'HEADER'}
              </button>
            </div>
          </div>
        )}

        {(activeTab === 'body' || activeTab === 'query' || activeTab === 'variables' || activeTab === 'message') && (
          <div className="h-full flex flex-col">
            {activeTab === 'body' && (
              <div className="flex space-x-4 mb-4 text-xs">
                {['none', 'json', 'form-data'].map(bt => (
                  <label key={bt} className="flex items-center text-gray-400 cursor-pointer capitalize">
                    <input 
                      type="radio" 
                      name="bodyType" 
                      className="mr-2 accent-orange-500" 
                      checked={request.bodyType === bt} 
                      onChange={() => updateField('bodyType', bt as any)}
                    />
                    {bt}
                  </label>
                ))}
              </div>
            )}
            
            {(activeTab !== 'body' || request.bodyType !== 'none') ? (
              <textarea 
                value={request.body}
                onChange={(e) => updateField('body', e.target.value)}
                className="flex-1 bg-[#090909] border border-[#2a2a2a] p-4 font-mono text-[11px] text-gray-300 focus:outline-none focus:border-orange-500/50 rounded resize-none"
                placeholder={
                  activeTab === 'query' ? 'query { ... }' :
                  activeTab === 'variables' ? '{ "var": "val" }' :
                  activeTab === 'message' ? 'Enter WebSocket message...' :
                  '{ "key": "value" }'
                }
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600 italic text-xs">
                This request does not have a body
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestEditor;
