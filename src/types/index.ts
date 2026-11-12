export type TabKey = 
  | 'summary'        // หน้าที่ 1: หน้าสรุปผลภาพรวม
  | 'logic_model'    // หน้าที่ 2: Logic Model
  | 'worksheet_1'    // หน้าที่ 3: ใบงานที่ 1 (Gap Analysis)
  | 'worksheet_2_1'  // หน้าที่ 4: ใบงานที่ 2 ส่วนที่ 1 (วิเคราะห์เชื่อมโยงกิจกรรมและปัญหา)
  | 'worksheet_2_2'  // หน้าที่ 5: ใบงานที่ 2 ส่วนที่ 2 (กำหนดแนวทางและข้อเสนอโครงการ)
  | 'recommendations'; // หน้าที่ 6: ประเด็นข้อเสนอแนะเพิ่มเติม

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isOrgAuthorized: boolean;
  role: 'admin' | 'facilitator' | 'participant';
  assignedGroupId?: number;
}

export interface GroupMeta {
  id: number;
  code: string; // e.g., 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'
  name: string; // e.g., 'กลุ่ม A1'
  title: string; // e.g., 'พัฒนาหลักเกณฑ์ แนวทางการดำเนินงาน และระบบติดตามผลการบำบัด ฟื้นฟูสภาพ'
  agency: string;
  color: string;
  activeMembers?: number;
  lastUpdated?: string;
}

// Logic Model Types
export interface LogicModelNode {
  code: string;
  title: string;
  description?: string;
  category: 'TOPICS' | 'INPUTS' | 'ACTIVITIES' | 'OUTPUTS' | 'SHORT-TERM' | 'INTERMEDIATE' | 'IMPACT';
}

export interface LogicModelData {
  topics: LogicModelNode[];
  inputs: LogicModelNode[];
  activities: LogicModelNode[];
  outputs: LogicModelNode[];
  shortTerm: LogicModelNode[];
  intermediate: LogicModelNode[];
  impact: LogicModelNode[];
}

// Worksheet 1: Gap Analysis
export interface GapAnalysisItem {
  id: string; // e.g., 'T1', 'T2', ... 'T7'
  topicCode: string;
  topicTitle: string;
  isCustom?: boolean;
  findings: {
    default: string[];
    groupAdded: string[];
  };
  developments: {
    default: string[];
    groupAdded: string[];
  };
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Interactive Project node for Worksheet 2 Part 1
export interface ProposedProjectItem {
  id: string;
  title: string;
  linkedProblemCodes: string[]; // e.g., ['T1', 'T3']
}

// Worksheet 2 Part 1: Linkage Analysis
export interface ActivityLinkageItem {
  id: string; // e.g. 'A1', 'A2', ... 'A6'
  activityCode: string;
  activityTitle: string;
  isCustom?: boolean;
  linkedProblems: string[]; // List of problems (e.g., T1, T2)
  proposedProjects: string[]; // Legacy list of text
  projectsWithLinks?: ProposedProjectItem[]; // Explicit mapped projects with line linkages
  updatedAt?: string;
}

// Worksheet 2 Part 2: Project Proposal
export interface ProjectProposalItem {
  id: string;
  no: number;
  activityCode: string; // e.g., A1, A2, A3...
  projectName: string;
  status: {
    hasExistingPlan: boolean;
    needsImprovement: boolean;
    integratedWith: string; // บูรณาการร่วมกับ
    isNewProject: boolean;
  };
  expectedOutput: string; // ผลผลิตที่คาดว่าจะได้รับ (O)
  years: {
    y2571: boolean;
    y2572: boolean;
    y2573: boolean;
    y2574: boolean;
    y2575: boolean;
  };
  budget: {
    amount: string; // งบประมาณ (บาท)
    source: string; // แหล่งงบประมาณ
  };
  primaryAgency: string; // หน่วยงานหลัก
  secondaryAgency: string; // หน่วยงานรอง
  notes?: string;
  groupId: number;
  updatedAt?: string;
}

// Page 6: Recommendations
export interface GroupRecommendation {
  id: string;
  groupId: number;
  policySuggestions: string; // ข้อเสนอแนะเชิงนโยบาย/หน่วยงานกำกับดูแล
  successFactors: string; // ปัจจัยความสำเร็จสำคัญ
  obstacles: string; // ปัญหา/อุปสรรคและแนวทางแก้ไข
  quickWins: string; // สิ่งที่เริ่มทำได้ทันทีก่อนปี 2571
  generalNotes: string; // ข้อเสนอแนะอื่นๆ
  updatedAt?: string;
  updatedBy?: string;
}

// Google Sheets Sync Configuration
export interface SheetSyncConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetNamePrefix: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  syncStatus: 'idle' | 'syncing' | 'saved' | 'error';
  errorMessage?: string;
}

export interface OrgAccessConfig {
  allowedDomains: string[];
  allowedEmails: string[];
  enforceDomainCheck: boolean;
}
