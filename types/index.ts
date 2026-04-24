export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  location: { lat: number; lng: number } | null;
  created_at: string;
}

export interface Dog {
  id: string;
  owner_id: string;
  name: string;
  breed: string;
  age_months: number;
  gender: "male" | "female";
  size: "small" | "medium" | "large";
  personality: string[];
  bio: string;
  city: string;
  district: string;
  photos: string[];
  walking_locations: string[];
  walking_spots: string[];
  walking_times: string[];
  walking_frequency: string;
  is_active: boolean;
  created_at: string;
  // joined from profiles
  owner?: Profile;
}

export interface Swipe {
  id: string;
  swiper_dog_id: string;
  swiped_dog_id: string;
  direction: "like" | "pass";
  created_at: string;
}

export interface Match {
  id: string;
  dog_a_id: string;
  dog_b_id: string;
  created_at: string;
  // joined
  dog_a?: Dog;
  dog_b?: Dog;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}

export const PERSONALITY_OPTIONS = [
  "活潑", "溫和", "愛玩", "黏人", "獨立",
  "友善", "害羞", "好奇", "聰明", "頑皮",
  "穩重", "愛撒嬌",
] as const;

export const BREED_OPTIONS = [
  "柴犬", "柯基", "黃金獵犬", "拉布拉多", "貴賓",
  "法鬥", "哈士奇", "邊牧", "馬爾濟斯", "吉娃娃",
  "臘腸", "米克斯", "雪納瑞", "約克夏", "博美",
] as const;

export const SIZE_OPTIONS = [
  { label: "小型犬", value: "small" },
  { label: "中型犬", value: "medium" },
  { label: "大型犬", value: "large" },
] as const;

export const WALKING_LOCATION_OPTIONS = [
  "公園", "河堤", "學校操場", "社區中庭", "山步道",
  "海邊", "寵物公園", "草地", "田野小路",
] as const;

export const WALKING_TIME_OPTIONS = [
  { label: "🌅 早上", value: "morning" },
  { label: "☀️ 下午", value: "afternoon" },
  { label: "🌙 晚上", value: "evening" },
] as const;

export const WALKING_FREQUENCY_OPTIONS = [
  { label: "每天", value: "daily" },
  { label: "週末", value: "weekend" },
  { label: "偶爾", value: "occasionally" },
] as const;

export interface WalkGroup {
  id: string;
  creator_id: string;
  creator_dog_id: string;
  title: string;
  location: string;
  walk_date: string;
  walk_time: string;
  notes: string;
  max_members: number;
  is_active: boolean;
  created_at: string;
  // joined
  creator_dog?: Dog;
  members?: WalkGroupMember[];
  member_count?: number;
}

export interface WalkGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  dog_id: string;
  status: "pending" | "approved" | "rejected";
  joined_at: string;
  // joined
  dog?: Dog;
  profile?: Profile;
}

export interface WalkGroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}

// ============================================================================
// Expenses
// ============================================================================

export interface ExpenseCategory {
  id: string;
  code: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  is_system: boolean;
  created_by_user_id: string | null;
  sort_order: number;
}

export interface DogExpense {
  id: string;
  category_id: string;
  amount: number;
  currency: string;
  spent_at: string;             // YYYY-MM-DD
  paid_by_user_id: string;
  merchant: string | null;
  notes: string;
  receipt_photo_url: string | null;
  receipt_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // joined
  category?: ExpenseCategory;
  // per-dog share for this expense (1.0 = 100% to this dog)
  share_ratio?: number;
}

export interface ExpenseSummary {
  year: number;
  month: number;
  total: number;
  by_category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    total: number;
  }[];
}
