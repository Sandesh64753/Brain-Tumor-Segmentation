import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Cpu, Layers, Eye, ShieldCheck, ArrowRight, Activity, CheckCircle2, FileText, Lock } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-navy-950 text-white relative overflow-hidden border-b border-navy-800 min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center justify-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-300 text-xs font-mono font-medium">
                <Brain className="w-3.5 h-3.5 text-blue-400" />
                <span>RESEARCH & DECISION SUPPORT PLATFORM</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-sans">
                AI-Powered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                  Brain MRI Analysis
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Classification, segmentation and explainable AI for research-driven brain MRI analysis powered by deep learning PyTorch architectures.
              </p>

              {/* Feature Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-navy-900 border border-navy-800 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>PyTorch Classifier</span>
                </div>
                <div className="p-3 rounded-lg bg-navy-900 border border-navy-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>U-Net Segmenter</span>
                </div>
                <div className="p-3 rounded-lg bg-navy-900 border border-navy-800 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Grad-CAM Heatmaps</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to={isAuthenticated ? "/app" : "/register"}
                  className="px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 border border-blue-500"
                >
                  Start Analysis <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/models"
                  className="px-6 py-3.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold text-sm transition-all border border-navy-700"
                >
                  Explore Models
                </Link>
              </div>

            </div>

            {/* Right Hero Scientific MRI Visualization Mockup */}
            <div className="lg:col-span-5">
              <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-navy-800 pb-3 font-mono text-xs text-slate-400">
                  <span className="flex items-center gap-2 text-blue-400">
                    <Activity className="w-4 h-4" /> LIVE ANALYSIS CANVAS
                  </span>
                  <span>4-PANEL MULTI-MODAL</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 aspect-square rounded-lg border border-navy-800 flex flex-col items-center justify-center p-3 relative group">
                    <Brain className="w-12 h-12 text-slate-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono text-slate-400">Original Slice</span>
                  </div>
                  <div className="bg-slate-950 aspect-square rounded-lg border border-navy-800 flex flex-col items-center justify-center p-3 relative group">
                    <Eye className="w-12 h-12 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono text-indigo-300">Grad-CAM Heatmap</span>
                  </div>
                  <div className="bg-slate-950 aspect-square rounded-lg border border-navy-800 flex flex-col items-center justify-center p-3 relative group">
                    <Layers className="w-12 h-12 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono text-cyan-300">U-Net Mask</span>
                  </div>
                  <div className="bg-slate-950 aspect-square rounded-lg border border-navy-800 flex flex-col items-center justify-center p-3 relative group">
                    <Activity className="w-12 h-12 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono text-blue-300">Combined Overlay</span>
                  </div>
                </div>

                <div className="p-3 bg-navy-950 rounded-lg border border-navy-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Glioma (98.7% Conf)</span>
                  <span className="text-emerald-400">PyTorch GPU</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Three Pillars of AI Medical Research
            </h2>
            <p className="text-sm text-slate-600">
              Integrating classification, spatial localization, and visual interpretability for research support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Tumor Classification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Identify the most likely tumor category (Glioma, Meningioma, Pituitary, or No Tumor) with model confidence scores and class probability distributions.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-cyan-300 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Precise Segmentation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Precisely localize tumor boundaries, compute total surface area in pixels, and calculate exact spatial slice coverage percentage.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Explainable Grad-CAM</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Understand which anatomical regions exerted dominant influence on model predictions via gradient-weighted class activation mapping.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Research Value Badges */}
      <section className="py-12 bg-slate-100/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            
            <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 text-base">Early Detection Support</span>
              <p className="text-xs text-slate-500">Accelerate research workflows with rapid automated inference.</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 text-base">Better Analytical Decisions</span>
              <p className="text-xs text-slate-500">Combine classification, masks, and heatmaps in one dashboard.</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 text-base">Research Insights</span>
              <p className="text-xs text-slate-500">Export PDF reports and persistent database analysis history.</p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
