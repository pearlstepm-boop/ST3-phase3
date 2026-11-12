import { 
  DEFAULT_GROUPS, 
  INITIAL_GAP_ANALYSIS, 
  INITIAL_ACTIVITY_LINKAGES, 
  INITIAL_PROJECT_PROPOSALS, 
  INITIAL_RECOMMENDATIONS 
} from '../data/initialData';
import { 
  GapAnalysisItem, 
  ActivityLinkageItem, 
  ProjectProposalItem, 
  GroupRecommendation, 
  GroupMeta,
  SheetSyncConfig,
  OrgAccessConfig,
  LogicModelData
} from '../types';
import { DEFAULT_ORG_CONFIG } from './googleAuth';
import { LOGIC_MODEL_DATA } from '../data/initialData';

const STORAGE_KEYS = {
  GROUPS: 'alc_strat3_groups',
  LOGIC_MODEL: 'alc_strat3_logic_model',
  GAP_ANALYSIS: 'alc_strat3_gap_analysis',
  LINKAGES: 'alc_strat3_linkages',
  PROJECTS: 'alc_strat3_projects',
  RECOMMENDATIONS: 'alc_strat3_recommendations',
  SHEET_CONFIG: 'alc_strat3_sheet_config',
  ORG_CONFIG: 'alc_strat3_org_config',
  ACTIVE_GROUP_ID: 'alc_strat3_active_group_id',
};

// Broadcast channel for multi-tab realtime sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  broadcastChannel = new BroadcastChannel('alc_strat3_realtime_sync');
} catch (e) {
  console.log('BroadcastChannel not supported');
}

export const subscribeToRealtimeBroadcast = (onUpdate: () => void) => {
  if (!broadcastChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'DATA_UPDATED') {
      onUpdate();
    }
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
};

export const broadcastUpdate = () => {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'DATA_UPDATED', timestamp: Date.now() });
  }
};

// Groups
export const loadGroups = (): GroupMeta[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate that groups are organized by Activity (A) with 'code' and max 5 groups
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].code) {
        const filtered = parsed.filter((g: any) => g.id <= 5 && g.code !== 'A6');
        if (filtered.length === 5) return filtered;
      }
    }
  } catch (e) {}
  return DEFAULT_GROUPS;
};

export const saveGroups = (groups: GroupMeta[]) => {
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  broadcastUpdate();
};

// Logic Model Data (Editable)
export const loadLogicModelData = (): LogicModelData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGIC_MODEL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.topics && parsed.activities && parsed.outputs) {
        return parsed;
      }
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(LOGIC_MODEL_DATA));
};

export const saveLogicModelData = (data: LogicModelData) => {
  localStorage.setItem(STORAGE_KEYS.LOGIC_MODEL, JSON.stringify(data));
  broadcastUpdate();
};

// Active Group ID
export const loadActiveGroupId = (): number => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_GROUP_ID);
    if (raw) return parseInt(raw, 10) || 1;
  } catch (e) {}
  return 1;
};

export const saveActiveGroupId = (groupId: number) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_GROUP_ID, groupId.toString());
};

// Gap Analysis By Group
export const loadGapAnalysisByGroup = (): Record<number, GapAnalysisItem[]> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAP_ANALYSIS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  
  // Initialize with default for all initial groups
  const initial: Record<number, GapAnalysisItem[]> = {};
  DEFAULT_GROUPS.forEach(g => {
    initial[g.id] = JSON.parse(JSON.stringify(INITIAL_GAP_ANALYSIS));
  });
  return initial;
};

export const saveGapAnalysisByGroup = (data: Record<number, GapAnalysisItem[]>) => {
  localStorage.setItem(STORAGE_KEYS.GAP_ANALYSIS, JSON.stringify(data));
  broadcastUpdate();
};

// Activity Linkages By Group
export const loadLinkagesByGroup = (): Record<number, ActivityLinkageItem[]> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LINKAGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        // Check if any group has projectsWithLinks
        const hasProjectLinks = Object.values(parsed).some(
          (arr: any) => Array.isArray(arr) && arr.some((item: any) => item.projectsWithLinks && item.projectsWithLinks.length > 0)
        );
        if (hasProjectLinks) return parsed;
      }
    }
  } catch (e) {}

  const initial: Record<number, ActivityLinkageItem[]> = {};
  DEFAULT_GROUPS.forEach(g => {
    initial[g.id] = JSON.parse(JSON.stringify(INITIAL_ACTIVITY_LINKAGES));
  });
  return initial;
};

export const saveLinkagesByGroup = (data: Record<number, ActivityLinkageItem[]>) => {
  localStorage.setItem(STORAGE_KEYS.LINKAGES, JSON.stringify(data));
  broadcastUpdate();
};

// Projects
export const loadProjects = (): ProjectProposalItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return INITIAL_PROJECT_PROPOSALS;
};

export const saveProjects = (projects: ProjectProposalItem[]) => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  broadcastUpdate();
};

// Recommendations By Group
export const loadRecommendationsByGroup = (): Record<number, GroupRecommendation> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const initial: Record<number, GroupRecommendation> = {};
  DEFAULT_GROUPS.forEach(g => {
    initial[g.id] = {
      ...INITIAL_RECOMMENDATIONS,
      id: `rec-group-${g.id}`,
      groupId: g.id,
      updatedAt: new Date().toISOString(),
    };
  });
  return initial;
};

export const saveRecommendationsByGroup = (data: Record<number, GroupRecommendation>) => {
  localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(data));
  broadcastUpdate();
};

// Google Sheet Sync Config
export const loadSheetConfig = (): SheetSyncConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    spreadsheetId: '',
    spreadsheetUrl: '',
    sheetNamePrefix: 'กลยุทธ์3_แอลกอฮอล์',
    autoSync: true,
    syncStatus: 'idle',
  };
};

export const saveSheetConfig = (config: SheetSyncConfig) => {
  localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(config));
};

// Org Access Config
export const loadOrgConfig = (): OrgAccessConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORG_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_ORG_CONFIG;
};

export const saveOrgConfig = (config: OrgAccessConfig) => {
  localStorage.setItem(STORAGE_KEYS.ORG_CONFIG, JSON.stringify(config));
};
