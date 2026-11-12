import React, { useState, useEffect } from 'react';
import { 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  Rocket, 
  FileText 
} from 'lucide-react';
import { GroupRecommendation, GroupMeta } from '../types';
import { GroupSelector } from './GroupSelector';

interface WorksheetRecommendationsProps {
  groups: GroupMeta[];
  activeGroupId: number;
  onSelectGroup: (id: number) => void;
  recommendations: GroupRecommendation;
  onUpdateRecommendations: (updated: GroupRecommendation) => void;
  allGroupsRecommendations: Record<number, GroupRecommendation>;
}

export const WorksheetRecommendations: React.FC<WorksheetRecommendationsProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  recommendations,
  onUpdateRecommendations,
  allGroupsRecommendations,
}) => {
  const [formData, setFormData] = useState<GroupRecommendation>(recommendations);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [peerGroupId, setPeerGroupId] = useState<number | null>(null);

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const peerGroup = peerGroupId ? groups.find((g) => g.id === peerGroupId) : null;
  const peerRec = peerGroupId ? allGroupsRecommendations[peerGroupId] : null;

  useEffect(() => {
    setFormData(recommendations);
  }, [recommendations, activeGroupId]);

  const handleChange = (field: keyof GroupRecommendation, value: string) => {
    const updated = {
      ...formData,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };
    setFormData(updated);
    onUpdateRecommendations(updated);
  };

  const handleManualSave = () => {
    onUpdateRecommendations(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Lean Header */}
      <div className="soft-card p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                หน้าที่ 6
              </span>
              <span className="text-xs font-semibold text-slate-500">ข้อเสนอแนะ</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-md text-white shadow-xs"
                style={{ backgroundColor: activeGroup.color }}
              >
                {activeGroup.name}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ประเด็นข้อเสนอแนะเพิ่มเติมเพื่อขับเคลื่อนกลยุทธ์ที่ 3
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">สลับกลุ่ม:</span>
            <GroupSelector
              groups={groups}
              activeGroupId={activeGroupId}
              onSelectGroup={onSelectGroup}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-600">
            ข้อเสนอแนะเชิงลึกจากกลุ่ม {activeGroup.name} ({activeGroup.title})
          </span>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                บันทึกแล้ว
              </span>
            )}
            <button
              type="button"
              onClick={handleManualSave}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึก</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Lean Input Cards */}
      <div className="grid grid-cols-1 gap-3.5">
        <div className="soft-card p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              1. ข้อเสนอแนะเชิงนโยบาย / กฎหมาย / สิทธิประโยชน์
            </h3>
          </div>
          <textarea
            rows={3}
            value={formData.policySuggestions}
            onChange={(e) => handleChange('policySuggestions', e.target.value)}
            placeholder="เช่น สิทธิประโยชน์ในระบบประกันสุขภาพ, บัญชียาหลักแห่งชาติ, กฎหมายควบคุม..."
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="soft-card p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              2. ปัจจัยความสำเร็จสำคัญ (Key Success Factors)
            </h3>
          </div>
          <textarea
            rows={2}
            value={formData.successFactors}
            onChange={(e) => handleChange('successFactors', e.target.value)}
            placeholder="เงื่อนไขสำคัญที่สุดที่จะทำให้กลยุทธ์ระยะที่ 3 บรรลุผล..."
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="soft-card p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              3. ปัญหา อุปสรรค และแนวทางแก้ไข
            </h3>
          </div>
          <textarea
            rows={2}
            value={formData.obstacles}
            onChange={(e) => handleChange('obstacles', e.target.value)}
            placeholder="ปัญหาหน้างานที่มักพบ ความเสี่ยง และแนวทางป้องกัน..."
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="soft-card p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              4. สิ่งที่สามารถเริ่มดำเนินการได้ทันที (Quick Wins)
            </h3>
          </div>
          <textarea
            rows={2}
            value={formData.quickWins}
            onChange={(e) => handleChange('quickWins', e.target.value)}
            placeholder="สิ่งที่เริ่มทำได้ทันทีโดยไม่ต้องรองบประมาณก้อนใหญ่..."
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="soft-card p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              5. ข้อคิดเห็นและข้อเสนอแนะอื่นๆ
            </h3>
          </div>
          <textarea
            rows={2}
            value={formData.generalNotes}
            onChange={(e) => handleChange('generalNotes', e.target.value)}
            placeholder="ข้อสังเกตเพิ่มเติม..."
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      {/* Peer View */}
      <div className="soft-card p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="font-bold text-xs text-slate-800">
            แลกเปลี่ยนเรียนรู้: ดูข้อเสนอแนะของกลุ่มอื่น
          </div>
          <select
            value={peerGroupId || ''}
            onChange={(e) => setPeerGroupId(e.target.value ? Number(e.target.value) : null)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1"
          >
            <option value="">-- เลือกกลุ่มเพื่อดู --</option>
            {groups
              .filter((g) => g.id !== activeGroupId)
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}: {g.title.slice(0, 30)}...
                </option>
              ))}
          </select>
        </div>

        {peerGroup && peerRec && (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
              จาก {peerGroup.name} ({peerGroup.title})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="font-bold text-indigo-900">นโยบาย:</span>{' '}
                {peerRec.policySuggestions || '-'}
              </div>
              <div>
                <span className="font-bold text-emerald-900">ปัจจัยสำเร็จ:</span>{' '}
                {peerRec.successFactors || '-'}
              </div>
              <div>
                <span className="font-bold text-amber-900">ปัญหาอุปสรรค:</span>{' '}
                {peerRec.obstacles || '-'}
              </div>
              <div>
                <span className="font-bold text-sky-900">Quick Wins:</span>{' '}
                {peerRec.quickWins || '-'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
