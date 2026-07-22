import type { PerformanceRecord, PeriodType, PerformanceGrade } from '../types/performance';

// 简单的种子随机数生成器，保证每次生成数据一致
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function randBetween(min: number, max: number): number {
  return Math.round(min + rand() * (max - min));
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// 部门配置
const DEPARTMENTS = [
  { name: '技术部', teams: ['前端组', '后端组', '测试组', '架构组'] },
  { name: '市场部', teams: ['品牌组', '投放组', '内容组'] },
  { name: '销售部', teams: ['直销组', '渠道组', '大客户组'] },
  { name: '人力资源部', teams: ['招聘组', '培训组', '薪酬组'] },
  { name: '财务部', teams: ['会计组', '预算组', '审计组'] },
];

const POSITIONS: Record<string, string[]> = {
  '技术部': ['高级工程师', '工程师', '初级工程师', '技术经理', '架构师'],
  '市场部': ['市场经理', '市场专员', '品牌主管', '投放专员'],
  '销售部': ['销售经理', '销售代表', '大客户经理', '渠道经理'],
  '人力资源部': ['HR经理', 'HR专员', '招聘主管', '培训主管'],
  '财务部': ['财务经理', '会计', '财务分析师', '审计专员'],
};

const NAMES = [
  '张伟', '李娜', '王芳', '刘洋', '陈静', '杨帆', '赵敏', '黄磊',
  '周杰', '吴鑫', '徐慧', '孙超', '马丽', '朱强', '胡斌', '郭琳',
  '何勇', '高洁', '林涛', '罗敏', '梁宇', '宋佳', '唐亮', '韩雪',
  '冯凯', '董娜', '袁浩', '邓婷', '许峰', '傅蓉', '沈鹏', '曹菲',
  '彭波', '吕静', '苏磊', '蒋瑶', '蔡阳', '潘雨',
];

// 部门基准分（模拟各部门的整体水平差异）
const DEPT_BASE_SCORES: Record<string, number> = {
  '技术部': 78,
  '市场部': 74,
  '销售部': 72,
  '人力资源部': 76,
  '财务部': 75,
};

// 生成模拟数据
export function generateMockData(): PerformanceRecord[] {
  const records: PerformanceRecord[] = [];
  const years = [2024];
  const quarters = [
    { num: 1, label: 'Q1' },
    { num: 2, label: 'Q2' },
    { num: 3, label: 'Q3' },
    { num: 4, label: 'Q4' },
  ];

  let employeeIdCounter = 1;

  for (const dept of DEPARTMENTS) {
    const employeeCount = randBetween(5, 8);
    const deptEmployees: { id: string; name: string; team: string; position: string }[] = [];

    for (let i = 0; i < employeeCount; i++) {
      const empId = `EMP${String(employeeIdCounter).padStart(4, '0')}`;
      employeeIdCounter++;
      deptEmployees.push({
        id: empId,
        name: randChoice(NAMES),
        team: randChoice(dept.teams),
        position: randChoice(POSITIONS[dept.name]),
      });
    }

    // 为每个员工每个季度生成数据
    for (const emp of deptEmployees) {
      // 员工基础能力分（不同员工有差异，模拟个体差异）
      const baseAbility = DEPT_BASE_SCORES[dept.name] + randBetween(-8, 8);

      for (const q of quarters) {
        // 季度波动因子：Q1稍低，Q2-Q3上升，Q4稳定（模拟真实趋势）
        const seasonalFactors: Record<number, number> = { 1: -2, 2: 1, 3: 3, 4: 1 };
        const seasonAdjust = seasonalFactors[q.num] + randBetween(-3, 3);

        // 各项得分 = 基础能力 + 季度波动 + 随机噪声
        const performanceScore = Math.min(100, Math.max(30, baseAbility + seasonAdjust + randBetween(-5, 5)));
        const capabilityScore = Math.min(100, Math.max(30, baseAbility + randBetween(-3, 3) + q.num * 0.5));
        const attitudeScore = Math.min(100, Math.max(30, baseAbility + randBetween(-4, 4) + (q.num > 2 ? 1 : -1)));
        const innovationScore = Math.min(100, Math.max(30, baseAbility - 5 + randBetween(-5, 8) + q.num));
        const teamworkScore = Math.min(100, Math.max(30, baseAbility + randBetween(-6, 6)));

        // 加权总分（模拟：业绩40% + 能力25% + 态度15% + 创新10% + 团队10%）
        const totalScore = Math.round(
          performanceScore * 0.4 +
          capabilityScore * 0.25 +
          attitudeScore * 0.15 +
          innovationScore * 0.10 +
          teamworkScore * 0.10
        );

        // 等级判定
        let grade: PerformanceGrade;
        if (totalScore >= 90) grade = 'S';
        else if (totalScore >= 80) grade = 'A';
        else if (totalScore >= 70) grade = 'B';
        else if (totalScore >= 60) grade = 'C';
        else grade = 'D';

        records.push({
          employeeId: emp.id,
          employeeName: emp.name,
          department: dept.name,
          team: emp.team,
          position: emp.position,
          periodType: '季度' as PeriodType,
          year: years[0],
          periodNumber: q.num,
          periodLabel: `2024-${q.label}`,
          performanceScore,
          capabilityScore,
          attitudeScore,
          innovationScore,
          teamworkScore,
          totalScore,
          grade,
          isQualified: totalScore >= 60,
          comment: '',
        });
      }
    }
  }

  return records;
}

export const mockData = generateMockData();
