import React, { useState, useEffect } from 'react';
import { Bell, Calendar, MessageSquare, Info, ShieldAlert, Award, Star, BookOpen, Database, CloudUpload, RefreshCw, AlertCircle, Copy, Check, Settings, UserCog, Clock } from 'lucide-react';
import { User, OKR, KPI, Notification, SystemSettings, ScheduleItem } from './types';
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

import { 
  checkSupabaseConnection, 
  loadAllDataFromSupabase, 
  saveUserToSupabase, 
  deleteUserFromSupabase, 
  saveOkrToSupabase, 
  deleteOkrFromSupabase, 
  saveUserKpisToSupabase, 
  saveSettingsToSupabase,
  seedSupabaseInitialData,
  SQL_MIGRATION_SCRIPT
} from './supabaseClient';

export default function App() {
  // State đăng nhập
  const [currentUser, setCurrentUser] = useState<User | 'admin' | null>(null);

  // States dữ liệu hệ thống (Lưu & Tải từ Local Storage)
  const [users, setUsers] = useState<User[]>([]);
  const [allOkrs, setAllOkrs] = useState<Record<string, OKR[]>>({});
  const [allKpis, setAllKpis] = useState<Record<string, KPI[]>>({});
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE_ITEMS);

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

  // 1. Tải dữ liệu từ Supabase hoặc Local Storage khi khởi chạy
  useEffect(() => {
    async function initSupabase() {
      setSupabaseStatus('connecting');
      try {
        const conn = await checkSupabaseConnection();
        if (!conn.connected) {
          setSupabaseStatus('error');
          setSupabaseErrorMsg(conn.error || 'Không thể kết nối đến máy chủ Supabase.');
          loadLocalData();
        } else if (!conn.tablesExist) {
          setSupabaseStatus('no-tables');
          setSupabaseErrorMsg('Chưa khởi tạo cấu trúc bảng trên Supabase.');
          loadLocalData();
        } else {
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
            
            setSupabaseStatus('connected');
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
        }
      } catch (err: any) {
        console.error('Connection error:', err);
        setSupabaseStatus('error');
        setSupabaseErrorMsg(err.message || 'Lỗi kết nối máy chủ Supabase.');
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

      if (cachedUsers) setUsers(JSON.parse(cachedUsers));
      else {
        setUsers(INITIAL_USERS);
        localStorage.setItem('thcs_hp_users', JSON.stringify(INITIAL_USERS));
      }

      if (cachedOkrs) setAllOkrs(JSON.parse(cachedOkrs));
      else {
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
      await seedSupabaseInitialData(users, allOkrs, allKpis, settings);
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
    setActiveTab('tab-main');
    
    const userName = user === 'admin' ? 'Nghiêm Hồng Quân (Super Admin)' : user.name;
    showToast(`Chào mừng ${userName} quay trở lại hệ thống!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Đã đăng xuất tài khoản cá nhân an toàn!');
  };

  // 4. Logic chuyển đổi Simulator nhanh trên thanh Header
  const handleSwitchSimulatedUser = (userId: string | 'admin') => {
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

  // Lấy ID cán bộ hiện tại đang làm việc
  const activeUserId = currentUser === 'admin' ? 'THCS-HP-012' : (currentUser?.id || 'THCS-HP-012');
  const isBghOrAdmin = currentUser === 'admin' || (currentUser && currentUser !== 'admin' && currentUser.type === 'BGH');

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

  // 7. Thêm/Sửa/Xóa Nhân sự (Chỉ admin hoặc Super Admin được quyền)
  const handleAddUser = async (newUserData: Omit<User, 'avatar' | 'email'>) => {
    // Generate initials for avatar
    const nameParts = newUserData.name.split(' ');
    const lastWord = nameParts[nameParts.length - 1] || 'U';
    const avatar = lastWord.substring(0, 2).toUpperCase();
    const email = `${newUserData.name.toLowerCase().replace(/\s+/g, '')}@thcshoaphu.edu.vn`;

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

    const defaultKpis = [
      { criterion: "1. Khối lượng & Tiến độ", weight: 30, desc: "Hoàn thành các đầu việc được giao đúng kế hoạch tuần.", value: 80 },
      { criterion: "2. Chất lượng công việc", weight: 30, desc: "Báo cáo chính xác, nghiệp vụ chuyên môn đạt chuẩn thanh tra.", value: 85 },
      { criterion: "3. Hồ sơ & Sổ sách sổ điểm", weight: 20, desc: "Sắp xếp, đồng bộ hóa hồ sơ điện tử ngăn nắp đúng hạn.", value: 75 },
      { criterion: "4. Kỷ luật & Trách nhiệm", weight: 20, desc: "Đạo đức nhà giáo gương mẫu, tuân thủ giờ giấc hành chính.", value: 90 }
    ];

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
      setCurrentUser(found);
      setActiveTab('tab-main');
      showToast(`Đang hiển thị mục tiêu OKR và điểm KPI của: ${found.name}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 8. Chỉnh sửa hồ sơ cá nhân hiện tại
  const handleUpdateProfile = async (updatedProfile: Partial<User>) => {
    if (currentUser === 'admin') {
      showToast('Đã cập nhật thông tin cá nhân của Super Admin!');
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
    if (currentUser === 'admin') {
      showToast('Không thể xóa tài khoản Quản trị hệ thống (Super Admin)!');
      return;
    }
    if (currentUser) {
      const targetId = currentUser.id;
      await handleDeleteUser(targetId);
      setCurrentUser(null);
      showToast('Đã xóa vĩnh viễn tài khoản cá nhân ra khỏi cơ sở dữ liệu trường!');
    }
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
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col antialiased relative">
      
      {/* 1. HEADER BANNER WITH SIMULATOR & LOGOUT */}
      <Header 
        currentUser={currentUser} 
        users={users} 
        onSwitchSimulatedUser={handleSwitchSimulatedUser} 
        onLogout={handleLogout} 
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
            </div>
          </div>
          <div className="py-2 px-3 text-xs text-blue-200 flex items-center flex-wrap gap-3">
            <span className="hidden sm:inline bg-blue-900/50 px-2.5 py-1 rounded border border-blue-800 text-[10px] uppercase font-black tracking-wider">
              Học kỳ I / 2026-2027
            </span>
            
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
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          usersCount={users.length}
          activeOkrCount={totalUsersWithOkr}
          totalOkrCount={users.length}
        />

        {/* CENTER COLUMN: MAIN WORKSPACE */}
        <section className="col-span-1 lg:col-span-6 flex flex-col gap-6">
          
          {/* ====== TAB 1: TỔNG QUAN HỆ THỐNG ====== */}
          {activeTab === 'tab-main' && (
            <div className="space-y-6 animate-fade-in">
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

              {/* OKR WORKSPACE SECTION */}
              <OkrSection 
                okrs={activeUserOkrs}
                onAddOkr={handleAddOkr}
                onUpdateOkr={handleUpdateOkr}
                onDeleteOkr={handleDeleteOkr}
              />

              {/* KPI WORKSPACE SECTION */}
              <KpiSection 
                kpis={activeUserKpis}
                onKpiValueChange={handleKpiValueChange}
              />
            </div>
          )}

          {/* ====== TAB 2: QUẢN LÝ TÀI KHOẢN ====== */}
          {activeTab === 'tab-profile' && (
            <ProfileTab 
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onDeleteProfile={handleDeleteProfile}
            />
          )}

          {/* ====== TAB 3: DANH SÁCH NHÂN SỰ ====== */}
          {activeTab === 'tab-users' && (
            <UsersTab 
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onViewEmployee={handleViewEmployee}
              showToast={showToast}
            />
          )}

          {/* ====== TAB 4: TRUNG TÂM XUẤT BẢN BÁO CÁO ====== */}
          {activeTab === 'tab-export' && (
            <ExportTab 
              showToast={showToast} 
              currentUser={currentUser} 
              users={users} 
              allOkrs={allOkrs} 
              allKpis={allKpis} 
            />
          )}

          {/* ====== TAB 5: LIÊN HỆ & TIỆN ÍCH ====== */}
          {activeTab === 'tab-utilities' && (
            <UtilitiesTab />
          )}

          {/* ====== TAB 6: CÀI ĐẶT HỆ THỐNG ====== */}
          {activeTab === 'tab-settings' && (
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
            />
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
                <span className="bg-red-100 text-red-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  {notifications.length} Bản tin
                </span>
              </div>
            </h3>
            <div className="space-y-3 text-xs">
              {notifications.slice(0, 4).map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-2.5 rounded transition border ${
                    notif.type === 'urgent' 
                      ? 'bg-red-50/50 border-red-100 border-l-2 border-l-red-600' 
                      : notif.type === 'info'
                      ? 'bg-blue-50/50 border-blue-100 border-l-2 border-l-blue-600'
                      : 'hover:bg-slate-50 border-slate-100'
                  }`}
                >
                  <p className="font-bold text-slate-800 leading-tight">{notif.title}</p>
                  <span className="text-[10px] text-slate-400 block mt-1 font-medium">{notif.time}</span>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-center py-4 text-xs text-slate-400 italic">Không có thông báo mới.</p>
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
            <p className="mt-1 text-slate-500 font-medium">Địa chỉ: Xã Hòa Xá, Huyện Ứng Hòa, Thành Phố Hà Nội</p>
          </div>
          <div className="text-center md:text-right">
            <p className="font-semibold text-slate-300">Thiết kế và quản trị: <strong>Nghiêm Hồng Quân</strong></p>
            <p className="mt-1 text-slate-500">&copy; 2026 THCS Hòa Phú. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>

      {/* Supabase SQL Migration Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="sql-migration-modal">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-scale-in">
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
                  Bỏ qua và dùng Offline
                </button>
              </div>
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
