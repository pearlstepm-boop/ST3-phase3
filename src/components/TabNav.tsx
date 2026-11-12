import React from 'react';
import { 
  BarChart3, 
  Workflow, 
  FileCheck2, 
  Network, 
  Layers, 
  Lightbulb 
} from 'lucide-react';
import { TabKey } from '../types';

interface TabNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  stats?: {
    totalProjects: number;
    completedGapCount: number;
  };
}

export const TabNav: React.FC<TabNavProps> = ({ activeTab, onTabChange, stats }) => {
  const tabs = [
    {
      key: 'summary' as TabKey,
      pageNo: 'หน้าที่ 1',
      title: 'สรุปภาพรวม',
      subtitle: 'Dashboard & Progress',
      icon: BarChart3,
      badge: stats ? `${stats.totalProjects} โครงการ` : undefined,
    },
    {
      key: 'logic_model' as TabKey,
      pageNo: 'หน้าที่ 2',
      title: 'Logic Model',
      subtitle: 'กลยุทธ์ที่ 3 (T-I-A-O-S-M-IM)',
      icon: Workflow,
    },
    {
      key: 'worksheet_1' as TabKey,
      pageNo: 'หน้าที่ 3',
      title: 'ใบงานที่ 1',
      subtitle: 'Gap Analysis ช่องว่างดำเนินงาน',
      icon: FileCheck2,
    },
    {
      key: 'worksheet_2_1' as TabKey,
      pageNo: 'หน้าที่ 4',
      title: 'ใบงานที่ 2 (ส่วนที่ 1)',
      subtitle: 'เชื่อมโยงกิจกรรมและปัญหา',
      icon: Network,
    },
    {
      key: 'worksheet_2_2' as TabKey,
      pageNo: 'หน้าที่ 5',
      title: 'ใบงานที่ 2 (ส่วนที่ 2)',
      subtitle: 'ข้อเสนอโครงการตามกิจกรรม',
      icon: Layers,
    },
    {
      key: 'recommendations' as TabKey,
      pageNo: 'หน้าที่ 6',
      title: 'ข้อเสนอแนะเพิ่มเติม',
      subtitle: 'เชิงนโยบาย/ปัจจัยสำเร็จ',
      icon: Lightbulb,
    },
  ];

  return (
    <div className="w-full bg-white/70 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto overflow-x-auto scrollbar-none py-2">
        <nav className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`group relative flex items-center gap-3 px-3.5 py-2 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/70 group-hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-medium uppercase tracking-wider ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {tab.pageNo}
                    </span>
                    {tab.badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-sky-500/30 text-sky-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold tracking-tight">
                    {tab.title}
                  </span>
                </div>

                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-sky-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
