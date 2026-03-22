/**
 * Deploy this script as a Web App to create a read-only JSON API for the Coach.online Multi-Tenant SaaS.
 * Use it alongside the `CoachAI_Control_Panel` Google Sheet.
 * 
 * Execution: as "Me" (Owner)
 * Access: "Anyone"
 */

const SPREADSHEET_ID = '1mq9Ri-oqvqMPBYLMnBxixD57hmmwkuASFL-m2CsIC0k'; // Coach.io.vn Control Panel

const HEADERS = {
  // [NEW] SaaS Tenant Configurations (Added Bank info for Dynamic Checkout)
  tenants: ['domain', 'app_name', 'logo_url', 'primary_color', 'contact_email', 'zalo_url', 'facebook_url', 'sepay_md5', 'bank_id', 'bank_account', 'bank_owner', 'status'],
  // [MODIFIED] Added tenant_id column for data isolation
  bots: ['tenant_id', 'id', 'title', 'slug', 'role_target', 'category', 'short_desc', 'long_desc', 'button_primary_text', 'button_primary_url', 'button_secondary_text', 'button_secondary_url', 'thumbnail_url', 'course_slug', 'owner_role', 'owner_email', 'status', 'featured', 'sort_order', 'tags', 'language', 'updated_at', 'updated_by'],
  courses_ai: ['tenant_id', 'course_slug', 'course_name', 'teacher_name', 'gem_url', 'notebooklm_url', 'support_doc_url', 'pricing_url', 'status'],
  page_content: ['tenant_id', 'key', 'value_vi', 'value_en', 'status', 'updated_at']
};

/**
 * Handle GET requests from the React frontend.
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'config';
    const role = e.parameter.role || 'all';
    const lang = e.parameter.lang || 'vi';
    const tenantId = e.parameter.tenant_id || 'coach.io.vn'; // V2 Multi-tenant Routing

    let responseData = {};

    if (action === 'tenant-config') {
      responseData = getTenantConfig(tenantId);
    } else if (action === 'config' || action === 'getConfig') {
      responseData = getCoachAIConfig(lang, tenantId);
    } else if (action === 'bots' || action === 'getBots') {
      responseData = getCoachAIBots(role, lang, tenantId);
    } else if (action === 'getCourses') {
      responseData = getCoursesFiltered(tenantId);
    } else if (action === 'getLessons') {
      const courseId = e.parameter.courseId || '';
      responseData = getLessonsFiltered(courseId, tenantId);
    } else if (action === 'getLeads') {
      responseData = getLeadsFiltered(tenantId);
    } else if (action === 'getProjects') {
      responseData = getProjectsFiltered(tenantId);
    } else if (action === 'teacher-scope') {
      const email = e.parameter.email;
      responseData = getTeacherScope(email, tenantId);
    } else {
      responseData = { error: 'Invalid action parameter', received: action };
    }

    // CORS & JSON Return
    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // FIX: Removed duplicate return statement (audit finding: CRITICAL)
    return ContentService.createTextOutput(JSON.stringify({
      error: error.message,
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * CRM CONFIG — Lấy từ Script Properties (Extensions → Apps Script → Project Settings)
 * Cách set: PropertiesService.getScriptProperties().setProperty('RESEND_API_KEY', 're_...')
 */
const CRM_CONFIG = {
  resendApiKey: PropertiesService.getScriptProperties().getProperty('RESEND_API_KEY') || '',
  fromEmail: 'Coach Chuyên <no-reply@coach.io.vn>',
  calLink: 'https://cal.com/victorchuyen/coachai',
  demoLink: 'https://coach.io.vn',
  leads_sheet: 'Leads',
  templates_sheet: 'Email Templates',
  logs_sheet: 'Email Logs',
};

/**
 * [UPDATED] Handle POST requests — supports register-tenant + submit-lead (CRM)
 */
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'No POST data received' })).setMimeType(ContentService.MimeType.JSON);
    }
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    // ===== REGISTER TENANT =====
    if (action === 'register-tenant') {
      if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
        return ContentService.createTextOutput(JSON.stringify({ error: 'SPREADSHEET_ID not configured.' })).setMimeType(ContentService.MimeType.JSON);
      }
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName('Tenants');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({ error: 'Tenants sheet not found' })).setMimeType(ContentService.MimeType.JSON);
      const newDomain = postData.domain.includes('.') ? postData.domain : `${postData.domain}.coach.io.vn`;
      sheet.appendRow([newDomain, postData.appName||'', '', postData.color||'', postData.email||'', '', '', '', 'techcombank', '8486568666', 'TRAN NGOC CHUYEN', 'pending']);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Tenant created successfully!' })).setMimeType(ContentService.MimeType.JSON);
    }

    // ===== [CRM] SUBMIT LEAD — lưu vào Sheet + gửi email chào mừng =====
    if (action === 'submit-lead') {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName(CRM_CONFIG.leads_sheet);
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({ error: 'Leads sheet not found. Run setupCRMSheets() first.' })).setMimeType(ContentService.MimeType.JSON);

      const tenantId = postData.tenant_id || 'coach.io.vn';
      const leadRow = [
        tenantId,
        postData.name || '',
        postData.email || '',
        postData.phone || '',
        postData.note || '',
        postData.source || 'web_form',
        new Date().toISOString(),
        'welcome_sent',     // stage
        new Date().toISOString() // last_email_at
      ];
      sheet.appendRow(leadRow);

      // Gửi email chào mừng qua Resend
      const emailResult = _crmSendWelcome({ name: postData.name, email: postData.email, tenantId });

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Lead đã được lưu. Email chào mừng: ' + (emailResult ? 'Đã gửi ✅' : 'Chưa cấu hình RESEND_API_KEY ⚠️')
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ===== [CRM] SEND EMAIL TEMPLATE (từ Control Panel HTML) =====
    if (action === 'send-crm-email') {
      const { templateId, toEmail, customSubject, customBody } = postData;
      if (!toEmail) return ContentService.createTextOutput(JSON.stringify({ error: 'Thiếu email người nhận' })).setMimeType(ContentService.MimeType.JSON);

      let subject = customSubject, body = customBody;
      if (templateId && !customBody) {
        const tmpl = _crmGetTemplateById(templateId);
        if (tmpl) { subject = subject || tmpl.subject; body = tmpl.body; }
      }
      const emails = toEmail.split(/[;,]/).map(e => e.trim()).filter(e => e);
      const result = _crmSendEmail(emails, subject, body.replace(/{{name}}/g, '').replace(/{{email}}/g, emails[0]), templateId, 'manual');
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }

    // ===== [CRM] SETUP CRM SHEETS =====
    if (action === 'setup-crm') {
      setupCRMSheets();
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'CRM Sheets đã được tạo thành công!' })).setMimeType(ContentService.MimeType.JSON);
    }

    // ===== [AUTH] ADMIN LOGIN =====
    if (action === 'admin-login') {
      const result = adminLogin(postData.email || '', postData.password || '');
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }

    // ===== [AUTH] ADMIN LOGOUT =====
    if (action === 'admin-logout') {
      return ContentService.createTextOutput(JSON.stringify(adminLogout(postData.token || ''))).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid backend action: ' + action })).setMimeType(ContentService.MimeType.JSON);


  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * [NEW] Get Tenant Config based on Hostname
 */
function getTenantConfig(domain) {
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
    return { domain: domain, app_name: "Coach.io.vn (Demo)", primary_color: "#1d4ed8", status: "active" };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Tenants');
  if (!sheet) return { error: "Tenants sheet not found in the database. Please create it." };

  const tenantsData = sheetToObjects(sheet, HEADERS.tenants);
  let tenant = tenantsData.find(t => t.domain === domain && t.status === 'active');
  
  // Fallback to origin coach.online if custom domain is not active
  if (!tenant) {
    tenant = tenantsData.find(t => t.domain === 'coach.io.vn') || { domain: "coach.io.vn", app_name: "Coach.io.vn", fallback: true };
  }
  
  return tenant;
}

/**
 * Get config structure (Hero content, course maps) filtered by Tenant
 */
function getCoachAIConfig(lang, tenantId) {
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
    return getFallbackSeedData();
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetContent = ss.getSheetByName('page_content');
  const sheetBots = ss.getSheetByName('bots');

  // Filter content based on tenant_id (or 'all' for shared content)
  const contentData = sheetToObjects(sheetContent, HEADERS.page_content).filter(r => r.tenant_id === tenantId || r.tenant_id === 'all' || !r.tenant_id);
  const botsData = sheetToObjects(sheetBots, HEADERS.bots).filter(b => b.tenant_id === tenantId || b.tenant_id === 'all' || !b.tenant_id);

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
 * Get bots filtered by specific role and Tenant
 */
function getCoachAIBots(role, lang, tenantId) {
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
    return getFallbackSeedData().bots.filter(b => role === 'all' || b.role_target === role || b.role_target === 'all');
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetBots = ss.getSheetByName('bots');
  const botsData = sheetToObjects(sheetBots, HEADERS.bots);

  let filtered = botsData.filter(b => {
    const isTenantMatch = b.tenant_id === tenantId || b.tenant_id === 'all' || !b.tenant_id;
    const isLangMatch = b.language === lang || !b.language;
    const isRoleMatch = role === 'all' || b.role_target === role || b.role_target === 'all';
    const isActive = b.status === 'active' || b.status === 'coming_soon';
    return isTenantMatch && isLangMatch && isRoleMatch && isActive;
  });

  filtered.sort((a, b) => (parseInt(a.sort_order) || 99) - (parseInt(b.sort_order) || 99));
  
  return filtered;
}

/**
 * Check Teacher Permission scope
 */
function getTeacherScope(email, tenantId) {
  if (!email) return { hasAccess: false };
  // Implement cross-tenant permission if needed here
  return { hasAccess: true, role: 'teacher', tenant_id: tenantId };
}

/**
 * [NEW] Get Courses filtered by tenant_id
 */
function getCoursesFiltered(tenantId) {
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') return getFallbackSeedData().bots.map(b => ({ id: b.id, title: b.title, status: 'published', tenant_id: b.tenant_id }));
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Courses');
  if (!sheet) return [];
  const headers = sheet.getDataRange().getValues()[0].map(h => h.toString().toLowerCase().trim());
  const data = sheetToObjects(sheet, headers);
  return data.filter(r => (r.tenant_id === tenantId || r.tenant_id === 'all' || !r.tenant_id) && (r.status === 'published' || r.published === true || r.published === 'true'));
}

/**
 * [NEW] Get Lessons filtered by courseId and tenant_id
 */
function getLessonsFiltered(courseId, tenantId) {
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') return [];
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Lessons');
  if (!sheet) return [];
  const headers = sheet.getDataRange().getValues()[0].map(h => h.toString().toLowerCase().trim());
  const data = sheetToObjects(sheet, headers);
  return data.filter(r => {
    const isTenantMatch = r.tenant_id === tenantId || r.tenant_id === 'all' || !r.tenant_id;
    const isCourseMatch = !courseId || String(r.course_id) === String(courseId);
    return isTenantMatch && isCourseMatch;
  });
}

/**
 * [NEW] Get Leads filtered by tenant_id
 */
function getLeadsFiltered(tenantId) {
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') return [];
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Leads');
  if (!sheet) return [];
  const headers = sheet.getDataRange().getValues()[0].map(h => h.toString().toLowerCase().trim());
  const data = sheetToObjects(sheet, headers);
  return data.filter(r => r.tenant_id === tenantId || !r.tenant_id);
}

/**
 * [NEW] Get Projects filtered by tenant_id
 */
function getProjectsFiltered(tenantId) {
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') return [];
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Projects');
  if (!sheet) return [];
  const headers = sheet.getDataRange().getValues()[0].map(h => h.toString().toLowerCase().trim());
  const data = sheetToObjects(sheet, headers);
  return data.filter(r => (r.tenant_id === tenantId || r.tenant_id === 'all' || !r.tenant_id) && r.status === 'active');
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
 */
function getFallbackSeedData() {
  return {
    "hero": {
      "title": "Welcome to Coach.io.vn",
      "subtitle": "Kích hoạt Nền tảng Đào tạo trong 30 Phút."
    },
    "bots": [
      {
        "tenant_id": "coach.io.vn",
        "id": "bot_student_01",
        "title": "Trợ lý Nội dung (Demo)",
        "slug": "student-gem",
        "role_target": "student",
        "category": "gem",
        "short_desc": "Hỏi nhanh về lộ trình học.",
        "button_primary_text": "Mở Gem",
        "button_primary_url": "https://gemini.google.com/gem/...",
        "status": "active",
        "featured": true,
        "sort_order": 1
      }
    ]
  };
}

/**
 * ============================================================
 * 🚀 HÀM SETUP TỰ ĐỘNG - CHẠY 1 LẦN DUY NHẤT
 * ============================================================
 * Cách dùng:
 * 1. Mở Apps Script Editor, chọn hàm này trong dropdown
 * 2. Nhấn nút ▶ Run (Chạy)
 * 3. Cấp quyền truy cập Google Sheets khi được hỏi
 * 4. Chờ ~10 giây, kiểm tra Google Sheet của bạn
 * ============================================================
 */
function setupSpreadsheet() {
  // Dùng openById() thay vì getActiveSpreadsheet() để chạy được từ GAS Editor
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // ============================================================
  // BƯỚC 1: TẠO SHEET HƯỚNG DẪN (đặt đầu tiên cho dễ nhìn)
  // ============================================================
  _createOrUpdateSheet(ss, '📖 HƯỚNG DẪN', [], [
    ['🎉 CHÀO MỪNG BẠN ĐẾN VỚI COACH.IO.VN CONTROL PANEL!', '', '', ''],
    ['', '', '', ''],
    ['📋 DANH SÁCH CÁC SHEET VÀ CÔNG DỤNG', '', '', ''],
    ['Tên Sheet', 'Công dụng', 'Ai chỉnh sửa', 'Ghi chú'],
    ['Tenants', 'Danh sách khách hàng (Coach/Diễn giả) đã đăng ký nền tảng', 'Admin hệ thống', 'Mỗi dòng = 1 khách hàng'],
    ['Courses', 'Danh sách khóa học hiển thị trên website', 'Coach tự cập nhật', 'Cột published=true mới hiện lên web'],
    ['Lessons', 'Danh sách bài học trong từng khóa học', 'Coach tự cập nhật', 'Liên kết với Courses qua course_id'],
    ['Leads', 'Danh sách người đã để lại email/SĐT quan tâm', 'Tự động (hệ thống ghi)', 'KHÔNG xóa dòng, chỉ xem'],
    ['Bots', 'Cấu hình AI Bot hiển thị trên trang CoachAI', 'Admin hoặc Coach', 'status=active mới hiện lên'],
    ['Projects', 'Danh sách dự án thực hành / portfolio', 'Coach tự cập nhật', 'status=active mới hiện lên'],
    ['page_content', 'Nội dung văn bản động trên website (tiêu đề, mô tả...)', 'Admin hoặc Coach', 'key là tên biến, value_vi là nội dung'],
    ['', '', '', ''],
    ['⚠️ LƯU Ý QUAN TRỌNG', '', '', ''],
    ['1. Cột tenant_id', '→ Nhập ĐÚNG tên miền của bạn (VD: ngoc.coach.io.vn)', 'BẮT BUỘC', 'Sai tên miền sẽ không hiển thị data'],
    ['2. Cột status', '→ Chỉ dùng: active / inactive / pending / published', 'BẮT BUỘC', 'Viết thường, không dấu'],
    ['3. Không xóa dòng tiêu đề', '→ Dòng 1 của mỗi sheet là tiêu đề cột', 'BẮT BUỘC', 'Xóa sẽ gây lỗi API'],
    ['4. Để lấy Spreadsheet ID', '→ Nhìn URL: docs.google.com/spreadsheets/d/[ĐÂY LÀ ID]/edit', 'Cần thiết', 'Dán vào Apps Script dòng SPREADSHEET_ID'],
    ['', '', '', ''],
    ['🆘 CẦN HỖ TRỢ? Liên hệ: support@coach.io.vn | Zalo: 0989 890 022', '', '', ''],
  ]);

  // ============================================================
  // BƯỚC 2: TẠO SHEET TENANTS - Danh sách Coach đăng ký nền tảng
  // ============================================================
  _createOrUpdateSheet(ss, 'Tenants',
    ['domain', 'app_name', 'logo_url', 'primary_color', 'contact_email', 'zalo_url', 'facebook_url', 'sepay_md5', 'bank_id', 'bank_account', 'bank_owner', 'status'],
    [
      // ✅ TENANT 1: Tài khoản gốc của hệ thống (Admin)
      ['coach.io.vn', 'Coach.io.vn', 'https://coach.io.vn/logo.png', '#4f46e5', 'support@coach.io.vn', 'https://zalo.me/0989890022', 'https://facebook.com/vibecodecoaching', '', 'techcombank', '8486568666', 'TRAN NGOC CHUYEN', 'active'],
      // ✅ TENANT 2: Mẫu sub-domain Coach (thay tên miền + thông tin thực của bạn)
      ['victor.coach.io.vn', 'Victor – AI Coach', 'https://coach.io.vn/logo-victor.png', '#10b981', 'victorchuyen@gmail.com', 'https://zalo.me/0989890022', 'https://facebook.com/victorchuyen', '', 'techcombank', '8486568666', 'TRAN NGOC CHUYEN', 'active'],
      // 📝 HÀNG MẪU CHO KHÁCH MỚI: Xóa dấu // và điền thông tin thực
      // ['ten-mien-cua-ban.coach.io.vn', 'Học viện XYZ', 'https://link-logo.com/logo.png', '#f59e0b', 'email@cua-ban.com', 'https://zalo.me/SoDienThoai', '', '', 'vietcombank', 'SO_TK_NGAN_HANG', 'TEN_CHU_TK', 'pending'],
    ]
  );

  // ============================================================
  // BƯỚC 3: TẠO SHEET COURSES - Khóa học Vibe Code AI 2026
  // (Tham khảo: Cursor.com, Buildspace.so, freeCodeCamp, Udemy bestsellers)
  // ============================================================
  _createOrUpdateSheet(ss, 'Courses',
    ['tenant_id', 'id', 'title', 'title_en', 'description', 'short_description', 'thumbnail_url', 'price_vnd', 'price_usd', 'instructor_id', 'level', 'duration_text', 'total_students', 'avg_rating', 'rating_count', 'featured', 'published', 'status', 'created_at'],
    [
      // ===== KHÓA 1: VIBE CODING (HOT NHẤT 2026) =====
      [
        'coach.io.vn',
        'course_vibe_001',
        'Vibe Coding Masterclass: Build App Thật với AI trong 30 Ngày',
        'Vibe Coding Masterclass: Build Real Apps with AI in 30 Days',
        'Khoá học thực chiến #1 về Vibe Coding tại Việt Nam. Học cách làm việc với Cursor AI, Claude, Gemini để tạo ra sản phẩm thật (không phải đồ chơi) từ ý tưởng đến deployment. Bạn sẽ build Landing Page, SaaS MVP, Telegram Bot và Chrome Extension – tất cả bằng AI, không cần background coding. Phương pháp được chứng minh bởi 500+ học viên đã ra sản phẩm thật.',
        'Build sản phẩm thật với Cursor AI, Claude & Gemini. Từ 0 đến deployed trong 30 ngày.',
        'https://i.imgur.com/vibecoding-masterclass.jpg',
        1990000, 79, 'teacher_victor_001', 'beginner', '30 ngày · 60 bài học · 18 giờ video', 847, 4.9, 312, true, true, 'published',
        '2025-09-01T00:00:00.000Z'
      ],
      // ===== KHÓA 2: NO-CODE SAAS =====
      [
        'coach.io.vn',
        'course_saas_002',
        'No-Code SaaS Builder: Ra Sản Phẩm $50/tháng Học Phí, 0 Đồng Dev',
        'No-Code SaaS Builder: Launch a $50/month Product with Zero Dev Cost',
        'Khoá học duy nhất dạy bạn xây dựng SaaS (Software as a Service) hoàn chỉnh chỉ bằng Google Sheets + Apps Script + Cloudflare Pages – không tốn 1 đồng server, không cần thuê dev. Bạn sẽ có hệ thống thu tiền tự động, quản lý học viên, gửi email marketing và phân tích doanh thu ngay sau khoá học. Phù hợp với Coaches, Freelancers, Educators muốn ra sản phẩm số nhanh.',
        'Xây SaaS thu tiền tự động bằng Google Sheets. Không server, không dev, ra tiền ngay.',
        'https://i.imgur.com/nocode-saas-builder.jpg',
        2490000, 99, 'teacher_victor_001', 'intermediate', '6 tuần · 42 bài học · 14 giờ video', 423, 4.8, 198, true, true, 'published',
        '2025-10-15T00:00:00.000Z'
      ],
      // ===== KHÓA 3: AI AGENT & PROMPT ENGINEERING =====
      [
        'coach.io.vn',
        'course_agent_003',
        'AI Agent Pro: Xây Đội Quân AI Làm Việc 24/7 Thay Bạn',
        'AI Agent Pro: Build Your AI Workforce That Works 24/7',
        'Khoá học chuyên sâu về AI Agents – xu hướng nóng nhất 2026. Học cách xây dựng Multi-Agent System với Google Gemini, n8n, và Make.com để tự động hóa toàn bộ quy trình kinh doanh: từ lead gen, content marketing, chăm sóc khách hàng đến báo cáo tài chính. Tham khảo framework của Anthropic, OpenAI và Google DeepMind. Học viên sẽ ra về với ít nhất 3 Agent đang chạy production.',
        'Build Multi-Agent AI tự động hóa kinh doanh. n8n + Gemini + Make.com thực chiến.',
        'https://i.imgur.com/ai-agent-pro.jpg',
        2990000, 119, 'teacher_victor_001', 'intermediate', '8 tuần · 56 bài học · 22 giờ video', 256, 4.9, 143, false, true, 'published',
        '2025-11-01T00:00:00.000Z'
      ],
      // ===== KHÓA 4: RAPID PROTOTYPE (coming soon) =====
      [
        'coach.io.vn',
        'course_rapid_004',
        'Rapid Prototype: Từ Ý Tưởng → Demo → Khách Hàng Trả Tiền trong 72 Giờ',
        'Rapid Prototype: Idea to Paying Customer in 72 Hours',
        'Sprint 72h build sản phẩm theo phương pháp Lean Startup kết hợp Vibe Coding. Học cách validate ý tưởng, build MVP tối giản, đưa lên production và có khách trả tiền – tất cả trong 1 cuối tuần. Khoá học phù hợp với ai muốn thử nghiệm ý tưởng kinh doanh mà không mất tháng trời code.',
        'Từ ý tưởng → khách trả tiền trong 72 giờ. Lean Startup + Vibe Coding method.',
        'https://i.imgur.com/rapid-prototype.jpg',
        990000, 39, 'teacher_victor_001', 'beginner', '3 ngày · 18 bài học · 6 giờ video', 0, 0, 0, false, false, 'coming_soon',
        '2026-01-15T00:00:00.000Z'
      ],
    ]
  );

  // ============================================================
  // BƯỚC 4: TẠO SHEET LESSONS - Bài học chi tiết
  // ============================================================
  _createOrUpdateSheet(ss, 'Lessons',
    ['tenant_id', 'id', 'course_id', 'chapter', 'title', 'title_en', 'video_url', 'doc_url', 'content', 'order', 'is_free'],
    [
      // ===== KHÓA 1: VIBE CODING - Chương 1 (Free Preview) =====
      ['coach.io.vn', 'les_v001_01', 'course_vibe_001', 'Chương 1: Tư duy Vibe Coder', 'Bài 1 [FREE]: Vibe Coding là gì? Tại sao 2026 là năm của bạn?', 'What is Vibe Coding?', 'https://youtube.com/watch?v=vibe-intro', 'https://docs.google.com/...', 'Vibe Coding là phương pháp lập trình AI-first: bạn mô tả ý tưởng bằng ngôn ngữ tự nhiên, AI viết code, bạn review và iterate. Không cần nhớ syntax, không cần debug mù quáng.', 1, true],
      ['coach.io.vn', 'les_v001_02', 'course_vibe_001', 'Chương 1: Tư duy Vibe Coder', 'Bài 2 [FREE]: So sánh Stack: Cursor vs Windsurf vs GitHub Copilot vs Gemini', 'AI Tools Comparison 2026', 'https://youtube.com/watch?v=tools-compare', '', 'Bảng so sánh chi tiết 6 công cụ Vibe Coding phổ biến nhất 2026. Khi nào dùng Cursor, khi nào dùng Claude API trực tiếp, khi nào dùng Gemini 2.0 Flash.', 2, true],
      ['coach.io.vn', 'les_v001_03', 'course_vibe_001', 'Chương 1: Tư duy Vibe Coder', 'Bài 3: Setup "Vibe Stack" hoàn hảo trong 15 phút', 'Setup Your Vibe Stack', 'https://youtube.com/watch?v=setup-stack', 'https://notion.so/setup-guide', 'Cài đặt Cursor AI + Extension pack + cấu hình MCP Servers. Template .cursorrules tối ưu cho dự án tiếng Việt.', 3, false],
      // ===== KHÓA 1 - Chương 2 =====
      ['coach.io.vn', 'les_v001_04', 'course_vibe_001', 'Chương 2: Build Landing Page trong 2 Giờ', 'Bài 4: Prompt Engineering cho UI/UX – Kỹ thuật "Describe & Iterate"', 'UI Prompt Engineering', 'https://youtube.com/watch?v=ui-prompt', '', 'Framework 5 bước để prompt AI tạo UI đẹp: Context → Style → Components → Interactions → Polish. Thực hành live với Cursor + Tailwind.', 4, false],
      ['coach.io.vn', 'les_v001_05', 'course_vibe_001', 'Chương 2: Build Landing Page trong 2 Giờ', 'Bài 5: Deploy lên Cloudflare Pages – Free, Fast, Global', 'Deploy to Cloudflare Pages', 'https://youtube.com/watch?v=cf-deploy', 'https://docs.google.com/deploy-guide', 'Deploy site tĩnh lên Cloudflare Pages miễn phí, tự động CI/CD từ GitHub. Custom domain, SSL, Edge Network toàn cầu.', 5, false],
      // ===== KHÓA 2: NO-CODE SAAS - Chương 1 =====
      ['coach.io.vn', 'les_s002_01', 'course_saas_002', 'Chương 1: Kiến trúc SaaS No-Code', 'Bài 1 [FREE]: Google Sheet làm Database – Tại sao lại hoạt động?', 'Google Sheet as Database', 'https://youtube.com/watch?v=sheet-db', '', 'Giải thích tại sao Google Sheet + Apps Script có thể thay thế hoàn toàn backend truyền thống cho MVP $0. Giới hạn và khi nào cần migrate lên Supabase/Firebase.', 1, true],
      ['coach.io.vn', 'les_s002_02', 'course_saas_002', 'Chương 1: Kiến trúc SaaS No-Code', 'Bài 2 [FREE]: Architecture Overview – Frontend + GAS API + Payment', 'SaaS Architecture Overview', 'https://youtube.com/watch?v=saas-arch', 'https://figma.com/architecture-diagram', 'Sơ đồ kiến trúc hoàn chỉnh: React SPA hosted trên Cloudflare → Google Apps Script Web API → Google Sheet DB → SEPAY Payment Gateway → Email via Resend.', 2, true],
      ['coach.io.vn', 'les_s002_03', 'course_saas_002', 'Chương 2: Build Multi-tenant Backend', 'Bài 3: Xây API doGet/doPost với Google Apps Script', 'Building GAS API', 'https://youtube.com/watch?v=gas-api', '', 'Code live viết hàm doGet xử lý multi-action (getCourses, getConfig, getBots...), doPost nhận Webhook từ Frontend. Deploy và test với Postman.', 3, false],
      // ===== KHÓA 3: AI AGENT - Chương 1 (Free Preview) =====
      ['coach.io.vn', 'les_a003_01', 'course_agent_003', 'Chương 1: AI Agent Fundamentals', 'Bài 1 [FREE]: Agent vs Chatbot – Sự khác biệt thay đổi tất cả', 'Agent vs Chatbot', 'https://youtube.com/watch?v=agent-vs-bot', '', 'Tại sao Chatbot chỉ trả lời còn Agent hành động. Kiến trúc ReAct (Reason + Act), Tool Calling, Memory Systems. Demo live Google Gemini Function Calling.', 1, true],
      ['coach.io.vn', 'les_a003_02', 'course_agent_003', 'Chương 1: AI Agent Fundamentals', 'Bài 2 [FREE]: n8n Cloud – Nền tảng Agent Automation miễn phí tốt nhất', 'n8n Cloud for Agents', 'https://youtube.com/watch?v=n8n-intro', 'https://n8n.io/docs', 'Setup n8n Cloud miễn phí, kết nối Gmail, Google Sheets, Telegram, Zalo. Build Agent đầu tiên nhận email → phân loại → reply tự động trong 20 phút.', 2, true],
      // ===== KHÓA 3: AI AGENT - Chương 2 =====
      ['coach.io.vn', 'les_a003_03', 'course_agent_003', 'Chương 2: Build Production Agents', 'Bài 3: Gemini Function Calling – Cho AI biết cách dùng Tools thật', 'Gemini Function Calling', 'https://youtube.com/watch?v=gemini-tools', 'https://ai.google.dev/docs/function_calling', 'Implement Tool Calling với Gemini API: tìm kiếm web thật, đọc Google Sheet thật, gửi email thật. Xây dựng Agent có thể hành động thay bạn.', 3, false],
      ['coach.io.vn', 'les_a003_04', 'course_agent_003', 'Chương 2: Build Production Agents', 'Bài 4: Multi-Agent System – Phân vai cho từng AI chuyên biệt', 'Multi-Agent Architecture', 'https://youtube.com/watch?v=multi-agent', '', 'Thiết kế hệ thống nhiều Agent phối hợp: Researcher Agent → Writer Agent → Publisher Agent. Framework Orchestrator-Worker. Demo với CrewAI + Gemini.', 4, false],
      ['coach.io.vn', 'les_a003_05', 'course_agent_003', 'Chương 2: Build Production Agents', 'Bài 5: Deploy Agent 24/7 + Monitoring – Không bao giờ offline', 'Deploy & Monitor Agents', 'https://youtube.com/watch?v=deploy-agent', 'https://notion.so/agent-deploy-guide', 'Deploy Agent lên Cloudflare Workers (serverless, free tier rất lớn). Thiết lập health check, alert Telegram khi Agent lỗi. Logging với Loki/Grafana free tier.', 5, false],
      // ===== KHÓA 4: RAPID PROTOTYPE =====
      ['coach.io.vn', 'les_r004_01', 'course_rapid_004', 'Ngày 1 (Sáng): Validate Ý Tưởng', 'Bài 1 [FREE]: The 10-Minute Idea Test – Tốt hay vứt trong 10 phút', 'The 10-Minute Idea Test', 'https://youtube.com/watch?v=idea-test', '', 'Framework đánh giá ý tưởng nhanh: Problem/Solution Fit, Market Size estimate, Competitor scan bằng Gemini AI. Quyết định build hay pivot chỉ trong 10 phút.', 1, true],
      ['coach.io.vn', 'les_r004_02', 'course_rapid_004', 'Ngày 1 (Chiều): Build MVP', 'Bài 2 [FREE]: MVP Blueprint – Cắt bỏ tất cả, giữ lại 1 tính năng cốt lõi', 'MVP Blueprint', 'https://youtube.com/watch?v=mvp-blueprint', 'https://docs.google.com/mvp-template', 'Kỹ thuật MoSCoW để xác định Must-have vs Nice-to-have. Template MVP blueprint 1 trang. Cách dùng Cursor để vibe-code chỉ phần cốt lõi trong 4 giờ.', 2, true],
      ['coach.io.vn', 'les_r004_03', 'course_rapid_004', 'Ngày 2: Deploy & Get Feedback', 'Bài 3: Zero to Live in 2 Hours – Deploy, Domain, Analytics', 'Deploy to Production', 'https://youtube.com/watch?v=rapid-deploy', '', 'Checklist deploy nhanh: Cloudflare Pages setup (10 phút), custom domain (15 phút), Google Analytics 4 (5 phút), Hotjar heatmap (5 phút). Tổng: dưới 2 giờ.', 3, false],
    ]
  );

  // ============================================================
  // BƯỚC 5: TẠO SHEET LEADS - Mẫu data (thực tế sẽ auto-fill)
  // ============================================================
  _createOrUpdateSheet(ss, 'Leads',
    ['tenant_id', 'name', 'email', 'phone', 'note', 'source', 'created_at'],
    [
      // Dữ liệu mẫu minh họa định dạng (hệ thống tự ghi khi có lead thật)
      ['coach.io.vn', 'Nguyễn Văn An', 'an.nguyen@gmail.com', '0901234567', 'Quan tâm khóa Vibe Coding, hỏi về học phí trả góp', 'lead_popup', '2026-03-01T08:30:00.000Z'],
      ['coach.io.vn', 'Trần Thị Bình', 'binh.tran@outlook.com', '0912345678', 'Muốn build app cho quán cà phê của mình, không biết code', 'contact_form', '2026-03-05T14:22:00.000Z'],
      ['coach.io.vn', 'Lê Minh Cường', 'cuong.dev@gmail.com', '', 'Đã là developer, muốn học AI Agent để tự build SaaS', 'coachai_chat', '2026-03-10T09:15:00.000Z'],
      ['coach.io.vn', 'Phạm Thu Hương', 'phamthuhuong@yahoo.com', '0933445566', 'Giáo viên tiếng Anh, muốn ra khóa học online nhưng chưa biết bắt đầu từ đâu', 'facebook_ad', '2026-03-12T11:00:00.000Z'],
      ['coach.io.vn', 'Hoàng Đức Mạnh', 'manh.hoang.dev@gmail.com', '0978901234', 'Freelancer web dev, muốn dùng AI để nhận thêm dự án, tăng giờ bill', 'zalo_group', '2026-03-15T16:45:00.000Z'],
      ['coach.io.vn', 'Võ Thị Nga', 'vonga.coach@gmail.com', '0945678901', 'Đang có 200 học viên offline, muốn chuyển lên online với thương hiệu riêng', 'referral', '2026-03-18T09:00:00.000Z'],
      // ⬇ Từ đây trở xuống là dữ liệu THẬT do hệ thống tự ghi - KHÔNG XÓA
    ]
  );

  // ============================================================
  // BƯỚC 6: TẠO SHEET BOTS - AI Hub cấu hình
  // ============================================================
  _createOrUpdateSheet(ss, 'Bots',
    ['tenant_id', 'id', 'title', 'slug', 'role_target', 'category', 'short_desc', 'long_desc', 'button_primary_text', 'button_primary_url', 'button_secondary_text', 'button_secondary_url', 'thumbnail_url', 'status', 'featured', 'sort_order', 'language'],
    [
      // BOT 1: Trợ lý học viên
      ['coach.io.vn', 'bot_student_001', '🎓 Trợ lý Học Viên AI', 'student-ai-assistant', 'student', 'gem', 'Hỏi bất kỳ điều gì về lộ trình học, bài tập, hay khái niệm khó hiểu trong khóa học', 'Trợ lý AI cá nhân 24/7 cho học viên. Giải thích code, gợi ý lộ trình học phù hợp với mục tiêu của bạn, review bài tập và trả lời mọi câu hỏi về Vibe Coding & AI. Powered by Google Gemini 2.0 Flash.', 'Chat ngay', 'https://gemini.google.com/gem/student-vibe-coach', 'Xem lộ trình', 'https://coach.io.vn/courses', '', 'active', true, 1, 'vi'],
      // BOT 2: Coach chiến lược kinh doanh
      ['coach.io.vn', 'bot_teacher_001', '💼 AI Coach Kinh Doanh', 'business-strategy-coach', 'teacher', 'gem', 'Lên kế hoạch kinh doanh, định giá khóa học, thiết kế phễu bán hàng và marketing tự động', 'AI Coach chuyên về chiến lược kinh doanh cho Coaches & Educators. Phân tích thị trường, gợi ý mức giá tối ưu, thiết kế sales funnel, lên kế hoạch content 30 ngày và tự động hóa marketing. Dựa trên dữ liệu thực tế từ 1000+ Coaches Việt Nam.', 'Tư vấn ngay', 'https://gemini.google.com/gem/business-coach', 'Xem case study', '', '', 'active', true, 2, 'vi'],
      // BOT 3: Code Review AI
      ['coach.io.vn', 'bot_dev_001', '🔍 AI Code Reviewer', 'ai-code-reviewer', 'all', 'gem', 'Paste code vào đây để được review, tìm bug, đề xuất tối ưu và giải thích từng dòng', 'Senior AI Engineer review code của bạn theo chuẩn production. Phát hiện bug, security vulnerabilities, performance issues và đề xuất refactor. Hỗ trợ React/TypeScript, Python, Google Apps Script, SQL. Giải thích bằng tiếng Việt dễ hiểu.', 'Review Code', 'https://gemini.google.com/gem/code-reviewer-vi', '', '', '', 'active', false, 3, 'vi'],
      // BOT 4: NotebookLM Research
      ['coach.io.vn', 'bot_research_001', '📚 AI Research Assistant', 'research-notebooklm', 'all', 'notebooklm', 'Upload tài liệu, PDF, video YouTube để hỏi đáp, tóm tắt và tạo quiz tự động', 'Powered by Google NotebookLM. Upload bất kỳ tài liệu nào (PDF, URL, YouTube, Google Docs) và đặt câu hỏi theo ngữ cảnh. Tạo podcast từ tài liệu, flashcard ôn thi, và mindmap tự động. Hoàn hảo cho nghiên cứu và học tập sâu.', 'Mở NotebookLM', 'https://notebooklm.google.com', 'Hướng dẫn sử dụng', '', '', 'active', false, 4, 'vi'],
      // BOT 5: Prompt Engineer
      ['coach.io.vn', 'bot_prompt_001', '✨ Prompt Engineer Pro', 'prompt-engineer', 'all', 'gem', 'Tối ưu prompt của bạn để AI cho ra kết quả chính xác hơn 10 lần', 'AI Coach chuyên về Prompt Engineering. Nhập prompt thô của bạn, AI sẽ phân tích và viết lại theo framework CLEAR (Context, Language, Examples, Audience, Result). Hỗ trợ prompt cho Cursor, ChatGPT, Claude, Gemini và Midjourney.', 'Tối ưu Prompt', 'https://gemini.google.com/gem/prompt-engineer', '', '', '', 'coming_soon', false, 5, 'vi'],
    ]
  );

  // ============================================================
  // BƯỚC 7: TẠO SHEET PROJECTS - Portfolio thực chiến
  // ============================================================
  _createOrUpdateSheet(ss, 'Projects',
    ['tenant_id', 'id', 'title', 'description', 'thumbnail_url', 'demo_url', 'github_url', 'tags', 'author', 'status', 'sort_order'],
    [
      ['coach.io.vn', 'proj_001', '🚀 Coach.io.vn – SaaS Giáo Dục Multi-tenant', 'Nền tảng SaaS giáo dục cho phép bất kỳ Coach/Diễn giả nào tạo website khoá học thương hiệu riêng trong 30 phút. Tech stack: React + Vite + Cloudflare Pages + Google Apps Script + Firebase Auth. 0 đồng server cost. Đang phục vụ 50+ Coaches.', 'https://i.imgur.com/coach-saas.jpg', 'https://coach.io.vn', 'https://github.com/chuyentn/coachai', 'React,TypeScript,Cloudflare,GAS,Firebase,SaaS', 'Victor Chuyen', 'active', 1],
      ['coach.io.vn', 'proj_002', '🤖 AI Email Marketing Bot – n8n + Gmail + Gemini', 'Agent tự động phân loại email lead, phân tích nhu cầu bằng Gemini AI, và gửi email marketing cá nhân hóa theo từng segment. Tăng open rate 340% so với email blast thông thường. Build trong 48 giờ bởi học viên khoá AI Agent.', 'https://i.imgur.com/email-bot.jpg', 'https://demo.coach.io.vn/email-bot', '', 'n8n,Gemini,Gmail,Automation,Python', 'Nguyễn Hoàng Nam (học viên)', 'active', 2],
      ['coach.io.vn', 'proj_003', '📊 Dashboard Doanh Thu Thời Gian Thực – Google Sheets + React', 'Dashboard quản lý doanh thu cho một chuỗi cửa hàng 5 chi nhánh. Data từ Google Sheets, hiển thị real-time qua React + Recharts. Tự động gửi báo cáo Zalo mỗi sáng lúc 8h. Build bằng Vibe Coding trong 3 ngày.', 'https://i.imgur.com/revenue-dashboard.jpg', 'https://demo.coach.io.vn/dashboard', '', 'React,GoogleSheets,GAS,Recharts,Zalo', 'Trần Minh Khoa (học viên)', 'active', 3],
      ['coach.io.vn', 'proj_004', '🎯 Landing Page Generator – Mô tả → Website trong 5 Phút', 'Tool AI cho phép nhập mô tả kinh doanh → tự động generate toàn bộ landing page (copy, design, sections) bằng Gemini. Export HTML hoặc deploy thẳng lên Cloudflare. Build bằng Cursor AI trong weekend hackathon.', 'https://i.imgur.com/landing-gen.jpg', 'https://landing-gen.coach.io.vn', 'https://github.com/vibecode/landing-gen', 'React,Gemini,Cloudflare,AI-Generation', 'Victor Chuyen + Học viên', 'active', 4],
    ]
  );

  // ============================================================
  // BƯỚC 8: TẠO SHEET PAGE_CONTENT - Nội dung văn bản website
  // ============================================================
  _createOrUpdateSheet(ss, 'page_content',
    ['tenant_id', 'key', 'value_vi', 'value_en', 'status', 'updated_at'],
    [
      // --- Hero Section ---
      ['coach.io.vn', 'hero_title', 'Vibe Code AI|Biến Ý Tưởng Thành Sản Phẩm', 'Vibe Code AI|Turn Ideas Into Products', 'active', new Date().toISOString()],
      ['coach.io.vn', 'hero_subtitle', 'Học cách làm việc với Cursor, Claude & Gemini để build app thật – không cần background coding. 500+ học viên đã ra sản phẩm.', 'Learn to work with Cursor, Claude & Gemini to build real apps – no coding background needed. 500+ students shipped products.', 'active', new Date().toISOString()],
      ['coach.io.vn', 'cta_primary', '🚀 Bắt đầu miễn phí', 'Start for free 🚀', 'active', new Date().toISOString()],
      ['coach.io.vn', 'cta_secondary', 'Xem Demo 60 giây', 'Watch 60s Demo', 'active', new Date().toISOString()],
      // --- Social Proof ---
      ['coach.io.vn', 'social_proof_1', '500+ học viên đã ra sản phẩm thật', '500+ students shipped real products', 'active', new Date().toISOString()],
      ['coach.io.vn', 'social_proof_2', '4.9/5 ⭐ đánh giá trung bình', '4.9/5 ⭐ average rating', 'active', new Date().toISOString()],
      ['coach.io.vn', 'social_proof_3', '30 phút setup · 0 đồng server', '30-min setup · $0 server cost', 'active', new Date().toISOString()],
      // --- SEO ---
      ['coach.io.vn', 'seo_description', 'Coach.io.vn – Nền tảng học Vibe Coding & AI thực chiến #1 Việt Nam. Học Cursor AI, Claude, Gemini để build SaaS, Landing Page, AI Agent. Không cần biết code. Cam kết ra sản phẩm sau 30 ngày.', 'Coach.io.vn – Vietnam #1 Vibe Coding & AI learning platform. Learn Cursor AI, Claude, Gemini to build SaaS, Landing Pages, AI Agents. No coding background needed.', 'active', new Date().toISOString()],
      // --- Contact ---
      ['coach.io.vn', 'support_email', 'support@coach.io.vn', 'support@coach.io.vn', 'active', new Date().toISOString()],
      ['coach.io.vn', 'admin_zalo_phone', '0989890022', '0989890022', 'active', new Date().toISOString()],
      ['coach.io.vn', 'admin_telegram_user', '@victorchuyen', '@victorchuyen', 'active', new Date().toISOString()],
      // --- Courses Section ---
      ['coach.io.vn', 'courses_section_title', 'Khóa Học Thực Chiến AI 2026', 'AI Practical Courses 2026', 'active', new Date().toISOString()],
      ['coach.io.vn', 'courses_section_subtitle', 'Từ zero đến có sản phẩm chạy thật – không lý thuyết suông', 'From zero to shipped product – no fluffy theory', 'active', new Date().toISOString()],
    ]
  );

  // DONE: Hiển thị thông báo thành công (chỉ hoạt động khi mở từ Google Sheet, không phải GAS Editor)
  try {
    SpreadsheetApp.getUi().alert(
      '✅ Setup hoàn tất!',
      'Đã tạo đầy đủ:\n' +
      '• 📖 Sheet HƯỚNG DẪN (đọc trước)\n' +
      '• Tenants, Courses, Lessons, Leads, Bots, Projects, page_content\n\n' +
      '🔑 Bước tiếp theo:\n' +
      '1. Copy Spreadsheet ID từ URL\n' +
      '2. Dán vào dòng SPREADSHEET_ID trong Apps Script\n' +
      '3. Deploy lại Web App (New Deployment)\n\n' +
      '📋 Đọc sheet [📖 HƯỚNG DẪN] để biết cách điền data!',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch(e) {
    // Chạy từ GAS Editor không có UI context — bỏ qua, xem Nhật ký thực thi (Execution Log)
    Logger.log('ℹ️ UI alert skipped (running from Script Editor, not Sheet).');
  }

  Logger.log('✅ setupSpreadsheet() completed successfully! All sheets created.');

}

/**
 * Helper nội bộ: Tạo hoặc cập nhật một sheet với header và seed data
 * Nếu sheet đã tồn tại → bỏ qua (không overwrite data thực tế của khách hàng)
 */
function _createOrUpdateSheet(ss, sheetName, headers, seedRows) {
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    // Sheet chưa tồn tại → tạo mới
    sheet = ss.insertSheet(sheetName);
    Logger.log('✅ Created sheet: ' + sheetName);
  } else {
    Logger.log('⏭ Sheet already exists, skipping: ' + sheetName);
    return; // Sheet đã có data → không ghi đè
  }

  // Ghi header (dòng 1)
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    // Format header: Bold, màu nền xanh nhạt
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#E8F0FE');
    headerRange.setFontColor('#1a1a2e');
    sheet.setFrozenRows(1); // Khóa dòng tiêu đề
  }

  // Ghi seed data (từ dòng 2)
  if (seedRows.length > 0) {
    // Lọc bỏ dòng comment (không phải array)
    const validRows = seedRows.filter(row => Array.isArray(row));
    if (validRows.length > 0 && headers.length > 0) {
      sheet.getRange(2, 1, validRows.length, headers.length).setValues(validRows);
    }
  }

  // Auto-resize cột cho dễ đọc
  if (headers.length > 0) {
    sheet.autoResizeColumns(1, Math.min(headers.length, 10));
  }
}


/* ================================================================
 * ✉️  CRM EMAIL MODULE
 * Coach.io.vn — Tích hợp Resend API + Email Templates
 * ================================================================ */

/**
 * [API-GET] Trả về danh sách email templates cho Control Panel HTML
 * Usage: ?action=getEmailTemplates&tenant_id=coach.io.vn
 */
function getCRMEmailTemplates(tenantId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CRM_CONFIG.templates_sheet);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const templates = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    const rowTenantId = row[4] || 'coach.io.vn'; // col E = tenant_id
    if (tenantId && rowTenantId !== tenantId && tenantId !== 'all') continue;
    templates.push({ id: String(row[0]), name: row[1], subject: row[2], body: row[3] });
  }
  return templates;
}

/**
 * [API-GET] Lấy email logs gần nhất
 * Usage: ?action=getEmailLogs&tenant_id=coach.io.vn
 */
function getCRMEmailLogs(tenantId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CRM_CONFIG.logs_sheet);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const logs = [];
  for (let i = Math.max(1, data.length - 50); i < data.length; i++) { // chỉ lấy 50 dòng gần nhất
    const row = data[i];
    if (!row[0]) continue;
    logs.push({
      timestamp: row[0], type: row[1], templateId: row[2],
      to: row[3], subject: row[4], statusCode: row[5], status: row[6]
    });
  }
  return logs.reverse(); // mới nhất lên đầu
}

/**
 * Tìm template theo ID
 */
function _crmGetTemplateById(id) {
  const all = getCRMEmailTemplates('all');
  return all.find(t => String(t.id) === String(id)) || null;
}

/**
 * Gửi email via Resend API + ghi log
 */
function _crmSendEmail(toEmails, subject, htmlBody, templateId, type) {
  if (!CRM_CONFIG.resendApiKey) {
    _crmLog(type || 'template', templateId, toEmails.join(','), subject, 0, 'NO_API_KEY', 'RESEND_API_KEY chưa được cấu hình trong Script Properties');
    return { success: false, error: 'RESEND_API_KEY chưa cấu hình. Vào Script Properties để thêm.' };
  }

  const payload = {
    from: CRM_CONFIG.fromEmail,
    to: toEmails,
    subject: subject,
    html: htmlBody
  };

  try {
    const res = UrlFetchApp.fetch('https://api.resend.com/emails', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + CRM_CONFIG.resendApiKey },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const code = res.getResponseCode();
    const bodyText = res.getContentText();
    const ok = code >= 200 && code < 300;
    _crmLog(type || 'template', templateId, toEmails.join(','), subject, code, ok ? 'OK' : 'ERROR', bodyText);
    return { success: ok, statusCode: code, message: ok ? 'Đã gửi cho ' + toEmails.join(', ') : 'Lỗi Resend: ' + bodyText };
  } catch (err) {
    _crmLog(type || 'template', templateId, toEmails.join(','), subject, 0, 'EXCEPTION', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Gửi email chào mừng lead mới
 */
function _crmSendWelcome(leadData) {
  if (!leadData || !leadData.email) return false;
  const name = leadData.name || '';
  const email = leadData.email;

  const html = `<!DOCTYPE html>
<html lang="vi"><head><meta charset="UTF-8">
<style>body{font-family:'Segoe UI',sans-serif;background:#f9fafb;padding:0;margin:0;}
.wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);}
.hero{background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px;text-align:center;color:white;}
.hero h1{margin:0;font-size:22px;}
.hero p{margin:8px 0 0;opacity:.9;font-size:14px;}
.body{padding:32px;}
.body p{color:#374151;line-height:1.7;margin:0 0 16px;}
.cta{display:inline-block;padding:12px 28px;background:#4f46e5;color:white;border-radius:99px;text-decoration:none;font-weight:600;font-size:14px;}
.links{background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0;}
.links p{margin:4px 0;font-size:13px;}
.links a{color:#4f46e5;}
.footer{padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #f3f4f6;}
</style></head><body>
<div class="wrap">
  <div class="hero">
    <h1>🚀 Chào mừng bạn tới Coach.io.vn!</h1>
    <p>Vibe Code AI · Build real products with AI in 30 days</p>
  </div>
  <div class="body">
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Cảm ơn bạn đã quan tâm đến <strong>Vibe Code AI</strong> — cộng đồng học cách làm việc với Cursor AI, Claude & Gemini để build sản phẩm thật, không cần background coding.</p>
    <p>Để bắt đầu, bạn có thể xem demo ngay hoặc đặt lịch tư vấn 1:1 miễn phí 30 phút với Coach Chuyên:</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${CRM_CONFIG.demoLink}" class="cta" style="margin-right:8px;">🎯 Xem Demo</a>
      &nbsp;&nbsp;
      <a href="${CRM_CONFIG.calLink}" class="cta" style="background:#10b981;">📅 Đặt lịch 1:1</a>
    </div>
    <p>Trong vài ngày tới, mình sẽ gửi cho bạn:</p>
    <ul style="color:#374151;line-height:2;">
      <li>Cách chọn đúng tool AI phù hợp với mục tiêu của bạn</li>
      <li>Quy trình Vibe Coding từ ý tưởng → sản phẩm</li>
      <li>Case study: học viên đã ra sản phẩm thật như thế nào</li>
    </ul>
    <div class="links">
      <p>📌 Tham gia cộng đồng để cập nhật sớm nhất:</p>
      <p>• <a href="https://www.facebook.com/groups/vibecodecoaching">Facebook Group · Vibe Code Coaching</a></p>
      <p>• <a href="https://zalo.me/g/tdhmtu261">Zalo Group · Coach.io.vn</a></p>
      <p>• <a href="https://t.me/vibecodocoaching">Telegram · @vibecodocoaching</a></p>
    </div>
    <p>Nếu cần hỗ trợ ngay: Zalo/WhatsApp <a href="https://zalo.me/0989890022">0989 890 022</a> · Telegram <a href="https://t.me/victorchuyen">@victorchuyen</a></p>
    <p>Hẹn gặp bạn trong buổi học đầu tiên! 🔥</p>
    <p>Coach Chuyên · Coach.io.vn</p>
  </div>
  <div class="footer">© 2026 Coach.io.vn · <a href="mailto:support@coach.io.vn" style="color:#9ca3af;">Hủy đăng ký</a></div>
</div>
</body></html>`;

  return _crmSendEmail([email], 'Chào mừng bạn đến Coach.io.vn 🚀 · Vibe Code AI', html, 'welcome', 'welcome').success;
}

/**
 * Ghi log email vào sheet Email Logs
 */
function _crmLog(type, templateId, to, subject, statusCode, statusText, raw) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CRM_CONFIG.logs_sheet);
    if (!sheet) return;
    sheet.appendRow([new Date().toISOString(), type, templateId||'', to||'', subject||'', statusCode||'', statusText||'', (raw||'').toString().slice(0,500)]);
  } catch(e) { Logger.log('Log error: ' + e.message); }
}

/**
 * ============================================================
 * 🤖 setupCRMSheets() — Tạo Email Templates + Logs Sheets
 * Chạy 1 lần qua GAS Editor hoặc menu
 * ============================================================
 */
function setupCRMSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // === Email Templates Sheet ===
  _createOrUpdateSheet(ss, CRM_CONFIG.templates_sheet,
    ['id', 'name', 'subject', 'body_html', 'tenant_id'],
    [
      [1, 'Chào mừng dùng thử', 'Chào mừng bạn đến Coach.io.vn 🚀',
       `<p>Chào {{name}},</p><p>Cảm ơn bạn đã đăng ký. Mình sẽ gửi link demo và lộ trình học trong 24h tới.</p><p>Đặt lịch 1:1 tại: <a href="${CRM_CONFIG.calLink}">cal.com/victorchuyen/coachai</a></p><p>Coach Chuyên</p>`,
       'coach.io.vn'],
      [2, 'Follow-up ngày 2 – Chưa phản hồi', 'Bạn đã thử Vibe Coding chưa, {{name}}?',
       `<p>Chào {{name}},</p><p>2 ngày trước bạn đã đăng ký quan tâm Vibe Code AI. Bạn đã có thời gian thử chưa?</p><p>Nếu muốn mình gợi ý kịch bản áp dụng, hãy reply email này với: Ngành nghề + Mục tiêu của bạn.</p><p>Coach Chuyên</p>`,
       'coach.io.vn'],
      [3, 'Mời đặt lịch tư vấn 1:1', 'Hẹn {{name}} 1 buổi 30 phút để build sản phẩm thật',
       `<p>Chào {{name}},</p><p>Mình đề xuất một buổi trao đổi 1:1 miễn phí 30 phút để:</p><ul><li>Chọn tool AI phù hợp với mục tiêu của bạn</li><li>Lên kế hoạch build sản phẩm cụ thể</li></ul><p><a href="${CRM_CONFIG.calLink}">👉 Đặt lịch tại đây</a></p><p>Coach Chuyên</p>`,
       'coach.io.vn'],
      [4, 'Follow-up nhắc lịch tư vấn', 'Nhắc {{name}} về buổi tư vấn Vibe Code AI',
       `<p>Chào {{name}},</p><p>Nhắc bạn về buổi tư vấn sắp tới. Nếu cần dời lịch, trả lời email này hoặc Zalo: <a href="https://zalo.me/0989890022">0989 890 022</a>.</p><p>Coach Chuyên</p>`,
       'coach.io.vn'],
      [5, 'Case study áp dụng', '3 cách {{name}} có thể áp dụng Vibe Coding ngay tuần này',
       `<p>Chào {{name}},</p><p>Dựa trên 500+ học viên đã qua khoá, có 3 hướng áp dụng Vibe Coding nhanh nhất:</p><ol><li>Build Landing Page + form thu lead trong 2 giờ</li><li>Tạo Telegram Bot báo cáo tự động mỗi sáng</li><li>Build dashboard Google Sheets → React hiển thị doanh thu real-time</li></ol><p>Bạn muốn bắt đầu với hướng nào? Reply email này nhé.</p><p>Coach Chuyên</p>`,
       'coach.io.vn'],
      [6, 'Re-activation sau 14 ngày', 'Còn hứng thú với Vibe Code AI không, {{name}}?',
       `<p>Chào {{name}},</p><p>Đã ~2 tuần từ khi bạn quan tâm Vibe Code AI. Reply email này với từ khoá <b>"Kích hoạt lại"</b> – mình gửi ngay gói tài liệu + hướng dẫn quickstart. Hoặc <b>"Tạm dừng"</b> nếu không còn nhu cầu.</p><p>Coach Chuyên</p>`,
       'coach.io.vn'],
      [7, 'Giới thiệu cộng đồng', 'Tài nguyên miễn phí dành cho {{name}}',
       `<p>Chào {{name}},</p><p>Ngoài khoá học, mình có cộng đồng miễn phí chia sẻ tips AI hàng tuần:</p><ul><li><a href="https://facebook.com/groups/vibecodecoaching">Facebook Group</a></li><li><a href="https://zalo.me/g/tdhmtu261">Zalo Group</a></li><li><a href="https://t.me/vibecodocoaching">Telegram</a></li></ul><p>Coach Chuyên</p>`,
       'coach.io.vn'],
      [8, 'Upsell khoá No-Code SaaS', 'Build SaaS thu tiền tự động – không cần dev, {{name}}',
       `<p>Chào {{name}},</p><p>Khoá <b>No-Code SaaS Builder</b> dạy bạn xây hệ thống thu tiền tự động chỉ bằng Google Sheets + Apps Script + Cloudflare. 0 đồng server.</p><p>Đăng ký sớm: <a href="${CRM_CONFIG.demoLink}/courses">coach.io.vn/courses</a></p><p>Coach Chuyên</p>`,
       'coach.io.vn'],
      [9, 'Xin feedback ngắn', '1 câu hỏi nhỏ dành cho {{name}}',
       `<p>Chào {{name}},</p><p><b>Điều gì khiến bạn do dự khi bắt đầu Vibe Coding?</b></p><p>Trả lời 2-3 dòng, mình sẽ giúp bạn tháo gỡ cụ thể. Feedback của bạn giúp mình cải thiện khoá học.</p><p>Coach Chuyên</p>`,
       'coach.io.vn'],
      [10, 'Email cảm ơn & closure', 'Cảm ơn {{name}} đã trải nghiệm Coach.io.vn',
       `<p>Chào {{name}},</p><p>Cảm ơn bạn đã theo dõi chuỗi email từ Coach.io.vn. Nếu sau này cần hỗ trợ về Vibe Coding, AI Agent, hay build SaaS – chỉ cần reply email này hoặc Zalo <a href="https://zalo.me/0989890022">0989 890 022</a>.</p><p>Chúc bạn nhiều sức khoẻ và thành công! 🚀</p><p>Coach Chuyên · Coach.io.vn</p>`,
       'coach.io.vn'],
    ]
  );

  // === Email Logs Sheet ===
  _createOrUpdateSheet(ss, CRM_CONFIG.logs_sheet,
    ['timestamp', 'type', 'template_id', 'to', 'subject', 'status_code', 'status', 'raw_response'],
    []
  );

  Logger.log('✅ CRM Sheets created: Email Templates + Email Logs');
}

/**
 * Trigger hàng ngày: gửi follow-up cho leads đủ điều kiện
 * Tạo trigger: Apps Script → Triggers → Add Trigger → dailyFollowup → Time-driven → Day
 */
function dailyFollowup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CRM_CONFIG.leads_sheet);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const now = new Date();
  let count = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const email = row[2];  // col C
    const stage = row[7];  // col H
    const lastEmailAt = row[8]; // col I
    if (!email) continue;

    const diffDays = lastEmailAt ? Math.floor((now - new Date(lastEmailAt)) / 86400000) : 999;

    // Follow-up ngày 2 nếu chưa phản hồi sau welcome
    if (stage === 'welcome_sent' && diffDays >= 2) {
      const tmpl = _crmGetTemplateById('2');
      if (tmpl) {
        const body = tmpl.body.replace(/{{name}}/g, row[1]||'').replace(/{{email}}/g, email);
        const result = _crmSendEmail([email], tmpl.subject.replace(/{{name}}/g, row[1]||''), body, '2', 'followup');
        if (result.success) {
          sheet.getRange(i + 1, 8).setValue('followup1');
          sheet.getRange(i + 1, 9).setValue(now.toISOString());
          count++;
        }
      }
    }
  }

  Logger.log('✅ dailyFollowup: sent to ' + count + ' leads');
  return count;
}


/* ================================================================
 * 🔐  ADMIN AUTH MODULE
 * Token-based session: 24h, stored in Script Properties (server-side)
 * Setup: Script Properties → ADMIN_EMAIL, ADMIN_PASSWORD
 *   PropertiesService.getScriptProperties().setProperties({
 *     'ADMIN_EMAIL': 'support@coach.io.vn',
 *     'ADMIN_PASSWORD': 'your-strong-passphrase'
 *   })
 * ================================================================ */

/**
 * Admin Login — POST action: admin-login
 * Returns: { success, token, email, expiresAt } or { error }
 */
function adminLogin(email, password) {
  const props = PropertiesService.getScriptProperties();
  const adminEmail = props.getProperty('ADMIN_EMAIL') || '';
  const adminPass  = props.getProperty('ADMIN_PASSWORD') || '';

  // Multi-admin support: check against Admins sheet (col: email, password_hash, role, status)
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let isValid = false;
  let adminRole = 'admin';

  // Check 1: Script Properties (quick hardcoded admin)
  if (email === adminEmail && password === adminPass && adminEmail) {
    isValid = true;
  }

  // Check 2: Admins sheet (supports adding more admins without code change)
  if (!isValid) {
    const adminsSheet = ss.getSheetByName('Admins');
    if (adminsSheet) {
      const data = adminsSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (String(row[0]).trim() === email.trim() &&
            String(row[1]).trim() === password.trim() &&
            String(row[3] || 'active').toLowerCase() === 'active') {
          isValid = true;
          adminRole = row[2] || 'admin'; // col C = role
          break;
        }
      }
    }
  }

  if (!isValid) {
    return { error: 'Email hoặc mật khẩu không đúng.' };
  }

  // Generate session token: base64(email:timestamp:secret)
  const secret = props.getProperty('TOKEN_SECRET') || 'coach_secret_2026';
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  const rawToken = email + ':' + expiresAt + ':' + secret;
  const token = Utilities.base64EncodeWebSafe(rawToken);

  // Store active tokens in Script Properties (max 10 active sessions)
  const existingTokens = JSON.parse(props.getProperty('ACTIVE_TOKENS') || '{}');
  existingTokens[token] = { email, role: adminRole, expiresAt };
  // Cleanup expired tokens
  Object.keys(existingTokens).forEach(t => {
    if (existingTokens[t].expiresAt < Date.now()) delete existingTokens[t];
  });
  props.setProperty('ACTIVE_TOKENS', JSON.stringify(existingTokens));

  Logger.log('✅ Admin login: ' + email + ' | Role: ' + adminRole);

  return { success: true, token, email, role: adminRole, expiresAt };
}

/**
 * Validate admin token — call at top of protected actions
 * Returns: { valid, email, role } or { valid: false, error }
 */
function validateAdminToken(token) {
  if (!token) return { valid: false, error: 'Không có token. Vui lòng đăng nhập.' };

  const props = PropertiesService.getScriptProperties();
  const existingTokens = JSON.parse(props.getProperty('ACTIVE_TOKENS') || '{}');
  const session = existingTokens[token];

  if (!session) return { valid: false, error: 'Token không hợp lệ. Vui lòng đăng nhập lại.' };
  if (session.expiresAt < Date.now()) return { valid: false, error: 'Phiên đăng nhập đã hết hạn (24h). Vui lòng đăng nhập lại.' };

  return { valid: true, email: session.email, role: session.role };
}

/**
 * Admin Logout — invalidate token
 */
function adminLogout(token) {
  if (!token) return { success: true };
  const props = PropertiesService.getScriptProperties();
  const tokens = JSON.parse(props.getProperty('ACTIVE_TOKENS') || '{}');
  delete tokens[token];
  props.setProperty('ACTIVE_TOKENS', JSON.stringify(tokens));
  return { success: true, message: 'Đã đăng xuất.' };
}

/**
 * Setup Admins sheet — chạy 1 lần
 */
function setupAdminsSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  _createOrUpdateSheet(ss, 'Admins',
    ['email', 'password', 'role', 'status', 'created_at', 'last_login'],
    [
      // ⚠️ THAY MẬT KHẨU THỰC TẾ — xóa dòng này sau khi setup
      ['support@coach.io.vn', 'CHANGE_ME_NOW', 'super_admin', 'active', new Date().toISOString(), ''],
      // Thêm admin khác bên dưới: [email, password, role (admin/viewer), active/inactive]
    ]
  );
  Logger.log('✅ Admins sheet created. REMEMBER to change the password!');
}
