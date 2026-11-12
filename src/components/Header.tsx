import React from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  LogOut, 
  Printer, 
  Settings2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GroupMeta, UserProfile, SheetSyncConfig, OrgAccessConfig } from '../types';
import { GroupSelector } from './GroupSelector';

interface HeaderProps {
  groups: GroupMeta[];
  activeGroupId: number;
  onSelectGroup: (id: number) => void;
  onAddGroup?: () => void;
  currentUser: UserProfile | null;
  onSignIn: () => void;
  onSignOut: () => void;
  sheetConfig: SheetSyncConfig;
  onOpenSheetModal: () => void;
  onManualSync: () => void;
  isSyncing: boolean;
  onOpenOrgModal: () => void;
  onOpenExportModal: () => void;
  orgConfig: OrgAccessConfig;
}

export const Header: React.FC<HeaderProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  onAddGroup,
  currentUser,
  onSignIn,
  onSignOut,
  sheetConfig,
  onOpenSheetModal,
  onManualSync,
  isSyncing,
  onOpenOrgModal,
  onOpenExportModal,
  orgConfig,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Title and Branding */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 shrink-0 font-bold text-lg">
            3
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                ระบบวางแผนโครงการกลยุทธ์ที่ 3
              </h1>
              <span className="text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md">
                การคัดกรองและบำบัดรักษา
              </span>
              <span className="text-xs text-slate-400 font-normal hidden lg:inline">
                (ระยะที่ 3 พ.ศ. 2571–2575)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบใบงานกลุ่มเชิงกิจกรรม (A1–A6) 
            </p>
          </div>
        </div>

        {/* Action Controls & User Auth */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between md:justify-end">
          {/* Active Group Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">กลุ่ม:</span>
            <GroupSelector
              groups={groups}
              activeGroupId={activeGroupId}
              onSelectGroup={onSelectGroup}
              onAddGroup={onAddGroup}
              userAssignedGroupId={currentUser?.assignedGroupId}
            />
          </div>

          {/* Google Sheets Connection Status */}
          <div className="flex items-center gap-1.5">
            {sheetConfig.spreadsheetId ? (
              <div className="flex items-center gap-1 bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-xs px-2.5 py-1.5 rounded-xl">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium hidden sm:inline">Google Sheet</span>
                <button
                  type="button"
                  onClick={onManualSync}
                  disabled={isSyncing}
                  title="ซิงค์ข้อมูลลง Google Sheets ตอนนี้"
                  className="hover:text-emerald-950 p-0.5 rounded transition-transform active:rotate-180"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
                <a
                  href={sheetConfig.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${sheetConfig.spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-950 p-0.5"
                  title="เปิดดู Google Sheet ในแท็บใหม่"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenSheetModal}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Database</span>
              </button>
            )}
          </div>

          {/* Export / Print */}
          <button
            type="button"
            onClick={onOpenExportModal}
            title="ส่งออกรายงาน / พิมพ์สรุปผล"
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Org Access Settings */}
          <button
            type="button"
            onClick={onOpenOrgModal}
            title="ตั้งค่าสิทธิ์อีเมลองค์กร"
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Google Sign-in / User Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <div className="flex items-center gap-2">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-7 h-7 rounded-full ring-1 ring-slate-200 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-800 font-semibold flex items-center justify-center text-xs">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-700">
                    <ShieldCheck className="w-3 h-3" />
                    <span>อีเมลได้รับอนุญาต</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                title="ออกจากระบบ"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
