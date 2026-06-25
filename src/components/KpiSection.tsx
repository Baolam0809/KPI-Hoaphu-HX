import React, { useState, useRef } from 'react';
import { 
  LineChart, 
  AlertTriangle, 
  Info,
  Plus,
  Trash2,
  Image as ImageIcon,
  Link2,
  Youtube,
  FileText,
  FileSpreadsheet,
  Cloud,
  Upload,
  X,
  ExternalLink,
  Eye,
  Paperclip
} from 'lucide-react';
import { KPI, Evidence } from '../types';

interface KpiSectionProps {
  kpis: KPI[];
  onKpiValueChange: (index: number, value: number) => void;
  onKpiEvidencesChange?: (index: number, evidences: Evidence[]) => void;
  readOnly?: boolean;
}

const getEvidenceIcon = (type: string, fileType?: string) => {
  if (type === 'image') return <ImageIcon className="w-3.5 h-3.5" />;
  switch (fileType) {
    case 'drive':
      return <Cloud className="w-3.5 h-3.5 text-emerald-600" />;
    case 'youtube':
      return <Youtube className="w-3.5 h-3.5 text-rose-600" />;
    case 'word':
      return <FileText className="w-3.5 h-3.5 text-blue-600" />;
    case 'excel':
      return <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />;
    default:
      return <Link2 className="w-3.5 h-3.5 text-slate-600" />;
  }
};

const getEvidenceBadgeClass = (type: string, fileType?: string) => {
  if (type === 'image') return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
  switch (fileType) {
    case 'drive':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    case 'youtube':
      return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
    case 'word':
      return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    case 'excel':
      return 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
  }
};

export default function KpiSection({ 
  kpis, 
  onKpiValueChange, 
  onKpiEvidencesChange,
  readOnly = false 
}: KpiSectionProps) {
  
  // Custom states for adding evidence modal
  const [activeKpiIndex, setActiveKpiIndex] = useState<number | null>(null);
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceType, setEvidenceType] = useState<'image' | 'link'>('image');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkType, setLinkType] = useState<'drive' | 'youtube' | 'word' | 'excel' | 'other'>('drive');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview full size image state
  const [previewImage, setPreviewImage] = useState<{name: string, url: string} | null>(null);

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

  const handleLinkUrlChange = (url: string) => {
    setLinkUrl(url);
    
    // Auto-detect document/link types
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('drive.google.com') || lowerUrl.includes('docs.google.com')) {
      setLinkType('drive');
    } else if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      setLinkType('youtube');
    } else if (lowerUrl.includes('xlsx') || lowerUrl.includes('excel') || lowerUrl.includes('sheet')) {
      setLinkType('excel');
    } else if (lowerUrl.includes('docx') || lowerUrl.includes('word') || lowerUrl.includes('doc')) {
      setLinkType('word');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Chỉ hỗ trợ các tệp tin hình ảnh (PNG, JPG, JPEG, GIF...) làm minh chứng.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadError('Dung lượng ảnh quá lớn. Hãy chọn ảnh dưới 5MB.');
      return;
    }

    setUploadError('');
    if (!evidenceName) {
      setEvidenceName(file.name.split('.')[0]);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageBase64(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEvidence = () => {
    if (activeKpiIndex === null || !onKpiEvidencesChange) return;

    if (!evidenceName.trim()) {
      setUploadError('Vui lòng nhập tên tiêu đề minh chứng.');
      return;
    }

    let url = '';
    if (evidenceType === 'image') {
      if (!imageBase64) {
        setUploadError('Vui lòng chọn một hình ảnh làm minh chứng.');
        return;
      }
      url = imageBase64;
    } else {
      if (!linkUrl.trim()) {
        setUploadError('Vui lòng nhập đường dẫn liên kết.');
        return;
      }
      if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
        setUploadError('Đường dẫn hợp lệ phải bắt đầu bằng http:// hoặc https://');
        return;
      }
      url = linkUrl;
    }

    const currentEvidences = kpis[activeKpiIndex].evidences || [];
    const newEvidence: Evidence = {
      id: `ev-${Date.now()}`,
      name: evidenceName.trim(),
      type: evidenceType,
      url: url,
      fileType: evidenceType === 'image' ? 'image' : linkType,
      uploadedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})
    };

    onKpiEvidencesChange(activeKpiIndex, [...currentEvidences, newEvidence]);
    
    // Reset states
    setActiveKpiIndex(null);
    setEvidenceName('');
    setEvidenceType('image');
    setLinkUrl('');
    setLinkType('drive');
    setImageBase64('');
    setUploadError('');
  };

  const handleDeleteEvidence = (kpiIndex: number, evidenceId: string) => {
    if (readOnly || !onKpiEvidencesChange) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa tệp minh chứng này không?')) {
      const currentEvidences = kpis[kpiIndex].evidences || [];
      const updated = currentEvidences.filter(ev => ev.id !== evidenceId);
      onKpiEvidencesChange(kpiIndex, updated);
    }
  };

  const handleOpenEvidenceUrl = (ev: Evidence) => {
    if (ev.type === 'image') {
      setPreviewImage({ name: ev.name, url: ev.url });
    } else {
      window.open(ev.url, '_blank', 'noopener,noreferrer');
    }
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
            <p className="text-xs text-slate-500">Chỉ số đo lường định lượng bắt buộc &amp; Hồ sơ minh chứng</p>
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

      {readOnly ? (
        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex gap-1.5 items-start">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
          <span>
            <strong>Chế độ chỉ xem:</strong> Bạn đang xem điểm KPI của cán bộ khác. Toàn bộ các tiêu chí và điểm số dưới đây là cố định và không thể chỉnh sửa. Bạn vẫn có thể click vào xem các hồ sơ minh chứng.
          </span>
        </div>
      ) : (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex gap-1.5 items-start">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>Mẹo giả lập:</strong> Bạn có thể sử dụng thanh trượt hoặc trường nhập liệu trực tiếp dưới đây để thay đổi điểm số thực đạt. Điểm tổng và xếp loại thi đua cuối kỳ sẽ được tự động tính toán lại ngay tức thì!
          </span>
        </div>
      )}

      {/* KPI Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
              <th className="p-2.5 font-bold rounded-l-lg">Nhóm tiêu chí</th>
              <th className="p-2.5 font-bold text-center w-20">Trọng số</th>
              <th className="p-2.5 font-bold">Chỉ số đo lường (KPIs) &amp; Mục tiêu chuẩn</th>
              <th className="p-2.5 font-bold text-center w-36">Thực đạt (Giả lập)</th>
              <th className="p-2.5 font-bold w-64 rounded-r-lg">Hồ sơ minh chứng</th>
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
                      onChange={(e) => !readOnly && handleInputChange(index, e.target.value)}
                      disabled={readOnly}
                      className={`w-16 border rounded text-center font-bold p-1 text-xs focus:outline-none ${
                        readOnly 
                          ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed' 
                          : 'border-slate-300 text-slate-800 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={kpi.value} 
                      onChange={(e) => !readOnly && onKpiValueChange(index, parseInt(e.target.value) || 0)}
                      disabled={readOnly}
                      className={`w-24 h-1.5 ${
                        readOnly 
                          ? 'accent-slate-300 cursor-not-allowed opacity-60' 
                          : 'accent-emerald-600 cursor-pointer'
                      }`}
                    />
                  </div>
                </td>
                <td className="p-3 align-top">
                  <div className="flex flex-col gap-2">
                    {/* Existing evidences */}
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {kpi.evidences && kpi.evidences.length > 0 ? (
                        kpi.evidences.map((ev) => (
                          <div 
                            key={ev.id}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border transition max-w-full ${getEvidenceBadgeClass(ev.type, ev.fileType)}`}
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenEvidenceUrl(ev)}
                              className="flex items-center gap-1 truncate text-left focus:outline-none cursor-pointer hover:underline"
                              title={`${ev.name} (${ev.uploadedAt})`}
                            >
                              {getEvidenceIcon(ev.type, ev.fileType)}
                              <span className="truncate max-w-[120px]">{ev.name}</span>
                            </button>
                            {!readOnly && onKpiEvidencesChange && (
                              <button
                                type="button"
                                onClick={() => handleDeleteEvidence(index, ev.id)}
                                className="text-slate-400 hover:text-red-600 rounded p-0.5 transition cursor-pointer"
                                title="Xóa minh chứng này"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Chưa có minh chứng</span>
                      )}
                    </div>

                    {/* Add evidence button */}
                    {!readOnly && onKpiEvidencesChange && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveKpiIndex(index);
                          setUploadError('');
                        }}
                        className="flex items-center gap-1 self-start px-2 py-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Đính kèm minh chứng
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====== MODAL: THÊM MINH CHỨNG ====== */}
      {activeKpiIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] cursor-pointer"
          onClick={() => setActiveKpiIndex(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-fade-in cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Paperclip className="w-5 h-5" />
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Thêm hồ sơ minh chứng</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveKpiIndex(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg leading-relaxed">
              Bạn đang đính kèm tài liệu, hình ảnh hoặc liên kết minh chứng cho tiêu chuẩn: <strong className="text-slate-800">"{kpis[activeKpiIndex].criterion}"</strong>
            </p>

            <div className="space-y-4 text-xs">
              {/* Evidence Type tabs */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Loại minh chứng</label>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceType('image');
                      setUploadError('');
                    }}
                    className={`flex-1 py-1.5 text-center font-bold rounded-md transition cursor-pointer ${evidenceType === 'image' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Tải ảnh trực tiếp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceType('link');
                      setUploadError('');
                    }}
                    className={`flex-1 py-1.5 text-center font-bold rounded-md transition cursor-pointer ${evidenceType === 'link' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Gắn link liên kết
                  </button>
                </div>
              </div>

              {/* Title / Name */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Tên / Tiêu đề minh chứng *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Giấy chứng nhận GV giỏi cấp huyện, Ảnh chụp giáo án số..."
                  value={evidenceName}
                  onChange={(e) => setEvidenceName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Direct Image upload */}
              {evidenceType === 'image' && (
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Tải tệp ảnh lên</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition flex flex-col items-center justify-center gap-2"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {imageBase64 ? (
                      <div className="flex flex-col items-center gap-2">
                        <img 
                          src={imageBase64} 
                          alt="Minh chứng" 
                          className="max-h-24 object-cover rounded border border-slate-200 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[10px] font-bold text-emerald-700">Đã nạp ảnh thành công! Click để đổi ảnh khác</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="text-xs text-slate-600 font-medium">Nhấp vào đây để chọn tệp tin ảnh</span>
                        <span className="text-[10px] text-slate-400">Hỗ trợ định dạng hình ảnh (PNG, JPG, JPEG)</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* External link URL */}
              {evidenceType === 'link' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Nguồn tài liệu liên kết *</label>
                    <div className="grid grid-cols-5 gap-1.5 bg-slate-100 rounded-lg p-1 text-center font-bold text-[10px]">
                      {(['drive', 'youtube', 'word', 'excel', 'other'] as const).map((type) => {
                        const labels: Record<string, string> = {
                          drive: 'Drive',
                          youtube: 'Youtube',
                          word: 'Word',
                          excel: 'Excel',
                          other: 'Khác'
                        };
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setLinkType(type)}
                            className={`py-1 rounded cursor-pointer transition ${linkType === type ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            {labels[type]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Đường dẫn liên kết (URL) *</label>
                    <input
                      type="url"
                      placeholder="Nhập link https://drive.google.com/..., https://youtube.com/..."
                      value={linkUrl}
                      onChange={(e) => handleLinkUrlChange(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Hệ thống sẽ tự động nhận diện loại liên kết Google Drive, Youtube, Word, Excel khi bạn dán đường dẫn.</p>
                  </div>
                </div>
              )}

              {/* Error warning */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-lg text-[11px] flex gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-2 text-xs pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveKpiIndex(null)}
                  className="border border-slate-300 px-3.5 py-2 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleSaveEvidence}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer shadow-sm"
                >
                  Lưu minh chứng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: XEM ẢNH MINH CHỨNG FULL SIZE ====== */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-[70] cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-extrabold text-sm truncate">{previewImage.name}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex items-center justify-center bg-slate-100 flex-1 overflow-auto min-h-[300px]">
              <img 
                src={previewImage.url} 
                alt={previewImage.name} 
                className="max-w-full max-h-[60vh] object-contain rounded shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="bg-slate-50 p-3 text-center border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
