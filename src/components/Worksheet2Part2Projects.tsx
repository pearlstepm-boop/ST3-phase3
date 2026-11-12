import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  Check, 
  Search,
} from 'lucide-react';
import { ProjectProposalItem, GroupMeta, ActivityLinkageItem, LogicModelNode } from '../types';
import { GroupSelector } from './GroupSelector';
import { LOGIC_MODEL_DATA } from '../data/initialData';

interface Worksheet2Part2ProjectsProps {
  groups: GroupMeta[];
  activeGroupId: number;
  onSelectGroup: (id: number) => void;
  projects: ProjectProposalItem[];
  onUpdateProjects: (updated: ProjectProposalItem[]) => void;
  linkagesList: ActivityLinkageItem[];
  availableOutputs?: LogicModelNode[];
}

export const Worksheet2Part2Projects: React.FC<Worksheet2Part2ProjectsProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  projects,
  onUpdateProjects,
  linkagesList,
  availableOutputs = LOGIC_MODEL_DATA.outputs,
}) => {
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const [filterActivity, setFilterActivity] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectProposalItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const createEmptyProject = (activityCode: string = activeGroup.code || 'A1'): ProjectProposalItem => ({
    id: `proj-${Date.now()}`,
    no: projects.length + 1,
    activityCode,
    projectName: '',
    status: {
      hasExistingPlan: false,
      needsImprovement: false,
      integratedWith: '',
      isNewProject: true,
    },
    expectedOutput: `O${activityCode.replace('A', '') || '1'}: มีมาตรฐาน แนวทาง และกลไกกำกับติดตามที่ชัดเจน`,
    years: {
      y2571: true,
      y2572: false,
      y2573: false,
      y2574: false,
      y2575: false,
    },
    budget: {
      amount: '',
      source: '',
    },
    primaryAgency: activeGroup.title || '',
    secondaryAgency: '',
    groupId: activeGroupId,
    updatedAt: new Date().toISOString(),
  });

  const [formData, setFormData] = useState<ProjectProposalItem>(createEmptyProject());

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData(createEmptyProject(activeGroup.code || 'A1'));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: ProjectProposalItem) => {
    setEditingProject(proj);
    setFormData(JSON.parse(JSON.stringify(proj)));
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName.trim()) return;

    if (editingProject) {
      const updated = projects.map((p) =>
        p.id === editingProject.id
          ? { ...formData, updatedAt: new Date().toISOString() }
          : p
      );
      onUpdateProjects(updated);
    } else {
      const nextNo = projects.filter((p) => p.groupId === activeGroupId).length + 1;
      const newProj = {
        ...formData,
        id: `proj-${Date.now()}`,
        no: nextNo,
        groupId: activeGroupId,
        updatedAt: new Date().toISOString(),
      };
      onUpdateProjects([...projects, newProj]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    onUpdateProjects(projects.filter((p) => p.id !== id));
  };

  const filteredProjects = projects.filter((p) => {
    const matchGroup = p.groupId === activeGroupId;
    const matchActivity = filterActivity === 'ALL' || p.activityCode === filterActivity;
    const matchSearch =
      !searchQuery ||
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.expectedOutput.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.primaryAgency.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGroup && matchActivity && matchSearch;
  });

  const groupTotalBudget = filteredProjects.reduce((sum, p) => {
    const val = parseFloat((p.budget.amount || '0').replace(/,/g, ''));
    return isNaN(val) ? sum : sum + val;
  }, 0);

  return (
    <div className="space-y-4 pb-16">
      {/* Lean Header */}
      <div className="soft-card p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                หน้าที่ 5
              </span>
              <span className="text-xs font-semibold text-slate-500">ใบงานที่ 2 (ส่วนที่ 2)</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-md text-white shadow-xs"
                style={{ backgroundColor: activeGroup.color }}
              >
                {activeGroup.name}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              กำหนดแนวทางและข้อเสนอโครงการภายใต้กิจกรรม {activeGroup.code}
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

        {/* Action Controls */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-xs text-slate-500 font-semibold mr-1">กิจกรรม:</span>
            <button
              type="button"
              onClick={() => setFilterActivity('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterActivity === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด
            </button>
            {linkagesList.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => setFilterActivity(link.activityCode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterActivity === link.activityCode
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {link.activityCode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-40 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาโครงการ..."
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มโครงการ</span>
            </button>
          </div>
        </div>

        {/* Stats summary banner */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <span>{activeGroup.name} เสนอแล้ว: <strong>{filteredProjects.length} โครงการ</strong></span>
          <span>งบประมาณรวม: <strong>{groupTotalBudget > 0 ? groupTotalBudget.toLocaleString('th-TH') : '0'} บาท</strong></span>
        </div>
      </div>

      {/* Projects Table */}
      <div className="soft-card rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-2.5 px-3 w-10 text-center">ลำดับ</th>
                <th className="py-2.5 px-3 w-16">กิจกรรม</th>
                <th className="py-2.5 px-3 min-w-[200px]">โครงการ / กิจกรรม</th>
                <th className="py-2.5 px-3 min-w-[150px]">สถานะดำเนินการ</th>
                <th className="py-2.5 px-3 min-w-[160px]">ผลผลิตที่คาดว่าจะได้รับ (O)</th>
                <th className="py-2.5 px-3 text-center min-w-[130px]">ปีดำเนินการ</th>
                <th className="py-2.5 px-3 min-w-[130px]">งบประมาณ</th>
                <th className="py-2.5 px-3 min-w-[110px]">หน่วยงานหลัก</th>
                <th className="py-2.5 px-3 min-w-[110px]">หน่วยงานรอง</th>
                <th className="py-2.5 px-2 text-center w-16">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    <div className="text-xs">
                      ยังไม่มีข้อเสนอโครงการสำหรับ {activeGroup.name}
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="text-xs text-sky-600 font-bold hover:underline mt-1"
                    >
                      + เพิ่มข้อเสนอโครงการ
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p, index) => (
                  <tr key={p.id} className="group hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {p.activityCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 leading-snug">
                      {p.projectName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 text-[11px] space-y-0.5">
                      {p.status.hasExistingPlan && <div className="text-emerald-700 font-medium">✓ มีแผนอยู่แล้ว</div>}
                      {p.status.needsImprovement && <div className="text-amber-700 font-medium">✓ ต้องปรับปรุง</div>}
                      {p.status.integratedWith && <div className="text-indigo-700">✓ บูรณาการ: {p.status.integratedWith}</div>}
                      {p.status.isNewProject && <div className="text-sky-700 font-bold">✓ โครงการใหม่</div>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 text-[11px] leading-snug">
                      {p.expectedOutput}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono">
                        {['2571', '2572', '2573', '2574', '2575'].map((yr) => {
                          const key = `y${yr}` as keyof typeof p.years;
                          const active = p.years[key];
                          return (
                            <span
                              key={yr}
                              className={`text-[10px] px-1 py-0.2 rounded ${
                                active ? 'bg-slate-900 text-white font-bold' : 'text-slate-300'
                              }`}
                            >
                              {yr.slice(2)}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">
                        {p.budget.amount ? `${p.budget.amount} บ.` : '-'}
                      </div>
                      {p.budget.source && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                          {p.budget.source}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 text-[11px]">
                      {p.primaryAgency || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {p.secondaryAgency || '-'}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="แก้ไขโครงการ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="ลบโครงการ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-xl border border-slate-100 space-y-3.5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingProject ? 'แก้ไขโครงการ' : 'เพิ่มข้อเสนอโครงการใหม่'} ({activeGroup.name})
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ปิด
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">กิจกรรม (A):</label>
                  <select
                    value={formData.activityCode}
                    onChange={(e) => setFormData({ ...formData, activityCode: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    {linkagesList.map((l) => (
                      <option key={l.id} value={l.activityCode}>
                        {l.activityCode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="font-bold text-slate-700">ชื่อโครงการ/กิจกรรม:</label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="ระบุชื่อโครงการ..."
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <label className="font-bold text-slate-800 block text-[11px]">สถานะดำเนินการ:</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.status.hasExistingPlan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: { ...formData.status, hasExistingPlan: e.target.checked },
                        })
                      }
                      className="rounded text-sky-600"
                    />
                    <span>มีแผนอยู่แล้ว</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.status.needsImprovement}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: { ...formData.status, needsImprovement: e.target.checked },
                        })
                      }
                      className="rounded text-sky-600"
                    />
                    <span>ต้องปรับปรุง</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.status.isNewProject}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: { ...formData.status, isNewProject: e.target.checked },
                        })
                      }
                      className="rounded text-sky-600"
                    />
                    <span>โครงการใหม่</span>
                  </label>
                  <input
                    type="text"
                    value={formData.status.integratedWith}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: { ...formData.status, integratedWith: e.target.value },
                      })
                    }
                    placeholder="บูรณาการร่วมกับ..."
                    className="p-1 text-xs rounded border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Row 3: Output O (Dropdown with available O options + editable input) */}
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-[11px]">
                    ผลผลิตที่คาดว่าจะได้รับ (O):
                  </label>
                  <span className="text-[11px] text-slate-400">
                    เลือกจากผลผลิตในระบบ หรือพิมพ์ระบุเอง
                  </span>
                </div>

                {/* Dropdown to pick directly from O */}
                <select
                  value={
                    availableOutputs.some((o) => `${o.code}: ${o.title}` === formData.expectedOutput)
                      ? formData.expectedOutput
                      : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData({ ...formData, expectedOutput: e.target.value });
                    }
                  }}
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">-- เลือกจากตัวเลือกผลผลิต (O1–O{availableOutputs.length}) --</option>
                  {availableOutputs.map((o) => (
                    <option key={o.code} value={`${o.code}: ${o.title}`}>
                      {o.code}: {o.title}
                    </option>
                  ))}
                </select>

                {/* Editable input to modify or type custom text */}
                <input
                  type="text"
                  required
                  value={formData.expectedOutput}
                  onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                  placeholder="พิมพ์ข้อความผลผลิต (O) เพิ่มเติม หรือแก้ไขข้อความได้ที่นี่..."
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Years */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <label className="font-bold text-slate-800 block text-[11px]">
                  ปีที่ดำเนินการ (2571–2575):
                </label>
                <div className="flex items-center gap-3">
                  {(['2571', '2572', '2573', '2574', '2575'] as const).map((yr) => {
                    const key = `y${yr}` as keyof typeof formData.years;
                    return (
                      <label key={yr} className="flex items-center gap-1 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={formData.years[key]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              years: { ...formData.years, [key]: e.target.checked },
                            })
                          }
                          className="rounded text-sky-600"
                        />
                        <span>{yr}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">งบประมาณ (บาท):</label>
                  <input
                    type="text"
                    value={formData.budget.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: { ...formData.budget, amount: e.target.value },
                      })
                    }
                    placeholder="เช่น 1,500,000"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">แหล่งงบประมาณ:</label>
                  <input
                    type="text"
                    value={formData.budget.source}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: { ...formData.budget, source: e.target.value },
                      })
                    }
                    placeholder="เช่น งบประมาณแผ่นดิน / สสส."
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Agencies */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">หน่วยงานหลัก:</label>
                  <input
                    type="text"
                    value={formData.primaryAgency}
                    onChange={(e) => setFormData({ ...formData, primaryAgency: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">หน่วยงานรอง:</label>
                  <input
                    type="text"
                    value={formData.secondaryAgency}
                    onChange={(e) => setFormData({ ...formData, secondaryAgency: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                >
                  บันทึกโครงการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
