import React, { useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { WorkflowSteps } from '../components/analysis/WorkflowSteps';
import { UploadZone } from '../components/analysis/UploadZone';
import { LoadingState } from '../components/analysis/LoadingState';
import { VisualizationGrid } from '../components/analysis/VisualizationGrid';
import { ClassificationCard } from '../components/analysis/ClassificationCard';
import { SegmentationCard } from '../components/analysis/SegmentationCard';
import { GradCAMCard } from '../components/analysis/GradCAMCard';
import { InteractiveVisualizer } from '../components/analysis/InteractiveVisualizer';
import { MetricsTab } from '../components/analysis/MetricsTab';
import { analysisApi, reportsApi } from '../services/api';
import { AnalysisPredictionResponse } from '../types';
import { Download, FileText, RefreshCw, AlertCircle, Eye, Layers, BarChart2, Shield, Loader2 } from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisPredictionResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'visualization' | 'metrics' | 'report'>('results');
  const [showGradcamOverlay, setShowGradcamOverlay] = useState(true);

  const handleDownloadReport = async () => {
    if (!analysisResult) return;
    setIsDownloading(true);
    try {
      await reportsApi.downloadReport(analysisResult.analysis_id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to download report PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper to generate sample MRI files locally for demonstration
  const handleLoadSample = (sampleType: string) => {
    setErrorMsg(null);
    setAnalysisResult(null);

    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw brain slice background
      ctx.fillStyle = '#050B14';
      ctx.fillRect(0, 0, 224, 224);

      // Draw brain contour
      ctx.fillStyle = '#26334D';
      ctx.beginPath();
      ctx.ellipse(112, 112, 85, 95, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brain tissue texture
      ctx.fillStyle = '#405275';
      ctx.beginPath();
      ctx.ellipse(112, 112, 70, 80, 0, 0, Math.PI * 2);
      ctx.fill();

      if (sampleType === 'glioma') {
        ctx.fillStyle = '#D9E2EC';
        ctx.beginPath();
        ctx.arc(85, 80, 28, 0, Math.PI * 2);
        ctx.fill();
      } else if (sampleType === 'meningioma') {
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.arc(140, 130, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const sampleFile = new File([blob], `sample_${sampleType}_mri.png`, { type: 'image/png' });
          setSelectedFile(sampleFile);
        }
      }, 'image/png');
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) return;

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await analysisApi.predictMri(selectedFile);
      setAnalysisResult(result);
      setActiveTab('results');
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed. Please check the backend model service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  const currentStep = analysisResult ? 3 : isLoading ? 2 : 1;

  return (
    <div className="min-h-screen flex flex-row bg-slate-50 text-slate-900">
      {/* Dark Clinical Sidebar Navigation (Fixed width w-64) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area Container (Spans right side of screen) */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Navbar />

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Header Title Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans">
                Brain MRI Analysis
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Classification, Segmentation and Explainability for Better Research Decisions
              </p>
            </div>

            {analysisResult && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Analyze Another Image
              </button>
            )}
          </div>

          {/* 3-Step Workflow Bar */}
          <WorkflowSteps currentStep={currentStep} />

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Execution Error:</span> {errorMsg}
              </div>
            </div>
          )}

          {/* MRI Upload Component */}
          {!analysisResult && !isLoading && (
            <UploadZone
              selectedFile={selectedFile}
              onFileSelect={(file) => setSelectedFile(file)}
              onClearFile={() => setSelectedFile(null)}
              onRunAnalysis={handleRunAnalysis}
              isLoading={isLoading}
              onLoadSample={handleLoadSample}
            />
          )}

          {/* Live Progress Loading State */}
          {isLoading && <LoadingState />}

          {/* Results Workspace Dashboard */}
          {analysisResult && !isLoading && (
            <div className="space-y-6">
              
              {/* Workspace Navigation Tabs */}
              <div className="flex items-center space-x-1 border-b border-slate-200 font-medium text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('results')}
                  className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'results'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" /> Results Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('visualization')}
                  className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'visualization'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-4 h-4" /> Interactive Workspace
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('metrics')}
                  className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'metrics'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" /> Model Telemetry
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('report')}
                  className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'report'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" /> PDF Report
                </button>
              </div>

              {/* TAB 1: RESULTS DASHBOARD */}
              {activeTab === 'results' && (
                <div className="space-y-6">
                  
                  {/* 4 Equal Panel Visualizations */}
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Multi-Modal Image Panels
                    </h3>
                    <VisualizationGrid
                      visualizations={analysisResult.visualizations}
                      filename={analysisResult.filename}
                    />
                  </div>

                  {/* Summary Cards Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ClassificationCard classification={analysisResult.classification} />
                    <SegmentationCard segmentation={analysisResult.segmentation} />
                    <GradCAMCard
                      showOverlay={showGradcamOverlay}
                      onToggleOverlay={setShowGradcamOverlay}
                    />
                  </div>

                </div>
              )}

              {/* TAB 2: INTERACTIVE VISUALIZER */}
              {activeTab === 'visualization' && (
                <InteractiveVisualizer
                  visualizations={analysisResult.visualizations}
                  filename={analysisResult.filename}
                />
              )}

              {/* TAB 3: METRICS */}
              {activeTab === 'metrics' && (
                <MetricsTab data={analysisResult} />
              )}

              {/* TAB 4: REPORT PREVIEW & DOWNLOAD */}
              {activeTab === 'report' && (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-6 shadow-sm max-w-2xl mx-auto">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 border border-blue-100 mx-auto flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      Publication-Grade PDF Report Ready
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Report ID: {analysisResult.analysis_id} • Generated in {analysisResult.inference_time_ms} ms
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-mono text-left space-y-1 text-slate-700">
                    <p>• Document includes patient analysis metadata & date timestamp</p>
                    <p>• Classification result ({analysisResult.classification.predicted_class}) & probability table</p>
                    <p>• Segmentation surface area metrics & 4-panel image previews</p>
                    <p>• Verified PyTorch model identifiers & medical research disclaimers</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm shadow-md transition-colors border border-blue-500 cursor-pointer"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Download Report PDF
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          )}

        </main>

        <Footer />
      </div>
    </div>
  );
};
