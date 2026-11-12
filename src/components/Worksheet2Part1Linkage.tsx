import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Link2, 
  Check, 
  Sparkles, 
  ArrowRight,
  Edit3,
  RotateCcw,
  Info
} from 'lucide-react';
import { ActivityLinkageItem, GroupMeta, GapAnalysisItem, ProposedProjectItem } from '../types';
import { GroupSelector } from './GroupSelector';
import { INITIAL_ACTIVITY_LINKAGES, INITIAL_GAP_ANALYSIS } from '../data/initialData';

interface Worksheet2Part1LinkageProps {
  groups: GroupMeta[];
  activeGroupId: number;
  onSelectGroup: (id: number) => void;
  linkagesList: ActivityLinkageItem[];
  onUpdateLinkages: (updated: ActivityLinkageItem[]) => void;
  gapAnalysisList: GapAnalysisItem[];
  onNavigateToPart2?: () => void;
}

interface ConnectionLine {
  problemCode: string;
  projectId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive: boolean;
}

export const Worksheet2Part1Linkage: React.FC<Worksheet2Part1LinkageProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  linkagesList,
  onUpdateLinkages,
  gapAnalysisList,
  onNavigateToPart2,
}) => {
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  
  // Find baseline initial activity
  const initialBaseline = INITIAL_ACTIVITY_LINKAGES.find(
    (a) => a.activityCode === activeGroup.code || a.id === activeGroup.code
  );

  // Find the single activity corresponding to this group
  const currentActivityIndex = linkagesList.findIndex(
    (item) => item.activityCode === activeGroup.code || item.id === activeGroup.code
  );

  const currentActivity: ActivityLinkageItem = currentActivityIndex !== -1
    ? linkagesList[currentActivityIndex]
    : {
        id: activeGroup.code,
        activityCode: activeGroup.code,
        activityTitle: activeGroup.title,
        linkedProblems: [],
        proposedProjects: [],
        projectsWithLinks: [],
      };

  // Ensure projectsWithLinks is initialized from proposedProjects if empty
  const projectsList: ProposedProjectItem[] = (currentActivity.projectsWithLinks && currentActivity.projectsWithLinks.length > 0)
    ? currentActivity.projectsWithLinks
    : (currentActivity.proposedProjects || []).map((title, idx) => ({
        id: `proj-${activeGroup.code}-${idx + 1}`,
        title,
        linkedProblemCodes: currentActivity.linkedProblems.map(p => p.split(':')[0].trim()),
      }));

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projectsList.length > 0 ? projectsList[0].id : null
  );
  const [hoveredProblemCode, setHoveredProblemCode] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [newProjectText, setNewProjectText] = useState('');

  // Modals for editing activity title and project titles
  const [editingActivityModal, setEditingActivityModal] = useState<boolean>(false);
  const [activityTitleInput, setActivityTitleInput] = useState<string>(currentActivity.activityTitle);

  const [editingProjectModal, setEditingProjectModal] = useState<{
    id: string;
    title: string;
    originalTitle: string;
  } | null>(null);

  // Refs for calculating SVG line positions
  const containerRef = useRef<HTMLDivElement>(null);
  const problemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const projectRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<ConnectionLine[]>([]);

  // Check if activity title is edited from initial baseline
  const isActivityTitleEdited =
    initialBaseline && initialBaseline.activityTitle !== currentActivity.activityTitle;

  // Calculate SVG lines between problems (left anchors) and projects (right anchors)
  const updateLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: ConnectionLine[] = [];

    projectsList.forEach((proj) => {
      const projEl = projectRefs.current[proj.id];
      if (!projEl) return;
      const projRect = projEl.getBoundingClientRect();
      // Anchor on the left edge of project card
      const x2 = projRect.left - containerRect.left;
      const y2 = projRect.top + projRect.height / 2 - containerRect.top;

      proj.linkedProblemCodes.forEach((probCode) => {
        const probEl = problemRefs.current[probCode];
        if (!probEl) return;
        const probRect = probEl.getBoundingClientRect();
        // Anchor on the right edge of problem card
        const x1 = probRect.right - containerRect.left;
        const y1 = probRect.top + probRect.height / 2 - containerRect.top;

        const isCurrentActive =
          selectedProjectId === proj.id ||
          hoveredProjectId === proj.id ||
          hoveredProblemCode === probCode;

        newLines.push({
          problemCode: probCode,
          projectId: proj.id,
          x1,
          y1,
          x2,
          y2,
          isActive: isCurrentActive,
        });
      });
    });

    setLines(newLines);
  }, [projectsList, selectedProjectId, hoveredProjectId, hoveredProblemCode]);

  useEffect(() => {
    updateLines();
    const handleResize = () => updateLines();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(updateLines, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [updateLines, projectsList, activeGroupId]);

  // Update projects list in parent state
  const handleSaveProjects = (nextProjects: ProposedProjectItem[]) => {
    const updatedLinkedProblems = Array.from(
      new Set(nextProjects.flatMap((p) => p.linkedProblemCodes))
    );

    const updatedActivity: ActivityLinkageItem = {
      ...currentActivity,
      projectsWithLinks: nextProjects,
      proposedProjects: nextProjects.map((p) => p.title),
      linkedProblems: updatedLinkedProblems,
      updatedAt: new Date().toISOString(),
    };

    let nextLinkages: ActivityLinkageItem[];
    if (currentActivityIndex !== -1) {
      nextLinkages = [...linkagesList];
      nextLinkages[currentActivityIndex] = updatedActivity;
    } else {
      nextLinkages = [...linkagesList, updatedActivity];
    }

    onUpdateLinkages(nextLinkages);
  };

  // Save edited Activity Title
  const handleSaveActivityTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitleInput.trim()) return;

    const updatedActivity: ActivityLinkageItem = {
      ...currentActivity,
      activityTitle: activityTitleInput.trim(),
      updatedAt: new Date().toISOString(),
    };

    let nextLinkages: ActivityLinkageItem[];
    if (currentActivityIndex !== -1) {
      nextLinkages = [...linkagesList];
      nextLinkages[currentActivityIndex] = updatedActivity;
    } else {
      nextLinkages = [...linkagesList, updatedActivity];
    }

    onUpdateLinkages(nextLinkages);
    setEditingActivityModal(false);
  };

  // Revert Activity Title to default
  const handleRevertActivityTitle = () => {
    if (!initialBaseline) return;
    setActivityTitleInput(initialBaseline.activityTitle);

    const updatedActivity: ActivityLinkageItem = {
      ...currentActivity,
      activityTitle: initialBaseline.activityTitle,
      updatedAt: new Date().toISOString(),
    };

    let nextLinkages: ActivityLinkageItem[];
    if (currentActivityIndex !== -1) {
      nextLinkages = [...linkagesList];
      nextLinkages[currentActivityIndex] = updatedActivity;
    } else {
      nextLinkages = [...linkagesList, updatedActivity];
    }

    onUpdateLinkages(nextLinkages);
  };

  // Toggle problem link for selected project
  const handleToggleProblem = (problemCode: string) => {
    if (!selectedProjectId) {
      if (projectsList.length > 0) {
        setSelectedProjectId(projectsList[0].id);
      }
      return;
    }

    const nextProjects = projectsList.map((p) => {
      if (p.id === selectedProjectId) {
        const exists = p.linkedProblemCodes.includes(problemCode);
        const nextCodes = exists
          ? p.linkedProblemCodes.filter((c) => c !== problemCode)
          : [...p.linkedProblemCodes, problemCode];
        return { ...p, linkedProblemCodes: nextCodes };
      }
      return p;
    });

    handleSaveProjects(nextProjects);
  };

  // Add a new project to this activity
  const handleAddProject = () => {
    const text = newProjectText.trim();
    if (!text) return;

    const newId = `proj-${activeGroup.code}-${Date.now()}`;
    const newProj: ProposedProjectItem = {
      id: newId,
      title: text,
      linkedProblemCodes: [],
    };

    const next = [...projectsList, newProj];
    handleSaveProjects(next);
    setSelectedProjectId(newId);
    setNewProjectText('');
  };

  // Save edited project title
  const handleSaveProjectTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProjectModal || !editingProjectModal.title.trim()) return;

    const nextProjects = projectsList.map((p) => {
      if (p.id === editingProjectModal.id) {
        return { ...p, title: editingProjectModal.title.trim() };
      }
      return p;
    });

    handleSaveProjects(nextProjects);
    setEditingProjectModal(null);
  };

  // Revert project title to original
  const handleRevertProjectTitle = (projId: string, origTitle: string) => {
    const nextProjects = projectsList.map((p) => {
      if (p.id === projId) {
        return { ...p, title: origTitle };
      }
      return p;
    });
    handleSaveProjects(nextProjects);
  };

  // Remove a project
  const handleDeleteProject = (projId: string) => {
    const next = projectsList.filter((p) => p.id !== projId);
    handleSaveProjects(next);
    if (selectedProjectId === projId) {
      setSelectedProjectId(next.length > 0 ? next[0].id : null);
    }
  };

  const activeProject = projectsList.find((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-4 pb-16">
      {/* Lean Header Card with Editable Activity Title */}
      <div className="soft-card p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                หน้าที่ 4
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ใบงานที่ 2 (ส่วนที่ 1)
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-md text-white shadow-xs"
                style={{ backgroundColor: activeGroup.color }}
              >
                {activeGroup.name}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>วิเคราะห์เชื่อมโยงกิจกรรมและสถานการณ์ปัญหา: {activeGroup.code}</span>
            </h2>

            {/* Editable Activity Title Display */}
            <div
              className={`group p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                isActivityTitleEdited
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-400/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="font-bold text-slate-900 shrink-0">กรอบกิจกรรม:</span>
                <span className="font-medium truncate">{currentActivity.activityTitle}</span>
                {isActivityTitleEdited && (
                  <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded shrink-0">
                    แก้ไขแล้ว
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setActivityTitleInput(currentActivity.activityTitle);
                    setEditingActivityModal(true);
                  }}
                  className="p-1 text-slate-400 hover:text-sky-700 hover:bg-white rounded transition-colors"
                  title="แก้ไขข้อความกรอบกิจกรรมนี้"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {isActivityTitleEdited && (
                  <button
                    type="button"
                    onClick={handleRevertActivityTitle}
                    className="p-1 text-amber-700 hover:text-amber-900 hover:bg-white rounded transition-colors"
                    title="คืนค่ากรอบกิจกรรมเดิมตามเอกสาร"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Group Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">สลับกลุ่ม:</span>
            <GroupSelector
              groups={groups}
              activeGroupId={activeGroupId}
              onSelectGroup={(id) => {
                onSelectGroup(id);
                setSelectedProjectId(null);
              }}
            />
          </div>
        </div>

        {/* Lean Instructions Bar */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>วิธีโยงเส้น:</strong> คลิกเลือก <strong>"โครงการ"</strong> ทางขวา แล้วคลิก <strong>"สถานการณ์ปัญหา (T)"</strong> ทางซ้ายเพื่อโยงเส้นว่าโครงการนี้แก้ปัญหาใด (สามารถคลิกแก้ไขชื่อโครงการหรือกรอบกิจกรรมได้ หากแก้ไขจะแสดงเป็นสีเหลือง/ส้ม)
            </span>
          </div>
          {onNavigateToPart2 && (
            <button
              type="button"
              onClick={onNavigateToPart2}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 shrink-0"
            >
              <span>ไปส่วนที่ 2</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Linkage Diagram Canvas with SVG Connection Lines */}
      <div
        ref={containerRef}
        className="relative soft-card rounded-2xl bg-white border border-slate-200/90 p-5 overflow-hidden"
      >
        {/* SVG Drawing Canvas Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="lineGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="1" />
              <stop offset="100%" stopColor="#d946ef" stopOpacity="1" />
            </linearGradient>
          </defs>

          {lines.map((line, idx) => {
            const deltaX = Math.abs(line.x2 - line.x1) * 0.5;
            const pathData = `M ${line.x1} ${line.y1} C ${line.x1 + deltaX} ${line.y1}, ${line.x2 - deltaX} ${line.y2}, ${line.x2} ${line.y2}`;

            return (
              <g key={`${line.problemCode}-${line.projectId}-${idx}`}>
                {line.isActive && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke={activeGroup.color || '#3b82f6'}
                    strokeWidth={5}
                    strokeOpacity={0.25}
                    strokeLinecap="round"
                  />
                )}
                <path
                  d={pathData}
                  fill="none"
                  stroke={line.isActive ? activeGroup.color || '#2563eb' : '#cbd5e1'}
                  strokeWidth={line.isActive ? 2.5 : 1.5}
                  strokeDasharray={line.isActive ? 'none' : '4 3'}
                  strokeOpacity={line.isActive ? 0.95 : 0.6}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
                <circle
                  cx={line.x1}
                  cy={line.y1}
                  r={line.isActive ? 4 : 3}
                  fill={line.isActive ? activeGroup.color : '#94a3b8'}
                />
                <circle
                  cx={line.x2}
                  cy={line.y2}
                  r={line.isActive ? 4 : 3}
                  fill={line.isActive ? activeGroup.color : '#94a3b8'}
                />
              </g>
            );
          })}
        </svg>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
          {/* Left Column (5 Cols): รายการสถานการณ์ปัญหา (T) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                สถานการณ์ปัญหา (Topics: T)
              </span>
              <span className="text-[11px] text-slate-400">
                {activeProject ? 'คลิกเพื่อเชื่อม/ยกเลิก' : 'คลิกเลือกปัญหา'}
              </span>
            </div>

            <div className="space-y-2.5">
              {gapAnalysisList.map((item) => {
                const isLinkedToActive = activeProject
                  ? activeProject.linkedProblemCodes.includes(item.topicCode)
                  : false;

                const origBaseline = INITIAL_GAP_ANALYSIS.find((t) => t.id === item.id);
                const isProblemTitleEdited = origBaseline && origBaseline.topicTitle !== item.topicTitle;

                const linkedProjectsCount = projectsList.filter((p) =>
                  p.linkedProblemCodes.includes(item.topicCode)
                ).length;

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      problemRefs.current[item.topicCode] = el;
                    }}
                    onClick={() => handleToggleProblem(item.topicCode)}
                    onMouseEnter={() => {
                      setHoveredProblemCode(item.topicCode);
                      updateLines();
                    }}
                    onMouseLeave={() => {
                      setHoveredProblemCode(null);
                      updateLines();
                    }}
                    className={`group relative p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isLinkedToActive
                        ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30 shadow-xs'
                        : isProblemTitleEdited
                        ? 'bg-amber-50/40 border-amber-200 text-slate-800'
                        : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[11px] shrink-0 ${
                            isLinkedToActive
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.topicCode}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 leading-snug flex items-center gap-1.5 flex-wrap">
                            <span>{item.topicTitle}</span>
                            {isProblemTitleEdited && (
                              <span className="text-[9px] font-bold bg-amber-500 text-white px-1 py-0.1 rounded">
                                ปรับแก้
                              </span>
                            )}
                          </div>
                          {item.findings.default.length > 0 && (
                            <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                              • {item.findings.default[0]}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {linkedProjectsCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-600">
                            {linkedProjectsCount} โครงการ
                          </span>
                        )}
                        <span
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                            isLinkedToActive
                              ? 'bg-amber-500 text-white'
                              : 'border border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spacer Column in Desktop (2 Cols for clean line visibility) */}
          <div className="hidden lg:flex lg:col-span-2 items-center justify-center flex-col text-center px-1">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <Link2 className="w-4 h-4 mx-auto text-slate-400" />
              <div className="font-semibold">เส้นโยงความสัมพันธ์</div>
              <div className="text-[10px] text-slate-400">
                {lines.length} จุดเชื่อมโยง
              </div>
            </div>
          </div>

          {/* Right Column (5 Cols): โครงการที่จะดำเนินการ (Projects) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeGroup.color }}
                />
                โครงการที่จะดำเนินการ ({activeGroup.code})
              </span>
              <span className="text-[11px] text-slate-400">
                {projectsList.length} โครงการ
              </span>
            </div>

            {/* List of Projects */}
            <div className="space-y-2.5">
              {projectsList.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400">
                  ยังไม่มีโครงการภายใต้กิจกรรม {activeGroup.code}
                  <br />
                  พิมพ์ชื่อโครงการและคลิกเพิ่มด้านล่าง
                </div>
              ) : (
                projectsList.map((proj, idx) => {
                  const isSelected = selectedProjectId === proj.id;

                  // Check if project was in initial baseline and whether it was modified
                  const origProj = initialBaseline?.projectsWithLinks?.find((p) => p.id === proj.id);
                  const isProjectEdited = origProj && origProj.title !== proj.title;

                  return (
                    <div
                      key={proj.id}
                      ref={(el) => {
                        projectRefs.current[proj.id] = el;
                      }}
                      onClick={() => {
                        setSelectedProjectId(proj.id);
                        updateLines();
                      }}
                      onMouseEnter={() => {
                        setHoveredProjectId(proj.id);
                        updateLines();
                      }}
                      onMouseLeave={() => {
                        setHoveredProjectId(null);
                        updateLines();
                      }}
                      className={`group relative p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-sky-50/90 border-sky-300 ring-2 ring-sky-400/30 shadow-xs'
                          : isProjectEdited
                          ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-400/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 flex-1 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-400 text-xs">
                              {idx + 1}.
                            </span>
                            <span className="font-bold text-slate-900 leading-snug">
                              {proj.title}
                            </span>
                            {isProjectEdited && (
                              <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded">
                                แก้ไขแล้ว
                              </span>
                            )}
                          </div>

                          {/* Connected Problem Badges */}
                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium">
                              แก้ปัญหา:
                            </span>
                            {proj.linkedProblemCodes.length === 0 ? (
                              <span className="text-[10px] text-rose-500 italic">
                                ยังไม่ระบุปัญหาที่แก้ (คลิกที่ปัญหาทางซ้ายเพื่อโยงเส้น)
                              </span>
                            ) : (
                              proj.linkedProblemCodes.map((code) => (
                                <span
                                  key={code}
                                  className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200"
                                >
                                  {code}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Actions: Edit, Revert, Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isSelected && (
                            <span className="text-[10px] font-bold bg-sky-600 text-white px-1.5 py-0.5 rounded-md">
                              เลือกอยู่
                            </span>
                          )}

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            {/* Edit Project Title */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProjectModal({
                                  id: proj.id,
                                  title: proj.title,
                                  originalTitle: origProj?.title || proj.title,
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-sky-700 hover:bg-white rounded transition-colors"
                              title="แก้ไขชื่อโครงการนี้"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Revert Project Title if edited */}
                            {isProjectEdited && origProj && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRevertProjectTitle(proj.id, origProj.title);
                                }}
                                className="p-1 text-amber-700 hover:text-amber-900 hover:bg-white rounded transition-colors"
                                title="คืนค่าชื่อโครงการเดิมตามเอกสาร"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete Project */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(proj.id);
                              }}
                              className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="ลบโครงการนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input to Add Project */}
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newProjectText}
                  onChange={(e) => setNewProjectText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddProject();
                  }}
                  placeholder={`ระบุชื่อโครงการสำหรับกลุ่ม ${activeGroup.code}...`}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddProject}
                  disabled={!newProjectText.trim()}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shrink-0 shadow-xs"
                >
                  เพิ่มโครงการ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Activity Title Modal */}
      {editingActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-sky-600" />
                <span>แก้ไขกรอบกิจกรรม ({activeGroup.code})</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingActivityModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ปิด
              </button>
            </div>

            <form onSubmit={handleSaveActivityTitle} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">ชื่อกิจกรรม:</label>
                <textarea
                  rows={3}
                  required
                  value={activityTitleInput}
                  onChange={(e) => setActivityTitleInput(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 leading-snug"
                />
              </div>

              {initialBaseline && initialBaseline.activityTitle !== activityTitleInput && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-0.5 border border-slate-100">
                  <span className="font-bold block text-slate-600">ข้อความตั้งต้นเดิมตามเอกสาร:</span>
                  <div className="italic text-slate-500 line-clamp-2">
                    {initialBaseline.activityTitle}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingActivityModal(false)}
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Title Modal */}
      {editingProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>แก้ไขชื่อโครงการ</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingProjectModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ปิด
              </button>
            </div>

            <form onSubmit={handleSaveProjectTitle} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">ชื่อโครงการ/กิจกรรม:</label>
                <textarea
                  rows={3}
                  required
                  value={editingProjectModal.title}
                  onChange={(e) =>
                    setEditingProjectModal({ ...editingProjectModal, title: e.target.value })
                  }
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 leading-snug"
                />
              </div>

              {editingProjectModal.originalTitle && editingProjectModal.originalTitle !== editingProjectModal.title && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-0.5 border border-slate-100">
                  <span className="font-bold block text-slate-600">ชื่อเดิมตั้งต้น:</span>
                  <div className="italic text-slate-500 line-clamp-2">
                    {editingProjectModal.originalTitle}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProjectModal(null)}
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
    </div>
  );
};
