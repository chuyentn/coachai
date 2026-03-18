/**
 * Deploy this script as a Web App to create a read-only JSON API for the Coach AI Hub.
 * Use it alongside the `CoachAI_Control_Panel` Google Sheet.
 * 
 * Execution: as "Me" (Owner)
 * Access: "Anyone"
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with actual ID

const HEADERS = {
  bots: ['id', 'title', 'slug', 'role_target', 'category', 'short_desc', 'long_desc', 'button_primary_text', 'button_primary_url', 'button_secondary_text', 'button_secondary_url', 'thumbnail_url', 'course_slug', 'owner_role', 'owner_email', 'status', 'featured', 'sort_order', 'tags', 'language', 'updated_at', 'updated_by'],
  courses_ai: ['course_slug', 'course_name', 'teacher_name', 'gem_url', 'notebooklm_url', 'support_doc_url', 'pricing_url', 'status'],
  page_content: ['key', 'value_vi', 'value_en', 'status', 'updated_at']
};

/**
 * Handle GET requests from the React frontend.
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'config';
    const role = e.parameter.role || 'all';
    const lang = e.parameter.lang || 'vi';

    let responseData = {};

    if (action === 'config') {
      responseData = getCoachAIConfig(lang);
    } else if (action === 'bots') {
      responseData = getCoachAIBots(role, lang);
    } else if (action === 'teacher-scope') {
      const email = e.parameter.email;
      responseData = getTeacherScope(email);
    } else {
      responseData = { error: 'Invalid action parameter' };
    }

    // CORS & JSON Return
    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.message,
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get config structure (Hero content, course maps)
 */
function getCoachAIConfig(lang) {
  // If SPREADSHEET_ID is not set, return fallback seed data
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
    return getFallbackSeedData();
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetContent = ss.getSheetByName('page_content');
  const sheetBots = ss.getSheetByName('bots');

  const contentData = sheetToObjects(sheetContent, HEADERS.page_content);
  const botsData = sheetToObjects(sheetBots, HEADERS.bots);

  // Construct Hero
  let hero = { title: "", subtitle: "" };
  contentData.forEach(row => {
    if (row.status === 'active') {
      if (row.key === 'hero_title') hero.title = lang === 'en' ? row.value_en : row.value_vi;
      if (row.key === 'hero_subtitle') hero.subtitle = lang === 'en' ? row.value_en : row.value_vi;
    }
  });

  // Filter Active Bots
  let activeBots = botsData.filter(b => b.status === 'active' || b.status === 'coming_soon');
  // Sort
  activeBots.sort((a, b) => (parseInt(a.sort_order) || 99) - (parseInt(b.sort_order) || 99));

  return {
    hero: hero,
    bots: activeBots
  };
}

/**
 * Get bots filtered by specific role
 */
function getCoachAIBots(role, lang) {
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
    return getFallbackSeedData().bots.filter(b => role === 'all' || b.role_target === role || b.role_target === 'all');
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetBots = ss.getSheetByName('bots');
  const botsData = sheetToObjects(sheetBots, HEADERS.bots);

  let filtered = botsData.filter(b => {
    const isLangMatch = b.language === lang || !b.language;
    const isRoleMatch = role === 'all' || b.role_target === role || b.role_target === 'all';
    const isActive = b.status === 'active' || b.status === 'coming_soon';
    return isLangMatch && isRoleMatch && isActive;
  });

  filtered.sort((a, b) => (parseInt(a.sort_order) || 99) - (parseInt(b.sort_order) || 99));
  
  return filtered;
}

/**
 * Check Teacher Permission scope
 */
function getTeacherScope(email) {
  if (!email) return { hasAccess: false };
  // Setup logic for checking the `teachers_permissions` sheet
  return { hasAccess: true, role: 'teacher' };
}

/**
 * Helper to convert Sheet arrays to Array of Objects
 */
function sheetToObjects(sheet, headers) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only headers

  const objects = [];
  const sheetHeaders = data[0].map(h => h.toString().toLowerCase().trim());
  
  for (let i = 1; i < data.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      const headerIndex = sheetHeaders.indexOf(headers[j]);
      if (headerIndex !== -1) {
        obj[headers[j]] = data[i][headerIndex];
      }
    }
    objects.push(obj);
  }
  return objects;
}

/**
 * Fallback Seed Data directly sent if Spreadsheet ID is not provided.
 * Useful for developing the Frontend without touching Google Sheets.
 */
function getFallbackSeedData() {
  return {
    "hero": {
      "title": "Coach AI - Chọn trợ lý đúng mục tiêu",
      "subtitle": "Học AI, làm dự án, kiếm tiền cùng trợ lý phù hợp."
    },
    "bots": [
      {
        "id": "bot_student_01",
        "title": "Coach AI cho Học viên",
        "slug": "student-gem",
        "role_target": "student",
        "category": "gem",
        "short_desc": "Hỏi nhanh về lộ trình học AI và cách bắt đầu.",
        "button_primary_text": "Mở Gem",
        "button_primary_url": "https://gemini.google.com/gem/...",
        "button_secondary_text": "Xem khóa học",
        "button_secondary_url": "https://edu.victorchuyen.net/courses/ai-basic",
        "thumbnail_url": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
        "status": "active",
        "featured": true,
        "sort_order": 1,
        "tags": "ai,học tập,cơ bản"
      },
      {
        "id": "bot_teacher_01",
        "title": "Coach AI - Trợ lý giảng viên",
        "slug": "teacher-gem",
        "role_target": "teacher",
        "category": "gem",
        "short_desc": "Giúp soạn outline, tối ưu khóa học, tạo FAQ nhanh.",
        "button_primary_text": "Mở Gem",
        "button_primary_url": "https://gemini.google.com/gem/...",
        "button_secondary_text": "Hỗ trợ Docs",
        "button_secondary_url": "https://docs.google.com/",
        "thumbnail_url": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
        "status": "active",
        "featured": true,
        "sort_order": 2,
        "tags": "teacher,outline,soạn bài"
      },
      {
        "id": "bot_admin_01",
        "title": "Coach AI - Admin & Support",
        "slug": "admin-support-gem",
        "role_target": "admin",
        "category": "support",
        "short_desc": "Hỗ trợ trả lời FAQ, tra cứu SOP nội bộ vận hành.",
        "button_primary_text": "Mở Gem",
        "button_primary_url": "https://gemini.google.com/gem/...",
        "button_secondary_text": "Quy trình nội bộ",
        "button_secondary_url": "https://docs.google.com/",
        "thumbnail_url": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
        "status": "active",
        "featured": false,
        "sort_order": 3,
        "tags": "admin,support,quy trình"
      },
      {
        "id": "bot_nblm_01",
        "title": "NotebookLM - AI cho người mới",
        "slug": "nblm-ai-newbie",
        "role_target": "student",
        "category": "notebooklm",
        "short_desc": "Kho tri thức AI từ 0-1 được cấu trúc sẵn để hỏi đáp sâu.",
        "button_primary_text": "Tra cứu NotebookLM",
        "button_primary_url": "https://notebooklm.google.com/...",
        "button_secondary_text": "Tham gia nhóm",
        "button_secondary_url": "https://facebook.com/groups/...",
        "thumbnail_url": "https://upload.wikimedia.org/wikipedia/commons/7/77/NotebookLM.svg",
        "status": "active",
        "featured": true,
        "sort_order": 4,
        "tags": "notebooklm,kiến thức,newbie"
      },
      {
        "id": "bot_nblm_02",
        "title": "NotebookLM - Kiếm tiền MMO",
        "slug": "nblm-mmo-money",
        "role_target": "student",
        "category": "notebooklm",
        "short_desc": "Kinh nghiệm thực chiến Affiliate & MMO với AI.",
        "button_primary_text": "Tra cứu NotebookLM",
        "button_primary_url": "https://notebooklm.google.com/...",
        "button_secondary_text": "Khóa học Affiliate",
        "button_secondary_url": "https://edu.victorchuyen.net/courses/",
        "thumbnail_url": "https://upload.wikimedia.org/wikipedia/commons/7/77/NotebookLM.svg",
        "status": "active",
        "featured": false,
        "sort_order": 5,
        "tags": "mmo,affiliate"
      }
    ]
  };
}
