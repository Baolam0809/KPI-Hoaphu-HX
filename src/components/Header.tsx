import React from 'react';
import { UserCog, LogOut, ShieldAlert } from 'lucide-react';
import { User, SystemSettings } from '../types';

interface HeaderProps {
  currentUser: User | 'admin';
  users: User[];
  onSwitchSimulatedUser: (userId: string | 'admin') => void;
  onLogout: () => void;
  settings: SystemSettings;
}

export default function Header({ currentUser, users, onSwitchSimulatedUser, onLogout, settings }: HeaderProps) {
  // Trích xuất tên hiển thị
  const adminUser = currentUser === 'admin' ? users.find(u => u.id === 'THCS-HP-020') : null;
  const displayName = currentUser === 'admin' ? (adminUser?.name ? `${adminUser.name} (Super Admin)` : 'Nghiêm Hồng Quân (Super Admin)') : currentUser.name;
  const displayRole = currentUser === 'admin' ? 'Chủ tài khoản hệ thống' : currentUser.role;

  return (
    <header 
      className="bg-gradient-to-r from-blue-900 via-slate-900 to-red-800 text-white relative shadow-md overflow-hidden" 
      id="app-header"
      style={settings.navbarBannerUrl ? {
        backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.75)), url("${settings.navbarBannerUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
          {/* Fallback-friendly SVG School Logo */}
          <div className="bg-white p-2 rounded-full shadow-lg border-2 border-yellow-400">
            <svg className="w-12 h-12 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
              <path d="M20 12.38v4.54c-.6.28-1 .89-1 1.58c0 .97.78 1.75 1.75 1.75c.34 0 .66-.1.93-.27C21.94 19.43 22 18.73 22 18v-4.5l-2-1.12zM5 13.18v4l7 3.82l7-3.82v-4L12 17l-7-3.82z" fill="#b91c1c"/>
            </svg>
          </div>
          <div>
            {settings.textLogoUrl ? (
              <img 
                src={settings.textLogoUrl} 
                alt={settings.schoolShortName} 
                className="h-10 md:h-12 object-contain drop-shadow-md select-none rounded bg-white/10 p-1" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <h1 className="text-xl md:text-2xl font-black tracking-wide drop-shadow-md text-yellow-400">
                {settings.schoolShortName.toUpperCase()}
              </h1>
            )}
            <p className="text-xs md:text-sm text-blue-200 uppercase tracking-widest font-bold mt-1">Hệ Thống Đánh Giá & Phát Triển OKR - KPI Giáo Dục</p>
          </div>
        </div>
        
        {/* Admin/Logout info - Simulator moved next to Admin Quản Trị */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* User Profile & Logout Box */}
          <div className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-lg border border-white/10 w-full sm:w-auto gap-3">
            <div className="text-right text-xs">
              <p className="font-extrabold text-white leading-tight flex items-center justify-end gap-1">
                {currentUser === 'admin' && <ShieldAlert className="w-3 h-3 text-red-500 inline" />}
                {displayName}
              </p>
              <p className="text-[10px] text-slate-300 font-medium">{displayRole}</p>
            </div>
            
            <button
              onClick={onLogout}
              className="bg-red-700 hover:bg-red-800 text-white p-2 rounded-md transition-all cursor-pointer shadow-sm flex items-center gap-1 font-bold text-xs"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
