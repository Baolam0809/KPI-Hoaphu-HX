import React, { useState } from 'react';
import { HelpCircle, Calculator, PhoneCall, Mail, MessageSquare, Award, Check } from 'lucide-react';

export default function UtilitiesTab() {
  const [passCount, setPassCount] = useState(38);
  const [totalCount, setTotalCount] = useState(40);

  const calculateResult = () => {
    if (totalCount <= 0) return { pct: 0, text: 'Mục tiêu không hợp lệ', class: 'text-red-600' };
    if (passCount > totalCount) return { pct: 0, text: 'Số đạt không thể lớn hơn tổng số', class: 'text-red-600' };

    const pct = Math.round((passCount / totalCount) * 100);
    let rating = 'Yếu kém';
    let colorClass = 'text-red-600';

    if (pct >= 90) {
      rating = 'Xuất sắc';
      colorClass = 'text-emerald-600';
    } else if (pct >= 80) {
      rating = 'Giỏi';
      colorClass = 'text-sky-600';
    } else if (pct >= 70) {
      rating = 'Khá';
      colorClass = 'text-amber-500';
    } else if (pct >= 60) {
      rating = 'Trung bình';
      colorClass = 'text-orange-400';
    }

    return { pct, text: `${pct}% (Xếp loại thi đua: ${rating})`, class: colorClass };
  };

  const result = calculateResult();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5" id="utilities-help-tab">
      <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-blue-900" /> Hướng Dẫn Sử Dụng &amp; Tiện Ích Học Đường
      </h3>
      
      <div className="space-y-4 text-xs md:text-sm">
        <div className="border-l-4 border-blue-900 pl-3 py-1 bg-slate-50 rounded-r-lg p-3">
          <h4 className="font-bold text-slate-800 text-xs md:text-sm">Quy trình đánh giá chất lượng tại THCS Hòa Phú</h4>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            <strong>Đầu năm học / Đầu kỳ:</strong> Giáo viên và Nhân viên tự chủ động thiết lập mục tiêu OKR đổi mới dựa trên định hướng phát triển trường học thông minh của BGH.<br />
            <strong>Cuối kỳ học:</strong> BGH tiến hành chấm điểm KPI thực đạt định lượng, rà soát mức độ hoàn thành các chỉ số OKRs và xếp loại thi đua tự động.
          </p>
        </div>

        <div className="border-l-4 border-red-700 pl-3 py-1 bg-slate-50 rounded-r-lg p-3">
          <h4 className="font-bold text-slate-800 text-xs md:text-sm">Thông tin hỗ trợ kỹ thuật và quản trị viên</h4>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Mọi thắc mắc về phân quyền tài khoản, đề xuất bổ sung tiêu chí đo lường KPI hoặc yêu cầu reset mật khẩu cán bộ, xin vui lòng liên hệ admin Nghiêm Hồng Quân qua Zalo hỗ trợ trường hoặc gửi email trực tuyến.
          </p>
        </div>
        
        {/* Quick utilities - Pass Rate Calculator */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
          <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-600 animate-pulse" /> Công cụ quy đổi điểm học sinh
          </h4>
          <p className="text-xs text-slate-500 mb-3">Hỗ trợ giáo viên tính toán nhanh tỷ lệ học sinh đạt chuẩn từ trung bình trở lên để quy đổi vào tiêu chí chất lượng chuyên môn trong bảng KPI.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Số học sinh đạt từ trung bình trở lên</label>
              <input 
                type="number" 
                value={passCount} 
                onChange={(e) => setPassCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Tổng số học sinh được giảng dạy</label>
              <input 
                type="number" 
                value={totalCount} 
                onChange={(e) => setTotalCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-blue-900 outline-none font-bold"
              />
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" /> Tỷ lệ quy đổi tính toán:
            </span>
            <span className={`font-black text-sm ${result.class}`}>
              {result.text}
            </span>
          </div>
        </div>

        {/* Zalo links and contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-150">
            <PhoneCall className="w-5 h-5 text-blue-900 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Hotline hỗ trợ</p>
              <p className="text-xs font-black text-slate-800">0984.839.799</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-150">
            <Mail className="w-5 h-5 text-red-700 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Email kỹ thuật</p>
              <p className="text-xs font-black text-slate-800">baoyen.tmxd@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
