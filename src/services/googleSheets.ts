import { 
  GapAnalysisItem, 
  ActivityLinkageItem, 
  ProjectProposalItem, 
  GroupRecommendation,
  GroupMeta
} from '../types';

interface SheetPayloadData {
  groups: GroupMeta[];
  gapAnalysisByGroup: Record<number, GapAnalysisItem[]>;
  linkagesByGroup: Record<number, ActivityLinkageItem[]>;
  projects: ProjectProposalItem[];
  recommendationsByGroup: Record<number, GroupRecommendation>;
}

// Create a new Google Spreadsheet for this workshop
export const createWorkshopSpreadsheet = async (
  accessToken: string,
  title: string = 'ระบบใบงานกลยุทธ์ที่ 3 (การคัดกรองและบำบัดรักษาแอลกอฮอล์)'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  
  const body = {
    properties: {
      title: `${title} - ${new Date().toLocaleDateString('th-TH')}`,
    },
    sheets: [
      {
        properties: {
          title: 'สรุปภาพรวม_Dashboard',
          gridProperties: { rowCount: 100, columnCount: 15 },
          tabColor: { red: 0.23, green: 0.51, blue: 0.96 }, // Blue
        },
      },
      {
        properties: {
          title: 'ใบงานที่1_GapAnalysis',
          gridProperties: { rowCount: 200, columnCount: 10 },
          tabColor: { red: 0.06, green: 0.72, blue: 0.51 }, // Green
        },
      },
      {
        properties: {
          title: 'ใบงานที่2_ส่วนที่1_เชื่อมโยงกิจกรรม',
          gridProperties: { rowCount: 150, columnCount: 10 },
          tabColor: { red: 0.54, green: 0.36, blue: 0.96 }, // Purple
        },
      },
      {
        properties: {
          title: 'ใบงานที่2_ส่วนที่2_ข้อเสนอโครงการ',
          gridProperties: { rowCount: 300, columnCount: 15 },
          tabColor: { red: 0.96, green: 0.62, blue: 0.04 }, // Amber
        },
      },
      {
        properties: {
          title: 'ประเด็นข้อเสนอแนะเพิ่มเติม',
          gridProperties: { rowCount: 100, columnCount: 10 },
          tabColor: { red: 0.93, green: 0.28, blue: 0.6 }, // Pink
        },
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'ไม่สามารถสร้าง Google Spreadsheet ได้');
  }

  const result = await response.json();
  const spreadsheetId = result.spreadsheetId;
  const spreadsheetUrl = result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { spreadsheetId, spreadsheetUrl };
};

// Sync all group data to the Google Spreadsheet
export const syncToGoogleSheet = async (
  accessToken: string,
  spreadsheetId: string,
  data: SheetPayloadData
): Promise<void> => {
  // Build batchUpdate data values
  const valueRanges: any[] = [];

  // 1. ใบงานที่ 1: Gap Analysis
  const gapRows: any[][] = [
    ['กลุ่ม', 'หน่วยงาน', 'รหัสปัญหา', 'สถานการณ์ปัญหา (T)', 'ประเภท', 'รายละเอียดข้อค้นพบ / สิ่งที่ต้องพัฒนา', 'บันทึกเวลา']
  ];

  data.groups.forEach((group) => {
    const items = data.gapAnalysisByGroup[group.id] || [];
    items.forEach((item) => {
      // Default findings
      item.findings.default.forEach((f, idx) => {
        gapRows.push([group.name, group.agency, item.topicCode, item.topicTitle, `ข้อค้นพบตั้งต้น (${idx + 1})`, f, new Date().toISOString()]);
      });
      // Group findings
      item.findings.groupAdded.forEach((f, idx) => {
        gapRows.push([group.name, group.agency, item.topicCode, item.topicTitle, `ข้อค้นพบเพิ่มเติมของกลุ่ม (${idx + 1})`, f, new Date().toISOString()]);
      });
      // Default developments
      item.developments.default.forEach((d, idx) => {
        gapRows.push([group.name, group.agency, item.topicCode, item.topicTitle, `สิ่งที่ต้องพัฒนาตั้งต้น (${idx + 1})`, d, new Date().toISOString()]);
      });
      // Group developments
      item.developments.groupAdded.forEach((d, idx) => {
        gapRows.push([group.name, group.agency, item.topicCode, item.topicTitle, `สิ่งที่ต้องพัฒนาเพิ่มเติมของกลุ่ม (${idx + 1})`, d, new Date().toISOString()]);
      });
    });
  });

  valueRanges.push({
    range: 'ใบงานที่1_GapAnalysis!A1:G' + Math.max(gapRows.length, 10),
    values: gapRows,
  });

  // 2. ใบงานที่ 2 ส่วนที่ 1: Linkages
  const linkageRows: any[][] = [
    ['กลุ่ม', 'หน่วยงาน', 'รหัสกิจกรรม', 'กิจกรรม (A)', 'สถานการณ์ปัญหาที่เชื่อมโยง (T)', 'โครงการที่ควรดำเนินการ', 'บันทึกเวลา']
  ];

  data.groups.forEach((group) => {
    const items = data.linkagesByGroup[group.id] || [];
    items.forEach((item) => {
      linkageRows.push([
        group.name,
        group.agency,
        item.activityCode,
        item.activityTitle,
        item.linkedProblems.join(', '),
        item.proposedProjects.join(' \n'),
        new Date().toISOString()
      ]);
    });
  });

  valueRanges.push({
    range: 'ใบงานที่2_ส่วนที่1_เชื่อมโยงกิจกรรม!A1:G' + Math.max(linkageRows.length, 10),
    values: linkageRows,
  });

  // 3. ใบงานที่ 2 ส่วนที่ 2: Projects
  const projectRows: any[][] = [
    [
      'ลำดับ',
      'กลุ่ม',
      'กิจกรรมหลัก (A)',
      'ชื่อโครงการ/กิจกรรม',
      'สถานะ: มีแผนอยู่แล้ว',
      'สถานะ: ต้องปรับปรุง',
      'สถานะ: บูรณาการร่วมกับ',
      'สถานะ: โครงการใหม่',
      'ผลผลิตที่คาดว่าจะได้รับ (O)',
      'ปี 2571',
      'ปี 2572',
      'ปี 2573',
      'ปี 2574',
      'ปี 2575',
      'งบประมาณ (บาท)',
      'แหล่งงบประมาณ',
      'หน่วยงานหลัก',
      'หน่วยงานรอง',
      'บันทึกเวลา'
    ]
  ];

  data.projects.forEach((proj, idx) => {
    const group = data.groups.find(g => g.id === proj.groupId);
    projectRows.push([
      idx + 1,
      group?.name || `กลุ่มที่ ${proj.groupId}`,
      proj.activityCode,
      proj.projectName,
      proj.status.hasExistingPlan ? '✓' : '',
      proj.status.needsImprovement ? '✓' : '',
      proj.status.integratedWith || '',
      proj.status.isNewProject ? '✓' : '',
      proj.expectedOutput,
      proj.years.y2571 ? '✓' : '',
      proj.years.y2572 ? '✓' : '',
      proj.years.y2573 ? '✓' : '',
      proj.years.y2574 ? '✓' : '',
      proj.years.y2575 ? '✓' : '',
      proj.budget.amount || '0',
      proj.budget.source || '-',
      proj.primaryAgency || '-',
      proj.secondaryAgency || '-',
      proj.updatedAt || new Date().toISOString()
    ]);
  });

  valueRanges.push({
    range: 'ใบงานที่2_ส่วนที่2_ข้อเสนอโครงการ!A1:S' + Math.max(projectRows.length, 10),
    values: projectRows,
  });

  // 4. ข้อเสนอแนะเพิ่มเติม (Page 6)
  const recRows: any[][] = [
    ['กลุ่ม', 'หน่วยงาน', 'ข้อเสนอแนะเชิงนโยบาย/หน่วยงานกำกับดูแล', 'ปัจจัยความสำเร็จสำคัญ', 'ปัญหา/อุปสรรคและแนวทางแก้ไข', 'สิ่งที่เริ่มทำได้ทันที (Quick Wins)', 'ข้อเสนอแนะอื่นๆ', 'บันทึกเวลา']
  ];

  data.groups.forEach((group) => {
    const rec = data.recommendationsByGroup[group.id];
    if (rec) {
      recRows.push([
        group.name,
        group.agency,
        rec.policySuggestions || '',
        rec.successFactors || '',
        rec.obstacles || '',
        rec.quickWins || '',
        rec.generalNotes || '',
        rec.updatedAt || new Date().toISOString()
      ]);
    }
  });

  valueRanges.push({
    range: 'ประเด็นข้อเสนอแนะเพิ่มเติม!A1:H' + Math.max(recRows.length, 10),
    values: recRows,
  });

  // 5. Dashboard Summary Sheet
  const summaryRows: any[][] = [
    ['ระบบสารสนเทศขับเคลื่อนกลยุทธ์ที่ 3: การคัดกรองและบำบัดรักษาผู้มีปัญหาแอลกอฮอล์'],
    ['วันที่อัปเดตล่าสุด', new Date().toLocaleString('th-TH')],
    ['จำนวนกลุ่มทั้งหมด', data.groups.length],
    ['จำนวนโครงการที่เสนอทั้งหมด', data.projects.length],
    [],
    ['สรุปจำนวนโครงการจำแนกตามกลุ่ม'],
    ['กลุ่ม', 'หน่วยงาน', 'จำนวนโครงการที่เสนอ']
  ];

  data.groups.forEach((g) => {
    const count = data.projects.filter(p => p.groupId === g.id).length;
    summaryRows.push([g.name, g.agency, count]);
  });

  valueRanges.push({
    range: 'สรุปภาพรวม_Dashboard!A1:C' + Math.max(summaryRows.length, 10),
    values: summaryRows,
  });

  // Perform Batch Update to Google Sheets
  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const response = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: valueRanges,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'ไม่สามารถบันทึกข้อมูลไปยัง Google Sheets ได้');
  }
};
