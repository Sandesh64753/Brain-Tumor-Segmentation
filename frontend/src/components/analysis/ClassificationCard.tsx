import React from 'react';
import { Brain, ShieldCheck, Activity } from 'lucide-react';
import { ClassificationResult } from '../../types';

interface ClassificationCardProps {
  classification: ClassificationResult;
}

export const ClassificationCard: React.FC<ClassificationCardProps> = ({ classification }) => {
  const { predicted_class, confidence, probabilities } = classification;

  const confPercent = (confidence * 100).toFixed(1);

  // Confidence level label
  const getConfidenceBadge = (val: number) => {
    if (val >= 0.85) {
      return { label: 'High Confidence', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (val >= 0.60) {
      return { label: 'Moderate Confidence', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Low Confidence', bg: 'bg-red-50 text-red-700 border-red-200' };
  };

  const badge = getConfidenceBadge(confidence);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-600" /> Classification Result
        </h3>
        <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${badge.bg} font-medium`}>
          {badge.label}
        </span>
      </div>

      {/* Main Prediction Display */}
      <div className="flex items-baseline justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Top Category</p>
          <p className="text-2xl font-black text-blue-600 tracking-tight mt-0.5">
            {predicted_class}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Model Confidence</p>
          <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">
            {confPercent}%
          </p>
        </div>
      </div>

      {/* Probability Bars */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
          Class Probability Breakdown
        </p>

        <div className="space-y-2.5">
          {Object.entries(probabilities).map(([className, probVal]) => {
            const pct = (probVal * 100).toFixed(1);
            const isTop = className === predicted_class;

            return (
              <div key={className} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className={isTop ? 'text-slate-900 font-bold' : 'text-slate-600'}>
                    {className}
                  </span>
                  <span className="font-mono text-slate-700">{pct}%</span>
                </div>
                
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isTop ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
