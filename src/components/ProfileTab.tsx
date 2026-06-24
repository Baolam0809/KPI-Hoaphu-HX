import React, { useState } from 'react';
import { UserCog, Edit, Trash2, Check, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';

interface ProfileTabProps {
  currentUser: User | 'admin';
  onUpdateProfile: (updatedProfile: Partial<User>) => void;
  onDeleteProfile: () => void;
}

export default function ProfileTab({ currentUser, onUpdateProfile, onDeleteProfile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [name, setName] = useState(currentUser === 'admin' ? 'Nghiêm Hồng Quân' : currentUser.name);
  const [email, setEmail] = useState(currentUser === 'admin' ? 'nghiemhongquan@thcshoaphu.edu.vn' : currentUser.email);
  const [bio, setBio] = useState(currentUser === 'admin' ? 'Tận tụy vì học sinh thân yêu, quyết tâm số hóa thành công các quy trình quản lý của trường THCS Hòa Phú.' : currentUser.bio);
  const [password, setPassword] = useState(currentUser === 'admin' ? 'Admin@HP2026' : (currentUser.password || ''));

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel changes and reset
      setName(currentUser === 'admin' ? 'Nghiêm Hồng Quân' : currentUser.name);
      setEmail(currentUser === 'admin' ? 'nghiemhongquan@thcshoaphu.edu.vn' : currentUser.email);
      setBio(currentUser === 'admin' ? 'Tận tụy vì học sinh thân yêu, quyết tâm số hóa thành công các quy trình quản lý của trường THCS Hòa Phú.' : currentUser.bio);
      setPassword(currentUser === 'admin' ? 'Admin@HP2026' : (currentUser.password || ''));
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onUpdateProfile({
      name: name.trim(),
      email: email.trim(),
      bio: bio.trim(),
      password: password.trim()
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    onDeleteProfile();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative" id="profile-tab-section">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-blue-900" /> Quản Lý Tài Khoản Cá Nhân
        </h3>
        
        {/* Buttons integrated right in the top right (as pointed out in the screenshot) */}
        <div className="flex items-center gap-2" id="profile-actions-wrapper">
          <button 
            onClick={handleEditToggle} 
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border transition cursor-pointer ${
              isEditing 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <Edit className="w-3.5 h-3.5" /> 
            {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
          </button>
          
          <button 
            onClick={handleDeleteAccount}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-red-200 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa tài khoản
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-bold text-slate-600 uppercase mb-1">Họ và Tên</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            className={`w-full border rounded-lg p-2.5 text-sm transition outline-none ${
              isEditing 
                ? 'bg-white border-blue-900 focus:ring-1 focus:ring-blue-900 text-slate-800 font-bold' 
                : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          />
        </div>
        <div>
          <label className="block font-bold text-slate-600 uppercase mb-1">Mã nhân sự</label>
          <input 
            type="text" 
            value={currentUser === 'admin' ? 'THCS-HP-012' : currentUser.id}
            disabled
            className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg p-2.5 text-sm cursor-not-allowed font-bold"
          />
        </div>
        <div>
          <label className="block font-bold text-slate-600 uppercase mb-1">Bộ phận / Chức vụ</label>
          <input 
            type="text" 
            value={currentUser === 'admin' ? 'Super Admin - Giáo viên' : currentUser.role}
            disabled
            className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg p-2.5 text-sm cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block font-bold text-slate-600 uppercase mb-1">Địa chỉ Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
            className={`w-full border rounded-lg p-2.5 text-sm transition outline-none ${
              isEditing 
                ? 'bg-white border-blue-900 focus:ring-1 focus:ring-blue-900 text-slate-800' 
                : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          />
        </div>
        
        {/* New password field integrated beautifully */}
        <div className="md:col-span-2">
          <label className="block font-bold text-slate-600 uppercase mb-1">Mật khẩu tài khoản</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!isEditing}
              className={`w-full border rounded-lg p-2.5 text-sm transition outline-none pr-10 font-mono ${
                isEditing 
                  ? 'bg-white border-blue-900 focus:ring-1 focus:ring-blue-900 text-slate-800 font-bold' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block font-bold text-slate-600 uppercase mb-1">Ghi chú cá nhân / Phương châm giáo dục</label>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={!isEditing}
            rows={3}
            className={`w-full border rounded-lg p-2.5 text-sm transition outline-none ${
              isEditing 
                ? 'bg-white border-blue-900 focus:ring-1 focus:ring-blue-900 text-slate-800' 
                : 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          />
        </div>
      </div>
      
      {/* Save / Cancel controls */}
      {isEditing && (
        <div className="mt-6 flex justify-end gap-2 text-xs" id="profile-edit-controls">
          <button 
            onClick={handleEditToggle} 
            className="border border-slate-300 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Check className="w-4 h-4" /> Lưu lại thông tin
          </button>
        </div>
      )}

      {/* ====== MODAL: XÁC NHẬN XÓA TÀI KHOẢN CÁ NHÂN ====== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6">
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h4 className="font-extrabold text-slate-900 text-base">Xóa tài khoản cá nhân</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa tài khoản này không? Mọi dữ liệu liên quan đến kết quả OKR/KPI của bạn sẽ bị xóa vĩnh viễn và bạn sẽ không thể đăng nhập được nữa.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteAccount}
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
              >
                Xác nhận xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
