import { usePerformanceStore, getAvailableYears, getAvailablePeriodNumbers, getAllDepartments, getAllGrades } from '../../store/usePerformanceStore';
import { GRADE_CONFIG } from '../../types/performance';
import type { PerformanceGrade } from '../../types/performance';

export default function Sidebar() {
  const filters = usePerformanceStore((s) => s.filters);
  const setFilter = usePerformanceStore((s) => s.setFilter);
  const resetFilters = usePerformanceStore((s) => s.resetFilters);
  const availableYears = getAvailableYears();
  const availablePeriodNumbers = getAvailablePeriodNumbers();
  const departments = getAllDepartments();
  const grades = getAllGrades();

  const toggleDepartment = (dept: string) => {
    const current = filters.departments;
    const updated = current.includes(dept)
      ? current.filter((d) => d !== dept)
      : [...current, dept];
    setFilter('departments', updated);
  };

  const toggleGrade = (grade: PerformanceGrade) => {
    const current = filters.grades;
    const updated = current.includes(grade)
      ? current.filter((g) => g !== grade)
      : [...current, grade];
    setFilter('grades', updated);
  };

  const hasFilters =
    filters.periodType !== '全部' ||
    filters.year !== '全部' ||
    filters.periodNumber !== '全部' ||
    filters.departments.length > 0 ||
    filters.grades.length > 0;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex-shrink-0 hidden lg:block">
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">🔍 筛选条件</h3>

          {/* 考核周期 */}
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">考核周期</label>
            <select
              value={filters.periodType}
              onChange={(e) => setFilter('periodType', e.target.value as any)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="全部">全部周期</option>
              <option value="月度">月度</option>
              <option value="季度">季度</option>
              <option value="半年度">半年度</option>
              <option value="年度">年度</option>
            </select>
          </div>

          {/* 年份 */}
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">年份</label>
            <select
              value={filters.year}
              onChange={(e) => setFilter('year', e.target.value === '全部' ? '全部' : parseInt(e.target.value))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="全部">全部年份</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          </div>

          {/* 周期序号 */}
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">周期序号</label>
            <select
              value={filters.periodNumber}
              onChange={(e) => setFilter('periodNumber', e.target.value === '全部' ? '全部' : parseInt(e.target.value))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="全部">全部</option>
              {availablePeriodNumbers.map((n) => (
                <option key={n} value={n}>
                  {filters.periodType === '季度' || filters.periodType === '全部' ? `Q${n}` : `第${n}期`}
                </option>
              ))}
            </select>
          </div>

          {/* 部门多选 */}
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">
              部门
              <span className="text-gray-400 ml-1">
                ({filters.departments.length}/{departments.length})
              </span>
            </label>
            <div className="space-y-1 max-h-36 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {departments.map((dept) => (
                <label key={dept} className="flex items-center gap-2 cursor-pointer text-sm py-1 hover:bg-gray-50 rounded px-1">
                  <input
                    type="checkbox"
                    checked={filters.departments.includes(dept)}
                    onChange={() => toggleDepartment(dept)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{dept}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 等级多选 */}
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">
              绩效等级
              <span className="text-gray-400 ml-1">
                ({filters.grades.length}/{grades.length})
              </span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {grades.map((grade) => {
                const conf = GRADE_CONFIG[grade];
                const selected = filters.grades.includes(grade);
                return (
                  <button
                    key={grade}
                    onClick={() => toggleGrade(grade)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      selected
                        ? 'text-white shadow-sm'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={selected ? { backgroundColor: conf.color } : {}}
                  >
                    {conf.label}级
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 重置 */}
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="w-full py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            重置全部筛选
          </button>
        )}
      </div>
    </aside>
  );
}
