import { User, OKR, KPI, Notification, SystemSettings, ScheduleItem } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: "THCS-HP-020",
    name: "Nghiêm Hồng Quân",
    role: "Super Admin - Giáo viên",
    avatar: "HQ",
    email: "nghiemhongquan@thcshoaphu.edu.vn",
    bio: "Tận tụy vì học sinh thân yêu, quyết tâm số hóa thành công các quy trình quản lý của trường THCS Hòa Phú.",
    password: "Admin@HP2026",
    isTeacher: true,
    type: "BGH"
  },
  {
    id: "THCS-HP-001",
    name: "Nguyễn Thị Mai",
    role: "Giáo viên Ngữ Văn (GVCN)",
    avatar: "TM",
    email: "nguyenthimai@thcshoaphu.edu.vn",
    bio: "Truyền lửa văn học, bồi dưỡng tâm hồn và năng lực tư duy ngôn ngữ sáng tạo cho học sinh Hòa Phú.",
    password: "Mai@HP2026",
    isTeacher: true,
    type: "GiaoVien"
  },
  {
    id: "THCS-HP-005",
    name: "Trần Khánh Vy",
    role: "Nhân viên Kế toán",
    avatar: "KV",
    email: "khanhvy@thcshoaphu.edu.vn",
    bio: "Kế hoạch tài chính rõ ràng, xử lý nghiệp vụ nhanh gọn, chính xác tuyệt đối phục vụ sự nghiệp giảng dạy.",
    password: "Vy@HP2026",
    isTeacher: false,
    type: "NhanVien"
  },
  {
    id: "THCS-HP-006",
    name: "Hoàng Hoài Nam",
    role: "Thiết bị Thí nghiệm",
    avatar: "HN",
    email: "hoainam@thcshoaphu.edu.vn",
    bio: "Sẵn sàng học liệu phòng Lab, ứng dụng phương pháp giáo dục STEM trực quan sinh động.",
    password: "Nam@HP2026",
    isTeacher: false,
    type: "NhanVien"
  },
  {
    id: "THCS-HP-007",
    name: "Đặng Hồng Hoa",
    role: "Văn thư Lưu trữ",
    avatar: "HH",
    email: "honghoa@thcshoaphu.edu.vn",
    bio: "Quản trị hành chính thông minh, bảo mật tuyệt đối văn thư đi/đến trường học Hòa Phú.",
    password: "Hoa@HP2026",
    isTeacher: false,
    type: "NhanVien"
  },
  {
    id: "THCS-HP-008",
    name: "Bùi Ngọc Minh",
    role: "Thư viện Trường",
    avatar: "NM",
    email: "ngocminh@thcshoaphu.edu.vn",
    bio: "Xây dựng không gian văn hóa đọc thân thiện, cập nhật thư viện điện tử tương tác cao.",
    password: "Minh@HP2026",
    isTeacher: false,
    type: "NhanVien"
  },
  {
    id: "THCS-HP-009",
    name: "Nguyễn Văn Hùng",
    role: "Nhân viên Bảo vệ",
    avatar: "VH",
    email: "vanhung@thcshoaphu.edu.vn",
    bio: "Giữ vững an ninh trật tự trường học, cổng trường an toàn, văn minh, lịch thiệp.",
    password: "Hung@HP2026",
    isTeacher: false,
    type: "NhanVien"
  },
  {
    id: "THCS-HP-010",
    name: "Vũ Phương Thảo",
    role: "Y tế Học đường",
    avatar: "PT",
    email: "phuongthao@thcshoaphu.edu.vn",
    bio: "Chăm sóc sức khỏe, phòng chống dịch bệnh kịp thời, vì tầm vóc và thể trạng học sinh.",
    password: "Thao@HP2026",
    isTeacher: false,
    type: "NhanVien"
  }
];

export const INITIAL_OKRS: Record<string, OKR[]> = {
  "THCS-HP-020": [
    {
      id: "okr-1",
      title: "Chỉ đạo chiến lược chuyển đổi số trường học",
      kr1: "Số hóa thành công 100% hồ sơ học bạ toàn bộ các khối lớp.",
      kr1Progress: 90,
      kr2: "100% giáo viên sử dụng thành thạo và chấm điểm KPI trực tuyến.",
      kr2Progress: 80,
      kr3: "Nâng cao uy tín trường, có ít nhất 2 giáo viên đạt giải thiết kế bài giảng E-learning cấp Thành phố.",
      kr3Progress: 50
    }
  ],
  "THCS-HP-001": [
    {
      id: "okr-2",
      title: "Nâng cao chất lượng ôn thi học sinh giỏi môn Ngữ văn cấp trường/thành phố",
      kr1: "Xây dựng hoàn thiện bộ 2 chuyên đề bồi dưỡng chuyên sâu cho đội tuyển học sinh giỏi.",
      kr1Progress: 100,
      kr2: "100% học sinh đội tuyển (4/4 em) vượt qua vòng sơ loại cấp trường trước tháng 12.",
      kr2Progress: 75,
      kr3: "Đạt ít nhất 2 giải Khuyến khích cấp xã/huyện trở lên trong kỳ thi chính thức.",
      kr3Progress: 60
    },
    {
      id: "okr-3",
      title: "Chuyển đổi số trong giảng dạy môn học (Ngữ văn)",
      kr1: "Số hóa 100% giáo án, tài liệu và bài tập về nhà lên Google Drive / Google Classroom.",
      kr1Progress: 95,
      kr2: "Tổ chức ít nhất 3 dự án học tập nhóm áp dụng phương pháp Lớp học đảo ngược (Flipped Classroom).",
      kr2Progress: 80,
      kr3: "Tăng 20% điểm số trung bình của các lớp được áp dụng phương pháp mới.",
      kr3Progress: 70
    }
  ],
  "THCS-HP-005": [
    {
      id: "okr-4",
      title: "Hiện đại hóa và chuyển đổi số toàn diện quy trình tài chính - thu chi",
      kr1: "Triển khai học phí không dùng tiền mặt (App/QR), đạt tỷ lệ trên 90% phụ huynh áp dụng.",
      kr1Progress: 85,
      kr2: "Tự động hóa 100% quy trình tính lương, gửi Phiếu lương điện tử trước ngày 5 hằng tháng.",
      kr2Progress: 90,
      kr3: "Hoàn thiện hệ thống lưu trữ chứng từ điện tử ngăn nắp, dễ truy cập.",
      kr3Progress: 70
    }
  ],
  "THCS-HP-006": [
    {
      id: "okr-5",
      title: "Số hóa danh mục thiết bị và nâng cấp phòng thí nghiệm STEM trực quan",
      kr1: "Đóng gói 100% hóa chất, dụng cụ mượn trả bằng mã QR Code, chia sẻ qua Drive.",
      kr1Progress: 80,
      kr2: "Phối hợp với tổ tự nhiên tổ chức 2 ngày hội 'Khoa học vui' ngoài giờ cho học sinh.",
      kr2Progress: 100,
      kr3: "Cập nhật tài liệu hướng dẫn an toàn phòng thí nghiệm dạng infographic sinh động.",
      kr3Progress: 80
    }
  ],
  "THCS-HP-007": [
    {
      id: "okr-6",
      title: "Triển khai mô hình 'Văn phòng số' tại THCS Hòa Phú",
      kr1: "Số hóa và đồng bộ dữ liệu học bạ cũ của các khóa trước vào hệ thống lưu trữ điện tử.",
      kr1Progress: 85,
      kr2: "Cắt giảm thời gian phê duyệt trình ký bản cứng trực tiếp xuống dưới 1 ngày làm việc.",
      kr2Progress: 95,
      kr3: "Chuẩn hóa quy trình tiếp nhận và phản hồi công văn trực tuyến.",
      kr3Progress: 75
    }
  ],
  "THCS-HP-008": [
    {
      id: "okr-7",
      title: "Biến thư viện thành 'Trạm không gian văn hóa đọc' hấp dẫn",
      kr1: "Tổ chức sự kiện lớn 'Ngày hội đổi sách' thu hút 75% học sinh tham gia.",
      kr1Progress: 100,
      kr2: "Triển khai 'Thư viện điện tử' tích hợp 300 đầu sách nói (Audiobook) phục vụ đọc xa.",
      kr2Progress: 80,
      kr3: "Tăng 40% lượt học sinh đến mượn sách thực tế tại thư viện so với năm học trước.",
      kr3Progress: 60
    }
  ],
  "THCS-HP-009": [
    {
      id: "okr-8",
      title: "Tối ưu hóa kiểm soát an ninh thông minh cổng trường văn minh",
      kr1: "Làm chủ mạng lưới camera giám sát mới, khoanh vùng cảnh báo điểm mù sân trường.",
      kr1Progress: 95,
      kr2: "Kết hợp Đội Cờ đỏ phân luồng cổng trường, giảm ùn tắc giờ cao điểm xuống dưới 10 phút.",
      kr2Progress: 90,
      kr3: "Bảo dưỡng 100% các trang thiết bị phòng cháy chữa cháy của trường học định kỳ.",
      kr3Progress: 100
    }
  ],
  "THCS-HP-010": [
    {
      id: "okr-9",
      title: "Số hóa thông tin chăm sóc y tế dự phòng học đường thông minh",
      kr1: "Tự động hóa gửi các chỉ số thể trạng (chiều cao, cân nặng, thị lực) đến từng phụ huynh học sinh.",
      kr1Progress: 90,
      kr2: "Tổ chức thành công chuỗi truyền thông tương tác phòng bệnh gù lưng học đường.",
      kr2Progress: 100,
      kr3: "Hoàn thiện tủ thuốc học đường và nhật ký sơ cứu điện tử trực tuyến.",
      kr3Progress: 75
    }
  ]
};

export const INITIAL_KPIS: Record<string, KPI[]> = {
  "THCS-HP-020": [
    { criterion: "1. Quản lý điều hành", weight: 40, desc: "Tỷ lệ giáo viên nhân viên hoàn thành kế hoạch tuần đúng hạn.", value: 95 },
    { criterion: "2. Hồ sơ sổ sách trường", weight: 30, desc: "Kiểm tra học bạ, hồ sơ pháp lý không xảy ra lỗi thanh tra.", value: 100 },
    { criterion: "3. Phát triển nhà trường", weight: 20, desc: "Thu hút hoạt động ngoại khóa, xây dựng cơ sở vật chất đổi mới.", value: 90 },
    { criterion: "4. Tuân thủ & Trách nhiệm", weight: 10, desc: "Ý thức kỷ luật, đạo đức đầu tàu gương mẫu sư phạm.", value: 100 }
  ],
  "THCS-HP-001": [
    { criterion: "1. Khối lượng & Tiến độ giảng dạy", weight: 30, desc: "Số tiết thực dạy/tuần; Tỷ lệ hoàn thành chương trình đúng hạn, không cháy giáo án.", value: 100 },
    { criterion: "2. Chất lượng chuyên môn", weight: 30, desc: "Học sinh khá giỏi đạt chuẩn (Khá/Giỏi >= 40%, Yếu <= 5%); Điểm đánh giá dự giờ của Tổ/BGH.", value: 92 },
    { criterion: "3. Hồ sơ và Nghiệp vụ sư phạm", weight: 20, desc: "Đúng hạn 100% giáo án sổ điểm; Có sáng kiến kinh nghiệm (SKKN) được đánh giá Khá trở lên.", value: 85 },
    { criterion: "4. Công tác chủ nhiệm & Kỷ luật", weight: 20, desc: "Tỷ lệ học sinh vi phạm kỷ luật thấp; Đạt lớp Tiên Tiến xuất sắc; Xếp loại thi đua học kỳ A2.", value: 90 }
  ],
  "THCS-HP-005": [
    { criterion: "1. Chính xác & Đúng hạn tài chính", weight: 40, desc: "Báo cáo thuế, báo cáo quyết toán đúng hạn 100%, 0% sai sót xuất toán.", value: 98 },
    { criterion: "2. Quản lý Thu - Chi học đường", weight: 30, desc: "Tỷ lệ hoàn thành thu học phí đúng hạn đầu kỳ đạt trên 95% tổng số học sinh.", value: 90 },
    { criterion: "3. Sổ sách & Hồ sơ kế toán", weight: 20, desc: "Lưu trữ khoa học, trích lục nhanh chóng trong vòng 30 phút khi BGH cần.", value: 95 },
    { criterion: "4. Trách nhiệm & Hợp tác", weight: 10, desc: "Sự phối hợp với các tổ chuyên môn, thực hiện nghiêm quy định kỷ luật.", value: 100 }
  ],
  "THCS-HP-006": [
    { criterion: "1. Sẵn sàng & Đầy đủ thiết bị", weight: 40, desc: "Tỷ lệ chuẩn bị đủ dụng cụ/hóa chất thực hành theo đăng ký giáo viên; Hoàn thành trước giờ học 15p.", value: 100 },
    { criterion: "2. An toàn & Bảo quản", weight: 30, desc: "0 xảy ra sự cố cháy nổ phòng Lab do lỗi chủ quan; Kiểm kê thiết bị định kỳ 1 lần/tháng.", value: 100 },
    { criterion: "3. Hồ sơ & Sổ sách theo dõi", weight: 20, desc: "Nhật ký mượn trả thiết bị chính xác 100%; Đề xuất mua sắm bổ sung vật tư đúng hạn.", value: 80 },
    { criterion: "4. Trách nhiệm & Hợp tác", weight: 10, desc: "Mức độ hài lòng của giáo viên bộ môn khi sử dụng phòng thực hành đạt trên 90%.", value: 95 }
  ],
  "THCS-HP-007": [
    { criterion: "1. Xử lý công văn & Hành chính", weight: 40, desc: "Tiếp nhận và chuyển giao công văn đi đến đúng quy chuẩn trong ngày (Văn bản khẩn < 2 giờ).", value: 95 },
    { criterion: "2. Quản lý hồ sơ & Học bạ", weight: 30, desc: "Bảo mật và an toàn hồ sơ học sinh, giáo viên. Trích lục hồ sơ tìm kiếm nhanh dưới 5 phút.", value: 100 },
    { criterion: "3. Hỗ trợ dịch vụ hành chính", weight: 20, desc: "Xử lý hồ sơ chuyển trường, rút học bạ đúng hẹn. Thái độ tiếp phụ huynh chuẩn sư phạm.", value: 90 },
    { criterion: "4. Kỷ luật & Trách nhiệm", weight: 10, desc: "Chấp hành giờ giấc nghiêm ngặt, bảo mật tuyệt đối các thông tin văn bản nội bộ.", value: 100 }
  ],
  "THCS-HP-008": [
    { criterion: "1. Quản lý tài sản thư viện", weight: 30, desc: "Tỷ lệ hao hụt, mất sách truyện dưới 1%/năm; Sắp xếp khoa học đúng mã phân loại DDC.", value: 95 },
    { criterion: "2. Phục vụ bạn đọc (GV & HS)", weight: 30, desc: "Mở cửa đúng giờ 100%; Đăng ký mượn trả đầy đủ trên phần mềm quản lý thư viện.", value: 90 },
    { criterion: "3. Cập nhật dữ liệu & Báo cáo", weight: 20, desc: "Cập nhật đầu sách mới vào hệ thống trong vòng 3 ngày; Báo cáo lượt đọc chính xác.", value: 85 },
    { criterion: "4. Không gian & Hoạt động", weight: 20, desc: "Đổi mới bày biện không gian đọc; Hỗ trợ các tiết học thư viện theo đúng thời khóa biểu.", value: 100 }
  ],
  "THCS-HP-009": [
    { criterion: "1. An ninh & An toàn tài sản", weight: 40, desc: "0% xảy ra mất trộm tài sản trường học; Kiểm soát 100% người lạ xuất trình giấy tờ trước khi vào.", value: 100 },
    { criterion: "2. Tuần tra & PCCC", weight: 30, desc: "Tuần tra ban đêm chặt chẽ; Ngắt 100% hệ thống điện nước, cửa phòng học cuối giờ học.", value: 100 },
    { criterion: "3. Điều tiết giao thông", weight: 20, desc: "Đám bảo thông thoáng cổng trường giờ tan tầm đưa đón học sinh; Xếp xe giáo viên ngay ngắn.", value: 85 },
    { criterion: "4. Thái độ & Tác phong", weight: 10, desc: "Đeo đồng phục bảo vệ đầy đủ; Thái độ lịch thiệp đúng mực với phụ huynh, học sinh.", value: 90 }
  ],
  "THCS-HP-010": [
    { criterion: "1. Sơ cấp cứu & Chăm sóc", weight: 40, desc: "Có mặt kịp thời xử lý chấn thương ban đầu; Không để xảy ra sai sót y tế gây hậu quả nặng.", value: 100 },
    { criterion: "2. Quản lý dược phẩm & Hồ sơ", weight: 30, desc: "Thuốc tủ y tế không quá hạn; Cập nhật 100% học sinh có hồ sơ theo dõi thể trạng đầy đủ.", value: 90 },
    { criterion: "3. Giám sát dịch bệnh & ATTP", weight: 20, desc: "Giám sát vệ sinh học đường & lưu mẫu thức ăn bán trú hằng ngày; Kịp thời báo cáo dịch bệnh.", value: 95 },
    { criterion: "4. Truyền thông giáo dục sức khỏe", weight: 10, desc: "Thực hiện ít nhất 1 bài viết hoặc buổi tuyên truyền giáo dục sức khỏe/tháng.", value: 80 }
  ]
};

export const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "Hạn chót phê duyệt OKR Học kỳ I",
    time: "Thời hạn: Trước ngày 15 tháng sau",
    type: "urgent",
    read: false
  },
  {
    id: "notif-2",
    title: "Kiểm tra toàn bộ hồ sơ phòng máy & thí nghiệm",
    time: "Bởi: Hiệu phó phụ trách cơ sở vật chất",
    type: "info",
    read: false
  },
  {
    id: "notif-3",
    title: "Đợt khảo sát sự hài lòng từ phụ huynh học sinh",
    time: "Khảo sát trực tuyến qua App",
    type: "normal",
    read: false
  }
];

export const DEFAULT_SETTINGS: SystemSettings = {
  marqueeText: "Hệ thống KPI-OKR trường THCS Hòa Phú – xã Hòa Xá, thành phố Hà Nội. Đổi mới giáo dục, bứt phá chuyên môn, chuẩn hóa quản trị vận hành học đường.",
  schoolShortName: "THCS Hòa Phú",
  location: "Hòa Xá, Ứng Hòa, Hà Nội",
  kpiWeights: {
    learning: 40,
    method: 30,
    responsibility: 20,
    ethics: 10
  },
  heroBannerUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1200&auto=format&fit=crop",
  navbarBannerUrl: "",
  textLogoUrl: ""
};

export const DEFAULT_SCHEDULE_ITEMS: ScheduleItem[] = [
  {
    id: "sched-1",
    scope: "week",
    time: "T2",
    title: "Chào cờ & Giao ban đầu tuần",
    location: "Sân trường / Nhà đa năng",
    color: "blue"
  },
  {
    id: "sched-2",
    scope: "week",
    time: "T4",
    title: "Dự giờ chuyên đề môn Ngữ Văn",
    location: "Lớp 9A2 - Tổ Xã hội dự giờ",
    color: "emerald"
  },
  {
    id: "sched-3",
    scope: "week",
    time: "T6",
    title: "Kiểm kê thư viện & thiết bị Lab",
    location: "Chiều Thứ 6 hằng tuần",
    color: "purple"
  },
  {
    id: "sched-4",
    scope: "month",
    time: "05/07",
    title: "Tập huấn phần mềm quản lý KPI-OKR",
    location: "Phòng máy 1",
    color: "amber"
  },
  {
    id: "sched-5",
    scope: "month",
    time: "15/07",
    title: "Hạn cuối nộp báo cáo tự đánh giá KPI kì I",
    location: "Trực tuyến qua phần mềm",
    color: "rose"
  },
  {
    id: "sched-6",
    scope: "month",
    time: "25/07",
    title: "Họp Hội đồng Sư phạm tháng 7",
    location: "Phòng Hội đồng trường",
    color: "indigo"
  }
];

