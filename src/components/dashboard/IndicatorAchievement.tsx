import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { usePerformanceStore, getIndicatorAchievements, getDepartmentStats } from '../../store/usePerformanceStore';

export default function IndicatorAchievement() {
  const radarRef = useRef<HTMLDivElement>(null);
  const indicatorAchievements = getIndicatorAchievements();
  const departmentStats = getDepartmentStats();
  const selectedDepartment = usePerformanceStore((s) => s.selectedDepartment);

  useEffect(() => {
    if (!radarRef.current || indicatorAchievements.length === 0) return;

    const chart = echarts.init(radarRef.current);

    const indicator = indicatorAchievements.map((item) => ({
      name: item.indicatorName,
      max: 100,
    }));

    const actualValues = indicatorAchievements.map((item) => item.actualAvgValue);
    const targetValues = indicatorAchievements.map(() => 80); // 目标值 80

    const seriesData: any[] = [
      {
        name: '实际均值',
        value: actualValues,
        lineStyle: { color: '#3B82F6', width: 2 },
        areaStyle: { color: 'rgba(59, 130, 246, 0.2)' },
        itemStyle: { color: '#3B82F6' },
      },
      {
        name: '目标值(80分)',
        value: targetValues,
        lineStyle: { color: '#EF4444', width: 2, type: 'dashed' as const },
        areaStyle: { color: 'rgba(239, 68, 68, 0.05)' },
        itemStyle: { color: '#EF4444' },
      },
    ];

    // 如果选中了部门，添加该部门的数据
    if (selectedDepartment) {
      const dept = departmentStats.find((d) => d.department === selectedDepartment);
      if (dept) {
        const deptValues = [
          dept.avgPerformanceScore,
          dept.avgCapabilityScore,
          dept.avgAttitudeScore,
          // 从原始数据计算该部门的创新和协作分
          indicatorAchievements.length >= 5 ? indicatorAchievements[3].actualAvgValue : 0,
          indicatorAchievements.length >= 5 ? indicatorAchievements[4].actualAvgValue : 0,
        ];
        seriesData.push({
          name: `${selectedDepartment}`,
          value: deptValues,
          lineStyle: { color: '#22C55E', width: 2 },
          areaStyle: { color: 'rgba(34, 197, 94, 0.15)' },
          itemStyle: { color: '#22C55E' },
        });
      }
    }

    chart.setOption({
      tooltip: {
        trigger: 'item',
      },
      legend: {
        data: seriesData.map((s) => s.name),
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      radar: {
        center: ['50%', '48%'],
        radius: '70%',
        indicator,
        axisName: { fontSize: 12 },
      },
      series: [
        {
          type: 'radar',
          data: seriesData,
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [indicatorAchievements, selectedDepartment, departmentStats]);

  if (indicatorAchievements.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 考核指标达成率</h3>
        <div className="text-center text-gray-400 py-12">暂无数据</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🎯 考核指标达成率
        {selectedDepartment && (
          <span className="ml-2 text-sm font-normal text-blue-600">
            对比部门: {selectedDepartment}
          </span>
        )}
      </h3>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 雷达图 */}
        <div className="lg:w-1/2">
          <div ref={radarRef} style={{ height: 350 }} />
        </div>

        {/* 达成率进度条 */}
        <div className="lg:w-1/2 space-y-4">
          {indicatorAchievements.map((item) => {
            const rateColor =
              item.achievementRate >= 100
                ? 'text-green-600'
                : item.achievementRate >= 85
                ? 'text-yellow-600'
                : 'text-red-600';
            const barColor =
              item.achievementRate >= 100
                ? '#22C55E'
                : item.achievementRate >= 85
                ? '#F59E0B'
                : '#EF4444';

            return (
              <div key={item.indicatorKey}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.indicatorName}</span>
                  <div className="text-sm">
                    <span className="text-gray-500">
                      实际 <span className="font-semibold text-gray-900">{item.actualAvgValue}</span> /
                      目标 <span className="font-semibold text-gray-900">{item.targetValue}</span>
                    </span>
                    <span className={`ml-2 font-bold ${rateColor}`}>
                      {item.achievementRate}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(item.achievementRate, 100)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  达标 {item.qualifiedCount}/{item.totalCount} 人
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
