import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { usePerformanceStore, getDepartmentStats } from '../../store/usePerformanceStore';

export default function DepartmentComparison() {
  const chartRef = useRef<HTMLDivElement>(null);
  const deptStats = getDepartmentStats();
  const setSelectedDepartment = usePerformanceStore((s) => s.setSelectedDepartment);

  useEffect(() => {
    if (!chartRef.current || deptStats.length === 0) return;

    const chart = echarts.init(chartRef.current);

    const departments = deptStats.map((d) => d.department);
    const totalScores = deptStats.map((d) => d.avgTotalScore);
    const perfScores = deptStats.map((d) => d.avgPerformanceScore);
    const capScores = deptStats.map((d) => d.avgCapabilityScore);
    const qualifiedRates = deptStats.map((d) => d.qualifiedRate);

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['平均总分', '业绩均分', '能力均分', '达标率'],
        bottom: 0,
        textStyle: { fontSize: 12 },
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '12%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: departments,
        axisLabel: { fontSize: 12 },
      },
      yAxis: [
        {
          type: 'value',
          name: '得分',
          min: 0,
          max: 100,
          axisLabel: { formatter: '{value}' },
        },
        {
          type: 'value',
          name: '达标率(%)',
          min: 0,
          max: 100,
          axisLabel: { formatter: '{value}%' },
        },
      ],
      series: [
        {
          name: '平均总分',
          type: 'bar',
          data: totalScores,
          itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 40,
          label: { show: true, position: 'top', fontSize: 11 },
        },
        {
          name: '业绩均分',
          type: 'bar',
          data: perfScores,
          itemStyle: { color: '#8B5CF6', borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 40,
        },
        {
          name: '能力均分',
          type: 'bar',
          data: capScores,
          itemStyle: { color: '#06B6D4', borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 40,
        },
        {
          name: '达标率',
          type: 'line',
          yAxisIndex: 1,
          data: qualifiedRates,
          lineStyle: { color: '#22C55E', width: 2 },
          itemStyle: { color: '#22C55E' },
          symbol: 'circle',
          symbolSize: 8,
        },
      ],
    });

    chart.on('click', (params: any) => {
      if (params.componentType === 'series' && params.seriesType === 'bar') {
        const deptName = departments[params.dataIndex];
        setSelectedDepartment(deptName);
      }
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [deptStats, setSelectedDepartment]);

  if (deptStats.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 部门绩效对比</h3>
        <div className="text-center text-gray-400 py-12">暂无数据</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 部门绩效对比</h3>
      <div ref={chartRef} style={{ height: 380 }} />
      {/* 部门排名表格 */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-gray-500 font-medium">排名</th>
              <th className="text-left py-2 px-3 text-gray-500 font-medium">部门</th>
              <th className="text-right py-2 px-3 text-gray-500 font-medium">平均分</th>
              <th className="text-right py-2 px-3 text-gray-500 font-medium">达标率</th>
              <th className="text-right py-2 px-3 text-gray-500 font-medium">S级占比</th>
              <th className="text-right py-2 px-3 text-gray-500 font-medium">人数</th>
              <th className="text-right py-2 px-3 text-gray-500 font-medium">环比</th>
            </tr>
          </thead>
          <tbody>
            {deptStats.map((d) => {
              const sRate = d.employeeCount > 0
                ? (d.gradeDistribution.S / d.employeeCount * 100).toFixed(1)
                : '0';
              return (
                <tr
                  key={d.department}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedDepartment(d.department)}
                >
                  <td className="py-2 px-3">
                    {d.rank <= 3 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                        style={{ backgroundColor: d.rank === 1 ? '#F59E0B' : d.rank === 2 ? '#94A3B8' : '#D97706' }}>
                        {d.rank}
                      </span>
                    ) : (
                      <span className="text-gray-500 px-1">{d.rank}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-medium text-gray-900">{d.department}</td>
                  <td className="py-2 px-3 text-right font-semibold">{d.avgTotalScore}</td>
                  <td className="py-2 px-3 text-right">
                    <span className={`${d.qualifiedRate >= 90 ? 'text-green-600' : d.qualifiedRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {d.qualifiedRate}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">{sRate}%</td>
                  <td className="py-2 px-3 text-right text-gray-500">{d.employeeCount}</td>
                  <td className="py-2 px-3 text-right">
                    {d.trend !== 0 && (
                      <span className={`${d.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {d.trend >= 0 ? '↑' : '↓'} {Math.abs(d.trend)}%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
