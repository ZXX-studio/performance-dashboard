import { useState } from 'react';
import { usePerformanceStore } from '../../store/usePerformanceStore';
import { exportToExcel } from '../../utils/fileParser';
import DataUploadDialog from '../dashboard/DataUploadDialog';

export default function Header() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const dataSource = usePerformanceStore((s) => s.dataSource);
  const fileName = usePerformanceStore((s) => s.fileName);
  const rawData = usePerformanceStore((s) => s.rawData);

  const handleExportExcel = () => {
    exportToExcel(rawData, '绩效数据导出');
  };

  const handleExportPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const element = document.getElementById('dashboard-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('绩效分析报告.pdf');
    } catch (e) {
      alert(`导出 PDF 失败: ${(e as Error).message}`);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">绩效结果分析看板</h1>
                <p className="text-xs text-gray-500">
                  数据来源：
                  {dataSource === 'mock' ? (
                    <span className="text-orange-500">模拟数据</span>
                  ) : (
                    <span className="text-green-600">{fileName}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setUploadOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                上传数据
              </button>

              <div className="relative group">
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  导出
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 hidden group-hover:block min-w-[140px]">
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    📄 导出 PDF 报告
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    📊 导出 Excel 数据
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <DataUploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
