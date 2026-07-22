import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { getTrendData } from '../../store/usePerformanceStore';

export default function TrendAnalysis() {
  const lineRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const trendData = getTrendData();
  const [viewMode, setViewMode] = useState<'overall' | 'byDept'>('overall');

  // 主折线图：总分 + 达标率趋势
  useEffect(() => {
    if (!lineRef.current || trendData.length === 0) return;

    const chart = echarts.init(lineRef.current);

    const periods = trendData.map((d) => d.periodLabel);
    const totalScores = trendData.map((d) => d.avgTotalScore);
    const qualifiedRates = trendData.map((d) => d.qualifiedRate);

    chart.setOption({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['平均总分', '达标率'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '8%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: periods,
        boundaryGap: false,
      },
      yAxis: [
        {
          type: 'value',
          name: '得分',
          min: 50,
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
          type: 'line',
          data: totalScores,
          smooth: true,
          lineStyle: { color: '#3B82F6', width: 3 },
          itemStyle: { color: '#3B82F6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
            ]),
          },
          markLine: {
            silent: true,
            data: [{ type: 'average', name: '平均值' }],
            lineStyle: { color: '#3B82F6', type: 'dashed' },
          },
        },
        {
          name: '达标率',
          type: 'line',
          yAxisIndex: 1,
          data: qualifiedRates,
          smooth: true,
          lineStyle: { color: '#22C55E', width: 2, type: 'dashed' },
          itemStyle: { color: '#22C55E' },
          symbol: 'diamond',
          symbolSize: 8,
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [trendData]);

  // 细分指标面积图
  useEffect(() => {
    if (!areaRef.current || trendData.length === 0) return;

    const chart = echarts.init(areaRef.current);

    const periods = trendData.map((d) => d.periodLabel);

    chart.setOption({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['工作业绩', '工作能力', '工作态度'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '8%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: periods,
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: '得分',
        min: 50,
        max: 100,
      },
      series: [
        {
          name: '工作业绩',
          type: 'line',
          data: trendData.map((d) => d.avgPerformanceScore),
          smooth: true,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.3 },
          itemStyle: { color: '#3B82F6' },
        },
        {
          name: '工作能力',
          type: 'line',
          data: trendData.map((d) => d.avgCapabilityScore),
          smooth: true,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.3 },
          itemStyle: { color: '#8B5CF6' },
        },
        {
          name: '工作态度',
          type: 'line',
          data: trendData.map((d) => d.avgAttitudeScore),
          smooth: true,
          lineStyle: { width: 2 },
          areaStyle: { opacity: 0.3 },
          itemStyle: { color: '#F59E0B' },
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [trendData]);

  if (trendData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 时间趋势分析</h3>
        <div className="text-center text-gray-400 py-12">暂无数据</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">📈 时间趋势分析</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('overall')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              viewMode === 'overall' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            整体
          </button>
          <button
            onClick={() => setViewMode('byDept')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              viewMode === 'byDept' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            按部门
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-2 text-center">总分与达标率趋势</p>
          <div ref={lineRef} style={{ height: 320 }} />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2 text-center">细分指标趋势</p>
          <div ref={areaRef} style={{ height: 320 }} />
        </div>
      </div>
    </div>
  );
}
