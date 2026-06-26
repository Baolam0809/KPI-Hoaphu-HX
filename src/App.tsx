import React, { useState, useEffect } from 'react';
import { Bell, Calendar, MessageSquare, Info, ShieldAlert, Award, Star, BookOpen, Database, CloudUpload, RefreshCw, AlertCircle, Copy, Check, Settings, UserCog, Clock, Sparkles, Tag } from 'lucide-react';
import { User, OKR, KPI, Notification, SystemSettings, ScheduleItem, GroupAssignment } from './types';
import { 
  INITIAL_USERS, 
  INITIAL_OKRS, 
  INITIAL_KPIS, 
  DEFAULT_NOTIFICATIONS, 
  DEFAULT_SETTINGS,
  DEFAULT_SCHEDULE_ITEMS
} from './initialData';

import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import OkrSection from './components/OkrSection';
import KpiSection from './components/KpiSection';
import UsersTab from './components/UsersTab';
import ProfileTab from './components/ProfileTab';
import ExportTab from './components/ExportTab';
import UtilitiesTab from './components/UtilitiesTab';
import SettingsTab from './components/SettingsTab';
import NotificationsTab from './components/NotificationsTab';
import BghAssignTab from './components/BghAssignTab';

import { 
  checkSupabaseConnection, 
  loadAllDataFromSupabase, 
  saveUserToSupabase, 
  deleteUserFromSupabase, 
  saveOkrToSupabase, 
  deleteOkrFromSupabase, 
  saveUserKpisToSupabase, 
  saveSettingsToSupabase,
  saveGroupAssignmentsToSupabase,
  seedSupabaseInitialData,
  SQL_MIGRATION_SCRIPT
} from './supabaseClient';

export default function App() {
  // State đăng nhập
  const [currentUser, setCurrentUser] = useState<User | 'admin' | null>(null);
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);

  // States thông tin Học kỳ và Năm học
  const [semester, setSemester] = useState<string>(() => {
    return localStorage.getItem('thcs_hp_semester') || 'Học kỳ I';
  });
  const [schoolYear, setSchoolYear] = useState<string>(() => {
    return localStorage.getItem('thcs_hp_school_year') || '2026-2027';
  });
  // State điều khiển Modal cài đặt nhanh Học kỳ
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [tempSemester, setTempSemester] = useState('');
  const [tempSchoolYear, setTempSchoolYear] = useState('');

  const handleSaveSemester = (sem: string, year: string) => {
    setSemester(sem);
    setSchoolYear(year);
    localStorage.setItem('thcs_hp_semester', sem);
    localStorage.setItem('thcs_hp_school_year', year);
  };

  // States dữ liệu hệ thống (Lưu & Tải từ Local Storage)
  const [users, setUsers] = useState<User[]>([]);
  const [allOkrs, setAllOkrs] = useState<Record<string, OKR[]>>({});
  const [allKpis, setAllKpis] = useState<Record<string, KPI[]>>({});
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE_ITEMS);
  const [groupAssignments, setGroupAssignments] = useState<GroupAssignment[]>([]);

  // State điều hướng & giao diện
  const [activeTab, setActiveTab] = useState('tab-main');
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'notifications' | 'schedules'>('general');
  const [scheduleView, setScheduleView] = useState<'week' | 'month'>('week');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States kết nối Supabase
  const [supabaseStatus, setSupabaseStatus] = useState<'connecting' | 'connected' | 'error' | 'no-tables'>('connecting');
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [isSqlCopied, setIsSqlCopied] = useState(false);

  // States cho tính năng Giao việc & Tự sinh OKR-KPI bằng AI Gemini
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState<User | null>(null);
  
  // States cho form giao việc & tự sinh
  const [assignDirection, setAssignDirection] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationQuote, setGenerationQuote] = useState('');
  
  // States cho dữ liệu preview sau khi tự sinh
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

  // Realtime clock state for the school marquee bar
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const formatVietnameseDateTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayOfWeek = days[date.getDay()];
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${hours}:${minutes}:${seconds} — ${dayOfWeek}, ngày ${day}/${month}/${year}`;
  };

  // Helper hiển thị thông báo Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCheckSupabaseConnection = async () => {
    setSupabaseStatus('connecting');
    try {
      const conn = await checkSupabaseConnection();
      if (!conn.connected) {
        setSupabaseStatus('error');
        setSupabaseErrorMsg(conn.error || 'Không thể kết nối đến máy chủ Supabase.');
        return false;
      } else if (!conn.tablesExist) {
        setSupabaseStatus('no-tables');
        setSupabaseErrorMsg('Chưa khởi tạo cấu trúc bảng trên Supabase.');
        return false;
      } else {
        setSupabaseStatus('connected');
        return true;
      }
    } catch (err: any) {
      setSupabaseStatus('error');
      setSupabaseErrorMsg(err.message || 'Lỗi kết nối máy chủ Supabase.');
      return false;
    }
  };

  // 1. Tải dữ liệu từ Supabase hoặc Local Storage khi khởi chạy
  useEffect(() => {
    async function initSupabase() {
      const isConnected = await handleCheckSupabaseConnection();
      if (isConnected) {
        // Kết nối thành công và các bảng đã tồn tại!
        try {
          const data = await loadAllDataFromSupabase();
          
          // Chỉ hiển thị các dữ liệu thực tế có trong database Supabase
          setUsers(data.users || []);
          localStorage.setItem('thcs_hp_users', JSON.stringify(data.users || []));
          
          setAllOkrs(data.allOkrs || {});
          localStorage.setItem('thcs_hp_okrs', JSON.stringify(data.allOkrs || {}));
          
          setAllKpis(data.allKpis || {});
          localStorage.setItem('thcs_hp_kpis', JSON.stringify(data.allKpis || {}));
          
          if (data.settings) {
            setSettings(data.settings);
            localStorage.setItem('thcs_hp_settings', JSON.stringify(data.settings));
          } else {
            setSettings(DEFAULT_SETTINGS);
            localStorage.setItem('thcs_hp_settings', JSON.stringify(DEFAULT_SETTINGS));
          }

          if (data.groupAssignments && data.groupAssignments.length > 0) {
            setGroupAssignments(data.groupAssignments);
            localStorage.setItem('thcs_hp_group_assignments', JSON.stringify(data.groupAssignments));
          }
          
          if (data.users && data.users.length > 0) {
            showToast('Đã kết nối và tải dữ liệu từ Supabase thành công!');
          } else {
            showToast('Đã kết nối Supabase! Cơ sở dữ liệu trống, không có nhân sự nào.');
          }
        } catch (fetchErr: any) {
          console.error('Fetch error:', fetchErr);
          setSupabaseStatus('error');
          setSupabaseErrorMsg(fetchErr.message || 'Lỗi tải dữ liệu từ Supabase.');
          loadLocalData();
        }
      } else {
        loadLocalData();
      }
    }

    function loadLocalData() {
      const cachedUsers = localStorage.getItem('thcs_hp_users');
      const cachedOkrs = localStorage.getItem('thcs_hp_okrs');
      const cachedKpis = localStorage.getItem('thcs_hp_kpis');
      const cachedSettings = localStorage.getItem('thcs_hp_settings');
      const cachedNotifications = localStorage.getItem('thcs_hp_notifications');
      const cachedSchedules = localStorage.getItem('thcs_hp_schedules');

      const fixVietnameseTypos = (text: string): string => {
        if (!text) return text;
        return text
          .replace(/bảo dung/g, 'bao dung')
          .replace(/giáo sư phạm/g, 'sư phạm')
          .replace(/văn phong mẫu mực/g, 'ngôn phong mẫu mực')
          .replace(/hoạt động sư phạm chuẩn mực/g, 'tác phong sư phạm chuẩn mực');
      };

      if (cachedUsers) setUsers(JSON.parse(cachedUsers));
      else {
        setUsers(INITIAL_USERS);
        localStorage.setItem('thcs_hp_users', JSON.stringify(INITIAL_USERS));
      }

      if (cachedOkrs) {
        try {
          const parsed = JSON.parse(cachedOkrs);
          const fixed = parsed.map((okr: any) => ({
            ...okr,
            title: fixVietnameseTypos(okr.title),
            kr1: fixVietnameseTypos(okr.kr1),
            kr2: fixVietnameseTypos(okr.kr2),
            kr3: fixVietnameseTypos(okr.kr3)
          }));
          setAllOkrs(fixed);
          localStorage.setItem('thcs_hp_okrs', JSON.stringify(fixed));
        } catch (e) {
          console.error('Error parsing cached OKRs:', e);
          setAllOkrs(INITIAL_OKRS);
        }
      } else {
        setAllOkrs(INITIAL_OKRS);
        localStorage.setItem('thcs_hp_okrs', JSON.stringify(INITIAL_OKRS));
      }

      if (cachedKpis) setAllKpis(JSON.parse(cachedKpis));
      else {
        setAllKpis(INITIAL_KPIS);
        localStorage.setItem('thcs_hp_kpis', JSON.stringify(INITIAL_KPIS));
      }

      if (cachedSettings) setSettings(JSON.parse(cachedSettings));
      else {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem('thcs_hp_settings', JSON.stringify(DEFAULT_SETTINGS));
      }

      if (cachedNotifications) setNotifications(JSON.parse(cachedNotifications));
      else {
        setNotifications(DEFAULT_NOTIFICATIONS);
        localStorage.setItem('thcs_hp_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
      }

      if (cachedSchedules) setScheduleItems(JSON.parse(cachedSchedules));
      else {
        setScheduleItems(DEFAULT_SCHEDULE_ITEMS);
        localStorage.setItem('thcs_hp_schedules', JSON.stringify(DEFAULT_SCHEDULE_ITEMS));
      }

      const cachedGroupAssignments = localStorage.getItem('thcs_hp_group_assignments');
      if (cachedGroupAssignments) {
        setGroupAssignments(JSON.parse(cachedGroupAssignments));
      } else {
        const initialGroups: GroupAssignment[] = [
          {
            id: 'group-khoi-giaovien',
            targetType: 'khoi-giaovien',
            targetName: 'Khối Giáo viên',
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
            ],
            assignedBy: "Hiệu trưởng Nghiêm Hồng Quân",
            assignedAt: "15/09/2026"
          },
          {
            id: 'group-khoi-nhanvien',
            targetType: 'khoi-nhanvien',
            targetName: 'Khối Nhân viên',
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
            ],
            assignedBy: "Hiệu trưởng Nghiêm Hồng Quân",
            assignedAt: "15/09/2026"
          }
        ];
        setGroupAssignments(initialGroups);
        localStorage.setItem('thcs_hp_group_assignments', JSON.stringify(initialGroups));
      }
    }

    initSupabase();
  }, []);

  // 2. Đồng bộ hóa vào Local Storage khi có bất cứ thay đổi nào (Fallback cứu cánh)
  const saveUsersToCache = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('thcs_hp_users', JSON.stringify(newUsers));
  };

  const saveOkrsToCache = (newOkrs: Record<string, OKR[]>) => {
    setAllOkrs(newOkrs);
    localStorage.setItem('thcs_hp_okrs', JSON.stringify(newOkrs));
  };

  const saveKpisToCache = (newKpis: Record<string, KPI[]>) => {
    setAllKpis(newKpis);
    localStorage.setItem('thcs_hp_kpis', JSON.stringify(newKpis));
  };

  const saveNotificationsToCache = (newNotifs: Notification[]) => {
    setNotifications(newNotifs);
    localStorage.setItem('thcs_hp_notifications', JSON.stringify(newNotifs));
  };

  const saveScheduleItemsToCache = (newSchedules: ScheduleItem[]) => {
    setScheduleItems(newSchedules);
    localStorage.setItem('thcs_hp_schedules', JSON.stringify(newSchedules));
  };

  const saveSettingsToCache = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    localStorage.setItem('thcs_hp_settings', JSON.stringify(newSettings));
    
    if (supabaseStatus === 'connected') {
      try {
        await saveSettingsToSupabase(newSettings);
        showToast('Đồng bộ cài đặt hệ thống lên Supabase thành công!');
      } catch (err: any) {
        console.error('Sync settings error:', err);
        showToast('Lỗi đồng bộ cài đặt lên Supabase. Đã lưu tạm tại trình duyệt.');
      }
    }
  };

  // 2.1. Đẩy / Kéo thủ công giữa LocalStorage và Supabase
  const handleForcePushToSupabase = async () => {
    if (supabaseStatus !== 'connected') {
      showToast('Không thể đồng bộ vì chưa kết nối được Supabase!');
      return;
    }
    setIsSyncing(true);
    showToast('Đang tiến hành đẩy toàn bộ dữ liệu máy lên Supabase...');
    try {
      await seedSupabaseInitialData(users, allOkrs, allKpis, settings, groupAssignments);
      showToast('Đồng bộ đẩy toàn bộ dữ liệu lên Supabase thành công!');
    } catch (err: any) {
      console.error(err);
      showToast(`Lỗi đồng bộ: ${err.message || String(err)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleForcePullFromSupabase = async () => {
    if (supabaseStatus !== 'connected') {
      showToast('Không thể đồng bộ vì chưa kết nối được Supabase!');
      return;
    }
    setIsSyncing(true);
    showToast('Đang kéo dữ liệu từ Supabase về trình duyệt...');
    try {
      const data = await loadAllDataFromSupabase();
      if (data.users && data.users.length > 0) {
        setUsers(data.users);
        localStorage.setItem('thcs_hp_users', JSON.stringify(data.users));
        
        setAllOkrs(data.allOkrs);
        localStorage.setItem('thcs_hp_okrs', JSON.stringify(data.allOkrs));
        
        setAllKpis(data.allKpis);
        localStorage.setItem('thcs_hp_kpis', JSON.stringify(data.allKpis));
        
        if (data.settings) {
          setSettings(data.settings);
          localStorage.setItem('thcs_hp_settings', JSON.stringify(data.settings));
        }

        if (data.groupAssignments && data.groupAssignments.length > 0) {
          setGroupAssignments(data.groupAssignments);
          localStorage.setItem('thcs_hp_group_assignments', JSON.stringify(data.groupAssignments));
        }
        showToast('Đồng bộ tải dữ liệu từ Supabase thành công!');
      } else {
        showToast('Supabase hiện rỗng, chưa có dữ liệu để tải.');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Lỗi kéo dữ liệu: ${err.message || String(err)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Logic Đăng nhập / Đăng xuất
  const handleLogin = (user: User | 'admin') => {
    setCurrentUser(user);
    setViewedUserId(null);
    setActiveTab('tab-main');
    
    const userName = user === 'admin' ? 'Nghiêm Hồng Quân (Super Admin)' : user.name;
    showToast(`Chào mừng ${userName} quay trở lại hệ thống!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewedUserId(null);
    showToast('Đã đăng xuất tài khoản cá nhân an toàn!');
  };

  // 4. Logic chuyển đổi Simulator nhanh trên thanh Header
  const handleSwitchSimulatedUser = (userId: string | 'admin') => {
    setViewedUserId(null);
    if (userId === 'admin') {
      setCurrentUser('admin');
      showToast('Đã chuyển đổi sang tài khoản Quản trị tối cao (Super Admin)');
    } else {
      const found = users.find(u => u.id === userId);
      if (found) {
        setCurrentUser(found);
        showToast(`Đã giả lập làm việc dưới quyền cán bộ: ${found.name}`);
      }
    }
  };

  // Xử lý đóng tab làm việc khi kích chuột ra khoảng trống màn hình
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTab === 'tab-main') return;

    const target = e.target as HTMLElement;
    
    // Kiểm tra xem vị trí click có thuộc về các phân vùng chức năng hoạt động hay không
    const isInsideWorkspace = target.closest('#main-workspace-section');
    const isInsideSidebar = target.closest('#sidebar-aside') || target.closest('aside');
    const isInsideNavbar = target.closest('#sticky-navbar') || target.closest('nav');
    const isInsideHeader = target.closest('header') || target.closest('#app-header');
    const isToast = target.closest('.hot-toast') || target.closest('#toast-container') || target.closest('[role="status"]');

    // Nếu không click vào bất kỳ phân vùng nào ở trên, chuyển tab về trang chủ (tab-main) để đóng tab làm việc xuống
    if (!isInsideWorkspace && !isInsideSidebar && !isInsideNavbar && !isInsideHeader && !isToast) {
      setActiveTab('tab-main');
    }
  };

  // Lấy ID cán bộ hiện tại đang làm việc
  const activeUserId = viewedUserId || (currentUser === 'admin' ? 'THCS-HP-020' : (currentUser?.id || 'THCS-HP-020'));
  const isBghOrToTruong = currentUser === 'admin' || (currentUser && currentUser !== 'admin' && (currentUser.type === 'BGH' || currentUser.role?.includes('Tổ trưởng') || currentUser.role?.includes('Tổ phó') || currentUser.role?.includes('Trưởng bộ môn')));
  const canEditActiveData = currentUser === 'admin' || isBghOrToTruong || (currentUser && currentUser !== 'admin' && activeUserId === currentUser.id);
  const isBghOrAdmin = currentUser === 'admin' || (currentUser && currentUser !== 'admin' && currentUser.type === 'BGH');

  const activeUser = users.find(u => u.id === activeUserId);
  const activeUserName = activeUser ? activeUser.name : (currentUser === 'admin' ? 'Nghiêm Hồng Quân' : (currentUser?.name || ''));

  // Lấy OKRs & KPIs của người dùng đang được chọn
  const activeUserOkrs = allOkrs[activeUserId] || [];
  const activeUserKpis = allKpis[activeUserId] || [];

  // 5. Cập nhật OKRs
  const handleAddOkr = async (newOkrData: Omit<OKR, 'id'>) => {
    const newId = `okr-${Date.now()}`;
    const newOkr: OKR = { id: newId, ...newOkrData };
    
    const updatedOkrs = {
      ...allOkrs,
      [activeUserId]: [...activeUserOkrs, newOkr]
    };
    saveOkrsToCache(updatedOkrs);
    showToast('Thêm mới mục tiêu đổi mới OKR thành công!');

    if (supabaseStatus === 'connected') {
      try {
        await saveOkrToSupabase(activeUserId, newOkr);
      } catch (err: any) {
        console.error('Error syncing add OKR:', err);
        showToast('Lỗi đồng bộ OKR mới lên Supabase. Đã lưu tạm tại máy.');
      }
    }
  };

  const handleUpdateOkr = async (okrId: string, updatedFields: Partial<OKR>) => {
    const updatedUserOkrs = activeUserOkrs.map(okr => 
      okr.id === okrId ? { ...okr, ...updatedFields } : okr
    );
    const updatedOkrs = {
      ...allOkrs,
      [activeUserId]: updatedUserOkrs
    };
    saveOkrsToCache(updatedOkrs);

    if (supabaseStatus === 'connected') {
      const targetOkr = updatedUserOkrs.find(okr => okr.id === okrId);
      if (targetOkr) {
        try {
          await saveOkrToSupabase(activeUserId, targetOkr);
        } catch (err: any) {
          console.error('Error syncing update OKR:', err);
          showToast('Lỗi đồng bộ cập nhật OKR lên Supabase.');
        }
      }
    }
  };

  const handleDeleteOkr = async (okrId: string) => {
    const updatedUserOkrs = activeUserOkrs.filter(okr => okr.id !== okrId);
    const updatedOkrs = {
      ...allOkrs,
      [activeUserId]: updatedUserOkrs
    };
    saveOkrsToCache(updatedOkrs);
    showToast('Đã xóa mục tiêu OKR thành công!');

    if (supabaseStatus === 'connected') {
      try {
        await deleteOkrFromSupabase(okrId);
      } catch (err: any) {
        console.error('Error syncing delete OKR:', err);
        showToast('Lỗi đồng bộ xóa OKR trên Supabase.');
      }
    }
  };

  // 6. Cập nhật KPI
  const handleKpiValueChange = async (index: number, newValue: number) => {
    const updatedUserKpis = [...activeUserKpis];
    if (updatedUserKpis[index]) {
      updatedUserKpis[index].value = newValue;
    }
    const updatedKpis = {
      ...allKpis,
      [activeUserId]: updatedUserKpis
    };
    saveKpisToCache(updatedKpis);

    if (supabaseStatus === 'connected') {
      try {
        await saveUserKpisToSupabase(activeUserId, updatedUserKpis);
      } catch (err: any) {
        console.error('Error syncing KPIs:', err);
      }
    }
  };

  const handleKpiScoresChange = async (index: number, scores: { selfScore?: number; leaderScore?: number; bghScore?: number }) => {
    const updatedUserKpis = [...activeUserKpis];
    if (updatedUserKpis[index]) {
      if (scores.selfScore !== undefined) updatedUserKpis[index].selfScore = scores.selfScore;
      if (scores.leaderScore !== undefined) updatedUserKpis[index].leaderScore = scores.leaderScore;
      if (scores.bghScore !== undefined) updatedUserKpis[index].bghScore = scores.bghScore;
      
      // Sync .value with BGH score or fallback to maintain consistency across other tabs/export
      if (scores.bghScore !== undefined) {
        updatedUserKpis[index].value = scores.bghScore;
      } else if (scores.leaderScore !== undefined) {
        updatedUserKpis[index].value = scores.leaderScore;
      } else if (scores.selfScore !== undefined) {
        updatedUserKpis[index].value = scores.selfScore;
      }
    }
    const updatedKpis = {
      ...allKpis,
      [activeUserId]: updatedUserKpis
    };
    saveKpisToCache(updatedKpis);

    if (supabaseStatus === 'connected') {
      try {
        await saveUserKpisToSupabase(activeUserId, updatedUserKpis);
      } catch (err: any) {
        console.error('Error syncing KPIs scores:', err);
      }
    }
  };

  const handleKpiEvidencesChange = async (index: number, evidences: any[]) => {
    const updatedUserKpis = [...activeUserKpis];
    if (updatedUserKpis[index]) {
      updatedUserKpis[index].evidences = evidences;
    }
    const updatedKpis = {
      ...allKpis,
      [activeUserId]: updatedUserKpis
    };
    saveKpisToCache(updatedKpis);

    if (supabaseStatus === 'connected') {
      try {
        await saveUserKpisToSupabase(activeUserId, updatedUserKpis);
      } catch (err: any) {
        console.error('Error syncing KPIs evidences:', err);
      }
    }
  };

  const handleKpisChange = async (updatedUserKpis: KPI[]) => {
    const updatedKpis = {
      ...allKpis,
      [activeUserId]: updatedUserKpis
    };
    saveKpisToCache(updatedKpis);

    if (supabaseStatus === 'connected') {
      try {
        await saveUserKpisToSupabase(activeUserId, updatedUserKpis);
        showToast('Đã cập nhật chỉ số vận hành KPI mới thành công!');
      } catch (err: any) {
        console.error('Error syncing KPIs:', err);
        showToast('Lỗi đồng bộ chỉ số KPI lên Supabase.');
      }
    } else {
      showToast('Đã cập nhật chỉ số vận hành KPI mới thành công!');
    }
  };

  const generateFallbackLocalTemplate = () => {
    if (!selectedUserForAssign) return;
    
    if (selectedUserForAssign.type === 'GiaoVien') {
      setPreviewOkrTitle("Nâng cao chất lượng bồi dưỡng học sinh giỏi và số hóa tài liệu học tập bộ môn");
      setPreviewKr1("Số hóa 100% tài liệu ôn tập nâng cao lên hệ thống Drive của nhà trường.");
      setPreviewKr2("Bồi dưỡng đội tuyển học sinh giỏi đạt ít nhất 02 giải cấp Huyện.");
      setPreviewKr3("Thành công thực hiện 02 chuyên đề dạy học tích cực đổi mới.");
      
      setPreviewKpi1Name("1. Chất lượng giảng dạy chuyên môn");
      setPreviewKpi1Weight(40);
      setPreviewKpi1Desc("Giảng dạy đúng phân phối chương trình, đạt 100% hồ sơ giáo án chuẩn và có kiểm tra đánh giá chất lượng đúng kỳ hạn.");
      
      setPreviewKpi2Name("2. Phối hợp công tác chủ nhiệm & Quản lý lớp");
      setPreviewKpi2Weight(30);
      setPreviewKpi2Desc("Đảm bảo nề nếp kỷ luật học sinh lớp chủ nhiệm, phối hợp tích cực với gia dịch và duy trì sĩ số đạt trên 98%.");
      
      setPreviewKpi3Name("3. Tập huấn và Hoạt động phong trào");
      setPreviewKpi3Weight(30);
      setPreviewKpi3Desc("Hoàn thành 100% chỉ tiêu chương trình tập huấn GDPT mới, tham gia đầy đủ công tác phong trào thi đua của tổ chuyên môn.");
    } else {
      setPreviewOkrTitle("Cải tiến số hóa quy trình nghiệp vụ văn phòng và tối ưu hoạt động hỗ trợ hành chính");
      setPreviewKr1("Số hóa và lưu trữ trực tuyến 100% công văn đi - đến và hồ sơ cán bộ.");
      setPreviewKr2("Cắt giảm 20% thời gian xử lý thủ tục cấp phát học bạ và giấy chứng nhận học sinh.");
      setPreviewKr3("Thiết kế 02 biểu mẫu theo dõi tài chính/thu chi không dùng tiền mặt quản lý tự động.");
      
      setPreviewKpi1Name("1. Hoàn thành nghiệp vụ công tác hành chính");
      setPreviewKpi1Weight(40);
      setPreviewKpi1Desc("Sổ sách kế toán, chứng từ rõ ràng, hồ sơ văn thư lưu trữ khoa học, chính xác, không xảy ra sai sót thanh tra.");
      
      setPreviewKpi2Name("2. Chấp hành nề nếp tác phong văn hóa sở");
      setPreviewKpi2Weight(30);
      setPreviewKpi2Desc("Bảo đảm trực giờ hành chính, đón tiếp phụ huynh và học sinh chu đáo, lịch thiệp, giữ gìn kỷ luật phòng ban xuất sắc.");
      
      setPreviewKpi3Name("3. Phối hợp liên phòng ban và công tác khẩn cấp");
      setPreviewKpi3Weight(30);
      setPreviewKpi3Desc("Sẵn sàng phối hợp thực hiện kỹ thuật hội trường, phục vụ đại hội, sự kiện chính thức và công tác an ninh, xanh sạch học đường.");
    }
  };

  const handleAssignOkrKpis = async (targetUserId: string, newOkrs: OKR[], newKpis: KPI[]) => {
    // 1. Cập nhật OKRs
    const updatedOkrs = {
      ...allOkrs,
      [targetUserId]: newOkrs
    };
    setAllOkrs(updatedOkrs);
    localStorage.setItem('thcs_hp_okrs', JSON.stringify(updatedOkrs));

    // 2. Cập nhật KPIs
    const updatedKpis = {
      ...allKpis,
      [targetUserId]: newKpis
    };
    setAllKpis(updatedKpis);
    localStorage.setItem('thcs_hp_kpis', JSON.stringify(updatedKpis));

    // 3. Đồng bộ lên Supabase nếu có kết nối
    if (supabaseStatus === 'connected') {
      try {
        // Xóa OKRs cũ trên Supabase và ghi đè
        const oldOkrs = allOkrs[targetUserId] || [];
        for (const oldOkr of oldOkrs) {
          try {
            await deleteOkrFromSupabase(oldOkr.id);
          } catch (e) {
            console.error('Error deleting old OKR:', e);
          }
        }
        // Lưu OKRs mới
        for (const newOkr of newOkrs) {
          await saveOkrToSupabase(targetUserId, newOkr);
        }
        // Lưu KPIs mới (hàm này đã tự động xóa KPIs cũ và thêm KPIs mới trên Supabase)
        await saveUserKpisToSupabase(targetUserId, newKpis);
      } catch (err: any) {
        console.error('Error syncing assigned OKRs/KPIs to Supabase:', err);
      }
    }

    // 4. Tạo thông báo tự động cho nhân sự được giao
    const targetUser = users.find(u => u.id === targetUserId);
    const assignerName = currentUser === 'admin' ? 'Ban Giám Hiệu' : (typeof currentUser === 'object' ? currentUser.name : 'Ban Giám Hiệu');
    
    // Tạo nội dung chi tiết rõ ràng của nhiệm vụ được giao
    let detailedContent = '';
    if (newOkrs && newOkrs.length > 0) {
      detailedContent += `🎯 BỘ CHỈ TIÊU OKR ĐƯỢC GIAO CHÍNH THỨC:\n`;
      newOkrs.forEach((okr, idx) => {
        detailedContent += `👉 Mục tiêu ${idx + 1}: ${okr.title}\n`;
        if (okr.kr1) detailedContent += `   - Kết quả then chốt 1: ${okr.kr1}\n`;
        if (okr.kr2) detailedContent += `   - Kết quả then chốt 2: ${okr.kr2}\n`;
        if (okr.kr3) detailedContent += `   - Kết quả then chốt 3: ${okr.kr3}\n`;
      });
      detailedContent += `\n`;
    }
    if (newKpis && newKpis.length > 0) {
      detailedContent += `📊 3 CHỈ SỐ KPI VẬN HÀNH (Tổng trọng số 100%):\n`;
      newKpis.forEach((kpi, idx) => {
        detailedContent += `📌 KPI ${idx + 1}: ${kpi.criterion} (Trọng số: ${kpi.weight}%)\n`;
        if (kpi.desc) detailedContent += `   - Mô tả và Thước đo cụ thể: ${kpi.desc}\n`;
      });
    }

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: `🎯 [Giao việc cá nhân] ${assignerName} đã giao trực tiếp bộ mục tiêu OKR mới kèm chỉ số KPI cho bạn.`,
      content: detailedContent.trim(),
      targetUserId: targetUserId,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' — ' + new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
      read: false,
      type: 'urgent'
    };
    
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('thcs_hp_notifications', JSON.stringify(updatedNotifs));

    showToast(`Đã giao OKR & KPI thành công cho: ${targetUser?.name || targetUserId}!`);
  };

  const handleSaveGroupAssignment = (assignment: GroupAssignment) => {
    const updated = [...groupAssignments];
    const index = updated.findIndex(a => a.id === assignment.id);
    if (index !== -1) {
      updated[index] = assignment;
    } else {
      updated.push(assignment);
    }
    setGroupAssignments(updated);
    localStorage.setItem('thcs_hp_group_assignments', JSON.stringify(updated));

    if (supabaseStatus === 'connected') {
      saveGroupAssignmentsToSupabase(updated).catch(err => {
        console.error('Error syncing group assignments:', err);
      });
    }

    // Tìm các cán bộ/giáo viên/nhân viên thuộc Tổ/Khối này để tạo thông báo riêng chi tiết
    const getGroupMembers = (groupId: string, userList: User[]): User[] => {
      return userList.filter(u => {
        if (u.type === 'BGH' || u.id === 'THCS-HP-020') {
          return false;
        }
        const roleLower = (u.role || '').toLowerCase();
        
        if (groupId === 'group-khoi-giaovien') {
          return u.isTeacher || u.type === 'GiaoVien';
        }
        if (groupId === 'group-khoi-nhanvien') {
          return !u.isTeacher || u.type === 'NhanVien';
        }
        
        if (groupId === 'group-to-tu-nhien') {
          if (!u.isTeacher && u.type !== 'GiaoVien') return false;
          return roleLower.includes('toán') || 
                 roleLower.includes('lý') || 
                 roleLower.includes('hóa') || 
                 roleLower.includes('sinh') || 
                 roleLower.includes('công nghệ') || 
                 roleLower.includes('tin') || 
                 roleLower.includes('tự nhiên');
        }
        if (groupId === 'group-to-xa-hoi') {
          if (!u.isTeacher && u.type !== 'GiaoVien') return false;
          return roleLower.includes('văn') || 
                 roleLower.includes('sử') || 
                 roleLower.includes('địa') || 
                 roleLower.includes('gdcd') || 
                 roleLower.includes('anh') || 
                 roleLower.includes('xã hội');
        }
        if (groupId === 'group-to-vanthemy') {
          if (!u.isTeacher && u.type !== 'GiaoVien') return false;
          return roleLower.includes('thể dục') || 
                 roleLower.includes('nhạc') || 
                 roleLower.includes('mỹ thuật') || 
                 roleLower.includes('trải nghiệm') || 
                 roleLower.includes('văn thể mỹ') || 
                 roleLower.includes('thể') || 
                 roleLower.includes('mỹ');
        }
        if (groupId === 'group-to-vanphong') {
          if (u.isTeacher || u.type === 'GiaoVien') return false;
          return roleLower.includes('kế toán') || 
                 roleLower.includes('thủ quỹ') || 
                 roleLower.includes('văn thư') || 
                 roleLower.includes('y tế') || 
                 roleLower.includes('thư viện') || 
                 roleLower.includes('thiết bị') || 
                 roleLower.includes('bảo vệ') || 
                 roleLower.includes('hành chính') || 
                 roleLower.includes('văn phòng');
        }
        return false;
      });
    };

    const members = getGroupMembers(assignment.id, users);

    // Tạo nội dung chi tiết rõ ràng của nhiệm vụ giao cho Tổ/Khối
    let detailedContent = '';
    detailedContent += `📣 CHỈ TIÊU OKR-KPI CHÍNH THỨC BAN HÀNH CHO TỔ/KHỐI: ${assignment.targetName.toUpperCase()}\n\n`;
    
    detailedContent += `🎯 MỤC TIÊU OKR ĐỊNH HƯỚNG CHUNG:\n`;
    detailedContent += `👉 Mục tiêu: ${assignment.okr.title}\n`;
    if (assignment.okr.kr1) detailedContent += `   - Kết quả then chốt 1: ${assignment.okr.kr1}\n`;
    if (assignment.okr.kr2) detailedContent += `   - Kết quả then chốt 2: ${assignment.okr.kr2}\n`;
    if (assignment.okr.kr3) detailedContent += `   - Kết quả then chốt 3: ${assignment.okr.kr3}\n\n`;

    detailedContent += `📊 3 CHỈ SỐ KPI VẬN HÀNH CẤP TỔ/KHỐI:\n`;
    assignment.kpis.forEach((kpi, idx) => {
      detailedContent += `📌 KPI ${idx + 1}: ${kpi.criterion} (Trọng số: ${kpi.weight}%)\n`;
      if (kpi.desc) detailedContent += `   - Mô tả/Thước đo hành động: ${kpi.desc}\n`;
    });
    detailedContent += `\n💡 Bạn có thể đồng bộ nhanh bộ chỉ tiêu này vào tài khoản cá nhân từ mục "Định hướng BGH" ở Trang chủ!`;

    const assignerName = currentUser === 'admin' ? 'Ban Giám Hiệu' : (typeof currentUser === 'object' ? currentUser.name : 'Ban Giám Hiệu');
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' — ' + new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

    // 1. Thông báo chung cho bảng tin toàn trường
    const generalNotif: Notification = {
      id: `notif-${Date.now()}-general`,
      title: `📣 [Chỉ đạo BGH] ${assignerName} đã ban hành mục tiêu OKR & KPI mới định hướng cho ${assignment.targetName}. Hãy tham khảo để xây dựng mục tiêu cá nhân!`,
      time: timeStr,
      read: false,
      type: 'urgent'
    };

    // 2. Thông báo riêng kèm nội dung chi tiết tới từng cá nhân trong tổ/khối
    const memberNotifs: Notification[] = members.map(m => ({
      id: `notif-${Date.now()}-${m.id}`,
      title: `🎯 [Giao việc Tổ/Khối] ${assignerName} đã giao bộ chỉ tiêu OKR & KPI định hướng mới cho ${assignment.targetName} trực thuộc của bạn.`,
      content: detailedContent.trim(),
      targetUserId: m.id,
      time: timeStr,
      read: false,
      type: 'urgent'
    }));

    const updatedNotifs = [generalNotif, ...memberNotifs, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('thcs_hp_notifications', JSON.stringify(updatedNotifs));
  };
  
  const handleSyncGroupToPersonal = (assign: GroupAssignment) => {
    if (currentUser === 'admin' || !currentUser) return;
    const targetUserId = currentUser.id;

    const confirmMsg = `Bạn có chắc chắn muốn đồng bộ bộ OKR-KPI của "${assign.targetName}" vào tài khoản cá nhân không?\n` +
      `- Mục tiêu OKR cá nhân sẽ cập nhật thành: "${assign.okr.title}"\n` +
      `- 3 chỉ số KPI cá nhân sẽ được cập nhật đồng bộ tương ứng.\n\n` +
      `Thao tác này sẽ ghi đè thiết lập OKR & KPI hiện tại của bạn.`;

    if (window.confirm(confirmMsg)) {
      // Tạo bộ OKR mới cho cá nhân từ OKR của Tổ/Khối
      const newOkr: OKR = {
        id: `okr-${Date.now()}`,
        title: assign.okr.title,
        kr1: assign.okr.kr1,
        kr1Progress: 0,
        kr2: assign.okr.kr2,
        kr2Progress: 0,
        kr3: assign.okr.kr3,
        kr3Progress: 0
      };

      // Tạo bộ KPI mới cho cá nhân từ KPI của Tổ/Khối
      const newKpis: KPI[] = assign.kpis.map(k => ({
        criterion: k.criterion,
        weight: k.weight,
        desc: k.desc,
        value: 0,
        evidences: []
      }));

      // Cập nhật bộ nhớ cục bộ OKRs
      const updatedOkrs = {
        ...allOkrs,
        [targetUserId]: [newOkr]
      };
      setAllOkrs(updatedOkrs);
      localStorage.setItem('thcs_hp_okrs', JSON.stringify(updatedOkrs));

      // Cập nhật bộ nhớ cục bộ KPIs
      const updatedKpis = {
        ...allKpis,
        [targetUserId]: newKpis
      };
      setAllKpis(updatedKpis);
      localStorage.setItem('thcs_hp_kpis', JSON.stringify(updatedKpis));

      // Đồng bộ lên Supabase nếu có kết nối
      if (supabaseStatus === 'connected') {
        try {
          saveOkrToSupabase(targetUserId, newOkr);
          saveUserKpisToSupabase(targetUserId, newKpis);
        } catch (e) {
          console.error("Lỗi đồng bộ Supabase:", e);
        }
      }

      showToast(`Đồng bộ thành công OKR-KPI từ ${assign.targetName} vào tài khoản cá nhân của bạn!`);
    }
  };

  const getActiveUserGroupAssignments = (): GroupAssignment[] => {
    if (currentUser === 'admin') return [];
    if (!currentUser) return [];
    
    const assigned: GroupAssignment[] = [];
    const roleLower = currentUser.role?.toLowerCase() || '';

    // Load the dynamic target groups from localStorage if they exist
    const cachedGroups = localStorage.getItem('thcs_hp_target_groups');
    let loadedTargetGroups: any[] = [];
    if (cachedGroups) {
      try {
        loadedTargetGroups = JSON.parse(cachedGroups);
      } catch (e) {}
    }

    const isOfGroupType = (group: any, type: string) => {
      if (!group) return false;
      if (Array.isArray(group.type)) {
        return group.type.includes(type);
      }
      return group.type === type;
    };

    const assignHasTargetType = (assign: GroupAssignment, type: string) => {
      if (Array.isArray(assign.targetType)) {
        return assign.targetType.includes(type as any);
      }
      return assign.targetType === type;
    };

    const groupBlockTeacherId = loadedTargetGroups.find(g => isOfGroupType(g, 'khoi-giaovien'))?.id || 'group-khoi-giaovien';
    const groupBlockStaffId = loadedTargetGroups.find(g => isOfGroupType(g, 'khoi-nhanvien'))?.id || 'group-khoi-nhanvien';

    if (currentUser.type === 'GiaoVien') {
      const blockAssign = groupAssignments.find(a => a.id === groupBlockTeacherId || assignHasTargetType(a, 'khoi-giaovien'));
      if (blockAssign) assigned.push(blockAssign);
    } else if (currentUser.type === 'NhanVien') {
      const blockAssign = groupAssignments.find(a => a.id === groupBlockStaffId || assignHasTargetType(a, 'khoi-nhanvien'));
      if (blockAssign) assigned.push(blockAssign);
    }
    
    // Check match for specific departments or custom ones
    groupAssignments.forEach(assign => {
      // Don't duplicate if already added
      if (assigned.some(a => a.id === assign.id)) return;

      const targetNameLower = assign.targetName.toLowerCase();
      
      // Match custom/dynamic specialized groups if the group's name is found in user's role/title/department
      if (assignHasTargetType(assign, 'to-chuyen-mon')) {
        // Direct matching: e.g. "Tổ Tiếng Anh" -> role "Giáo viên Tiếng Anh"
        // Strip "tổ" and "khối" prefixes to match core keyword
        const cleanName = targetNameLower.replace('tổ', '').replace('khối', '').trim();
        if (cleanName && roleLower.includes(cleanName)) {
          assigned.push(assign);
          return;
        }

        // Hardcoded legacy fallbacks for original default groups
        if (assign.id === 'group-to-tu-nhien' && (roleLower.includes('tự nhiên') || roleLower.includes('vật lý') || roleLower.includes('toán') || roleLower.includes('hóa') || roleLower.includes('sinh') || roleLower.includes('tin học'))) {
          assigned.push(assign);
        } else if (assign.id === 'group-to-xa-hoi' && (roleLower.includes('xã hội') || roleLower.includes('văn') || roleLower.includes('sử') || roleLower.includes('địa') || roleLower.includes('ngoại ngữ') || roleLower.includes('tiếng anh'))) {
          assigned.push(assign);
        } else if (assign.id === 'group-to-vanthemy' && (roleLower.includes('thể mỹ') || roleLower.includes('thể dục') || roleLower.includes('nhạc') || roleLower.includes('họa') || roleLower.includes('văn thể mỹ'))) {
          assigned.push(assign);
        } else if (assign.id === 'group-to-vanphong' && (roleLower.includes('văn phòng') || roleLower.includes('kế toán') || roleLower.includes('thủ quỹ') || roleLower.includes('văn thư') || roleLower.includes('y tế') || roleLower.includes('thư viện') || roleLower.includes('thiết bị') || roleLower.includes('nhân viên'))) {
          assigned.push(assign);
        }
      }
    });
    
    return assigned;
  };

  const getDefaultKpisForUser = (role: string, type: string): KPI[] => {
    const roleLower = role.toLowerCase();
    
    if (type === 'BGH' || roleLower.includes('bgh') || roleLower.includes('hiệu trưởng') || roleLower.includes('hiệu phó') || roleLower.includes('quản trị')) {
      return [
        { criterion: "1. Quản lý điều hành", weight: 40, desc: "Tỷ lệ giáo viên nhân viên hoàn thành kế hoạch tuần đúng hạn.", value: 95 },
        { criterion: "2. Hồ sơ sổ sách trường", weight: 30, desc: "Kiểm tra học bạ, hồ sơ pháp lý không xảy ra lỗi thanh tra.", value: 100 },
        { criterion: "3. Phát triển nhà trường", weight: 20, desc: "Thu hút hoạt động ngoại khóa, xây dựng cơ sở vật chất đổi mới.", value: 90 },
        { criterion: "4. Tuân thủ & Trách nhiệm", weight: 10, desc: "Ý thức kỷ luật, đạo đức đầu tàu gương mẫu sư phạm.", value: 100 }
      ];
    }
    
    if (roleLower.includes('gvcn') || roleLower.includes('chủ nhiệm')) {
      return [
        { criterion: "1. Khối lượng & Tiến độ giảng dạy", weight: 30, desc: "Số tiết thực dạy/tuần; Tỷ lệ hoàn thành chương trình đúng hạn, không cháy giáo án.", value: 100 },
        { criterion: "2. Chất lượng chuyên môn", weight: 30, desc: "Học sinh khá giỏi đạt chuẩn (Khá/Giỏi >= 40%, Yếu <= 5%); Điểm đánh giá dự giờ của Tổ/BGH.", value: 92 },
        { criterion: "3. Hồ sơ và Nghiệp vụ sư phạm", weight: 20, desc: "Đúng hạn 100% giáo án sổ điểm; Có sáng kiến kinh nghiệm (SKKN) được đánh giá Khá trở lên.", value: 85 },
        { criterion: "4. Công tác chủ nhiệm & Kỷ luật", weight: 20, desc: "Tỷ lệ học sinh vi phạm kỷ luật thấp; Đạt lớp Tiên Tiến xuất sắc; Xếp loại thi đua học kỳ A2.", value: 90 }
      ];
    }

    if (type === 'GiaoVien' || roleLower.includes('giáo viên') || roleLower.includes('gvbm') || roleLower.includes('bộ môn') || roleLower.includes('môn')) {
      return [
        { criterion: "1. Khối lượng & Tiến độ giảng dạy", weight: 30, desc: "Số tiết thực dạy/tuần; Tỷ lệ hoàn thành chương trình đúng hạn, không cháy giáo án.", value: 95 },
        { criterion: "2. Chất lượng chuyên môn", weight: 30, desc: "Học sinh khá giỏi đạt chuẩn (Khá/Giỏi >= 40%, Yếu <= 5%); Điểm đánh giá dự giờ của Tổ/BGH.", value: 90 },
        { criterion: "3. Hồ sơ và Nghiệp vụ sư phạm", weight: 25, desc: "Đúng hạn 100% giáo án sổ điểm; Có sáng kiến kinh nghiệm được đánh giá Đạt trở lên.", value: 85 },
        { criterion: "4. Kỷ luật & Trách nhiệm hành chính", weight: 15, desc: "Chấp hành nghiêm chỉnh giờ giấc cơ quan, quy tắc ứng xử và đạo đức nhà giáo.", value: 95 }
      ];
    }
    
    if (roleLower.includes('kế toán')) {
      return [
        { criterion: "1. Chính xác & Đúng hạn tài chính", weight: 40, desc: "Báo cáo thuế, báo cáo quyết toán đúng hạn 100%, 0% sai sót xuất toán.", value: 98 },
        { criterion: "2. Quản lý Thu - Chi học đường", weight: 30, desc: "Tỷ lệ hoàn thành thu học phí đúng hạn đầu kỳ đạt trên 95% tổng số học sinh.", value: 90 },
        { criterion: "3. Sổ sách & Hồ sơ kế toán", weight: 20, desc: "Lưu trữ khoa học, trích lục nhanh chóng trong vòng 30 phút khi BGH cần.", value: 95 },
        { criterion: "4. Trách nhiệm & Hợp tác", weight: 10, desc: "Sự phối hợp với các tổ chuyên môn, thực hiện nghiêm quy định kỷ luật.", value: 100 }
      ];
    }
    
    if (roleLower.includes('thiết bị') || roleLower.includes('thí nghiệm') || roleLower.includes('lab') || roleLower.includes('phòng thực hành')) {
      return [
        { criterion: "1. Sẵn sàng & Đầy đủ thiết bị", weight: 40, desc: "Tỷ lệ chuẩn bị đủ dụng cụ/hóa chất thực hành theo đăng ký giáo viên; Hoàn thành trước giờ học 15p.", value: 100 },
        { criterion: "2. An toàn & Bảo quản", weight: 30, desc: "0 xảy ra sự cố cháy nổ phòng Lab do lỗi chủ quan; Kiểm kê thiết bị định kỳ 1 lần/tháng.", value: 100 },
        { criterion: "3. Hồ sơ & Sổ sách theo dõi", weight: 20, desc: "Nhật ký mượn trả thiết bị chính xác 100%; Đề xuất mua sắm bổ sung vật tư đúng hạn.", value: 80 },
        { criterion: "4. Trách nhiệm & Hợp tác", weight: 10, desc: "Mức độ hài lòng của giáo viên bộ môn khi sử dụng phòng thực hành đạt trên 90%.", value: 95 }
      ];
    }
    
    if (roleLower.includes('văn thư') || roleLower.includes('lưu trữ') || roleLower.includes('hành chính')) {
      return [
        { criterion: "1. Xử lý công văn & Hành chính", weight: 40, desc: "Tiếp nhận và chuyển giao công văn đi đến đúng quy chuẩn trong ngày (Văn bản khẩn < 2 giờ).", value: 95 },
        { criterion: "2. Quản lý hồ sơ & Học bạ", weight: 30, desc: "Bảo mật và an toàn hồ sơ học sinh, giáo viên. Trích lục hồ sơ tìm kiếm nhanh dưới 5 phút.", value: 100 },
        { criterion: "3. Hỗ trợ dịch vụ hành chính", weight: 20, desc: "Xử lý hồ sơ chuyển trường, rút học bạ đúng hẹn. Thái độ tiếp phụ huynh chuẩn sư phạm.", value: 90 },
        { criterion: "4. Kỷ luật & Trách nhiệm", weight: 10, desc: "Chấp hành giờ giấc nghiêm ngặt, bảo mật tuyệt đối các thông tin văn bản nội bộ.", value: 100 }
      ];
    }
    
    if (roleLower.includes('thư viện')) {
      return [
        { criterion: "1. Quản lý tài sản thư viện", weight: 30, desc: "Tỷ lệ hao hụt, mất sách truyện dưới 1%/năm; Sắp xếp khoa học đúng mã phân loại DDC.", value: 95 },
        { criterion: "2. Phục vụ bạn đọc (GV & HS)", weight: 30, desc: "Mở cửa đúng giờ 100%; Đăng ký mượn trả đầy đủ trên phần mềm quản lý thư viện.", value: 90 },
        { criterion: "3. Cập nhật dữ liệu & Báo cáo", weight: 20, desc: "Cập nhật đầu sách mới vào hệ thống trong vòng 3 ngày; Báo cáo lượt đọc chính xác.", value: 85 },
        { criterion: "4. Không gian & Hoạt động", weight: 20, desc: "Đổi mới bày biện không gian đọc; Hỗ trợ các tiết học thư viện theo đúng thời khóa biểu.", value: 100 }
      ];
    }
    
    if (roleLower.includes('bảo vệ')) {
      return [
        { criterion: "1. An ninh & An toàn tài sản", weight: 40, desc: "0% xảy ra mất trộm tài sản trường học; Kiểm soát 100% người lạ xuất trình giấy tờ trước khi vào.", value: 100 },
        { criterion: "2. Tuần tra & PCCC", weight: 30, desc: "Tuần tra ban đêm chặt chẽ; Ngắt 100% hệ thống điện nước, cửa phòng học cuối giờ học.", value: 100 },
        { criterion: "3. Điều tiết giao thông", weight: 20, desc: "Đảm bảo thông thoáng cổng trường giờ tan tầm đưa đón học sinh; Xếp xe giáo viên ngay ngắn.", value: 85 },
        { criterion: "4. Thái độ & Tác phong", weight: 10, desc: "Đeo đồng phục bảo vệ đầy đủ; Thái độ lịch thiệp đúng mực với phụ huynh, học sinh.", value: 90 }
      ];
    }
    
    if (roleLower.includes('y tế')) {
      return [
        { criterion: "1. Sơ cấp cứu & Chăm sóc", weight: 40, desc: "Có mặt kịp thời xử lý chấn thương ban đầu; Không để xảy ra sai sót y tế gây hậu quả nặng.", value: 100 },
        { criterion: "2. Quản lý dược phẩm & Hồ sơ", weight: 30, desc: "Thuốc tủ y tế không quá hạn; Cập nhật 100% học sinh có hồ sơ theo dõi thể trạng đầy đủ.", value: 90 },
        { criterion: "3. Giám sát dịch bệnh & ATTP", weight: 20, desc: "Giám sát vệ sinh học đường & lưu mẫu thức ăn bán trú hằng ngày; Kịp thời báo cáo dịch bệnh.", value: 95 },
        { criterion: "4. Truyền thông giáo dục sức khỏe", weight: 10, desc: "Thực hiện ít nhất 1 bài viết hoặc buổi tuyên truyền giáo dục sức khỏe/tháng.", value: 80 }
      ];
    }
    
    if (roleLower.includes('quỹ') || roleLower.includes('thủ quỹ')) {
      return [
        { criterion: "1. Quản lý thu chi quỹ mặt", weight: 40, desc: "Thu, chi tiền mặt đúng quy trình, kiểm quỹ hằng tuần không xảy ra chênh lệch thừa thiếu.", value: 95 },
        { criterion: "2. Sổ sách thủ quỹ", weight: 30, desc: "Ghi chép sổ quỹ chi tiết, rõ ràng, cập nhật chứng từ hằng ngày.", value: 90 },
        { criterion: "3. Phối hợp kế toán", weight: 20, desc: "Đối chiếu khớp số liệu tồn quỹ với kế toán định kỳ và đột xuất.", value: 95 },
        { criterion: "4. Tuân thủ kỷ luật", weight: 10, desc: "Đảm bảo giờ giấc, đạo đức tác phong sư phạm, tuân thủ nội quy cơ quan.", value: 100 }
      ];
    }
    
    // Default fallback
    return [
      { criterion: "1. Khối lượng & Tiến độ", weight: 30, desc: "Hoàn thành các đầu việc được giao đúng kế hoạch tuần.", value: 80 },
      { criterion: "2. Chất lượng công việc", weight: 30, desc: "Báo cáo chính xác, nghiệp vụ chuyên môn đạt chuẩn thanh tra.", value: 85 },
      { criterion: "3. Hồ sơ & Sổ sách sổ điểm", weight: 20, desc: "Sắp xếp, đồng bộ hóa hồ sơ điện tử ngăn nắp đúng hạn.", value: 75 },
      { criterion: "4. Kỷ luật & Trách nhiệm", weight: 20, desc: "Đạo đức nhà giáo gương mẫu, tuân thủ giờ giấc hành chính.", value: 90 }
    ];
  };

  const handleResetKpis = async () => {
    const user = users.find(u => u.id === activeUserId);
    const userRole = user?.role || '';
    const userType = user?.type || 'GiaoVien';
    
    // Check if there is predefined static initial KPIs, otherwise generate based on role
    const defaultKpisForUser = INITIAL_KPIS[activeUserId] || getDefaultKpisForUser(userRole, userType);
    
    const resetKpis = JSON.parse(JSON.stringify(defaultKpisForUser));
    
    const updatedKpis = {
      ...allKpis,
      [activeUserId]: resetKpis
    };
    saveKpisToCache(updatedKpis);

    if (supabaseStatus === 'connected') {
      try {
        await saveUserKpisToSupabase(activeUserId, resetKpis);
        showToast('Đã khôi phục chỉ số KPI về mẫu mặc định thành công!');
      } catch (err: any) {
        console.error('Error resetting KPIs:', err);
        showToast('Lỗi khôi phục chỉ số KPI lên Supabase.');
      }
    } else {
      showToast('Đã khôi phục chỉ số KPI về mẫu mặc định thành công!');
    }
  };

  // 7. Thêm/Sửa/Xóa Nhân sự (Chỉ admin hoặc Super Admin được quyền)
  const handleAddUser = async (newUserData: Omit<User, 'avatar'>) => {
    // Generate initials for avatar
    const nameParts = newUserData.name.split(' ');
    const lastWord = nameParts[nameParts.length - 1] || 'U';
    const avatar = lastWord.substring(0, 2).toUpperCase();
    const email = newUserData.email?.trim() || `${newUserData.name.toLowerCase().replace(/\s+/g, '')}@thcshoaphu.edu.vn`;

    const newUser: User = {
      ...newUserData,
      avatar,
      email,
    };

    const newUsersList = [...users, newUser];
    saveUsersToCache(newUsersList);

    // Initialize OKR and KPI sample template for new user as requested
    const defaultOkrs = [
      {
        id: `okr-${Date.now()}-1`,
        title: "Nâng cao chất lượng hoạt động chuyên môn theo chuẩn thi đua mới",
        kr1: "Số hóa giáo án và giáo trình giảng dạy lên Driver trực tuyến của trường.",
        kr1Progress: 50,
        kr2: "Tham gia đầy đủ các chuyên đề bồi dưỡng nghiệp vụ.",
        kr2Progress: 70,
        kr3: "Đạt chuẩn xếp loại thi đua từ Khá trở lên.",
        kr3Progress: 40
      }
    ];

    const newOkrs = {
      ...allOkrs,
      [newUser.id]: defaultOkrs
    };
    saveOkrsToCache(newOkrs);

    const defaultKpis = getDefaultKpisForUser(newUser.role, newUser.type);

    const newKpis = {
      ...allKpis,
      [newUser.id]: defaultKpis
    };
    saveKpisToCache(newKpis);
    showToast(`Thêm nhân sự ${newUser.name} thành công!`);

    if (supabaseStatus === 'connected') {
      try {
        await saveUserToSupabase(newUser);
        for (const okr of defaultOkrs) {
          await saveOkrToSupabase(newUser.id, okr);
        }
        await saveUserKpisToSupabase(newUser.id, defaultKpis);
        showToast('Đã đồng bộ nhân sự mới lên Supabase!');
      } catch (err: any) {
        console.error('Error syncing add user:', err);
        showToast('Lỗi đồng bộ nhân sự mới lên Supabase. Đã lưu tạm tại máy.');
      }
    }
  };

  const handleUpdateUser = async (id: string, updatedFields: Partial<User>) => {
    const updatedUsersList = users.map(u => 
      u.id === id ? { ...u, ...updatedFields } : u
    );
    saveUsersToCache(updatedUsersList);

    if (supabaseStatus === 'connected') {
      const targetUser = updatedUsersList.find(u => u.id === id);
      if (targetUser) {
        try {
          await saveUserToSupabase(targetUser);
        } catch (err: any) {
          console.error('Error syncing update user:', err);
          showToast('Lỗi đồng bộ cập nhật nhân sự lên Supabase.');
        }
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (currentUser !== 'admin') {
      showToast('Cảnh báo: Chỉ có tài khoản Quản trị hệ thống (Admin) mới được phép xóa tài khoản!');
      return;
    }
    if (currentUser && typeof currentUser === 'object' && id === currentUser.id) {
      showToast('Không cho phép cá nhân tự xóa tài khoản của chính mình!');
      return;
    }
    if (id === 'THCS-HP-020' || id.toLowerCase() === 'admin') {
      showToast('Cảnh báo: Đây là tài khoản Admin hệ thống, không được phép xóa!');
      return;
    }
    const updatedUsersList = users.filter(u => u.id !== id);
    saveUsersToCache(updatedUsersList);

    // Clear user OKR & KPI data as well
    const updatedOkrs = { ...allOkrs };
    delete updatedOkrs[id];
    saveOkrsToCache(updatedOkrs);

    const updatedKpis = { ...allKpis };
    delete updatedKpis[id];
    saveKpisToCache(updatedKpis);
    showToast('Đã xóa nhân sự khỏi hệ thống!');

    if (supabaseStatus === 'connected') {
      try {
        await deleteUserFromSupabase(id);
        showToast('Đã đồng bộ xóa nhân sự trên Supabase!');
      } catch (err: any) {
        console.error('Error syncing delete user:', err);
        showToast('Lỗi đồng bộ xóa nhân sự trên Supabase.');
      }
    }
  };

  // Cho phép chuyển đổi nhanh khi click "Xem" từ danh bạ nhân sự
  const handleViewEmployee = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setViewedUserId(userId);
      setActiveTab('tab-main');
      showToast(`Đang hiển thị mục tiêu OKR và điểm KPI của: ${found.name}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 8. Chỉnh sửa hồ sơ cá nhân hiện tại
  const handleUpdateProfile = async (updatedProfile: Partial<User>) => {
    if (currentUser === 'admin') {
      const adminId = 'THCS-HP-020';
      const updatedUsersList = users.map(u => 
        u.id === adminId ? { ...u, ...updatedProfile } : u
      );
      saveUsersToCache(updatedUsersList);
      showToast('Đã lưu chỉnh sửa thông tin hồ sơ cá nhân và cập nhật mật khẩu mới của Super Admin thành công!');

      if (supabaseStatus === 'connected') {
        const adminUser = updatedUsersList.find(u => u.id === adminId);
        if (adminUser) {
          try {
            await saveUserToSupabase(adminUser);
            showToast('Đã đồng bộ cập nhật hồ sơ Admin lên Supabase!');
          } catch (err: any) {
            console.error('Error syncing admin update profile:', err);
            showToast('Lỗi đồng bộ hồ sơ Admin lên Supabase.');
          }
        }
      }
    } else if (currentUser) {
      const updatedUsersList = users.map(u => 
        u.id === currentUser.id ? { ...u, ...updatedProfile } : u
      );
      saveUsersToCache(updatedUsersList);
      
      const newProfile = {
        ...currentUser,
        ...updatedProfile
      };
      // Update local logged in user state
      setCurrentUser(newProfile);
      showToast('Đã lưu chỉnh sửa thông tin hồ sơ cá nhân và cập nhật mật khẩu mới thành công!');

      if (supabaseStatus === 'connected') {
        try {
          await saveUserToSupabase(newProfile);
          showToast('Đã đồng bộ cập nhật hồ sơ lên Supabase!');
        } catch (err: any) {
          console.error('Error syncing update profile:', err);
          showToast('Lỗi đồng bộ hồ sơ lên Supabase.');
        }
      }
    }
  };

  const handleDeleteProfile = async () => {
    showToast('Cảnh báo bảo mật: Không cho phép cá nhân tự xóa tài khoản của chính mình! Chỉ có Admin mới được phép xóa.');
  };

  const handleChangePasswordViaLogin = async (userId: string, newPwd: string) => {
    const updatedUsersList = users.map(u => 
      u.id === userId ? { ...u, password: newPwd } : u
    );
    saveUsersToCache(updatedUsersList);
    
    const foundUser = updatedUsersList.find(u => u.id === userId);
    
    if (foundUser && supabaseStatus === 'connected') {
      try {
        await saveUserToSupabase(foundUser);
        showToast(`Đã đồng bộ cập nhật mật khẩu mới của cán bộ ${foundUser.name} lên Supabase!`);
      } catch (err) {
        console.error('Lỗi đồng bộ mật khẩu mới lên Supabase:', err);
      }
    } else {
      showToast('Đã đổi mật khẩu mới thành công!');
    }
  };

  // Tính thống kê OKR
  const totalUsersWithOkr = Object.keys(allOkrs).filter(k => allOkrs[k]?.length > 0).length;

  // Nếu chưa đăng nhập, hiển thị Form Đăng nhập
  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} onChangePassword={handleChangePasswordViaLogin} />;
  }

  return (
    <div 
      className="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col antialiased relative"
      onClick={handleBackgroundClick}
    >
      
      {/* 1. HEADER BANNER WITH SIMULATOR & LOGOUT */}
      <Header 
        currentUser={currentUser} 
        users={users} 
        onSwitchSimulatedUser={handleSwitchSimulatedUser} 
        onLogout={handleLogout} 
        settings={settings}
      />

      {/* 2. STICKY HORIZONTAL NAVBAR */}
      <nav className="bg-blue-950 border-t border-blue-900 text-white shadow-sm z-10 sticky top-0" id="sticky-navbar">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center text-xs md:text-sm font-bold gap-2 py-1 md:py-0">
          <div className="flex items-center gap-3">
            <div className="flex">
              <button 
                onClick={() => setActiveTab('tab-main')} 
                className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'tab-main' 
                    ? 'border-yellow-400 bg-blue-900/40 text-yellow-300 font-black' 
                    : 'border-transparent hover:border-yellow-400 hover:bg-blue-900/40'
                }`}
              >
                Trang Chủ
              </button>
              {currentUser === 'admin' && (
                <button 
                  onClick={() => setActiveTab('tab-users')} 
                  className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'tab-users' 
                      ? 'border-yellow-400 bg-blue-900/40 text-yellow-300 font-black' 
                      : 'border-transparent hover:border-yellow-400 hover:bg-blue-900/40'
                  }`}
                >
                  Admin Quản Trị
                </button>
              )}
            </div>
          </div>
          <div className="py-2 px-3 text-xs text-blue-200 flex items-center flex-wrap gap-3">
            <button
              onClick={() => {
                if (currentUser === 'admin') {
                  setTempSemester(semester);
                  setTempSchoolYear(schoolYear);
                  setIsSemesterModalOpen(true);
                } else {
                  showToast('Chỉ Quản trị viên (Admin) mới có quyền chỉnh sửa thông tin học kỳ!');
                }
              }}
              title={currentUser === 'admin' ? "Nhấp để quản trị thiết lập Học kỳ & Năm học" : "Thông tin Học kỳ / Năm học"}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] uppercase font-black tracking-wider transition select-none ${
                currentUser === 'admin'
                  ? 'bg-amber-950/70 text-yellow-300 border-amber-500/50 hover:bg-amber-900/80 cursor-pointer shadow-sm hover:shadow-md'
                  : 'bg-blue-900/50 text-blue-200 border-blue-800 cursor-default'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>{semester} / {schoolYear}</span>
              {currentUser === 'admin' && (
                <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse ml-0.5" />
              )}
            </button>
            
            {/* Supabase Status indicator badge */}
            <div className="flex items-center gap-1.5 bg-slate-900/40 border border-slate-800/80 rounded-full pl-1.5 pr-2.5 py-1 text-[11px]" id="db-status-badge">
              {supabaseStatus === 'connecting' && (
                <>
                  <RefreshCw className="w-3 h-3 text-yellow-400 animate-spin" />
                  <span className="text-yellow-400 font-bold">Supabase: Đang kết nối...</span>
                </>
              )}
              {supabaseStatus === 'connected' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="text-emerald-400 font-bold mr-1">Supabase: Trực tuyến</span>
                  {isSyncing ? (
                    <RefreshCw className="w-2.5 h-2.5 text-blue-300 animate-spin" />
                  ) : (
                    <div className="flex gap-2 font-medium">
                      <button 
                        onClick={handleForcePushToSupabase}
                        className="text-[10px] text-blue-300 hover:text-white underline cursor-pointer hover:no-underline"
                        title="Đẩy toàn bộ dữ liệu máy lên Supabase"
                      >
                        Đẩy dữ liệu
                      </button>
                      <button 
                        onClick={handleForcePullFromSupabase}
                        className="text-[10px] text-teal-300 hover:text-white underline cursor-pointer hover:no-underline"
                        title="Tải toàn bộ dữ liệu Supabase về máy"
                      >
                        Tải về
                      </button>
                    </div>
                  )}
                </>
              )}
              {supabaseStatus === 'no-tables' && (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-bounce shrink-0" />
                  <button 
                    onClick={() => setShowSqlModal(true)} 
                    className="text-amber-300 hover:text-amber-200 underline font-extrabold cursor-pointer text-left text-[11px] hover:no-underline"
                    title="Bấm để xem mã SQL khởi tạo"
                  >
                    Supabase: Thiếu bảng (Nhấn để sửa)
                  </button>
                </>
              )}
              {supabaseStatus === 'error' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                  <button 
                    onClick={() => {
                      alert(`Chi tiết lỗi kết nối Supabase:\n${supabaseErrorMsg || 'Không xác định'}\n\nHệ thống tự động chuyển sang chế độ Offline lưu trữ tại máy (LocalStorage) để đảm bảo trải nghiệm thông suốt.`);
                    }}
                    className="text-red-400 hover:text-red-300 underline font-semibold cursor-pointer text-left text-[11px] hover:no-underline"
                    title="Bấm để xem chi tiết lỗi"
                  >
                    Supabase: Offline (Dùng máy)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 3. SCROLLING MARQUEE TEXT & LIVE CLOCK */}
      <div className="bg-yellow-500 text-slate-900 font-extrabold border-b border-yellow-600 overflow-hidden relative select-none text-xs md:text-sm shadow-inner flex flex-col sm:flex-row items-stretch sm:items-center h-auto" id="marquee-bar">
        <div className="bg-yellow-600 text-slate-950 px-3 py-1.5 font-black shrink-0 border-b sm:border-b-0 sm:border-r border-yellow-700 flex items-center justify-center sm:justify-start gap-1.5 shadow-md z-10 text-[11px] md:text-xs" id="live-clock">
          <Clock className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
          <span>{formatVietnameseDateTime(currentTime)}</span>
        </div>
        <div className="flex-1 overflow-hidden relative py-1.5 px-4 sm:px-3 whitespace-nowrap flex items-center" id="marquee-text-container">
          <div className="animate-marquee inline-block uppercase tracking-wider whitespace-nowrap text-[11px] md:text-xs">
            ★ {settings.marqueeText} ★ {settings.marqueeText}
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT GRID (3 COLUMNS) */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SIDEBAR */}
        <Sidebar 
          currentUser={currentUser} 
          users={users}
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          usersCount={users.length}
          activeOkrCount={totalUsersWithOkr}
          totalOkrCount={users.length}
          notifications={notifications}
        />

        {/* CENTER COLUMN: MAIN WORKSPACE */}
        <section className="col-span-1 lg:col-span-6 flex flex-col gap-6" id="main-workspace-section">
          
          {/* ====== TAB 1: TỔNG QUAN HỆ THỐNG ====== */}
          <div className={activeTab === 'tab-main' ? 'space-y-6 animate-fade-in block' : 'hidden'}>
            {/* Dynamic Hero Banner */}
            {settings.heroBannerUrl && (
              <div 
                className="w-full h-48 sm:h-60 md:h-64 rounded-xl shadow-sm relative overflow-hidden flex items-end p-5 border border-slate-200"
                id="main-hero-showcase"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.95) 15%, rgba(15, 23, 42, 0.25) 100%), url("${settings.heroBannerUrl}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="z-10 text-white">
                  <h2 className="text-base sm:text-xl md:text-2xl font-black mt-2 drop-shadow text-yellow-300">
                    Trường THCS Hòa Phú Đổi Mới & Sáng Tạo
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-200 mt-1 max-w-xl drop-shadow font-medium">
                    Bứt phá chất lượng chuyên môn giáo dục, xây dựng nhà trường thông minh và chuẩn hóa cơ sở vật chất kỹ thuật số hàng đầu khu vực.
                  </p>
                </div>
              </div>
            )}

            {/* Welcome Banner */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="z-10 relative">
                <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Trang làm việc tổng quan
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-2">
                  Xin chào, <span className="text-blue-900">{currentUser === 'admin' ? 'Nghiêm Hồng Quân' : currentUser.name}</span>!
                </h2>
                <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed">
                  Hôm nay là một ngày làm việc tràn đầy sáng tạo. Hãy cập nhật các mục tiêu OKR và tự đánh giá chỉ số KPI để hoàn thiện hồ sơ thi đua nộp lên BGH trường đúng kỳ hạn nhé!
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <Award className="w-32 h-32 text-blue-900" />
              </div>
            </div>

            {/* Viewed User Info Banner (Read-only mode warning) */}
            {viewedUserId && viewedUserId !== (currentUser === 'admin' ? 'THCS-HP-020' : currentUser?.id) && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
                <div className="flex items-start gap-3">
                  <span className="p-2 bg-blue-100 rounded-lg text-blue-700 shrink-0 mt-0.5 sm:mt-0">
                    <ShieldAlert className="w-5 h-5 animate-pulse text-blue-600" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-xs md:text-sm leading-snug">
                      Chế độ xem hồ sơ đồng nghiệp
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Bạn đang xem dữ liệu OKR và điểm KPI của cán bộ: <strong className="text-blue-900 font-extrabold">{activeUserName}</strong>.
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Theo quy định an toàn hệ thống, bạn chỉ được quyền xem và không thể thực hiện thêm, sửa hoặc xóa dữ liệu này.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewedUserId(null)}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  Quay lại hồ sơ của tôi
                </button>
              </div>
            )}

            {/* ====== PHÂN VÙNG CHỈ ĐẠO ĐỊNH HƯỚNG TỪ BGH ====== */}
            {currentUser !== 'admin' && (typeof currentUser === 'object' && currentUser.type !== 'BGH') && getActiveUserGroupAssignments().length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-150 rounded-xl p-5 space-y-4 shadow-3xs animate-fade-in" id="bgh-directives-panel">
                <div className="flex items-start gap-3">
                  <span className="p-2 bg-indigo-100 rounded-lg text-indigo-800 shrink-0 mt-0.5">
                    <Award className="w-5 h-5 text-indigo-700" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs md:text-sm leading-snug uppercase tracking-wider flex items-center gap-1.5">
                      🎯 Định hướng Mục tiêu chiến lược giao từ Ban Giám Hiệu
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed font-medium">
                      Dưới đây là mục tiêu OKR-KPI định hướng cấp Tổ chuyên môn hoặc Khối nhân sự mà bạn trực thuộc. Hãy dựa vào định hướng chung này để xây dựng bộ OKR và KPI cá nhân tương ứng của mình bên dưới.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getActiveUserGroupAssignments().map((assign) => (
                    <div key={assign.id} className="bg-white rounded-xl p-4 border border-indigo-100 shadow-3xs space-y-3">
                      <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                        <span className="text-[11px] font-extrabold text-indigo-900 bg-indigo-50/70 px-2.5 py-1 rounded-md">
                          📍 {assign.targetName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          Giao ngày: {assign.assignedAt}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Mục tiêu chung (Objective)</span>
                          <p className="text-[11px] font-black text-slate-800 leading-snug">
                            {assign.okr.title}
                          </p>
                        </div>

                        <div className="space-y-1 bg-slate-50 rounded-lg p-2.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Các kết quả then chốt (Key Results):</span>
                          <ul className="space-y-1 list-disc list-inside text-[10px] text-slate-600 font-medium">
                            <li className="leading-snug">{assign.okr.kr1}</li>
                            <li className="leading-snug">{assign.okr.kr2}</li>
                            <li className="leading-snug">{assign.okr.kr3}</li>
                          </ul>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Chỉ số vận hành cốt lõi (KPIs)</span>
                          <div className="space-y-1">
                            {assign.kpis.map((k, idx) => (
                              <div key={idx} className="flex items-start justify-between gap-2 text-[10px] border-b border-dashed border-slate-100 pb-1 last:border-0 last:pb-0">
                                <div className="font-medium text-slate-700 leading-tight">
                                  {k.criterion}
                                </div>
                                <span className="font-extrabold text-indigo-950 whitespace-nowrap bg-indigo-50 px-1.5 py-0.5 rounded text-[9px]">
                                  {k.weight}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Nút đồng bộ nhanh vào tài khoản */}
                        <div className="pt-2 border-t border-indigo-50">
                          <button
                            onClick={() => handleSyncGroupToPersonal(assign)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black py-2 rounded-lg transition shadow-3xs flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Đồng bộ mục tiêu vào tài khoản cá nhân
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OKR WORKSPACE SECTION */}
            <OkrSection 
              okrs={activeUserOkrs}
              onAddOkr={handleAddOkr}
              onUpdateOkr={handleUpdateOkr}
              onDeleteOkr={handleDeleteOkr}
              readOnly={!canEditActiveData}
              isAdmin={isBghOrAdmin}
            />

            {/* KPI WORKSPACE SECTION */}
            <KpiSection 
              kpis={activeUserKpis}
              onKpiValueChange={handleKpiValueChange}
              onKpiEvidencesChange={handleKpiEvidencesChange}
              onKpisChange={handleKpisChange}
              onResetKpis={handleResetKpis}
              readOnly={!canEditActiveData}
              onKpiScoresChange={handleKpiScoresChange}
              activeUser={activeUser}
              onUpdateUserRatingOverride={(rating) => {
                if (activeUser) {
                  handleUpdateUser(activeUser.id, { bghRatingOverride: rating });
                }
              }}
              isBghOrAdmin={isBghOrAdmin}
            />
          </div>

          {/* ====== TAB 2: QUẢN LÝ TÀI KHOẢN ====== */}
          <div className={activeTab === 'tab-profile' ? 'animate-fade-in block' : 'hidden'}>
            <ProfileTab 
              currentUser={currentUser === 'admin' ? (users.find(u => u.id === 'THCS-HP-020') || 'admin') : currentUser}
              onUpdateProfile={handleUpdateProfile}
              onDeleteProfile={handleDeleteProfile}
            />
          </div>

          {/* ====== TAB 3: DANH SÁCH NHÂN SỰ ====== */}
          {(currentUser === 'admin' || isBghOrToTruong) && (
            <div className={activeTab === 'tab-users' ? 'animate-fade-in block' : 'hidden'}>
              <UsersTab 
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onViewEmployee={handleViewEmployee}
                showToast={showToast}
                onOpenAssignModal={(user) => {
                  setSelectedUserForAssign(user);
                  setIsAssignModalOpen(true);
                }}
                allKpis={allKpis}
                currentUser={currentUser}
              />
            </div>
          )}

          {/* ====== TAB 4: TRUNG TÂM XUẤT BẢN BÁO CÁO ====== */}
          <div className={activeTab === 'tab-export' ? 'animate-fade-in block' : 'hidden'}>
            <ExportTab 
              showToast={showToast} 
              currentUser={currentUser} 
              users={users} 
              allOkrs={allOkrs} 
              allKpis={allKpis} 
            />
          </div>

          {/* ====== TAB 5: LIÊN HỆ & TIỆN ÍCH ====== */}
          <div className={activeTab === 'tab-utilities' ? 'animate-fade-in block' : 'hidden'}>
            <UtilitiesTab />
          </div>

          {/* ====== TAB THÔNG BÁO ====== */}
          <div className={activeTab === 'tab-notifications' ? 'animate-fade-in block' : 'hidden'}>
            <NotificationsTab 
              notifications={notifications}
              onSaveNotifications={saveNotificationsToCache}
              currentUser={currentUser}
              showToast={showToast}
              users={users}
            />
          </div>

          {/* ====== TAB 6: CÀI ĐẶT HỆ THỐNG ====== */}
          <div className={activeTab === 'tab-settings' ? 'animate-fade-in block' : 'hidden'}>
            <SettingsTab 
              settings={settings}
              onSaveSettings={saveSettingsToCache}
              notifications={notifications}
              onSaveNotifications={saveNotificationsToCache}
              scheduleItems={scheduleItems}
              onSaveScheduleItems={saveScheduleItemsToCache}
              currentUser={currentUser}
              showToast={showToast}
              initialSubTab={settingsSubTab}
              onSubTabChange={setSettingsSubTab}
              semester={semester}
              schoolYear={schoolYear}
              onSaveSemester={handleSaveSemester}

              // Database and Sync props
              supabaseStatus={supabaseStatus}
              supabaseErrorMsg={supabaseErrorMsg}
              onForcePush={handleForcePushToSupabase}
              onForcePull={handleForcePullFromSupabase}
              onCheckConnection={async () => { await handleCheckSupabaseConnection(); }}
              users={users}
              allOkrs={allOkrs}
              allKpis={allKpis}
              isSyncing={isSyncing}
              setShowSqlModal={setShowSqlModal}
            />
          </div>

          {/* ====== TAB BGH GIAO VIỆC TỔ/KHỐI ====== */}
          {(currentUser === 'admin' || (currentUser && typeof currentUser === 'object' && currentUser.type === 'BGH')) && (
            <div className={activeTab === 'tab-bgh-assign' ? 'animate-fade-in block' : 'hidden'}>
              <BghAssignTab 
                currentUser={currentUser}
                groupAssignments={groupAssignments}
                onSaveAssignment={handleSaveGroupAssignment}
                showToast={showToast}
              />
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
        <aside className="col-span-1 lg:col-span-3 flex flex-col gap-6" id="widgets-aside">
          
          {/* Widget 1: Thông báo mới từ BGH */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 relative">
            <h3 className="font-bold text-xs md:text-sm text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-red-700">
                <Bell className="w-4 h-4 animate-bounce text-red-600" /> Thông báo từ BGH
              </span>
              <div className="flex items-center gap-1">
                {isBghOrAdmin && (
                  <button
                    onClick={() => {
                      setSettingsSubTab('notifications');
                      setActiveTab('tab-settings');
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-900 transition flex items-center gap-0.5 cursor-pointer"
                    title="Cấu hình quản trị thông báo"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="bg-slate-100 text-slate-700 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  {notifications.length} Bản tin
                </span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                    {notifications.filter(n => !n.read).length} Mới
                  </span>
                )}
              </div>
            </h3>
            <div className="space-y-3 text-xs">
              {notifications.slice(0, 4).map((notif) => {
                const isUnread = !notif.read;
                return (
                  <div 
                    key={notif.id} 
                    onClick={() => {
                      const updated = notifications.map(n => 
                        n.id === notif.id ? { ...n, read: !n.read } : n
                      );
                      saveNotificationsToCache(updated);
                      showToast(`Đã đánh dấu "${notif.title}" là ${isUnread ? 'đã đọc' : 'chưa đọc'}`);
                    }}
                    className={`p-2.5 rounded transition border relative cursor-pointer select-none group ${
                      isUnread 
                        ? 'bg-blue-50/60 border-blue-200 border-l-2 border-l-blue-600 shadow-2xs' 
                        : 'bg-white hover:bg-slate-50 border-slate-150 opacity-75'
                    }`}
                  >
                    {isUnread && (
                      <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                    <p className={`font-bold text-slate-800 leading-tight pr-4 ${!isUnread ? 'line-through text-slate-500 font-normal' : ''}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1 font-medium flex items-center justify-between">
                      <span>{notif.time}</span>
                      <span className="text-[9px] text-blue-700 font-extrabold opacity-0 group-hover:opacity-100 transition">
                        {isUnread ? 'Đánh dấu đã đọc' : 'Đánh dấu chưa đọc'}
                      </span>
                    </span>
                  </div>
                );
              })}
              {notifications.length === 0 && (
                <p className="text-center py-4 text-xs text-slate-400 italic">Không có thông báo mới.</p>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => setActiveTab('tab-notifications')}
                  className="w-full text-center py-2 mt-1 border border-dashed border-blue-200 text-blue-950 font-extrabold hover:bg-blue-50 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer block"
                >
                  Xem tất cả bản tin ({notifications.length})
                </button>
              )}
            </div>
          </div>

          {/* Widget 2: Lịch hoạt động tuần-tháng */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-bold text-xs md:text-sm text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-500" /> Lịch hoạt động
              </span>
              <div className="flex items-center gap-1">
                {isBghOrAdmin && (
                  <button
                    onClick={() => {
                      setSettingsSubTab('schedules');
                      setActiveTab('tab-settings');
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-900 transition flex items-center gap-0.5 cursor-pointer"
                    title="Cấu hình quản trị lịch"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* Week/Month Toggler inside Widget */}
                <div className="bg-slate-100 p-0.5 rounded flex text-[9px] font-extrabold shadow-inner">
                  <button
                    onClick={() => setScheduleView('week')}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                      scheduleView === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Tuần
                  </button>
                  <button
                    onClick={() => setScheduleView('month')}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                      scheduleView === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Tháng
                  </button>
                </div>
              </div>
            </h3>

            <div className="space-y-3 text-xs">
              {scheduleItems
                .filter((item) => item.scope === scheduleView)
                .slice(0, 5)
                .map((s) => {
                  const badgeColors = {
                    blue: 'bg-blue-100 text-blue-900',
                    emerald: 'bg-emerald-100 text-emerald-900',
                    purple: 'bg-purple-100 text-purple-900',
                    amber: 'bg-amber-100 text-amber-900',
                    rose: 'bg-rose-100 text-rose-900',
                    indigo: 'bg-indigo-100 text-indigo-900',
                  };
                  const badgeColorClass = badgeColors[s.color || 'blue'] || badgeColors.blue;

                  return (
                    <div key={s.id} className="flex items-start gap-2.5">
                      <div className={`${badgeColorClass} font-extrabold text-center px-2 py-1 rounded text-[10px] min-w-[36px]`}>
                        {s.time}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 leading-tight break-words">{s.title}</p>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{s.location}</span>
                      </div>
                    </div>
                  );
                })}

              {scheduleItems.filter((item) => item.scope === scheduleView).length === 0 && (
                <p className="text-center py-4 text-xs text-slate-400 italic">Chưa thiết lập lịch hoạt động.</p>
              )}
            </div>
          </div>

          {/* Widget 3: Nhóm liên lạc nhanh Zalo */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 relative overflow-hidden">
            <div className="bg-blue-600 -mx-4 -mt-4 p-4 text-white text-center font-extrabold text-xs md:text-sm flex items-center justify-center gap-1">
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 .5C5.3.5 0 4.9 0 10.3c0 3 1.7 5.7 4.5 7.5c-.3 1-.9 2.5-1.1 3c-.1.3 0 .5.2.5c.2 0 1.2-.4 2.5-1.2c1.8.6 3.8.9 5.9.9c6.6 0 12-4.4 12-9.8S18.7.5 12 .5z"/>
              </svg>
              <span>Cổng Hỗ Trợ Zalo Trường</span>
            </div>
            <div className="pt-4 text-center">
              <p className="text-[11px] text-slate-500 mb-3.5 font-bold leading-relaxed">
                Ấn vào nút bên dưới để tham gia ngay nhóm liên lạc Zalo nhanh chóng của THCS Hòa Phú.
              </p>
              <a 
                href="https://zalo.me" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-extrabold text-xs px-4 py-2.5 rounded-lg transition shadow-sm w-full justify-center cursor-pointer border border-blue-200"
              >
                <MessageSquare className="w-4 h-4 text-blue-700" /> Tham gia nhóm Zalo Trường
              </a>
            </div>
          </div>
        </aside>
      </main>

      {/* 5. FOOTER SECTION */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 mt-auto text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-extrabold text-white text-xs md:text-sm">HỘI ĐỒNG SƯ PHẠM TRƯỜNG THCS HÒA PHÚ</p>
            <p className="mt-1 text-slate-500 font-medium">Địa chỉ: Xã Hòa Xá, Thành Phố Hà Nội</p>
          </div>
          <div className="text-center md:text-right">
            <p className="font-semibold text-slate-300">Thiết kế và quản trị: <strong>Nghiêm Hồng Quân</strong></p>
            <p className="mt-1 text-slate-500">&copy; 2026 THCS Hòa Phú. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>

      {/* Supabase SQL Migration Modal */}
      {showSqlModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 cursor-pointer" 
          id="sql-migration-modal"
          onClick={() => setShowSqlModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-scale-in cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-teal-200 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-sm md:text-base leading-none">Khởi tạo Cơ sở dữ liệu Supabase</h3>
                  <p className="text-[10px] md:text-xs text-teal-100 mt-1">Làm theo hướng dẫn bên dưới để chuẩn bị các bảng trên dự án Supabase của bạn</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSqlModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition cursor-pointer text-sm font-black"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs md:text-sm">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">Tại sao cần bước này?</p>
                  <p className="text-[11px] text-amber-700 leading-normal mt-0.5">
                    Supabase yêu cầu cấu trúc bảng để lưu trữ đồng bộ thông tin nhân sự, OKR, KPI, và cài đặt hệ thống. Nếu bạn chưa tạo các bảng, ứng dụng sẽ tự động lưu tạm thời vào trình duyệt của bạn (LocalStorage) và tiếp tục hoạt động ngoại tuyến.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-800">Các bước thực hiện nhanh:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                  <li>Mở bảng điều khiển dự án <strong>Supabase</strong> của bạn.</li>
                  <li>Truy cập vào mục <strong>SQL Editor</strong> ở thanh menu bên trái.</li>
                  <li>Tạo một Query mới (Nhấn <strong>New Query</strong>).</li>
                  <li>Sao chép toàn bộ mã SQL dưới đây, dán vào khung soạn thảo và ấn <strong>RUN</strong>.</li>
                </ol>
              </div>

              <div className="relative">
                <div className="absolute right-3 top-3 z-10 flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT);
                      setIsSqlCopied(true);
                      setTimeout(() => setIsSqlCopied(false), 2000);
                      showToast('Đã sao chép mã SQL vào bộ nhớ đệm!');
                    }}
                    className="bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 px-2.5 py-1.5 rounded-md text-[10px] md:text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    {isSqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {isSqlCopied ? 'Đã sao chép' : 'Sao chép mã SQL'}
                  </button>
                </div>
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-[10px] md:text-xs font-mono overflow-x-auto max-h-[250px] border border-slate-800 pt-12">
                  {SQL_MIGRATION_SCRIPT}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={async () => {
                    setShowSqlModal(false);
                    showToast('Đang quét kết nối cơ sở dữ liệu...');
                    const conn = await checkSupabaseConnection();
                    if (conn.connected && conn.tablesExist) {
                      showToast('Đã kết nối cơ sở dữ liệu Supabase thành công!');
                      window.location.reload();
                    } else {
                      showToast('Vẫn chưa tìm thấy cấu trúc bảng trên Supabase. Vui lòng hãy tạo bảng trước.');
                    }
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs md:text-sm text-center transition cursor-pointer"
                >
                  Tôi đã chạy SQL - Kiểm tra kết nối ngay
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-lg text-xs md:text-sm text-center transition cursor-pointer"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CẤU HÌNH NHANH HỌC KỲ & NĂM HỌC */}
      {isSemesterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="semester-management-modal">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-950 to-blue-900 px-6 py-4 flex items-center justify-between select-none">
              <div className="flex items-center gap-2 text-white">
                <div className="bg-amber-500/20 p-1.5 rounded-lg border border-amber-500/30">
                  <Tag className="w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-white">Quản trị & Thiết lập Học kỳ</h3>
                  <p className="text-[10px] text-blue-200">Thay đổi thông tin học kỳ hoạt động toàn trường</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSemesterModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!tempSemester.trim() || !tempSchoolYear.trim()) {
                  showToast('Vui lòng điền đầy đủ thông tin học kỳ và năm học!');
                  return;
                }
                handleSaveSemester(tempSemester.trim(), tempSchoolYear.trim());
                showToast(`Đã thay đổi sang ${tempSemester} / ${tempSchoolYear} thành công!`);
              }}
              className="p-6 space-y-4 text-xs md:text-sm"
            >
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 flex items-start gap-2 select-none">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Chú ý:</strong> Thông tin thiết lập tại đây sẽ thay đổi tức thì thời gian hiển thị học kỳ ở thanh tiêu đề, cũng như áp dụng đồng bộ vào các mẫu in và tệp Word/Excel/PDF xuất bản.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-600 uppercase">Học kỳ hoạt động</label>
                <select
                  value={tempSemester}
                  onChange={(e) => setTempSemester(e.target.value)}
                  className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-bold text-slate-800"
                >
                  <option value="Học kỳ I">Học kỳ I</option>
                  <option value="Học kỳ II">Học kỳ II</option>
                  <option value="Học kỳ phụ">Học kỳ phụ (Học kỳ hè)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-600 uppercase">Năm học hiện tại</label>
                <input 
                  type="text"
                  value={tempSchoolYear}
                  onChange={(e) => setTempSchoolYear(e.target.value)}
                  placeholder="Ví dụ: 2026-2027"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-bold text-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 font-bold text-xs">
                <button
                  type="submit"
                  className="flex-1 bg-blue-950 hover:bg-blue-900 text-white font-bold py-2.5 px-4 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" /> Lưu thiết lập
                </button>
                <button
                  type="button"
                  onClick={() => setIsSemesterModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-lg text-center transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== DIALOG: GIAO VIỆC & TỰ SINH OKR-KPI CHO CBGV-NV ====== */}
      {isAssignModalOpen && selectedUserForAssign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto" id="assign-okr-kpi-modal">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-900 to-rose-950 px-6 py-4 flex items-center justify-between select-none">
              <div className="flex items-center gap-2 text-white">
                <div className="bg-rose-500/20 p-1.5 rounded-lg border border-rose-500/30">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-white">Giao Việc & Tự Sinh OKR-KPI Thông Minh</h3>
                  <p className="text-[10px] text-rose-200">BGH và Tổ trưởng chuyên môn kiến tạo mục tiêu cho nhân sự toàn trường</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedUserForAssign(null);
                  setAssignDirection('');
                  setPreviewOkrTitle('');
                  setPreviewKr1('');
                  setPreviewKr2('');
                  setPreviewKr3('');
                  setPreviewKpi1Name('');
                  setPreviewKpi2Name('');
                  setPreviewKpi3Name('');
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs md:text-sm">
              {/* Target employee profile card */}
              <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-800 font-black text-base shrink-0 select-none overflow-hidden">
                    {selectedUserForAssign.avatar && (selectedUserForAssign.avatar.startsWith('http') || selectedUserForAssign.avatar.startsWith('data:') || selectedUserForAssign.avatar.startsWith('/')) ? (
                      <img src={selectedUserForAssign.avatar} alt={selectedUserForAssign.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      selectedUserForAssign.avatar || selectedUserForAssign.name.split(' ').pop()?.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                      {selectedUserForAssign.name}
                      <span className="font-mono text-[10px] bg-rose-150 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                        {selectedUserForAssign.id}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Chức vụ: <span className="text-slate-800 font-bold">{selectedUserForAssign.role}</span> | Loại hình: <span className="text-slate-800 font-bold">{selectedUserForAssign.type === 'GiaoVien' ? 'Giáo viên giảng dạy' : selectedUserForAssign.type === 'NhanVien' ? 'Nhân viên hành chính' : 'Ban Giám Hiệu'}</span>
                    </p>
                  </div>
                </div>
                <div className="bg-white px-3 py-2 rounded-lg border border-rose-100 text-[11px] leading-snug shrink-0">
                  <span className="font-black text-rose-900 block uppercase tracking-wider text-[10px]">Học kỳ hiện tại</span>
                  <span className="font-bold text-slate-800">{semester} | Năm học {schoolYear}</span>
                </div>
              </div>

              {/* Assigner Directives Input & Assist */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Định hướng giao việc & Chỉ đạo của BGH / Tổ trưởng chuyên môn
                </label>
                <textarea
                  value={assignDirection}
                  onChange={(e) => setAssignDirection(e.target.value)}
                  placeholder="Ví dụ: Nâng cao thành tích bồi dưỡng học sinh giỏi Ngữ văn lớp 9, đẩy mạnh soạn giảng E-learning trên hệ thống trường học thông minh..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-rose-800 focus:outline-none font-medium text-slate-800 min-h-[80px]"
                />
                
                {/* Quick Assist prompts */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">💡 Gợi ý nhanh định hướng theo phân ban:</span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {selectedUserForAssign.type === 'GiaoVien' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setAssignDirection("Đẩy mạnh chuyển đổi số trong dạy học, tích cực xây dựng bài giảng điện tử E-learning, nâng cao chất lượng CNTT.")}
                          className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-900 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-bold transition cursor-pointer"
                        >
                          🌐 Số hóa & E-learning
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssignDirection("Tập trung ôn tập bồi dưỡng đội tuyển Học sinh giỏi cấp huyện, đổi mới phương pháp giảng dạy tích cực nâng cao học lực.")}
                          className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-900 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-bold transition cursor-pointer"
                        >
                          🏆 Bồi dưỡng HSG giỏi
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssignDirection("Nâng cao hiệu quả quản lý nề nếp lớp chủ nhiệm, xây dựng tập thể lớp kỷ luật tốt và gắn kết tốt với phụ huynh.")}
                          className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-900 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-bold transition cursor-pointer"
                        >
                          🏫 Công tác Chủ nhiệm
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setAssignDirection("Ứng dụng phần mềm tự động hóa báo cáo, tối ưu hóa công tác lưu trữ sổ sách học đường và thông tin công văn.")}
                          className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-900 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-bold transition cursor-pointer"
                        >
                          📂 Lưu trữ & Số hóa sổ sách
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssignDirection("Nâng cao nghiệp vụ tài chính kế toán trường học, hỗ trợ phụ huynh đóng học phí không dùng tiền mặt đạt 100%.")}
                          className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-900 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-bold transition cursor-pointer"
                        >
                          💳 Thu học phí không tiền mặt
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssignDirection("Đảm bảo công tác y tế học đường, vệ sinh môi trường, an toàn học tập và phòng chống cháy nổ tuyệt đối.")}
                          className="text-[10px] bg-slate-100 hover:bg-rose-50 hover:text-rose-900 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-bold transition cursor-pointer"
                        >
                          🏥 Y tế & Vệ sinh môi trường
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Trigger Generation Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={async () => {
                    setIsGenerating(true);
                    
                    const quotes = [
                      "Trí tuệ nhân tạo Gemini đang phân tích định hướng giáo dục...",
                      "Đang kết nối thư viện mục tiêu THCS chuẩn quốc gia...",
                      "Đang tự động sinh mục tiêu OKR đổi mới sáng tạo...",
                      "Đang định lượng hóa chỉ số vận hành KPI cân bằng...",
                      "Đang rà soát ngôn ngữ chuẩn quy chế chuyên môn..."
                    ];
                    
                    let quoteIndex = 0;
                    setGenerationQuote(quotes[0]);
                    const quoteInterval = setInterval(() => {
                      quoteIndex = (quoteIndex + 1) % quotes.length;
                      setGenerationQuote(quotes[quoteIndex]);
                    }, 1200);

                    try {
                      const response = await fetch("/api/generate-okr-kpi", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: selectedUserForAssign.name,
                          role: selectedUserForAssign.role,
                          type: selectedUserForAssign.type,
                          direction: assignDirection
                        })
                      });
                      
                      if (!response.ok) {
                        throw new Error("Failed to call Gemini server API");
                      }
                      
                      const data = await response.json();
                      
                      // Cập nhật các preview state
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
                      
                      showToast("Đã tự sinh OKR và KPI thành công bằng AI Gemini!");
                    } catch (error: any) {
                      console.error("AI Generation failed, falling back to local expert template...", error);
                      generateFallbackLocalTemplate();
                      showToast("Đã kích hoạt chế độ tự sinh bằng Mẫu chuyên gia (Offline)!");
                    } finally {
                      clearInterval(quoteInterval);
                      setIsGenerating(false);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold py-3 px-4 rounded-xl text-center transition cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" /> 
                  {isGenerating ? "Đang xử lý tự sinh..." : "🤖 Tự sinh bằng Trí tuệ Nhân tạo Gemini (Khuyên dùng)"}
                </button>
                
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => {
                    generateFallbackLocalTemplate();
                    showToast("Đã sinh OKR-KPI từ Mẫu chuyên gia thành công!");
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold py-3 px-4 rounded-xl text-center transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-600" /> Tự sinh nhanh từ Mẫu Chuyên gia
                </button>
              </div>

              {/* Animated Loading Panel */}
              {isGenerating && (
                <div className="bg-slate-900 text-slate-100 p-6 rounded-xl flex flex-col items-center justify-center gap-4 border border-slate-800 shadow-inner select-none animate-pulse">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-yellow-300 absolute inset-0 m-auto animate-ping" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-white">{generationQuote}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Xin vui lòng đợi vài giây để Gemini xây dựng mục tiêu chất lượng cao...</p>
                  </div>
                </div>
              )}

              {/* LIVE PREVIEW & FINE-TUNING PANEL */}
              {(previewOkrTitle || previewKpi1Name) && !isGenerating && (
                <div className="space-y-4 border border-slate-200 bg-slate-50/50 rounded-xl p-5 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h5 className="font-black text-slate-950 flex items-center gap-1.5 uppercase tracking-wide text-xs">
                      🔍 Xem trước & Tinh chỉnh dữ liệu trước khi Giao
                    </h5>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Bản thảo hoàn chỉnh
                    </span>
                  </div>

                  {/* Section A: OKR */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-1.5 font-black text-rose-800 text-[11px] uppercase tracking-wider">
                      <Award className="w-4 h-4 text-rose-600" /> Phần A: Mục tiêu Đổi mới Sáng tạo (OKR)
                    </div>
                    
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Mục tiêu (Objective)</label>
                        <input
                          type="text"
                          value={previewOkrTitle}
                          onChange={(e) => setPreviewOkrTitle(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Kết quả then chốt 1 (KR1)</label>
                          <input
                            type="text"
                            value={previewKr1}
                            onChange={(e) => setPreviewKr1(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Kết quả then chốt 2 (KR2)</label>
                          <input
                            type="text"
                            value={previewKr2}
                            onChange={(e) => setPreviewKr2(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Kết quả then chốt 3 (KR3)</label>
                          <input
                            type="text"
                            value={previewKr3}
                            onChange={(e) => setPreviewKr3(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section B: KPI */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-rose-800 text-[11px] uppercase tracking-wider">
                        <Database className="w-4 h-4 text-rose-600" /> Phần B: 3 Chỉ số vận hành cốt lõi (KPI)
                      </div>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${
                        (previewKpi1Weight + previewKpi2Weight + previewKpi3Weight) === 100 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                      }`}>
                        Tổng Trọng số: {previewKpi1Weight + previewKpi2Weight + previewKpi3Weight}% {
                          (previewKpi1Weight + previewKpi2Weight + previewKpi3Weight) !== 100 && " (Yêu cầu phải bằng 100%)"
                        }
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* KPI 1 */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                        <div className="grid grid-cols-4 gap-3">
                          <div className="col-span-3 space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Tiêu chí đánh giá 1</label>
                            <input
                              type="text"
                              value={previewKpi1Name}
                              onChange={(e) => setPreviewKpi1Name(e.target.value)}
                              className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-white"
                            />
                          </div>
                          <div className="col-span-1 space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Trọng số (%)</label>
                            <input
                              type="number"
                              value={previewKpi1Weight}
                              onChange={(e) => setPreviewKpi1Weight(parseInt(e.target.value) || 0)}
                              className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-white text-center"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Hướng dẫn đo lường & Tiêu chuẩn đạt</label>
                          <textarea
                            value={previewKpi1Desc}
                            onChange={(e) => setPreviewKpi1Desc(e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-medium text-slate-800 bg-white min-h-[45px]"
                          />
                        </div>
                      </div>

                      {/* KPI 2 */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                        <div className="grid grid-cols-4 gap-3">
                          <div className="col-span-3 space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Tiêu chí đánh giá 2</label>
                            <input
                              type="text"
                              value={previewKpi2Name}
                              onChange={(e) => setPreviewKpi2Name(e.target.value)}
                              className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-white"
                            />
                          </div>
                          <div className="col-span-1 space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Trọng số (%)</label>
                            <input
                              type="number"
                              value={previewKpi2Weight}
                              onChange={(e) => setPreviewKpi2Weight(parseInt(e.target.value) || 0)}
                              className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-white text-center"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Hướng dẫn đo lường & Tiêu chuẩn đạt</label>
                          <textarea
                            value={previewKpi2Desc}
                            onChange={(e) => setPreviewKpi2Desc(e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-medium text-slate-800 bg-white min-h-[45px]"
                          />
                        </div>
                      </div>

                      {/* KPI 3 */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                        <div className="grid grid-cols-4 gap-3">
                          <div className="col-span-3 space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Tiêu chí đánh giá 3</label>
                            <input
                              type="text"
                              value={previewKpi3Name}
                              onChange={(e) => setPreviewKpi3Name(e.target.value)}
                              className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-white"
                            />
                          </div>
                          <div className="col-span-1 space-y-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">Trọng số (%)</label>
                            <input
                              type="number"
                              value={previewKpi3Weight}
                              onChange={(e) => setPreviewKpi3Weight(parseInt(e.target.value) || 0)}
                              className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800 bg-white text-center"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Hướng dẫn đo lường & Tiêu chuẩn đạt</label>
                          <textarea
                            value={previewKpi3Desc}
                            onChange={(e) => setPreviewKpi3Desc(e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-1.5 text-xs font-medium text-slate-800 bg-white min-h-[45px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 font-bold text-xs md:text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedUserForAssign(null);
                  setAssignDirection('');
                  setPreviewOkrTitle('');
                  setPreviewKr1('');
                  setPreviewKr2('');
                  setPreviewKr3('');
                  setPreviewKpi1Name('');
                  setPreviewKpi2Name('');
                  setPreviewKpi3Name('');
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isGenerating || (!previewOkrTitle && !previewKpi1Name)}
                onClick={() => {
                  if (!previewOkrTitle) {
                    showToast("Vui lòng tự sinh dữ liệu mục tiêu OKR trước khi phê duyệt!");
                    return;
                  }
                  const totalWeight = previewKpi1Weight + previewKpi2Weight + previewKpi3Weight;
                  if (totalWeight !== 100) {
                    showToast(`Tổng trọng số KPI là ${totalWeight}%. Yêu cầu tổng phải bằng chính xác 100%!`);
                    return;
                  }

                  // Build OKR & KPI list
                  const generatedOkrs: OKR[] = [
                    {
                      id: `okr-assign-${Date.now()}`,
                      title: previewOkrTitle,
                      kr1: previewKr1,
                      kr1Progress: 0,
                      kr2: previewKr2,
                      kr2Progress: 0,
                      kr3: previewKr3,
                      kr3Progress: 0
                    }
                  ];

                  const generatedKpis: KPI[] = [
                    { criterion: previewKpi1Name, weight: previewKpi1Weight, desc: previewKpi1Desc, value: 0 },
                    { criterion: previewKpi2Name, weight: previewKpi2Weight, desc: previewKpi2Desc, value: 0 },
                    { criterion: previewKpi3Name, weight: previewKpi3Weight, desc: previewKpi3Desc, value: 0 }
                  ];

                  handleAssignOkrKpis(selectedUserForAssign.id, generatedOkrs, generatedKpis);
                  setIsAssignModalOpen(false);
                  setSelectedUserForAssign(null);
                  setAssignDirection('');
                  setPreviewOkrTitle('');
                  setPreviewKr1('');
                  setPreviewKr2('');
                  setPreviewKr3('');
                  setPreviewKpi1Name('');
                  setPreviewKpi2Name('');
                  setPreviewKpi3Name('');
                }}
                className="bg-rose-800 hover:bg-rose-900 text-white px-5 py-2.5 rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 text-white" /> Phê duyệt & Giao việc chính thức
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div 
          className="fixed bottom-4 right-4 bg-slate-950 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2.5 z-50 animate-fade-in"
          id="toast-popup"
        >
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
