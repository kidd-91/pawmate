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
  photos: string[];
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
  "其他",
] as const;

export const SIZE_OPTIONS = [
  { label: "小型犬", value: "small" },
  { label: "中型犬", value: "medium" },
  { label: "大型犬", value: "large" },
] as const;
