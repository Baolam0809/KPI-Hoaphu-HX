import React from 'react';
import { LineChart, AlertTriangle } from 'lucide-react';
import { KPI } from '../types';

interface KpiSectionProps {
  kpis: KPI[];
  onKpiValueChange: (index: number, value: number) => void;
}

export default function KpiSection({ kpis, onKpiValueChange }: KpiSectionProps) {
  // Tính tổng điểm KPI có trọng số
  const calculateTotal = () => {
    let weightedSum = 0;
    let totalWeight = 0;

    kpis.forEach(kpi => {
      weightedSum += kpi.value * (kpi.weight / 100);
      totalWeight += kpi.weight;
    });

    if (totalWeight === 0) return 0;
    return Math.round(weightedSum);
  };

  const finalScore = calculateTotal();

  const getRatingInfo = (score: number) => {
    if (score >= 90) return { text: 'Xuất sắc', class: 'bg-emerald-600 text-white' };
    if (score >= 80) return { text: 'Giỏi', class: 'bg-sky-600 text-white' };
    if (score >= 70) return { text: 'Khá', class: 'bg-amber-500 text-white' };
    if (score >= 60) return { text: 'Trung bình', class: 'bg-orange-400 text-white' };
    return { text: 'Yếu kém', class: 'bg-red-600 text-white' };
  };

  const rating = getRatingInfo(finalScore);

  const handleInputChange = (index: number, val: string) => {
    let num = parseInt(val) || 0;
    if (num > 100) num = 100;
    if (num < 0) num = 0;
    onKpiValueChange(index, num);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5" id="kpi-workspace">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <LineChart className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Chỉ Số Vận Hành (KPI)</h3>
            <p className="text-xs text-slate-500">Chỉ số đo lường định lượng bắt buộc</p>
          </div>
        </div>
        
        {/* Score badge */}
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-1.5 text-center flex items-center justify-between gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold whitespace-nowrap">Tổng Điểm KPI:</span>
          <span className="text-lg font-black text-emerald-600">{finalScore}/100</span>
          <span className={`text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap ${rating.class}`}>
            {rating.text}
          </span>
        </div>
      </div>

      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex gap-1.5 items-start">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <span>
          <strong>Mẹo giả lập:</strong> Bạn có thể sử dụng thanh trượt hoặc trường nhập liệu trực tiếp dưới đây để thay đổi điểm số thực đạt. Điểm tổng và xếp loại thi đua cuối kỳ sẽ được tự động tính toán lại ngay tức thì!
        </span>
      </div>

      {/* KPI Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
              <th className="p-2.5 font-bold rounded-l-lg">Nhóm tiêu chí</th>
              <th className="p-2.5 font-bold text-center w-20">Trọng số</th>
              <th className="p-2.5 font-bold">Chỉ số đo lường (KPIs) &amp; Mục tiêu chuẩn</th>
              <th className="p-2.5 font-bold text-center w-36">Thực đạt (Giả lập)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {kpis.map((kpi, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition">
                <td className="p-3 font-bold text-slate-900 align-top max-w-[150px]">
                  {kpi.criterion}
                </td>
                <td className="p-3 text-center text-slate-500 font-extrabold align-top">
                  {kpi.weight}%
                </td>
                <td className="p-3 align-top text-slate-600 leading-relaxed">
                  {kpi.desc}
                </td>
                <td className="p-3 align-top">
                  <div className="flex flex-col gap-1.5 items-center justify-center">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={kpi.value} 
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      className="w-16 border border-slate-300 rounded text-center font-bold text-slate-800 p-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={kpi.value} 
                      onChange={(e) => onKpiValueChange(index, parseInt(e.target.value) || 0)}
                      className="w-24 accent-emerald-600 h-1.5 cursor-pointer"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
