import React from 'react';
import { Visualizations } from '../../types';

interface VisualizationGridProps {
  visualizations: Visualizations;
  filename?: string;
}

export const VisualizationGrid: React.FC<VisualizationGridProps> = ({ visualizations }) => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {panels.map((panel, idx) => (
        <div key={idx} className="mri-panel">
          
          {/* Header */}
          <div className="mri-panel-header">
            <span className="font-semibold text-slate-800">{panel.title}</span>
          </div>

          {/* Image Canvas Container */}
          <div className="mri-image-container">
            <img
              src={panel.src}
              alt={panel.title}
              className="mri-image"
            />
          </div>

          {/* Caption */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500 font-mono">
            <span>{panel.subtitle}</span>
            <span className="text-slate-400">PNG</span>
          </div>

        </div>
      ))}
    </div>
  );
};
