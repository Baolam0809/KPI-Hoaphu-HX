import React, { useState } from 'react';
import { Target, Plus, Edit3, Trash2, X, AlertTriangle, FolderOpen, Lock } from 'lucide-react';
import { OKR } from '../types';

interface OKRTemplate {
  id: string;
  name: string;
  title: string;
  kr1: string;
  kr1Progress: number;
  kr2: string;
  kr2Progress: number;
  kr3: string;
  kr3Progress: number;
}

const DEFAULT_OKR_TEMPLATES: OKRTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Mẫu 1: Chất lượng dạy Toán lớp 9',
    title: 'Nâng cao chất lượng dạy và học môn Toán lớp 9, tăng tỷ lệ thi đỗ cấp 3',
    kr1: 'Số hóa 100% giáo án giảng dạy lý thuyết và bài tập môn Toán lớp 9 lên Drive trường.',
    kr1Progress: 0,
    kr2: 'Thực hiện 2 tiết dạy chuyên đề đổi mới phương pháp giảng dạy cấp tổ.',
    kr2Progress: 0,
    kr3: '85% học sinh đạt điểm từ trung bình trở lên trong kỳ thi thử vào 10.',
    kr3Progress: 0
  },
  {
    id: 'tmpl-2',
    name: 'Mẫu 2: CNTT & bài giảng E-Learning',
    title: 'Đẩy mạnh chuyển đổi số trong dạy học thông qua thiết kế bài giảng tương tác E-Learning',
    kr1: 'Hoàn thành 3 giáo án bài giảng số hóa chuẩn E-learning tương tác cao.',
    kr1Progress: 0,
    kr2: 'Tham gia đầy đủ các lớp tập huấn kỹ năng sử dụng AI trong soạn giáo án.',
    kr2Progress: 0,
    kr3: 'Ứng dụng thành công phần mềm trắc nghiệm trực tuyến Kahoot/Quizizz cho học sinh.',
    kr3Progress: 0
  },
  {
    id: 'tmpl-3',
    name: 'Mẫu 3: Sáng kiến kinh nghiệm',
    title: 'Nghiên cứu ứng dụng sáng kiến sư phạm cải tiến chất lượng quản lý lớp học',
    kr1: 'Xây dựng giải pháp sinh hoạt lớp chủ đề định hướng kỹ năng sống cho học sinh.',
    kr1Progress: 0,
    kr2: 'Viết báo cáo sáng kiến kinh nghiệm hoàn chỉnh nộp Hội đồng khoa học nhà trường.',
    kr2Progress: 0,
    kr3: 'Đạt giải Sáng kiến kinh nghiệm cấp trường loại Khá trở lên.',
    kr3Progress: 0
  },
  {
    id: 'tmpl-4',
    name: 'Mẫu 4: Xây dựng tập thể lớp học tốt',
    title: 'Phát triển toàn diện phong trào học tập, kỷ luật của tập thể lớp chủ nhiệm',
    kr1: 'Xây dựng và triển khai mô hình học tập "Đôi bạn cùng tiến" kèm cặp học sinh yếu.',
    kr1Progress: 0,
    kr2: 'Đạt tối thiểu 3 tuần xếp thứ nhất phong trào thi đua tuần của trường.',
    kr2Progress: 0,
    kr3: 'Không có học sinh vi phạm kỷ luật nghiêm trọng hoặc xếp loại đạo đức yếu.',
    kr3Progress: 0
  },
  {
    id: 'tmpl-5',
    name: 'Mẫu 5: Đổi mới phương pháp dạy học & chuyên môn',
    title: 'Đẩy mạnh sinh hoạt chuyên môn theo nghiên cứu bài học, ứng dụng phương pháp dạy học tích cực',
    kr1: 'Tổ chức thành công ít nhất 2 chuyên đề dạy học tích cực cấp tổ/trường.',
    kr1Progress: 0,
    kr2: '100% giáo viên trong tổ tham gia dự giờ đầy đủ và rút kinh nghiệm chuyên môn.',
    kr2Progress: 0,
    kr3: 'Phát triển ngân hàng câu hỏi kiểm tra đánh giá định kỳ theo định hướng năng lực.',
    kr3Progress: 0
  },
  {
    id: 'tmpl-6',
    name: 'Mẫu 6: Ôn thi học sinh giỏi & bồi dưỡng năng khiếu',
    title: 'Bồi dưỡng đội tuyển học sinh giỏi chuyên sâu, nâng cao thành tích thi chọn HSG cấp Huyện/Tỉnh',
    kr1: 'Hoàn thiện đề cương bồi dưỡng HSG chi tiết với ít nhất 10 chuyên đề nâng cao.',
    kr1Progress: 0,
    kr2: '100% học sinh đội tuyển tham gia đầy đủ các buổi học tập huấn và khảo sát chất lượng định kỳ.',
    kr2Progress: 0,
    kr3: 'Có ít nhất 1 học sinh đạt giải Ba cấp Huyện trở lên và 2 học sinh đạt giải Khuyến khích.',
    kr3Progress: 0
  },
  {
    id: 'tmpl-7',
    name: 'Mẫu 7: Xây dựng trường học hạnh phúc & giáo dục đạo đức',
    title: 'Tăng cường các hoạt động trải nghiệm thực tế, tư vấn tâm lý học đường, xây dựng lớp học hạnh phúc',
    kr1: 'Tổ chức ít nhất 1 chuyên đề ngoại khóa về kỹ năng giao tiếp ứng xử và phòng chống bạo lực học đường.',
    kr1Progress: 0,
    kr2: 'Tư vấn và hỗ trợ tâm lý kịp thời cho 100% học sinh gặp khó khăn hoặc có biểu hiện tâm lý bất thường.',
    kr2Progress: 0,
    kr3: '98% học sinh xếp loại rèn luyện (đạo đức) Khá/Tốt trở lên, không có học sinh trung bình.',
    kr3Progress: 0
  }
];

interface OkrSectionProps {
  okrs: OKR[];
  onAddOkr: (okr: Omit<OKR, 'id'>) => void;
  onUpdateOkr: (id: string, updatedOkr: Partial<OKR>) => void;
  onDeleteOkr: (id: string) => void;
  readOnly?: boolean;
}

export default function OkrSection({ okrs, onAddOkr, onUpdateOkr, onDeleteOkr, readOnly = false }: OkrSectionProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOkr, setSelectedOkr] = useState<OKR | null>(null);

  // Template management states
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [isMainTemplateDropdownOpen, setIsMainTemplateDropdownOpen] = useState(false);
  const [templates, setTemplates] = useState<OKRTemplate[]>(() => {
    const cached = localStorage.getItem('thcs_hp_okr_templates');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as OKRTemplate[];
        // Merge: Keep all user cached templates, but if any default template is missing by ID, append it!
        const parsedIds = new Set(parsed.map(t => t.id));
        const missingDefaults = DEFAULT_OKR_TEMPLATES.filter(t => !parsedIds.has(t.id));
        if (missingDefaults.length > 0) {
          const merged = [...parsed, ...missingDefaults];
          localStorage.setItem('thcs_hp_okr_templates', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing cached OKR templates:', e);
      }
    }
    return DEFAULT_OKR_TEMPLATES;
  });

  // Form states for Add/Edit
  const [title, setTitle] = useState('');
  const [kr1, setKr1] = useState('');
  const [kr1Progress, setKr1Progress] = useState(0);
  const [kr2, setKr2] = useState('');
  const [kr2Progress, setKr2Progress] = useState(0);
  const [kr3, setKr3] = useState('');
  const [kr3Progress, setKr3Progress] = useState(0);

  const [error, setError] = useState('');

  // Bản nháp OKR của Thêm mới & Hiệu chỉnh để khi kích chuột ra khoảng trống đóng modal thì thông tin dở vẫn được giữ nguyên
  const [addOkrDraft, setAddOkrDraft] = useState<{
    title: string;
    kr1: string;
    kr1Progress: number;
    kr2: string;
    kr2Progress: number;
    kr3: string;
    kr3Progress: number;
  } | null>(null);

  const [editOkrDrafts, setEditOkrDrafts] = useState<Record<string, {
    title: string;
    kr1: string;
    kr1Progress: number;
    kr2: string;
    kr2Progress: number;
    kr3: string;
    kr3Progress: number;
  }>>({});

  // Beautiful UI confirmation modal states (replaces window.confirm/alert/prompt in iframe)
  const [okrToDelete, setOkrToDelete] = useState<OKR | null>(null);
  const [tmplToDelete, setTmplToDelete] = useState<OKRTemplate | null>(null);
  const [tmplToRename, setTmplToRename] = useState<OKRTemplate | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [validationError, setValidationError] = useState('');

  const saveTemplates = (updatedTemplates: OKRTemplate[]) => {
    setTemplates(updatedTemplates);
    localStorage.setItem('thcs_hp_okr_templates', JSON.stringify(updatedTemplates));
  };

  const handleApplyTemplate = (tmpl: OKRTemplate) => {
    setTitle(tmpl.title);
    setKr1(tmpl.kr1);
    setKr1Progress(tmpl.kr1Progress);
    setKr2(tmpl.kr2);
    setKr2Progress(tmpl.kr2Progress);
    setKr3(tmpl.kr3);
    setKr3Progress(tmpl.kr3Progress);
    setIsTemplateDropdownOpen(false);
  };

  const handleRenameTemplateClick = (tmpl: OKRTemplate) => {
    setTmplToRename(tmpl);
    setRenameValue(tmpl.name);
  };

  const confirmRenameTemplate = () => {
    if (renameValue.trim() !== '') {
      const updated = templates.map(t => t.id === tmplToRename?.id ? { ...t, name: renameValue.trim() } : t);
      saveTemplates(updated);
      setTmplToRename(null);
      setRenameValue('');
    }
  };

  const handleDeleteTemplateClick = (tmpl: OKRTemplate) => {
    setTmplToDelete(tmpl);
  };

  const confirmDeleteTemplate = () => {
    if (tmplToDelete) {
      const updated = templates.filter(t => t.id !== tmplToDelete.id);
      saveTemplates(updated);
      setTmplToDelete(null);
    }
  };

  const handleSaveAsTemplateClick = () => {
    setIsTemplateDropdownOpen(false);
    if (!title.trim()) {
      setValidationError('Cảnh báo: Bạn chưa nhập "Mục tiêu lớn (Objective)" trong form OKR. Vui lòng nhập Mục tiêu lớn trước khi lưu thành biểu mẫu.');
    } else {
      setValidationError('');
    }
    setNewTemplateName('');
    setIsSavingTemplate(true);
  };

  const confirmSaveTemplate = () => {
    if (!title.trim()) {
      setValidationError('Không thể lưu: Bạn cần điền "Mục tiêu lớn (Objective)" trong form OKR trước.');
      return;
    }
    if (newTemplateName.trim() === '') {
      setValidationError('Vui lòng nhập tên gợi nhớ cho biểu mẫu!');
      return;
    }
    const newTmpl: OKRTemplate = {
      id: `tmpl-${Date.now()}`,
      name: newTemplateName.trim(),
      title: title.trim(),
      kr1: kr1.trim(),
      kr1Progress,
      kr2: kr2.trim(),
      kr2Progress,
      kr3: kr3.trim(),
      kr3Progress
    };
    const updated = [...templates, newTmpl];
    saveTemplates(updated);
    setIsSavingTemplate(false);
    setNewTemplateName('');
    setValidationError('');
  };

  const openAddModal = () => {
    if (addOkrDraft) {
      setTitle(addOkrDraft.title);
      setKr1(addOkrDraft.kr1);
      setKr1Progress(addOkrDraft.kr1Progress);
      setKr2(addOkrDraft.kr2);
      setKr2Progress(addOkrDraft.kr2Progress);
      setKr3(addOkrDraft.kr3);
      setKr3Progress(addOkrDraft.kr3Progress);
    } else {
      setTitle('');
      setKr1('');
      setKr1Progress(0);
      setKr2('');
      setKr2Progress(0);
      setKr3('');
      setKr3Progress(0);
    }
    setError('');
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddOkrDraft({
      title,
      kr1,
      kr1Progress,
      kr2,
      kr2Progress,
      kr3,
      kr3Progress
    });
    setIsAddModalOpen(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !kr1.trim()) {
      setError('Mục tiêu (O) và Kết quả then chốt 1 (KR1) không được bỏ trống!');
      return;
    }
    onAddOkr({
      title: title.trim(),
      kr1: kr1.trim(),
      kr1Progress,
      kr2: kr2.trim(),
      kr2Progress,
      kr3: kr3.trim(),
      kr3Progress,
    });
    setAddOkrDraft(null); // Xóa nháp sau khi thêm mới thành công
    setIsAddModalOpen(false);
  };

  const openEditModal = (okr: OKR) => {
    setSelectedOkr(okr);
    const draft = editOkrDrafts[okr.id];
    if (draft) {
      setTitle(draft.title);
      setKr1(draft.kr1);
      setKr1Progress(draft.kr1Progress);
      setKr2(draft.kr2);
      setKr2Progress(draft.kr2Progress);
      setKr3(draft.kr3);
      setKr3Progress(draft.kr3Progress);
    } else {
      setTitle(okr.title);
      setKr1(okr.kr1);
      setKr1Progress(okr.kr1Progress);
      setKr2(okr.kr2);
      setKr2Progress(okr.kr2Progress);
      setKr3(okr.kr3);
      setKr3Progress(okr.kr3Progress);
    }
    setError('');
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (selectedOkr) {
      setEditOkrDrafts(prev => ({
        ...prev,
        [selectedOkr.id]: {
          title,
          kr1,
          kr1Progress,
          kr2,
          kr2Progress,
          kr3,
          kr3Progress
        }
      }));
    }
    setIsEditModalOpen(false);
    setSelectedOkr(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOkr) return;
    if (!title.trim() || !kr1.trim()) {
      setError('Mục tiêu (O) và Kết quả then chốt 1 (KR1) không được bỏ trống!');
      return;
    }
    onUpdateOkr(selectedOkr.id, {
      title: title.trim(),
      kr1: kr1.trim(),
      kr1Progress,
      kr2: kr2.trim(),
      kr2Progress,
      kr3: kr3.trim(),
      kr3Progress,
    });
    
    // Xóa nháp sau khi cập nhật thành công
    setEditOkrDrafts(prev => {
      const copy = { ...prev };
      delete copy[selectedOkr.id];
      return copy;
    });

    setIsEditModalOpen(false);
    setSelectedOkr(null);
  };

  const handleDelete = (okr: OKR) => {
    setOkrToDelete(okr);
  };

  const confirmDeleteOkr = () => {
    if (okrToDelete) {
      onDeleteOkr(okrToDelete.id);
      setOkrToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5" id="okr-workspace">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-red-50 rounded-lg text-red-600">
            <Target className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Thiết Lập Mục Tiêu (OKR)</h3>
            <p className="text-xs text-slate-500">Mục tiêu đổi mới & nâng cao chất lượng giáo dục</p>
          </div>
        </div>
        {!readOnly ? (
          <div className="flex items-center gap-2 relative">
            {/* Quick Template Selector on Card Header */}
            <div className="relative">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMainTemplateDropdownOpen(!isMainTemplateDropdownOpen);
                }}
                className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-100 text-[11px] md:text-xs font-extrabold px-2.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition select-none"
              >
                <FolderOpen className="w-3.5 h-3.5 text-red-700 animate-bounce" />
                Lấy nhanh biểu mẫu
              </button>
              
              {isMainTemplateDropdownOpen && (
                <div className="absolute right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl w-72 md:w-80 z-[100] p-3 text-xs space-y-2.5 animate-scale-in">
                  <div className="font-extrabold text-slate-500 border-b pb-1.5 px-1 text-[10px] uppercase tracking-wider flex justify-between items-center select-none">
                    <span>Kho biểu mẫu OKR</span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsMainTemplateDropdownOpen(false);
                      }}
                      className="text-slate-400 hover:text-slate-600 text-xs p-0.5"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="max-h-[350px] overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
                    {templates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          onAddOkr({
                            title: tmpl.title,
                            kr1: tmpl.kr1,
                            kr1Progress: tmpl.kr1Progress,
                            kr2: tmpl.kr2,
                            kr2Progress: tmpl.kr2Progress,
                            kr3: tmpl.kr3,
                            kr3Progress: tmpl.kr3Progress,
                          });
                          setIsMainTemplateDropdownOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition flex flex-col gap-0.5 group cursor-pointer"
                      >
                        <span className="font-extrabold text-slate-700 group-hover:text-red-700 truncate">
                          {tmpl.name}
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-500 line-clamp-1 italic">
                          O: {tmpl.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={openAddModal} 
              className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm OKR mới
            </button>
          </div>
        ) : (
          <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs select-none">
            <Lock className="w-3 h-3 text-slate-400" /> Chế độ chỉ xem
          </span>
        )}
      </div>

      {/* List of OKRs */}
      <div className="space-y-4">
        {okrs.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
            <p className="text-xs text-slate-500 font-bold">Chưa có mục tiêu OKR nào được tạo cho cán bộ này!</p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-5">
              {readOnly ? 'Hồ sơ hiện tại không có dữ liệu OKR.' : 'Nhấp vào nút "Thêm OKR mới" hoặc chọn nhanh biểu mẫu dưới đây để khởi tạo.'}
            </p>

            {!readOnly && (
              <div className="max-w-2xl mx-auto border-t border-slate-200 pt-5 mt-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 text-center">
                  Khởi tạo nhanh bằng biểu mẫu có sẵn ngay tại chỗ:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {templates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        onAddOkr({
                          title: tmpl.title,
                          kr1: tmpl.kr1,
                          kr1Progress: tmpl.kr1Progress,
                          kr2: tmpl.kr2,
                          kr2Progress: tmpl.kr2Progress,
                          kr3: tmpl.kr3,
                          kr3Progress: tmpl.kr3Progress,
                        });
                      }}
                      className="text-left bg-white hover:bg-red-50 hover:border-red-300 border border-slate-200 rounded-xl p-3.5 transition duration-200 text-xs flex flex-col gap-1.5 cursor-pointer group shadow-2xs"
                    >
                      <span className="font-extrabold text-slate-800 group-hover:text-red-700 flex items-center gap-1.5 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                        {tmpl.name}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-2 italic group-hover:text-slate-600">
                        {tmpl.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          okrs.map((okr, index) => {
            const krs = [
              { label: 'KR1', title: okr.kr1, progress: okr.kr1Progress, field: 'kr1Progress' },
              { label: 'KR2', title: okr.kr2, progress: okr.kr2Progress, field: 'kr2Progress' },
              { label: 'KR3', title: okr.kr3, progress: okr.kr3Progress, field: 'kr3Progress' }
            ].filter(kr => kr.title !== '');

            return (
              <div 
                key={okr.id} 
                className="border border-slate-150 bg-slate-50/20 hover:bg-slate-50/40 rounded-xl p-4 shadow-sm space-y-3 relative transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="bg-red-700 text-white font-extrabold px-2 py-0.5 rounded text-[9px] mt-0.5 whitespace-nowrap shrink-0">
                      MỤC TIÊU {index + 1}
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug">{okr.title}</h4>
                  </div>
                  
                  {/* Action Buttons */}
                  {!readOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => openEditModal(okr)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Sửa OKR"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(okr)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Xóa OKR"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Key Results Progress and Sliders */}
                <div className="space-y-3 pt-1">
                  {krs.map((kr, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-3 rounded-lg text-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="bg-red-50 text-red-800 border border-red-100 font-extrabold px-1.5 py-0.5 rounded text-[9px] shrink-0">
                          {kr.label}
                        </span>
                        <p className="text-slate-700 font-bold flex-1">{kr.title}</p>
                        <span className="font-black text-red-700 shrink-0 text-xs bg-red-50 px-1.5 py-0.5 rounded">
                          {kr.progress}%
                        </span>
                      </div>
                      
                      {/* Slider and Range controller for direct dynamic interactivity! */}
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={kr.progress} 
                          onChange={(e) => !readOnly && onUpdateOkr(okr.id, { [kr.field]: parseInt(e.target.value) })}
                          disabled={readOnly}
                          className={`flex-1 h-1.5 ${readOnly ? 'accent-slate-400 cursor-not-allowed' : 'accent-red-700 cursor-pointer'}`}
                        />
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {readOnly ? 'Chỉ xem' : 'Kéo sửa nhanh'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ====== MODAL: THÊM MỚI OKR ====== */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={handleCloseAddModal}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1 text-xs sm:text-sm md:text-base">
                <Target className="text-red-700 w-4 h-4 md:w-5 md:h-5 animate-pulse" /> Thêm OKR Mới
              </h3>
              <div className="flex items-center gap-1.5">
                {/* Tải biểu mẫu button */}
                <div className="relative">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsTemplateDropdownOpen(!isTemplateDropdownOpen);
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-100 text-[10px] md:text-xs font-bold px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition select-none"
                  >
                    <FolderOpen className="w-3 h-3 text-red-700" />
                    Tải biểu mẫu
                  </button>
                  
                  {isTemplateDropdownOpen && (
                    <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl w-64 md:w-76 z-50 p-2.5 text-xs space-y-2 animate-scale-in">
                      <div className="font-bold text-slate-500 border-b pb-1.5 px-1 text-[9px] md:text-[10px] uppercase tracking-wider flex justify-between items-center select-none">
                        <span>Kho biểu mẫu OKR</span>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsTemplateDropdownOpen(false);
                          }}
                          className="text-slate-400 hover:text-slate-600 text-[11px] p-0.5"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="max-h-[350px] overflow-y-auto space-y-1 pr-0.5">
                        {templates.map((tmpl) => (
                          <div 
                            key={tmpl.id} 
                            className="group flex items-center justify-between p-1 rounded hover:bg-slate-50 transition text-[11px] border border-transparent hover:border-slate-100"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleApplyTemplate(tmpl);
                              }}
                              className="flex-1 text-left text-slate-700 font-bold truncate hover:text-red-700 pr-2 cursor-pointer py-0.5"
                              title={`Mục tiêu: ${tmpl.title}`}
                            >
                              {tmpl.name}
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRenameTemplateClick(tmpl);
                                }}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                                title="Sửa tên mẫu"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteTemplateClick(tmpl);
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                                title="Xóa mẫu"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {templates.length === 0 && (
                          <div className="text-center py-3 text-[10px] text-slate-400 italic">
                            Chưa có biểu mẫu nào
                          </div>
                        )}
                      </div>
 
                      <div className="border-t pt-2 mt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSaveAsTemplateClick();
                          }}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] text-center flex items-center justify-center gap-1 cursor-pointer transition shadow-sm"
                        >
                          <Plus className="w-3 h-3" />
                          Lưu form làm biểu mẫu mới
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <button onClick={handleCloseAddModal} className="text-slate-400 hover:text-slate-600 cursor-pointer ml-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-2 rounded-lg flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Mục Tiêu Lớn (Objective)</label>
                <textarea 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none" 
                  rows={2} 
                  placeholder="Ví dụ: Trở thành giáo viên dạy xuất sắc môn Ngữ văn cấp Trường..."
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Kết quả then chốt 1 (Key Result 1)</label>
                <input 
                  type="text" 
                  value={kr1}
                  onChange={(e) => setKr1(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none" 
                  placeholder="Ví dụ: 100% học sinh đội tuyển vượt qua vòng loại trường"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr1Progress} onChange={(e) => setKr1Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr1Progress}%</span>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Kết quả then chốt 2 (Key Result 2) - Không bắt buộc</label>
                <input 
                  type="text" 
                  value={kr2}
                  onChange={(e) => setKr2(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none" 
                  placeholder="Ví dụ: Đạt ít nhất 2 giải khuyến khích cấp xã"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr2Progress} onChange={(e) => setKr2Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr2Progress}%</span>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Kết quả then chốt 3 (Key Result 3) - Không bắt buộc</label>
                <input 
                  type="text" 
                  value={kr3}
                  onChange={(e) => setKr3(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none" 
                  placeholder="Ví dụ: Đạt danh hiệu GV dạy giỏi cấp Huyện"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr3Progress} onChange={(e) => setKr3Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr3Progress}%</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 text-xs pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleCloseAddModal} 
                  className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                >
                  Lưu Mục Tiêu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== MODAL: HIỆU CHỈNH OKR ====== */}
      {isEditModalOpen && selectedOkr && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={handleCloseEditModal}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1 text-xs sm:text-sm md:text-base">
                <Edit3 className="text-red-700 w-4 h-4 md:w-5 md:h-5" /> Hiệu Chỉnh OKR
              </h3>
              <div className="flex items-center gap-1.5">
                {/* Tải biểu mẫu button */}
                <div className="relative">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsTemplateDropdownOpen(!isTemplateDropdownOpen);
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-100 text-[10px] md:text-xs font-bold px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition select-none"
                  >
                    <FolderOpen className="w-3 h-3 text-red-700" />
                    Tải biểu mẫu
                  </button>
                  
                  {isTemplateDropdownOpen && (
                    <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl w-64 md:w-76 z-50 p-2.5 text-xs space-y-2 animate-scale-in">
                      <div className="font-bold text-slate-500 border-b pb-1.5 px-1 text-[9px] md:text-[10px] uppercase tracking-wider flex justify-between items-center select-none">
                        <span>Kho biểu mẫu OKR</span>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsTemplateDropdownOpen(false);
                          }}
                          className="text-slate-400 hover:text-slate-600 text-[11px] p-0.5"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="max-h-[350px] overflow-y-auto space-y-1 pr-0.5">
                        {templates.map((tmpl) => (
                          <div 
                            key={tmpl.id} 
                            className="group flex items-center justify-between p-1 rounded hover:bg-slate-50 transition text-[11px] border border-transparent hover:border-slate-100"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleApplyTemplate(tmpl);
                              }}
                              className="flex-1 text-left text-slate-700 font-bold truncate hover:text-red-700 pr-2 cursor-pointer py-0.5"
                              title={`Mục tiêu: ${tmpl.title}`}
                            >
                              {tmpl.name}
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRenameTemplateClick(tmpl);
                                }}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                                title="Sửa tên mẫu"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteTemplateClick(tmpl);
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                                title="Xóa mẫu"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {templates.length === 0 && (
                          <div className="text-center py-3 text-[10px] text-slate-400 italic">
                            Chưa có biểu mẫu nào
                          </div>
                        )}
                      </div>
 
                      <div className="border-t pt-2 mt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSaveAsTemplateClick();
                          }}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] text-center flex items-center justify-center gap-1 cursor-pointer transition shadow-sm"
                        >
                          <Plus className="w-3 h-3" />
                          Lưu form làm biểu mẫu mới
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <button onClick={handleCloseEditModal} className="text-slate-400 hover:text-slate-600 cursor-pointer ml-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-2 rounded-lg flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Mục Tiêu Lớn (Objective)</label>
                <textarea 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none font-bold" 
                  rows={2}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Kết quả then chốt 1 (Key Result 1)</label>
                <input 
                  type="text" 
                  value={kr1}
                  onChange={(e) => setKr1(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr1Progress} onChange={(e) => setKr1Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr1Progress}%</span>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Kết quả then chốt 2 (Key Result 2)</label>
                <input 
                  type="text" 
                  value={kr2}
                  onChange={(e) => setKr2(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr2Progress} onChange={(e) => setKr2Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr2Progress}%</span>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Kết quả then chốt 3 (Key Result 3)</label>
                <input 
                  type="text" 
                  value={kr3}
                  onChange={(e) => setKr3(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr3Progress} onChange={(e) => setKr3Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr3Progress}%</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 text-xs pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleCloseEditModal} 
                  className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                >
                  Cập nhật OKR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== MODAL: XÁC NHẬN XÓA OKR ====== */}
      {okrToDelete && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] cursor-pointer"
          onClick={() => setOkrToDelete(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="font-extrabold text-slate-900 text-base">Xác nhận xóa OKR</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa mục tiêu OKR: <span className="font-bold text-slate-800">"{okrToDelete.title}"</span> không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setOkrToDelete(null)}
                className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteOkr}
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: XÁC NHẬN XÓA BIỂU MẪU ====== */}
      {tmplToDelete && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] cursor-pointer"
          onClick={() => setTmplToDelete(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="font-extrabold text-slate-900 text-base">Xóa biểu mẫu OKR</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa biểu mẫu OKR <span className="font-bold text-slate-800">"{tmplToDelete.name}"</span>?
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTmplToDelete(null)}
                className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteTemplate}
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: ĐỔI TÊN BIỂU MẪU ====== */}
      {tmplToRename && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] cursor-pointer"
          onClick={() => setTmplToRename(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-blue-750 mb-3">
              <Edit3 className="w-5 h-5 shrink-0 text-blue-700" />
              <h4 className="font-extrabold text-slate-900 text-base">Đổi tên biểu mẫu</h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tên mới cho biểu mẫu</label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none font-bold"
                  placeholder="Ví dụ: Mẫu môn Toán lớp 9"
                />
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTmplToRename(null)}
                  className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmRenameTemplate}
                  disabled={!renameValue.trim()}
                  className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: LƯU BIỂU MẪU MỚI ====== */}
      {isSavingTemplate && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] cursor-pointer"
          onClick={() => {
            setIsSavingTemplate(false);
            setValidationError('');
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-slate-800 mb-3">
              <FolderOpen className="w-5 h-5 shrink-0 text-red-700" />
              <h4 className="font-extrabold text-slate-900 text-base">Lưu thành biểu mẫu OKR</h4>
            </div>
            <div className="space-y-3">
              {validationError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-lg text-xs flex items-start gap-1.5 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}
              
              {!title.trim() ? (
                <div className="flex justify-end gap-2 text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSavingTemplate(false);
                      setValidationError('');
                    }}
                    className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer transition"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tên biểu mẫu gợi nhớ</label>
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none font-bold"
                      placeholder="Ví dụ: Mẫu bồi dưỡng học sinh giỏi"
                    />
                  </div>
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSavingTemplate(false);
                        setValidationError('');
                      }}
                      className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={confirmSaveTemplate}
                      disabled={!newTemplateName.trim()}
                      className="bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer transition"
                    >
                      Lưu biểu mẫu
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
