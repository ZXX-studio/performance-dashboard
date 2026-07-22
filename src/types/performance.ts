/** 考核周期 */
export type PeriodType = '月度' | '季度' | '半年度' | '年度';

/** 绩效等级 */
export type PerformanceGrade = 'S' | 'A' | 'B' | 'C' | 'D';

/** 绩效等级配置 */
export const GRADE_CONFIG: Record<PerformanceGrade, { label: string; color: string; bgColor: string; min: number; max: number }> = {
  S: { label: 'S', color: '#8B5CF6', bgColor: '#EDE9FE', min: 90, max: 100 },
  A: { label: 'A', color: '#3B82F6', bgColor: '#DBEAFE', min: 80, max: 89 },
  B: { label: 'B', color: '#22C55E', bgColor: '#DCFCE7', min: 70, max: 79 },
  C: { label: 'C', color: '#F59E0B', bgColor: '#FEF3C7', min: 60, max: 69 },
  D: { label: 'D', color: '#EF4444', bgColor: '#FEE2E2', min: 0, max: 59 },
};

/** 单条绩效记录 */
export interface PerformanceRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  team: string;
  position: string;
  periodType: PeriodType;
  year: number;
  periodNumber: number;
  periodLabel: string;
  performanceScore: number;
  capabilityScore: number;
  attitudeScore: number;
  innovationScore: number;
  teamworkScore: number;
  totalScore: number;
  grade: PerformanceGrade;
  isQualified: boolean;
  comment?: string;
}

/** 聚合后的部门绩效数据 */
export interface DepartmentStats {
  department: string;
  avgTotalScore: number;
  avgPerformanceScore: number;
  avgCapabilityScore: number;
  avgAttitudeScore: number;
  qualifiedRate: number;
  employeeCount: number;
  gradeDistribution: Record<PerformanceGrade, number>;
  rank: number;
  trend: number;
}

/** 个人排行数据 */
export interface EmployeeRanking {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  totalScore: number;
  grade: PerformanceGrade;
  rank: number;
  previousRank?: number;
  rankChange?: number;
}

/** 指标达成率数据 */
export interface IndicatorAchievement {
  indicatorName: string;
  indicatorKey: string;
  targetValue: number;
  actualAvgValue: number;
  achievementRate: number;
  qualifiedCount: number;
  totalCount: number;
}

/** 时间趋势数据点 */
export interface TrendDataPoint {
  periodLabel: string;
  avgTotalScore: number;
  avgPerformanceScore: number;
  avgCapabilityScore: number;
  avgAttitudeScore: number;
  qualifiedRate: number;
  employeeCount: number;
}

/** 概览统计数据 */
export interface OverviewStats {
  avgScore: number;
  qualifiedRate: number;
  sCount: number;
  sRate: number;
  totalCount: number;
  prevAvgScore: number;
  prevQualifiedRate: number;
  scoreChange: number;
  rateChange: number;
}

/** Excel 上传列的字段映射 */
export interface ColumnMapping {
  [excelColumnName: string]: keyof PerformanceRecord;
}

/** 筛选条件 */
export interface FilterState {
  periodType: PeriodType | '全部';
  year: number | '全部';
  periodNumber: number | '全部';
  departments: string[];
  grades: PerformanceGrade[];
}
