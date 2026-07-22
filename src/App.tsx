import ErrorBoundary from './components/shared/ErrorBoundary';
import { usePerformanceStore, getFilteredData } from './store/usePerformanceStore';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import KpiOverviewCards from './components/dashboard/KpiOverviewCards';
import DepartmentComparison from './components/dashboard/DepartmentComparison';
import PersonalRanking from './components/dashboard/PersonalRanking';
import IndicatorAchievement from './components/dashboard/IndicatorAchievement';
import TrendAnalysis from './components/dashboard/TrendAnalysis';
import EmployeeDetailDialog from './components/dashboard/EmployeeDetailDialog';
import DepartmentDetailDialog from './components/dashboard/DepartmentDetailDialog';

function App() {
  const selectedEmployee = usePerformanceStore((s) => s.selectedEmployee);
  const setSelectedEmployee = usePerformanceStore((s) => s.setSelectedEmployee);
  const selectedDepartment = usePerformanceStore((s) => s.selectedDepartment);
  const setSelectedDepartment = usePerformanceStore((s) => s.setSelectedDepartment);
  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[calc(100%-16rem)]" id="dashboard-content">
          <div className="space-y-6">
            <ErrorBoundary><KpiOverviewCards /></ErrorBoundary>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ErrorBoundary><DepartmentComparison /></ErrorBoundary>
              <ErrorBoundary><PersonalRanking /></ErrorBoundary>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ErrorBoundary><IndicatorAchievement /></ErrorBoundary>
              <ErrorBoundary><TrendAnalysis /></ErrorBoundary>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">📋 绩效明细数据</h3>
                <p className="text-sm text-gray-500 mt-0.5">共 {filteredData.length} 条记录</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">工号</th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">姓名</th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">部门</th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">团队</th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">周期</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">业绩</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">能力</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">态度</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">创新</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">协作</th>
                      <th className="px-4 py-3 text-right text-gray-500 font-medium">总分</th>
                      <th className="px-4 py-3 text-center text-gray-500 font-medium">等级</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 50).map((r) => (
                      <tr key={`${r.employeeId}-${r.periodLabel}`} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedEmployee(r.employeeId)}>
                        <td className="px-4 py-2.5 text-gray-500">{r.employeeId}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-900">{r.employeeName}</td>
                        <td className="px-4 py-2.5 text-gray-500">{r.department}</td>
                        <td className="px-4 py-2.5 text-gray-500">{r.team}</td>
                        <td className="px-4 py-2.5">{r.periodLabel}</td>
                        <td className="px-4 py-2.5 text-right">{r.performanceScore}</td>
                        <td className="px-4 py-2.5 text-right">{r.capabilityScore}</td>
                        <td className="px-4 py-2.5 text-right">{r.attitudeScore}</td>
                        <td className="px-4 py-2.5 text-right">{r.innovationScore}</td>
                        <td className="px-4 py-2.5 text-right">{r.teamworkScore}</td>
                        <td className="px-4 py-2.5 text-right font-semibold">{r.totalScore}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.grade === 'S' ? 'bg-purple-100 text-purple-700' :
                            r.grade === 'A' ? 'bg-blue-100 text-blue-700' :
                            r.grade === 'B' ? 'bg-green-100 text-green-700' :
                            r.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{r.grade}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredData.length > 50 && (
                <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500 border-t border-gray-100">
                  仅展示前 50 条，共 {filteredData.length} 条记录
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {selectedEmployee && (
        <EmployeeDetailDialog employeeId={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}
      {selectedDepartment && (
        <DepartmentDetailDialog department={selectedDepartment} onClose={() => setSelectedDepartment(null)} />
      )}
    </div>
  );
}

export default App;
