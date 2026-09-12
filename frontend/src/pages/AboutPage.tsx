import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Brain, Cpu, ShieldCheck, Layers, Eye, Database, Code, Activity } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Main Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-medium">
            <Brain className="w-3.5 h-3.5" /> MEDICAL AI RESEARCH PLATFORM
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-sans">
            What is NeuroScan AI?
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            NeuroScan AI is a scientific AI platform designed to accelerate research exploration in brain MRI classification, spatial UNet tumor segmentation, and Grad-CAM explainability.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-navy-950 text-white rounded-2xl p-8 border border-navy-800 shadow-xl space-y-4 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">
            OUR RESEARCH MISSION
          </span>
          <blockquote className="text-xl sm:text-2xl font-bold text-slate-100 font-sans max-w-3xl mx-auto leading-relaxed">
            "Making advanced medical AI research easier to understand, explore, and evaluate through interpretable neural models."
          </blockquote>
        </div>

        {/* Core Capabilities */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight border-b pb-2">
            Core Capabilities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Brain className="w-5 h-5" /> 4-Class Brain Tumor Classification
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Categorizes input MRI slices into Glioma, Meningioma, Pituitary, or No Tumor with confidence percentages derived via PyTorch model output.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-cyan-600 font-bold">
                <Layers className="w-5 h-5" /> Spatial U-Net Tumor Segmentation
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates binary lesion masks, computes total tumor surface pixels, and determines spatial slice area coverage.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <Eye className="w-5 h-5" /> Grad-CAM Visual Explainability
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates gradient-weighted class activation maps on target convolutional feature layers to visualize model attention regions.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <Database className="w-5 h-5" /> History & PDF Report Generation
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Persists analysis telemetry in PostgreSQL / SQLite databases and generates publication-grade downloadable PDF reports.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight border-b pb-2">
            Technology Stack
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-center">
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
              <Cpu className="w-6 h-6 text-blue-600 mx-auto" />
              <span className="font-bold text-slate-900 block">PyTorch</span>
              <span className="text-[11px] text-slate-500">Deep Learning</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
              <Code className="w-6 h-6 text-emerald-600 mx-auto" />
              <span className="font-bold text-slate-900 block">FastAPI</span>
              <span className="text-[11px] text-slate-500">Python Backend</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
              <Activity className="w-6 h-6 text-cyan-600 mx-auto" />
              <span className="font-bold text-slate-900 block">React & Vite</span>
              <span className="text-[11px] text-slate-500">Frontend UI</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
              <Database className="w-6 h-6 text-indigo-600 mx-auto" />
              <span className="font-bold text-slate-900 block">PostgreSQL</span>
              <span className="text-[11px] text-slate-500">Relational DB</span>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};
