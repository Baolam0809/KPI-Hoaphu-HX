import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Plus, Clock, AlertCircle, Info, ShieldAlert, CheckCircle2, Circle, Search } from 'lucide-react';
import { Notification, User } from '../types';

interface NotificationsTabProps {
  notifications: Notification[];
  onSaveNotifications: (newNotifs: Notification[]) => void;
  currentUser: User | 'admin' | null;
  showToast?: (msg: string) => void;
  users?: User[];
}

export default function NotificationsTab({
  notifications = [],
  onSaveNotifications,
  currentUser,
  showToast,
  users = []
}: NotificationsTabProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read' | 'urgent'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Post form state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifTime, setNotifTime] = useState('');
  const [notifType, setNotifType] = useState<'urgent' | 'info' | 'normal'>('normal');

  const isBghOrAdmin = currentUser === 'admin' || (currentUser && currentUser.type === 'BGH');

  // Counts
  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  // Handlers
  const handleToggleRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: !n.read } : n
    );
    onSaveNotifications(updated);
    
    const target = notifications.find(n => n.id === id);
    if (target && showToast) {
      showToast(`Đã đánh dấu "${target.title}" là ${!target.read ? 'đã đọc' : 'chưa đọc'}`);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      if (showToast) showToast('Tất cả thông báo đều đã được đọc');
      return;
    }
    const updated = notifications.map(n => ({ ...n, read: true }));
    onSaveNotifications(updated);
    if (showToast) showToast('Đã đánh dấu tất cả thông báo là đã đọc');
  };

  const handleDeleteNotif = (id: string) => {
    const target = notifications.find(n => n.id === id);
    const filtered = notifications.filter(n => n.id !== id);
    onSaveNotifications(filtered);
    if (showToast && target) {
      showToast(`Đã xóa thông báo "${target.title}"`);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ thông báo hệ thống không?')) {
      onSaveNotifications([]);
      if (showToast) showToast('Đã xóa sạch tất cả thông báo');
    }
  };

  const handleAddNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim()) {
      if (showToast) showToast('Nội dung thông báo không được để trống!');
      return;
    }

    const timeString = notifTime.trim() || `Đăng lúc: ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày ${new Date().toLocaleDateString('vi-VN')}`;
    
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: notifTitle.trim(),
      time: timeString,
      type: notifType,
      read: false
    };

    onSaveNotifications([newNotif, ...notifications]);
    setNotifTitle('');
    setNotifTime('');
    setNotifType('normal');

    if (showToast) showToast('Đăng thông báo mới thành công!');
  };

  const currentUserId = currentUser === 'admin' ? 'THCS-HP-020' : (currentUser ? currentUser.id : null);
  const isBgh = currentUser === 'admin' || (currentUser && currentUser.type === 'BGH');

  // Filtered list
  const filteredNotifications = notifications.filter(n => {
    // 0. User specific targeting filter
    if (n.targetUserId) {
      if (!isBgh && n.targetUserId !== currentUserId) {
        return false;
      }
    }

    // 1. Text filter
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (n.content && n.content.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    // 2. Category filter
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'read') return !!n.read;
    if (activeFilter === 'urgent') return n.type === 'urgent';
    return true; // 'all'
  });

  return (
    <div className="space-y-6 animate-fade-in" id="notifications-center-tab">
      
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 rounded-2xl shadow-md border border-blue-800 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
            <Bell className="w-5.5 h-5.5 text-yellow-400 animate-bounce" />
            Hệ Thống Bản Tin & Thông Báo BGH
          </h2>
          <p className="text-xs text-blue-200">
            Cập nhật chỉ thị, thông báo nghiệp vụ và lịch điều phối khẩn từ Ban giám hiệu trường THCS Hòa Phú.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleMarkAllAsRead}
            className="bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Đánh dấu tất cả bản tin là đã đọc"
          >
            <CheckCheck className="w-4 h-4 text-green-400" />
            Đọc tất cả ({unreadCount})
          </button>
          
          {isBghOrAdmin && notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-red-950/45 hover:bg-red-900/60 border border-red-800/40 px-3 py-1.5 rounded-lg text-xs font-bold text-red-200 transition flex items-center gap-1 cursor-pointer"
              title="Xóa toàn bộ bản tin"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa sạch
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: ADMIN POST FORM */}
        {isBghOrAdmin && (
          <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-xl p-4 self-start space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Plus className="w-4 h-4 text-blue-900" />
                Đăng tin khẩn / chỉ thị
              </h3>
              <p className="text-[10px] text-slate-400">Chỉ có vai trò Ban Giám Hiệu hoặc Admin tối cao mới có quyền đăng.</p>
            </div>

            <form onSubmit={handleAddNotification} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">Nội dung thông báo / Bản tin</label>
                <textarea
                  rows={3}
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none font-bold"
                  placeholder="Nhập nội dung thông báo... (Ví dụ: Đăng ký sáng kiến kinh nghiệm Học kỳ I)"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">Thời gian / Ghi chú hạn chót</label>
                <input
                  type="text"
                  value={notifTime}
                  onChange={(e) => setNotifTime(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
                  placeholder="Bỏ trống để tự động điền thời gian hiện tại"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">Độ ưu tiên hiển thị</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none bg-white font-bold cursor-pointer"
                >
                  <option value="normal">🔔 Thường (Normal)</option>
                  <option value="info">ℹ️ Hướng dẫn / Tin tức (Info)</option>
                  <option value="urgent">🚨 Khẩn cấp / Quan trọng (Urgent)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-950 text-white font-extrabold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition text-[11px] shadow-sm uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Đăng lên bảng tin
              </button>
            </form>
          </div>
        )}

        {/* RIGHT COMPONENT: INTERACTIVE FILTERED LIST */}
        <div className={`${isBghOrAdmin ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
          
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Filter Tabs */}
            <div className="flex border border-slate-200 p-1 rounded-lg text-xs font-bold bg-slate-50 self-start">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  activeFilter === 'all' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter('unread')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 cursor-pointer ${
                  activeFilter === 'unread' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Chưa đọc
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveFilter('read')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  activeFilter === 'read' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đã đọc ({readCount})
              </button>
              <button
                onClick={() => setActiveFilter('urgent')}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  activeFilter === 'urgent' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Khẩn cấp
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs self-stretch sm:self-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nội dung thông báo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-400 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:ring-1 focus:ring-blue-400 focus:outline-none transition font-medium"
              />
            </div>
          </div>

          {/* Actual List */}
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div
                  key={notif.id}
                  className={`bg-white p-4 rounded-xl border transition shadow-xs hover:shadow-md flex items-start gap-3.5 relative overflow-hidden group ${
                    isUnread 
                      ? 'border-blue-300 ring-1 ring-blue-100' 
                      : 'border-slate-200 opacity-80'
                  }`}
                >
                  {/* Sidebar Border accent based on type */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    notif.type === 'urgent' 
                      ? 'bg-red-500' 
                      : notif.type === 'info' 
                      ? 'bg-blue-500' 
                      : 'bg-slate-400'
                  }`} />

                  {/* Read State Toggle Circle */}
                  <button
                    onClick={() => handleToggleRead(notif.id)}
                    className="mt-0.5 text-slate-300 hover:text-blue-600 transition shrink-0 cursor-pointer"
                    title={isUnread ? "Đánh dấu là đã đọc" : "Đánh dấu là chưa đọc"}
                  >
                    {isUnread ? (
                      <Circle className="w-5 h-5 text-blue-500 fill-blue-50 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-slate-400 fill-slate-50" />
                    )}
                  </button>

                  {/* Content Block */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${
                        notif.type === 'urgent' 
                          ? 'bg-red-100 text-red-800' 
                          : notif.type === 'info' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {notif.type === 'urgent' ? 'Khẩn cấp' : notif.type === 'info' ? 'Chỉ dẫn' : 'Thường'}
                      </span>
                      
                      {notif.targetUserId && isBgh && (
                        <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
                          👤 Nhận: {users.find(u => u.id === notif.targetUserId)?.name || notif.targetUserId}
                        </span>
                      )}
                      
                      {isUnread && (
                        <span className="bg-red-500 text-white font-black text-[8px] uppercase px-1.5 py-0.5 rounded animate-pulse">
                          Mới
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 ml-auto">
                        <Clock className="w-3 h-3" /> {notif.time}
                      </span>
                    </div>

                    <p className={`text-xs sm:text-sm font-extrabold leading-snug break-words ${
                      isUnread ? 'text-slate-900 font-black' : 'text-slate-600 line-through decoration-slate-300'
                    }`}>
                      {notif.title}
                    </p>
                    {notif.content && (
                      <div className="mt-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap leading-relaxed font-medium">
                        {notif.content}
                      </div>
                    )}
                  </div>

                  {/* Individual Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleToggleRead(notif.id)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer text-xs flex items-center justify-center ${
                        isUnread 
                          ? 'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100' 
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                      }`}
                      title={isUnread ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    
                    {isBghOrAdmin && (
                      <button
                        onClick={() => handleDeleteNotif(notif.id)}
                        className="p-1.5 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-100 text-red-600 hover:text-red-700 transition cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-12 px-4 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2.5" />
                <p className="text-xs text-slate-500 font-bold italic">Không tìm thấy thông báo nào phù hợp bộ lọc.</p>
                <button
                  onClick={() => { setActiveFilter('all'); setSearchTerm(''); }}
                  className="mt-3 text-[11px] font-extrabold text-blue-900 hover:underline cursor-pointer"
                >
                  Thiết lập lại bộ lọc
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
