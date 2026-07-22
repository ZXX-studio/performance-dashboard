import { useState, useCallback, useRef } from 'react';
import { usePerformanceStore } from '../../store/usePerformanceStore';
import { parseFile } from '../../utils/fileParser';
import { mockData } from '../../data/mockData';
import type { PerformanceRecord } from '../../types/performance';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DataUploadDialog({ open, onClose }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PerformanceRecord[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setRawData = usePerformanceStore((s) => s.setRawData);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setLoading(true);
    setErrors([]);

    try {
      const result = await parseFile(file);
      if (result.data.length === 0 && result.errors.length > 0) {
        setErrors(result.errors);
        setPreview([]);
      } else {
        setPreview(result.data.slice(0, 10));
        setErrors(result.errors);
        // 临时存储完整数据
        (window as any).__pendingUploadData = result.data;
      }
    } catch (e) {
      setErrors([`处理文件时出错: ${(e as Error).message}`]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleConfirm = () => {
    const data = (window as any).__pendingUploadData as PerformanceRecord[];
    if (data && data.length > 0) {
      setRawData(data, fileName);
      delete (window as any).__pendingUploadData;
      onClose();
      setPreview([]);
      setErrors([]);
      setFileName('');
    }
  };

  const handleReset = () => {
    setRawData(mockData);
    onClose();
    setPreview([]);
    setErrors([]);
    setFileName('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">📁 上传绩效数据</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          {/* 拖拽区域 */}
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-500">正在解析文件...</span>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 font-medium">拖拽文件到此处，或点击选择</p>
                <p className="text-gray-400 text-sm mt-1">支持 .xlsx / .xls / .csv 格式</p>
              </>
            )}
          </div>

          {/* 错误提示 */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium text-sm mb-2">⚠️ 数据解析警告（已自动跳过无效行）</p>
              <ul className="text-red-600 text-xs space-y-1 max-h-32 overflow-y-auto">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 预览表格 */}
          {preview.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                数据预览（前 {preview.length} 行，共 {(window as any).__pendingUploadData?.length || preview.length} 条记录）
              </p>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left text-gray-500">工号</th>
                      <th className="px-3 py-2 text-left text-gray-500">姓名</th>
                      <th className="px-3 py-2 text-left text-gray-500">部门</th>
                      <th className="px-3 py-2 text-left text-gray-500">周期</th>
                      <th className="px-3 py-2 text-right text-gray-500">总分</th>
                      <th className="px-3 py-2 text-center text-gray-500">等级</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-3 py-2">{r.employeeId}</td>
                        <td className="px-3 py-2 font-medium">{r.employeeName}</td>
                        <td className="px-3 py-2">{r.department}</td>
                        <td className="px-3 py-2">{r.periodLabel}</td>
                        <td className="px-3 py-2 text-right font-semibold">{r.totalScore}</td>
                        <td className="px-3 py-2 text-center">{r.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Excel 模板说明 */}
          <details className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <summary className="text-blue-700 font-medium text-sm cursor-pointer">
              📋 Excel 模板说明（点击展开）
            </summary>
            <div className="mt-3 text-xs text-blue-800 space-y-1">
              <p>您的 Excel 文件应包含以下列（支持中英文列名模糊匹配）：</p>
              <table className="w-full mt-2 border border-blue-200 rounded">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="px-2 py-1 text-left">列名</th>
                    <th className="px-2 py-1 text-left">说明</th>
                    <th className="px-2 py-1 text-center">必填</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="px-2 py-1">员工工号</td><td className="px-2 py-1">唯一标识</td><td className="px-2 py-1 text-center">✅</td></tr>
                  <tr><td className="px-2 py-1">员工姓名</td><td className="px-2 py-1">-</td><td className="px-2 py-1 text-center">✅</td></tr>
                  <tr><td className="px-2 py-1">所属部门</td><td className="px-2 py-1">如：技术部</td><td className="px-2 py-1 text-center">✅</td></tr>
                  <tr><td className="px-2 py-1">考核周期</td><td className="px-2 py-1">月度/季度/半年度/年度</td><td className="px-2 py-1 text-center">✅</td></tr>
                  <tr><td className="px-2 py-1">年份</td><td className="px-2 py-1">如：2024</td><td className="px-2 py-1 text-center">✅</td></tr>
                  <tr><td className="px-2 py-1">周期序号</td><td className="px-2 py-1">Q1=1, 1月=1</td><td className="px-2 py-1 text-center">✅</td></tr>
                  <tr><td className="px-2 py-1">工作业绩</td><td className="px-2 py-1">0-100分</td><td className="px-2 py-1 text-center">✅</td></tr>
                  <tr><td className="px-2 py-1">工作能力</td><td className="px-2 py-1">0-100分</td><td className="px-2 py-1 text-center">✅</td></tr>
                  <tr><td className="px-2 py-1">工作态度</td><td className="px-2 py-1">0-100分</td><td className="px-2 py-1 text-center">✅</td></tr>
                  <tr><td className="px-2 py-1">创新能力</td><td className="px-2 py-1">0-100分</td><td className="px-2 py-1 text-center">-</td></tr>
                  <tr><td className="px-2 py-1">团队协作</td><td className="px-2 py-1">0-100分</td><td className="px-2 py-1 text-center">-</td></tr>
                  <tr><td className="px-2 py-1">综合得分</td><td className="px-2 py-1">0-100分</td><td className="px-2 py-1 text-center">✅</td></tr>
                  <tr><td className="px-2 py-1">绩效等级</td><td className="px-2 py-1">S/A/B/C/D</td><td className="px-2 py-1 text-center">-</td></tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            恢复默认模拟数据
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={!preview.length}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                preview.length ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              确认导入
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
