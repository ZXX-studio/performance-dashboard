import type {
  PerformanceRecord,
  DepartmentStats,
  EmployeeRanking,
  IndicatorAchievement,
  TrendDataPoint,
  OverviewStats,
  PerformanceGrade,
} from '../types/performance';

/** 计算部门统计数据 */
export function calcDepartmentStats(data: PerformanceRecord[], prevData?: PerformanceRecord[]): DepartmentStats[] {
  const deptMap = new Map<string, PerformanceRecord[]>();

  for (const r of data) {
    const existing = deptMap.get(r.department) || [];
    existing.push(r);
    deptMap.set(r.department, existing);
  }

  const stats: DepartmentStats[] = [];

  for (const [dept, records] of deptMap) {
    const n = records.length;
    const avgTotal = records.reduce((s, r) => s + r.totalScore, 0) / n;
    const avgPerf = records.reduce((s, r) => s + r.performanceScore, 0) / n;
    const avgCap = records.reduce((s, r) => s + r.capabilityScore, 0) / n;
    const avgAtt = records.reduce((s, r) => s + r.attitudeScore, 0) / n;
    const qualifiedCount = records.filter(r => r.isQualified).length;

    const gradeDist: Record<PerformanceGrade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    for (const r of records) {
      gradeDist[r.grade]++;
    }

    // 计算环比趋势
    let trend = 0;
    if (prevData) {
      const prevRecords = prevData.filter(r => r.department === dept);
      if (prevRecords.length > 0) {
        const prevAvg = prevRecords.reduce((s, r) => s + r.totalScore, 0) / prevRecords.length;
        trend = ((avgTotal - prevAvg) / prevAvg) * 100;
      }
    }

    stats.push({
      department: dept,
      avgTotalScore: Math.round(avgTotal * 10) / 10,
      avgPerformanceScore: Math.round(avgPerf * 10) / 10,
      avgCapabilityScore: Math.round(avgCap * 10) / 10,
      avgAttitudeScore: Math.round(avgAtt * 10) / 10,
      qualifiedRate: Math.round((qualifiedCount / n) * 1000) / 10,
      employeeCount: new Set(records.map(r => r.employeeId)).size,
      gradeDistribution: gradeDist,
      rank: 0,
      trend: Math.round(trend * 10) / 10,
    });
  }

  // 排名
  stats.sort((a, b) => b.avgTotalScore - a.avgTotalScore);
  stats.forEach((s, i) => (s.rank = i + 1));

  return stats;
}

/** 计算个人排行数据 */
export function calcEmployeeRankings(data: PerformanceRecord[]): EmployeeRanking[] {
  const empMap = new Map<string, { record: PerformanceRecord; totalScore: number }>();

  for (const r of data) {
    const key = r.employeeId;
    const existing = empMap.get(key);
    if (!existing || r.totalScore > existing.totalScore) {
      empMap.set(key, { record: r, totalScore: r.totalScore });
    }
  }

  const rankings: EmployeeRanking[] = Array.from(empMap.values()).map(({ record }) => ({
    employeeId: record.employeeId,
    employeeName: record.employeeName,
    department: record.department,
    position: record.position,
    totalScore: record.totalScore,
    grade: record.grade,
    rank: 0,
  }));

  rankings.sort((a, b) => b.totalScore - a.totalScore);
  rankings.forEach((r, i) => {
    r.rank = i + 1;
    r.rankChange = 0;
  });

  return rankings;
}

/** 计算指标达成率 */
export function calcIndicatorAchievements(data: PerformanceRecord[]): IndicatorAchievement[] {
  const n = data.length;
  if (n === 0) return [];

  const targetValue = 80; // 目标值：80分

  const indicators = [
    { name: '工作业绩', key: 'performanceScore' },
    { name: '工作能力', key: 'capabilityScore' },
    { name: '工作态度', key: 'attitudeScore' },
    { name: '创新能力', key: 'innovationScore' },
    { name: '团队协作', key: 'teamworkScore' },
  ];

  return indicators.map(ind => {
    const values = data.map(r => (r as any)[ind.key] as number);
    const avg = values.reduce((s, v) => s + v, 0) / n;
    const qualified = values.filter(v => v >= targetValue).length;

    return {
      indicatorName: ind.name,
      indicatorKey: ind.key,
      targetValue,
      actualAvgValue: Math.round(avg * 10) / 10,
      achievementRate: Math.round((avg / targetValue) * 1000) / 10,
      qualifiedCount: qualified,
      totalCount: n,
    };
  });
}

/** 计算时间趋势数据 */
export function calcTrendData(data: PerformanceRecord[]): TrendDataPoint[] {
  const periodMap = new Map<string, PerformanceRecord[]>();

  for (const r of data) {
    const existing = periodMap.get(r.periodLabel) || [];
    existing.push(r);
    periodMap.set(r.periodLabel, existing);
  }

  const trendData: TrendDataPoint[] = [];

  for (const [label, records] of periodMap) {
    const n = records.length;
    trendData.push({
      periodLabel: label,
      avgTotalScore: Math.round((records.reduce((s, r) => s + r.totalScore, 0) / n) * 10) / 10,
      avgPerformanceScore: Math.round((records.reduce((s, r) => s + r.performanceScore, 0) / n) * 10) / 10,
      avgCapabilityScore: Math.round((records.reduce((s, r) => s + r.capabilityScore, 0) / n) * 10) / 10,
      avgAttitudeScore: Math.round((records.reduce((s, r) => s + r.attitudeScore, 0) / n) * 10) / 10,
      qualifiedRate: Math.round((records.filter(r => r.isQualified).length / n) * 1000) / 10,
      employeeCount: new Set(records.map(r => r.employeeId)).size,
    });
  }

  // 按周期标签排序
  trendData.sort((a, b) => a.periodLabel.localeCompare(b.periodLabel));

  return trendData;
}

/** 计算概览统计数据 */
export function calcOverviewStats(data: PerformanceRecord[], prevData?: PerformanceRecord[]): OverviewStats {
  const n = data.length;
  if (n === 0) {
    return {
      avgScore: 0,
      qualifiedRate: 0,
      sCount: 0,
      sRate: 0,
      totalCount: 0,
      prevAvgScore: 0,
      prevQualifiedRate: 0,
      scoreChange: 0,
      rateChange: 0,
    };
  }

  const avgScore = Math.round((data.reduce((s, r) => s + r.totalScore, 0) / n) * 10) / 10;
  const qualifiedCount = data.filter(r => r.isQualified).length;
  const qualifiedRate = Math.round((qualifiedCount / n) * 1000) / 10;
  const sCount = data.filter(r => r.grade === 'S').length;

  let prevAvgScore = 0;
  let prevQualifiedRate = 0;

  if (prevData && prevData.length > 0) {
    prevAvgScore = Math.round((prevData.reduce((s, r) => s + r.totalScore, 0) / prevData.length) * 10) / 10;
    prevQualifiedRate = Math.round((prevData.filter(r => r.isQualified).length / prevData.length) * 1000) / 10;
  }

  return {
    avgScore,
    qualifiedRate,
    sCount,
    sRate: Math.round((sCount / n) * 1000) / 10,
    totalCount: new Set(data.map(r => r.employeeId)).size,
    prevAvgScore,
    prevQualifiedRate,
    scoreChange: prevAvgScore ? Math.round((avgScore - prevAvgScore) * 10) / 10 : 0,
    rateChange: prevQualifiedRate ? Math.round((qualifiedRate - prevQualifiedRate) * 10) / 10 : 0,
  };
}
