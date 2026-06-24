import React, { useState, useEffect } from 'react';
import { Sliders, Save, Check, Bell, Calendar, Plus, Trash2, Edit3, X, Info, Clock, MapPin, Tag } from 'lucide-react';
import { SystemSettings, Notification, ScheduleItem, User } from '../types';

interface SettingsTabProps {
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  notifications: Notification[];
  onSaveNotifications: (notifs: Notification[]) => void;
  scheduleItems: ScheduleItem[];
  onSaveScheduleItems: (items: ScheduleItem[]) => void;
  currentUser: User | 'admin' | null;
  showToast: (msg: string) => void;
  initialSubTab?: 'general' | 'notifications' | 'schedules';
  onSubTabChange?: (subTab: 'general' | 'notifications' | 'schedules') => void;
}

export default function SettingsTab({ 
  settings, 
  onSaveSettings, 
  notifications, 
  onSaveNotifications, 
  scheduleItems, 
  onSaveScheduleItems, 
  currentUser, 
  showToast,
  initialSubTab = 'general',
  onSubTabChange
}: SettingsTabProps) {
  // Authorization check
  const isBghOrAdmin = currentUser === 'admin' || (currentUser && typeof currentUser === 'object' && currentUser.type === 'BGH');

  // Confirmation state for deleting notification & schedule
  const [notifToDelete, setNotifToDelete] = useState<Notification | null>(null);
  const [schedToDelete, setSchedToDelete] = useState<ScheduleItem | null>(null);

  // Active sub tab state
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'notifications' | 'schedules'>(initialSubTab);

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  const handleSubTabClick = (subTab: 'general' | 'notifications' | 'schedules') => {
    setActiveSubTab(subTab);
    if (onSubTabChange) {
      onSubTabChange(subTab);
    }
  };

  // --- SUB-TAB 1: GENERAL SETTINGS ---
  const [marqueeText, setMarqueeText] = useState(settings.marqueeText);
  const [schoolShortName, setSchoolShortName] = useState(settings.schoolShortName);
  const [location, setLocation] = useState(settings.location);
  const [learning, setLearning] = useState(settings.kpiWeights.learning);
  const [method, setMethod] = useState(settings.kpiWeights.method);
  const [responsibility, setResponsibility] = useState(settings.kpiWeights.responsibility);
  const [ethics, setEthics] = useState(settings.kpiWeights.ethics);

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBghOrAdmin) {
      showToast('Bạn không có quyền thay đổi cấu hình hệ thống!');
      return;
    }
    
    if (learning + method + responsibility + ethics !== 100) {
      showToast('Tổng trọng số KPI của 4 nhóm tiêu chí bắt buộc phải bằng 100%!');
      return;
    }

    onSaveSettings({
      marqueeText: marqueeText.trim(),
      schoolShortName: schoolShortName.trim(),
      location: location.trim(),
      kpiWeights: {
        learning,
        method,
        responsibility,
        ethics
      }
    });

    showToast('Đã lưu cấu hình hệ thống toàn trường thành công!');
  };

  // --- SUB-TAB 2: NOTIFICATIONS ADMIN ---
  const [notifId, setNotifId] = useState<string | null>(null);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifTime, setNotifTime] = useState('');
  const [notifType, setNotifType] = useState<'urgent' | 'info' | 'normal'>('normal');
  const [isNotifEditing, setIsNotifEditing] = useState(false);

  const handleSaveNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBghOrAdmin) {
      showToast('Bạn không có quyền quản lý thông báo!');
      return;
    }

    if (!notifTitle.trim() || !notifTime.trim()) {
      showToast('Vui lòng điền đầy đủ tiêu đề và thời gian hiển thị thông báo!');
      return;
    }

    if (isNotifEditing && notifId) {
      // Edit
      const updated = notifications.map(n => 
        n.id === notifId ? { ...n, title: notifTitle.trim(), time: notifTime.trim(), type: notifType } : n
      );
      onSaveNotifications(updated);
      showToast('Cập nhật thông báo thành công!');
    } else {
      // Create
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        title: notifTitle.trim(),
        time: notifTime.trim(),
        type: notifType
      };
      onSaveNotifications([newNotif, ...notifications]);
      showToast('Thêm mới thông báo từ BGH thành công!');
    }

    resetNotifForm();
  };

  const handleEditNotifClick = (n: Notification) => {
    setNotifId(n.id);
    setNotifTitle(n.title);
    setNotifTime(n.time);
    setNotifType(n.type);
    setIsNotifEditing(true);
  };

  const handleDeleteNotifClick = (notif: Notification) => {
    if (!isBghOrAdmin) return;
    setNotifToDelete(notif);
  };

  const confirmDeleteNotif = () => {
    if (notifToDelete) {
      const filtered = notifications.filter(n => n.id !== notifToDelete.id);
      onSaveNotifications(filtered);
      showToast('Đã xóa thông báo thành công!');
      setNotifToDelete(null);
    }
  };

  const resetNotifForm = () => {
    setNotifId(null);
    setNotifTitle('');
    setNotifTime('');
    setNotifType('normal');
    setIsNotifEditing(false);
  };

  // --- SUB-TAB 3: SCHEDULES ADMIN ---
  const [schedId, setSchedId] = useState<string | null>(null);
  const [schedScope, setSchedScope] = useState<'week' | 'month'>('week');
  const [schedTime, setSchedTime] = useState(''); // T2, 15/07
  const [schedTitle, setSchedTitle] = useState('');
  const [schedLocation, setSchedLocation] = useState('');
  const [schedColor, setSchedColor] = useState<'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo'>('blue');
  const [isSchedEditing, setIsSchedEditing] = useState(false);

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBghOrAdmin) {
      showToast('Bạn không có quyền quản lý lịch hoạt động!');
      return;
    }

    if (!schedTime.trim() || !schedTitle.trim() || !schedLocation.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin lịch hoạt động!');
      return;
    }

    if (isSchedEditing && schedId) {
      // Edit
      const updated = scheduleItems.map(s => 
        s.id === schedId 
          ? { ...s, scope: schedScope, time: schedTime.trim(), title: schedTitle.trim(), location: schedLocation.trim(), color: schedColor }
          : s
      );
      onSaveScheduleItems(updated);
      showToast('Cập nhật lịch hoạt động thành công!');
    } else {
      // Create
      const newSched: ScheduleItem = {
        id: `sched-${Date.now()}`,
        scope: schedScope,
        time: schedTime.trim(),
        title: schedTitle.trim(),
        location: schedLocation.trim(),
        color: schedColor
      };
      onSaveScheduleItems([...scheduleItems, newSched]);
      showToast('Thêm mới lịch hoạt động thành công!');
    }

    resetSchedForm();
  };

  const handleEditSchedClick = (s: ScheduleItem) => {
    setSchedId(s.id);
    setSchedScope(s.scope);
    setSchedTime(s.time);
    setSchedTitle(s.title);
    setSchedLocation(s.location);
    setSchedColor(s.color || 'blue');
    setIsSchedEditing(true);
  };

  const handleDeleteSchedClick = (sched: ScheduleItem) => {
    if (!isBghOrAdmin) return;
    setSchedToDelete(sched);
  };

  const confirmDeleteSched = () => {
    if (schedToDelete) {
      const filtered = scheduleItems.filter(s => s.id !== schedToDelete.id);
      onSaveScheduleItems(filtered);
      showToast('Đã xóa lịch hoạt động thành công!');
      setSchedToDelete(null);
    }
  };

  const resetSchedForm = () => {
    setSchedId(null);
    setSchedScope('week');
    setSchedTime('');
    setSchedTitle('');
    setSchedLocation('');
    setSchedColor('blue');
    setIsSchedEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5" id="system-settings-tab">
      <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-900" /> Cấu Hình & Quản Trị Hệ Thống
        </span>
        {!isBghOrAdmin && (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 select-none">
            <Info className="w-3.5 h-3.5 text-amber-600" /> Chế độ xem (Chỉ đọc)
          </span>
        )}
      </h3>

      {/* Sub tabs navigation */}
      <div className="flex border-b border-slate-200 mb-5 text-xs font-bold gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => handleSubTabClick('general')}
          className={`px-4 py-2 rounded-t-lg border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'general'
              ? 'border-blue-900 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Cấu hình chung
        </button>
        <button
          onClick={() => handleSubTabClick('notifications')}
          className={`px-4 py-2 rounded-t-lg border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'border-blue-900 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Thông báo từ BGH
          <span className="bg-red-100 text-red-800 text-[9px] px-1.5 py-0.2 rounded-full font-black">
            {notifications.length}
          </span>
        </button>
        <button
          onClick={() => handleSubTabClick('schedules')}
          className={`px-4 py-2 rounded-t-lg border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'schedules'
              ? 'border-blue-900 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Lịch hoạt động tuần-tháng
          <span className="bg-slate-100 text-slate-800 text-[9px] px-1.5 py-0.2 rounded-full font-black">
            {scheduleItems.length}
          </span>
        </button>
      </div>

      {/* --- SUB-TAB CONTENT 1: GENERAL SETTINGS --- */}
      {activeSubTab === 'general' && (
        <form onSubmit={handleGeneralSubmit} className="space-y-5 text-xs md:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dòng chữ chạy thông báo trường học (Marquee)</label>
            <input 
              type="text" 
              value={marqueeText} 
              disabled={!isBghOrAdmin}
              onChange={(e) => setMarqueeText(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-bold disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tên trường viết tắt / Nhận diện</label>
              <input 
                type="text" 
                value={schoolShortName}
                disabled={!isBghOrAdmin}
                onChange={(e) => setSchoolShortName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Địa bàn / Cơ quan quản lý</label>
              <input 
                type="text" 
                value={location}
                disabled={!isBghOrAdmin}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-600 uppercase mb-3">Cấu hình Trọng số KPI tổng thể Giáo Viên (Tổng phải bằng 100%)</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block text-slate-500 font-bold mb-1">KQ Học Tập (%)</span>
                <input 
                  type="number" 
                  value={learning}
                  disabled={!isBghOrAdmin}
                  onChange={(e) => setLearning(parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-1.5 font-black text-blue-900 text-sm disabled:bg-slate-100"
                />
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block text-slate-500 font-bold mb-1">PP Giảng Dạy (%)</span>
                <input 
                  type="number" 
                  value={method}
                  disabled={!isBghOrAdmin}
                  onChange={(e) => setMethod(parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-1.5 font-black text-blue-900 text-sm disabled:bg-slate-100"
                />
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block text-slate-500 font-bold mb-1">Trách Nhiệm (%)</span>
                <input 
                  type="number" 
                  value={responsibility}
                  disabled={!isBghOrAdmin}
                  onChange={(e) => setResponsibility(parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-1.5 font-black text-blue-900 text-sm disabled:bg-slate-100"
                />
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block text-slate-500 font-bold mb-1">Đạo Đức (%)</span>
                <input 
                  type="number" 
                  value={ethics}
                  disabled={!isBghOrAdmin}
                  onChange={(e) => setEthics(parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-1.5 font-black text-blue-900 text-sm disabled:bg-slate-100"
                />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
              <span>Hiện tại: {learning + method + responsibility + ethics}% / 100%</span>
              {learning + method + responsibility + ethics === 100 ? (
                <span className="text-emerald-600 font-bold flex items-center gap-0.5"><Check className="w-3.5 h-3.5" /> Trọng số hợp lệ</span>
              ) : (
                <span className="text-red-600 font-bold">Vui lòng điều chỉnh lại cho đúng 100%!</span>
              )}
            </div>
          </div>

          {isBghOrAdmin && (
            <div className="mt-6 flex justify-end font-bold">
              <button 
                type="submit" 
                className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" /> Lưu cấu hình hệ thống
              </button>
            </div>
          )}
        </form>
      )}

      {/* --- SUB-TAB CONTENT 2: NOTIFICATIONS ADMIN --- */}
      {activeSubTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Admin Form Column */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 self-start">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 border-b pb-2 mb-3 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-red-700" />
              {isNotifEditing ? 'Sửa Thông Báo' : 'Đăng Thông Báo Mới'}
            </h4>
            
            {isBghOrAdmin ? (
              <form onSubmit={handleSaveNotification} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Nội dung thông báo</label>
                  <textarea
                    rows={3}
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-bold"
                    placeholder="Ví dụ: Hạn chót phê duyệt OKR Học kỳ I"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Thời gian hiển thị</label>
                    <input
                      type="text"
                      value={notifTime}
                      onChange={(e) => setNotifTime(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
                      placeholder="Ví dụ: Hạn trước ngày 15/07"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Mức độ khẩn cấp</label>
                    <select
                      value={notifType}
                      onChange={(e) => setNotifType(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none bg-white font-bold"
                    >
                      <option value="normal">Thông thường (Normal)</option>
                      <option value="info">Thông tin (Info)</option>
                      <option value="urgent">Khẩn cấp (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  {isNotifEditing && (
                    <button
                      type="button"
                      onClick={resetNotifForm}
                      className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition text-[11px]"
                    >
                      Hủy
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 transition text-[11px]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isNotifEditing ? 'Cập nhật' : 'Đăng thông báo'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">
                Chỉ thành viên Ban Giám Hiệu mới có quyền tạo và chỉnh sửa thông báo.
              </p>
            )}
          </div>

          {/* List Display Column */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 border-b pb-2 flex items-center justify-between">
              <span>Danh sách thông báo hiện hữu</span>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Tổng cộng: {notifications.length}
              </span>
            </h4>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-3 rounded-lg border flex items-start justify-between gap-3 text-xs transition hover:shadow-sm ${
                    n.type === 'urgent' 
                      ? 'bg-red-50/50 border-red-200' 
                      : n.type === 'info' 
                      ? 'bg-blue-50/50 border-blue-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                        n.type === 'urgent' 
                          ? 'bg-red-100 text-red-800' 
                          : n.type === 'info' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {n.type === 'urgent' ? 'Khẩn cấp' : n.type === 'info' ? 'Chỉ dẫn' : 'Thường'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {n.time}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 leading-snug">{n.title}</p>
                  </div>

                  {isBghOrAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEditNotifClick(n)}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Chỉnh sửa thông báo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotifClick(n)}
                        className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {notifications.length === 0 && (
                <p className="text-center py-8 text-xs text-slate-400 italic">
                  Chưa có thông báo nào được lưu trữ.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SUB-TAB CONTENT 3: SCHEDULES ADMIN --- */}
      {activeSubTab === 'schedules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Admin Form Column */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 self-start">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 border-b pb-2 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-900" />
              {isSchedEditing ? 'Chỉnh Sửa Lịch Hoạt Động' : 'Thêm Lịch Hoạt Động Mới'}
            </h4>
            
            {isBghOrAdmin ? (
              <form onSubmit={handleSaveSchedule} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Phạm vi lịch</label>
                    <select
                      value={schedScope}
                      onChange={(e) => {
                        setSchedScope(e.target.value as any);
                        setSchedTime(e.target.value === 'week' ? 'T2' : '');
                      }}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none bg-white font-bold"
                    >
                      <option value="week">Lịch Tuần này</option>
                      <option value="month">Lịch Tháng này</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Thời gian</label>
                    {schedScope === 'week' ? (
                      <select
                        value={schedTime}
                        onChange={(e) => setSchedTime(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none bg-white font-bold"
                      >
                        <option value="T2">Thứ 2 (T2)</option>
                        <option value="T3">Thứ 3 (T3)</option>
                        <option value="T4">Thứ 4 (T4)</option>
                        <option value="T5">Thứ 5 (T5)</option>
                        <option value="T6">Thứ 6 (T6)</option>
                        <option value="T7">Thứ 7 (T7)</option>
                        <option value="CN">Chủ Nhật (CN)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={schedTime}
                        onChange={(e) => setSchedTime(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-bold"
                        placeholder="Ví dụ: 15/07"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Tên hoạt động</label>
                  <input
                    type="text"
                    value={schedTitle}
                    onChange={(e) => setSchedTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-bold"
                    placeholder="Ví dụ: Chào cờ & Giao ban đầu tuần"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Địa điểm / Chi tiết</label>
                    <input
                      type="text"
                      value={schedLocation}
                      onChange={(e) => setSchedLocation(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-bold"
                      placeholder="Ví dụ: Sân trường"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Màu sắc thể hiện</label>
                    <select
                      value={schedColor}
                      onChange={(e) => setSchedColor(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none bg-white font-bold"
                    >
                      <option value="blue">Xanh dương (Blue)</option>
                      <option value="emerald">Xanh lục (Emerald)</option>
                      <option value="purple">Tím (Purple)</option>
                      <option value="amber">Vàng hổ phách (Amber)</option>
                      <option value="rose">Hồng đào (Rose)</option>
                      <option value="indigo">Chàm (Indigo)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  {isSchedEditing && (
                    <button
                      type="button"
                      onClick={resetSchedForm}
                      className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition text-[11px]"
                    >
                      Hủy
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 transition text-[11px]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSchedEditing ? 'Cập nhật' : 'Lưu hoạt động'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-4">
                Chỉ thành viên Ban Giám Hiệu mới có quyền tạo và chỉnh sửa lịch hoạt động.
              </p>
            )}
          </div>

          {/* List Display Column */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 border-b pb-2 flex items-center justify-between">
              <span>Danh mục lịch hoạt động hiện tại</span>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Tổng số: {scheduleItems.length}
              </span>
            </h4>

            {/* Sub Filter tabs for schedule items list viewing */}
            <div className="flex gap-4 text-xs font-bold border-b border-slate-100 pb-2">
              <span className="text-slate-400">Xem theo:</span>
              <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-100">Lịch tuần ({scheduleItems.filter(s => s.scope === 'week').length})</span>
              <span className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded border border-purple-100">Lịch tháng ({scheduleItems.filter(s => s.scope === 'month').length})</span>
            </div>

            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {/* Render Schedule Items grouped by Week and Month */}
              {['week', 'month'].map((scope) => {
                const items = scheduleItems.filter(s => s.scope === scope);
                return (
                  <div key={scope} className="space-y-2">
                    <h5 className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 pl-1">
                      {scope === 'week' ? '📅 LỊCH HOẠT ĐỘNG TRONG TUẦN' : '📆 LỊCH HOẠT ĐỘNG TRONG THÁNG'}
                    </h5>
                    
                    {items.map((s) => {
                      // Get custom CSS classes based on color configuration
                      const colorMap = {
                        blue: 'bg-blue-50 hover:bg-blue-100/70 border-blue-200 text-blue-900 badge-blue',
                        emerald: 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200 text-emerald-900 badge-emerald',
                        purple: 'bg-purple-50 hover:bg-purple-100/70 border-purple-200 text-purple-900 badge-purple',
                        amber: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200 text-amber-900 badge-amber',
                        rose: 'bg-rose-50 hover:bg-rose-100/70 border-rose-200 text-rose-900 badge-rose',
                        indigo: 'bg-indigo-50 hover:bg-indigo-100/70 border-indigo-200 text-indigo-900 badge-indigo',
                      };
                      const colorClass = colorMap[s.color || 'blue'] || colorMap.blue;

                      return (
                        <div 
                          key={s.id} 
                          className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs transition ${colorClass}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="font-extrabold text-center px-2 py-1 rounded text-[10px] min-w-[36px] bg-white border shrink-0 shadow-sm">
                              {s.time}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-800 leading-tight truncate">{s.title}</p>
                              <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{s.location}</span>
                              </span>
                            </div>
                          </div>

                          {isBghOrAdmin && (
                            <div className="flex gap-0.5 shrink-0 bg-white/60 p-0.5 rounded border border-slate-100 shadow-sm">
                              <button
                                onClick={() => handleEditSchedClick(s)}
                                className="p-1 text-slate-500 hover:text-blue-600 rounded transition"
                                title="Chỉnh sửa hoạt động"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedClick(s)}
                                className="p-1 text-slate-500 hover:text-red-600 rounded transition"
                                title="Xóa hoạt động"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {items.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic pl-1 pb-2">
                        Chưa thiết lập hoạt động nào cho mục này.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: XÁC NHẬN XÓA THÔNG BÁO BGH ====== */}
      {notifToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" id="confirm-delete-notif-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6">
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h4 className="font-extrabold text-slate-900 text-base">Xóa thông báo</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa thông báo này không?
              <span className="block mt-2 p-2 bg-slate-50 border border-slate-100 rounded text-slate-800 font-bold italic">
                "{notifToDelete.title}"
              </span>
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setNotifToDelete(null)}
                className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                id="btn-cancel-delete-notif"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteNotif}
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                id="btn-confirm-delete-notif"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: XÁC NHẬN XÓA LỊCH HOẠT ĐỘNG ====== */}
      {schedToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" id="confirm-delete-sched-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6">
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h4 className="font-extrabold text-slate-900 text-base">Xóa lịch hoạt động</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa lịch hoạt động này không?
              <span className="block mt-2 p-2 bg-slate-50 border border-slate-100 rounded text-slate-800 font-bold italic">
                "{schedToDelete.title}" ({schedToDelete.time})
              </span>
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSchedToDelete(null)}
                className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                id="btn-cancel-delete-sched"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteSched}
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                id="btn-confirm-delete-sched"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
