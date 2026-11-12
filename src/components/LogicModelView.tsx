import React, { useState } from 'react';
import { 
  ArrowRight, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { LOGIC_MODEL_DATA, STRATEGY_INFO } from '../data/initialData';
import { LogicModelData, LogicModelNode } from '../types';

interface LogicModelViewProps {
  logicModelData?: LogicModelData;
  onUpdateLogicModelData?: (data: LogicModelData) => void;
}

type ColumnKey = 'topics' | 'inputs' | 'activities' | 'outputs' | 'shortTerm' | 'intermediate' | 'impact';

export const LogicModelView: React.FC<LogicModelViewProps> = ({
  logicModelData = LOGIC_MODEL_DATA,
  onUpdateLogicModelData,
}) => {
  const [data, setData] = useState<LogicModelData>(logicModelData);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state for Add/Edit node
  const [editingNode, setEditingNode] = useState<{
    columnKey: ColumnKey;
    node: LogicModelNode;
    isNew: boolean;
    index?: number;
  } | null>(null);

  // Sync internal state if prop updates
  React.useEffect(() => {
    setData(logicModelData);
  }, [logicModelData]);

  const handleSaveData = (newData: LogicModelData) => {
    setData(newData);
    if (onUpdateLogicModelData) {
      onUpdateLogicModelData(newData);
    }
  };

  const columns: {
    key: ColumnKey;
    label: string;
    sublabel: string;
    codePrefix: string;
    category: LogicModelNode['category'];
    color: string;
    headerBg: string;
    badgeBg: string;
    items: LogicModelNode[];
  }[] = [
    {
      key: 'topics',
      label: 'สถานการณ์ปัญหา',
      sublabel: 'TOPICS: T',
      codePrefix: 'T',
      category: 'TOPICS',
      color: 'bg-slate-50 text-slate-800 border-slate-200',
      headerBg: 'bg-slate-700 text-white',
      badgeBg: 'bg-slate-200 text-slate-800',
      items: data.topics,
    },
    {
      key: 'inputs',
      label: 'ปัจจัยนำเข้า',
      sublabel: 'INPUTS: I',
      codePrefix: 'I',
      category: 'INPUTS',
      color: 'bg-sky-50/50 text-slate-800 border-sky-200/60',
      headerBg: 'bg-sky-800 text-white',
      badgeBg: 'bg-sky-100 text-sky-800',
      items: data.inputs,
    },
    {
      key: 'activities',
      label: 'กิจกรรม',
      sublabel: 'ACTIVITIES: A',
      codePrefix: 'A',
      category: 'ACTIVITIES',
      color: 'bg-indigo-50/50 text-slate-800 border-indigo-200/60',
      headerBg: 'bg-indigo-800 text-white',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      items: data.activities,
    },
    {
      key: 'outputs',
      label: 'ผลผลิต',
      sublabel: 'OUTPUTS: O',
      codePrefix: 'O',
      category: 'OUTPUTS',
      color: 'bg-teal-50/50 text-slate-800 border-teal-200/60',
      headerBg: 'bg-teal-800 text-white',
      badgeBg: 'bg-teal-100 text-teal-800',
      items: data.outputs,
    },
    {
      key: 'shortTerm',
      label: 'ผลลัพธ์ระยะสั้น',
      sublabel: 'SHORT-TERM: S',
      codePrefix: 'S',
      category: 'SHORT-TERM',
      color: 'bg-emerald-50/50 text-slate-800 border-emerald-200/60',
      headerBg: 'bg-emerald-800 text-white',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      items: data.shortTerm,
    },
    {
      key: 'intermediate',
      label: 'ผลลัพธ์ระยะกลาง',
      sublabel: 'INTERMEDIATE: M',
      codePrefix: 'M',
      category: 'INTERMEDIATE',
      color: 'bg-amber-50/50 text-slate-800 border-amber-200/60',
      headerBg: 'bg-amber-800 text-white',
      badgeBg: 'bg-amber-100 text-amber-800',
      items: data.intermediate,
    },
    {
      key: 'impact',
      label: 'ผลกระทบ',
      sublabel: 'IMPACT: IM',
      codePrefix: 'IM',
      category: 'IMPACT',
      color: 'bg-rose-50/50 text-slate-800 border-rose-200/60',
      headerBg: 'bg-rose-800 text-white',
      badgeBg: 'bg-rose-100 text-rose-800',
      items: data.impact,
    },
  ];

  // Open Edit Node Modal
  const handleOpenEdit = (columnKey: ColumnKey, node: LogicModelNode, index: number) => {
    setEditingNode({
      columnKey,
      node: { ...node },
      isNew: false,
      index,
    });
  };

  // Open Add Node Modal
  const handleOpenAdd = (columnKey: ColumnKey, codePrefix: string, category: LogicModelNode['category']) => {
    const nextNum = data[columnKey].length + 1;
    setEditingNode({
      columnKey,
      node: {
        code: `${codePrefix}${nextNum}`,
        title: '',
        category,
      },
      isNew: true,
    });
  };

  // Save Add/Edit Node
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode || !editingNode.node.title.trim()) return;

    const { columnKey, node, isNew, index } = editingNode;
    const currentList = [...data[columnKey]];

    if (isNew) {
      currentList.push(node);
    } else if (index !== undefined && index >= 0) {
      currentList[index] = node;
    }

    const nextData = {
      ...data,
      [columnKey]: currentList,
    };

    handleSaveData(nextData);
    setEditingNode(null);
  };

  // Delete Node
  const handleDeleteNode = (columnKey: ColumnKey, index: number) => {
    const currentList = [...data[columnKey]];
    currentList.splice(index, 1);
    const nextData = {
      ...data,
      [columnKey]: currentList,
    };
    handleSaveData(nextData);
  };

  // Reset to initial PDF values
  const handleResetToDefault = () => {
    if (window.confirm('คุณต้องการคืนค่า Logic Model กลับเป็นค่าตั้งต้นตามเอกสารใช่หรือไม่?')) {
      handleSaveData(JSON.parse(JSON.stringify(LOGIC_MODEL_DATA)));
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Lean Header with Edit and Reset Controls */}
      <div className="soft-card p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                หน้าที่ 2
              </span>
              <span className="text-xs font-semibold text-slate-500">กรอบแนวคิดยุทธศาสตร์</span>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                สามารถคลิกแก้ไขได้
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              Logic Model: {STRATEGY_INFO.strategyName}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              <strong>เป้าหมายกลยุทธ์:</strong> {STRATEGY_INFO.strategyGoal}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-44 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาใน Logic Model..."
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <button
              type="button"
              onClick={handleResetToDefault}
              title="คืนค่าตั้งต้นตามเอกสาร"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">คืนค่าเดิม</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <span>
            💡 คุณสามารถคลิกไอคอนดินสอ <Edit3 className="w-3 h-3 inline text-slate-400 mx-0.5" /> บนการ์ดใดก็ได้เพื่อแก้ไขข้อความ หรือกดปุ่ม <strong>"+ เพิ่ม"</strong> ด้านล่างของแต่ละแถว
          </span>
          <span className="text-slate-400 font-mono">
            {Object.values(data).reduce((acc, arr) => acc + arr.length, 0)} รายการทั้งหมด
          </span>
        </div>
      </div>

      {/* Logic Model Diagram Flow */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[1200px] space-y-3">
          {/* Column Headers */}
          <div className="grid grid-cols-7 gap-2.5">
            {columns.map((col, index) => (
              <div key={col.key} className="relative">
                <div
                  className={`rounded-xl p-2.5 text-center shadow-xs ${col.headerBg} flex flex-col justify-center min-h-[58px]`}
                >
                  <div className="text-xs font-bold">{col.label}</div>
                  <div className="text-[10px] opacity-80 font-mono mt-0.5">{col.sublabel}</div>
                </div>

                {index < columns.length - 1 && (
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cards Columns */}
          <div className="grid grid-cols-7 gap-2.5 items-start">
            {columns.map((col) => (
              <div key={col.key} className="space-y-2">
                {col.items
                  .map((item, originalIndex) => ({ item, originalIndex }))
                  .filter(({ item }) =>
                    searchTerm
                      ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.code.toLowerCase().includes(searchTerm.toLowerCase())
                      : true
                  )
                  .map(({ item, originalIndex }) => {
                    const baselineItems = LOGIC_MODEL_DATA[col.key];
                    const origItem = baselineItems.find((b) => b.code === item.code);
                    const isNew = !origItem;
                    const isEdited = origItem && origItem.title !== item.title;

                    return (
                      <div
                        key={`${item.code}-${originalIndex}`}
                        className={`group relative rounded-xl p-2.5 border transition-all text-left ${
                          isEdited
                            ? 'bg-amber-50/95 border-amber-300 text-amber-950 ring-1 ring-amber-400/20 shadow-xs'
                            : isNew
                            ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950 ring-1 ring-emerald-400/20 shadow-xs'
                            : `bg-white hover:border-slate-300 ${col.color}`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[11px] font-bold px-1.5 py-0.2 rounded-md ${
                                isEdited
                                  ? 'bg-amber-200 text-amber-900 font-mono'
                                  : isNew
                                  ? 'bg-emerald-200 text-emerald-900 font-mono'
                                  : col.badgeBg
                              }`}
                            >
                              {item.code}
                            </span>
                            {isEdited && (
                              <span className="text-[9px] font-bold bg-amber-500 text-white px-1 py-0.1 rounded">
                                แก้ไขแล้ว
                              </span>
                            )}
                            {isNew && (
                              <span className="text-[9px] font-bold bg-emerald-600 text-white px-1 py-0.1 rounded">
                                เพิ่มใหม่
                              </span>
                            )}
                          </div>

                          {/* Edit / Delete Buttons: hidden until hovered */}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(col.key, item, originalIndex)}
                              className="p-1 text-slate-400 hover:text-sky-700 hover:bg-white rounded transition-colors"
                              title="แก้ไขข้อความ"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNode(col.key, originalIndex)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                              title="ลบรายการนี้"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-800 leading-snug font-normal">
                          {item.title}
                        </p>
                      </div>
                    );
                  })}

                {/* Add Button for this column */}
                <button
                  type="button"
                  onClick={() => handleOpenAdd(col.key, col.codePrefix, col.category)}
                  className="w-full py-2 border border-dashed border-slate-300 hover:border-sky-400 bg-white/70 hover:bg-sky-50/40 rounded-xl text-xs font-semibold text-slate-500 hover:text-sky-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่ม {col.codePrefix}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingNode.isNew ? 'เพิ่มรายการใหม่ใน Logic Model' : 'แก้ไขรายการใน Logic Model'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingNode(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ปิด
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">รหัสย่อ:</label>
                  <input
                    type="text"
                    required
                    value={editingNode.node.code}
                    onChange={(e) =>
                      setEditingNode({
                        ...editingNode,
                        node: { ...editingNode.node, code: e.target.value },
                      })
                    }
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">หมวดหมู่:</label>
                  <div className="p-2 bg-slate-100 rounded-xl font-medium text-slate-600">
                    {editingNode.node.category}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">ข้อความ / รายละเอียด:</label>
                <textarea
                  rows={4}
                  required
                  value={editingNode.node.title}
                  onChange={(e) =>
                    setEditingNode({
                      ...editingNode,
                      node: { ...editingNode.node, title: e.target.value },
                    })
                  }
                  placeholder="พิมพ์ข้อความของประเด็นนี้..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 leading-snug"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingNode(null)}
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
