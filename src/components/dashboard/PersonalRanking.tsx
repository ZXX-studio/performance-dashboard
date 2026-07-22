import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { usePerformanceStore, getEmployeeRankings, getFilteredData } from '../../store/usePerformanceStore';
import { GRADE_CONFIG } from '../../types/performance';

export default function PersonalRanking() {
  const pieRef = useRef<HTMLDivElement>(null);
  const rankings = getEmployeeRankings();
  const setSelectedEmployee = usePerformanceStore((s) => s.setSelectedEmployee);
  const filteredData = getFilteredData();

  // 等级分布饼图
  useEffect(() => {
    if (!pieRef.current) return;

    const chart = echarts.init(pieRef.current);
    const gradeCount: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };

    for (const r of filteredData) {
      gradeCount[r.grade]++;
    }

    const gradeData = Object.entries(gradeCount).map(([grade, count]) => ({
      name: `${grade}级`,
      value: count,
      itemStyle: { color: GRADE_CONFIG[grade as keyof typeof GRADE_CONFIG].color },
    }));

    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}人 ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: ['55%', '80%'],
          center: ['50%', '50%'],
          data: gradeData,
          label: {
            formatter: '{b}\n{d}%',
            fontSize: 11,
          },
          emphasis: {
            label: { fontSize: 16, fontWeight: 'bold' },
          },
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [filteredData]);

  // 排行榜 Top 20
  const topRankings = rankings.slice(0, 20);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 个人绩效排行</h3>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 等级分布饼图 */}
        <div className="lg:w-1/3">
          <div ref={pieRef} style={{ height: 280 }} />
          <p className="text-center text-sm text-gray-500 mt-2">绩效等级分布</p>
        </div>

        {/* 排行榜表格 */}
        <div className="lg:w-2/3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-2 text-gray-500 font-medium w-10">#</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">工号</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">姓名</th>
                <th className="text-left py-2 px-2 text-gray-500 font-medium">部门</th>
                <th className="text-right py-2 px-2 text-gray-500 font-medium">总分</th>
                <th className="text-center py-2 px-2 text-gray-500 font-medium">等级</th>
              </tr>
            </thead>
            <tbody>
              {topRankings.map((r) => {
                const gradeConf = GRADE_CONFIG[r.grade];
                return (
                  <tr
                    key={r.employeeId}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedEmployee(r.employeeId)}
                  >
                    <td className="py-2 px-2">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        r.rank <= 3 ? 'text-white' : 'text-gray-500'
                      }`}
                        style={{ backgroundColor: r.rank === 1 ? '#F59E0B' : r.rank === 2 ? '#94A3B8' : r.rank === 3 ? '#D97706' : '#F3F4F6' }}>
                        {r.rank}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-500">{r.employeeId}</td>
                    <td className="py-2 px-2 font-medium text-gray-900">{r.employeeName}</td>
                    <td className="py-2 px-2 text-gray-500">{r.department}</td>
                    <td className="py-2 px-2 text-right font-semibold">{r.totalScore}</td>
                    <td className="py-2 px-2 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: gradeConf.bgColor, color: gradeConf.color }}>
                        {gradeConf.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rankings.length > 20 && (
            <p className="text-center text-sm text-gray-400 mt-3">
              仅展示前 20 名，共 {rankings.length} 人
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
