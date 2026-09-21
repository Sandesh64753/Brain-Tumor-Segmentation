import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { analysisApi, reportsApi } from '../services/api';
import { AnalysisListItem, AnalysisPredictionResponse } from '../types';
import { Search, Filter, Trash2, Download, Eye, Calendar, Layers, Brain, Loader2, AlertCircle, FileText } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AnalysisListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisPredictionResponse | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await analysisApi.getHistory(search, classFilter);
      setHistory(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load analysis history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      await reportsApi.downloadReport(id);
    } catch (err: any) {
      alert("Failed to download PDF report: " + err.message);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [classFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this analysis record?")) return;
    try {
      await analysisApi.deleteAnalysis(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (selectedAnalysis?.analysis_id === id) {
        setSelectedAnalysis(null);
      }
    } catch (err: any) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const detail = await analysisApi.getAnalysisById(id);
      setSelectedAnalysis(detail);
    } catch (err: any) {
      alert("Error loading analysis detail: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 w-full">
      {/* Full-width Top Navigation */}
      <Navbar />

      <div className="flex-1 flex flex-row w-full min-h-0">
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans">
                Analysis History
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Persistent database records of past brain MRI neural scans
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by filename or ID..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-700 focus:bg-white focus:outline-none"
              >
                <option value="all">All Classifications</option>
                <option value="Glioma">Glioma</option>
                <option value="Meningioma">Meningioma</option>
                <option value="Pituitary">Pituitary</option>
                <option value="No Tumor">No Tumor</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-16 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-xs font-mono">Loading analysis records from database...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Brain className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No analyses found</h3>
              <p className="text-xs text-slate-500">Upload your first MRI image to populate history records.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Filename</th>
                      <th className="p-3.5">Classification</th>
                      <th className="p-3.5">Confidence</th>
                      <th className="p-3.5">Tumor Surface</th>
                      <th className="p-3.5">Date Created</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-sans font-bold text-slate-900 max-w-[200px] truncate">
                          {item.filename}
                        </td>
                        <td className="p-3.5 font-bold text-blue-600">
                          {item.classification}
                        </td>
                        <td className="p-3.5">
                          {(item.classification_confidence * 100).toFixed(1)}%
                        </td>
                        <td className="p-3.5">
                          {item.tumor_detected ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                              Detected ({item.tumor_area_percentage.toFixed(1)}%)
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                              Clear (0.0%)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => handleViewDetail(item.id)}
                            title="View Analysis Detail"
                            className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {item.report_pdf_path && (
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(item.id)}
                              title="Download PDF Report"
                              className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors inline-block cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Delete Record"
                            className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal Detail View */}
          {selectedAnalysis && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-900 text-base">
                    Analysis Detail ({selectedAnalysis.analysis_id})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedAnalysis(null)}
                    className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500">Predicted Class:</span>{' '}
                    <strong className="text-blue-600">{selectedAnalysis.classification.predicted_class}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Confidence:</span>{' '}
                    <strong>{(selectedAnalysis.classification.confidence * 100).toFixed(1)}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Tumor Pixels:</span>{' '}
                    <strong>{selectedAnalysis.segmentation.tumor_pixels.toLocaleString()} px</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Area Percentage:</span>{' '}
                    <strong>{selectedAnalysis.segmentation.area_percentage.toFixed(2)}%</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <img src={selectedAnalysis.visualizations.original} alt="Original" className="rounded border bg-slate-900 aspect-square object-contain" />
                  <img src={selectedAnalysis.visualizations.gradcam} alt="GradCAM" className="rounded border bg-slate-900 aspect-square object-contain" />
                  <img src={selectedAnalysis.visualizations.mask} alt="Mask" className="rounded border bg-slate-900 aspect-square object-contain" />
                  <img src={selectedAnalysis.visualizations.overlay} alt="Overlay" className="rounded border bg-slate-900 aspect-square object-contain" />
                </div>
              </div>
            </div>
          )}

        </main>

        <Footer />
      </div>
    </div>
  </div>
);
};
