export type RoleTarget = 'student' | 'teacher' | 'admin' | 'all';
export type BotCategory = 'gem' | 'notebooklm' | 'course' | 'support' | 'tool';
export type BotStatus = 'active' | 'draft' | 'hidden' | 'coming_soon';

export interface CoachAIBot {
  id: string;
  title: string;
  slug: string;
  role_target: RoleTarget;
  category: BotCategory;
  short_desc: string;
  long_desc?: string;
  button_primary_text?: string;
  button_primary_url?: string;
  button_secondary_text?: string;
  button_secondary_url?: string;
  thumbnail_url?: string;
  course_slug?: string;
  owner_role?: string;
  owner_email?: string;
  status: BotStatus;
  featured?: boolean;
  sort_order?: number | string;
  tags?: string;
  language?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
}

export interface CoachAIConfig {
  hero: HeroContent;
  bots: CoachAIBot[];
}
