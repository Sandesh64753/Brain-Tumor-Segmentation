import React from 'react';
import { Layers, AlertTriangle, CheckCircle } from 'lucide-react';
import { SegmentationResult } from '../../types';

interface SegmentationCardProps {
  segmentation: SegmentationResult;
}

export const SegmentationCard: React.FC<SegmentationCardProps> = ({ segmentation }) => {
  const { tumor_detected, tumor_pixels, area_percentage, dice_score } = segmentation;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-600" /> Segmentation Result
        </h3>
        <span
          className={`text-[11px] font-mono px-2 py-0.5 rounded border font-medium flex items-center gap-1 ${
            tumor_detected
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {tumor_detected ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
          {tumor_detected ? 'Tumor Region Detected' : 'No Significant Tumor Region'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Tumor Surface Area</p>
          <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">
            {tumor_pixels.toLocaleString()} <span className="text-xs text-slate-500 font-normal">px</span>
          </p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Brain Slice Coverage</p>
          <p className="text-xl font-bold text-blue-600 font-mono mt-0.5">
            {area_percentage.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono text-slate-600">
        <div className="flex justify-between">
          <span>Dice Score Metric:</span>
          <span className="font-bold text-slate-700">{dice_score !== null ? dice_score.toFixed(3) : 'N/A (No Ground Truth)'}</span>
        </div>
        <div className="flex justify-between">
          <span>U-Net Mask Resolution:</span>
          <span className="text-slate-700">Native MRI Spatial Dimensions</span>
        </div>
      </div>
    </div>
  );
};
