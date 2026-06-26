import React, { useState } from 'react';
import { Target, Plus, Edit3, Trash2, X, AlertTriangle, FolderOpen, Lock, Sparkles } from 'lucide-react';
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
  },
  {
    id: 'tmpl-8',
    name: 'Mẫu 8: Về chính trị tư tưởng',
    title: 'Thực hiện nghiêm túc chủ trương, đường lối của Đảng, chính sách pháp luật của Nhà nước và các chỉ thị của Ngành Giáo dục',
    kr1: 'Tham gia đầy đủ 100% các lớp bồi dưỡng chính trị, tập huấn nghị quyết của Đảng và đạt kết quả đánh giá xếp loại Tốt.',
    kr1Progress: 0,
    kr2: '100% các bài giảng lồng ghép giáo dục tư tưởng chính trị, đạo đức công dân và tình yêu quê hương đất nước hiệu quả.',
    kr2Progress: 0,
    kr3: 'Không có biểu hiện suy thoái về tư tưởng chính trị, tự diễn biến, tự chuyển hóa; gương mẫu trong mọi hoạt động.',
    kr3Progress: 0
  },
  {
    id: 'tmpl-9',
    name: 'Mẫu 9: Đạo đức, lối sống',
    title: 'Giữ gìn phẩm chất đạo đức nhà giáo, lối sống giản dị, lành mạnh, không ngừng tự học và giúp đỡ đồng nghiệp',
    kr1: 'Đạt điểm đánh giá tuyệt đối (100%) về Chuẩn nghề nghiệp giáo viên ở tiêu chí Đạo đức nhà giáo.',
    kr1Progress: 0,
    kr2: 'Thực hiện ít nhất 2 buổi chia sẻ kinh nghiệm, giúp đỡ đồng nghiệp trong tổ chuyên môn cùng tiến bộ.',
    kr2Progress: 0,
    kr3: 'Đảm bảo tác phong sư phạm chuẩn mực, ngôn phong mẫu mực, thân thiện và bao dung đối với học sinh.',
    kr3Progress: 0
  },
  {
    id: 'tmpl-10',
    name: 'Mẫu 10: Tác phong lề lối làm việc',
    title: 'Cải tiến tác phong làm việc khoa học, đúng giờ, chủ động ứng dụng công nghệ trong công việc hành chính và giảng dạy',
    kr1: '100% hồ sơ giáo án, sổ sách chuyên môn được hoàn thành đúng hạn, khoa học và đạt xếp loại Khá/Tốt trở lên.',
    kr1Progress: 0,
    kr2: 'Nâng cao hiệu suất xử lý công việc hành chính, giảm 20% thời gian soạn thảo báo cáo nhờ ứng dụng CNTT hiệu quả.',
    kr2Progress: 0,
    kr3: 'Tuân thủ nghiêm túc 100% thời gian biểu của nhà trường, ra vào lớp đúng giờ, tác phong sư phạm chuẩn mực.',
    kr3Progress: 0
  },
  {
    id: 'tmpl-11',
    name: 'Mẫu 11: Ý thức tổ chức kỷ luật',
    title: 'Nâng cao ý thức tổ chức kỷ luật, chấp hành sự phân công của tổ chức và tuân thủ các nội quy, quy chế của đơn vị',
    kr1: 'Tham gia đầy đủ 100% các cuộc họp, hội nghị và hoạt động tập thể do nhà trường và Công đoàn tổ chức.',
    kr1Progress: 0,
    kr2: 'Nghiêm túc thực hiện 100% các quy định về báo cáo tiến độ, công khai minh bạch thông tin chuyên môn.',
    kr2Progress: 0,
    kr3: 'Chấp hành nghiêm chỉnh quy chế phát ngôn, tích cực xây dựng khối đoàn kết nội bộ vững mạnh trong cơ quan.',
    kr3Progress: 0
  }
];

const SUGGESTIONS_BY_CATEGORY = [
  {
    category: '📖 Giảng dạy & Chuyên môn',
    objectives: [
      'Nâng cao chất lượng giảng dạy môn học chính khóa đạt tỷ lệ học lực khá, giỏi trên 90%',
      'Đổi mới phương pháp dạy học theo định hướng phát triển năng lực và phẩm chất học sinh',
      'Nâng cao hiệu quả ôn luyện đội tuyển học sinh giỏi, đạt giải cao trong các kỳ thi cấp Huyện',
      'Cải tiến chất lượng bài giảng chính khóa, giảm tỷ lệ học sinh trung bình và yếu kém'
    ],
    keyResults: [
      '95% học sinh đạt học lực Khá/Giỏi môn chuyên trách trở lên',
      'Đảm bảo 100% học sinh đội tuyển hoàn thành toàn bộ các chuyên đề ôn luyện nâng cao',
      'Thực hiện thành công ít nhất 2 bài dạy mẫu đổi mới phương pháp giảng dạy cấp trường',
      '100% giáo án, tài liệu được chuẩn bị chu đáo, đạt chất lượng Tốt trở lên'
    ]
  },
  {
    category: '💻 Chuyển đổi số & CNTT',
    objectives: [
      'Đẩy mạnh ứng dụng CNTT và công nghệ số trong công tác giảng dạy, soạn giáo án',
      'Thiết kế và số hóa hệ thống tài liệu, bài giảng tương tác đa phương tiện E-Learning',
      'Ứng dụng thành công các công cụ kiểm tra đánh giá trực tuyến tương tác cao cho học sinh'
    ],
    keyResults: [
      'Thiết kế thành công ít nhất 3 bài giảng tương tác E-Learning chuẩn hóa đưa lên kho học liệu',
      'Sử dụng các công cụ số (Quizizz, Kahoot, Google Forms) trong 100% các tiết ôn tập',
      'Số hóa 100% tài liệu ôn tập, bài tập tự luyện và chia sẻ công khai cho học sinh trên Drive',
      'Tham gia đầy đủ 100% các buổi tập huấn chuyên sâu về phần mềm dạy học hiện đại'
    ]
  },
  {
    category: '📝 Nghiên cứu & Sáng kiến',
    objectives: [
      'Nghiên cứu ứng dụng sáng kiến sư phạm cải tiến chất lượng quản lý lớp học và giảng dạy',
      'Đóng góp các chuyên đề chuyên môn sâu sắc giúp nâng cao năng lực dạy học của tổ bộ môn',
      'Cải tiến các biện pháp giáo dục đạo đức và rèn luyện kỹ năng sống cho học sinh'
    ],
    keyResults: [
      'Hoàn thành 1 bài viết sáng kiến kinh nghiệm (SKKN) nộp Hội đồng khoa học nhà trường đúng hạn',
      'Đạt giải Sáng kiến kinh nghiệm cấp trường loại Khá trở lên hoặc cấp Huyện',
      'Chủ trì ít nhất 1 chuyên đề trao đổi kinh nghiệm sư phạm và giảng dạy cấp tổ',
      'Ứng dụng sáng kiến mới giúp tăng 15% mức độ tương tác và chủ động của học sinh trong giờ học'
    ]
  },
  {
    category: '🏫 Công tác Chủ nhiệm & Học sinh',
    objectives: [
      'Xây dựng tập thể lớp học tự quản, kỷ luật, nề nếp, nâng cao chất lượng giáo dục toàn diện',
      'Phát triển phong trào tự học, tự quản và xây dựng lớp học hạnh phúc, thân thiện',
      'Tăng cường sự phối hợp, gắn kết chặt chẽ giữa nhà trường, giáo viên và phụ huynh học sinh'
    ],
    keyResults: [
      'Duy trì tỷ lệ chuyên cần của lớp chủ nhiệm đạt trên 99% trong suốt năm học',
      '98% học sinh đạt kết quả rèn luyện hạnh kiểm xếp loại Tốt, không có học sinh vi phạm kỷ luật',
      'Tổ chức thành công ít nhất 3 buổi sinh hoạt lớp theo chuyên đề kỹ năng sống ý nghĩa',
      'Giữ liên lạc 100% với phụ huynh học sinh định kỳ để phối hợp giáo dục, hỗ trợ kịp thời'
    ]
  },
  {
    category: '🛠️ Phát triển Bản thân & Đồng nghiệp',
    objectives: [
      'Tích cực học tập, bồi dưỡng nâng cao trình độ chuyên môn và nghiệp vụ sư phạm',
      'Rèn luyện đạo đức tác phong sư phạm mẫu mực, giữ vững khối đoàn kết nội bộ',
      'Chia sẻ, hỗ trợ và đồng hành giúp đỡ các đồng nghiệp trẻ cùng tiến bộ'
    ],
    keyResults: [
      'Đạt danh hiệu Giáo viên dạy giỏi cấp trường hoặc cấp Huyện trở lên',
      'Tham gia dự giờ học tập đồng nghiệp ít nhất 18 tiết trong suốt năm học',
      'Hỗ trợ, hướng dẫn thành công ít nhất 1 đồng nghiệp trẻ cải tiến bài giảng số hóa',
      'Tham gia đầy đủ 100% các lớp bồi dưỡng chính trị và đạt kết quả đánh giá xếp loại Tốt'
    ]
  }
];

interface OkrSectionProps {
  okrs: OKR[];
  onAddOkr: (okr: Omit<OKR, 'id'>) => void;
  onUpdateOkr: (id: string, updatedOkr: Partial<OKR>) => void;
  onDeleteOkr: (id: string) => void;
  readOnly?: boolean;
  isAdmin?: boolean;
}

export default function OkrSection({ okrs, onAddOkr, onUpdateOkr, onDeleteOkr, readOnly = false, isAdmin = false }: OkrSectionProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOkr, setSelectedOkr] = useState<OKR | null>(null);

  // Template management states
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [isMainTemplateDropdownOpen, setIsMainTemplateDropdownOpen] = useState(false);
  const [templates, setTemplates] = useState<OKRTemplate[]>(() => {
    const cached = localStorage.getItem('thcs_hp_okr_templates');
    const fixVietnameseTypos = (text: string): string => {
      if (!text) return text;
      return text
        .replace(/bảo dung/g, 'bao dung')
        .replace(/giáo sư phạm/g, 'sư phạm')
        .replace(/văn phong mẫu mực/g, 'ngôn phong mẫu mực')
        .replace(/hoạt động sư phạm chuẩn mực/g, 'tác phong sư phạm chuẩn mực');
    };

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as OKRTemplate[];
        // Auto-correct spelling errors in parsed cached templates
        const corrected = parsed.map(t => ({
          ...t,
          title: fixVietnameseTypos(t.title),
          kr1: fixVietnameseTypos(t.kr1),
          kr2: fixVietnameseTypos(t.kr2),
          kr3: fixVietnameseTypos(t.kr3)
        }));

        const parsedIds = new Set(corrected.map(t => t.id));
        const missingDefaults = DEFAULT_OKR_TEMPLATES.filter(t => !parsedIds.has(t.id));
        if (missingDefaults.length > 0) {
          const merged = [...corrected, ...missingDefaults];
          localStorage.setItem('thcs_hp_okr_templates', JSON.stringify(merged));
          return merged;
        }
        localStorage.setItem('thcs_hp_okr_templates', JSON.stringify(corrected));
        return corrected;
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

  // Active suggestion popup states
  const [activeSuggestionField, setActiveSuggestionField] = useState<'title' | 'kr1' | 'kr2' | 'kr3' | null>(null);

  const renderSuggestionBox = (field: 'title' | 'kr1' | 'kr2' | 'kr3') => {
    if (activeSuggestionField !== field) return null;

    const isObjective = field === 'title';

    return (
      <div className="mt-1.5 border border-amber-200 bg-amber-50/95 rounded-xl p-3.5 space-y-2.5 shadow-md animate-fade-in relative z-20">
        <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5 select-none">
          <span className="font-extrabold text-amber-900 text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Sổ tay gợi ý {isObjective ? 'Mục tiêu (O)' : 'Kết quả then chốt (KR)'}
          </span>
          <button
            type="button"
            onClick={() => setActiveSuggestionField(null)}
            className="text-amber-600 hover:text-amber-800 text-[10px] font-bold cursor-pointer"
          >
            Đóng gợi ý ✕
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
          {SUGGESTIONS_BY_CATEGORY.map((cat, idx) => {
            const list = isObjective ? cat.objectives : cat.keyResults;
            if (list.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <div className="text-[10px] font-extrabold text-amber-800/80 px-1 select-none">
                  {cat.category}
                </div>
                <div className="space-y-1">
                  {list.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      type="button"
                      onClick={() => {
                        if (field === 'title') setTitle(item);
                        else if (field === 'kr1') setKr1(item);
                        else if (field === 'kr2') setKr2(item);
                        else if (field === 'kr3') setKr3(item);
                        setActiveSuggestionField(null);
                      }}
                      className="w-full text-left text-slate-700 bg-white hover:bg-amber-100/40 hover:text-red-900 p-2 rounded-lg border border-slate-200 hover:border-amber-300 transition text-[11px] font-bold leading-relaxed shadow-3xs cursor-pointer block"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
    setActiveSuggestionField(null);
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
    setActiveSuggestionField(null);
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
          isAdmin ? (
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
            <span className="bg-amber-50 text-amber-800 border border-amber-100 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs select-none">
              <Lock className="w-3 h-3 text-amber-600" /> Chỉ BGH/Admin mới có quyền Thêm/Sửa/Xóa OKR
            </span>
          )
        ) : (
          <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-2xs select-none">
            <Lock className="w-3 h-3 text-slate-400" /> Chế độ chỉ xem
          </span>
        )}
      </div>

      {/* List of OKRs */}
      {/* Quick template selection panel on the spot - Always visible when not read-only and is admin */}
      {!readOnly && isAdmin && (
        <div className="mb-5 bg-rose-50/40 rounded-xl p-4 border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-900 flex items-center gap-1.5 select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0"></span>
              Kho biểu mẫu OKR mẫu - Thêm nhanh ngay tại chỗ
            </h4>
            <span className="text-[10px] text-rose-700 bg-rose-100/60 px-2.5 py-0.5 rounded-full font-extrabold select-none">
              Chỉ 1-Click tự động khởi tạo mục tiêu
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                className="text-left bg-white hover:bg-rose-50 hover:border-rose-300 border border-slate-200 rounded-lg p-3 transition duration-200 text-xs flex flex-col gap-1.5 cursor-pointer group shadow-2xs"
                title={`Nhấp để thêm nhanh mẫu này: ${tmpl.title}`}
              >
                <div className="flex items-center gap-1.5 justify-between w-full">
                  <span className="font-extrabold text-slate-800 group-hover:text-rose-800 transition-colors flex items-center gap-1 min-w-0">
                    <FolderOpen className="w-3.5 h-3.5 text-rose-600 shrink-0 group-hover:animate-bounce" />
                    <span className="truncate">{tmpl.name}</span>
                  </span>
                  <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 opacity-0 group-hover:opacity-100 transition">
                    + THÊM
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 line-clamp-2 italic group-hover:text-slate-700 leading-snug">
                  {tmpl.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {okrs.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
            <p className="text-xs text-slate-500 font-bold">Chưa có mục tiêu OKR nào được tạo cho cán bộ này!</p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-5">
              {readOnly ? 'Hồ sơ hiện tại không có dữ liệu OKR.' : isAdmin ? 'Nhấp vào nút "Thêm OKR mới" hoặc chọn nhanh biểu mẫu dưới đây để khởi tạo.' : 'Chỉ Ban Giám Hiệu/Quản trị viên mới được quyền thiết lập mục tiêu OKR.'}
            </p>

            {!readOnly && isAdmin && (
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
                  {!readOnly && isAdmin && (
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-600 uppercase">Mục Tiêu Lớn (Objective)</label>
                  <button
                    type="button"
                    onClick={() => setActiveSuggestionField(activeSuggestionField === 'title' ? null : 'title')}
                    className="text-[10px] text-red-700 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer select-none"
                  >
                    <Sparkles className="w-3 h-3 text-red-600 animate-pulse" /> Sổ gợi ý
                  </button>
                </div>
                <textarea 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none font-bold" 
                  rows={2} 
                  placeholder="Ví dụ: Trở thành giáo viên dạy xuất sắc môn Ngữ văn cấp Trường..."
                />
                {renderSuggestionBox('title')}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-600 uppercase">Kết quả then chốt 1 (Key Result 1)</label>
                  <button
                    type="button"
                    onClick={() => setActiveSuggestionField(activeSuggestionField === 'kr1' ? null : 'kr1')}
                    className="text-[10px] text-red-700 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer select-none"
                  >
                    <Sparkles className="w-3 h-3 text-red-600 animate-pulse" /> Sổ gợi ý
                  </button>
                </div>
                <input 
                  type="text" 
                  value={kr1}
                  onChange={(e) => setKr1(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none font-medium text-slate-800" 
                  placeholder="Ví dụ: 100% học sinh đội tuyển vượt qua vòng loại trường"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr1Progress} onChange={(e) => setKr1Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr1Progress}%</span>
                </div>
                {renderSuggestionBox('kr1')}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-600 uppercase">Kết quả then chốt 2 (Key Result 2) - Không bắt buộc</label>
                  <button
                    type="button"
                    onClick={() => setActiveSuggestionField(activeSuggestionField === 'kr2' ? null : 'kr2')}
                    className="text-[10px] text-red-700 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer select-none"
                  >
                    <Sparkles className="w-3 h-3 text-red-600 animate-pulse" /> Sổ gợi ý
                  </button>
                </div>
                <input 
                  type="text" 
                  value={kr2}
                  onChange={(e) => setKr2(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none font-medium text-slate-800" 
                  placeholder="Ví dụ: Đạt ít nhất 2 giải khuyến khích cấp xã"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr2Progress} onChange={(e) => setKr2Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr2Progress}%</span>
                </div>
                {renderSuggestionBox('kr2')}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-600 uppercase">Kết quả then chốt 3 (Key Result 3) - Không bắt buộc</label>
                  <button
                    type="button"
                    onClick={() => setActiveSuggestionField(activeSuggestionField === 'kr3' ? null : 'kr3')}
                    className="text-[10px] text-red-700 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer select-none"
                  >
                    <Sparkles className="w-3 h-3 text-red-600 animate-pulse" /> Sổ gợi ý
                  </button>
                </div>
                <input 
                  type="text" 
                  value={kr3}
                  onChange={(e) => setKr3(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none font-medium text-slate-800" 
                  placeholder="Ví dụ: Đạt danh hiệu GV dạy giỏi cấp Huyện"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr3Progress} onChange={(e) => setKr3Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr3Progress}%</span>
                </div>
                {renderSuggestionBox('kr3')}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-600 uppercase">Mục Tiêu Lớn (Objective)</label>
                  <button
                    type="button"
                    onClick={() => setActiveSuggestionField(activeSuggestionField === 'title' ? null : 'title')}
                    className="text-[10px] text-red-700 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer select-none"
                  >
                    <Sparkles className="w-3 h-3 text-red-600 animate-pulse" /> Sổ gợi ý
                  </button>
                </div>
                <textarea 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none font-bold" 
                  rows={2}
                />
                {renderSuggestionBox('title')}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-600 uppercase">Kết quả then chốt 1 (Key Result 1)</label>
                  <button
                    type="button"
                    onClick={() => setActiveSuggestionField(activeSuggestionField === 'kr1' ? null : 'kr1')}
                    className="text-[10px] text-red-700 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer select-none"
                  >
                    <Sparkles className="w-3 h-3 text-red-600 animate-pulse" /> Sổ gợi ý
                  </button>
                </div>
                <input 
                  type="text" 
                  value={kr1}
                  onChange={(e) => setKr1(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none font-medium text-slate-800"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr1Progress} onChange={(e) => setKr1Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr1Progress}%</span>
                </div>
                {renderSuggestionBox('kr1')}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-600 uppercase">Kết quả then chốt 2 (Key Result 2)</label>
                  <button
                    type="button"
                    onClick={() => setActiveSuggestionField(activeSuggestionField === 'kr2' ? null : 'kr2')}
                    className="text-[10px] text-red-700 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer select-none"
                  >
                    <Sparkles className="w-3 h-3 text-red-600 animate-pulse" /> Sổ gợi ý
                  </button>
                </div>
                <input 
                  type="text" 
                  value={kr2}
                  onChange={(e) => setKr2(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none font-medium text-slate-800"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr2Progress} onChange={(e) => setKr2Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr2Progress}%</span>
                </div>
                {renderSuggestionBox('kr2')}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-600 uppercase">Kết quả then chốt 3 (Key Result 3)</label>
                  <button
                    type="button"
                    onClick={() => setActiveSuggestionField(activeSuggestionField === 'kr3' ? null : 'kr3')}
                    className="text-[10px] text-red-700 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer select-none"
                  >
                    <Sparkles className="w-3 h-3 text-red-600 animate-pulse" /> Sổ gợi ý
                  </button>
                </div>
                <input 
                  type="text" 
                  value={kr3}
                  onChange={(e) => setKr3(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-700 outline-none font-medium text-slate-800"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="range" min="0" max="100" value={kr3Progress} onChange={(e) => setKr3Progress(parseInt(e.target.value))}
                    className="flex-1 accent-red-700 h-1 cursor-pointer"
                  />
                  <span className="font-bold text-slate-600 w-8 text-right">{kr3Progress}%</span>
                </div>
                {renderSuggestionBox('kr3')}
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
