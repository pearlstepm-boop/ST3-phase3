import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Plus, 
  Link2,
  Sparkles,
  Database
} from 'lucide-react';
import { SheetSyncConfig } from '../types';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SheetSyncConfig;
  onSaveConfig: (config: SheetSyncConfig) => void;
  onCreateNewSheet: () => Promise<void>;
  onSyncNow: () => Promise<void>;
  isCreating: boolean;
  isSyncing: boolean;
  hasAuthToken: boolean;
  onPromptSignIn: () => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onCreateNewSheet,
  onSyncNow,
  isCreating,
  isSyncing,
  hasAuthToken,
  onPromptSignIn,
}) => {
  const [spreadsheetInput, setSpreadsheetInput] = useState(
    config.spreadsheetId ? config.spreadsheetUrl || config.spreadsheetId : ''
  );
  const [autoSync, setAutoSync] = useState(config.autoSync);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Extract ID from URL or bare ID
  const extractId = (val: string): string => {
    const match = val.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : val.trim();
  };

  const handleSaveManualId = () => {
    const id = extractId(spreadsheetInput);
    if (!id) return;

    const updated: SheetSyncConfig = {
      ...config,
      spreadsheetId: id,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${id}/edit`,
      autoSync,
      syncStatus: 'idle',
    };
    onSaveConfig(updated);
    setStatusMessage('บันทึกการเชื่อมโยง Google Sheet สำเร็จ');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                ฐานข้อมูล Google Sheets
              </h3>
              <p className="text-xs text-slate-500">
                เชื่อมต่อและจัดเก็บข้อมูลใบงานทุกส่วนลงใน Google Sheets แบบเรียลไทม์
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs px-2.5 py-1 rounded-lg"
          >
            ปิด
          </button>
        </div>

        {/* Auth Check Warning */}
        {!hasAuthToken && (
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <div className="font-semibold">ยังไม่ได้ลงชื่อเข้าใช้ด้วยบัญชี Google</div>
              <p className="text-amber-800 leading-relaxed">
                กรุณาเข้าสู่ระบบด้วย Google เพื่อให้ระบบมีสิทธิ์สร้างหรือบันทึกข้อมูลลงใน Google Drive / Google Sheets ของท่าน
              </p>
              <button
                type="button"
                onClick={onPromptSignIn}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-xs shadow-sm transition-colors"
              >
                เข้าสู่ระบบด้วย Google ทันที
              </button>
            </div>
          </div>
        )}

        {/* Current Connection Status */}
        {config.spreadsheetId ? (
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>เชื่อมต่อ Google Sheet แล้ว</span>
              </div>
              <a
                href={config.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
              >
                <span>เปิดดู Spreadsheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="text-[11px] text-slate-600 font-mono bg-white/80 p-2 rounded-xl border border-emerald-100 truncate">
              ID: {config.spreadsheetId}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={onSyncNow}
                disabled={isSyncing || !hasAuthToken}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium shadow-sm transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังบันทึกลง Sheet...' : 'ซิงค์ข้อมูลลง Sheet เดี๋ยวนี้'}</span>
              </button>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => {
                    setAutoSync(e.target.checked);
                    onSaveConfig({ ...config, autoSync: e.target.checked });
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>ซิงค์อัตโนมัติ (Auto-Sync)</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Option A: One-click creation */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  วิธีที่ 1: สร้าง Google Sheet ใหม่ทันที (แนะนำ)
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                ระบบจะสร้าง Google Sheet พร้อมแบ่งแท็บ 5 หน้าตามใบงาน (Dashboard, Gap Analysis, Linkages, Projects, Recommendations) ให้ใน Google Drive ของท่านโดยอัตโนมัติ
              </p>
              <button
                type="button"
                onClick={onCreateNewSheet}
                disabled={isCreating || !hasAuthToken}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {isCreating
                    ? 'กำลังสร้าง Google Sheet ใน Drive...'
                    : 'กดสร้าง Google Sheet ใหม่ในบัญชีของคุณ'}
                </span>
              </button>
            </div>

            {/* Option B: Connect existing Sheet */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-800">
                  วิธีที่ 2: เชื่อมต่อด้วย Google Sheet URL / ID ที่มีอยู่
                </span>
              </div>
              <div className="space-y-1">
                <input
                  type="text"
                  value={spreadsheetInput}
                  onChange={(e) => setSpreadsheetInput(e.target.value)}
                  placeholder="วางลิงก์ Google Sheet หรือ Spreadsheet ID..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveManualId}
                disabled={!spreadsheetInput.trim()}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors"
              >
                บันทึกการเชื่อมโยง
              </button>
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl text-center font-medium animate-in fade-in">
            {statusMessage}
          </div>
        )}

        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
