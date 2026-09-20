import React, { useState } from 'react';
import { Eye, Layers, ZoomIn, ZoomOut, RotateCcw, Sliders } from 'lucide-react';
import { Visualizations } from '../../types';

interface InteractiveVisualizerProps {
  visualizations: Visualizations;
  filename: string;
}

export const InteractiveVisualizer: React.FC<InteractiveVisualizerProps> = ({ visualizations }) => {
  const [showMask, setShowMask] = useState(true);
  const [showGradcam, setShowGradcam] = useState(true);
  const [opacity, setOpacity] = useState(70); // 0 to 100
  const [zoomLevel, setZoomLevel] = useState(100); // 50 to 200

  const currentDisplaySrc = () => {
    if (showMask && showGradcam) return visualizations.overlay;
    if (showGradcam) return visualizations.gradcam;
    if (showMask) return visualizations.mask;
    return visualizations.original;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" /> Interactive Visualization Workspace
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Adjust opacity, toggle layers, pan & zoom for detailed anatomical research inspection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-1 space-y-5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <p className="font-bold text-slate-800 uppercase tracking-wider font-mono text-[11px] border-b border-slate-200 pb-2">
            Layer Controls
          </p>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="font-medium text-slate-700 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-cyan-600" /> Segmentation Mask
              </span>
              <input
                type="checkbox"
                checked={showMask}
                onChange={(e) => setShowMask(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="font-medium text-slate-700 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-indigo-600" /> Grad-CAM Heatmap
              </span>
              <input
                type="checkbox"
                checked={showGradcam}
                onChange={(e) => setShowGradcam(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </label>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex justify-between font-mono text-slate-600">
              <span>Overlay Opacity:</span>
              <span className="font-bold text-slate-900">{opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <p className="font-mono text-slate-600 font-medium">Zoom Controls ({zoomLevel}%):</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700 transition-colors flex justify-center items-center gap-1"
              >
                <ZoomOut className="w-3.5 h-3.5" /> Out
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
                className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700 transition-colors flex justify-center items-center gap-1"
              >
                <ZoomIn className="w-3.5 h-3.5" /> In
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                title="Reset Zoom"
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Canvas Display */}
        <div className="lg:col-span-3 bg-navy-950 rounded-xl border border-navy-800 p-4 flex items-center justify-center min-h-[400px] overflow-hidden relative">
          <div
            className="transition-transform duration-200 flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <img
              src={currentDisplaySrc()}
              alt="Interactive Visualization"
              className="max-h-[500px] object-contain rounded border border-navy-800 shadow-2xl"
              style={{ opacity: opacity / 100 }}
            />
          </div>

          <div className="absolute bottom-3 right-3 bg-navy-900/90 text-slate-300 text-[11px] font-mono px-3 py-1.5 rounded-lg border border-navy-700 shadow flex items-center gap-3">
            <span>Layers: {showMask ? 'Mask ' : ''}{showGradcam ? 'GradCAM' : ''}</span>
            <span>•</span>
            <span>Zoom: {zoomLevel}%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
