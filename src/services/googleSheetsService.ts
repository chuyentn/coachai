import { Course } from '../types';

const WEBHOOK_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL;

export const googleSheetsService = {
  async fetchCourses(): Promise<Course[]> {
    if (!WEBHOOK_URL) {
      console.warn('VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL is not defined');
      return [];
    }

    try {
      // Fetch courses using the unified Apps Script URL with action=getCourses
      const response = await fetch(`${WEBHOOK_URL}?action=getCourses`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      
      const data = await response.json();
      
      return data.map((row: any) => ({
        id: String(row.id || row.ID),
        title: String(row.title || row.Title),
        title_en: String(row.title_en || row.TitleEN || ''),
        description: String(row.description || row.Description),
        description_en: String(row.description_en || row.DescriptionEN || ''),
        short_description: String(row.short_description || row.ShortDescription || ''),
        short_description_en: String(row.short_description_en || row.ShortDescriptionEN || ''),
        price_vnd: Number(row.price_vnd || row.PriceVND || 0),
        price_usd: Number(row.price_usd || row.PriceUSD || 0),
        thumbnail_url: String(row.thumbnail_url || row.Thumbnail || ''),
        instructor_id: String(row.instructor_id || row.InstructorID || ''),
        published: String(row.published).toLowerCase() === 'true',
        featured: String(row.featured).toLowerCase() === 'true',
        total_students: Number(row.total_students || 0),
        // P2.3 Fix: total_reviews was missing — added it alongside avg_rating
        total_reviews: Number(row.total_reviews || row.TotalReviews || 0),
        avg_rating: Number(row.avg_rating || 0),
        created_at: String(row.created_at || new Date().toISOString()),
        modules: (() => {
          const m = row.modules;
          if (!m) return [];
          if (typeof m !== 'string') return m;
          // Try JSON first (preferred format)
          try { return JSON.parse(m); } catch {}
          // Fallback: semicolon-separated plain text → convert to module objects
          // Fallback: semicolon-separated plain text → convert to module objects
          return m.split(';').map((ts: string, i: number) => ({
            id: `m${i + 1}`,
            title: ts.trim(),
            title_en: '',
            video_url: '',
            order: i + 1
          }));
        })()
      })) as Course[];
    } catch (error) {
      console.error('Error fetching courses from Google Sheets:', error);
      return [];
    }
  },

  async fetchLeads(): Promise<any[]> {
    if (!WEBHOOK_URL) return [];
    try {
      const response = await fetch(`${WEBHOOK_URL}?action=getLeads`);
      if (!response.ok) throw new Error('Failed to fetch leads');
      return await response.json();
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  },

  async fetchBots(role: string = 'all', lang: string = 'vi'): Promise<any[]> {
    if (!WEBHOOK_URL) return [];
    try {
      const response = await fetch(`${WEBHOOK_URL}?action=getBots&role=${role}&lang=${lang}`);
      if (!response.ok) throw new Error('Failed to fetch bots');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bots:', error);
      return [];
    }
  },

  async fetchConfig(lang: string = 'vi'): Promise<any> {
    if (!WEBHOOK_URL) return null;
    try {
      const response = await fetch(`${WEBHOOK_URL}?action=getConfig&lang=${lang}`);
      if (!response.ok) throw new Error('Failed to fetch config');
      return await response.json();
    } catch (error) {
      console.error('Error fetching config:', error);
      return null;
    }
  },

  async fetchComments(courseId: string): Promise<any[]> {
    if (!WEBHOOK_URL) return [];
    try {
      const response = await fetch(`${WEBHOOK_URL}?action=getComments&courseId=${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  async submitLead(email: string, name?: string, phone?: string, note?: string): Promise<boolean> {
    return this.submitToWebhook({
      type: 'lead',
      email,
      name,
      phone,
      note
    });
  },

  async submitComment(courseId: string, userId: string, userName: string, content: string, userEmail?: string, photoUrl?: string): Promise<boolean> {
    return this.submitToWebhook({
      type: 'comment',
      courseId,
      userId,
      userName,
      userEmail,
      photoUrl,
      content
    });
  },

  async submitTeacher(teacherData: {
    email: string;
    name: string;
    phone: string;
    expertise: string;
    bio: string;
  }): Promise<boolean> {
    return this.submitToWebhook({
      type: 'teacher',
      ...teacherData
    });
  },

  async submitCourse(courseData: any): Promise<boolean> {
    return this.submitToWebhook({
      type: 'course',
      ...courseData
    });
  },

  async initializeSystem(): Promise<boolean> {
    if (!WEBHOOK_URL) return false;
    try {
      const response = await fetch(`${WEBHOOK_URL}?action=setup`);
      const data = await response.json();
      return data.result === 'success';
    } catch (error) {
      console.error('Error initializing system:', error);
      return false;
    }
  },

  async submitToWebhook(data: any): Promise<boolean> {
    if (!WEBHOOK_URL) {
      console.warn('VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL is not defined');
      return false;
    }

    try {
      // Using no-cors and text/plain to avoid CORS preflight issues with Google Apps Script
      // Cloudflare Pages and browsers often block the redirect from GAS if CORS is strict
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain', // Use text/plain to avoid preflight
        },
        body: JSON.stringify(data),
      });
      
      // With no-cors, we can't read the response, so we assume success if no error was thrown
      return true;
    } catch (error) {
      console.error('Error submitting to webhook:', error);
      return false;
    }
  }
};
