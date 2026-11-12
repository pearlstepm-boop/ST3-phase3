import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { GapAnalysisItem, GroupMeta } from '../types';
import { GroupSelector } from './GroupSelector';
import { INITIAL_GAP_ANALYSIS } from '../data/initialData';

interface Worksheet1GapAnalysisProps {
  groups: GroupMeta[];
  activeGroupId: number;
  onSelectGroup: (id: number) => void;
  gapAnalysisList: GapAnalysisItem[];
  onUpdateGapAnalysis: (updatedItems: GapAnalysisItem[]) => void;
  allGroupsGapData: Record<number, GapAnalysisItem[]>;
}

export const Worksheet1GapAnalysis: React.FC<Worksheet1GapAnalysisProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  gapAnalysisList,
  onUpdateGapAnalysis,
  allGroupsGapData,
}) => {
  const [newFindingText, setNewFindingText] = useState<Record<string, string>>({});
  const [newDevText, setNewDevText] = useState<Record<string, string>>({});
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [compareGroupId, setCompareGroupId] = useState<number | null>(null);

  // Modal for editing default items or topic title
  const [editingItem, setEditingItem] = useState<{
    itemId: string;
    type: 'topic' | 'defaultFinding' | 'defaultDev';
    index?: number;
    text: string;
    originalText: string;
  } | null>(null);

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const compareGroup = compareGroupId ? groups.find((g) => g.id === compareGroupId) : null;
  const compareItems = compareGroupId ? allGroupsGapData[compareGroupId] || [] : [];

  // Helper to get original baseline text from initial PDF data
  const getOriginalBaseline = (itemId: string) => {
    return INITIAL_GAP_ANALYSIS.find((t) => t.id === itemId);
  };

  const handleAddFinding = (itemId: string) => {
    const text = (newFindingText[itemId] || '').trim();
    if (!text) return;

    const updated = gapAnalysisList.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          findings: {
            ...item.findings,
            groupAdded: [...item.findings.groupAdded, text],
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    onUpdateGapAnalysis(updated);
    setNewFindingText({ ...newFindingText, [itemId]: '' });
  };

  const handleRemoveFinding = (itemId: string, index: number) => {
    const updated = gapAnalysisList.map((item) => {
      if (item.id === itemId) {
        const nextAdded = [...item.findings.groupAdded];
        nextAdded.splice(index, 1);
        return {
          ...item,
          findings: {
            ...item.findings,
            groupAdded: nextAdded,
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    onUpdateGapAnalysis(updated);
  };

  const handleAddDevelopment = (itemId: string) => {
    const text = (newDevText[itemId] || '').trim();
    if (!text) return;

    const updated = gapAnalysisList.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          developments: {
            ...item.developments,
            groupAdded: [...item.developments.groupAdded, text],
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    onUpdateGapAnalysis(updated);
    setNewDevText({ ...newDevText, [itemId]: '' });
  };

  const handleRemoveDevelopment = (itemId: string, index: number) => {
    const updated = gapAnalysisList.map((item) => {
      if (item.id === itemId) {
        const nextAdded = [...item.developments.groupAdded];
        nextAdded.splice(index, 1);
        return {
          ...item,
          developments: {
            ...item.developments,
            groupAdded: nextAdded,
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    onUpdateGapAnalysis(updated);
  };

  // Save edit of default item or topic title
  const handleSaveEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const { itemId, type, index, text } = editingItem;
    const updated = gapAnalysisList.map((item) => {
      if (item.id === itemId) {
        if (type === 'topic') {
          return { ...item, topicTitle: text.trim(), updatedAt: new Date().toISOString() };
        } else if (type === 'defaultFinding' && index !== undefined) {
          const nextDefs = [...item.findings.default];
          nextDefs[index] = text.trim();
          return {
            ...item,
            findings: { ...item.findings, default: nextDefs },
            updatedAt: new Date().toISOString(),
          };
        } else if (type === 'defaultDev' && index !== undefined) {
          const nextDefs = [...item.developments.default];
          nextDefs[index] = text.trim();
          return {
            ...item,
            developments: { ...item.developments, default: nextDefs },
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return item;
    });

    onUpdateGapAnalysis(updated);
    setEditingItem(null);
  };

  // Revert a default item back to initial text
  const handleRevertDefaultItem = (itemId: string, type: 'topic' | 'defaultFinding' | 'defaultDev', index?: number) => {
    const baseline = getOriginalBaseline(itemId);
    if (!baseline) return;

    const updated = gapAnalysisList.map((item) => {
      if (item.id === itemId) {
        if (type === 'topic') {
          return { ...item, topicTitle: baseline.topicTitle, updatedAt: new Date().toISOString() };
        } else if (type === 'defaultFinding' && index !== undefined) {
          const nextDefs = [...item.findings.default];
          nextDefs[index] = baseline.findings.default[index] || nextDefs[index];
          return {
            ...item,
            findings: { ...item.findings, default: nextDefs },
            updatedAt: new Date().toISOString(),
          };
        } else if (type === 'defaultDev' && index !== undefined) {
          const nextDefs = [...item.developments.default];
          nextDefs[index] = baseline.developments.default[index] || nextDefs[index];
          return {
            ...item,
            developments: { ...item.developments, default: nextDefs },
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return item;
    });

    onUpdateGapAnalysis(updated);
  };

  const handleAddCustomTopic = () => {
    if (!newTopicTitle.trim()) return;
    const nextCode = `T${gapAnalysisList.length + 1}`;
    const newItem: GapAnalysisItem = {
      id: nextCode,
      topicCode: nextCode,
      topicTitle: newTopicTitle.trim(),
      isCustom: true,
      findings: {
        default: [],
        groupAdded: [],
      },
      developments: {
        default: [],
        groupAdded: [],
      },
      updatedAt: new Date().toISOString(),
    };

    onUpdateGapAnalysis([...gapAnalysisList, newItem]);
    setNewTopicTitle('');
    setShowAddTopicModal(false);
  };

  const handleDeleteCustomTopic = (itemId: string) => {
    onUpdateGapAnalysis(gapAnalysisList.filter((item) => item.id !== itemId));
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Lean Header */}
      <div className="soft-card p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                หน้าที่ 3
              </span>
              <span className="text-xs font-semibold text-slate-500">ใบงานที่ 1</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-md text-white shadow-xs"
                style={{ backgroundColor: activeGroup.color }}
              >
                {activeGroup.name}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              การตรวจสอบและวิเคราะห์ช่องว่างการดำเนินงาน (Gap Analysis)
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

        {/* Lean Sub-bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">
              พิจารณาช่องว่าง T1–T6 (สามารถคลิกแก้ไขข้อมูลตั้งต้นได้ หากแก้ไขระบบจะไฮไลต์เป็นสีเหลือง/ส้ม)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">ดูกลุ่มอื่น:</span>
            <select
              value={compareGroupId || ''}
              onChange={(e) => setCompareGroupId(e.target.value ? Number(e.target.value) : null)}
              className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1"
            >
              <option value="">-- ไม่เปรียบเทียบ --</option>
              {groups
                .filter((g) => g.id !== activeGroupId)
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.title.slice(0, 20)}...)
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-3.5">
        {gapAnalysisList.map((item) => {
          const compItem = compareItems.find((ci) => ci.id === item.id);
          const baseline = getOriginalBaseline(item.id);
          const isTopicTitleEdited = baseline && baseline.topicTitle !== item.topicTitle;

          return (
            <div
              key={item.id}
              className="soft-card rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs"
            >
              {/* Card Header: Topic Code and Title with Edit button */}
              <div
                className={`group px-4 py-2.5 border-b flex items-center justify-between transition-colors ${
                  isTopicTitleEdited
                    ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-100 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 mr-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold text-xs shrink-0">
                    {item.topicCode}
                  </span>
                  <span className="font-bold text-xs sm:text-sm leading-snug">
                    {item.topicTitle}
                  </span>
                  {isTopicTitleEdited && (
                    <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded shrink-0">
                      แก้ไขแล้ว
                    </span>
                  )}
                  {item.isCustom && (
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded shrink-0">
                      ประเด็นเพิ่มเติม
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  {/* Edit Topic Title */}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem({
                        itemId: item.id,
                        type: 'topic',
                        text: item.topicTitle,
                        originalText: baseline?.topicTitle || item.topicTitle,
                      })
                    }
                    className="p-1 text-slate-400 hover:text-sky-700 hover:bg-sky-50 rounded"
                    title="แก้ไขชื่อสถานการณ์ปัญหา"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {isTopicTitleEdited && (
                    <button
                      type="button"
                      onClick={() => handleRevertDefaultItem(item.id, 'topic')}
                      className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded"
                      title="คืนค่าชื่อเดิมตามเอกสาร"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {item.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomTopic(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2-Column Content */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: ข้อค้นพบ */}
                <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>ข้อค้นพบ (Findings)</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {item.findings.default.length + item.findings.groupAdded.length} รายการ
                    </span>
                  </div>

                  {/* Findings list */}
                  <div className="space-y-1.5">
                    {/* Default findings (Editable & color changes when modified) */}
                    {item.findings.default.map((finding, idx) => {
                      const origFinding = baseline?.findings.default[idx];
                      const isEdited = origFinding !== undefined && origFinding !== finding;

                      return (
                        <div
                          key={`def-${idx}`}
                          className={`group flex items-start justify-between gap-1.5 p-2 rounded-lg text-xs leading-snug border transition-all ${
                            isEdited
                              ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-400/20 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-100'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <span className="font-semibold text-slate-400 shrink-0">
                              {idx + 1}.
                            </span>
                            <div>
                              <span>{finding}</span>
                              {isEdited && (
                                <span className="ml-1.5 text-[9px] font-bold bg-amber-500 text-white px-1 py-0.1 rounded">
                                  แก้ไขแล้ว
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingItem({
                                  itemId: item.id,
                                  type: 'defaultFinding',
                                  index: idx,
                                  text: finding,
                                  originalText: origFinding || finding,
                                })
                              }
                              className="p-1 text-slate-400 hover:text-sky-700 hover:bg-white rounded transition-colors"
                              title="แก้ไขข้อความตั้งต้นนี้"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            {isEdited && (
                              <button
                                type="button"
                                onClick={() => handleRevertDefaultItem(item.id, 'defaultFinding', idx)}
                                className="p-1 text-amber-700 hover:text-amber-900 hover:bg-white rounded transition-colors"
                                title="คืนค่าข้อความเดิมตามเอกสาร"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Group added findings */}
                    {item.findings.groupAdded.map((finding, idx) => (
                      <div
                        key={`grp-${idx}`}
                        className="group flex items-start justify-between gap-1.5 p-2 rounded-lg bg-sky-50/70 border border-sky-200/70 text-xs text-sky-950"
                      >
                        <div className="flex items-start gap-1.5">
                          <span className="font-bold text-sky-700 shrink-0">
                            +{idx + 1}.
                          </span>
                          <span>{finding}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFinding(item.id, idx)}
                          className="text-sky-700/60 hover:text-rose-600 shrink-0 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Compare peer group findings */}
                    {compareGroup && compItem && compItem.findings.groupAdded.length > 0 && (
                      <div className="p-2 rounded-lg bg-purple-50 text-xs text-purple-900 border border-purple-200">
                        <span className="font-bold block mb-0.5 text-[11px]">
                          จาก {compareGroup.name}:
                        </span>
                        {compItem.findings.groupAdded.map((cf, cIdx) => (
                          <div key={cIdx} className="text-purple-800 text-[11px]">
                            • {cf}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add group finding */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={newFindingText[item.id] || ''}
                      onChange={(e) =>
                        setNewFindingText({ ...newFindingText, [item.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddFinding(item.id);
                      }}
                      placeholder={`เพิ่มข้อค้นพบของกลุ่ม ${activeGroup.code}...`}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddFinding(item.id)}
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shrink-0"
                    >
                      เพิ่ม
                    </button>
                  </div>
                </div>

                {/* Column 2: สิ่งที่ต้องพัฒนา */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>สิ่งที่ต้องพัฒนาในระยะที่ 3</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {item.developments.default.length + item.developments.groupAdded.length} รายการ
                    </span>
                  </div>

                  {/* Developments list */}
                  <div className="space-y-1.5">
                    {/* Default developments (Editable & color changes when modified) */}
                    {item.developments.default.map((dev, idx) => {
                      const origDev = baseline?.developments.default[idx];
                      const isEdited = origDev !== undefined && origDev !== dev;

                      return (
                        <div
                          key={`def-dev-${idx}`}
                          className={`group flex items-start justify-between gap-1.5 p-2 rounded-lg text-xs leading-snug border transition-all ${
                            isEdited
                              ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-400/20 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-100'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <span className="font-semibold text-slate-400 shrink-0">
                              {idx + 1}.
                            </span>
                            <div>
                              <span>{dev}</span>
                              {isEdited && (
                                <span className="ml-1.5 text-[9px] font-bold bg-amber-500 text-white px-1 py-0.1 rounded">
                                  แก้ไขแล้ว
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingItem({
                                  itemId: item.id,
                                  type: 'defaultDev',
                                  index: idx,
                                  text: dev,
                                  originalText: origDev || dev,
                                })
                              }
                              className="p-1 text-slate-400 hover:text-sky-700 hover:bg-white rounded transition-colors"
                              title="แก้ไขข้อความตั้งต้นนี้"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            {isEdited && (
                              <button
                                type="button"
                                onClick={() => handleRevertDefaultItem(item.id, 'defaultDev', idx)}
                                className="p-1 text-amber-700 hover:text-amber-900 hover:bg-white rounded transition-colors"
                                title="คืนค่าข้อความเดิมตามเอกสาร"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Group added developments */}
                    {item.developments.groupAdded.map((dev, idx) => (
                      <div
                        key={`grp-${idx}`}
                        className="group flex items-start justify-between gap-1.5 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-950"
                      >
                        <div className="flex items-start gap-1.5">
                          <span className="font-bold text-emerald-700 shrink-0">
                            +{idx + 1}.
                          </span>
                          <span>{dev}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDevelopment(item.id, idx)}
                          className="text-emerald-700/60 hover:text-rose-600 shrink-0 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Compare peer group developments */}
                    {compareGroup && compItem && compItem.developments.groupAdded.length > 0 && (
                      <div className="p-2 rounded-lg bg-purple-50 text-xs text-purple-900 border border-purple-200">
                        <span className="font-bold block mb-0.5 text-[11px]">
                          จาก {compareGroup.name}:
                        </span>
                        {compItem.developments.groupAdded.map((cd, cIdx) => (
                          <div key={cIdx} className="text-purple-800 text-[11px]">
                            • {cd}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add group development */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={newDevText[item.id] || ''}
                      onChange={(e) =>
                        setNewDevText({ ...newDevText, [item.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddDevelopment(item.id);
                      }}
                      placeholder={`เพิ่มสิ่งที่ต้องพัฒนาของกลุ่ม ${activeGroup.code}...`}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddDevelopment(item.id)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shrink-0"
                    >
                      เพิ่ม
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add T7 button */}
        <button
          type="button"
          onClick={() => setShowAddTopicModal(true)}
          className="w-full py-3 border border-dashed border-slate-300 hover:border-sky-400 bg-white hover:bg-sky-50/30 rounded-2xl text-xs font-bold text-slate-600 hover:text-sky-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสถานการณ์ปัญหาใหม่ (T{gapAnalysisList.length + 1})</span>
        </button>
      </div>

      {/* Edit Default Item / Topic Title Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>
                  {editingItem.type === 'topic'
                    ? 'แก้ไขชื่อสถานการณ์ปัญหา'
                    : editingItem.type === 'defaultFinding'
                    ? 'แก้ไขข้อค้นพบตั้งต้น'
                    : 'แก้ไขสิ่งที่ต้องพัฒนาตั้งต้น'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ปิด
              </button>
            </div>

            <form onSubmit={handleSaveEditModal} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">ข้อความ:</label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.text}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, text: e.target.value })
                  }
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 leading-snug"
                />
              </div>

              {editingItem.originalText && editingItem.originalText !== editingItem.text && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-0.5 border border-slate-100">
                  <span className="font-bold block text-slate-600">ข้อความตั้งต้นเดิม:</span>
                  <div className="italic text-slate-500 line-clamp-2">
                    {editingItem.originalText}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Topic Modal */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              เพิ่มสถานการณ์ปัญหาใหม่ (T{gapAnalysisList.length + 1})
            </h3>
            <textarea
              rows={3}
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="ระบุสถานการณ์ปัญหา..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddTopicModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleAddCustomTopic}
                disabled={!newTopicTitle.trim()}
                className="px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
