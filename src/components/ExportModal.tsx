import React from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  GroupMeta, 
  GapAnalysisItem, 
  ActivityLinkageItem, 
  ProjectProposalItem, 
  GroupRecommendation 
} from '../types';
import { STRATEGY_INFO } from '../data/initialData';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: GroupMeta[];
  gapAnalysisByGroup: Record<number, GapAnalysisItem[]>;
  linkagesByGroup: Record<number, ActivityLinkageItem[]>;
  projects: ProjectProposalItem[];
  recommendationsByGroup: Record<number, GroupRecommendation>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  groups,
  gapAnalysisByGroup,
  linkagesByGroup,
  projects,
  recommendationsByGroup,
}) => {
  if (!isOpen) return null;

  // Print trigger
  const handlePrint = () => {
    window.print();
  };

  // Export JSON
  const handleExportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      strategy: STRATEGY_INFO,
      groups,
      gapAnalysisByGroup,
      linkagesByGroup,
      projects,
      recommendationsByGroup,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workshop_strategy3_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV of Projects
  const handleExportProjectsCSV = () => {
    const headers = [
      'ลำดับ',
      'กลุ่ม',
      'กิจกรรม',
      'ชื่อโครงการ/กิจกรรม',
      'มีแผนอยู่แล้ว',
      'ต้องปรับปรุง',
      'บูรณาการร่วมกับ',
      'โครงการใหม่',
      'ผลผลิตที่คาดว่าจะได้รับ (O)',
      'ปี 2571',
      'ปี 2572',
      'ปี 2573',
      'ปี 2574',
      'ปี 2575',
      'งบประมาณ (บาท)',
      'แหล่งงบประมาณ',
      'หน่วยงานหลัก',
      'หน่วยงานรอง',
    ];

    const rows = projects.map((p, index) => {
      const g = groups.find((grp) => grp.id === p.groupId);
      return [
        index + 1,
        `"${g?.name || p.groupId}"`,
        `"${p.activityCode}"`,
        `"${p.projectName.replace(/"/g, '""')}"`,
        p.status.hasExistingPlan ? '✓' : '',
        p.status.needsImprovement ? '✓' : '',
        `"${(p.status.integratedWith || '').replace(/"/g, '""')}"`,
        p.status.isNewProject ? '✓' : '',
        `"${p.expectedOutput.replace(/"/g, '""')}"`,
        p.years.y2571 ? '✓' : '',
        p.years.y2572 ? '✓' : '',
        p.years.y2573 ? '✓' : '',
        p.years.y2574 ? '✓' : '',
        p.years.y2575 ? '✓' : '',
        `"${p.budget.amount || ''}"`,
        `"${(p.budget.source || '').replace(/"/g, '""')}"`,
        `"${(p.primaryAgency || '').replace(/"/g, '""')}"`,
        `"${(p.secondaryAgency || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_proposals_strat3_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                พิมพ์สรุปผลและส่งออกรายงาน
              </h3>
              <p className="text-xs text-slate-500">
                นำข้อมูลใบงานและสรุปผลโครงการไปใช้ในการประชุมหรือจัดทำรายงาน
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

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group flex flex-col justify-between"
          >
            <div className="p-2 w-fit rounded-xl bg-white shadow-sm text-slate-700 group-hover:text-indigo-600 transition-colors">
              <Printer className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <div className="font-bold text-xs text-slate-800">พิมพ์ / บันทึกเป็น PDF</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                จัดหน้าเอกสารมาตรฐานพร้อมรายงาน
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportProjectsCSV}
            className="p-4 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200/80 text-left transition-all group flex flex-col justify-between"
          >
            <div className="p-2 w-fit rounded-xl bg-white shadow-sm text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <div className="font-bold text-xs text-emerald-950">ส่งออกเป็น CSV (Excel)</div>
              <div className="text-[11px] text-emerald-800/80 mt-0.5">
                {projects.length} รายการโครงการ
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="p-4 rounded-2xl bg-sky-50/60 hover:bg-sky-100/60 border border-sky-200/80 text-left transition-all group flex flex-col justify-between"
          >
            <div className="p-2 w-fit rounded-xl bg-white shadow-sm text-sky-600">
              <Download className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <div className="font-bold text-xs text-sky-950">สำรองข้อมูลทั้งหมด (JSON)</div>
              <div className="text-[11px] text-sky-800/80 mt-0.5">
                รวมใบงาน 1, 2 และข้อเสนอแนะ
              </div>
            </div>
          </button>
        </div>

        {/* Data Summary Quick Stats */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <div className="font-semibold text-slate-700">สรุปข้อมูลที่จะถูกส่งออก:</div>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div>• จำนวนกลุ่ม: {groups.length} กลุ่ม</div>
            <div>• โครงการที่เสนอ: {projects.length} โครงการ</div>
            <div>• ใบงานที่ 1: T1–T6 ครบทุกประเด็น</div>
            <div>• ใบงานที่ 2: A1–A5 ครบทุกกิจกรรม</div>
          </div>
        </div>

        {/* Footer */}
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
