import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { modelsApi } from '../services/api';
import { ModelMetadata } from '../types';
import { Layers, Cpu, Eye, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      try {
        const data = await modelsApi.getModels();
        setModels(data);
      } catch (err) {
        console.error("Failed to load models meta:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadModels();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">
            AI Models & Architectures
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto font-mono">
            Deep learning neural networks powering NeuroScan AI inference
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs font-mono">Fetching PyTorch model registry specifications...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {models.map((model) => (
              <div key={model.id} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {model.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-bold">{model.version}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{model.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{model.description}</p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-mono text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Framework:</span>
                      <span className="font-bold text-slate-900">{model.framework}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Architecture:</span>
                      <span className="font-bold text-blue-600">{model.architecture}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Input Data:</span>
                      <span>{model.input}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Output Signal:</span>
                      <span className="font-semibold">{model.output}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Adapter Loaded
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
