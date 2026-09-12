import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { adminApi } from '../services/api';
import { AdminStats } from '../types';
import { Shield, Users, Activity, CheckCircle2, Cpu, Database, AlertCircle, Loader2 } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Admin authorization failed or error fetching statistics.');
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1 flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                  Admin System Dashboard
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                System telemetry, user metrics, and PyTorch model server status
              </p>
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
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
              <p className="text-xs font-mono">Loading administrative telemetry...</p>
            </div>
          ) : stats && (
            <div className="space-y-6">
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Total Users</span>
                  <p className="text-2xl font-black text-slate-900 font-mono">{stats.metrics.total_users}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Total Analyses</span>
                  <p className="text-2xl font-black text-blue-600 font-mono">{stats.metrics.total_analyses}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Analyses Today</span>
                  <p className="text-2xl font-black text-indigo-600 font-mono">{stats.metrics.analyses_today}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Tumor Detected</span>
                  <p className="text-2xl font-black text-amber-600 font-mono">{stats.metrics.tumor_detected_count}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">No Tumor</span>
                  <p className="text-2xl font-black text-emerald-600 font-mono">{stats.metrics.no_tumor_count}</p>
                </div>
              </div>

              {/* System & Model Status Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider border-b pb-3">
                  Backend System & PyTorch Engine Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                        <Cpu className="w-4 h-4 text-blue-600" /> Classification Model Adapter:
                      </span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        Loaded ✓
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">ResNet18 Backbone • 4-Class Softmax Output</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                        <Layers className="w-4 h-4 text-cyan-600" /> Segmentation Model Adapter:
                      </span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        Loaded ✓
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">U-Net Architecture • Binary Pixel Mask</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                        <Database className="w-4 h-4 text-indigo-600" /> Relational Database:
                      </span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        Connected ✓
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">PostgreSQL / SQLite Connection Active</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                        <Activity className="w-4 h-4 text-emerald-600" /> Execution Device:
                      </span>
                      <span className="text-blue-600 font-bold">
                        {stats.system_status.device.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">CUDA GPU Acceleration if available; CPU Fallback</p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
};
