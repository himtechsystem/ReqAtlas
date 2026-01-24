
import React, { useState, useEffect } from 'react';
import { Collection, Environment, RequestRunResult, HttpMethod, Cookie } from '../types';

interface CollectionRunnerProps {
  collection: Collection;
  activeEnvironment: Environment | undefined;
  cookies: Cookie[];
  onClose: () => void;
}

const CollectionRunner: React.FC<CollectionRunnerProps> = ({ collection, activeEnvironment, cookies, onClose }) => {
  const [results, setResults] = useState<RequestRunResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const resolveVariables = (str: string): string => {
    if (!activeEnvironment) return str;
    let result = str;
    activeEnvironment.variables.forEach(v => {
      if (v.enabled && v.key) {
        const regex = new RegExp(`{{${v.key}}}`, 'g');
        result = result.replace(regex, v.value);
      }
    });
    return result;
  };

  const runAll = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    const newResults: RequestRunResult[] = [];

    for (let i = 0; i < collection.requests.length; i++) {
      const request = collection.requests[i];
      const startTime = Date.now();

      try {
        const resolvedUrl = resolveVariables(request.url);
        const headers: Record<string, string> = {};
        request.headers.forEach(h => {
          if (h.enabled && h.key) headers[h.key] = resolveVariables(h.value);
        });

        // Apply Auth Headers
        if (request.auth?.type === 'basic' && request.auth.basic) {
          const u = resolveVariables(request.auth.basic.username);
          const p = resolveVariables(request.auth.basic.password);
          const encoded = btoa(`${u}:${p}`);
          headers['Authorization'] = `Basic ${encoded}`;
        } else if (request.auth?.type === 'bearer' && request.auth.bearer) {
          const token = resolveVariables(request.auth.bearer.token);
          headers['Authorization'] = `Bearer ${token}`;
        } else if (request.auth?.type === 'oauth2' && request.auth.oauth2) {
          const token = resolveVariables(request.auth.oauth2.accessToken);
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Simulate finding matching cookies for the domain
        let domain = '';
        try {
          domain = new URL(resolvedUrl).hostname;
        } catch (e) { }

        const matchingCookies = cookies.filter(c => domain.includes(c.domain));
        const cookieHeader = matchingCookies.map(c => `${c.name}=${c.value}`).join('; ');

        if (cookieHeader) headers['Cookie'] = cookieHeader;

        const resolvedBody = resolveVariables(request.body);

        // Use internal proxy to bypass CORS
        const proxyUrl = 'http://127.0.0.1:3001/proxy';

        const response = await fetch(proxyUrl, {
          method: request.method,
          headers: {
            ...headers,
            'x-target-url': resolvedUrl
          },
          body: request.method !== HttpMethod.GET && request.method !== HttpMethod.HEAD ? resolvedBody : undefined
        });

        const time = Date.now() - startTime;
        const result: RequestRunResult = {
          requestId: request.id,
          name: request.name,
          method: request.method,
          status: response.status,
          statusText: response.statusText,
          time,
          success: response.status >= 200 && response.status < 300
        };
        newResults.push(result);
      } catch (error: any) {
        newResults.push({
          requestId: request.id,
          name: request.name,
          method: request.method,
          status: 0,
          statusText: 'Error',
          time: Date.now() - startTime,
          success: false,
          error: error.message || 'Failed'
        });
      }

      setResults([...newResults]);
      setProgress(((i + 1) / collection.requests.length) * 100);
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status === 0) return 'text-red-500';
    return 'text-yellow-500';
  };

  const summary = {
    total: collection.requests.length,
    passed: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success && r.status !== 0).length,
    errors: results.filter(r => r.status === 0).length,
    avgTime: results.length ? Math.round(results.reduce((acc, r) => acc + r.time, 0) / results.length) : 0
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#090909] flex flex-col animate-in fade-in duration-300">
      <header className="h-16 border-b border-[#2a2a2a] bg-[#111111] flex items-center justify-between px-8">
        <div className="flex items-center space-x-4">
          <i className="fa-solid fa-play text-orange-500"></i>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-gray-200">Runner: {collection.name}</h1>
            <p className="text-[10px] text-gray-500">{collection.requests.length} requests in collection</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={runAll}
            disabled={isRunning}
            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-30 text-white font-bold px-6 py-2 rounded-lg text-xs transition-all flex items-center shadow-lg"
          >
            {isRunning ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : <i className="fa-solid fa-play mr-2"></i>}
            {isRunning ? 'Running...' : 'Run Collection'}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-2"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-[#2a2a2a] w-full">
        <div
          className="h-full bg-orange-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-2">
          {results.length === 0 && !isRunning && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600">
              <i className="fa-solid fa-list-check text-6xl mb-6 opacity-10"></i>
              <p className="font-bold">Ready to batch execute {collection.name}</p>
              <p className="text-xs">Click "Run Collection" to begin testing all endpoints.</p>
            </div>
          )}

          {results.map((res, idx) => (
            <div key={idx} className="bg-[#111111] border border-[#2a2a2a] rounded-lg p-4 flex items-center transition-all animate-in slide-in-from-bottom-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${res.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                <i className={`fa-solid ${res.success ? 'fa-check' : 'fa-times'} text-xs`}></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-[10px] font-black text-gray-500 uppercase">{res.method}</span>
                  <h3 className="text-xs font-bold text-gray-200 truncate">{res.name}</h3>
                </div>
                {res.error && <p className="text-[10px] text-red-400 italic">{res.error}</p>}
              </div>

              <div className="flex items-center space-x-8 text-[11px] font-mono">
                <div className="flex flex-col items-end">
                  <span className="text-gray-600 text-[9px] uppercase">Status</span>
                  <span className={getStatusColor(res.status)}>{res.status || 'ERROR'}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-600 text-[9px] uppercase">Time</span>
                  <span className="text-gray-400">{res.time}ms</span>
                </div>
              </div>
            </div>
          ))}
          {isRunning && results.length < collection.requests.length && (
            <div className="p-4 bg-orange-500/5 border border-dashed border-orange-500/30 rounded-lg flex items-center justify-center text-orange-500/50 italic text-xs">
              <i className="fa-solid fa-spinner fa-spin mr-3"></i>
              Running next request...
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="w-80 border-l border-[#2a2a2a] bg-[#0d0d0d] p-8 flex flex-col">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8">Run Summary</h2>

          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-[#2a2a2a] pb-4">
              <span className="text-gray-500 text-xs">Total Requests</span>
              <span className="text-xl font-bold text-white">{summary.total}</span>
            </div>

            <div className="flex justify-between items-end border-b border-[#2a2a2a] pb-4">
              <span className="text-gray-500 text-xs">Passed</span>
              <span className="text-xl font-bold text-green-500">{summary.passed}</span>
            </div>

            <div className="flex justify-between items-end border-b border-[#2a2a2a] pb-4">
              <span className="text-gray-500 text-xs">Failed / Errors</span>
              <span className="text-xl font-bold text-red-500">{summary.failed + summary.errors}</span>
            </div>

            <div className="flex justify-between items-end border-b border-[#2a2a2a] pb-4">
              <span className="text-gray-500 text-xs">Avg. Response</span>
              <span className="text-xl font-bold text-orange-500">{summary.avgTime}ms</span>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#2a2a2a]">
              <div className="flex items-center text-xs font-bold text-gray-400 mb-2">
                <i className="fa-solid fa-circle-info mr-2 text-orange-500"></i>
                Environment
              </div>
              <div className="text-[10px] text-gray-600 truncate">
                {activeEnvironment ? activeEnvironment.name : 'No Environment Selected'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionRunner;
