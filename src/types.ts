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

export interface KPI {
  criterion: string;
  weight: number;
  desc: string;
  value: number;
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
}
