import { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { getFilteredData, getDepartmentStats } from '../../store/usePerformanceStore';
import { GRADE_CONFIG } from '../../types/performance';

interface Props {
  department: string;
  onClose: () => void;
}

export default function DepartmentDetailDialog({ department, onClose }: Props) {
  const radarRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);

  const filteredData = getFilteredData();
  const deptRecords = useMemo(() => filteredData.filter((r) => r.department === department), [filteredData, department]);
  const deptStats = getDepartmentStats();
  const stat = deptStats.find((d) => d.department === department);

  // 部门雷达图
  useEffect(() => {
    if (!radarRef.current || !stat) return;

    const chart = echarts.init(radarRef.current);

    chart.setOption({
      tooltip: { trigger: 'item' },
      radar: {
        center: ['50%', '50%'],
        radius: '70%',
        indicator: [
          { name: '工作业绩', max: 100 },
          { name: '工作能力', max: 100 },
          { name: '工作态度', max: 100 },
          { name: '创新能力', max: 100 },
          { name: '团队协作', max: 100 },
        ],
      },
      series: [{
        type: 'radar',
        data: [{
          name: department,
          value: [
            stat.avgPerformanceScore,
            stat.avgCapabilityScore,
            stat.avgAttitudeScore,
            Math.round(deptRecords.reduce((s, r) => s + r.innovationScore, 0) / deptRecords.length * 10) / 10,
            Math.round(deptRecords.reduce((s, r) => s + r.teamworkScore, 0) / deptRecords.length * 10) / 10,
          ],
          areaStyle: { color: 'rgba(59, 130, 246, 0.2)' },
          itemStyle: { color: '#3B82F6' },
          lineStyle: { color: '#3B82F6' },
        }],
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [deptRecords, department, stat]);

  // 等级分布饼图
  useEffect(() => {
    if (!pieRef.current || !stat) return;

    const chart = echarts.init(pieRef.current);

    const gradeData = (Object.entries(stat.gradeDistribution) as [string, number][])
      .filter(([_, count]) => count > 0)
      .map(([grade, count]) => ({
        name: `${grade}级`,
        value: count,
        itemStyle: { color: GRADE_CONFIG[grade as keyof typeof GRADE_CONFIG].color },
      }));

    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '50%'],
        data: gradeData,
        label: { formatter: '{b}\n{d}%', fontSize: 11 },
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [stat]);

  if (!stat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{department} - 绩效详情</h2>
            <p className="text-sm text-gray-500 mt-1">
              排名 #{stat.rank} · {stat.employeeCount} 名员工
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {/* 概览卡片 */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.avgTotalScore}</div>
              <div className="text-xs text-gray-500">平均总分</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className={`text-2xl font-bold ${stat.qualifiedRate >= 90 ? 'text-green-600' : stat.qualifiedRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                {stat.qualifiedRate}%
              </div>
              <div className="text-xs text-gray-500">达标率</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{stat.gradeDistribution.S}</div>
              <div className="text-xs text-gray-500">S级人数</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.employeeCount}</div>
              <div className="text-xs text-gray-500">总人数</div>
            </div>
          </div>

          {/* 图表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">🎯 能力雷达</p>
              <div ref={radarRef} style={{ height: 300 }} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">📊 等级分布</p>
              <div ref={pieRef} style={{ height: 300 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
