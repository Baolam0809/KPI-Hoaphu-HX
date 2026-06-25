import React, { useState, useEffect } from 'react';
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
  const [password, setPassword] = useState(currentUser === 'admin' ? 'Bomyvn78@' : (currentUser.password || ''));
  const [avatar, setAvatar] = useState(currentUser === 'admin' ? 'HQ' : currentUser.avatar);

  // Sync state whenever currentUser changes
  useEffect(() => {
    setName(currentUser === 'admin' ? 'Nghiêm Hồng Quân' : currentUser.name);
    setEmail(currentUser === 'admin' ? 'nghiemhongquan@thcshoaphu.edu.vn' : currentUser.email);
    setBio(currentUser === 'admin' ? 'Tận tụy vì học sinh thân yêu, quyết tâm số hóa thành công các quy trình quản lý của trường THCS Hòa Phú.' : currentUser.bio);
    setPassword(currentUser === 'admin' ? 'Bomyvn78@' : (currentUser.password || ''));
    setAvatar(currentUser === 'admin' ? 'HQ' : currentUser.avatar);
  }, [currentUser]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel changes and reset
      setName(currentUser === 'admin' ? 'Nghiêm Hồng Quân' : currentUser.name);
      setEmail(currentUser === 'admin' ? 'nghiemhongquan@thcshoaphu.edu.vn' : currentUser.email);
      setBio(currentUser === 'admin' ? 'Tận tụy vì học sinh thân yêu, quyết tâm số hóa thành công các quy trình quản lý của trường THCS Hòa Phú.' : currentUser.bio);
      setPassword(currentUser === 'admin' ? 'Bomyvn78@' : (currentUser.password || ''));
      setAvatar(currentUser === 'admin' ? 'HQ' : currentUser.avatar);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatar(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onUpdateProfile({
      name: name.trim(),
      email: email.trim(),
      bio: bio.trim(),
      password: password.trim(),
      avatar: avatar
    });
    setIsEditing(false);
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
        </div>
      </div>
      
      {/* 2A. AVATAR CONFIGURATION PANEL */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 flex flex-col sm:flex-row items-center gap-5 text-xs">
        {/* LARGE AVATAR PREVIEW */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-50 border-4 border-white shadow flex items-center justify-center text-blue-900 font-extrabold text-2xl shrink-0 overflow-hidden relative group select-none">
          {avatar && (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('/')) ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            avatar
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className="block font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Ảnh đại diện tài khoản cá nhân</span>
          
          {isEditing ? (
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400">Tải ảnh định dạng PNG/JPG hoặc chọn nhanh một ảnh mẫu chuyên nghiệp bên dưới:</p>
              
              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <label className="bg-blue-900 hover:bg-blue-950 text-white font-bold py-1.5 px-3 rounded-lg cursor-pointer transition text-[10px] shadow-sm select-none">
                  Tải ảnh mới từ thiết bị
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarFileChange}
                  />
                </label>
                
                <button
                  type="button"
                  onClick={() => {
                    // Generate initials based on current name
                    const words = name.trim().split(' ');
                    const lastWord = words[words.length - 1] || 'HQ';
                    setAvatar(lastWord.substring(0, 2).toUpperCase());
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-1.5 px-3 rounded-lg transition text-[10px]"
                >
                  Dùng chữ viết tắt
                </button>
              </div>

              {/* PRESETS GRID */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="text-[10px] text-slate-500 font-bold">Chọn nhanh:</span>
                {[
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150',
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150',
                  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150'
                ].map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition hover:scale-110 shadow-sm shrink-0 cursor-pointer ${
                      avatar === url ? 'border-yellow-400 scale-110 ring-1 ring-yellow-300' : 'border-white hover:border-blue-900'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 mt-1 leading-relaxed">
              Bạn hiện đang xem tài khoản ở chế độ đọc. Nhấn nút <strong className="text-blue-900 font-bold">"Chỉnh sửa"</strong> ở góc trên bên phải để thay đổi ảnh chân dung đại diện hoặc mật khẩu bảo mật tài khoản.
            </p>
          )}
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
    </div>
  );
}
