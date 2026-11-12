import React from 'react';
import { 
  Users, 
  Layers, 
  Coins, 
  Calendar, 
  ArrowRight, 
  Sparkles,
  Target
} from 'lucide-react';
import { 
  GroupMeta, 
  GapAnalysisItem, 
  ActivityLinkageItem, 
  ProjectProposalItem, 
  GroupRecommendation,
  TabKey 
} from '../types';
import { STRATEGY_INFO } from '../data/initialData';

interface SummaryDashboardProps {
  groups: GroupMeta[];
  activeGroupId: number;
  onSelectGroup: (groupId: number) => void;
  onNavigateTab: (tab: TabKey) => void;
  gapAnalysisByGroup: Record<number, GapAnalysisItem[]>;
  linkagesByGroup: Record<number, ActivityLinkageItem[]>;
  projects: ProjectProposalItem[];
  recommendationsByGroup: Record<number, GroupRecommendation>;
  isAllGroupsView: boolean;
  onToggleAllGroups: (all: boolean) => void;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  onNavigateTab,
  gapAnalysisByGroup,
  linkagesByGroup,
  projects,
  recommendationsByGroup,
  isAllGroupsView,
  onToggleAllGroups,
}) => {
  const displayProjects = isAllGroupsView
    ? projects
    : projects.filter((p) => p.groupId === activeGroupId);

  const statusStats = {
    existing: displayProjects.filter((p) => p.status.hasExistingPlan).length,
    improve: displayProjects.filter((p) => p.status.needsImprovement).length,
    integrated: displayProjects.filter((p) => !!p.status.integratedWith).length,
    newProj: displayProjects.filter((p) => p.status.isNewProject).length,
  };

  const yearStats = {
    '2571': displayProjects.filter((p) => p.years.y2571).length,
    '2572': displayProjects.filter((p) => p.years.y2572).length,
    '2573': displayProjects.filter((p) => p.years.y2573).length,
    '2574': displayProjects.filter((p) => p.years.y2574).length,
    '2575': displayProjects.filter((p) => p.years.y2575).length,
  };

  const totalBudget = displayProjects.reduce((sum, p) => {
    const rawNum = parseFloat((p.budget.amount || '0').replace(/,/g, ''));
    return isNaN(rawNum) ? sum : sum + rawNum;
  }, 0);

  const getGroupStats = (groupId: number) => {
    const gaps = gapAnalysisByGroup[groupId] || [];
    const addedFindings = gaps.reduce((acc, g) => acc + g.findings.groupAdded.length, 0);
    const addedDevelopments = gaps.reduce((acc, g) => acc + g.developments.groupAdded.length, 0);
    const groupProjects = projects.filter((p) => p.groupId === groupId);
    const hasRec = !!recommendationsByGroup[groupId]?.policySuggestions;

    return {
      addedFindings,
      addedDevelopments,
      projectCount: groupProjects.length,
      completionRate: Math.min(
        100,
        Math.round(
          ((addedFindings > 0 ? 25 : 0) +
            (addedDevelopments > 0 ? 25 : 0) +
            (groupProjects.length > 0 ? 30 : 0) +
            (hasRec ? 20 : 0))
        )
      ),
    };
  };

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  return (
    <div className="space-y-5 pb-12">
      {/* Lean Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-sky-200 text-xs font-semibold">
              ภาพรวมเชิงยุทธศาสตร์
            </span>
            <span className="text-xs text-slate-400">
              {isAllGroupsView ? 'มุมมอง: ทุกกลุ่มกิจกรรม' : `มุมมอง: ${activeGroup.name}`}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            {STRATEGY_INFO.strategyName}
          </h2>
          <p className="text-xs text-slate-300">
            {STRATEGY_INFO.strategyGoal} (ระยะ พ.ศ. 2571–2575)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggleAllGroups(!isAllGroupsView)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isAllGroupsView
                ? 'bg-sky-500 text-white border-sky-400'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            {isAllGroupsView ? '✓ ผลรวมทุกกลุ่ม' : 'ดูผลรวมทุกกลุ่ม'}
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('logic_model')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <span>Logic Model</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Compact Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="soft-card p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">โครงการที่เสนอ</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{displayProjects.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              ใหม่ {statusStats.newProj} • บูรณาการ {statusStats.integrated}
            </div>
          </div>
        </div>

        <div className="soft-card p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ประมาณการงบประมาณ</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">
              {totalBudget > 0 ? totalBudget.toLocaleString('th-TH') : '0'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">บาท (ระยะ 5 ปี)</div>
          </div>
        </div>

        <div className="soft-card p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">กลุ่มกิจกรรม (A)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{groups.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">A1 ถึง A{groups.length}</div>
          </div>
        </div>

        <div className="soft-card p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ช่วงเวลาดำเนินการ</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">2571–2575</div>
            <div className="text-[11px] text-slate-500 mt-0.5">แผนระยะที่ 3</div>
          </div>
        </div>
      </div>

      {/* Lean Breakdown: Status & Year Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Breakdown */}
        <div className="soft-card p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-sky-600" />
              สถานะโครงการ ({displayProjects.length} รายการ)
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-0.5">
                <span>มีแผนอยู่แล้ว</span>
                <span className="font-bold">{statusStats.existing}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${displayProjects.length ? (statusStats.existing / displayProjects.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-0.5">
                <span>ต้องปรับปรุง</span>
                <span className="font-bold">{statusStats.improve}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${displayProjects.length ? (statusStats.improve / displayProjects.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-0.5">
                <span>บูรณาการร่วมกับหน่วยงานอื่น</span>
                <span className="font-bold">{statusStats.integrated}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{
                    width: `${displayProjects.length ? (statusStats.integrated / displayProjects.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 mb-0.5">
                <span>โครงการใหม่</span>
                <span className="font-bold">{statusStats.newProj}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full"
                  style={{
                    width: `${displayProjects.length ? (statusStats.newProj / displayProjects.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Year Distribution */}
        <div className="soft-card p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              การกระจายปีที่ดำเนินการ (พ.ศ. 2571–2575)
            </h3>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-1">
            {Object.entries(yearStats).map(([yr, count]) => (
              <div
                key={yr}
                className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100"
              >
                <div className="text-[11px] font-bold text-slate-500">{yr}</div>
                <div className="text-lg font-bold text-indigo-600 my-0.5">{count}</div>
                <div className="text-[10px] text-slate-400">โครงการ</div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 pt-1 text-center">
            โครงการส่วนใหญ่พร้อมขับเคลื่อนตั้งแต่ปี 2571 เพื่อความต่อเนื่องของกลยุทธ์
          </div>
        </div>
      </div>

      {/* Group Progress Grid by Activity (A) */}
      <div className="soft-card p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-600" />
            สถานะความก้าวหน้าตามกลุ่มกิจกรรม (A1–A{groups.length})
          </h3>
          <span className="text-[11px] text-slate-400">คลิกการ์ดเพื่อสลับกลุ่ม</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((group) => {
            const stats = getGroupStats(group.id);
            const isCurrent = activeGroupId === group.id && !isAllGroupsView;

            return (
              <div
                key={group.id}
                onClick={() => {
                  onToggleAllGroups(false);
                  onSelectGroup(group.id);
                }}
                className={`cursor-pointer rounded-xl p-3.5 transition-all border ${
                  isCurrent
                    ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="font-bold text-xs text-slate-900">{group.name}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.2 rounded-md">
                      เลือกอยู่
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-1 min-h-[18px] mb-2 font-medium">
                  {group.title}
                </p>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>ความก้าวหน้า</span>
                    <span className="font-bold">{stats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${stats.completionRate}%`,
                        backgroundColor: group.color,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{stats.projectCount} โครงการ</span>
                  <span>+{stats.addedFindings + stats.addedDevelopments} ข้อค้นพบ</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
