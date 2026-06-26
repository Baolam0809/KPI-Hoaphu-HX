export interface OKR {
  id: string;
  title: string;
  kr1: string;
  kr1Progress: number;
  kr2: string;
  kr2Progress: number;
  kr3: string;
  kr3Progress: number;
}

export interface Evidence {
  id: string;
  name: string;
  type: 'image' | 'link';
  url: string; // base64 data URL or external web link
  fileType?: 'drive' | 'youtube' | 'word' | 'excel' | 'image' | 'other';
  uploadedAt: string;
}

export interface KPI {
  criterion: string;
  weight: number;
  desc: string;
  value: number;
  evidences?: Evidence[];
}

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  bio: string;
  password?: string;
  isTeacher: boolean;
  type: 'BGH' | 'GiaoVien' | 'NhanVien';
}

export interface Notification {
  id: string;
  title: string;
  content?: string;
  targetUserId?: string;
  time: string;
  type: 'urgent' | 'info' | 'normal';
  read?: boolean;
}

export interface ScheduleItem {
  id: string;
  scope: 'week' | 'month';
  time: string; // e.g. "T2", "15/07"
  title: string;
  location: string;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo';
}

export interface SystemSettings {
  marqueeText: string;
  schoolShortName: string;
  location: string;
  kpiWeights: {
    learning: number;
    method: number;
    responsibility: number;
    ethics: number;
  };
  kpiWeightsStaff?: {
    professional: number;
    operation: number;
    document: number;
    discipline: number;
  };
  heroBannerUrl?: string;
  navbarBannerUrl?: string;
  textLogoUrl?: string;
}

export interface GroupAssignment {
  id: string;
  targetType: 'to-chuyen-mon' | 'khoi-giaovien' | 'khoi-nhanvien' | ('to-chuyen-mon' | 'khoi-giaovien' | 'khoi-nhanvien')[];
  targetName: string;
  okr: {
    title: string;
    kr1: string;
    kr2: string;
    kr3: string;
  };
  kpis: {
    criterion: string;
    weight: number;
    desc: string;
  }[];
  assignedBy: string;
  assignedAt: string;
}
