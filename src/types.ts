export type Role = 'student' | 'teacher' | 'admin' | 'vip';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  provider?: string;
  affiliate_balance?: number;
  referred_by?: string | null;
  created_at: string;
}

export interface CourseModule {
  id: string;
  title: string;
  video_url: string;
  duration: number;
  order: number;
}

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  description: string;
  short_description?: string;
  price_vnd: number;
  price_usd: number;
  thumbnail_url: string;
  modules: CourseModule[];
  published: boolean;
  featured: boolean;
  total_students: number;
  total_reviews: number;
  avg_rating: number;
  created_at: string;
  instructor?: Profile;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'completed' | 'cancelled';
  completion_percentage: number;
  progress: {
    last_lesson_id?: string;
    completed_lessons?: string[];
    [key: string]: any;
  };
  current_lesson_id?: string;
  created_at: string;
  course?: Course;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}
