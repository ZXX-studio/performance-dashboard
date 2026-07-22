import { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import { getEmployeeDetail } from '../../store/usePerformanceStore';
import { GRADE_CONFIG } from '../../types/performance';

interface Props {
  employeeId: string;
  onClose: () => void;
}

export default function EmployeeDetailDialog({ employeeId, onClose }: Props) {
  const trendRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);

  const records = useMemo(() => getEmployeeDetail(employeeId), [employeeId]);
  const emp = records[0];

  // 个人趋势图
  useEffect(() => {
    if (!trendRef.current || records.length === 0) return;

    const chart = echarts.init(trendRef.current);

    const periods = records.map((r) => r.periodLabel);

    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['总分', '业绩', '能力', '态度'], bottom: 0, textStyle: { fontSize: 10 } },
      grid: { left: '3%', right: '4%', bottom: '14%', top: '8%', containLabel: true },
      xAxis: { type: 'category', data: periods },
      yAxis: { type: 'value', name: '得分', min: 0, max: 100 },
      series: [
        {
          name: '总分', type: 'line', data: records.map((r) => r.totalScore),
          smooth: true, lineStyle: { width: 3 }, itemStyle: { color: '#3B82F6' },
        },
        {
          name: '业绩', type: 'line', data: records.map((r) => r.performanceScore),
          smooth: true, lineStyle: { width: 1.5 }, itemStyle: { color: '#8B5CF6' },
        },
        {
          name: '能力', type: 'line', data: records.map((r) => r.capabilityScore),
          smooth: true, lineStyle: { width: 1.5 }, itemStyle: { color: '#22C55E' },
        },
        {
          name: '态度', type: 'line', data: records.map((r) => r.attitudeScore),
          smooth: true, lineStyle: { width: 1.5 }, itemStyle: { color: '#F59E0B' },
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [records]);

  // 个人雷达图
  useEffect(() => {
    if (!radarRef.current || !emp) return;

    const chart = echarts.init(radarRef.current);

    const latestRecord = records[records.length - 1] || emp;

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
          name: '个人得分',
          value: [
            latestRecord.performanceScore,
            latestRecord.capabilityScore,
            latestRecord.attitudeScore,
            latestRecord.innovationScore,
            latestRecord.teamworkScore,
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
  }, [emp, records]);

  if (!emp) return null;

  const gradeConf = GRADE_CONFIG[emp.grade];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {emp.employeeName} 的绩效详情
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {emp.employeeId} · {emp.department} · {emp.position}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {/* 概览卡片 */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{emp.totalScore}</div>
              <div className="text-xs text-gray-500">综合得分</div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: gradeConf.bgColor }}>
              <div className="text-2xl font-bold" style={{ color: gradeConf.color }}>{gradeConf.label}</div>
              <div className="text-xs" style={{ color: gradeConf.color }}>绩效等级</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{records.length}</div>
              <div className="text-xs text-gray-500">考核次数</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {records.length >= 2
                  ? records[records.length - 1].totalScore - records[records.length - 2].totalScore > 0
                    ? `↑${records[records.length - 1].totalScore - records[records.length - 2].totalScore}`
                    : `↓${Math.abs(records[records.length - 1].totalScore - records[records.length - 2].totalScore)}`
                  : '-'}
              </div>
              <div className="text-xs text-gray-500">最近变化</div>
            </div>
          </div>

          {/* 图表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">📈 个人趋势</p>
              <div ref={trendRef} style={{ height: 280 }} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">🎯 能力雷达（最新）</p>
              <div ref={radarRef} style={{ height: 280 }} />
            </div>
          </div>

          {/* 明细表格 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">📋 各周期明细</p>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-gray-500">周期</th>
                    <th className="px-3 py-2 text-right text-gray-500">业绩</th>
                    <th className="px-3 py-2 text-right text-gray-500">能力</th>
                    <th className="px-3 py-2 text-right text-gray-500">态度</th>
                    <th className="px-3 py-2 text-right text-gray-500">创新</th>
                    <th className="px-3 py-2 text-right text-gray-500">协作</th>
                    <th className="px-3 py-2 text-right text-gray-500">总分</th>
                    <th className="px-3 py-2 text-center text-gray-500">等级</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium">{r.periodLabel}</td>
                      <td className="px-3 py-2 text-right">{r.performanceScore}</td>
                      <td className="px-3 py-2 text-right">{r.capabilityScore}</td>
                      <td className="px-3 py-2 text-right">{r.attitudeScore}</td>
                      <td className="px-3 py-2 text-right">{r.innovationScore}</td>
                      <td className="px-3 py-2 text-right">{r.teamworkScore}</td>
                      <td className="px-3 py-2 text-right font-semibold">{r.totalScore}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: GRADE_CONFIG[r.grade].bgColor, color: GRADE_CONFIG[r.grade].color }}>
                          {r.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
