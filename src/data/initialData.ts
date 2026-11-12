import { 
  GapAnalysisItem, 
  ActivityLinkageItem, 
  ProjectProposalItem, 
  GroupRecommendation, 
  GroupMeta,
  LogicModelNode
} from '../types';

export const STRATEGY_INFO = {
  strategyName: 'กลยุทธ์ 3 การคัดกรองและบำบัดรักษาผู้มีปัญหาจากการบริโภคเครื่องดื่มแอลกอฮอล์',
  strategyGoal: 'เพื่อจัดการให้ผู้มีปัญหาการบริโภคเครื่องดื่มแอลกอฮอล์ได้รับการดูแลรักษาตามมาตรฐานที่เหมาะสม',
  targetPeriod: 'ระยะที่ 3 (พ.ศ. 2571–2575)',
};

// 7 Pillars of Logic Model from Page 1
export const LOGIC_MODEL_DATA: {
  topics: LogicModelNode[];
  inputs: LogicModelNode[];
  activities: LogicModelNode[];
  outputs: LogicModelNode[];
  shortTerm: LogicModelNode[];
  intermediate: LogicModelNode[];
  impact: LogicModelNode[];
} = {
  topics: [
    { code: 'T1', title: 'การคัดกรองยังไม่ครอบคลุมกลุ่มเป้าหมาย', category: 'TOPICS' },
    { code: 'T2', title: 'การเข้าถึงบริการบำบัดรักษามีข้อจำกัด', category: 'TOPICS' },
    { code: 'T3', title: 'ยังไม่มีระบบส่งต่อและติดตามผู้ป่วยที่แน่ชัด', category: 'TOPICS' },
    { code: 'T4', title: 'บุคลากรและเครือข่ายยังต้องได้รับการพัฒนาศักยภาพ', category: 'TOPICS' },
    { code: 'T5', title: 'ระบบข้อมูลยังมีข้อจำกัด ไม่ตอบโจทย์การทำงาน และเชื่อมโยงข้อมูลยาก', category: 'TOPICS' },
    { code: 'T6', title: 'การจัดบริการนอกสถานพยาบาลยังต้องได้รับการสนับสนุน', category: 'TOPICS' },
  ],
  inputs: [
    { code: 'I1', title: 'นโยบาย มาตรฐาน และแนวทางการดำเนินงาน', category: 'INPUTS' },
    { code: 'I2', title: 'บุคลากรที่มีความรู้ และทักษะที่จำเป็นต่อการปฏิบัติงาน', category: 'INPUTS' },
    { code: 'I3', title: 'งบประมาณและทรัพยากร ที่สนับสนุนการจัดบริการ', category: 'INPUTS' },
    { code: 'I4', title: 'ระบบข้อมูลสารสนเทศ ที่เอื้อต่อการปฏิบัติงาน', category: 'INPUTS' },
    { code: 'I5', title: 'เครือข่ายหน่วยบริการสุขภาพและหน่วยงานส่วนอื่น', category: 'INPUTS' },
    { code: 'I6', title: 'กลไกความร่วมมือและการกำกับติดตามระหว่างหน่วยงาน', category: 'INPUTS' },
  ],
  activities: [
    { code: 'A1', title: 'พัฒนาหลักเกณฑ์ แนวทางการดำเนินงาน และระบบติดตามผลการบำบัด ฟื้นฟูสภาพ', category: 'ACTIVITIES' },
    { code: 'A2', title: 'พัฒนาการให้บริการคัดกรองและบำบัดรักษา', category: 'ACTIVITIES' },
    { code: 'A3', title: 'พัฒนาศักยภาพผู้ให้บริการบำบัดและดูแลรักษา', category: 'ACTIVITIES' },
    { code: 'A4', title: 'พัฒนาข้อมูลสารสนเทศด้านจัดบริการ', category: 'ACTIVITIES' },
    { code: 'A5', title: 'พัฒนาและสนับสนุนการจัดบริการฯ นอกระบบบริการสุขภาพ', category: 'ACTIVITIES' },
  ],
  outputs: [
    { code: 'O1', title: 'มีมาตรฐาน แนวทาง และกลไกกำกับติดตามที่ชัดเจน', category: 'OUTPUTS' },
    { code: 'O2', title: 'มีการคัดกรองและให้บริการบำบัดรักษาครอบคลุมมากขึ้น', category: 'OUTPUTS' },
    { code: 'O3', title: 'มีบุคลากรและเครือข่ายที่มีศักยภาพในการจัดบริการ', category: 'OUTPUTS' },
    { code: 'O4', title: 'มีระบบข้อมูลและการแลกเปลี่ยนข้อมูลที่สนับสนุนการดูแล', category: 'OUTPUTS' },
    { code: 'O5', title: 'มีช่องทางบริการทางเลือกและบริการนอกสถานพยาบาลเพิ่มขึ้น', category: 'OUTPUTS' },
  ],
  shortTerm: [
    { code: 'S1', title: 'ประชาชนเข้าถึงการคัดกรองและบริการบำบัดรักษาได้มากขึ้น', category: 'SHORT-TERM' },
    { code: 'S2', title: 'ผู้มีปัญหาการดื่มแอลกอฮอล์ได้รับการวินิจฉัยโรคตามระดับความเสี่ยง', category: 'SHORT-TERM' },
    { code: 'S3', title: 'ผู้มีปัญหาการดื่มได้รับการบำบัดรักษาตามระดับความเสี่ยง', category: 'SHORT-TERM' },
  ],
  intermediate: [
    { code: 'M1', title: 'ผู้มีปัญหาการบริโภคเครื่องดื่มแอลกอฮอล์ได้รับการดูแลรักษาตามมาตรฐานที่เหมาะสม', category: 'INTERMEDIATE' },
  ],
  impact: [
    { code: 'IM1', title: 'อัตราป่วยตายด้วยโรคที่เกี่ยวข้องกับการบริโภคเครื่องดื่มแอลกอฮอล์ลดลง', category: 'IMPACT' },
    { code: 'IM2', title: 'ปริมาณการบริโภคแอลกอฮอล์บริสุทธิ์ต่อหัวประชากรลดลง', category: 'IMPACT' },
  ],
};

// Groups organized by Activity (A) as requested by user
export const DEFAULT_GROUPS: GroupMeta[] = [
  {
    id: 1,
    code: 'A1',
    name: 'กลุ่ม A1',
    title: 'พัฒนาหลักเกณฑ์ แนวทาง และระบบติดตามผลการบำบัดฟื้นฟูสภาพ',
    agency: 'ทีมขับเคลื่อนหลักเกณฑ์และระบบติดตามผล',
    color: '#2563eb', // Blue
    activeMembers: 6,
  },
  {
    id: 2,
    code: 'A2',
    name: 'กลุ่ม A2',
    title: 'พัฒนาการให้บริการคัดกรองและบำบัดรักษา',
    agency: 'ทีมพัฒนาระบบบริการคัดกรองและบำบัดรักษา',
    color: '#059669', // Emerald
    activeMembers: 6,
  },
  {
    id: 3,
    code: 'A3',
    name: 'กลุ่ม A3',
    title: 'พัฒนาศักยภาพผู้ให้บริการบำบัดและดูแลรักษา',
    agency: 'ทีมพัฒนาศักยภาพบุคลากรและเครือข่ายพี่เลี้ยง',
    color: '#d97706', // Amber
    activeMembers: 5,
  },
  {
    id: 4,
    code: 'A4',
    name: 'กลุ่ม A4',
    title: 'พัฒนาข้อมูลสารสนเทศด้านจัดบริการ',
    agency: 'ทีมพัฒนาระบบข้อมูลและการแลกเปลี่ยนข้อมูล (Data Exchange)',
    color: '#7c3aed', // Purple
    activeMembers: 5,
  },
  {
    id: 5,
    code: 'A5',
    name: 'กลุ่ม A5',
    title: 'พัฒนาและสนับสนุนการจัดบริการฯ นอกระบบบริการสุขภาพ',
    agency: 'ทีมนอกระบบบริการสุขภาพ สายด่วน ชุมชน และ Telemedicine',
    color: '#0891b2', // Cyan
    activeMembers: 6,
  },
];

// Predefined Gap Analysis from Page 2
export const INITIAL_GAP_ANALYSIS: GapAnalysisItem[] = [
  {
    id: 'T1',
    topicCode: 'T1',
    topicTitle: 'การคัดกรองยังไม่ครอบคลุมกลุ่มเป้าหมาย',
    findings: {
      default: [
        'ผลการคัดกรองต่ำกว่าเป้าหมายในทุกปี',
        'การคัดกรองยังเข้าไม่ถึงผู้มีพฤติกรรมเสี่ยง',
        'กลุ่มเป้าหมายมีจำนวนมากเมื่อเทียบกับภาระงานบุคลากร',
      ],
      groupAdded: [],
    },
    developments: {
      default: [
        'ค้นหาเชิงรุกและบูรณาการการคัดกรองกับบริการสุขภาพและชุมชน',
        'กำหนดกลุ่มเสี่ยงและจัดลำดับความสำคัญ',
        'ใช้เทคโนโลยีสนับสนุนการคัดกรอง',
      ],
      groupAdded: [],
    },
  },
  {
    id: 'T2',
    topicCode: 'T2',
    topicTitle: 'การเข้าถึงบริการบำบัดรักษามีข้อจำกัด',
    findings: {
      default: [
        'ผลการบำบัดแบบสั้นมีแนวโน้มลดลง และต่ำกว่าเป้าหมายในปี 2569',
        'ข้อจำกัดด้านทัศนคติและการตีตรา',
        'ข้อจำกัดด้านการเข้าถึงยา',
        'ข้อจำกัดด้านการวินิจฉัยและการลงรหัสโรค',
      ],
      groupAdded: [],
    },
    developments: {
      default: [
        'พัฒนาระบบบริการตามระดับความเสี่ยง และเพิ่มทางเลือกการรักษา',
        'พัฒนาการเข้าถึงยาและสิทธิการรักษา',
        'พัฒนาคลินิกทางเลือกที่เข้าถึงง่าย เป็นมิตร',
      ],
      groupAdded: [],
    },
  },
  {
    id: 'T3',
    topicCode: 'T3',
    topicTitle: 'ระบบส่งต่อและติดตามดูแลต่อเนื่องยังไม่ชัดเจน',
    findings: {
      default: [
        'แนวทางส่งต่อและส่งกลับยังไม่ชัดเจน',
        'ผู้ป่วยขาดนัดหรือหยุดรักษากลางคัน',
        'การดูแลช่วงเปลี่ยนผ่านและการสนับสนุนในชุมชนยังไม่ต่อเนื่อง',
      ],
      groupAdded: [],
    },
    developments: {
      default: [
        'พัฒนามาตรฐานการส่งต่อและส่งกลับ',
        'กำหนดผู้รับผิดชอบติดตามผู้รับบริการ',
        'พัฒนาระบบดูแลต่อเนื่องระหว่าง โรงพยาบาล ปฐมภูมิ และชุมชน',
      ],
      groupAdded: [],
    },
  },
  {
    id: 'T4',
    topicCode: 'T4',
    topicTitle: 'บุคลากรและเครือข่ายยังต้องได้รับการพัฒนาศักยภาพ',
    findings: {
      default: [
        'แนวทางและองค์ความรู้เผยแพร่ไม่ทั่วถึง',
        'ไม่มีคลังความรู้กลางที่เข้าถึงง่าย',
        'การอบรมยังไม่ครอบคลุมบุคลากรที่จำเป็น',
        'การเปลี่ยนผู้รับผิดชอบทำให้งานขาดความต่อเนื่อง',
        'ขาดระบบพี่เลี้ยงระดับพื้นที่',
      ],
      groupAdded: [],
    },
    developments: {
      default: [
        'พัฒนาแนวทางมาตรฐานและคลังความรู้กลาง',
        'พัฒนาสมรรถนะและระบบฝึกปฏิบัติ',
        'พัฒนาระบบพี่เลี้ยงและนิเทศติดตาม',
        'จัดทำฐานข้อมูลสมรรถนะบุคลากร',
      ],
      groupAdded: [],
    },
  },
  {
    id: 'T5',
    topicCode: 'T5',
    topicTitle: 'ระบบข้อมูลยังมีข้อจำกัด',
    findings: {
      default: [
        'ภาระการบันทึกข้อมูลซ้ำซ้อน',
        'พื้นที่ไม่สามารถติดตามผู้รับบริการรายบุคคลได้อย่างเพียงพอ',
      ],
      groupAdded: [],
    },
    developments: {
      default: [
        'พัฒนามาตรฐานข้อมูลและระบบรายงาน',
        'พัฒนา Data Exchange สำหรับการคัดกรองและบำบัดรักษา',
      ],
      groupAdded: [],
    },
  },
  {
    id: 'T6',
    topicCode: 'T6',
    topicTitle: 'การจัดบริการนอกสถานพยาบาลยังต้องได้รับการสนับสนุน',
    findings: {
      default: [
        'ช่องทางบริการ เช่น สายด่วน LINE และ Telemedicine ยังแยกส่วนจากบริการปกติ',
        'การประชาสัมพันธ์ไม่ทั่วถึง',
        'ขาดระบบนัดหมายและติดตามที่เป็นระบบ',
      ],
      groupAdded: [],
    },
    developments: {
      default: [
        'เชื่อมโยงช่องทางบริการกับระบบสุขภาพ',
        'พัฒนาระบบนัดหมายและส่งต่อ',
        'พัฒนาระบบติดตามที่คำนึงถึงความสมัครใจ และความเป็นส่วนตัว',
      ],
      groupAdded: [],
    },
  },
];

// Predefined Activities for Worksheet 2 Part 1 with line-linkable projects
export const INITIAL_ACTIVITY_LINKAGES: ActivityLinkageItem[] = [
  {
    id: 'A1',
    activityCode: 'A1',
    activityTitle: 'พัฒนาหลักเกณฑ์ แนวทางการดำเนินงาน และระบบติดตามผลการบำบัด ฟื้นฟูสภาพ',
    linkedProblems: ['T1', 'T3'],
    proposedProjects: [
      'โครงการจัดทำแนวทางเวชปฏิบัติและคู่มือการบำบัดฟื้นฟูสภาพผู้ติดสุรา',
      'โครงการพัฒนาระบบติดตามผู้ผ่านการบำบัดในระดับชุมชน',
    ],
    projectsWithLinks: [
      {
        id: 'p-a1-1',
        title: 'โครงการจัดทำแนวทางเวชปฏิบัติและคู่มือการบำบัดฟื้นฟูสภาพผู้ติดสุรา',
        linkedProblemCodes: ['T1', 'T2', 'T3'],
      },
      {
        id: 'p-a1-2',
        title: 'โครงการพัฒนาระบบติดตามผู้ผ่านการบำบัดในระดับชุมชน',
        linkedProblemCodes: ['T3'],
      },
    ],
  },
  {
    id: 'A2',
    activityCode: 'A2',
    activityTitle: 'พัฒนาการให้บริการคัดกรองและบำบัดรักษา',
    linkedProblems: ['T1', 'T2'],
    proposedProjects: [
      'โครงการบูรณาการคัดกรองความเสี่ยงการดื่มสุราในคลินิกโรคเรื้อรังและ OPD',
      'โครงการขยายคู่สายและระบบให้คำปรึกษาบำบัดแบบสั้น (Brief Intervention)',
    ],
    projectsWithLinks: [
      {
        id: 'p-a2-1',
        title: 'โครงการบูรณาการคัดกรองความเสี่ยงการดื่มสุราในคลินิกโรคเรื้อรังและ OPD',
        linkedProblemCodes: ['T1', 'T2'],
      },
      {
        id: 'p-a2-2',
        title: 'โครงการขยายคู่สายและระบบให้คำปรึกษาบำบัดแบบสั้น (Brief Intervention)',
        linkedProblemCodes: ['T2'],
      },
    ],
  },
  {
    id: 'A3',
    activityCode: 'A3',
    activityTitle: 'พัฒนาศักยภาพผู้ให้บริการบำบัดและดูแลรักษา',
    linkedProblems: ['T4'],
    proposedProjects: [
      'โครงการพัฒนาหลักสูตรฝึกอบรมและ Coaching บุคลากรปฐมภูมิ',
      'โครงการจัดตั้งเครือข่ายพี่เลี้ยงทางคลินิก (Clinical Supervision Network)',
    ],
    projectsWithLinks: [
      {
        id: 'p-a3-1',
        title: 'โครงการพัฒนาหลักสูตรฝึกอบรมและ Coaching บุคลากรปฐมภูมิ',
        linkedProblemCodes: ['T4'],
      },
      {
        id: 'p-a3-2',
        title: 'โครงการจัดตั้งเครือข่ายพี่เลี้ยงทางคลินิก (Clinical Supervision Network)',
        linkedProblemCodes: ['T4', 'T3'],
      },
    ],
  },
  {
    id: 'A4',
    activityCode: 'A4',
    activityTitle: 'พัฒนาข้อมูลสารสนเทศด้านจัดบริการ',
    linkedProblems: ['T5'],
    proposedProjects: [
      'โครงการพัฒนาระบบเชื่อมโยงข้อมูลผู้ป่วยระหว่างสถานพยาบาล (Data Exchange)',
      'โครงการ Dashboard เฝ้าระวังและติดตามผลการบำบัดรักษาแบบเรียลไทม์',
    ],
    projectsWithLinks: [
      {
        id: 'p-a4-1',
        title: 'โครงการพัฒนาระบบเชื่อมโยงข้อมูลผู้ป่วยระหว่างสถานพยาบาล (Data Exchange)',
        linkedProblemCodes: ['T5'],
      },
      {
        id: 'p-a4-2',
        title: 'โครงการ Dashboard เฝ้าระวังและติดตามผลการบำบัดรักษาแบบเรียลไทม์',
        linkedProblemCodes: ['T5', 'T1'],
      },
    ],
  },
  {
    id: 'A5',
    activityCode: 'A5',
    activityTitle: 'พัฒนาและสนับสนุนการจัดบริการฯ นอกระบบบริการสุขภาพ',
    linkedProblems: ['T6'],
    proposedProjects: [
      'โครงการยกระดับสายด่วนและบริการ Tele-counseling สู่การส่งต่อชุมชน',
      'โครงการส่งเสริมชุมชนบำบัดและชมรมเพื่อนช่วยเพื่อน (Peer Support Group)',
    ],
    projectsWithLinks: [
      {
        id: 'p-a5-1',
        title: 'โครงการยกระดับสายด่วนและบริการ Tele-counseling สู่การส่งต่อชุมชน',
        linkedProblemCodes: ['T6', 'T2'],
      },
      {
        id: 'p-a5-2',
        title: 'โครงการส่งเสริมชุมชนบำบัดและชมรมเพื่อนช่วยเพื่อน (Peer Support Group)',
        linkedProblemCodes: ['T6', 'T3'],
      },
    ],
  },
];

// Initial Projects for Worksheet 2 Part 2 (Page 4)
export const INITIAL_PROJECT_PROPOSALS: ProjectProposalItem[] = [
  {
    id: 'proj-1',
    no: 1,
    activityCode: 'A1',
    projectName: 'โครงการพัฒนาคู่มือมาตรฐานการคัดกรองและบำบัดรักษาผู้มีปัญหาแอลกอฮอล์ระดับชาติ',
    status: {
      hasExistingPlan: true,
      needsImprovement: true,
      integratedWith: 'กรมการแพทย์ / กรมสุขภาพจิต',
      isNewProject: false,
    },
    expectedOutput: 'O1: มีมาตรฐาน แนวทาง และกลไกกำกับติดตามที่ชัดเจน',
    years: {
      y2571: true,
      y2572: true,
      y2573: false,
      y2574: false,
      y2575: false,
    },
    budget: {
      amount: '1,500,000',
      source: 'งบประมาณแผ่นดิน / สสส.',
    },
    primaryAgency: 'กรมควบคุมโรค',
    secondaryAgency: 'กรมสุขภาพจิต, สปสช.',
    groupId: 1,
  },
  {
    id: 'proj-2',
    no: 2,
    activityCode: 'A2',
    projectName: 'โครงการพัฒนาระบบคัดกรองเชิงรุกผ่านแอปพลิเคชันและเครือข่าย อสม.',
    status: {
      hasExistingPlan: false,
      needsImprovement: false,
      integratedWith: 'ระบบสมาร์ท อสม.',
      isNewProject: true,
    },
    expectedOutput: 'O2: มีการคัดกรองและให้บริการบำบัดรักษาครอบคลุมมากขึ้น',
    years: {
      y2571: true,
      y2572: true,
      y2573: true,
      y2574: true,
      y2575: true,
    },
    budget: {
      amount: '3,200,000',
      source: 'กองทุนสุขภาพตำบล / สปสช.',
    },
    primaryAgency: 'สำนักสนับสนุนระบบสุขภาพปฐมภูมิ',
    secondaryAgency: 'โรงพยาบาลชุมชน, รพ.สต.',
    groupId: 2,
  },
  {
    id: 'proj-3',
    no: 3,
    activityCode: 'A4',
    projectName: 'โครงการเชื่อมต่อฐานข้อมูลการคัดกรองและประวัติการบำบัดระดับเขตสุขภาพ (Health Link)',
    status: {
      hasExistingPlan: false,
      needsImprovement: true,
      integratedWith: 'ระบบหมอพร้อม / Big Data สธ.',
      isNewProject: false,
    },
    expectedOutput: 'O4: มีระบบข้อมูลและการแลกเปลี่ยนข้อมูลที่สนับสนุนการดูแล',
    years: {
      y2571: false,
      y2572: true,
      y2573: true,
      y2574: false,
      y2575: false,
    },
    budget: {
      amount: '2,800,000',
      source: 'งบยุทธศาสตร์ดิจิทัล สธ.',
    },
    primaryAgency: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร สป.สธ.',
    secondaryAgency: 'โรงพยาบาลศูนย์/ทั่วไป',
    groupId: 4,
  },
];

export const INITIAL_RECOMMENDATIONS: GroupRecommendation = {
  id: 'rec-init',
  groupId: 1,
  policySuggestions: 'บรรจุยาบำบัดรักษาภาวะติดสุราในบัญชียาหลักแห่งชาติ และเพิ่มสิทธิประโยชน์บำบัดทางจิตสังคมในชุดสิทธิประโยชน์ของกองทุนสุขภาพทุกระบบ',
  successFactors: 'ความร่วมมือระหว่างทีมสุขภาพจิตและทีมเวชศาสตร์ครอบครัว และการมีระบบพี่เลี้ยงระดับเขตสุขภาพ',
  obstacles: 'ปัญหาทัศนคติการตีตราในสังคม และภาระงานของเจ้าหน้าที่ด่านหน้า',
  quickWins: 'จัดทำ Checklist การคัดกรองฉบับกระชับ (AUDIT-C) ในระบบ OPD',
  generalNotes: 'เวทีถอดบทเรียนพื้นที่ต้นแบบเพื่อแลกเปลี่ยนเรียนรู้',
};
