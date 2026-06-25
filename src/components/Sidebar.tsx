import React from 'react';
import { LayoutDashboard, User, Users, Printer, HelpCircle, Settings, Award, ChevronRight, Bell } from 'lucide-react';
import { User as UserType, Notification } from '../types';

interface SidebarProps {
  currentUser: UserType | 'admin';
  activeTab: string;
  onTabChange: (tabId: string) => void;
  usersCount: number;
  activeOkrCount: number;
  totalOkrCount: number;
  notifications: Notification[];
}

export default function Sidebar({ 
  currentUser, 
  activeTab, 
  onTabChange, 
  usersCount,
  activeOkrCount,
  totalOkrCount,
  notifications = []
}: SidebarProps) {
  // Profile info
  const name = currentUser === 'admin' ? 'Nghiêm Hồng Quân' : currentUser.name;
  const role = currentUser === 'admin' ? 'Giáo viên - Super Admin' : currentUser.role;
  const avatar = currentUser === 'admin' ? 'HQ' : currentUser.avatar;

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'tab-main', label: 'Trang chủ: Tổng quan', icon: LayoutDashboard, badge: null },
    { id: 'tab-profile', label: 'Quản lý tài khoản', icon: User, badge: null },
    { id: 'tab-notifications', label: 'Bản tin & Thông báo', icon: Bell, badge: unreadCount > 0 ? unreadCount : null, isNotification: true },
    ...(currentUser === 'admin' ? [{ id: 'tab-users', label: 'BGH/Giáo viên/Nhân viên', icon: Users, badge: usersCount }] : []),
    { id: 'tab-export', label: 'In ấn & Xuất file Word/PDF', icon: Printer, badge: null },
    { id: 'tab-utilities', label: 'Liên hệ & Tiện ích', icon: HelpCircle, badge: null },
    { id: 'tab-settings', label: 'Cài đặt hệ thống', icon: Settings, badge: null },
  ];

  return (
    <aside className="col-span-1 lg:col-span-3 flex flex-col gap-4" id="sidebar-aside">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-4">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-800 font-bold text-lg shrink-0 overflow-hidden">
            {avatar && (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('/')) ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              avatar
            )}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-slate-900 leading-tight truncate">{name}</h3>
            <p className="text-xs text-slate-500 font-medium truncate">{role}</p>
          </div>
        </div>

        {/* Vertical Menu List */}
        <ul className="space-y-1.5 text-sm">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition cursor-pointer ${
                    isActive 
                      ? 'text-blue-900 bg-blue-50 font-bold' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-900' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== null ? (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                      item.isNotification 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Quick Stats Card */}
      <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-xl shadow-sm p-4">
        <h4 className="font-bold text-xs mb-2 border-b border-white/20 pb-1.5 text-yellow-400 uppercase tracking-wider flex items-center gap-1">
          <Award className="w-4 h-4" /> Tổng kết THCS Hòa Phú
        </h4>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-white/10 rounded p-2 border border-white/5">
            <span className="block text-xl font-extrabold text-white">94%</span>
            <span className="text-[10px] text-blue-200 uppercase font-semibold">Đạt KPI</span>
          </div>
          <div className="bg-white/10 rounded p-2 border border-white/5">
            <span className="block text-xl font-extrabold text-yellow-400">
              {activeOkrCount}/{totalOkrCount}
            </span>
            <span className="text-[10px] text-blue-200 uppercase font-semibold">Có OKR</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
