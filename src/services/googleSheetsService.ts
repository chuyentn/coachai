import { Course } from '../types';

const WEBHOOK_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL;

const getTenantId = () => {
  const host = window.location.hostname;
  return (host === 'localhost' || host === '127.0.0.1') ? 'coach.online' : host;
};

const getBaseUrl = (action: string) => {
  return `${WEBHOOK_URL}?action=${action}&tenant_id=${getTenantId()}`;
};

export const googleSheetsService = {
  // --- [NEW] Multi-tenant Info Fetching ---
  async fetchTenantConfig(domain: string): Promise<any> {
    if (!WEBHOOK_URL) return null;
    try {
      const response = await fetch(`${WEBHOOK_URL}?action=tenant-config&tenant_id=${domain}`);
      if (!response.ok) throw new Error('Failed to fetch tenant config');
      return await response.json();
    } catch (error) {
      console.error('Error fetching tenant config:', error);
      return null;
    }
  },

  async fetchCourses(): Promise<Course[]> {
    if (!WEBHOOK_URL) {
      console.warn('VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL is not defined');
      return [];
    }

    try {
      const response = await fetch(`${getBaseUrl('getCourses')}`);
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
        total_reviews: Number(row.total_reviews || row.TotalReviews || 0),
        avg_rating: Number(row.avg_rating || 0),
        rating_avg: Number(row.rating_avg || row.RatingAvg || 0),
        rating_count: Number(row.rating_count || row.RatingCount || 0),
        level: String(row.level || row.Level || ''),
        duration_text: String(row.duration_text || row.DurationText || ''),
        created_at: String(row.created_at || new Date().toISOString()),
        status: String(row.status || 'published'),
        modules: (() => {
          const m = row.modules;
          if (!m) return [];
          if (typeof m !== 'string') return m;
          try { return JSON.parse(m); } catch {}
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

  async fetchLessons(courseId: string): Promise<any[]> {
    if (!WEBHOOK_URL) return [];
    try {
      const response = await fetch(`${getBaseUrl('getLessons')}&courseId=${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch lessons');
      const data = await response.json();
      return data.map((row: any) => ({
        id: String(row.id || row.ID),
        course_id: String(row.course_id || row.CourseID),
        chapter: String(row.chapter || 'Chương 1'),
        title: String(row.title || row.Title),
        title_en: String(row.title_en || row.TitleEN || ''),
        video_url: String(row.video_url || row.VideoURL || ''),
        doc_url: String(row.doc_url || row.DocURL || ''),
        content: String(row.content || ''),
        order: Number(row.order || 0),
        is_free: String(row.is_free).toLowerCase() === 'true'
      }));
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }
  },

  async fetchLeads(): Promise<any[]> {
    if (!WEBHOOK_URL) return [];
    try {
      const response = await fetch(`${getBaseUrl('getLeads')}`);
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
      const response = await fetch(`${getBaseUrl('getBots')}&role=${role}&lang=${lang}`);
      if (!response.ok) throw new Error('Failed to fetch bots');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bots:', error);
      return [];
    }
  },

  async fetchProjects(): Promise<any[]> {
    if (!WEBHOOK_URL) return [];
    try {
      const response = await fetch(`${getBaseUrl('getProjects')}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  async fetchConfig(lang: string = 'vi'): Promise<any> {
    if (!WEBHOOK_URL) return null;
    try {
      const response = await fetch(`${getBaseUrl('getConfig')}&lang=${lang}`);
      if (!response.ok) throw new Error('Failed to fetch config');
      return await response.json();
    } catch (error) {
      console.error('Error fetching config:', error);
      return null;
    }
  },

  async fetchPageContent(lang: string = 'vi'): Promise<Record<string, string>> {
     if (!WEBHOOK_URL) return {};
     try {
       const data = await this.fetchConfig(lang);
       if (!data || !data.content) return {};
       return data.content as Record<string, string>;
     } catch (error) {
       console.error('Error fetching page content:', error);
       return {};
     }
  },

  async fetchComments(courseId: string): Promise<any[]> {
    if (!WEBHOOK_URL) return [];
    try {
      const response = await fetch(`${getBaseUrl('getComments')}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const allComments = await response.json();
      return allComments.filter((c: any) => String(c.courseId || c.CourseID) === courseId);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  async submitLead(email: string, name?: string, phone?: string, note?: string): Promise<boolean> {
    return this.submitToWebhook({
      type: 'lead',
      email, name, phone, note,
      tenant_id: getTenantId()
    });
  },

  async submitComment(courseId: string, userId: string, userName: string, content: string, userEmail?: string, photoUrl?: string): Promise<boolean> {
    return this.submitToWebhook({
      type: 'comment',
      courseId, userId, userName, userEmail, photoUrl, content, tenant_id: getTenantId()
    });
  },

  async submitTeacher(teacherData: { email: string; name: string; phone: string; expertise: string; bio: string; }): Promise<boolean> {
    return this.submitToWebhook({ type: 'teacher', ...teacherData, tenant_id: getTenantId() });
  },

  async submitCourse(courseData: any): Promise<boolean> {
    return this.submitToWebhook({ type: 'course', ...courseData, tenant_id: getTenantId() });
  },

  async updateRecord(sheet: string, id: string, updates: any): Promise<boolean> {
    return this.submitToWebhook({ type: 'update', sheet, id, updates, tenant_id: getTenantId() });
  },

  async fetchLessonProgress(userId: string, courseId: string): Promise<any[]> {
    if (!WEBHOOK_URL) return [];
    try {
      const response = await fetch(`${getBaseUrl('getLessonProgress')}&userId=${userId}&courseId=${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch lesson progress');
      return await response.json();
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      return [];
    }
  },

  async updateLessonProgress(userId: string, courseId: string, lessonId: string, status: 'completed' | 'in_progress'): Promise<boolean> {
    return this.submitToWebhook({
      type: 'updateLessonProgress', user_id: userId, course_id: courseId, lesson_id: lessonId, status, tenant_id: getTenantId()
    });
  },

  async fetchNotes(userId: string, lessonId: string): Promise<any[]> {
    if (!WEBHOOK_URL) return [];
    try {
      const response = await fetch(`${getBaseUrl('getNotes')}&userId=${userId}&lessonId=${lessonId}`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  async saveNote(userId: string, courseId: string, lessonId: string, content: string): Promise<boolean> {
    return this.submitToWebhook({ type: 'saveNote', user_id: userId, course_id: courseId, lesson_id: lessonId, content, tenant_id: getTenantId() });
  },

  async fetchQuizzes(lessonId: string): Promise<any[]> {
    if (!WEBHOOK_URL) return [];
    try {
      const response = await fetch(`${getBaseUrl('getQuizzes')}&lessonId=${lessonId}`);
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  async submitQuizAttempt(userId: string, lessonId: string, score: number, total: number): Promise<boolean> {
    return this.submitToWebhook({ type: 'submitQuiz', user_id: userId, lesson_id: lessonId, score, total_questions: total, tenant_id: getTenantId() });
  },

  async fetchCertificates(userId: string): Promise<any[]> {
    if (!WEBHOOK_URL) return [];
    try {
      const response = await fetch(`${getBaseUrl('getCertificates')}&userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch certificates');
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  async fetchInstructorStats(instructorId: string): Promise<any> {
    if (!WEBHOOK_URL) return null;
    try {
      const response = await fetch(`${getBaseUrl('getInstructorStats')}&instructorId=${instructorId}`);
      if (!response.ok) throw new Error('Failed to fetch instructor stats');
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async submitWithdrawal(userId: string, amount: number, paymentInfo: string): Promise<boolean> {
    return this.submitToWebhook({ type: 'withdrawal', user_id: userId, amount, payment_info: paymentInfo, tenant_id: getTenantId() });
  },

  async initializeSystem(): Promise<boolean> {
    if (!WEBHOOK_URL) return false;
    try {
      const response = await fetch(`${getBaseUrl('setup')}`);
      const data = await response.json();
      return data.result === 'success';
    } catch (error) {
      return false;
    }
  },

  async submitToWebhook(data: any): Promise<boolean> {
    if (!WEBHOOK_URL) {
      console.warn('VITE_GOOGLE_APPS_SCRIPT_WEBHOOK_URL is not defined');
      return false;
    }
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data),
      });
      return true;
    } catch (error) {
      return false;
    }
  }
};
