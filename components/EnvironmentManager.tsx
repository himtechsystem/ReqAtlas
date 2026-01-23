
import React, { useState } from 'react';
import { Environment, EnvVariable } from '../types';

interface EnvironmentManagerProps {
  environments: Environment[];
  onUpdateEnvironments: (envs: Environment[]) => void;
  onClose: () => void;
}

const EnvironmentManager: React.FC<EnvironmentManagerProps> = ({ environments, onUpdateEnvironments, onClose }) => {
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(environments[0]?.id || null);

  const activeEnv = environments.find(e => e.id === selectedEnvId);

  const addEnvironment = () => {
    const newEnv: Environment = {
      id: `env_${Date.now()}`,
      name: 'New Environment',
      variables: [{ key: '', value: '', enabled: true }]
    };
    onUpdateEnvironments([...environments, newEnv]);
    setSelectedEnvId(newEnv.id);
  };

  const deleteEnvironment = (id: string) => {
    const updated = environments.filter(e => e.id !== id);
    onUpdateEnvironments(updated);
    if (selectedEnvId === id) {
      setSelectedEnvId(updated[0]?.id || null);
    }
  };

  const updateEnvName = (id: string, name: string) => {
    onUpdateEnvironments(environments.map(e => e.id === id ? { ...e, name } : e));
  };

  const updateVariable = (envId: string, index: number, field: keyof EnvVariable, value: any) => {
    const updatedEnvs = environments.map(env => {
      if (env.id !== envId) return env;
      const vars = [...env.variables];
      vars[index] = { ...vars[index], [field]: value };
      
      // Auto-add row
      if (index === vars.length - 1 && (field === 'key' || field === 'value') && value !== '') {
        vars.push({ key: '', value: '', enabled: true });
      }
      
      return { ...env, variables: vars };
    });
    onUpdateEnvironments(updatedEnvs);
  };

  const removeVariable = (envId: string, index: number) => {
    const updatedEnvs = environments.map(env => {
      if (env.id !== envId) return env;
      const vars = env.variables.filter((_, i) => i !== index);
      if (vars.length === 0) vars.push({ key: '', value: '', enabled: true });
      return { ...env, variables: vars };
    });
    onUpdateEnvironments(updatedEnvs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111111] border border-[#2a2a2a] w-full max-w-4xl h-[600px] flex flex-col rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-[#0d0d0d]">
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-widest flex items-center">
            <i className="fa-solid fa-layer-group mr-3 text-orange-500"></i>
            Manage Environments
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-[#2a2a2a] bg-[#0d0d0d] flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {environments.map(env => (
                <div 
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  className={`px-3 py-2 rounded text-xs cursor-pointer flex items-center justify-between group ${
                    selectedEnvId === env.id ? 'bg-orange-500/10 text-orange-500' : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{env.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteEnvironment(env.id); }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={addEnvironment}
              className="m-2 p-2 border border-[#2a2a2a] rounded text-[10px] font-bold text-gray-500 hover:text-white hover:border-orange-500 transition-all uppercase tracking-widest"
            >
              <i className="fa-solid fa-plus mr-2"></i> Create
            </button>
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-[#111111] p-6 overflow-hidden">
            {activeEnv ? (
              <>
                <div className="mb-6">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Environment Name</label>
                  <input 
                    value={activeEnv.name}
                    onChange={(e) => updateEnvName(activeEnv.id, e.target.value)}
                    className="bg-transparent border-b border-[#2a2a2a] focus:border-orange-500 text-gray-200 text-lg font-bold w-full pb-1 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-[#2a2a2a]">
                        <th className="w-10 pb-2"></th>
                        <th className="pb-2 px-2">Variable</th>
                        <th className="pb-2 px-2">Initial Value</th>
                        <th className="w-10 pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeEnv.variables.map((v, idx) => (
                        <tr key={idx} className="border-b border-[#1a1a1a] group">
                          <td className="p-2 text-center">
                            <input 
                              type="checkbox" 
                              checked={v.enabled} 
                              onChange={(e) => updateVariable(activeEnv.id, idx, 'enabled', e.target.checked)}
                              className="accent-orange-500 w-3 h-3"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              value={v.key}
                              onChange={(e) => updateVariable(activeEnv.id, idx, 'key', e.target.value)}
                              placeholder="Variable"
                              className="bg-transparent w-full text-gray-300 focus:outline-none placeholder-gray-700 text-xs font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              value={v.value}
                              onChange={(e) => updateVariable(activeEnv.id, idx, 'value', e.target.value)}
                              placeholder="Value"
                              className="bg-transparent w-full text-gray-300 focus:outline-none placeholder-gray-700 text-xs font-mono"
                            />
                          </td>
                          <td className="p-2 text-right">
                             <button 
                              onClick={() => removeVariable(activeEnv.id, idx)}
                              className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <i className="fa-solid fa-times text-xs"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                <i className="fa-solid fa-layer-group text-4xl mb-4 text-gray-800"></i>
                <p>Select or create an environment to manage variables</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentManager;
