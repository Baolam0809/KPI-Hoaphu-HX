import React, { useState, useRef } from 'react';
import { Users, Search, Download, FileSpreadsheet, UserPlus, Trash2, Edit, X, FileCheck, Info, Eye, Key, Sparkles } from 'lucide-react';
import { User } from '../types';
import * as XLSX from 'xlsx';

interface UsersTabProps {
  users: User[];
  onAddUser: (user: Omit<User, 'avatar'>) => void;
  onUpdateUser: (id: string, updatedUser: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onViewEmployee: (userId: string) => void;
  showToast: (msg: string) => void;
  onOpenAssignModal?: (user: User) => void;
  allKpis?: Record<string, any[]>;
  currentUser?: User | 'admin';
  kpiSubmissions?: Record<string, string>;
}

export default function UsersTab({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onViewEmployee,
  showToast,
  onOpenAssignModal,
  allKpis,
  currentUser,
  kpiSubmissions = {}
}: UsersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleGroup, setRoleGroup] = useState<'all' | 'BGH' | 'GiaoVien' | 'NhanVien'>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Custom confirmation state for delete user
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Custom states for resetting password
  const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
  const [resetPwdUser, setResetPwdUser] = useState<User | null>(null);
  const [newGeneratedPwd, setNewGeneratedPwd] = useState('');
  
  // Single creation inputs
  const [name, setName] = useState('');
  const [type, setType] = useState<'BGH' | 'GiaoVien' | 'NhanVien'>('GiaoVien');
  const [role, setRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');

  // Bulk import state
  const [pendingRecords, setPendingRecords] = useState<Omit<User, 'avatar' | 'email'>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto generate random password
  const generateRandomPassword = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    return `HP@${randomCode}`;
  };

  const handleOpenResetPwdModal = (user: User) => {
    setResetPwdUser(user);
    setNewGeneratedPwd(generateRandomPassword());
    setIsResetPwdModalOpen(true);
  };

  const handleConfirmResetPwd = () => {
    if (!resetPwdUser) return;
    onUpdateUser(resetPwdUser.id, { password: newGeneratedPwd });
    setIsResetPwdModalOpen(false);
    showToast(`Đã cấp lại mật khẩu mới cho cán bộ ${resetPwdUser.name}: ${newGeneratedPwd}`);
    setResetPwdUser(null);
  };

  const handleOpenAddModal = () => {
    setName('');
    setType('GiaoVien');
    setRole('');
    setUserEmail('');
    setPassword(generateRandomPassword());
    setIsAddModalOpen(true);
  };

  const handleSingleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      showToast('Vui lòng điền đủ họ tên và vị trí chuyên môn!');
      return;
    }
    if (password.length < 4) {
      showToast('Mật khẩu tối thiểu phải từ 4 ký tự!');
      return;
    }

    const randId = `THCS-HP-${Math.floor(100 + Math.random() * 900)}`;
    onAddUser({
      id: randId,
      name: name.trim(),
      role: role.trim(),
      email: userEmail.trim(),
      isTeacher: type === 'GiaoVien',
      type,
      bio: `Thành viên mới của ${type === 'GiaoVien' ? 'khối Giáo viên' : 'hội đồng sư phạm'} trường THCS Hòa Phú.`,
      password: password.trim()
    });

    setIsAddModalOpen(false);
    showToast(`Khởi tạo thành công tài khoản cho cán bộ ${name.trim()}!`);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setName(user.name);
    setType(user.type);
    setRole(user.role);
    setUserEmail(user.email || '');
    setPassword(user.password || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!name.trim() || !role.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin nhân sự!');
      return;
    }
    if (password.trim().length < 4) {
      showToast('Mật khẩu tối thiểu phải từ 4 ký tự!');
      return;
    }

    onUpdateUser(selectedUser.id, {
      name: name.trim(),
      type,
      role: role.trim(),
      email: userEmail.trim(),
      isTeacher: type === 'GiaoVien',
      password: password.trim()
    });

    setIsEditModalOpen(false);
    showToast(`Cập nhật tài khoản cán bộ "${name.trim()}" thành công!`);
  };

  const handleDelete = (user: User) => {
    if (user.id === 'THCS-HP-020' || user.id.toLowerCase() === 'admin') {
      showToast('Cảnh báo: Đây là tài khoản Admin hệ thống, không được phép xóa!');
      return;
    }
    setUserToDelete(user);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      showToast(`Đã xóa vĩnh viễn tài khoản cán bộ "${userToDelete.name}"!`);
      setUserToDelete(null);
    }
  };

  // 1. Download Excel template with password column (.xlsx)
  const downloadTemplate = () => {
    try {
      const templateData = [
        {
          "Mã nhân sự": "THCS-HP-020",
          "Họ và tên": "Phạm Quang Linh",
          "Tổ nhóm (BGH/GiaoVien/NhanVien)": "GiaoVien",
          "Chức vụ cụ thể": "Giáo viên môn Vật lý (Tổ tự nhiên)",
          "Mật khẩu khởi tạo": "Linh@HP2026"
        },
        {
          "Mã nhân sự": "THCS-HP-021",
          "Họ và tên": "Nguyễn Khánh An",
          "Tổ nhóm (BGH/GiaoVien/NhanVien)": "NhanVien",
          "Chức vụ cụ thể": "Nhân viên Kế toán hành chính",
          "Mật khẩu khởi tạo": "An@HP2026"
        },
        {
          "Mã nhân sự": "THCS-HP-022",
          "Họ và tên": "Bùi Tiến Dũng",
          "Tổ nhóm (BGH/GiaoVien/NhanVien)": "BGH",
          "Chức vụ cụ thể": "Phó Hiệu trưởng cơ sở vật chất",
          "Mật khẩu khởi tạo": "Dung@HP2026"
        },
        {
          "Mã nhân sự": "THCS-HP-023",
          "Họ và tên": "Đoàn Thị Vân",
          "Tổ nhóm (BGH/GiaoVien/NhanVien)": "GiaoVien",
          "Chức vụ cụ thể": "Giáo viên Tiếng Anh - Tổ trưởng chuyên môn",
          "Mật khẩu khởi tạo": "Van@HP2026"
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNhanSu");

      // Set nice column widths for professional Excel looks
      worksheet['!cols'] = [
        { wch: 15 }, // Mã nhân sự
        { wch: 22 }, // Họ và tên
        { wch: 32 }, // Tổ nhóm
        { wch: 38 }, // Chức vụ cụ thể
        { wch: 18 }  // Mật khẩu khởi tạo
      ];

      XLSX.writeFile(workbook, "bieu_mau_cap_tai_khoan_kem_mat_khau.xlsx");
      showToast("Tải biểu mẫu cấp tài khoản (.xlsx) thành công!");
    } catch (err) {
      console.error("Lỗi khi tải file mẫu Excel:", err);
      showToast("Có lỗi xảy ra khi tạo tệp Excel mẫu!");
    }
  };

  // 2. Import Excel/CSV action
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    reader.onload = (event) => {
      let parsed: Omit<User, 'avatar' | 'email'>[] = [];

      try {
        if (extension === 'xlsx' || extension === 'xls') {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

          jsonData.forEach((row: any) => {
            const idCol = row["Mã nhân sự"] || row["ID"] || row["Mã cán bộ"] || row["Mã nhân viên"];
            const nameCol = row["Họ và tên"] || row["Họ tên"] || row["Tên nhân sự"] || row["Tên"];
            const groupTypeCol = row["Tổ nhóm (BGH/GiaoVien/NhanVien)"] || row["Tổ nhóm"] || row["Loại nhân sự"] || row["Nhóm"];
            const roleCol = row["Chức vụ cụ thể"] || row["Chức vụ"] || row["Vai trò"] || row["Nhiệm vụ"];
            const pwdCol = row["Mật khẩu khởi tạo"] || row["Mật khẩu"] || row["Password"];

            if (nameCol) {
              const id = idCol ? idCol.toString().trim() : `THCS-HP-${Math.floor(100 + Math.random() * 900)}`;
              const groupType = (groupTypeCol ? groupTypeCol.toString().trim() as 'BGH' | 'GiaoVien' | 'NhanVien' : 'GiaoVien');
              const role = roleCol ? roleCol.toString().trim() : 'Giáo viên';
              const pwd = pwdCol ? pwdCol.toString().trim() : `HP@${Math.floor(1000 + Math.random() * 9000)}`;

              parsed.push({
                id,
                name: nameCol.toString().trim(),
                role,
                isTeacher: groupType === 'GiaoVien',
                type: groupType,
                bio: `Thành viên mới của khối ${groupType === 'GiaoVien' ? 'Giáo viên' : 'Nhân viên'} trường THCS Hòa Phú.`,
                password: pwd
              });
            }
          });
        } else {
          // Fallback to CSV text parser
          const text = event.target?.result as string;
          const lines = text.split('\n');
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const cols = line.split(',');
            if (cols.length >= 2) {
              const id = cols[0].trim() || `THCS-HP-${Math.floor(100 + Math.random() * 900)}`;
              const nameCol = cols[1].trim();
              const groupType = (cols[2] && cols[2].trim() as 'BGH' | 'GiaoVien' | 'NhanVien') || 'GiaoVien';
              const roleCol = cols[3] ? cols[3].trim() : 'Giáo viên';
              const pwd = (cols[4] && cols[4].trim()) ? cols[4].trim() : `HP@${Math.floor(1000 + Math.random() * 9000)}`;

              if (nameCol && nameCol !== "Họ và tên") {
                parsed.push({
                  id,
                  name: nameCol,
                  role: roleCol,
                  isTeacher: groupType === 'GiaoVien',
                  type: groupType,
                  bio: `Thành viên mới của khối ${groupType === 'GiaoVien' ? 'Giáo viên' : 'Nhân viên'} trường THCS Hòa Phú.`,
                  password: pwd
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Lỗi khi đọc file nhập cán bộ:", err);
        showToast("Có lỗi xảy ra khi phân tích tệp dữ liệu!");
      }

      // If parser yielded nothing, load fallback defaults
      if (parsed.length === 0) {
        parsed = [
          { id: "THCS-HP-020", name: "Phạm Quang Linh", type: "GiaoVien", isTeacher: true, role: "Giáo viên môn Vật lý (Tổ tự nhiên)", password: "Linh@HP2026", bio: "Giáo viên mới tuyển dụng" },
          { id: "THCS-HP-021", name: "Nguyễn Khánh An", type: "NhanVien", isTeacher: false, role: "Nhân viên Kế toán hành chính", password: "An@HP2026", bio: "Hỗ trợ văn phòng" },
          { id: "THCS-HP-022", name: "Bùi Tiến Dũng", type: "BGH", isTeacher: false, role: "Phó Hiệu trưởng cơ sở vật chất", password: "Dung@HP2026", bio: "Ban Giám Hiệu" },
          { id: "THCS-HP-023", name: "Đoàn Thị Vân", type: "GiaoVien", isTeacher: true, role: "Giáo viên Tiếng Anh - Tổ trưởng", password: "Van@HP2026", bio: "Đội ngũ chuyên môn" }
        ];
        showToast("Tệp không có dữ liệu hợp lệ. Đang tải dữ liệu mẫu chuẩn để demo!");
      } else {
        showToast(`Đã tải thành công dữ liệu từ tệp với ${parsed.length} tài khoản hợp lệ!`);
      }

      setPendingRecords(parsed);
      setIsBulkModalOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (extension === 'xlsx' || extension === 'xls') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, "UTF-8");
    }
  };

  const handleConfirmBulkInsert = () => {
    pendingRecords.forEach(rec => {
      onAddUser(rec);
    });
    setIsBulkModalOpen(false);
    showToast(`Đã cấp thành công tài khoản đồng loạt cho ${pendingRecords.length} cán bộ nhân viên mới!`);
    setPendingRecords([]);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = roleGroup === 'all' ? true : user.type === roleGroup;
    return matchesSearch && matchesGroup;
  });

  const exportUserList = () => {
    try {
      const dataToExport = filteredUsers.map((u, idx) => ({
        "STT": idx + 1,
        "Mã cán bộ / Mã nhân sự": u.id,
        "Họ và tên": u.name,
        "Tổ nhóm": u.type === 'BGH' ? 'Ban Giám Hiệu' : u.type === 'GiaoVien' ? 'Giáo viên' : 'Nhân viên',
        "Chức vụ cụ thể": u.role,
        "Mật khẩu tài khoản": u.password || '',
        "Email liên hệ": u.email || `${u.id.toLowerCase()}@thcshoaphu.edu.vn`,
        "Mô tả / Tiểu sử": u.bio || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachTaiKhoan");

      // Column widths
      worksheet['!cols'] = [
        { wch: 8 },  // STT
        { wch: 20 }, // Mã cán bộ / Mã nhân sự
        { wch: 25 }, // Họ và tên
        { wch: 18 }, // Tổ nhóm
        { wch: 35 }, // Chức vụ cụ thể
        { wch: 22 }, // Mật khẩu tài khoản
        { wch: 32 }, // Email liên hệ
        { wch: 40 }  // Mô tả / Tiểu sử
      ];

      XLSX.writeFile(workbook, "Danh_sach_tai_khoan_can_bo_THCS_Hoa_Phu.xlsx");
      showToast("Xuất file danh sách tài khoản (.xlsx) thành công!");
    } catch (err) {
      console.error("Lỗi khi xuất danh sách tài khoản:", err);
      showToast("Có lỗi xảy ra khi xuất danh sách tài khoản!");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5" id="users-directory-tab">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
        <div>
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-900" /> Quản Lý Danh Sách Nhân Sự THCS Hòa Phú
          </h3>
          <p className="text-xs text-slate-500">Khởi tạo, cấu hình tài khoản và phân quyền Giáo viên, BGH, Nhân viên toàn trường</p>
        </div>
        
        {/* Red box action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0">
          <button 
            onClick={downloadTemplate}
            className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 border border-slate-300 transition cursor-pointer"
            title="Tải biểu mẫu Excel (.xlsx) mẫu về máy tính"
          >
            <Download className="w-3.5 h-3.5" /> Tải file mẫu (.xlsx)
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-initial bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Nhập tệp từ máy tính để cấp tài khoản hàng loạt"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Nhập file đồng loạt
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef}
            accept=".csv,.xlsx,.xls" 
            className="hidden" 
            onChange={handleImportFile}
          />
          
          <button 
            onClick={exportUserList}
            className="flex-1 sm:flex-initial bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            title="Xuất toàn bộ danh sách tài khoản hiện tại ra file Excel (.xlsx)"
            id="btn-export-user-list"
          >
            <Download className="w-3.5 h-3.5" /> Xuất danh sách (.xlsx)
          </button>
          
          <button 
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-initial bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" /> Tạo tài khoản mới
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo Mã nhân sự, tên hoặc chức vụ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-950 focus:outline-none"
          />
        </div>
        <select 
          value={roleGroup} 
          onChange={(e) => setRoleGroup(e.target.value as any)}
          className="border border-slate-300 rounded-lg p-2.5 text-xs bg-white focus:ring-2 focus:ring-blue-950 focus:outline-none cursor-pointer"
        >
          <option value="all">Tất cả tổ nhóm bộ môn</option>
          <option value="BGH">Ban Giám Hiệu</option>
          <option value="GiaoVien">Khối Giáo Viên</option>
          <option value="NhanVien">Khối Nhân Viên Hỗ Trợ</option>
        </select>
      </div>

      {/* Grid List of Users */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="p-3 font-semibold">Nhân sự</th>
              <th className="p-3 font-semibold">Chức vụ / Tổ bộ môn</th>
              <th className="p-3 font-semibold text-center w-28">Trạng thái OKR</th>
              <th className="p-3 font-semibold text-center w-28">Đánh giá KPI</th>
              <th className="p-3 font-semibold text-center w-40">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                  Không tìm thấy giáo viên hay nhân viên nào thỏa mãn điều kiện tìm kiếm!
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 border shrink-0 overflow-hidden">
                        {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:') || user.avatar.startsWith('/')) ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          user.avatar
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 leading-none truncate">{user.name}</p>
                        <span className="text-[10px] text-slate-400 font-medium">Mã: {user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-600">
                    {user.role}
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="font-bold text-slate-700">100%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {(() => {
                      const kpisForUser = allKpis?.[user.id] || [];
                      let totalWeight = 0;
                      let selfScoreSum = 0;
                      let leaderScoreSum = 0;
                      let bghScoreSum = 0;

                      kpisForUser.forEach(kpi => {
                        totalWeight += kpi.weight || 0;
                        const selfVal = kpi.selfScore !== undefined ? kpi.selfScore : kpi.value;
                        const leaderVal = kpi.leaderScore !== undefined ? kpi.leaderScore : Math.max(0, kpi.value - (kpi.value % 5 || 2));
                        const bghVal = kpi.bghScore !== undefined ? kpi.bghScore : Math.max(0, kpi.value - (kpi.value % 7 || 3));

                        selfScoreSum += selfVal * (kpi.weight || 0);
                        leaderScoreSum += leaderVal * (kpi.weight || 0);
                        bghScoreSum += bghVal * (kpi.weight || 0);
                      });

                      const finalSelfScore = totalWeight > 0 ? Math.round(selfScoreSum / totalWeight) : 0;
                      const finalLeaderScore = totalWeight > 0 ? Math.round(leaderScoreSum / totalWeight) : 0;
                      const finalBghScore = totalWeight > 0 ? Math.round(bghScoreSum / totalWeight) : 0;

                      const isSubmitted = !!kpiSubmissions[user.id];

                      return (
                        <div className="flex flex-col gap-1 items-center">
                          {isSubmitted ? (
                            <span className="font-extrabold text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shadow-3xs flex items-center gap-0.5 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-ping"></span>
                              Đã nộp
                            </span>
                          ) : (
                            <span className="font-extrabold text-[9px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded shadow-3xs flex items-center gap-0.5 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                              Đang nháp
                            </span>
                          )}
                          <div className="flex flex-col gap-0.5 text-[10px] text-left font-semibold">
                            <span className="text-slate-500 whitespace-nowrap">
                              🙋‍♂️ Tự chấm: <strong className="text-slate-800 font-bold">{finalSelfScore || 0}</strong>
                            </span>
                            <span className="text-indigo-600 whitespace-nowrap">
                              👥 Tổ trưởng: <strong className="text-indigo-700 font-bold">{finalLeaderScore || 0}</strong>
                            </span>
                            <span className="text-rose-600 whitespace-nowrap">
                              🏛️ BGH chấm: <strong className="text-rose-700 font-bold">{finalBghScore || 0}</strong>
                            </span>
                            
                            {/* Xếp loại dưới điểm đánh giá của nhà trường */}
                            <div className="mt-1 pt-1 border-t border-dashed border-slate-200 flex flex-col gap-0.5">
                              <span className="text-[9px] text-slate-400 font-bold">Xếp loại nhà trường:</span>
                              {(() => {
                                const ratingText = user.bghRatingOverride || (() => {
                                  if (finalBghScore >= 90) return 'Xuất sắc';
                                  if (finalBghScore >= 80) return 'Hoàn thành tốt nhiệm vụ';
                                  if (finalBghScore >= 60) return 'Hoàn thành nhiệm vụ';
                                  return 'Không hoàn thành nhiệm vụ';
                                })();
                                let ratingColor = 'bg-slate-50 border-slate-200 text-slate-700';
                                if (ratingText === 'Xuất sắc') ratingColor = 'bg-emerald-50 border-emerald-200 text-emerald-800 font-extrabold';
                                if (ratingText === 'Hoàn thành tốt nhiệm vụ') ratingColor = 'bg-sky-50 border-sky-200 text-sky-800 font-extrabold';
                                if (ratingText === 'Hoàn thành nhiệm vụ') ratingColor = 'bg-amber-50 border-amber-200 text-amber-800 font-extrabold';
                                if (ratingText === 'Không hoàn thành nhiệm vụ') ratingColor = 'bg-red-50 border-red-200 text-red-800 font-extrabold';
                                return (
                                  <span className={`text-[9.5px] px-1.5 py-0.5 rounded border text-center ${ratingColor}`}>
                                    {ratingText}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center flex-wrap gap-1">
                      <button 
                        onClick={() => onViewEmployee(user.id)}
                        className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-900 font-bold px-2 py-1 rounded transition border border-slate-200 cursor-pointer flex items-center gap-0.5"
                        title="Xem mục tiêu và bảng điểm KPI của cán bộ này"
                      >
                        <Eye className="w-3 h-3" /> Xem
                      </button>
                      <button 
                        onClick={() => handleOpenResetPwdModal(user)}
                        className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded transition border border-amber-200 cursor-pointer flex items-center gap-0.5"
                        title="Cấp lại mật khẩu nhanh cho cán bộ"
                      >
                        <Key className="w-3 h-3" /> Cấp lại MK
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(user)}
                        className="text-[11px] bg-white hover:bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded transition border border-blue-200 cursor-pointer flex items-center gap-0.5"
                        title="Sửa nhân viên và mật khẩu"
                      >
                        <Edit className="w-3 h-3" /> Sửa
                      </button>
                      {currentUser === 'admin' && (
                        <button 
                          onClick={() => handleDelete(user)}
                          className="text-[11px] bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded transition border border-red-200 cursor-pointer flex items-center gap-0.5"
                          title="Xóa nhân viên khỏi hệ thống"
                        >
                          <Trash2 className="w-3 h-3" /> Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ====== DIALOG: THÊM MỚI NHÂN VIÊN ====== */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border max-w-sm w-full p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-base">
                <UserPlus className="text-blue-950 w-5 h-5" /> Thêm Giáo Viên/Nhân Viên Mới
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSingleAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Họ và Tên Nhân Sự</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên giáo viên hoặc nhân viên..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Loại vai trò hành chính</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-blue-950 focus:outline-none"
                >
                  <option value="GiaoVien">Khối Giáo Viên</option>
                  <option value="BGH">Ban Giám Hiệu</option>
                  <option value="NhanVien">Khối Nhân Viên Hỗ Trợ</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Bộ môn giảng dạy / Vị trí việc làm</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ví dụ: Giáo viên Lịch sử, Kế toán, Thư viện..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Địa chỉ Email (Để trống sẽ tự động tạo)</label>
                <input 
                  type="email" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Ví dụ: nguyenthimai@thcshoaphu.edu.vn"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-950 focus:outline-none"
                />
              </div>
              
              {/* NEW PASSWORD FIELD FOR SINGLE ACCOUNT CREATION */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-slate-600 uppercase">Mật khẩu cấp tài khoản</label>
                  <button 
                    type="button"
                    onClick={() => setPassword(generateRandomPassword())}
                    className="text-[10px] text-blue-700 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                  >
                    Tạo ngẫu nhiên
                  </button>
                </div>
                <input 
                  type="text" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hoặc ấn tạo ngẫu nhiên..."
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-xs focus:ring-1 focus:ring-blue-950 focus:outline-none font-bold text-blue-900"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 text-xs pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                >
                  Khởi Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== DIALOG: HIỆU CHỈNH NHÂN VIÊN ====== */}
      {isEditModalOpen && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border max-w-sm w-full p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-base">
                <Edit className="text-blue-900 w-5 h-5" /> Hiệu Chỉnh Thông Tin Nhân Sự
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Mã cán bộ (Không thể sửa)</label>
                <input 
                  type="text" 
                  value={selectedUser.id}
                  disabled
                  className="w-full border border-slate-200 bg-slate-100 rounded-lg p-2 focus:outline-none cursor-not-allowed font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Họ và Tên Nhân Sự</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-950 focus:outline-none font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Bộ phận / Cấu trúc nhóm</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-blue-950 focus:outline-none cursor-pointer"
                >
                  <option value="GiaoVien">Khối Giáo Viên</option>
                  <option value="BGH">Ban Giám Hiệu</option>
                  <option value="NhanVien">Khối Nhân Viên Hỗ Trợ</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Chức vụ cụ thể / Vị trí</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Địa chỉ Email</label>
                <input 
                  type="email" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Ví dụ: user@thcshoaphu.edu.vn"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-950 focus:outline-none font-bold text-slate-800"
                />
              </div>
              
              {/* PASSWORD RESET FIELD IN EDIT MODAL */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-slate-600 uppercase">Mật khẩu tài khoản</label>
                  <button 
                    type="button"
                    onClick={() => setPassword(generateRandomPassword())}
                    className="text-[10px] text-blue-700 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                  >
                    Tạo ngẫu nhiên
                  </button>
                </div>
                <input 
                  type="text" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-xs focus:ring-1 focus:ring-blue-950 focus:outline-none font-bold text-blue-900"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 text-xs pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-950 hover:bg-blue-900 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== PREVIEW CẤP TÀI KHOẢN ĐỒNG LOẠT (MOCK PREVIEW) ====== */}
      {isBulkModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={() => setIsBulkModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-base">
                <FileCheck className="text-emerald-600 w-5 h-5 animate-bounce" /> Xác nhận cấp tài khoản đồng loạt
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 mb-3">Tìm thấy dữ liệu sau từ tệp tải lên. Hệ thống sẽ cấp tài khoản, mật khẩu định dạng bảo mật riêng biệt và khởi tạo OKR-KPI chuẩn cho từng người:</p>
            
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg mb-4 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <th className="p-2">Mã nhân sự</th>
                    <th className="p-2">Họ và Tên</th>
                    <th className="p-2">Vai trò nhóm</th>
                    <th className="p-2">Chức vụ cụ thể</th>
                    <th className="p-2 text-center">Mật khẩu cấp mới</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {pendingRecords.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-800">{rec.id}</td>
                      <td className="p-2">{rec.name}</td>
                      <td className="p-2">
                        <span className="bg-blue-50 text-blue-800 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                          {rec.type === 'GiaoVien' ? 'Khối Giáo Viên' : rec.type === 'BGH' ? 'Ban Giám Hiệu' : 'Khối Nhân Viên'}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600">{rec.role}</td>
                      <td className="p-2 text-center">
                        <span className="font-mono bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold text-[11px]">
                          {rec.password}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg mb-4 text-[11px] text-blue-800 flex gap-1.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-700" />
              <span>Cán bộ sau khi cấp tài khoản có thể đăng nhập bằng Mã nhân sự làm tài khoản và sử dụng Mật khẩu được liệt kê ở trên để truy cập hệ thống KPI-OKR ngay lập tức.</span>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsBulkModalOpen(false)} 
                className="border border-slate-300 px-3.5 py-2 rounded-lg font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                onClick={handleConfirmBulkInsert}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition shadow-sm cursor-pointer"
              >
                Xác nhận cấp tài khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: XÁC NHẬN XÓA TÀI KHÁN CÁN BỘ ====== */}
      {userToDelete && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] cursor-pointer"
          onClick={() => setUserToDelete(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h4 className="font-extrabold text-slate-900 text-base">Xóa vĩnh viễn tài khoản</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của cán bộ <span className="font-bold text-slate-800">"{userToDelete.name}"</span>? Dữ liệu đánh giá OKR/KPI liên quan sẽ bị xóa sạch hoàn toàn.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: CẤP LẠI MẬT KHẨU ====== */}
      {isResetPwdModalOpen && resetPwdUser && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] cursor-pointer"
          onClick={() => {
            setIsResetPwdModalOpen(false);
            setResetPwdUser(null);
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 animate-fade-in cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-amber-600 mb-3">
              <Key className="w-6 h-6 shrink-0 animate-pulse" />
              <h4 className="font-extrabold text-slate-900 text-base">Cấp lại mật khẩu nhanh</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Bạn đang yêu cầu cấp lại mật khẩu cho cán bộ <strong className="text-slate-800 font-extrabold">"{resetPwdUser.name}"</strong> (Mã nhân sự: <span className="font-mono font-bold text-blue-900">{resetPwdUser.id}</span>).
            </p>
            
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mật khẩu mới đề xuất</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newGeneratedPwd}
                  onChange={(e) => setNewGeneratedPwd(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg p-2.5 font-mono text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold text-blue-950 bg-amber-50/30"
                />
                <button 
                  type="button"
                  onClick={() => setNewGeneratedPwd(generateRandomPassword())}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 transition cursor-pointer"
                >
                  Đổi
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-lg mb-4 text-[11px] text-amber-800 flex gap-1.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>Sau khi xác nhận, mật khẩu của cán bộ này sẽ thay đổi ngay lập tức. Hãy sao chép mật khẩu mới này để bàn giao cho cán bộ.</span>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsResetPwdModalOpen(false);
                  setResetPwdUser(null);
                }}
                className="border border-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPwd}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer shadow-sm"
              >
                Xác nhận cấp lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
