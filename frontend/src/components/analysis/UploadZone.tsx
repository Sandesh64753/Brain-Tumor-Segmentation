import React, { useState, useRef } from 'react';
import { UploadCloud, FileCode2, Image as ImageIcon, X, Play, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onRunAnalysis: () => void;
  selectedFile: File | null;
  onClearFile: () => void;
  isLoading: boolean;
  onLoadSample: (sampleType: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  onRunAnalysis,
  selectedFile,
  onClearFile,
  isLoading,
  onLoadSample
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['jpg', 'jpeg', 'png', 'dcm', 'dicom'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(ext)) {
      setErrorMsg(`Unsupported file type (.${ext}). Supported formats: JPG, JPEG, PNG, DICOM (.dcm).`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds maximum allowed limit of 10 MB.');
      return;
    }

    onFileSelect(file);

    if (ext === 'dcm' || ext === 'dicom') {
      setPreviewUrl(null); // DICOM preview handled on server
    } else {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" /> Upload MRI Image
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a brain MRI slice in DICOM (.dcm), PNG, or JPG format (Max 10 MB)
          </p>
        </div>

        {/* Sample Images Launcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Try Sample:</span>
          <button
            type="button"
            onClick={() => onLoadSample('glioma')}
            className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-colors font-medium"
          >
            Glioma Sample
          </button>
          <button
            type="button"
            onClick={() => onLoadSample('meningioma')}
            className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-colors font-medium"
          >
            Meningioma Sample
          </button>
          <button
            type="button"
            onClick={() => onLoadSample('notumor')}
            className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-colors font-medium"
          >
            No Tumor Sample
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag and Drop Zone */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50 scale-[1.005]'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png,.dcm,.dicom"
            className="hidden"
          />
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3 border border-blue-100">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Drag & drop your MRI image here
          </p>
          <p className="text-xs text-slate-500 mt-1">
            or <span className="text-blue-600 font-medium underline">click to browse</span> from computer
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-slate-400 font-mono">
            <span>Formats: JPG, PNG, DICOM</span>
            <span>•</span>
            <span>Max Size: 10 MB</span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="MRI Preview"
                className="w-20 h-20 object-cover rounded-lg border border-slate-300 bg-slate-900 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-navy-900 text-blue-400 flex flex-col items-center justify-center font-mono text-xs border border-navy-800">
                <FileCode2 className="w-7 h-7 mb-1" />
                <span>DICOM</span>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 max-w-[220px] truncate">
                  {selectedFile.name}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Validated
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Size: {formatFileSize(selectedFile.size)} • Type: {selectedFile.type || selectedFile.name.split('.').pop()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                onClearFile();
                setPreviewUrl(null);
              }}
              disabled={isLoading}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Remove
            </button>

            <button
              type="button"
              onClick={onRunAnalysis}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all flex items-center gap-2 border border-blue-500 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              {isLoading ? 'Processing...' : 'Run AI Analysis'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
