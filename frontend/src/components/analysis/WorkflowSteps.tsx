import React from 'react';
import { Upload, Cpu, BarChart3, CheckCircle2 } from 'lucide-react';

interface WorkflowStepsProps {
  currentStep: 1 | 2 | 3;
}

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ currentStep }) => {
  const steps = [
    {
      id: 1,
      number: '01',
      title: 'Upload MRI',
      subtitle: 'Upload a brain MRI scan (JPG, PNG, DICOM)',
      icon: Upload
    },
    {
      id: 2,
      number: '02',
      title: 'AI Analysis',
      subtitle: 'PyTorch Classification + UNet Segmentation',
      icon: Cpu
    },
    {
      id: 3,
      number: '03',
      title: 'View Results',
      subtitle: 'Grad-CAM Explainability & PDF Report',
      icon: BarChart3
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {steps.map((step) => {
        const isCurrent = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const StepIcon = step.icon;

        return (
          <div
            key={step.id}
            className={`p-4 rounded-xl border transition-all flex items-center gap-4 ${
              isCurrent
                ? 'bg-blue-900/10 border-blue-600/50 shadow-sm ring-1 ring-blue-500/20'
                : isCompleted
                ? 'bg-slate-50 border-emerald-200 text-slate-700'
                : 'bg-white border-slate-200 text-slate-400 opacity-70'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                isCurrent
                  ? 'bg-blue-600 text-white shadow'
                  : isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : step.number}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <StepIcon className={`w-4 h-4 ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                <h3 className={`font-semibold text-sm ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
                  {step.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{step.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
