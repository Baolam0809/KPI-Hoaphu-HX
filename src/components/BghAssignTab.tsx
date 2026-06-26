import React, { useState } from 'react';
import { Sparkles, Check, HelpCircle, FileText, Send, Info, Award, Database, ListChecks, ArrowRight, UserCheck, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { GroupAssignment, User } from '../types';

interface BghAssignTabProps {
  currentUser: User | 'admin';
  groupAssignments: GroupAssignment[];
  onSaveAssignment: (assignment: GroupAssignment) => void;
  showToast: (msg: string) => void;
}

export interface TargetGroup {
  id: string;
  name: string;
  type: 'to-chuyen-mon' | 'khoi-giaovien' | 'khoi-nhanvien' | ('to-chuyen-mon' | 'khoi-giaovien' | 'khoi-nhanvien')[];
  desc: string;
}

const DEFAULT_TARGET_GROUPS: TargetGroup[] = [
  { id: 'group-khoi-giaovien', name: 'Khối Giáo viên', type: 'khoi-giaovien', desc: 'Áp dụng cho tất cả giáo viên giảng dạy trong trường' },
  { id: 'group-khoi-nhanvien', name: 'Khối Nhân viên', type: 'khoi-nhanvien', desc: 'Áp dụng cho tất cả nhân viên hành chính, phục vụ, bảo vệ, y tế' },
  { id: 'group-to-tu-nhien', name: 'Tổ Tự nhiên', type: 'to-chuyen-mon', desc: 'Áp dụng cho giáo viên các môn Toán, Lý, Hóa, Sinh, Công nghệ, Tin học' },
  { id: 'group-to-xa-hoi', name: 'Tổ Xã hội', type: 'to-chuyen-mon', desc: 'Áp dụng cho giáo viên các môn Văn, Sử, Địa, GDCD, Tiếng Anh' },
  { id: 'group-to-vanthemy', name: 'Tổ Văn thể mỹ', type: 'to-chuyen-mon', desc: 'Áp dụng cho giáo viên các môn Thể dục, Âm nhạc, Mỹ thuật, Trải nghiệm hướng nghiệp' },
  { id: 'group-to-vanphong', name: 'Tổ Văn phòng (Hành chính)', type: 'to-chuyen-mon', desc: 'Áp dụng cho nhân viên Kế toán, Thủ quỹ, Văn thư, Y tế, Thư viện, Thiết bị' }
];

const EXPERT_TEMPLATES: Record<string, { okr: { title: string, kr1: string, kr2: string, kr3: string }, kpis: { criterion: string, weight: number, desc: string }[] }> = {
  'group-khoi-giaovien': {
    okr: {
      title: "Nâng cao chất lượng ứng dụng phương pháp dạy học đổi mới kết hợp chuyển đổi số toàn trường",
      kr1: "100% Giáo viên hoàn thiện học liệu giảng dạy tương tác chất lượng cao đưa lên hệ thống dùng chung.",
      kr2: "Tổ chức tối thiểu 02 hội thảo chuyên đề ứng dụng Trí tuệ Nhân tạo hỗ trợ soạn bài và thiết kế bài tập.",
      kr3: "Đạt tỷ lệ trên 85% giờ dạy thực tế xếp loại Giỏi thông qua thanh tra chuyên môn từ Tổ và BGH."
    },
    kpis: [
      { criterion: "1. Chất lượng giảng dạy & Hồ sơ chuyên môn", weight: 40, desc: "Soạn bài chuẩn phân phối, chuẩn kiến thức kỹ năng. Chấm bài trả bài đầy đủ, lên lớp đúng giờ, nề nếp lớp học xuất sắc." },
      { criterion: "2. Chuyển đổi số & Thiết kế E-learning", weight: 30, desc: "Sử dụng thành thạo thiết bị tương tác, số hóa tài liệu giảng dạy, tích cực ứng dụng học liệu số vào bài học thực tế." },
      { criterion: "3. Công tác Chủ nhiệm & Hoạt động phong trào", weight: 30, desc: "Quản lý nề nếp lớp chủ nhiệm, gắn kết chặt chẽ với gia đình học sinh, tích cực đóng góp phong trào văn nghệ thể thao tổ." }
    ]
  },
  'group-khoi-nhanvien': {
    okr: {
      title: "Chuẩn hóa và chuyên nghiệp hóa quy trình phục vụ nghiệp vụ hành chính và hỗ trợ kỹ thuật học đường",
      kr1: "Số hóa, lưu trữ 100% hồ sơ học bạ điện tử, công văn đi đến và các thủ tục hành chính trực tuyến.",
      kr2: "Rút ngắn 25% thời gian phản hồi và xử lý thủ tục yêu cầu từ phía giáo viên và phụ huynh.",
      kr3: "Xây dựng 02 hướng dẫn tự động (Infographic/Video) giúp cán bộ và phụ huynh làm thủ tục nhanh."
    },
    kpis: [
      { criterion: "1. Nghiệp vụ công tác chuyên môn hành chính", weight: 40, desc: "Sổ sách tài chính rõ ràng, lưu trữ hồ sơ văn thư khoa học, chuẩn bị chu đáo thiết bị thí nghiệm phòng học đầy đủ." },
      { criterion: "2. Chấp hành kỷ luật tác phong & Thời gian biểu", weight: 30, desc: "Đảm bảo trực giờ hành chính đầy đủ, tác phong đón tiếp phụ huynh học sinh văn minh, lịch thiệp, hỗ trợ khẩn cấp tốt." },
      { criterion: "3. Phối hợp công tác liên phòng ban hỗ trợ thi đua", weight: 30, desc: "Hỗ trợ kỹ thuật sự kiện hội trường, đại hội, phong trào xanh sạch đẹp và an toàn phòng chống cháy nổ." }
    ]
  },
  'group-to-tu-nhien': {
    okr: {
      title: "Đẩy mạnh phong trào học tập sáng tạo khoa học kỹ thuật và xây dựng hệ sinh thái phòng thí nghiệm STEM lý thú",
      kr1: "Tổ chức thành công 01 Ngày hội Khoa học công nghệ và STEM ứng dụng cho học sinh toàn trường.",
      kr2: "Số hóa 100% danh mục hóa chất, dụng cụ thực hành thí nghiệm bằng hệ mã số QR Code trực tuyến.",
      kr3: "Bồi dưỡng học sinh giỏi môn Toán, Lý, Hóa đạt ít nhất 03 giải thưởng cấp Huyện trở lên."
    },
    kpis: [
      { criterion: "1. Đảm bảo chất lượng giảng dạy khoa học tự nhiên", weight: 40, desc: "Chất lượng điểm số học sinh đạt yêu cầu chuyên môn, thực hành đầy đủ các tiết học thí nghiệm theo quy chế." },
      { criterion: "2. Đổi mới phương pháp và nghiên cứu STEM", weight: 30, desc: "Triển khai tối thiểu 2 bài dạy ứng dụng STEM thực tế trong học kỳ, hướng dẫn học sinh nghiên cứu khoa học kỹ thuật." },
      { criterion: "3. Phát triển sinh hoạt chuyên môn theo nghiên cứu bài học", weight: 30, desc: "Tham gia đầy đủ các buổi sinh hoạt chuyên đề, xây dựng ngân hàng câu hỏi kiểm tra đánh giá chung chuẩn hóa." }
    ]
  },
  'group-to-xa-hoi': {
    okr: {
      title: "Lan tỏa văn hóa đọc, bồi dưỡng năng lực ngôn ngữ và giáo dục kỹ năng sống, giá trị truyền thống lịch sử",
      kr1: "Xây dựng và hoàn thiện bộ tài liệu 5 chuyên đề bồi dưỡng ôn thi học sinh giỏi môn Ngữ văn/Lịch sử nâng cao.",
      kr2: "Phối hợp Thư viện tổ chức 01 diễn đàn văn hóa đọc chuyên đề 'Sách — Người bạn đồng hành sáng tạo'.",
      kr3: "Đạt thành tích bồi dưỡng đội tuyển HSG Văn, Sử đạt tối thiểu 02 giải cấp Huyện."
    },
    kpis: [
      { criterion: "1. Chất lượng giảng dạy bộ môn Xã hội & Ngôn ngữ", weight: 40, desc: "Giáo án chuẩn hóa theo đổi mới tư duy sáng tạo, chất lượng bài viết học sinh tiến bộ qua các kỳ kiểm tra." },
      { criterion: "2. Đổi mới phương pháp dạy tích hợp", weight: 30, desc: "Sử dụng sơ đồ tư duy, sân khấu hóa tác phẩm văn học hoặc tích hợp giáo dục lịch sử địa phương sinh động." },
      { criterion: "3. Đóng góp công tác tư vấn tâm lý, kỹ năng học sinh", weight: 30, desc: "Hỗ trợ các chuyên đề rèn luyện kỹ năng mềm, phòng chống bạo lực học đường, xây dựng lớp học hạnh phúc." }
    ]
  },
  'group-to-vanthemy': {
    okr: {
      title: "Phát triển phong trào thể dục thể thao, văn nghệ học đường lành mạnh và nâng cao sức khỏe thể chất, thẩm mỹ",
      kr1: "Thành lập và duy trì đều đặn sinh hoạt của 3 câu lạc bộ (Bóng rổ, Mỹ thuật sáng tạo, Đội văn nghệ xung kích).",
      kr2: "Tổ chức thành công Giải thi đấu thể thao học sinh chào mừng Ngày Nhà giáo Việt Nam 20/11.",
      kr3: "Đoạt ít nhất 01 huy chương hoặc giải thưởng phong trào cấp Huyện về văn nghệ/thể thao giáo viên & học sinh."
    },
    kpis: [
      { criterion: "1. Đảm bảo chất lượng bài dạy thực hành thể chất nghệ thuật", weight: 40, desc: "Giảng dạy đúng phân phối chương trình, bảo đảm an toàn tuyệt đối cho học sinh trong các tiết tập luyện ngoài trời." },
      { criterion: "2. Hoạt động ngoại khóa và bồi dưỡng năng khiếu", weight: 30, desc: "Độ bao phủ của phong trào văn thể mỹ, phát hiện và bồi dưỡng các nhân tố năng khiếu cho nhà trường." },
      { criterion: "3. Tham gia chuẩn bị kỹ thuật nghi lễ và khánh tiết", weight: 30, desc: "Hỗ trợ âm thanh, ánh sáng, trang trí khánh tiết cho tất cả các kỳ đại hội, lễ khai giảng, bế giảng và sự kiện chính thức." }
    ]
  },
  'group-to-vanphong': {
    okr: {
      title: "Ứng dụng công nghệ quản trị văn phòng số thông minh, an toàn y tế học đường và tối ưu hóa thư viện điện tử",
      kr1: "Triển khai hệ thống mượn trả sách thư viện hoàn toàn bằng thẻ mã vạch số hóa, tăng 30% lượt đọc.",
      kr2: "Hoàn thiện 100% hồ sơ tài chính quyết toán thuế, bảo hiểm xã hội chính xác, nộp đúng kỳ hạn quy định.",
      kr3: "Xây dựng bản đồ định vị phòng học thông minh kết hợp hệ thống theo dõi sức khỏe học sinh y tế trực tuyến."
    },
    kpis: [
      { criterion: "1. Nghiệp vụ công tác chuyên môn phòng ban", weight: 40, desc: "Sổ sách kế toán chính xác, công văn đi - đến ngăn nắp, thiết bị thí nghiệm sẵn sàng phục vụ giảng dạy đầy đủ." },
      { criterion: "2. Phục vụ đón tiếp hành chính văn minh", weight: 30, desc: "Thái độ đón tiếp lịch thiệp, nhã nhặn với đồng nghiệp, phụ huynh và học sinh. Đảm bảo vệ sinh phòng làm việc gọn gàng." },
      { criterion: "3. Hỗ trợ sự kiện và các công việc đột xuất", weight: 30, desc: "Tham gia chuẩn bị cơ sở vật chất, hậu cần đại hội, sự kiện lớn của trường và trực hành chính nghiêm túc." }
    ]
  }
};

const REALISTIC_KPI_SUGGESTIONS = [
  {
    category: 'Chuyên môn Giảng dạy',
    title: 'Nghiệp vụ dạy học & Chất lượng hồ sơ giáo án',
    desc: 'Soạn giáo án đúng phân phối chương trình, chuẩn kiến thức kỹ năng. Chấm trả bài kiểm tra đúng kỳ hạn, lưu trữ hồ sơ minh chứng khoa học. Thước đo: 100% giáo án hoàn thành trước tiết dạy; không có phản hồi tiêu cực về nề nếp chấm bài.'
  },
  {
    category: 'Chuyên môn Giảng dạy',
    title: 'Chất lượng giờ dạy thực tế & Đổi mới phương pháp',
    desc: 'Áp dụng hiệu quả các phương pháp dạy học tích cực (sơ đồ tư duy, làm việc nhóm, lớp học ngược). Thước đo: Đạt tỷ lệ trên 85% giờ dạy thực tế xếp loại Giỏi qua thanh tra của Tổ chuyên môn và BGH.'
  },
  {
    category: 'Chuyển đổi số',
    title: 'Số hóa tài liệu & Thiết kế học liệu số E-learning',
    desc: 'Số hóa giáo án đưa lên hệ thống dùng chung của nhà trường; thiết kế các bài giảng điện tử tương tác cao (PowerPoint, Canva, Quizizz, Kahoot). Thước đo: Đăng tải tối thiểu 5 bộ học liệu tương tác chuẩn hóa lên Google Drive chung của trường trong học kỳ.'
  },
  {
    category: 'Chuyển đổi số',
    title: 'Ứng dụng Công nghệ Thông tin & Trí tuệ Nhân tạo',
    desc: 'Ứng dụng phần mềm quản lý điểm, học bạ điện tử đúng hạn; áp dụng AI (như Gemini) hỗ trợ soạn đề kiểm tra, ngân hàng câu hỏi. Thước đo: 100% hồ sơ học bạ điện tử hoàn thiện trước hạn; tổ chức hoặc tham gia 1 buổi chia sẻ kinh nghiệm ứng dụng công nghệ.'
  },
  {
    category: 'Công tác Chủ nhiệm & Học sinh',
    title: 'Quản lý nề nếp lớp chủ nhiệm & Kỷ cương học đường',
    desc: 'Duy trì tỷ lệ chuyên cần của học sinh lớp chủ nhiệm; giáo dục đạo đức, ngăn chặn bạo lực học đường; tổ chức các chuyên đề trải nghiệm. Thước đo: Lớp đạt danh hiệu Lớp Tiên tiến trở lên; tỷ lệ chuyên cần đạt trên 98%; không có học sinh vi phạm kỷ luật nghiêm trọng.'
  },
  {
    category: 'Công tác Chủ nhiệm & Học sinh',
    title: 'Phối hợp gia đình học sinh & Tư vấn tâm lý học đường',
    desc: 'Duy trì liên lạc thường xuyên qua sổ liên lạc điện tử, Zalo nhóm lớp; tổ chức họp phụ huynh sáng tạo; kịp thời hỗ trợ học sinh có hoàn cảnh khó khăn hoặc vấn đề tâm lý. Thước đo: Đạt tỷ lệ 100% phụ huynh đồng thuận; thực hiện tối thiểu 3 ca tư vấn tâm lý chuyên sâu.'
  },
  {
    category: 'Bồi dưỡng & Thi đua',
    title: 'Bồi dưỡng đội tuyển Học sinh giỏi & Nâng cao chất lượng mũi nhọn',
    desc: 'Xây dựng giáo trình, tài liệu chuyên sâu bồi dưỡng học sinh giỏi khối lớp đảm nhiệm; tổ chức ôn luyện đều đặn bám sát đề thi. Thước đo: Đạt tối thiểu 01 giải cấp Huyện trở lên; tỷ lệ học sinh đạt điểm Khá/Giỏi môn chuyên sâu tăng 5% so với cùng kỳ.'
  },
  {
    category: 'Bồi dưỡng & Thi đua',
    title: 'Phụ đạo học sinh yếu kém & Nâng cao chất lượng đại trà',
    desc: 'Phát hiện sớm học sinh hổng kiến thức để lập kế hoạch phụ đạo riêng biệt; tổ chức mô hình học tập hỗ trợ lẫn nhau (Đôi bạn cùng tiến). Thước đo: Giảm tỷ lệ học sinh học lực yếu xuống dưới 2%; 100% học sinh thi đạt điểm trung bình trở lên.'
  },
  {
    category: 'Hành chính & Nghiệp vụ Văn phòng',
    title: 'Quản lý văn thư, lưu trữ hồ sơ công văn đi đến',
    desc: 'Cập nhật và số hóa 100% công văn đi và đến kịp thời; lưu trữ hồ sơ học bạ, hồ sơ cán bộ khoa học, bảo mật tuyệt đối. Thước đo: Không để thất lạc công văn; tra cứu thông tin nhanh chóng dưới 3 phút.'
  },
  {
    category: 'Hành chính & Nghiệp vụ Văn phòng',
    title: 'Công tác Tài chính Kế toán & Quyết toán ngân sách',
    desc: 'Thực hiện chi trả lương, bảo hiểm đầy đủ, chính xác; hoàn thiện hồ sơ quyết toán thuế, ngân sách đúng hạn định pháp luật. Thước đo: Hồ sơ kế toán kiểm toán đạt loại Xuất sắc; không xảy ra sai sót số liệu tài chính; nộp báo cáo đúng hạn 100%.'
  },
  {
    category: 'Phục vụ & Hỗ trợ kỹ thuật',
    title: 'Công tác Thư viện & Phát triển văn hóa đọc',
    desc: 'Quản lý nề nếp thư viện mượn trả sách; tổ chức các buổi giới thiệu sách hay, tuần lễ đọc sách; số hóa danh mục thẻ thư viện. Thước đo: Tăng lượt đọc sách của học sinh lên 20%; hoàn thành số hóa thẻ thư viện đúng tiến độ.'
  },
  {
    category: 'Phục vụ & Hỗ trợ kỹ thuật',
    title: 'Chuẩn bị thiết bị thí nghiệm & Hỗ trợ thực hành',
    desc: 'Quản lý, bảo dưỡng và chuẩn bị đầy đủ thiết bị, hóa chất trước giờ thực hành của giáo viên và học sinh; bảo đảm an toàn phòng thí nghiệm. Thước đo: 100% các tiết thực hành có đầy đủ trang thiết bị hoạt động tốt; không xảy ra sự cố mất an toàn cháy nổ.'
  }
];

export default function BghAssignTab({ 
  currentUser, 
  groupAssignments, 
  onSaveAssignment, 
  showToast 
}: BghAssignTabProps) {
  // Dynamic Target Groups loaded from localStorage with defaults
  const [groups, setGroups] = useState<TargetGroup[]>(() => {
    const cached = localStorage.getItem('thcs_hp_target_groups');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached target groups", e);
      }
    }
    return DEFAULT_TARGET_GROUPS;
  });

  const [selectedGroup, setSelectedGroup] = useState<TargetGroup>(() => {
    const cached = localStorage.getItem('thcs_hp_target_groups');
    let loadedGroups = DEFAULT_TARGET_GROUPS;
    if (cached) {
      try { loadedGroups = JSON.parse(cached); } catch(e){}
    }
    return loadedGroups[0] || { id: '', name: '', type: 'to-chuyen-mon', desc: '' };
  });
  
  // Group CRUD States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TargetGroup | null>(null);
  const [groupFormName, setGroupFormName] = useState('');
  const [groupFormTypes, setGroupFormTypes] = useState<('to-chuyen-mon' | 'khoi-giaovien' | 'khoi-nhanvien')[]>(['to-chuyen-mon']);
  const [groupFormDesc, setGroupFormDesc] = useState('');

  // States cho form chỉnh sửa
  const [assignDirection, setAssignDirection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationQuote, setGenerationQuote] = useState('');
  
  // Preview states
  const [previewOkrTitle, setPreviewOkrTitle] = useState('');
  const [previewKr1, setPreviewKr1] = useState('');
  const [previewKr2, setPreviewKr2] = useState('');
  const [previewKr3, setPreviewKr3] = useState('');
  
  const [previewKpi1Name, setPreviewKpi1Name] = useState('');
  const [previewKpi1Weight, setPreviewKpi1Weight] = useState(40);
  const [previewKpi1Desc, setPreviewKpi1Desc] = useState('');
  
  const [previewKpi2Name, setPreviewKpi2Name] = useState('');
  const [previewKpi2Weight, setPreviewKpi2Weight] = useState(30);
  const [previewKpi2Desc, setPreviewKpi2Desc] = useState('');
  
  const [previewKpi3Name, setPreviewKpi3Name] = useState('');
  const [previewKpi3Weight, setPreviewKpi3Weight] = useState(30);
  const [previewKpi3Desc, setPreviewKpi3Desc] = useState('');

  const [generatingKpiNum, setGeneratingKpiNum] = useState<number | null>(null);

  // States for manual suggestions and OKR reference suggestions
  const [activeKpiForSuggestion, setActiveKpiForSuggestion] = useState<number | null>(null);
  const [suggestionSearch, setSuggestionSearch] = useState('');
  const [selectedSuggestionCategory, setSelectedSuggestionCategory] = useState<string>('Tất cả');

  const currentAssignment = groupAssignments.find(a => a.id === selectedGroup.id);

  const isBgh = currentUser === 'admin' || (currentUser && typeof currentUser === 'object' && currentUser.type === 'BGH');

  // Group CRUD functions
  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupFormName('');
    setGroupFormTypes(['to-chuyen-mon']);
    setGroupFormDesc('');
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: TargetGroup, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent choosing the card when clicking edit
    setEditingGroup(group);
    setGroupFormName(group.name);
    
    // Normalize to an array of types
    const typesArray = Array.isArray(group.type) 
      ? group.type 
      : (group.type ? [group.type] : ['to-chuyen-mon']);
    setGroupFormTypes(typesArray as any);
    
    setGroupFormDesc(group.desc);
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = () => {
    if (!groupFormName.trim()) {
      showToast("Vui lòng nhập tên Tổ / Khối!");
      return;
    }

    if (groupFormTypes.length === 0) {
      showToast("Vui lòng tích chọn ít nhất một phân nhóm nhân sự!");
      return;
    }

    let updatedGroups: TargetGroup[];
    if (editingGroup) {
      // Edit
      updatedGroups = groups.map(g => g.id === editingGroup.id ? {
        ...g,
        name: groupFormName.trim(),
        type: groupFormTypes,
        desc: groupFormDesc.trim()
      } : g);
      showToast(`Đã cập nhật Tổ/Khối: ${groupFormName.trim()}`);
    } else {
      // Add
      const newId = `group-${Date.now()}`;
      const newGroup: TargetGroup = {
        id: newId,
        name: groupFormName.trim(),
        type: groupFormTypes,
        desc: groupFormDesc.trim()
      };
      updatedGroups = [...groups, newGroup];
      showToast(`Đã thêm Tổ/Khối mới: ${groupFormName.trim()}`);
    }

    setGroups(updatedGroups);
    localStorage.setItem('thcs_hp_target_groups', JSON.stringify(updatedGroups));
    setIsGroupModalOpen(false);

    // Update selection
    if (editingGroup && selectedGroup.id === editingGroup.id) {
      setSelectedGroup(updatedGroups.find(g => g.id === editingGroup.id) || updatedGroups[0]);
    } else if (!editingGroup) {
      setSelectedGroup(updatedGroups[updatedGroups.length - 1]);
    }
  };

  const handleDeleteGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent choosing the card when clicking delete
    if (window.confirm("Bạn có chắc chắn muốn xóa Tổ/Khối này không? Các thiết lập OKR-KPI tương ứng cũng sẽ bị gỡ bỏ.")) {
      const updatedGroups = groups.filter(g => g.id !== groupId);
      setGroups(updatedGroups);
      localStorage.setItem('thcs_hp_target_groups', JSON.stringify(updatedGroups));
      
      showToast("Đã xóa Tổ/Khối thành công.");
      
      // Select another remaining group if we deleted the selected one
      if (selectedGroup.id === groupId) {
        if (updatedGroups.length > 0) {
          handleSelectGroupChange(updatedGroups[0]);
        } else {
          setSelectedGroup({ id: '', name: '', type: 'to-chuyen-mon', desc: '' });
        }
      }
    }
  };

  const handleSelectGroupChange = (group: TargetGroup) => {
    setSelectedGroup(group);
    
    // Clear form & previews
    setAssignDirection('');
    
    // If there is an existing assignment, populate it into the previews so they can edit it
    const existing = groupAssignments.find(a => a.id === group.id);
    if (existing) {
      setPreviewOkrTitle(existing.okr.title);
      setPreviewKr1(existing.okr.kr1);
      setPreviewKr2(existing.okr.kr2);
      setPreviewKr3(existing.okr.kr3);
      
      if (existing.kpis[0]) {
        setPreviewKpi1Name(existing.kpis[0].criterion);
        setPreviewKpi1Weight(existing.kpis[0].weight);
        setPreviewKpi1Desc(existing.kpis[0].desc);
      }
      if (existing.kpis[1]) {
        setPreviewKpi2Name(existing.kpis[1].criterion);
        setPreviewKpi2Weight(existing.kpis[1].weight);
        setPreviewKpi2Desc(existing.kpis[1].desc);
      }
      if (existing.kpis[2]) {
        setPreviewKpi3Name(existing.kpis[2].criterion);
        setPreviewKpi3Weight(existing.kpis[2].weight);
        setPreviewKpi3Desc(existing.kpis[2].desc);
      }
    } else {
      // Clear previews
      setPreviewOkrTitle('');
      setPreviewKr1('');
      setPreviewKr2('');
      setPreviewKr3('');
      setPreviewKpi1Name('');
      setPreviewKpi2Name('');
      setPreviewKpi3Name('');
    }
  };

  const handleApplyTemplate = () => {
    const tmpl = EXPERT_TEMPLATES[selectedGroup.id];
    if (!tmpl) return;
    
    setPreviewOkrTitle(tmpl.okr.title);
    setPreviewKr1(tmpl.okr.kr1);
    setPreviewKr2(tmpl.okr.kr2);
    setPreviewKr3(tmpl.okr.kr3);
    
    setPreviewKpi1Name(tmpl.kpis[0].criterion);
    setPreviewKpi1Weight(tmpl.kpis[0].weight);
    setPreviewKpi1Desc(tmpl.kpis[0].desc);
    
    setPreviewKpi2Name(tmpl.kpis[1].criterion);
    setPreviewKpi2Weight(tmpl.kpis[1].weight);
    setPreviewKpi2Desc(tmpl.kpis[1].desc);
    
    setPreviewKpi3Name(tmpl.kpis[2].criterion);
    setPreviewKpi3Weight(tmpl.kpis[2].weight);
    setPreviewKpi3Desc(tmpl.kpis[2].desc);
    
    showToast(`Đã áp dụng mẫu chuyên gia cho: ${selectedGroup.name}!`);
  };

  const handleCallGeminiAI = async () => {
    setIsGenerating(true);
    
    const quotes = [
      "Gemini đang nghiên cứu định hướng chiến lược của Ban Giám Hiệu...",
      "Đang tối ưu hóa mục tiêu OKR đồng bộ cho toàn bộ Tổ/Khối...",
      "Đang chuẩn hóa 3 chỉ số KPI vận hành chuẩn sư phạm...",
      "Đang cân bằng trọng số và rà soát các tiêu chí định lượng...",
      "Sắp hoàn thành bản thảo mục tiêu chiến lược..."
    ];
    
    let quoteIndex = 0;
    setGenerationQuote(quotes[0]);
    const interval = setInterval(() => {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      setGenerationQuote(quotes[quoteIndex]);
    }, 1500);

    try {
      const groupTypes = Array.isArray(selectedGroup.type) ? selectedGroup.type : [selectedGroup.type];
      const isTeacherType = groupTypes.includes('khoi-giaovien') || groupTypes.includes('to-chuyen-mon') || selectedGroup.id.includes('to-tu-nhien') || selectedGroup.id.includes('to-xa-hoi') || selectedGroup.id.includes('vanthemy');
      
      const response = await fetch("/api/generate-okr-kpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedGroup.name,
          role: "Mục tiêu định hướng cấp Tổ/Khối chiến lược",
          type: isTeacherType ? "GiaoVien" : "NhanVien",
          direction: assignDirection || `Xây dựng mục tiêu phát triển đổi mới toàn diện cho ${selectedGroup.name}.`
        })
      });

      if (!response.ok) {
        throw new Error("Gemini server error");
      }

      const data = await response.json();
      
      setPreviewOkrTitle(data.okr.title);
      setPreviewKr1(data.okr.kr1);
      setPreviewKr2(data.okr.kr2);
      setPreviewKr3(data.okr.kr3);
      
      if (data.kpis && data.kpis[0]) {
        setPreviewKpi1Name(data.kpis[0].criterion);
        setPreviewKpi1Weight(data.kpis[0].weight);
        setPreviewKpi1Desc(data.kpis[0].desc);
      }
      if (data.kpis && data.kpis[1]) {
        setPreviewKpi2Name(data.kpis[1].criterion);
        setPreviewKpi2Weight(data.kpis[1].weight);
        setPreviewKpi2Desc(data.kpis[1].desc);
      }
      if (data.kpis && data.kpis[2]) {
        setPreviewKpi3Name(data.kpis[2].criterion);
        setPreviewKpi3Weight(data.kpis[2].weight);
        setPreviewKpi3Desc(data.kpis[2].desc);
      }

      showToast(`AI Gemini đã sinh thành công mục tiêu OKR-KPI cho ${selectedGroup.name}!`);
    } catch (e) {
      console.error(e);
      // Fallback to local expert templates
      handleApplyTemplate();
      showToast(`Kết nối ngoại tuyến: Đã tự sinh bằng Mẫu Chuyên gia cho ${selectedGroup.name}!`);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const renderKpiSuggestions = (
    kpiNum: number,
    currentKr: string,
    setKpiName: (v: string) => void,
    setKpiDesc: (v: string) => void
  ) => {
    // Filter suggestions
    const filtered = REALISTIC_KPI_SUGGESTIONS.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(suggestionSearch.toLowerCase()) || 
                          item.desc.toLowerCase().includes(suggestionSearch.toLowerCase()) ||
                          item.category.toLowerCase().includes(suggestionSearch.toLowerCase());
      if (selectedSuggestionCategory === 'Tất cả') return matchSearch;
      return item.category === selectedSuggestionCategory && matchSearch;
    });

    const categories = ['Tất cả', 'Chuyên môn Giảng dạy', 'Chuyển đổi số', 'Công tác Chủ nhiệm & Học sinh', 'Bồi dưỡng & Thi đua', 'Hành chính & Nghiệp vụ Văn phòng', 'Phục vụ & Hỗ trợ kỹ thuật'];

    return (
      <div className="mt-3 p-3 bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200 rounded-lg space-y-3 text-xs shadow-xs animate-fade-in relative z-10" id={`kpi-suggestion-panel-${kpiNum}`}>
        <div className="flex items-center justify-between border-b border-slate-150 pb-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ListChecks className="w-4 h-4 text-indigo-600" />
            <span>Thư viện gợi ý tham chiếu KPI {kpiNum}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActiveKpiForSuggestion(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. Dynamic OKR Suggestion Section */}
        {previewOkrTitle.trim() && (
          <div className="p-2.5 bg-indigo-50/80 border border-indigo-150 rounded-lg space-y-1.5 text-left">
            <div className="flex items-center gap-1 text-[10px] font-black text-indigo-800 uppercase tracking-wide">
              <Award className="w-3.5 h-3.5 text-indigo-700" />
              <span>Gợi ý ăn khớp theo OKR Chiến lược</span>
            </div>
            <div className="space-y-1 text-[11px] leading-relaxed text-slate-700 font-medium">
              <p>🎯 <strong>Mục tiêu Tổ:</strong> {previewOkrTitle}</p>
              {currentKr ? (
                <p>🔑 <strong>Kết quả then chốt (KR{kpiNum}):</strong> {currentKr}</p>
              ) : (
                <p className="text-slate-500 italic">Chưa nhập Kết quả then chốt KR{kpiNum}. Nhập KR để nhận gợi ý cụ thể hơn!</p>
              )}
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  let suggestedTitle = '';
                  let suggestedDesc = '';

                  if (currentKr) {
                    // Extract core concept from KR
                    let cleanedKr = currentKr;
                    if (cleanedKr.match(/^\d+%/)) {
                      cleanedKr = cleanedKr.replace(/^\d+%\s*/, '');
                    }
                    suggestedTitle = `${kpiNum}. Thực hiện ${cleanedKr.length > 50 ? cleanedKr.slice(0, 50) + '...' : cleanedKr}`;
                    suggestedDesc = `Tập trung thực hiện các hoạt động thực tế để hoàn thành Kết quả then chốt KR${kpiNum}: "${currentKr}".\n\nThước đo đo lường hiệu quả:\n- Đạt 100% các chỉ tiêu số lượng và tiến độ đã cam kết.\n- Có đầy đủ tài liệu minh chứng, báo cáo số liệu trung thực gửi Tổ trưởng chuyên môn đúng hạn.`;
                  } else {
                    suggestedTitle = `${kpiNum}. Đồng bộ theo Mục tiêu OKR`;
                    suggestedDesc = `Phối hợp triển khai các hành động nghiệp vụ bám sát mục tiêu: "${previewOkrTitle}".\n\nThước đo đo lường hiệu quả:\n- Hoàn thành đầy đủ các nhiệm vụ trọng tâm được BGH và Tổ giao.\n- Không có sai sót hoặc phản hồi tiêu cực về tác phong công tác.`;
                  }

                  setKpiName(suggestedTitle);
                  setKpiDesc(suggestedDesc);
                  setActiveKpiForSuggestion(null);
                  showToast(`Đã đồng bộ KPI ${kpiNum} bám sát mục tiêu OKR chiến lược!`);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-md text-[11px] text-center transition cursor-pointer flex items-center justify-center gap-1 shadow-3xs"
              >
                <Check className="w-3.5 h-3.5" />
                Áp dụng thiết lập bám sát OKR/KR này
              </button>
            </div>
          </div>
        )}

        {/* 2. Manual Catalog Selector */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-1 text-[10px] font-black text-teal-800 uppercase tracking-wide">
            <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
            <span>Tham chiếu tiêu chí chuẩn sư phạm / Nghiệp vụ văn phòng</span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedSuggestionCategory(cat)}
                className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap cursor-pointer transition ${
                  selectedSuggestionCategory === cat 
                    ? 'bg-teal-600 text-white shadow-4xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={suggestionSearch}
              onChange={(e) => setSuggestionSearch(e.target.value)}
              placeholder="Tìm kiếm gợi ý nhanh..."
              className="w-full border border-slate-300 rounded-md py-1 px-2.5 text-[11px] font-medium bg-white focus:outline-indigo-500"
            />
          </div>

          {/* Suggestions List */}
          <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filtered.length > 0 ? (
              filtered.map((item, index) => (
                <div 
                  key={index} 
                  className="p-2.5 bg-white border border-slate-200 hover:border-teal-300 rounded-lg hover:bg-teal-50/20 transition text-left space-y-1 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 text-[11px]">{item.title}</span>
                      <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.2 rounded-full uppercase shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-normal">{item.desc}</p>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setKpiName(`${kpiNum}. ${item.title}`);
                        setKpiDesc(item.desc);
                        setActiveKpiForSuggestion(null);
                        showToast(`Đã áp dụng mẫu gợi ý: "${item.title}" cho KPI ${kpiNum}`);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-2.5 py-1 rounded text-[10px] cursor-pointer transition shadow-4xs"
                    >
                      Áp dụng mẫu này
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-3 text-[11px]">Không tìm thấy gợi ý nào phù hợp.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleApproveAndPublish = () => {
    if (!previewOkrTitle) {
      showToast("Vui lòng thiết lập tiêu đề OKR mục tiêu chung!");
      return;
    }
    
    const totalWeight = previewKpi1Weight + previewKpi2Weight + previewKpi3Weight;
    if (totalWeight !== 100) {
      showToast(`Tổng trọng số KPI là ${totalWeight}%. Yêu cầu tổng trọng số của 3 tiêu chí phải đúng 100%!`);
      return;
    }

    const newAssignment: GroupAssignment = {
      id: selectedGroup.id,
      targetType: selectedGroup.type,
      targetName: selectedGroup.name,
      okr: {
        title: previewOkrTitle,
        kr1: previewKr1,
        kr2: previewKr2,
        kr3: previewKr3
      },
      kpis: [
        { criterion: previewKpi1Name, weight: previewKpi1Weight, desc: previewKpi1Desc },
        { criterion: previewKpi2Name, weight: previewKpi2Weight, desc: previewKpi2Desc },
        { criterion: previewKpi3Name, weight: previewKpi3Weight, desc: previewKpi3Desc }
      ],
      assignedBy: currentUser === 'admin' ? 'Hiệu trưởng Nghiêm Hồng Quân' : (typeof currentUser === 'object' ? currentUser.name : 'Ban Giám Hiệu'),
      assignedAt: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };

    onSaveAssignment(newAssignment);
    showToast(`Đã ban hành & giao mục tiêu OKR-KPI thành công cho ${selectedGroup.name}!`);
  };

  if (!isBgh) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-xs md:text-sm">
        <p className="text-red-600 font-bold">Lỗi truy cập: Phân vùng này chỉ dành riêng cho Ban Giám Hiệu lập và giao mục tiêu!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="bgh-assign-tab-root">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 rounded-xl shadow-md border border-blue-900 text-white relative overflow-hidden select-none">
        <div className="z-10 relative space-y-1.5">
          <span className="bg-yellow-400 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            BGH Thiết lập chiến lược
          </span>
          <h2 className="text-lg md:text-xl font-black text-white">
            Xây dựng Mục tiêu & Giao chỉ tiêu OKR-KPI cho Toàn trường
          </h2>
          <p className="text-[11px] text-slate-200 leading-relaxed max-w-2xl font-medium">
            Tại đây, Hiệu trưởng và Phó hiệu trưởng tiến hành thiết kế các mục tiêu định hướng đổi mới cho từng Tổ chuyên môn hoặc Khối nhân sự. Nhân viên/Giáo viên thuộc các khối này sẽ nhận chỉ đạo trực tiếp để làm căn cứ lập OKR cá nhân tương ứng.
          </p>
        </div>
        <div className="absolute right-4 bottom-0 opacity-15 pointer-events-none">
          <Award className="w-32 h-32 text-yellow-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: List of groups/departments */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pl-1">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-slate-600" /> Chọn Tổ / Khối Giao Việc
            </h3>
            <button
              onClick={handleOpenAddGroup}
              className="text-[10px] bg-blue-900 hover:bg-blue-950 text-white font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer select-none shadow-3xs hover:scale-[1.01]"
              id="btn-add-group"
            >
              <Plus className="w-3 h-3" /> Thêm Tổ/Khối
            </button>
          </div>
          <div className="space-y-2">
            {groups.map(group => {
              const isActive = selectedGroup.id === group.id;
              const hasAssigned = groupAssignments.some(a => a.id === group.id);
              
              return (
                <div
                  key={group.id}
                  onClick={() => handleSelectGroupChange(group)}
                  className={`group/card w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1 cursor-pointer hover:scale-[1.01] relative ${
                    isActive 
                      ? 'bg-blue-50/70 border-blue-600 shadow-xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  id={`group-card-${group.id}`}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className={`font-black text-xs md:text-sm leading-tight ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>
                      {group.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasAssigned ? (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-600" /> Đang áp dụng
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                          Chưa thiết lập
                        </span>
                      )}
                      
                      {/* Edit and Delete Buttons */}
                      <button
                        onClick={(e) => handleOpenEditGroup(group, e)}
                        title="Chỉnh sửa Tổ/Khối"
                        className="p-1 text-slate-400 hover:text-blue-900 rounded hover:bg-slate-100 transition cursor-pointer"
                        id={`btn-edit-group-${group.id}`}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteGroup(group.id, e)}
                        title="Xóa Tổ/Khối"
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition cursor-pointer"
                        id={`btn-delete-group-${group.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-snug">
                    {group.desc}
                  </p>
                  
                  {/* Category Tag Badges */}
                  <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-slate-100">
                    {(Array.isArray(group.type) ? group.type : [group.type]).map((t) => (
                      <span key={t} className="text-[9px] bg-blue-50/70 text-blue-800 font-black px-1.5 py-0.5 rounded-md border border-blue-100/50">
                        {t === 'to-chuyen-mon' ? 'Tổ Chuyên Môn' : t === 'khoi-giaovien' ? 'Khối Giáo viên' : 'Khối Nhân viên'}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Action Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active status indicator card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm md:text-base">
                  Thiết lập mục tiêu cho: <span className="text-blue-900">{selectedGroup.name}</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedGroup.desc}
                </p>
              </div>
              {currentAssignment ? (
                <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-right text-[10px] leading-snug">
                  <span className="block text-slate-500 font-bold">Người ban hành</span>
                  <span className="font-extrabold text-slate-800">{currentAssignment.assignedBy} ({currentAssignment.assignedAt})</span>
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase">
                  ⚠️ Chưa có quyết định ban hành
                </div>
              )}
            </div>

            {/* AI Generation Form & Inputs */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">
                  Định hướng chỉ đạo chiến lược của Ban Giám Hiệu
                </label>
                <textarea
                  value={assignDirection}
                  onChange={(e) => setAssignDirection(e.target.value)}
                  placeholder={`Mô tả các trọng tâm hành động, ví dụ: "Tập trung bứt phá đổi mới, đưa dạy học STEM vào thực tiễn bài dạy môn Tự nhiên, thiết kế mã QR quản lý thiết bị dạy học thí nghiệm tiện lợi..."`}
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-medium text-slate-800 min-h-[70px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleCallGeminiAI}
                  className="flex-1 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-black py-2.5 px-4 rounded-xl text-center transition cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse animate-bounce" />
                  {isGenerating ? "Đang xử lý phân tích..." : "🤖 Thiết lập nhanh bằng AI Gemini (Khuyên dùng)"}
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleApplyTemplate}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-black py-2.5 px-4 rounded-xl text-center transition cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                >
                  <FileText className="w-4 h-4 text-slate-500" /> Dùng Mẫu Chuyên gia Chuẩn
                </button>
              </div>
            </div>

            {/* AI Loading State */}
            {isGenerating && (
              <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col items-center justify-center gap-3 border border-slate-800 animate-pulse shadow-inner select-none">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  <Sparkles className="w-4 h-4 text-yellow-300 absolute inset-0 m-auto animate-ping" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-white">{generationQuote}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Hệ thống đang đồng bộ chỉ tiêu giáo dục quốc gia...</p>
                </div>
              </div>
            )}

            {/* Live Editable draft preview */}
            {(previewOkrTitle || previewKpi1Name) && !isGenerating && (
              <div className="space-y-4 pt-3 border-t border-slate-100 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-4 h-4 text-indigo-600" /> Bản Thảo Phê Duyệt OKR & KPI Tổ / Khối
                  </h4>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-150 font-bold px-2 py-0.5 rounded">
                    Có thể tùy chỉnh trước khi ban hành
                  </span>
                </div>

                {/* Part A: OKR */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="font-black text-xs text-blue-900 uppercase tracking-wide flex items-center gap-1">
                    <Award className="w-4 h-4 text-blue-800" /> Phần I: Mục tiêu chiến lược Tổ/Khối (OKR)
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1 relative group/tooltip">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Mục tiêu (Objective)</label>
                      <input
                        type="text"
                        value={previewOkrTitle}
                        onChange={(e) => setPreviewOkrTitle(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800 bg-white"
                      />
                      {previewOkrTitle.trim() && (
                        <div className="absolute z-50 bottom-full left-0 mb-2 w-full p-3 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-pre-wrap leading-relaxed font-semibold">
                          <div className="text-yellow-300 font-extrabold uppercase mb-1 text-[9px]">🔍 Xem đầy đủ Mục tiêu (Objective):</div>
                          {previewOkrTitle}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1 relative group/tooltip">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Kết quả then chốt 1 (KR1)</label>
                        <textarea
                          value={previewKr1}
                          onChange={(e) => setPreviewKr1(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 text-[11px] font-medium text-slate-800 bg-white min-h-[50px]"
                        />
                        {previewKr1.trim() && (
                          <div className="absolute z-50 bottom-full left-0 mb-2 w-full p-3 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-pre-wrap leading-relaxed font-semibold">
                            <div className="text-yellow-300 font-extrabold uppercase mb-1 text-[9px]">🔍 Xem đầy đủ Kết quả then chốt 1 (KR1):</div>
                            {previewKr1}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 relative group/tooltip">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Kết quả then chốt 2 (KR2)</label>
                        <textarea
                          value={previewKr2}
                          onChange={(e) => setPreviewKr2(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 text-[11px] font-medium text-slate-800 bg-white min-h-[50px]"
                        />
                        {previewKr2.trim() && (
                          <div className="absolute z-50 bottom-full left-0 mb-2 w-full p-3 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-pre-wrap leading-relaxed font-semibold">
                            <div className="text-yellow-300 font-extrabold uppercase mb-1 text-[9px]">🔍 Xem đầy đủ Kết quả then chốt 2 (KR2):</div>
                            {previewKr2}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 relative group/tooltip">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Kết quả then chốt 3 (KR3)</label>
                        <textarea
                          value={previewKr3}
                          onChange={(e) => setPreviewKr3(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 text-[11px] font-medium text-slate-800 bg-white min-h-[50px]"
                        />
                        {previewKr3.trim() && (
                          <div className="absolute z-50 bottom-full left-0 mb-2 w-full p-3 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-pre-wrap leading-relaxed font-semibold">
                            <div className="text-yellow-300 font-extrabold uppercase mb-1 text-[9px]">🔍 Xem đầy đủ Kết quả then chốt 3 (KR3):</div>
                            {previewKr3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Part B: KPI */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="font-black text-xs text-blue-900 uppercase tracking-wide flex items-center gap-1">
                      <Database className="w-4 h-4 text-blue-800" /> Phần II: 3 Chỉ số vận hành hằng ngày (KPI)
                    </div>
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
                      (previewKpi1Weight + previewKpi2Weight + previewKpi3Weight) === 100 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    }`}>
                      Tổng Trọng số: {previewKpi1Weight + previewKpi2Weight + previewKpi3Weight}% {(previewKpi1Weight + previewKpi2Weight + previewKpi3Weight) !== 100 && "(Yêu cầu: 100%)"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* KPI 1 */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-3 space-y-1 relative group/tooltip">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Tiêu chí KPI 1</label>
                          <input
                            type="text"
                            value={previewKpi1Name}
                            onChange={(e) => setPreviewKpi1Name(e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-slate-50"
                          />
                          {previewKpi1Name.trim() && (
                            <div className="absolute z-50 bottom-full left-0 mb-2 w-full p-3 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-pre-wrap leading-relaxed font-semibold">
                              <div className="text-yellow-300 font-extrabold uppercase mb-1 text-[9px]">🔍 Xem đầy đủ Tiêu chí KPI 1:</div>
                              {previewKpi1Name}
                            </div>
                          )}
                        </div>
                        <div className="col-span-1 space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Trọng số (%)</label>
                          <input
                            type="number"
                            value={previewKpi1Weight}
                            onChange={(e) => setPreviewKpi1Weight(parseInt(e.target.value) || 0)}
                            className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-slate-50 text-center"
                          />
                        </div>
                      </div>
                      <div className="space-y-1 relative group/tooltip">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Mô tả và thước đo cụ thể</label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveKpiForSuggestion(activeKpiForSuggestion === 1 ? null : 1);
                              setSuggestionSearch('');
                              setSelectedSuggestionCategory('Tất cả');
                            }}
                            className="text-[10px] text-indigo-700 hover:text-indigo-950 font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Mở thư viện gợi ý tham chiếu bám sát OKR và bộ tiêu chí"
                          >
                            <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
                            {activeKpiForSuggestion === 1 ? 'Đóng gợi ý' : '💡 Gợi ý tham chiếu & liên kết OKR'}
                          </button>
                        </div>
                        <textarea
                          value={previewKpi1Desc}
                          onChange={(e) => setPreviewKpi1Desc(e.target.value)}
                          placeholder="Mô tả cụ thể hành động cần làm và thước đo đo lường hiệu quả..."
                          className="w-full border border-slate-300 rounded-md p-1.5 text-[11px] font-medium text-slate-800 bg-slate-50 min-h-[40px]"
                        />
                        {previewKpi1Desc.trim() && (
                          <div className="absolute z-50 bottom-full left-0 mb-2 w-full p-3 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-pre-wrap leading-relaxed font-semibold">
                            <div className="text-yellow-300 font-extrabold uppercase mb-1 text-[9px]">🔍 Xem đầy đủ Mô tả &amp; Thước đo KPI 1:</div>
                            {previewKpi1Desc}
                          </div>
                        )}
                        {activeKpiForSuggestion === 1 && renderKpiSuggestions(1, previewKr1, setPreviewKpi1Name, setPreviewKpi1Desc)}
                      </div>
                    </div>

                    {/* KPI 2 */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-3 space-y-1 relative group/tooltip">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Tiêu chí KPI 2</label>
                          <input
                            type="text"
                            value={previewKpi2Name}
                            onChange={(e) => setPreviewKpi2Name(e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-slate-50"
                          />
                          {previewKpi2Name.trim() && (
                            <div className="absolute z-50 bottom-full left-0 mb-2 w-full p-3 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-pre-wrap leading-relaxed font-semibold">
                              <div className="text-yellow-300 font-extrabold uppercase mb-1 text-[9px]">🔍 Xem đầy đủ Tiêu chí KPI 2:</div>
                              {previewKpi2Name}
                            </div>
                          )}
                        </div>
                        <div className="col-span-1 space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Trọng số (%)</label>
                          <input
                            type="number"
                            value={previewKpi2Weight}
                            onChange={(e) => setPreviewKpi2Weight(parseInt(e.target.value) || 0)}
                            className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-slate-50 text-center"
                          />
                        </div>
                      </div>
                      <div className="space-y-1 relative group/tooltip">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Mô tả và thước đo cụ thể</label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveKpiForSuggestion(activeKpiForSuggestion === 2 ? null : 2);
                              setSuggestionSearch('');
                              setSelectedSuggestionCategory('Tất cả');
                            }}
                            className="text-[10px] text-indigo-700 hover:text-indigo-950 font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Mở thư viện gợi ý tham chiếu bám sát OKR và bộ tiêu chí"
                          >
                            <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
                            {activeKpiForSuggestion === 2 ? 'Đóng gợi ý' : '💡 Gợi ý tham chiếu & liên kết OKR'}
                          </button>
                        </div>
                        <textarea
                          value={previewKpi2Desc}
                          onChange={(e) => setPreviewKpi2Desc(e.target.value)}
                          placeholder="Mô tả cụ thể hành động cần làm và thước đo đo lường hiệu quả..."
                          className="w-full border border-slate-300 rounded-md p-1.5 text-[11px] font-medium text-slate-800 bg-slate-50 min-h-[40px]"
                        />
                        {previewKpi2Desc.trim() && (
                          <div className="absolute z-50 bottom-full left-0 mb-2 w-full p-3 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-pre-wrap leading-relaxed font-semibold">
                            <div className="text-yellow-300 font-extrabold uppercase mb-1 text-[9px]">🔍 Xem đầy đủ Mô tả &amp; Thước đo KPI 2:</div>
                            {previewKpi2Desc}
                          </div>
                        )}
                        {activeKpiForSuggestion === 2 && renderKpiSuggestions(2, previewKr2, setPreviewKpi2Name, setPreviewKpi2Desc)}
                      </div>
                    </div>

                    {/* KPI 3 */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-3 space-y-1 relative group/tooltip">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Tiêu chí KPI 3</label>
                          <input
                            type="text"
                            value={previewKpi3Name}
                            onChange={(e) => setPreviewKpi3Name(e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-slate-50"
                          />
                          {previewKpi3Name.trim() && (
                            <div className="absolute z-50 bottom-full left-0 mb-2 w-full p-3 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-pre-wrap leading-relaxed font-semibold">
                              <div className="text-yellow-300 font-extrabold uppercase mb-1 text-[9px]">🔍 Xem đầy đủ Tiêu chí KPI 3:</div>
                              {previewKpi3Name}
                            </div>
                          )}
                        </div>
                        <div className="col-span-1 space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Trọng số (%)</label>
                          <input
                            type="number"
                            value={previewKpi3Weight}
                            onChange={(e) => setPreviewKpi3Weight(parseInt(e.target.value) || 0)}
                            className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-slate-50 text-center"
                          />
                        </div>
                      </div>
                      <div className="space-y-1 relative group/tooltip">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Mô tả và thước đo cụ thể</label>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveKpiForSuggestion(activeKpiForSuggestion === 3 ? null : 3);
                              setSuggestionSearch('');
                              setSelectedSuggestionCategory('Tất cả');
                            }}
                            className="text-[10px] text-indigo-700 hover:text-indigo-950 font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Mở thư viện gợi ý tham chiếu bám sát OKR và bộ tiêu chí"
                          >
                            <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
                            {activeKpiForSuggestion === 3 ? 'Đóng gợi ý' : '💡 Gợi ý tham chiếu & liên kết OKR'}
                          </button>
                        </div>
                        <textarea
                          value={previewKpi3Desc}
                          onChange={(e) => setPreviewKpi3Desc(e.target.value)}
                          placeholder="Mô tả cụ thể hành động cần làm và thước đo đo lường hiệu quả..."
                          className="w-full border border-slate-300 rounded-md p-1.5 text-[11px] font-medium text-slate-800 bg-slate-50 min-h-[40px]"
                        />
                        {previewKpi3Desc.trim() && (
                          <div className="absolute z-50 bottom-full left-0 mb-2 w-full p-3 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-pre-wrap leading-relaxed font-semibold">
                            <div className="text-yellow-300 font-extrabold uppercase mb-1 text-[9px]">🔍 Xem đầy đủ Mô tả &amp; Thước đo KPI 3:</div>
                            {previewKpi3Desc}
                          </div>
                        )}
                        {activeKpiForSuggestion === 3 && renderKpiSuggestions(3, previewKr3, setPreviewKpi3Name, setPreviewKpi3Desc)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final publish actions */}
                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleApproveAndPublish}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-md hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4 text-white" /> Ban hành & Giao việc chính thức
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GROUP ADD/EDIT MODAL */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="group-form-modal">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-950 text-sm md:text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-900" />
                {editingGroup ? "Chỉnh sửa Tổ / Khối" : "Thêm Tổ / Khối Giao Việc Mới"}
              </h3>
              <button 
                onClick={() => setIsGroupModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-black text-slate-700 uppercase tracking-wide">Tên Tổ / Khối</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tổ Tiếng Anh, Khối Bán trú..."
                  value={groupFormName}
                  onChange={(e) => setGroupFormName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-black text-slate-700 uppercase tracking-wide mb-1">Phân nhóm nhân sự áp dụng (Chọn một hoặc nhiều)</label>
                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {[
                    { value: 'to-chuyen-mon' as const, label: 'Tổ Chuyên Môn', sub: 'Áp dụng cho giáo viên thuộc các tổ bộ môn tự chọn' },
                    { value: 'khoi-giaovien' as const, label: 'Khối Giáo viên', sub: 'Áp dụng đồng loạt cho toàn bộ giáo viên' },
                    { value: 'khoi-nhanvien' as const, label: 'Khối Nhân viên', sub: 'Áp dụng đồng loạt cho toàn bộ nhân viên' }
                  ].map((option) => {
                    const isChecked = groupFormTypes.includes(option.value);
                    return (
                      <label 
                        key={option.value}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border transition cursor-pointer select-none ${
                          isChecked 
                            ? 'bg-blue-50/80 border-blue-400 text-blue-900' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setGroupFormTypes(groupFormTypes.filter(t => t !== option.value));
                            } else {
                              setGroupFormTypes([...groupFormTypes, option.value]);
                            }
                          }}
                          className="mt-0.5 rounded text-blue-900 focus:ring-blue-900 cursor-pointer w-4 h-4 accent-blue-900"
                        />
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[11px] leading-snug">{option.label}</span>
                          <span className="text-[10px] text-slate-500 font-medium leading-normal mt-0.5">{option.sub}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-black text-slate-700 uppercase tracking-wide">Mô tả nhiệm vụ / Đối tượng</label>
                <textarea
                  placeholder="Mô tả tóm tắt đối tượng áp dụng..."
                  value={groupFormDesc}
                  onChange={(e) => setGroupFormDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-medium text-slate-800 min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveGroup}
                className="bg-blue-900 hover:bg-blue-950 text-white font-black py-2 px-5 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" /> Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
