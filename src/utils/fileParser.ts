import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { PerformanceRecord, PeriodType, PerformanceGrade, ColumnMapping } from '../types/performance';

/** 列名映射：支持中英文等多种写法 */
const COLUMN_ALIASES: Record<string, keyof PerformanceRecord> = {
  // 员工工号
  '员工工号': 'employeeId', '工号': 'employeeId', 'employeeid': 'employeeId', 'id': 'employeeId', '编号': 'employeeId',
  // 员工姓名
  '员工姓名': 'employeeName', '姓名': 'employeeName', 'name': 'employeeName', '名字': 'employeeName',
  // 部门
  '所属部门': 'department', '部门': 'department', 'department': 'department', 'dept': 'department',
  // 团队
  '所属团队': 'team', '团队': 'team', 'team': 'team', '小组': 'team',
  // 岗位
  '岗位': 'position', '职位': 'position', 'position': 'position',
  // 考核周期
  '考核周期': 'periodType', '周期类型': 'periodType', 'periodtype': 'periodType',
  // 年份
  '年份': 'year', '考核年份': 'year', 'year': 'year',
  // 周期序号
  '周期序号': 'periodNumber', 'periodnumber': 'periodNumber', 'periodnum': 'periodNumber', '序号': 'periodNumber',
  // 工作业绩
  '工作业绩': 'performanceScore', '业绩得分': 'performanceScore', 'performance': 'performanceScore', '业绩': 'performanceScore',
  // 工作能力
  '工作能力': 'capabilityScore', '能力得分': 'capabilityScore', 'capability': 'capabilityScore', '能力': 'capabilityScore',
  // 工作态度
  '工作态度': 'attitudeScore', '态度得分': 'attitudeScore', 'attitude': 'attitudeScore', '态度': 'attitudeScore',
  // 创新能力
  '创新能力': 'innovationScore', '创新得分': 'innovationScore', 'innovation': 'innovationScore', '创新': 'innovationScore',
  // 团队协作
  '团队协作': 'teamworkScore', '协作得分': 'teamworkScore', 'teamwork': 'teamworkScore', '协作': 'teamworkScore',
  // 综合得分
  '综合得分': 'totalScore', '总分': 'totalScore', 'totalscore': 'totalScore', '得分': 'totalScore',
  // 等级
  '绩效等级': 'grade', '等级': 'grade', 'grade': 'grade', '评级': 'grade',
  // 评语
  '评语': 'comment', 'comment': 'comment', '备注': 'comment',
};

/** 自动检测 Excel 列名映射 */
function detectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const h of headers) {
    const clean = h.trim();
    const matchedKey = COLUMN_ALIASES[clean] || COLUMN_ALIASES[clean.toLowerCase()];
    if (matchedKey) {
      mapping[clean] = matchedKey;
    }
  }
  return mapping;
}

/** 验证并标准化单条记录 */
function normalizeRecord(raw: Record<string, any>, mapping: ColumnMapping): Partial<PerformanceRecord> {
  const record: Partial<PerformanceRecord> = {};

  for (const [excelCol, field] of Object.entries(mapping)) {
    const value = raw[excelCol];
    if (value === undefined || value === null || value === '') continue;

    switch (field) {
      case 'employeeId':
      case 'employeeName':
      case 'department':
      case 'team':
      case 'position':
        record[field] = String(value).trim();
        break;
      case 'periodType':
        const ptVal = String(value).trim();
        if (['月度', '季度', '半年度', '年度'].includes(ptVal)) {
          record.periodType = ptVal as PeriodType;
        }
        break;
      case 'year':
        record.year = parseInt(String(value), 10);
        break;
      case 'periodNumber':
        record.periodNumber = parseInt(String(value), 10);
        break;
      case 'performanceScore':
      case 'capabilityScore':
      case 'attitudeScore':
      case 'innovationScore':
      case 'teamworkScore':
      case 'totalScore':
        record[field] = Math.min(100, Math.max(0, parseFloat(String(value)) || 0));
        break;
      case 'grade':
        const gVal = String(value).trim().toUpperCase();
        if (['S', 'A', 'B', 'C', 'D'].includes(gVal)) {
          record.grade = gVal as PerformanceGrade;
        }
        break;
      case 'comment':
        record.comment = String(value).trim();
        break;
    }
  }

  // 自动生成 periodLabel
  if (record.year && record.periodNumber !== undefined && record.periodType) {
    if (record.periodType === '季度') {
      record.periodLabel = `${record.year}-Q${record.periodNumber}`;
    } else if (record.periodType === '月度') {
      record.periodLabel = `${record.year}-${String(record.periodNumber).padStart(2, '0')}`;
    } else {
      record.periodLabel = `${record.year}-${record.periodType}${record.periodNumber}`;
    }
  }

  // 自动判定是否达标
  if (record.totalScore !== undefined) {
    record.isQualified = record.totalScore >= 60;
  }

  // 自动判定等级（如果没有提供）
  if (record.totalScore !== undefined && !record.grade) {
    const ts = record.totalScore;
    if (ts >= 90) record.grade = 'S';
    else if (ts >= 80) record.grade = 'A';
    else if (ts >= 70) record.grade = 'B';
    else if (ts >= 60) record.grade = 'C';
    else record.grade = 'D';
  }

  return record;
}

/** 解析 Excel 文件 */
export async function parseExcelFile(file: File): Promise<{ data: PerformanceRecord[]; errors: string[] }> {
  const errors: string[] = [];

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { data: [], errors: ['未找到有效的工作表'] };
    }

    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    if (jsonData.length === 0) {
      return { data: [], errors: ['文件为空或没有有效数据'] };
    }

    const headers = Object.keys(jsonData[0] as object);
    const mapping = detectColumns(headers);

    const records: PerformanceRecord[] = [];
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as Record<string, any>;
      const partial = normalizeRecord(row, mapping);

      // 验证必填字段
      if (!partial.employeeId || !partial.employeeName || !partial.department) {
        errors.push(`第 ${i + 2} 行：缺少必填字段（工号/姓名/部门）`);
        continue;
      }
      if (partial.totalScore === undefined) {
        errors.push(`第 ${i + 2} 行：缺少综合得分`);
        continue;
      }

      records.push(partial as PerformanceRecord);
    }

    return { data: records, errors };
  } catch (e) {
    return { data: [], errors: [`文件解析失败: ${(e as Error).message}`] };
  }
}

/** 解析 CSV 文件 */
export async function parseCsvFile(file: File): Promise<{ data: PerformanceRecord[]; errors: string[] }> {
  const errors: string[] = [];

  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          resolve({ data: [], errors: ['文件为空或没有有效数据'] });
          return;
        }

        const headers = results.meta.fields || [];
        const mapping = detectColumns(headers);

        const records: PerformanceRecord[] = [];
        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i] as Record<string, any>;
          const partial = normalizeRecord(row, mapping);

          if (!partial.employeeId || !partial.employeeName || !partial.department) {
            errors.push(`第 ${i + 2} 行：缺少必填字段（工号/姓名/部门）`);
            continue;
          }
          if (partial.totalScore === undefined) {
            errors.push(`第 ${i + 2} 行：缺少综合得分`);
            continue;
          }

          records.push(partial as PerformanceRecord);
        }

        resolve({ data: records, errors });
      },
      error: (err) => {
        resolve({ data: [], errors: [`CSV 解析失败: ${err.message}`] });
      },
    });
  });
}

/** 统一的文件解析入口 */
export async function parseFile(file: File): Promise<{ data: PerformanceRecord[]; errors: string[] }> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') {
    return parseCsvFile(file);
  }
  return parseExcelFile(file);
}

/** 导出为 Excel 文件 */
export function exportToExcel(data: PerformanceRecord[], filename: string): void {
  const exportData = data.map(r => ({
    '员工工号': r.employeeId,
    '员工姓名': r.employeeName,
    '所属部门': r.department,
    '所属团队': r.team,
    '岗位': r.position,
    '考核周期': r.periodType,
    '年份': r.year,
    '周期序号': r.periodNumber,
    '周期标签': r.periodLabel,
    '工作业绩': r.performanceScore,
    '工作能力': r.capabilityScore,
    '工作态度': r.attitudeScore,
    '创新能力': r.innovationScore,
    '团队协作': r.teamworkScore,
    '综合得分': r.totalScore,
    '绩效等级': r.grade,
    '是否达标': r.isQualified ? '是' : '否',
    '评语': r.comment || '',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '绩效数据');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
