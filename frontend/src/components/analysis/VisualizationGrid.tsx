import React, { useState } from 'react';
import { ZoomIn, Maximize2, Download, Eye, Layers } from 'lucide-react';
import { Visualizations } from '../../types';

interface VisualizationGridProps {
  visualizations: Visualizations;
  filename: string;
}

export const VisualizationGrid: React.FC<VisualizationGridProps> = ({ visualizations, filename }) => {
  const [activeModalImg, setActiveModalImg] = useState<{ title: string; src: string } | null>(null);

  const panels = [
    {
      title: "1. Original MRI",
      src: visualizations.original,
      subtitle: "Raw MRI scan slice"
    },
    {
      title: "2. Grad-CAM Heatmap",
      src: visualizations.gradcam,
      subtitle: "Classification attention map"
    },
    {
      title: "3. Segmentation Mask",
      src: visualizations.mask,
      subtitle: "UNet binary lesion mask"
    },
    {
      title: "4. Combined Overlay",
      src: visualizations.overlay,
      subtitle: "Multi-modal visual synthesis"
    }
  ];

  const handleDownload = (src: string, title: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `${filename}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {panels.map((panel, idx) => (
          <div key={idx} className="mri-panel group">
            
            {/* Header */}
            <div className="mri-panel-header">
              <span className="font-semibold text-slate-800">{panel.title}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Zoom"
                  onClick={() => setActiveModalImg({ title: panel.title, src: panel.src })}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Fullscreen"
                  onClick={() => setActiveModalImg({ title: panel.title, src: panel.src })}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Download Image"
                  onClick={() => handleDownload(panel.src, panel.title)}
                  className="p-1 hover:bg-slate-200 rounded text-blue-600 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Image Canvas Container */}
            <div className="mri-image-container group cursor-pointer" onClick={() => setActiveModalImg({ title: panel.title, src: panel.src })}>
              <img
                src={panel.src}
                alt={panel.title}
                className="mri-image group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-navy-900/90 text-white text-xs px-3 py-1.5 rounded-full border border-navy-700 flex items-center gap-1.5 font-medium shadow-lg">
                  <Eye className="w-3.5 h-3.5 text-blue-400" /> Click to Expand
                </span>
              </div>
            </div>

            {/* Caption */}
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500 font-mono">
              <span>{panel.subtitle}</span>
              <span className="text-slate-400">PNG</span>
            </div>

          </div>
        ))}
      </div>

      {/* Fullscreen / Zoom Modal */}
      {activeModalImg && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-xl max-w-4xl w-full p-4 text-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" /> {activeModalImg.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(activeModalImg.src, activeModalImg.title)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalImg(null)}
                  className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded text-xs font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-950 my-3 p-4 rounded-lg border border-navy-800">
              <img
                src={activeModalImg.src}
                alt={activeModalImg.title}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
