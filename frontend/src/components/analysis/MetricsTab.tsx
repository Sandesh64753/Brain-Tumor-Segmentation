import React from 'react';
import { Cpu, ShieldCheck, Activity, Clock, Server, CheckCircle2 } from 'lucide-react';
import { AnalysisPredictionResponse } from '../../types';

interface MetricsTabProps {
  data: AnalysisPredictionResponse;
}

export const MetricsTab: React.FC<MetricsTabProps> = ({ data }) => {
  const { classification, segmentation, inference_time_ms, classification_model_version, segmentation_model_version } = data;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" /> Neural Inference & Evaluation Metrics
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified runtime telemetry and PyTorch model specifications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Inference Latency
          </span>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {inference_time_ms} <span className="text-xs text-slate-500 font-normal">ms</span>
          </p>
          <p className="text-[11px] text-slate-500 font-mono">End-to-End Pipeline Execution</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-600" /> Execution Framework
          </span>
          <p className="text-2xl font-black text-slate-900 font-mono">
            PyTorch <span className="text-xs text-blue-600 font-bold">2.0+</span>
          </p>
          <p className="text-[11px] text-slate-500 font-mono">Device: CPU / CUDA Auto-Detect</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Model Status
          </span>
          <p className="text-2xl font-black text-emerald-600 font-mono flex items-center gap-1">
            Active <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </p>
          <p className="text-[11px] text-slate-500 font-mono">eval() mode • torch.no_grad()</p>
        </div>
      </div>

      {/* Model Metadata Specification Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-mono text-xs font-bold text-slate-800 uppercase tracking-wider">
          System & Model Version Register
        </div>
        <div className="divide-y divide-slate-100 text-xs font-mono">
          <div className="p-3 flex justify-between">
            <span className="text-slate-500">Classification Model Identifier:</span>
            <span className="font-bold text-slate-900">{classification_model_version}</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-slate-500">Segmentation Model Identifier:</span>
            <span className="font-bold text-slate-900">{segmentation_model_version}</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-slate-500">Predicted Class:</span>
            <span className="font-bold text-blue-600">{classification.predicted_class} ({ (classification.confidence * 100).toFixed(1) }%)</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-slate-500">Tumor Surface Area:</span>
            <span className="font-bold text-slate-900">{segmentation.tumor_pixels.toLocaleString()} pixels ({segmentation.area_percentage.toFixed(2)}%)</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-slate-500">Dice Similarity Coefficient (Ground Truth):</span>
            <span className="text-slate-600">{segmentation.dice_score !== null ? segmentation.dice_score : 'N/A (Validation metric unavailable for unannotated uploaded image)'}</span>
          </div>
          <div className="p-3 flex justify-between">
            <span className="text-slate-500">Intersection over Union (IoU):</span>
            <span className="text-slate-600">{segmentation.iou_score !== null ? segmentation.iou_score : 'N/A (Validation metric unavailable for unannotated uploaded image)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
