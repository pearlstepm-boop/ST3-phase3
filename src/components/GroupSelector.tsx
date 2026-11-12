import React from 'react';
import { Users, ChevronDown, Check, Plus } from 'lucide-react';
import { GroupMeta } from '../types';

interface GroupSelectorProps {
  groups: GroupMeta[];
  activeGroupId: number;
  onSelectGroup: (groupId: number) => void;
  onAddGroup?: () => void;
  userAssignedGroupId?: number;
  showAllOption?: boolean;
  isAllSelected?: boolean;
  onToggleAll?: (selected: boolean) => void;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  onAddGroup,
  userAssignedGroupId,
  showAllOption = false,
  isAllSelected = false,
  onToggleAll,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold shadow-xs transition-all"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: isAllSelected ? '#64748b' : activeGroup?.color || '#3b82f6' }}
          />
          <div className="text-left flex items-center gap-1.5">
            <span className="font-bold text-slate-900">
              {isAllSelected ? 'ดูภาพรวมทุกกลุ่ม' : activeGroup?.name}
            </span>
            {!isAllSelected && activeGroup?.code && (
              <span className="text-xs text-slate-500 font-normal hidden sm:inline max-w-[180px] truncate">
                ({activeGroup.title || activeGroup.agency})
              </span>
            )}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
        </button>

        {showAllOption && onToggleAll && (
          <button
            type="button"
            onClick={() => onToggleAll(!isAllSelected)}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isAllSelected
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            ทุกกลุ่ม
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 sm:left-0 z-50 mt-1.5 w-80 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 border border-slate-200 p-2 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
              <span>เลือกกลุ่มตามกิจกรรม (A)</span>
              <span>{groups.length} กลุ่ม</span>
            </div>

            {showAllOption && onToggleAll && (
              <button
                type="button"
                onClick={() => {
                  onToggleAll(true);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors mb-1 ${
                  isAllSelected ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <div>
                    <div className="font-bold">ดูสรุปรวมทุกกลุ่ม</div>
                    <div className="text-[11px] text-slate-400">เปรียบเทียบผลงานทั้งหมด</div>
                  </div>
                </div>
                {isAllSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
              </button>
            )}

            <div className="max-h-64 overflow-y-auto space-y-1 py-1">
              {groups.map((group) => {
                const isCurrent = activeGroupId === group.id && !isAllSelected;
                const isAssigned = userAssignedGroupId === group.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      if (onToggleAll) onToggleAll(false);
                      onSelectGroup(group.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      isCurrent
                        ? 'bg-sky-50 text-sky-950 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{group.name}</span>
                          {isAssigned && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                              กลุ่มของคุณ
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[210px]">
                          {group.title || group.agency}
                        </div>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {onAddGroup && (
              <div className="pt-1.5 border-t border-slate-100 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    onAddGroup();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  เพิ่มกลุ่มกิจกรรมใหม่
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
