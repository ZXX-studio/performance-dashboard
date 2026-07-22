import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  PerformanceRecord,
  FilterState,
  DepartmentStats,
  EmployeeRanking,
  IndicatorAchievement,
  TrendDataPoint,
  OverviewStats,
  PerformanceGrade,
} from '../types/performance';
import {
  calcDepartmentStats,
  calcEmployeeRankings,
  calcIndicatorAchievements,
  calcTrendData,
  calcOverviewStats,
} from '../utils/statistics';
import { mockData } from '../data/mockData';

interface PerformanceStore {
  rawData: PerformanceRecord[];
  dataSource: 'mock' | 'uploaded';
  fileName: string | null;
  filters: FilterState;
  selectedDepartment: string | null;
  selectedEmployee: string | null;
  setRawData: (data: PerformanceRecord[], fileName?: string) => void;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  setSelectedDepartment: (dept: string | null) => void;
  setSelectedEmployee: (empId: string | null) => void;
}

const defaultFilters: FilterState = {
  periodType: '全部',
  year: '全部',
  periodNumber: '全部',
  departments: [],
  grades: [],
};

export const usePerformanceStore = create<PerformanceStore>()(
  subscribeWithSelector((set) => ({
    rawData: mockData,
    dataSource: 'mock',
    fileName: null,
    filters: { ...defaultFilters },
    selectedDepartment: null,
    selectedEmployee: null,

    setRawData: (data, fileName) => {
      set({
        rawData: data,
        dataSource: fileName ? 'uploaded' : 'mock',
        fileName: fileName || null,
        filters: { ...defaultFilters },
        selectedDepartment: null,
        selectedEmployee: null,
      });
    },

    setFilter: (key, value) => {
      set((state) => ({
        filters: { ...state.filters, [key]: value },
      }));
    },

    resetFilters: () => {
      set({
        filters: { ...defaultFilters },
        selectedDepartment: null,
        selectedEmployee: null,
      });
    },

    setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
    setSelectedEmployee: (empId) => set({ selectedEmployee: empId }),
  }))
);

// ===== 计算函数 - 纯函数，从 store 读取状态 =====

export function getFilteredData(): PerformanceRecord[] {
  const { rawData, filters } = usePerformanceStore.getState();
  let result = [...rawData];
  if (filters.periodType !== '全部') result = result.filter(r => r.periodType === filters.periodType);
  if (filters.year !== '全部') result = result.filter(r => r.year === filters.year);
  if (filters.periodNumber !== '全部') result = result.filter(r => r.periodNumber === filters.periodNumber);
  if (filters.departments.length > 0) result = result.filter(r => filters.departments.includes(r.department));
  if (filters.grades.length > 0) result = result.filter(r => filters.grades.includes(r.grade));
  return result;
}

export function getDepartmentStats(): DepartmentStats[] {
  const data = getFilteredData();
  const { rawData, filters } = usePerformanceStore.getState();
  let prevData: PerformanceRecord[] | undefined;
  if (filters.periodNumber !== '全部' && typeof filters.periodNumber === 'number') {
    const prevPeriod = filters.periodNumber - 1;
    if (prevPeriod >= 1) {
      prevData = rawData.filter(r => r.periodNumber === prevPeriod);
    }
  }
  return calcDepartmentStats(data, prevData);
}

export function getEmployeeRankings(): EmployeeRanking[] {
  return calcEmployeeRankings(getFilteredData());
}

export function getIndicatorAchievements(): IndicatorAchievement[] {
  return calcIndicatorAchievements(getFilteredData());
}

export function getTrendData(): TrendDataPoint[] {
  return calcTrendData(getFilteredData());
}

export function getOverviewStats(): OverviewStats {
  const data = getFilteredData();
  const { rawData, filters } = usePerformanceStore.getState();
  let prevData: PerformanceRecord[] | undefined;
  if (filters.periodNumber !== '全部' && typeof filters.periodNumber === 'number') {
    const prevPeriod = filters.periodNumber - 1;
    if (prevPeriod >= 1) {
      prevData = rawData.filter(r => r.periodNumber === prevPeriod);
    }
  }
  return calcOverviewStats(data, prevData);
}

export function getAvailableYears(): number[] {
  const years = new Set(usePerformanceStore.getState().rawData.map(r => r.year));
  return Array.from(years).sort();
}

export function getAvailablePeriodNumbers(): number[] {
  const nums = new Set(usePerformanceStore.getState().rawData.map(r => r.periodNumber));
  return Array.from(nums).sort();
}

export function getAllDepartments(): string[] {
  const depts = new Set(usePerformanceStore.getState().rawData.map(r => r.department));
  return Array.from(depts).sort();
}

export function getAllGrades(): PerformanceGrade[] {
  return ['S', 'A', 'B', 'C', 'D'];
}

export function getEmployeeDetail(empId: string): PerformanceRecord[] {
  return usePerformanceStore.getState().rawData
    .filter(r => r.employeeId === empId)
    .sort((a, b) => a.periodLabel.localeCompare(b.periodLabel));
}
