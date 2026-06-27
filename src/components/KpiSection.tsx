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
  Paperclip,
  RotateCcw,
  Edit3,
  Save
} from 'lucide-react';
import { KPI, Evidence, User } from '../types';

interface KpiSectionProps {
  kpis: KPI[];
  onKpiValueChange: (index: number, value: number) => void;
  onKpiEvidencesChange?: (index: number, evidences: Evidence[]) => void;
  onKpisChange?: (kpis: KPI[]) => void;
  onResetKpis?: () => void;
  readOnly?: boolean;
  onKpiScoresChange?: (index: number, scores: { selfScore?: number; leaderScore?: number; bghScore?: number }) => void;
  activeUser?: User;
  onUpdateUserRatingOverride?: (rating?: string) => void;
  isBghOrAdmin?: boolean;
  isBghOrToTruong?: boolean;
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
  onKpisChange,
  onResetKpis,
  readOnly = false,
  onKpiScoresChange,
  activeUser,
  onUpdateUserRatingOverride,
  isBghOrAdmin = false,
  isBghOrToTruong = false
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

  // States for editing criteria and weights
  const [isEditing, setIsEditing] = useState(false);
  const [editKpis, setEditKpis] = useState<KPI[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Deduplicate KPIs to avoid display issues if any duplicate records exist
  const displayedKpis = kpis.filter((item, index) => 
    kpis.findIndex(k => k.criterion === item.criterion) === index
  );

  const handleStartEditing = () => {
    setEditKpis(JSON.parse(JSON.stringify(displayedKpis)));
    setValidationError(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setValidationError(null);
    setIsEditing(false);
  };

  const handleSaveEditing = () => {
    if (onKpisChange) {
      const totalWeight = editKpis.reduce((sum, k) => sum + k.weight, 0);
      if (totalWeight !== 100) {
        setValidationError(`Tổng trọng số KPI của các tiêu chí phải bằng 100%! Hiện tại là: ${totalWeight}%`);
        return;
      }
      setValidationError(null);
      onKpisChange(editKpis);
    }
    setIsEditing(false);
  };

  const handleEditKpiField = (index: number, field: keyof KPI, val: any) => {
    const updated = [...editKpis];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        [field]: val
      };
      setEditKpis(updated);
    }
  };

  const handleDeleteEditKpi = (index: number) => {
    const updated = editKpis.filter((_, i) => i !== index);
    setEditKpis(updated);
  };

  const handleAddEditKpi = () => {
    setEditKpis([
      ...editKpis,
      {
        criterion: `${editKpis.length + 1}. Tiêu chí mới`,
        weight: 0,
        desc: "Mô tả chỉ số đo lường và mục tiêu chuẩn.",
        value: 100
      }
    ]);
  };

  // Lưu thông tin bản nháp (draft) của minh chứng đang làm dở/chưa xong theo từng tiêu chí KPI
  const [drafts, setDrafts] = useState<Record<number, {
    evidenceName: string;
    evidenceType: 'image' | 'link';
    linkUrl: string;
    linkType: 'drive' | 'youtube' | 'word' | 'excel' | 'other';
    imageBase64: string;
    uploadError: string;
  }>>({});

  // Preview full size image state
  const [previewImage, setPreviewImage] = useState<{name: string, url: string} | null>(null);

  // Tính tổng điểm KPI có trọng số (BGH, Tổ trưởng, Cá nhân tự chấm)
  const calculateTotals = () => {
    let selfSum = 0;
    let leaderSum = 0;
    let bghSum = 0;
    let totalWeight = 0;

    const sourceList = isEditing ? editKpis : displayedKpis;

    sourceList.forEach(kpi => {
      totalWeight += kpi.weight;
      
      const selfVal = kpi.selfScore !== undefined ? kpi.selfScore : kpi.value;
      const leaderVal = kpi.leaderScore !== undefined ? kpi.leaderScore : Math.max(0, kpi.value - (kpi.value % 5 || 2));
      const bghVal = kpi.bghScore !== undefined ? kpi.bghScore : Math.max(0, kpi.value - (kpi.value % 7 || 3));

      selfSum += selfVal * kpi.weight;
      leaderSum += leaderVal * kpi.weight;
      bghSum += bghVal * kpi.weight;
    });

    if (totalWeight === 0) return { self: 0, leader: 0, bgh: 0 };
    return {
      self: Math.round(selfSum / totalWeight),
      leader: Math.round(leaderSum / totalWeight),
      bgh: Math.round(bghSum / totalWeight)
    };
  };

  const totals = calculateTotals();
  const finalScore = totals.bgh;

  const getRatingInfo = (score: number) => {
    if (score >= 90) return { text: 'Xuất sắc', class: 'bg-emerald-600 text-white font-bold' };
    if (score >= 80) return { text: 'Hoàn thành tốt nhiệm vụ', class: 'bg-sky-600 text-white font-bold' };
    if (score >= 60) return { text: 'Hoàn thành nhiệm vụ', class: 'bg-amber-500 text-white font-bold' };
    return { text: 'Không hoàn thành nhiệm vụ', class: 'bg-red-600 text-white font-bold' };
  };

  const getAppliedRating = (score: number) => {
    if (activeUser?.bghRatingOverride) {
      let rClass = 'bg-slate-600 text-white font-bold';
      if (activeUser.bghRatingOverride === 'Xuất sắc') rClass = 'bg-emerald-600 text-white font-bold';
      if (activeUser.bghRatingOverride === 'Hoàn thành tốt nhiệm vụ') rClass = 'bg-sky-600 text-white font-bold';
      if (activeUser.bghRatingOverride === 'Hoàn thành nhiệm vụ') rClass = 'bg-amber-500 text-white font-bold';
      if (activeUser.bghRatingOverride === 'Không hoàn thành nhiệm vụ') rClass = 'bg-red-600 text-white font-bold';
      return { text: activeUser.bghRatingOverride, class: rClass };
    }
    return getRatingInfo(score);
  };

  const rating = getAppliedRating(finalScore);

  const handleScoreFieldChange = (index: number, field: 'selfScore' | 'leaderScore' | 'bghScore', val: number) => {
    if (onKpiScoresChange) {
      onKpiScoresChange(index, { [field]: val });
    } else {
      onKpiValueChange(index, val);
    }
  };

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
    
    // Xóa bản nháp sau khi đã lưu thành công
    setDrafts(prev => {
      const copy = { ...prev };
      delete copy[activeKpiIndex];
      return copy;
    });

    // Reset states
    setActiveKpiIndex(null);
    setEvidenceName('');
    setEvidenceType('image');
    setLinkUrl('');
    setLinkType('drive');
    setImageBase64('');
    setUploadError('');
  };

  const openEvidenceModal = (index: number) => {
    setActiveKpiIndex(index);
    const draft = drafts[index];
    if (draft) {
      setEvidenceName(draft.evidenceName);
      setEvidenceType(draft.evidenceType);
      setLinkUrl(draft.linkUrl);
      setLinkType(draft.linkType);
      setImageBase64(draft.imageBase64);
      setUploadError(draft.uploadError);
    } else {
      setEvidenceName('');
      setEvidenceType('image');
      setLinkUrl('');
      setLinkType('drive');
      setImageBase64('');
      setUploadError('');
    }
  };

  const handleCloseEvidenceModal = () => {
    if (activeKpiIndex !== null) {
      // Tự động lưu thông tin làm dở vào bản nháp khi đóng modal xuống (kích chuột ra khoảng trống hoặc ấn quay lại)
      setDrafts(prev => ({
        ...prev,
        [activeKpiIndex]: {
          evidenceName,
          evidenceType,
          linkUrl,
          linkType,
          imageBase64,
          uploadError
        }
      }));
    }
    setActiveKpiIndex(null);
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <LineChart className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Chỉ Số Vận Hành (KPI)</h3>
            <p className="text-xs text-slate-500">Chỉ số đo lường định lượng bắt buộc &amp; Hồ sơ minh chứng</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Reset button */}
          {!readOnly && isBghOrAdmin && onResetKpis && (
            <button
              onClick={onResetKpis}
              type="button"
              className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-1 transition shadow-2xs cursor-pointer select-none"
              title="Khôi phục toàn bộ chỉ số KPI về mẫu chuẩn mặc định"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Đặt lại mặc định
            </button>
          )}

          {/* Edit/Save button */}
          {!readOnly && isBghOrAdmin && onKpisChange && (
            isEditing ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSaveEditing}
                  type="button"
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-2 flex items-center gap-1 transition shadow-2xs cursor-pointer select-none"
                >
                  <Save className="w-3.5 h-3.5" />
                  Lưu thay đổi
                </button>
                <button
                  onClick={handleCancelEditing}
                  type="button"
                  className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-1 transition cursor-pointer select-none"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartEditing}
                type="button"
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-1 transition shadow-2xs cursor-pointer select-none"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                Thiết lập chỉ số &amp; Trọng số
              </button>
            )
          )}

          {/* Score badges */}
          <div className="flex flex-wrap gap-1.5">
            {/* Tự chấm */}
            <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 text-center flex items-center gap-1.5 shadow-3xs">
              <span className="text-[10px] font-bold whitespace-nowrap">🙋‍♂️ Tự chấm:</span>
              <span className="text-sm font-black text-slate-800">{totals.self}/100</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold whitespace-nowrap ${getRatingInfo(totals.self).class}`}>
                {getRatingInfo(totals.self).text}
              </span>
            </div>
            
            {/* Tổ trưởng chấm */}
            <div className="bg-indigo-50/50 border border-indigo-200 text-indigo-800 rounded-lg px-2.5 py-1 text-center flex items-center gap-1.5 shadow-3xs">
              <span className="text-[10px] font-bold whitespace-nowrap">👥 Tổ trưởng:</span>
              <span className="text-sm font-black text-indigo-700">{totals.leader}/100</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold whitespace-nowrap ${getRatingInfo(totals.leader).class}`}>
                {getRatingInfo(totals.leader).text}
              </span>
            </div>

            {/* BGH chấm */}
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-2.5 py-1 text-center flex items-center gap-1.5 shadow-3xs">
              <span className="text-[10px] font-bold whitespace-nowrap">🏛️ BGH chấm:</span>
              <span className="text-sm font-black text-rose-700">{totals.bgh}/100</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold whitespace-nowrap ${getAppliedRating(totals.bgh).class}`}>
                {getAppliedRating(totals.bgh).text}
              </span>
            </div>
          </div>

          {/* Rating override selector (Cập nhật kết quả xếp loại thi đua) */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-rose-50/20 p-2.5 rounded-lg border border-rose-100/30">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-rose-950 uppercase tracking-wide block">🏛️ Kết quả Xếp loại của Nhà trường:</span>
              <p className="text-[9.5px] text-slate-500 leading-tight">
                {activeUser?.bghRatingOverride ? (
                  <span>Đang áp dụng xếp loại: <strong className="text-rose-700 font-bold">{activeUser.bghRatingOverride}</strong> (Được cập nhật bởi Ban Giám Hiệu)</span>
                ) : (
                  <span>Tự động xếp loại theo điểm BGH: <strong className="text-slate-700 font-bold">{getRatingInfo(totals.bgh).text}</strong></span>
                )}
              </p>
            </div>
            
            {isBghOrAdmin ? (
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] text-slate-500 font-bold">Cập nhật:</span>
                <select
                  value={activeUser?.bghRatingOverride || 'Tự động'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (onUpdateUserRatingOverride) {
                      onUpdateUserRatingOverride(val === 'Tự động' ? undefined : val);
                    }
                  }}
                  className="bg-white border border-rose-200 hover:border-rose-400 rounded text-[11px] px-2 py-1 font-bold text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer shadow-3xs"
                >
                  <option value="Tự động">-- Tự động (Theo điểm BGH) --</option>
                  <option value="Xuất sắc">Xuất sắc</option>
                  <option value="Hoàn thành tốt nhiệm vụ">Hoàn thành tốt nhiệm vụ</option>
                  <option value="Hoàn thành nhiệm vụ">Hoàn thành nhiệm vụ</option>
                  <option value="Không hoàn thành nhiệm vụ">Không hoàn thành nhiệm vụ</option>
                </select>
              </div>
            ) : (
              <div className="text-[10px] bg-white border border-slate-200 rounded px-2.5 py-1 font-extrabold text-slate-600 shadow-3xs shrink-0">
                {activeUser?.bghRatingOverride || getRatingInfo(totals.bgh).text}
              </div>
            )}
          </div>
        </div>
      </div>

      {validationError && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex gap-1.5 items-center">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 animate-pulse" />
          <span className="font-bold">{validationError}</span>
        </div>
      )}

      {readOnly ? (
        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex gap-1.5 items-start">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
          <span>
            <strong>Chế độ chỉ xem:</strong> Bạn đang xem điểm KPI của cán bộ khác. Toàn bộ các tiêu chí và điểm số dưới đây là cố định và không thể chỉnh sửa. Bạn vẫn có thể click vào xem các hồ sơ minh chứng.
          </span>
        </div>
      ) : (
        !isEditing && (
          isBghOrToTruong ? (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex gap-1.5 items-start">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Mẹo giả lập:</strong> Bạn có thể sử dụng thanh trượt hoặc trường nhập liệu trực tiếp dưới đây để thay đổi điểm số thực đạt. Điểm tổng và xếp loại thi đua cuối kỳ sẽ được tự động tính toán lại ngay tức thì!
              </span>
            </div>
          ) : (
            <div className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4 flex gap-1.5 items-start">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 animate-pulse" />
              <span>
                <strong>Tài khoản cá nhân:</strong> Bạn có quyền <strong>tự đánh giá điểm số cá nhân (Tự chấm)</strong>, lưu kết quả và đính kèm hồ sơ minh chứng của mình. Điểm đánh giá chính thức thuộc về thẩm quyền của <strong>Tổ trưởng chuyên môn</strong> và <strong>Ban Giám Hiệu (BGH)</strong>.
              </span>
            </div>
          )
        )
      )}

      {/* KPI Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
              <th className="p-2.5 font-bold rounded-l-lg">Nhóm tiêu chí</th>
              <th className="p-2.5 font-bold text-center w-24">Trọng số</th>
              <th className="p-2.5 font-bold">Chỉ số đo lường (KPIs) &amp; Mục tiêu chuẩn</th>
              <th className="p-2.5 font-bold text-center w-36">Thực đạt (Giả lập)</th>
              <th className="p-2.5 font-bold w-64 rounded-r-lg">Hồ sơ minh chứng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(isEditing ? editKpis : displayedKpis).map((kpi, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition">
                <td className="p-3 font-bold text-slate-900 align-top max-w-[200px]">
                  {isEditing ? (
                    <div className="flex gap-1.5 items-start">
                      <button
                        type="button"
                        onClick={() => handleDeleteEditKpi(index)}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded p-1 transition mt-0.5 cursor-pointer shrink-0 animate-scale-in"
                        title="Xóa tiêu chí này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        type="text"
                        value={kpi.criterion}
                        onChange={(e) => handleEditKpiField(index, 'criterion', e.target.value)}
                        className="w-full border border-slate-300 rounded p-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  ) : (
                    kpi.criterion
                  )}
                </td>
                <td className="p-3 text-center text-slate-500 font-extrabold align-top">
                  {isEditing ? (
                    <div className="flex items-center gap-0.5 justify-center">
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        value={kpi.weight}
                        onChange={(e) => handleEditKpiField(index, 'weight', parseInt(e.target.value) || 0)}
                        className="w-12 border border-slate-300 rounded text-center p-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="font-extrabold text-slate-500">%</span>
                    </div>
                  ) : (
                    `${kpi.weight}%`
                  )}
                </td>
                <td className="p-3 align-top text-slate-600 leading-relaxed">
                  {isEditing ? (
                    <textarea 
                      value={kpi.desc}
                      onChange={(e) => handleEditKpiField(index, 'desc', e.target.value)}
                      rows={2}
                      className="w-full border border-slate-300 rounded p-1 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y"
                    />
                  ) : (
                    kpi.desc
                  )}
                </td>
                <td className="p-3 align-top">
                  <div className="flex flex-col gap-2 min-w-[130px]">
                    {isBghOrToTruong ? (
                      <>
                        {/* 1. Self Score */}
                        <div className="space-y-0.5 border-b border-slate-100 pb-1.5">
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-500">
                            <span>🙋‍♂️ Tự chấm:</span>
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={kpi.selfScore !== undefined ? kpi.selfScore : kpi.value} 
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                handleScoreFieldChange(index, 'selfScore', val);
                              }}
                              disabled={readOnly || isEditing}
                              className={`w-10 border text-center py-0.5 font-bold text-[10px] focus:outline-none ${
                                (readOnly || isEditing) 
                                  ? 'border-slate-100 bg-slate-50 text-slate-400' 
                                  : 'border-slate-300 text-slate-700 focus:ring-1 focus:ring-emerald-500'
                              }`}
                            />
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={kpi.selfScore !== undefined ? kpi.selfScore : kpi.value} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              handleScoreFieldChange(index, 'selfScore', val);
                            }}
                            disabled={readOnly || isEditing}
                            className="w-full h-1 accent-emerald-600 cursor-pointer disabled:opacity-50"
                          />
                        </div>

                        {/* 2. Leader Score */}
                        <div className="space-y-0.5 border-b border-slate-100 pb-1.5">
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-indigo-600">
                            <span>👥 Tổ trưởng:</span>
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={kpi.leaderScore !== undefined ? kpi.leaderScore : Math.max(0, kpi.value - (kpi.value % 5 || 2))} 
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                handleScoreFieldChange(index, 'leaderScore', val);
                              }}
                              disabled={readOnly || isEditing}
                              className={`w-10 border text-center py-0.5 font-bold text-[10px] focus:outline-none ${
                                (readOnly || isEditing) 
                                  ? 'border-slate-100 bg-slate-50 text-slate-400' 
                                  : 'border-slate-300 text-indigo-700 focus:ring-1 focus:ring-indigo-500'
                              }`}
                            />
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={kpi.leaderScore !== undefined ? kpi.leaderScore : Math.max(0, kpi.value - (kpi.value % 5 || 2))} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              handleScoreFieldChange(index, 'leaderScore', val);
                            }}
                            disabled={readOnly || isEditing}
                            className="w-full h-1 accent-indigo-600 cursor-pointer disabled:opacity-50"
                          />
                        </div>

                        {/* 3. BGH Score */}
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-rose-600">
                            <span>🏛️ BGH chấm:</span>
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={kpi.bghScore !== undefined ? kpi.bghScore : Math.max(0, kpi.value - (kpi.value % 7 || 3))} 
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                handleScoreFieldChange(index, 'bghScore', val);
                              }}
                              disabled={readOnly || isEditing}
                              className={`w-10 border text-center py-0.5 font-bold text-[10px] focus:outline-none ${
                                (readOnly || isEditing) 
                                  ? 'border-slate-100 bg-slate-50 text-slate-400' 
                                  : 'border-slate-300 text-rose-700 focus:ring-1 focus:ring-rose-500'
                              }`}
                            />
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={kpi.bghScore !== undefined ? kpi.bghScore : Math.max(0, kpi.value - (kpi.value % 7 || 3))} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              handleScoreFieldChange(index, 'bghScore', val);
                            }}
                            disabled={readOnly || isEditing}
                            className="w-full h-1 accent-rose-600 cursor-pointer disabled:opacity-50"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 1. Self Score - Interactive for personal evaluation */}
                        <div className="space-y-0.5 border-b border-slate-100 pb-1.5">
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-500">
                            <span>🙋‍♂️ Tự chấm:</span>
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={kpi.selfScore !== undefined ? kpi.selfScore : kpi.value} 
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                handleScoreFieldChange(index, 'selfScore', val);
                              }}
                              disabled={readOnly || isEditing}
                              className={`w-10 border text-center py-0.5 font-bold text-[10px] focus:outline-none ${
                                (readOnly || isEditing) 
                                  ? 'border-slate-100 bg-slate-50 text-slate-400' 
                                  : 'border-slate-300 text-slate-700 focus:ring-1 focus:ring-emerald-500'
                              }`}
                            />
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={kpi.selfScore !== undefined ? kpi.selfScore : kpi.value} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              handleScoreFieldChange(index, 'selfScore', val);
                            }}
                            disabled={readOnly || isEditing}
                            className="w-full h-1 accent-emerald-600 cursor-pointer disabled:opacity-50"
                          />
                        </div>

                        {/* 2 & 3. Leader and BGH Score - Read Only */}
                        <div className="space-y-2 bg-slate-50 p-2 rounded-lg border border-slate-100 font-bold shadow-3xs">
                          {/* 2. Leader Score - Static */}
                          <div className="flex items-center justify-between text-[11px] text-indigo-700 border-b border-slate-200 pb-1.5">
                            <span className="flex items-center gap-1">👥 Tổ trưởng:</span>
                            <span className="text-indigo-900 bg-white border border-indigo-200 px-1.5 py-0.5 rounded text-[10px] font-black min-w-[32px] text-center shadow-3xs">
                              {kpi.leaderScore !== undefined ? kpi.leaderScore : Math.max(0, kpi.value - (kpi.value % 5 || 2))}
                            </span>
                          </div>
                          {/* 3. BGH Score - Static */}
                          <div className="flex items-center justify-between text-[11px] text-rose-700">
                            <span className="flex items-center gap-1">🏛️ BGH chấm:</span>
                            <span className="text-rose-900 bg-white border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-black min-w-[32px] text-center shadow-3xs">
                              {kpi.bghScore !== undefined ? kpi.bghScore : Math.max(0, kpi.value - (kpi.value % 7 || 3))}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
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
                            {!readOnly && !isEditing && onKpiEvidencesChange && (
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
                    {!readOnly && !isEditing && onKpiEvidencesChange && (
                      <button
                        type="button"
                        onClick={() => openEvidenceModal(index)}
                        className="flex items-center gap-1 self-start px-2 py-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Đính kèm minh chứng
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {isEditing && (
              <tr>
                <td colSpan={5} className="p-3.5 text-center bg-slate-50 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleAddEditKpi}
                    className="text-xs font-bold text-emerald-600 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 rounded-lg px-4 py-2 transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-emerald-500 animate-pulse" />
                    Thêm tiêu chuẩn KPI mới
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ====== MODAL: THÊM MINH CHỨNG ====== */}
      {activeKpiIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] cursor-pointer"
          onClick={handleCloseEvidenceModal}
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
                onClick={handleCloseEvidenceModal}
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
                  onClick={handleCloseEvidenceModal}
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
