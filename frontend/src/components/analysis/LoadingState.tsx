import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Loader2 } from 'lucide-react';

export const LoadingState: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Image preprocessing & normalization",
    "Running PyTorch tumor classification model",
    "Executing U-Net tumor region segmentation",
    "Generating Grad-CAM explainability heatmap",
    "Preparing publication report & overlays"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-lg mx-auto shadow-sm my-6">
      <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 border border-blue-100 mx-auto flex items-center justify-center mb-4">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 font-sans">
        Analyzing Brain MRI Scan...
      </h3>
      <p className="text-xs text-slate-500 mt-1 mb-6">
        Executing PyTorch neural inference pipeline on GPU/CPU
      </p>

      <div className="space-y-3 text-left bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-xs">
        {steps.map((stepLabel, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div key={idx} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span
                className={`truncate ${
                  isDone
                    ? 'text-slate-700 font-medium line-through opacity-75'
                    : isCurrent
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {stepLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
