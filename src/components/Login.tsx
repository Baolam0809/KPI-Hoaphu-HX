import React, { useState } from 'react';
import { ShieldCheck, User as UserIcon, Lock, Key, AlertCircle, Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User | 'admin') => void;
  users: User[];
  onChangePassword?: (userId: string, newPwd: string) => void;
}

export default function Login({ onLogin, users, onChangePassword }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState<'admin' | 'employee'>('employee');

  // Change password states
  const [changePasswordOnLogin, setChangePasswordOnLogin] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);

  const validatePasswordStrength = (pwd: string) => {
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasLength = pwd.length >= 6;
    return {
      hasLetter,
      hasNumber,
      hasSpecialChar,
      hasLength,
      isValid: hasLetter && hasNumber && hasSpecialChar && hasLength
    };
  };

  const strength = validatePasswordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Vui lòng nhập đầy đủ thông tin tài khoản và mật khẩu!');
      return;
    }

    // 1. Kiểm tra đăng nhập Admin quản trị tối cao
    if (trimmedUsername.toLowerCase() === 'admin' && trimmedPassword === 'Bomyvn78@') {
      if (changePasswordOnLogin) {
        setError('Tài khoản quản trị tối cao hệ thống (Admin) không được thay đổi cấu trúc mật khẩu qua giao diện này.');
        return;
      }
      onLogin('admin');
      return;
    }

    // 2. Kiểm tra đăng nhập tài khoản cá nhân người sử dụng
    // Tìm kiếm trong danh sách cán bộ theo Mã nhân sự hoặc Email (không phân biệt chữ hoa thường)
    const foundUser = users.find(u => 
      u.id.toLowerCase() === trimmedUsername.toLowerCase() || 
      u.email.toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (foundUser) {
      if (foundUser.password === trimmedPassword) {
        if (changePasswordOnLogin) {
          setUserToUpdate(foundUser);
          setIsChangingPassword(true);
        } else {
          onLogin(foundUser);
        }
      } else {
        setError('Mật khẩu nhập vào chưa chính xác. Vui lòng kiểm tra lại!');
      }
    } else {
      setError('Không tìm thấy tài khoản cán bộ này trên hệ thống. (Gợi ý: Sử dụng Mã nhân sự hoặc Email của cán bộ)');
    }
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedNewPwd = newPassword.trim();
    const trimmedConfirmPwd = confirmNewPassword.trim();

    if (!trimmedNewPwd || !trimmedConfirmPwd) {
      setError('Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu mới!');
      return;
    }

    if (trimmedNewPwd !== trimmedConfirmPwd) {
      setError('Xác nhận mật khẩu mới chưa khớp. Vui lòng kiểm tra lại!');
      return;
    }

    const currentStrength = validatePasswordStrength(trimmedNewPwd);
    if (!currentStrength.isValid) {
      setError('Mật khẩu mới chưa đủ độ mạnh! Phải bao gồm cả chữ, số, ký tự đặc biệt và tối thiểu 6 ký tự.');
      return;
    }

    if (userToUpdate && onChangePassword) {
      onChangePassword(userToUpdate.id, trimmedNewPwd);
      onLogin({ ...userToUpdate, password: trimmedNewPwd });
    }
  };

  const handleBackToLogin = () => {
    setIsChangingPassword(false);
    setUserToUpdate(null);
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 relative overflow-hidden" id="login-screen">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e3a8a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative z-10 transition-all">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-900 to-red-700 text-white p-6 text-center">
          <div className="inline-flex p-3 bg-white/10 rounded-full mb-3 border border-white/20">
            <svg className="w-10 h-10 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
              <path d="M20 12.38v4.54c-.6.28-1 .89-1 1.58c0 .97.78 1.75 1.75 1.75c.34 0 .66-.1.93-.27C21.94 19.43 22 18.73 22 18v-4.5l-2-1.12zM5 13.18v4l7 3.82l7-3.82v-4L12 17l-7-3.82z" fill="#f59e0b"/>
            </svg>
          </div>
          <h2 className="text-lg font-black tracking-wide">TRƯỜNG THCS HÒA PHÚ</h2>
          <p className="text-xs text-blue-200 uppercase tracking-widest mt-1 font-semibold">Cổng Đăng Nhập Hệ Thống KPI-OKR</p>
        </div>

        {!isChangingPassword ? (
          <>
            {/* Tab Selector */}
            <div className="flex border-b text-xs font-bold text-slate-500">
              <button 
                type="button"
                onClick={() => { setLoginType('employee'); setError(''); }}
                className={`flex-1 py-3 text-center border-b-2 transition ${loginType === 'employee' ? 'border-blue-950 text-blue-950 bg-slate-50/50' : 'border-transparent hover:bg-slate-50'}`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <UserIcon className="w-4 h-4" /> Tài khoản cán bộ
                </span>
              </button>
              <button 
                type="button"
                onClick={() => { setLoginType('admin'); setError(''); }}
                className={`flex-1 py-3 text-center border-b-2 transition ${loginType === 'admin' ? 'border-red-700 text-red-700 bg-slate-50/50' : 'border-transparent hover:bg-slate-50'}`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Quản trị tối cao (Admin)
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg flex items-start gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  {loginType === 'admin' ? 'Tài khoản quản trị' : 'Mã nhân sự hoặc Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={loginType === 'admin' ? 'Nhập "admin"' : 'Ví dụ: THCS-HP-020 hoặc Email'}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950 bg-slate-50 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={loginType === 'admin' ? 'Nhập "admin"' : 'Nhập mật khẩu riêng tư'}
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950 bg-slate-50 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginType === 'employee' && (
                <div className="flex items-center pt-1" id="change-pwd-checkbox-wrapper">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={changePasswordOnLogin}
                      onChange={(e) => setChangePasswordOnLogin(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-950 focus:ring-blue-900 accent-blue-900 cursor-pointer"
                      id="checkbox-change-password-on-login"
                    />
                    <span className="text-xs font-bold text-slate-700 hover:text-blue-950 transition">
                      Đổi mật khẩu mới khi đăng nhập
                    </span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 text-sm font-bold text-white rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginType === 'admin' 
                    ? 'bg-red-700 hover:bg-red-800 focus:ring-2 focus:ring-red-500' 
                    : 'bg-blue-950 hover:bg-blue-900 focus:ring-2 focus:ring-blue-800'
                }`}
              >
                <Key className="w-4 h-4" /> Đăng nhập ngay
              </button>

              {/* Quick instructions / Help */}
              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 bg-slate-50/50 -mx-6 -mb-6 p-4">
                <p className="font-bold text-slate-700">📌 Gợi ý đăng nhập để thử nghiệm:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><strong>Giáo viên Văn (Mai):</strong> THCS-HP-001 / Mai@HP2026</li>
                  <li><strong>Kế toán (Vy):</strong> THCS-HP-005 / Vy@HP2026</li>
                  <li><strong>Thầy Quân (Admin cá nhân):</strong> THCS-HP-020 / Admin@HP2026</li>
                </ul>
              </div>
            </form>
          </>
        ) : (
          <form onSubmit={handleSaveNewPassword} className="p-6 space-y-4" id="change-password-on-login-form">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition"
                title="Quay lại đăng nhập"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  🔑 Đổi Mật Khẩu Đăng Nhập
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">Tài khoản: {userToUpdate?.name} ({userToUpdate?.id})</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg flex items-start gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mật khẩu mới</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới (chữ, số, ký tự đặc biệt)"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950 bg-slate-50 focus:bg-white transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live Password Strength Criteria */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
              <p className="font-bold text-slate-700 text-[11px] mb-1">Mật khẩu mới phải đáp ứng đầy đủ:</p>
              
              <div className="flex items-center gap-2 text-slate-600">
                {strength.hasLetter ? (
                  <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className={strength.hasLetter ? "text-emerald-700 font-semibold" : ""}>Có ít nhất 1 chữ cái (a-z, A-Z)</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                {strength.hasNumber ? (
                  <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className={strength.hasNumber ? "text-emerald-700 font-semibold" : ""}>Có ít nhất 1 chữ số (0-9)</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                {strength.hasSpecialChar ? (
                  <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className={strength.hasSpecialChar ? "text-emerald-700 font-semibold" : ""}>Có ít nhất 1 ký tự đặc biệt (@, #, $, ...)</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                {strength.hasLength ? (
                  <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className={strength.hasLength ? "text-emerald-700 font-semibold" : ""}>Độ dài tối thiểu 6 ký tự</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới để xác nhận"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950 bg-slate-50 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!strength.isValid}
              className={`w-full py-2.5 text-sm font-bold text-white rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                strength.isValid 
                  ? 'bg-blue-950 hover:bg-blue-900 focus:ring-2 focus:ring-blue-800' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Key className="w-4 h-4" /> Xác nhận & Đăng nhập ngay
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
