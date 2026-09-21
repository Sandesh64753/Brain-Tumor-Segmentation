import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileCode2,
  X,
  Play,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  HelpCircle,
  Flame,
  Info
} from 'lucide-react';
import { analysisApi } from '../../services/api';
import { MriValidationResult } from '../../types';

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
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<MriValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run gatekeeper validation whenever a new file is selected
  useEffect(() => {
    let isMounted = true;

    if (!selectedFile) {
      setValidationResult(null);
      setIsValidating(false);
      setPreviewUrl(null);
      return;
    }

    // Set preview url
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    if (ext !== 'dcm' && ext !== 'dicom') {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    // Perform validation with Gatekeeper API
    async function performValidation() {
      setIsValidating(true);
      setErrorMsg(null);
      try {
        const res = await analysisApi.validateMri(selectedFile!);
        if (isMounted) {
          setValidationResult(res);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Gatekeeper validation check failed.');
          setValidationResult({
            is_mri: false,
            stage: 'exception',
            reason: err.message || 'Validation request failed',
            message: 'Unable to verify MRI scan.'
          });
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    }

    performValidation();

    return () => {
      isMounted = false;
    };
  }, [selectedFile]);

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

  const isMriValid = validationResult?.is_mri === true;
  const isMriRejected = validationResult !== null && validationResult.is_mri === false;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header & Sample Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" /> Upload MRI Image
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a brain MRI slice in DICOM (.dcm), PNG, or JPG format (Max 10 MB)
          </p>
        </div>

        {/* Sample Images Launcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline mr-1">Try Sample:</span>
          <button
            type="button"
            onClick={() => onLoadSample('glioma')}
            className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-colors font-medium"
          >
            Glioma
          </button>
          <button
            type="button"
            onClick={() => onLoadSample('meningioma')}
            className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-colors font-medium"
          >
            Meningioma
          </button>
          <button
            type="button"
            onClick={() => onLoadSample('notumor')}
            className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition-colors font-medium"
          >
            No Tumor
          </button>
          <button
            type="button"
            onClick={() => onLoadSample('invalid')}
            title="Test the MRI Gatekeeper rejecting a non-MRI image"
            className="px-2.5 py-1 text-xs rounded bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-600 border border-red-200 transition-colors font-medium flex items-center gap-1"
          >
            <ShieldAlert className="w-3 h-3" /> Non-MRI (Test)
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
            <span>•</span>
            <span className="text-blue-600 font-medium">Gatekeeper Auto-Protected</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File summary & Gatekeeper status box */}
          <div className={`rounded-xl border p-4 transition-all ${
            isMriRejected
              ? 'bg-red-50/60 border-red-200 ring-1 ring-red-300/50'
              : isMriValid
              ? 'bg-emerald-50/40 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              
              {/* Left Side: Thumbnail & File Metadata */}
              <div className="flex items-center gap-4 w-full lg:w-auto">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="MRI Preview"
                    className={`w-20 h-20 object-cover rounded-lg border shadow-sm ${
                      isMriRejected
                        ? 'border-red-300 grayscale opacity-80'
                        : 'border-slate-300 bg-slate-900'
                    }`}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-navy-900 text-blue-400 flex flex-col items-center justify-center font-mono text-xs border border-navy-800">
                    <FileCode2 className="w-7 h-7 mb-1" />
                    <span>DICOM</span>
                  </div>
                )}

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 max-w-[200px] sm:max-w-[280px] truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </span>

                    {/* Gatekeeper Validation Badge */}
                    {isValidating && (
                      <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                        Validating MRI...
                      </span>
                    )}

                    {!isValidating && isMriValid && (
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified MRI Scan
                      </span>
                    )}

                    {!isValidating && isMriRejected && (
                      <span className="text-[11px] bg-red-100 text-red-800 border border-red-300 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        Un-validated (Non-MRI)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                    <span>Size: {formatFileSize(selectedFile.size)}</span>
                    <span>•</span>
                    <span>Type: {selectedFile.type || selectedFile.name.split('.').pop()?.toUpperCase()}</span>
                    {validationResult?.recon_error !== undefined && validationResult?.recon_error !== null && (
                      <>
                        <span>•</span>
                        <span className="text-slate-600" title={`Reconstruction MSE: ${validationResult.recon_error} (Threshold: ${validationResult.threshold})`}>
                          MSE: {validationResult.recon_error.toFixed(5)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Side: Actions Buttons */}
              <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClearFile();
                    setPreviewUrl(null);
                    setValidationResult(null);
                  }}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Remove
                </button>

                <div className="relative group">
                  <button
                    type="button"
                    onClick={onRunAnalysis}
                    disabled={isLoading || isValidating || !isMriValid}
                    className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-sm transition-all flex items-center gap-2 border ${
                      isMriValid && !isLoading && !isValidating
                        ? 'bg-blue-600 hover:bg-blue-500 border-blue-500 hover:shadow-md cursor-pointer'
                        : 'bg-slate-400 border-slate-300 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking Scan...
                      </>
                    ) : isMriValid ? (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        Run AI Analysis
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-white/90" />
                        Analysis Blocked
                      </>
                    )}
                  </button>

                  {/* Tooltip explaining disabled state */}
                  {isMriRejected && (
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-20 w-64 p-2 bg-slate-900 text-white text-[11px] rounded shadow-lg">
                      Tumor detection is disabled because the uploaded image is un-validated and did not pass MRI gatekeeper verification.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Rejection Alert Box */}
            {!isValidating && isMriRejected && (
              <div className="mt-3.5 pt-3.5 border-t border-red-200/80 text-xs flex items-start gap-2.5 text-red-800">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-red-900 flex items-center gap-1.5">
                    Scan Verification Failed: Un-validated Image
                  </div>
                  <p className="text-red-700 leading-relaxed">
                    {validationResult?.reason || 'The uploaded file does not match Brain MRI anatomical distribution.'}
                  </p>
                  <p className="text-[11px] text-red-600 font-medium">
                    ⚠️ To ensure clinical diagnostic safety, tumor detection and segmentation are only permitted on valid Brain MRI scans. Please upload a genuine Brain MRI image or select one of the samples above.
                  </p>
                </div>
              </div>
            )}

            {/* Validation Success Badge details */}
            {!isValidating && isMriValid && (
              <div className="mt-3 pt-3 border-t border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Passed Gatekeeper verification (Stage: {validationResult?.stage})
                </span>
                {validationResult?.recon_error !== undefined && validationResult?.threshold !== undefined && (
                  <span className="font-mono text-emerald-700">
                    Recon Error: {validationResult.recon_error?.toFixed(5)} ≤ Threshold: {validationResult.threshold?.toFixed(5)}
                  </span>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
