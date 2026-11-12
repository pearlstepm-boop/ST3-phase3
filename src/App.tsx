import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TabKey, 
  GroupMeta, 
  GapAnalysisItem, 
  ActivityLinkageItem, 
  ProjectProposalItem, 
  GroupRecommendation, 
  SheetSyncConfig, 
  OrgAccessConfig, 
  UserProfile,
  LogicModelData 
} from './types';
import { 
  loadGroups, 
  saveGroups, 
  loadActiveGroupId, 
  saveActiveGroupId, 
  loadGapAnalysisByGroup, 
  saveGapAnalysisByGroup, 
  loadLinkagesByGroup, 
  saveLinkagesByGroup, 
  loadProjects, 
  saveProjects, 
  loadRecommendationsByGroup, 
  saveRecommendationsByGroup, 
  loadSheetConfig, 
  saveSheetConfig, 
  loadOrgConfig, 
  saveOrgConfig,
  loadLogicModelData,
  saveLogicModelData,
  subscribeToRealtimeBroadcast 
} from './services/storage';
import { 
  subscribeToAuth, 
  signInWithGoogle, 
  logOutGoogle, 
  checkOrgAuthorization, 
  getCachedAccessToken,
  setCachedAccessToken 
} from './services/googleAuth';
import { 
  createWorkshopSpreadsheet, 
  syncToGoogleSheet 
} from './services/googleSheets';

import { Header } from './components/Header';
import { TabNav } from './components/TabNav';
import { SummaryDashboard } from './components/SummaryDashboard';
import { LogicModelView } from './components/LogicModelView';
import { Worksheet1GapAnalysis } from './components/Worksheet1GapAnalysis';
import { Worksheet2Part1Linkage } from './components/Worksheet2Part1Linkage';
import { Worksheet2Part2Projects } from './components/Worksheet2Part2Projects';
import { WorksheetRecommendations } from './components/WorksheetRecommendations';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { OrgAuthModal } from './components/OrgAuthModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [activeGroupId, setActiveGroupId] = useState<number>(() => loadActiveGroupId());
  const [isAllGroupsView, setIsAllGroupsView] = useState<boolean>(false);

  // Data states
  const [groups, setGroups] = useState<GroupMeta[]>(() => loadGroups());
  const [logicModelData, setLogicModelData] = useState<LogicModelData>(() => loadLogicModelData());
  const [gapAnalysisByGroup, setGapAnalysisByGroup] = useState<Record<number, GapAnalysisItem[]>>(() => loadGapAnalysisByGroup());
  const [linkagesByGroup, setLinkagesByGroup] = useState<Record<number, ActivityLinkageItem[]>>(() => loadLinkagesByGroup());
  const [projects, setProjects] = useState<ProjectProposalItem[]>(() => loadProjects());
  const [recommendationsByGroup, setRecommendationsByGroup] = useState<Record<number, GroupRecommendation>>(() => loadRecommendationsByGroup());

  // Configuration states
  const [sheetConfig, setSheetConfig] = useState<SheetSyncConfig>(() => loadSheetConfig());
  const [orgConfig, setOrgConfig] = useState<OrgAccessConfig>(() => loadOrgConfig());

  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => getCachedAccessToken());

  // UI Modal states
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Syncing states
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Debounced Auto-sync ref
  const autoSyncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user, token) => {
      setAccessToken(token);
      if (user) {
        const isAuthorized = checkOrgAuthorization(user.email, orgConfig);
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
          photoURL: user.photoURL || undefined,
          isOrgAuthorized: isAuthorized,
          role: 'facilitator',
        };
        setCurrentUser(userProfile);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, [orgConfig]);

  // 2. Real-time Multi-tab synchronization
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeBroadcast(() => {
      setGroups(loadGroups());
      setLogicModelData(loadLogicModelData());
      setGapAnalysisByGroup(loadGapAnalysisByGroup());
      setLinkagesByGroup(loadLinkagesByGroup());
      setProjects(loadProjects());
      setRecommendationsByGroup(loadRecommendationsByGroup());
    });

    return () => unsubscribe();
  }, []);

  // Update Active Group and persist
  const handleSelectGroup = (id: number) => {
    setActiveGroupId(id);
    saveActiveGroupId(id);
  };

  // Trigger Google Sheet sync
  const performGoogleSheetSync = useCallback(
    async (token: string, spreadsheetId: string) => {
      try {
        setIsSyncing(true);
        await syncToGoogleSheet(token, spreadsheetId, {
          groups,
          gapAnalysisByGroup,
          linkagesByGroup,
          projects,
          recommendationsByGroup,
        });

        const updatedConfig: SheetSyncConfig = {
          ...sheetConfig,
          lastSyncedAt: new Date().toLocaleTimeString('th-TH'),
          syncStatus: 'saved',
        };
        setSheetConfig(updatedConfig);
        saveSheetConfig(updatedConfig);
        setSyncNotice('บันทึกข้อมูลลง Google Sheet สำเร็จแล้ว');
        setTimeout(() => setSyncNotice(null), 3000);
      } catch (err: any) {
        console.error('Google Sheet Sync Error:', err);
        const updatedConfig: SheetSyncConfig = {
          ...sheetConfig,
          syncStatus: 'error',
          errorMessage: err.message,
        };
        setSheetConfig(updatedConfig);
        saveSheetConfig(updatedConfig);
      } finally {
        setIsSyncing(false);
      }
    },
    [groups, gapAnalysisByGroup, linkagesByGroup, projects, recommendationsByGroup, sheetConfig]
  );

  // Auto-sync debouncer
  const scheduleAutoSync = useCallback(() => {
    if (!sheetConfig.spreadsheetId || !sheetConfig.autoSync || !accessToken) return;

    if (autoSyncTimerRef.current) {
      clearTimeout(autoSyncTimerRef.current);
    }

    autoSyncTimerRef.current = setTimeout(() => {
      performGoogleSheetSync(accessToken, sheetConfig.spreadsheetId);
    }, 2500); // Debounce 2.5s
  }, [sheetConfig, accessToken, performGoogleSheetSync]);

  // Handlers for Data Updates
  const handleUpdateGapAnalysis = (updatedItems: GapAnalysisItem[]) => {
    const updated = {
      ...gapAnalysisByGroup,
      [activeGroupId]: updatedItems,
    };
    setGapAnalysisByGroup(updated);
    saveGapAnalysisByGroup(updated);
    scheduleAutoSync();
  };

  const handleUpdateLinkages = (updatedItems: ActivityLinkageItem[]) => {
    const updated = {
      ...linkagesByGroup,
      [activeGroupId]: updatedItems,
    };
    setLinkagesByGroup(updated);
    saveLinkagesByGroup(updated);
    scheduleAutoSync();
  };

  const handleUpdateProjects = (updatedProjects: ProjectProposalItem[]) => {
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    scheduleAutoSync();
  };

  const handleUpdateRecommendations = (updatedRec: GroupRecommendation) => {
    const updated = {
      ...recommendationsByGroup,
      [activeGroupId]: updatedRec,
    };
    setRecommendationsByGroup(updated);
    saveRecommendationsByGroup(updated);
    scheduleAutoSync();
  };

  const handleUpdateLogicModel = (newData: LogicModelData) => {
    setLogicModelData(newData);
    saveLogicModelData(newData);
    scheduleAutoSync();
  };

  // Google Sign-in Handler
  const handleSignIn = async () => {
    try {
      const res = await signInWithGoogle();
      setAccessToken(res.accessToken);
    } catch (err) {
      console.error('Sign-in failed:', err);
    }
  };

  const handleSignOut = async () => {
    await logOutGoogle();
    setAccessToken(null);
    setCurrentUser(null);
  };

  // Google Sheet creation
  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      handleSignIn();
      return;
    }

    try {
      setIsCreatingSheet(true);
      const res = await createWorkshopSpreadsheet(
        accessToken,
        'ระบบใบงานกลยุทธ์ที่ 3 การคัดกรองและบำบัดรักษาแอลกอฮอล์'
      );

      const newConfig: SheetSyncConfig = {
        spreadsheetId: res.spreadsheetId,
        spreadsheetUrl: res.spreadsheetUrl,
        sheetNamePrefix: 'กลยุทธ์3_แอลกอฮอล์',
        autoSync: true,
        syncStatus: 'idle',
      };
      setSheetConfig(newConfig);
      saveSheetConfig(newConfig);

      // Initial populate
      await performGoogleSheetSync(accessToken, res.spreadsheetId);
    } catch (err: any) {
      console.error('Create spreadsheet error:', err);
      alert('ไม่สามารถสร้าง Google Sheet ได้: ' + err.message);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleManualSync = () => {
    if (!sheetConfig.spreadsheetId) {
      setIsSheetModalOpen(true);
      return;
    }
    if (!accessToken) {
      handleSignIn();
      return;
    }
    performGoogleSheetSync(accessToken, sheetConfig.spreadsheetId);
  };

  // Add new group
  const handleAddNewGroup = () => {
    const nextId = groups.length + 1;
    const colors = ['#3b82f6', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'];
    const newCode = `A${nextId}`;
    const newGroup: GroupMeta = {
      id: nextId,
      code: newCode,
      name: `กลุ่ม ${newCode}`,
      title: `กิจกรรม ${newCode} (กรอบกิจกรรมเพิ่มเติม)`,
      agency: `ทีมขับเคลื่อนกิจกรรม ${newCode}`,
      color: colors[nextId % colors.length],
      activeMembers: 1,
    };

    const nextGroups = [...groups, newGroup];
    setGroups(nextGroups);
    saveGroups(nextGroups);
    setActiveGroupId(nextId);
  };

  // Active items for current selected group
  const currentGapAnalysis = gapAnalysisByGroup[activeGroupId] || [];
  const currentLinkages = linkagesByGroup[activeGroupId] || [];
  const currentRecommendations = recommendationsByGroup[activeGroupId] || {
    id: `rec-group-${activeGroupId}`,
    groupId: activeGroupId,
    policySuggestions: '',
    successFactors: '',
    obstacles: '',
    quickWins: '',
    generalNotes: '',
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans">
      {/* 1. Header with branding, group switcher, Google Sheets sync, & Google Auth */}
      <Header
        groups={groups}
        activeGroupId={activeGroupId}
        onSelectGroup={handleSelectGroup}
        onAddGroup={handleAddNewGroup}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        sheetConfig={sheetConfig}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
        onOpenOrgModal={() => setIsOrgModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        orgConfig={orgConfig}
      />

      {/* 2. Exact 6-Tab Navigation */}
      <TabNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        stats={{
          totalProjects: projects.length,
          completedGapCount: currentGapAnalysis.length,
        }}
      />

      {/* Sync Notification Banner */}
      {syncNotice && (
        <div className="bg-emerald-500 text-white text-xs font-medium py-1 px-4 text-center animate-in fade-in transition-all">
          ✓ {syncNotice}
        </div>
      )}

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* Page 1: สรุปผลภาพรวม (Summary / Dashboard) */}
        {activeTab === 'summary' && (
          <SummaryDashboard
            groups={groups}
            activeGroupId={activeGroupId}
            onSelectGroup={handleSelectGroup}
            onNavigateTab={setActiveTab}
            gapAnalysisByGroup={gapAnalysisByGroup}
            linkagesByGroup={linkagesByGroup}
            projects={projects}
            recommendationsByGroup={recommendationsByGroup}
            isAllGroupsView={isAllGroupsView}
            onToggleAllGroups={setIsAllGroupsView}
          />
        )}

        {/* Page 2: Logic Model กลยุทธ์ที่ 3 (Editable) */}
        {activeTab === 'logic_model' && (
          <LogicModelView
            logicModelData={logicModelData}
            onUpdateLogicModelData={handleUpdateLogicModel}
          />
        )}

        {/* Page 3: ใบงานที่ 1 (Gap Analysis) */}
        {activeTab === 'worksheet_1' && (
          <Worksheet1GapAnalysis
            groups={groups}
            activeGroupId={activeGroupId}
            onSelectGroup={handleSelectGroup}
            gapAnalysisList={currentGapAnalysis}
            onUpdateGapAnalysis={handleUpdateGapAnalysis}
            allGroupsGapData={gapAnalysisByGroup}
          />
        )}

        {/* Page 4: ใบงานที่ 2 (ส่วนที่ 1 วิเคราะห์เชื่อมโยงกิจกรรมและปัญหา) */}
        {activeTab === 'worksheet_2_1' && (
          <Worksheet2Part1Linkage
            groups={groups}
            activeGroupId={activeGroupId}
            onSelectGroup={handleSelectGroup}
            linkagesList={currentLinkages}
            onUpdateLinkages={handleUpdateLinkages}
            gapAnalysisList={currentGapAnalysis}
            onNavigateToPart2={() => setActiveTab('worksheet_2_2')}
          />
        )}

        {/* Page 5: ใบงานที่ 2 (ส่วนที่ 2 ข้อเสนอโครงการตามกิจกรรม) */}
        {activeTab === 'worksheet_2_2' && (
          <Worksheet2Part2Projects
            groups={groups}
            activeGroupId={activeGroupId}
            onSelectGroup={handleSelectGroup}
            projects={projects}
            onUpdateProjects={handleUpdateProjects}
            linkagesList={currentLinkages}
            availableOutputs={logicModelData.outputs}
          />
        )}

        {/* Page 6: ประเด็นข้อเสนอแนะเพิ่มเติม */}
        {activeTab === 'recommendations' && (
          <WorksheetRecommendations
            groups={groups}
            activeGroupId={activeGroupId}
            onSelectGroup={handleSelectGroup}
            recommendations={currentRecommendations}
            onUpdateRecommendations={handleUpdateRecommendations}
            allGroupsRecommendations={recommendationsByGroup}
          />
        )}
      </main>

      {/* 4. Modals */}
      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        config={sheetConfig}
        onSaveConfig={(cfg) => {
          setSheetConfig(cfg);
          saveSheetConfig(cfg);
        }}
        onCreateNewSheet={handleCreateNewSheet}
        onSyncNow={async () => {
          if (accessToken && sheetConfig.spreadsheetId) {
            await performGoogleSheetSync(accessToken, sheetConfig.spreadsheetId);
          }
        }}
        isCreating={isCreatingSheet}
        isSyncing={isSyncing}
        hasAuthToken={!!accessToken}
        onPromptSignIn={handleSignIn}
      />

      <OrgAuthModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        orgConfig={orgConfig}
        onSaveOrgConfig={(cfg) => {
          setOrgConfig(cfg);
          saveOrgConfig(cfg);
        }}
        currentUser={currentUser}
        groups={groups}
        onAssignUserGroup={(groupId) => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, assignedGroupId: groupId });
          }
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        groups={groups}
        gapAnalysisByGroup={gapAnalysisByGroup}
        linkagesByGroup={linkagesByGroup}
        projects={projects}
        recommendationsByGroup={recommendationsByGroup}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ระบบขับเคลื่อนกลยุทธ์ที่ 3 การคัดกรองและบำบัดรักษาผู้มีปัญหาจากการบริโภคเครื่องดื่มแอลกอฮอล์ (พ.ศ. 2571–2575)
          </span>
          <span className="text-slate-400">
            ระบบทำงานร่วมกันแบบเรียลไทม์ • เชื่อมโยงฐานข้อมูล Google Sheets
          </span>
        </div>
      </footer>
    </div>
  );
}
