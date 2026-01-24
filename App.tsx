
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RequestEditor from './components/RequestEditor';
import ResponsePanel from './components/ResponsePanel';
import EnvironmentManager from './components/EnvironmentManager';
import NewRequestModal from './components/NewRequestModal';
import SettingsModal from './components/SettingsModal';
import CollectionRunner from './components/CollectionRunner';
import CookieManager from './components/CookieManager';
import ConsoleOverlay from './components/ConsoleOverlay';
import StartupSplash from './components/StartupSplash';
import { AppState, RequestData, HttpMethod, ApiResponse, Collection, Environment, NavTab, RequestType, ConsoleLog, Cookie } from './types';

const INITIAL_REQUEST: RequestData = {
  id: 'req_1',
  name: 'New Request',
  method: HttpMethod.GET,
  url: '{{baseUrl}}/users/octocat',
  params: [{ key: '', value: '', enabled: true }],
  headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
  auth: { type: 'none' },
  bodyType: 'none',
  body: '',
  timestamp: Date.now(),
  requestType: 'http'
};

const INITIAL_COLLECTION: Collection = {
  id: 'col_1',
  name: 'My APIs',
  requests: [INITIAL_REQUEST],
};

const INITIAL_ENVIRONMENT: Environment = {
  id: 'env_1',
  name: 'Production',
  variables: [
    { key: 'baseUrl', value: 'https://api.github.com', enabled: true }
  ]
};

const App: React.FC = () => {
  const [isStarting, setIsStarting] = useState(true);
  const [state, setState] = useState<AppState>({
    activeRequestId: 'req_1',
    openRequestIds: ['req_1'],
    collections: [INITIAL_COLLECTION],
    responses: {},
    history: [],
    environments: [INITIAL_ENVIRONMENT],
    activeEnvironmentId: 'env_1',
    activeNavTab: 'collections',
    cookies: [],
    logs: []
  });

  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [runningCollectionId, setRunningCollectionId] = useState<string | null>(null);

  const addLog = useCallback((type: ConsoleLog['type'], message: string, details?: any) => {
    const newLog: ConsoleLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      type,
      message,
      details
    };
    setState(prev => ({ ...prev, logs: [newLog, ...prev.logs].slice(0, 100) }));
  }, []);

  const activeRequest = useMemo(() => {
    for (const col of state.collections) {
      const found = col.requests.find(r => r.id === state.activeRequestId);
      if (found) return found;
    }
    const historyFound = state.history.find(r => r.id === state.activeRequestId);
    if (historyFound) return historyFound;

    return state.collections[0]?.requests[0] || INITIAL_REQUEST;
  }, [state.collections, state.history, state.activeRequestId]);

  const activeEnv = useMemo(() =>
    state.environments.find(e => e.id === state.activeEnvironmentId),
    [state.environments, state.activeEnvironmentId]
  );

  const resolveVariables = (str: string): string => {
    if (!activeEnv) return str;
    let result = str;
    activeEnv.variables.forEach(v => {
      if (v.enabled && v.key) {
        const regex = new RegExp(`{{${v.key}}}`, 'g');
        result = result.replace(regex, v.value);
      }
    });
    return result;
  };

  const handleUpdateRequest = (updatedRequest: RequestData) => {
    setState(prev => ({
      ...prev,
      collections: prev.collections.map(col => ({
        ...col,
        requests: col.requests.map(r => r.id === updatedRequest.id ? updatedRequest : r)
      })),
      history: prev.history.map(r => r.id === updatedRequest.id ? updatedRequest : r)
    }));
  };

  const handleSelectRequest = (id: string) => {
    setState(prev => ({
      ...prev,
      activeRequestId: id,
      openRequestIds: prev.openRequestIds.includes(id) ? prev.openRequestIds : [...prev.openRequestIds, id]
    }));
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setState(prev => {
      const newOpenIds = prev.openRequestIds.filter(oid => oid !== id);
      let newActiveId = prev.activeRequestId;
      if (prev.activeRequestId === id) {
        newActiveId = newOpenIds.length > 0 ? newOpenIds[newOpenIds.length - 1] : '';
      }
      return {
        ...prev,
        openRequestIds: newOpenIds,
        activeRequestId: newActiveId
      };
    });
  };

  const handleAddRequest = (type: RequestType = 'http') => {
    const newId = `req_${Date.now()}`;
    const name = type.toUpperCase() + ' Request';
    const newRequest: RequestData = {
      ...INITIAL_REQUEST,
      id: newId,
      name,
      timestamp: Date.now(),
      requestType: type,
      url: INITIAL_REQUEST.url,
      method: type === 'graphql' ? HttpMethod.POST : HttpMethod.GET
    };

    setState(prev => {
      const newCollections = [...prev.collections];
      if (newCollections.length > 0) {
        newCollections[0] = {
          ...newCollections[0],
          requests: [...newCollections[0].requests, newRequest]
        };
      }
      return {
        ...prev,
        collections: newCollections,
        activeRequestId: newId,
        openRequestIds: [...prev.openRequestIds, newId],
        responses: { ...prev.responses, [newId]: null }
      };
    });
    setIsNewReqModalOpen(false);
  };

  const handleAddCollection = () => {
    const newColId = `col_${Date.now()}`;
    const newReqId = `req_${Date.now() + 1}`;
    const newCollection: Collection = {
      id: newColId,
      name: 'New Collection',
      requests: [{ ...INITIAL_REQUEST, id: newReqId, name: 'New Request', timestamp: Date.now() }]
    };
    setState(prev => ({
      ...prev,
      collections: [...prev.collections, newCollection],
      activeRequestId: newReqId,
      openRequestIds: [...prev.openRequestIds, newReqId],
      responses: { ...prev.responses, [newReqId]: null }
    }));
  };

  const handleDeleteRequest = (id: string) => {
    setState(prev => {
      const newCollections = prev.collections.map(col => ({
        ...col,
        requests: col.requests.filter(r => r.id !== id)
      }));
      const newHistory = prev.history.filter(r => r.id !== id);
      const newOpenIds = prev.openRequestIds.filter(oid => oid !== id);

      let newActiveId = prev.activeRequestId;
      if (prev.activeRequestId === id) {
        newActiveId = newOpenIds.length > 0 ? newOpenIds[0] : '';
      }

      return {
        ...prev,
        collections: newCollections,
        history: newHistory,
        openRequestIds: newOpenIds,
        activeRequestId: newActiveId
      };
    });
  };

  const handleUpdateCollectionName = (id: string, newName: string) => {
    setState(prev => ({
      ...prev,
      collections: prev.collections.map(col => col.id === id ? { ...col, name: newName } : col)
    }));
  };

  const handleSendRequest = async (requestOverride?: RequestData) => {
    const startTime = Date.now();
    const requestToSend = requestOverride || activeRequest;
    const resolvedUrl = resolveVariables(requestToSend.url);

    // Simulate finding matching cookies for the domain
    let domain = '';
    try {
      domain = new URL(resolvedUrl).hostname;
    } catch (e) { }

    const matchingCookies = state.cookies.filter(c => domain.includes(c.domain));
    const cookieHeader = matchingCookies.map(c => `${c.name}=${c.value}`).join('; ');

    setState(prev => {
      const alreadyInHistory = prev.history.find(h => h.id === activeRequest.id);
      if (alreadyInHistory) {
        return {
          ...prev,
          history: [activeRequest, ...prev.history.filter(h => h.id !== activeRequest.id)].slice(0, 50)
        };
      }
      return {
        ...prev,
        history: [{ ...activeRequest, timestamp: Date.now() }, ...prev.history].slice(0, 50)
      };
    });

    try {
      const headers: Record<string, string> = {};
      activeRequest.headers.forEach(h => {
        if (h.enabled && h.key) headers[h.key] = resolveVariables(h.value);
      });

      // Apply Auth Headers
      if (activeRequest.auth.type === 'basic' && activeRequest.auth.basic) {
        const u = resolveVariables(activeRequest.auth.basic.username);
        const p = resolveVariables(activeRequest.auth.basic.password);
        const encoded = btoa(`${u}:${p}`);
        headers['Authorization'] = `Basic ${encoded}`;
      } else if (activeRequest.auth.type === 'bearer' && activeRequest.auth.bearer) {
        const token = resolveVariables(activeRequest.auth.bearer.token);
        headers['Authorization'] = `Bearer ${token}`;
      } else if (activeRequest.auth.type === 'oauth2' && activeRequest.auth.oauth2) {
        const token = resolveVariables(activeRequest.auth.oauth2.accessToken);
        headers['Authorization'] = `Bearer ${token}`;
      }

      // If we have simulation cookies, add them to the visual header (browser fetch handles real ones)
      if (cookieHeader) headers['Cookie'] = cookieHeader;

      addLog('request', `Sending ${activeRequest.method} to ${resolvedUrl}`, {
        headers,
        cookies: cookieHeader
      });

      const resolvedBody = resolveVariables(activeRequest.body);

      // Use internal proxy to bypass CORS
      const proxyUrl = 'http://127.0.0.1:3001/proxy';

      const response = await fetch(proxyUrl, {
        method: activeRequest.method,
        headers: {
          ...headers,
          'x-target-url': resolvedUrl
        },
        body: activeRequest.method !== HttpMethod.GET && activeRequest.method !== HttpMethod.HEAD ? resolvedBody : undefined
      });
      const contentType = response.headers.get('content-type') || '';
      const isImage = contentType.includes('image/');
      let data;
      if (isImage) {
        const blob = await response.blob();
        data = URL.createObjectURL(blob);
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      const time = Date.now() - startTime;
      const apiResponse: ApiResponse = {
        status: response.status,
        statusText: response.statusText,
        time,
        size: `${(JSON.stringify(data).length / 1024).toFixed(2)} KB`,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        isImage
      };

      addLog('response', `Received response from ${resolvedUrl}`, {
        status: response.status,
        time,
        headers: apiResponse.headers
      });

      setState(prev => ({
        ...prev,
        responses: { ...prev.responses, [activeRequest.id]: apiResponse }
      }));
    } catch (error: any) {
      const time = Date.now() - startTime;
      addLog('error', `Request failed: ${error.message}`, error);

      const errorResponse: ApiResponse = {
        status: 0,
        statusText: 'Error',
        time,
        size: '0 KB',
        headers: {},
        data: { error: error.message || 'Failed to fetch' }
      };
      setState(prev => ({
        ...prev,
        responses: { ...prev.responses, [activeRequest.id]: errorResponse }
      }));
    }
  };

  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify({
      collections: state.collections,
      environments: state.environments,
      history: state.history,
      cookies: state.cookies
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `reqatlas-config-${Date.now()}.json`);
    linkElement.click();
    setIsSettingsModalOpen(false);
  }, [state.collections, state.environments, state.history, state.cookies]);

  const loadConfig = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target?.result as string);
          setState(prev => ({
            ...prev,
            collections: config.collections || prev.collections,
            environments: config.environments || prev.environments,
            history: config.history || prev.history,
            cookies: config.cookies || prev.cookies || [],
            activeRequestId: config.collections?.[0]?.requests?.[0]?.id || prev.activeRequestId,
            openRequestIds: [config.collections?.[0]?.requests?.[0]?.id || prev.activeRequestId]
          }));
          setIsSettingsModalOpen(false);
          addLog('info', 'Configuration loaded successfully');
        } catch (err) {
          alert('Invalid configuration file.');
          addLog('error', 'Failed to load configuration');
        }
      };
      reader.readAsText(file);
    }
  }, [addLog]);

  const getRequestNameById = (id: string) => {
    for (const col of state.collections) {
      const found = col.requests.find(r => r.id === id);
      if (found) return found;
    }
    return state.history.find(h => h.id === id);
  };

  const switchNavTab = (tab: NavTab) => {
    setState(prev => ({ ...prev, activeNavTab: tab }));
    setIsSidebarVisible(true);
  };

  const getRequestTypeIcon = (type?: RequestType) => {
    switch (type) {
      case 'graphql': return { icon: 'fa-diagram-project', color: 'text-pink-500' };
      case 'websocket': return { icon: 'fa-plug', color: 'text-green-500' };
      default: return { icon: 'fa-bolt', color: 'text-orange-500' };
    }
  };

  const runningCollection = useMemo(() =>
    state.collections.find(c => c.id === runningCollectionId),
    [state.collections, runningCollectionId]
  );

  return (
    <div className="flex h-screen w-full bg-[#090909] font-sans text-sm selection:bg-orange-500 selection:text-white">
      {isStarting && <StartupSplash onComplete={() => setIsStarting(false)} />}

      {/* Navigation Rail */}
      <nav className="w-24 border-r border-[#2a2a2a] bg-[#0d0d0d] flex flex-col items-center py-8 space-y-10 flex-shrink-0 relative">
        <div className="w-12 h-12 rounded bg-orange-600 flex items-center justify-center text-white text-xl shadow-lg mb-4">
          <i className="fa-solid fa-cube"></i>
        </div>

        <button
          onClick={() => switchNavTab('collections')}
          className={`flex flex-col items-center space-y-2 transition-colors w-full group ${state.activeNavTab === 'collections' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <i className="fa-solid fa-layer-group text-xl"></i>
          <span className="text-[9px] font-bold uppercase tracking-tight text-center px-1">Collections</span>
        </button>

        <button
          onClick={() => switchNavTab('history')}
          className={`flex flex-col items-center space-y-2 transition-colors w-full group ${state.activeNavTab === 'history' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <i className="fa-solid fa-clock-rotate-left text-xl"></i>
          <span className="text-[9px] font-bold uppercase tracking-tight text-center px-1">History</span>
        </button>

        <button
          onClick={() => setIsCookieModalOpen(true)}
          className="flex flex-col items-center space-y-2 text-gray-500 hover:text-orange-500 transition-colors w-full group"
        >
          <i className="fa-solid fa-cookie-bite text-xl"></i>
          <span className="text-[9px] font-bold uppercase tracking-tight text-center px-1">Cookies</span>
        </button>

        <div className="flex-1"></div>

        <button
          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
          className={`flex flex-col items-center space-y-2 transition-colors w-full group mb-4 ${isConsoleOpen ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'}`}
        >
          <i className="fa-solid fa-terminal text-xl"></i>
          <span className="text-[9px] font-bold uppercase tracking-tight text-center px-1">Console</span>
        </button>

        <div className="pb-4 flex flex-col items-center">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="text-gray-500 hover:text-orange-500 transition-colors p-2"
            title="Settings & Configuration"
          >
            <i className="fa-solid fa-gear text-xl"></i>
          </button>
        </div>
      </nav>

      {/* Sidebar Area */}
      {isSidebarVisible ? (
        <Sidebar
          collections={state.collections}
          history={state.history}
          activeNavTab={state.activeNavTab}
          activeRequestId={state.activeRequestId}
          onSelectRequest={handleSelectRequest}
          onAddRequest={() => setIsNewReqModalOpen(true)}
          onDeleteRequest={handleDeleteRequest}
          onAddCollection={handleAddCollection}
          onDeleteCollection={(id) => setState(prev => ({ ...prev, collections: prev.collections.filter(c => c.id !== id) }))}
          onUpdateCollectionName={handleUpdateCollectionName}
          onToggleSidebar={() => setIsSidebarVisible(false)}
          onRunCollection={(id) => setRunningCollectionId(id)}
        />
      ) : (
        <div className="w-px bg-[#2a2a2a]"></div>
      )}

      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <header className="h-12 border-b border-[#2a2a2a] flex items-center bg-[#111111] justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center h-full">
            {!isSidebarVisible && (
              <button
                onClick={() => setIsSidebarVisible(true)}
                className="px-4 text-orange-500 hover:text-orange-400 transition-colors h-full border-r border-[#2a2a2a]"
                title="Expand Sidebar"
              >
                <i className="fa-solid fa-bars-staggered"></i>
              </button>
            )}

            {state.openRequestIds.map(oid => {
              const req = getRequestNameById(oid);
              if (!req) return null;
              const { icon, color } = getRequestTypeIcon(req.requestType);
              return (
                <div
                  key={oid}
                  onClick={() => setState(prev => ({ ...prev, activeRequestId: oid }))}
                  className={`px-4 flex items-center border-r border-[#2a2a2a] h-full cursor-pointer transition-colors group relative min-w-[180px] max-w-[260px] ${state.activeRequestId === oid
                    ? 'bg-[#090909] text-orange-500 border-b-2 border-b-orange-500'
                    : 'text-gray-500 hover:bg-white/5'
                    }`}
                >
                  <i className={`fa-solid ${icon} mr-3 text-[12px] ${color}`}></i>
                  <span className="truncate text-[11px] font-bold flex-1">{req.name}</span>
                  <button
                    onClick={(e) => handleCloseTab(e, oid)}
                    className={`ml-2 transition-opacity p-1 hover:text-white ${state.activeRequestId === oid ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <i className="fa-solid fa-xmark text-[11px]"></i>
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => setIsNewReqModalOpen(true)}
              className="px-5 h-full hover:bg-white/5 text-gray-400 hover:text-orange-500 transition-all flex items-center justify-center flex-shrink-0"
              title="New Request"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>

          <div className="flex items-center px-4 space-x-3 flex-shrink-0">
            <div className="flex items-center bg-[#090909] border border-[#2a2a2a] rounded overflow-hidden">
              <select
                value={state.activeEnvironmentId || ''}
                onChange={(e) => setState(prev => ({ ...prev, activeEnvironmentId: e.target.value || null }))}
                className="bg-transparent text-[11px] text-gray-400 px-3 py-1.5 focus:outline-none cursor-pointer hover:text-white transition-colors min-w-[140px]"
              >
                <option value="">No Environment</option>
                {state.environments.map(env => (
                  <option key={env.id} value={env.id}>{env.name}</option>
                ))}
              </select>
              <button
                onClick={() => setIsEnvModalOpen(true)}
                className="px-3 py-1.5 border-l border-[#2a2a2a] text-gray-500 hover:text-orange-500 transition-colors"
                title="Manage Environments"
              >
                <i className="fa-solid fa-gear text-[10px]"></i>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {state.activeRequestId ? (
            <>
              <RequestEditor
                request={activeRequest}
                onUpdate={handleUpdateRequest}
                onSend={handleSendRequest}
              />
              <ResponsePanel response={state.responses[state.activeRequestId]} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-4">
              <i className="fa-solid fa-rocket text-6xl opacity-20"></i>
              <p className="text-sm font-medium">Select a request or create a new one to start testing APIs</p>
              <button
                onClick={() => setIsNewReqModalOpen(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded font-bold transition-all shadow-lg"
              >
                Create New Request
              </button>
            </div>
          )}

          {/* Collection Runner Modal/Overlay */}
          {runningCollection && (
            <CollectionRunner
              collection={runningCollection}
              activeEnvironment={activeEnv}
              cookies={state.cookies}
              onClose={() => setRunningCollectionId(null)}
            />
          )}

          {/* Console Overlay Component */}
          <ConsoleOverlay
            isOpen={isConsoleOpen}
            logs={state.logs}
            onClose={() => setIsConsoleOpen(false)}
            onClear={() => setState(prev => ({ ...prev, logs: [] }))}
          />
        </div>
      </main>

      {isEnvModalOpen && (
        <EnvironmentManager
          environments={state.environments}
          onUpdateEnvironments={(envs) => setState(prev => ({ ...prev, environments: envs }))}
          onClose={() => setIsEnvModalOpen(false)}
        />
      )}

      {isNewReqModalOpen && (
        <NewRequestModal
          onSelect={handleAddRequest}
          onClose={() => setIsNewReqModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          onExport={exportConfig}
          onLoad={loadConfig}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {isCookieModalOpen && (
        <CookieManager
          cookies={state.cookies}
          onUpdateCookies={(cookies) => setState(prev => ({ ...prev, cookies }))}
          onClose={() => setIsCookieModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
