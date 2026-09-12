import React from 'react';
import { Eye, Info } from 'lucide-react';

interface GradCAMCardProps {
  showOverlay: boolean;
  onToggleOverlay: (show: boolean) => void;
}

export const GradCAMCard: React.FC<GradCAMCardProps> = ({ showOverlay, onToggleOverlay }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-600" /> AI Explanation (Grad-CAM)
        </h3>

        {/* Toggle Switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs text-slate-600 font-medium">Show Heatmap</span>
          <input
            type="checkbox"
            checked={showOverlay}
            onChange={(e) => onToggleOverlay(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"></div>
        </label>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        The Grad-CAM heatmap highlights anatomical image regions that exerted the highest visual influence on the classification model's feature extraction layer.
      </p>

      {/* Heatmap Attention Legend */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] font-mono text-slate-500 font-medium">
          <span>Low Attention</span>
          <span>Medium</span>
          <span>High Attention</span>
        </div>
        <div className="h-2.5 rounded-full w-full bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600 border border-slate-200" />
      </div>

      <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
        <span>Grad-CAM indicates feature saliency map density, not absolute pathological boundaries.</span>
      </div>
    </div>
  );
};
