export type ZoneCode = "SE1" | "SE2" | "SE3" | "SE4";

export interface ZoneInfo {
  code: ZoneCode;
  city: string;
  region: string;
  desc: string;
}

export interface ForecastRecord {
  id?: string;
  zone: ZoneCode;
  horizon_hours: number;
  timestamp: string;
  predicted_price: number;
  confidence_lower?: number;
  confidence_upper?: number;
  model_version: string;
}

export interface ZoneStats {
  zone: string;
  min_price: number;
  avg_price: number;
  max_price: number;
  min_time: string;
  max_time: string;
  currency: string;
  period_hours: number;
}

export interface PricePoint {
  hour: string;
  price: number;
}

export interface DayForecast {
  day: string;
  date: string;
  hours: number[];
}

export interface SmartTip {
  icon: string;
  text: string;
  zone: ZoneCode;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  savings: number;
  kwh: number;
  scheduled_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  selected_zone: ZoneCode;
  display_name?: string;
  avatar_url?: string;
  notify_tips: boolean;
  notify_weekly: boolean;
  notify_tasks: boolean;
  language: "en" | "sv";
}

export type Language = "en" | "sv";

export interface Translation {
  appName: string;
  tagline: string;
  loginTitle: string;
  loginSubtitle: string;
  googleSignIn: string;
  githubSignIn: string;
  selectArea: string;
  areaSubtitle: string;
  continue: string;
  home: string;
  planner: string;
  sparky: string;
  todo: string;
  profile: string;
  currentPrice: string;
  perKwh: string;
  forecast: string;
  min: string;
  avg: string;
  max: string;
  savings: string;
  smartTips: string;
  seeAll: string;
  weeklyPlanner: string;
  bestWindows: string;
  today: string;
  tomorrow: string;
  askSparky: string;
  quickQuestions: string;
  myTasks: string;
  streak: string;
  of: string;
  tasksDone: string;
  settings: string;
  account: string;
  notifications: string;
  changeArea: string;
  language: string;
  about: string;
  english: string;
  swedish: string;
  signOut: string;
  version: string;
  zones: Record<ZoneCode, { city: string; region: string; desc: string }>;
}
