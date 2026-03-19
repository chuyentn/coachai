/**
 * UNIFIED GOOGLE APPS SCRIPT FOR EDU VIBE CODE COACHING
 * Version: 5.0 - Hỗ trợ Schema Giáo Viên (Teachers) & Bổ sung Hệ sinh thái AI Hub (Bots, Courses AI, Page Content)
 * 
 * Script này xử lý:
 * 1. GET: Lấy dữ liệu Khóa học, Leads, Giáo viên, Bots, và Cấu hình trang (trả về JSON).
 * 2. POST: Lưu Leads, Bình luận, và Đăng ký Giáo viên (tự động tạo sheet và tiêu đề cột).
 * 3. SETUP: Tự động khởi tạo các tab với tiêu đề cột chuẩn và bơm dữ liệu AI giả định (Seed Data).
 */

// --- CẤU HÌNH CÁC CỘT (SCHEMA) DỰA TRÊN HÌNH ẢNH THỰC TẾ VÀ YÊU CẦU ---
const SCHEMA = {
  /**
   * CHUẨN DATA V6 - WORLD CLASS STANDARD
   * -------------------------------------------------------------
   */
  'courses': ['id', 'title', 'title_en', 'description', 'description_en', 'instructor', 'price', 'thumbnail_url', 'category_id', 'level', 'duration_text', 'rating_avg', 'rating_count', 'created_at'],
  'lessons': ['id', 'course_id', 'chapter', 'title', 'title_en', 'content', 'video_url', 'doc_url', 'order', 'is_free', 'created_at'],
  'leads': ['id', 'name', 'email', 'phone', 'message', 'course_id', 'created_at'],
  'comments': ['id', 'course_id', 'user_id', 'user_name', 'content', 'rating', 'created_at'],
  'lesson_progress': ['id', 'user_id', 'course_id', 'lesson_id', 'status', 'updated_at'],
  'notes': ['id', 'user_id', 'course_id', 'lesson_id', 'content', 'created_at'],
  'bots': ['id', 'name', 'description', 'avatar_url', 'system_prompt', 'welcome_message', 'category', 'language', 'role_target', 'status', 'is_active', 'sort_order', 'tags', 'created_at'],
  'projects': ['id', 'title', 'category', 'tech_stack', 'description', 'badge', 'demo_url', 'status', 'sort_order', 'created_at'],
  'page_content': ['key', 'value_vi', 'value_en', 'status', 'updated_at'],
  'courses_ai': ['id', 'title', 'instructor', 'gemini_url', 'notebook_url', 'thumbnail_url', 'description', 'status'],
  'quizzes': ['id', 'course_id', 'lesson_id', 'question', 'options', 'correct_answer', 'explanation'],
  'quiz_attempts': ['id', 'user_id', 'lesson_id', 'score', 'total_questions', 'timestamp'],
  'certificates': ['id', 'user_id', 'course_id', 'issue_date', 'cert_url', 'status'],
  'withdrawals': ['id', 'user_id', 'amount', 'status', 'payment_info', 'created_at'],
  'config': ['key', 'value', 'description'],
  'teachers': ['id', 'name', 'email', 'phone', 'bio', 'status', 'created_at']
};

/**
 * Helper to get raw data from a sheet (alias for getSheetDataAsJsonRaw)
 */
function getSheetDataRaw(ss, sheetName) {
  return getSheetDataAsJsonRaw(ss, sheetName);
}

/**
 * Xử lý yêu cầu GET
 * Sử dụng: ?action=getCourses hoặc ?action=getLeads hoặc ?action=getTeachers hoặc ?action=setup, v.v
 */
/**
 * Tạo menu tùy chỉnh khi mở Sheet
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 CoachAI Admin')
    .addItem('Cài đặt lại hệ thống (Reset)', 'manualReset')
    .addSeparator()
    .addItem('Bơm data mẫu chuẩn', 'manualSeed')
    .addToUi();
}

function manualReset() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('CẢNH BÁO', 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu hiện tại để cài đặt lại theo chuẩn mới?', ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName() !== 'Sheet1') { // Giữ lại sheet mặc định nếu cần
        ss.deleteSheet(sheets[i]);
      }
    }
    setupSheets(ss);
    ui.alert('Thành công', 'Hệ thống đã được reset về chuẩn Standard V5.', ui.ButtonSet.OK);
  }
}

function manualSeed() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheets(ss);
  SpreadsheetApp.getUi().alert('Đã kiểm tra và bơm thêm data nếu thiếu.');
}

/**
 * Cập nhật tiến độ bài học (Standard V6)
 */
function updateLessonProgress(ss, data) {
  var sheet = getOrCreateSheet(ss, 'lesson_progress');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var userIdIdx = headers.indexOf('user_id');
  var courseIdIdx = headers.indexOf('course_id');
  var lessonIdIdx = headers.indexOf('lesson_id');
  var statusIdx = headers.indexOf('status');
  var updatedAtIdx = headers.indexOf('updated_at');
  
  var found = false;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][userIdIdx]) === String(data.user_id) && 
        String(rows[i][lessonIdIdx]) === String(data.lesson_id)) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(data.status);
      sheet.getRange(i + 1, updatedAtIdx + 1).setValue(new Date().toISOString());
      found = true;
      break;
    }
  }
  
  if (!found) {
    if (!data.id) data.id = 'prog_' + Utilities.getUuid().substring(0, 8);
    data.updated_at = new Date().toISOString();
    return saveRecord(ss, 'lesson_progress', data);
  }
  
  return createJsonResponse({ success: true, message: "Progress updated" });
}

/**
 * Lưu ghi chú bài học (Standard V6)
 */
function saveNote(ss, data) {
  var sheet = getOrCreateSheet(ss, 'notes');
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var userIdIdx = headers.indexOf('user_id');
  var lessonIdIdx = headers.indexOf('lesson_id');
  var contentIdx = headers.indexOf('content');
  
  var found = false;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][userIdIdx]) === String(data.user_id) && 
        String(rows[i][lessonIdIdx]) === String(data.lesson_id)) {
      sheet.getRange(i + 1, contentIdx + 1).setValue(data.content);
      found = true;
      break;
    }
  }
  
  if (!found) {
    if (!data.id) data.id = 'note_' + Utilities.getUuid().substring(0, 8);
    data.created_at = new Date().toISOString();
    return saveRecord(ss, 'notes', data);
  }
  
  return createJsonResponse({ success: true, message: "Note saved" });
}

function doGet(e) {
  // Kiểm tra nếu chạy trực tiếp trong trình soạn thảo
  if (!e || !e.parameter) {
    return createJsonResponse({ 
      message: "Script is active. Use ?action=getCourses, getLeads, getLessons, getBots, getConfig or setup",
      status: "online"
    });
  }

  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'getCourses') {
    return getSheetDataAsJson(ss, 'courses');
  } else if (action === 'getLessons') {
    var courseId = e.parameter.courseId;
    var data = getSheetDataAsJsonRaw(ss, 'lessons');
    if (courseId) {
      data = data.filter(function(row) { 
        return String(row.course_id || row.CourseID) === String(courseId); 
      });
    }
    return createJsonResponse(data);
  } else if (action === 'getLessonProgress') {
    var userId = e.parameter.userId;
    var courseId = e.parameter.courseId;
    var data = getSheetDataAsJsonRaw(ss, 'lesson_progress');
    if (userId) {
      data = data.filter(function(row) { return String(row.user_id) === String(userId); });
    }
    if (courseId) {
      data = data.filter(function(row) { return String(row.course_id) === String(courseId); });
    }
    return createJsonResponse(data);
  } else if (action === 'getNotes') {
    var userId = e.parameter.userId;
    var lessonId = e.parameter.lessonId;
    var data = getSheetDataAsJsonRaw(ss, 'notes');
    if (userId) data = data.filter(function(row) { return String(row.user_id) === String(userId); });
    if (lessonId) data = data.filter(function(row) { return String(row.lesson_id) === String(lessonId); });
    return createJsonResponse(data);
  } else if (action === 'getLeads') {
    return getSheetDataAsJson(ss, 'leads');
  } else if (action === 'getTeachers') {
    return getSheetDataAsJson(ss, 'teachers');
  } else if (action === 'getBots') {
    var role = e.parameter.role || 'all';
    var lang = e.parameter.lang || 'vi';
    return getCoachAIBots(ss, role, lang);
  } else if (action === 'getProjects') {
    return getSheetDataAsJson(ss, 'projects');
  } else if (action === 'getComments') {
    return getSheetDataAsJson(ss, 'comments');
  } else if (action === 'getConfig') {
    var lang = e.parameter.lang || 'vi';
    return getCoachAIConfig(ss, lang);
  } else if (action === 'getQuizzes') {
    var lessonId = e.parameter.lessonId;
    var data = getSheetDataRaw(ss, 'quizzes');
    if (lessonId) data = data.filter(function(row) { return String(row.lesson_id) === String(lessonId); });
    return createJsonResponse(data);
  } else if (action === 'getCertificates') {
    var userId = e.parameter.userId;
    var data = getSheetDataRaw(ss, 'certificates');
    if (userId) data = data.filter(function(row) { return String(row.user_id) === String(userId); });
    return createJsonResponse(data);
  } else if (action === 'getInstructorStats') {
    var instructorId = e.parameter.instructorId;
    return getInstructorStats(ss, instructorId);
  } else if (action === 'setup') {
    return setupSheets(ss);
  }
  
  return createJsonResponse({ error: 'Invalid action.' });
}

/**
 * Xử lý yêu cầu POST
 * Lưu dữ liệu Leads, Bình luận và Đăng ký Giáo viên
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Đợi tối đa 10 giây để tránh xung đột ghi dữ liệu

  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    // Xử lý lưu Lead (Khách hàng đăng ký tư vấn)
    if (data.type === 'lead') {
      var sheet = getOrCreateSheet(ss, 'leads');
      sheet.appendRow([
        timestamp, 
        data.email, 
        data.name || '',
        data.phone || '',
        data.note || ''
      ]);
      return createJsonResponse({ result: 'success', message: 'Lead saved successfully' });
    } 
    
    // Xử lý lưu Comment (Bình luận khóa học)
    else if (data.type === 'comment') {
      var sheet = getOrCreateSheet(ss, 'comments');
      sheet.appendRow([
        timestamp, 
        data.userName, 
        data.userEmail || '',
        data.content, // Ghi vào cột 'Comment Text'
        data.userId, 
        data.photoUrl || '',
        data.content  // Ghi vào cột 'Comment'
      ]);
      return createJsonResponse({ result: 'success', message: 'Comment saved successfully' });
    }
    
    // Xử lý lưu đơn Đăng ký Giáo Viên
    else if (data.type === 'teacher') {
      var sheet = getOrCreateSheet(ss, 'teachers');
      sheet.appendRow([
        timestamp, 
        data.email, 
        data.name || '',
        data.phone || '',
        data.expertise || '',
        data.bio || '',
        'Pending', // Mặc định là Pending (Chờ duyệt)
        '', // Để trống Firebase UID (Admin sẽ điền)
        'teacher' // Mặc định role xin cấp là teacher
      ]);
      return createJsonResponse({ result: 'success', message: 'Teacher application saved successfully' });
    }

    // Xử lý CẬP NHẬT tiến độ học tập (V6)
    else if (data.type === 'updateLessonProgress') {
      return updateLessonProgress(ss, data);
    }
    
    // Xử lý LƯU ghi chú bài học (V6)
    else if (data.type === 'saveNote') {
      return saveNote(ss, data);
    }
    
    // Xử lý NỘP bài trắc nghiệm (V7)
    else if (data.type === 'submitQuiz') {
      data.id = 'qa_' + Utilities.getUuid().substring(0,8);
      data.timestamp = new Date().toISOString();
      return saveRecord(ss, 'quiz_attempts', data);
    }

    // Xử lý YÊU CẦU rút tiền (V7)
    else if (data.type === 'withdrawal') {
      data.id = 'wdr_' + Utilities.getUuid().substring(0,8);
      data.status = 'pending';
      data.created_at = new Date().toISOString();
      return saveRecord(ss, 'withdrawals', data);
    }

    // Xử lý CẬP NHẬT dữ liệu (Dành cho Admin/Teacher)
    else if (data.type === 'update') {
      var sheetName = data.sheet;
      var id = data.id;
      var updates = data.updates; // Object { field: value }
      
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return createJsonResponse({ result: 'error', message: 'Sheet not found: ' + sheetName });
      
      var dataRange = sheet.getDataRange().getValues();
      var headers = dataRange[0];
      var idIndex = headers.indexOf('id');
      if (idIndex === -1) idIndex = headers.indexOf('ID');
      if (idIndex === -1) idIndex = 0; // Fallback to first column

      for (var i = 1; i < dataRange.length; i++) {
        if (String(dataRange[i][idIndex]) === String(id)) {
           // Found the row! Update the columns
           for (var key in updates) {
             var colIndex = headers.indexOf(key);
             if (colIndex !== -1) {
                sheet.getRange(i + 1, colIndex + 1).setValue(updates[key]);
             }
           }
           return createJsonResponse({ result: 'success', message: 'Record updated successfully' });
        }
      }
      return createJsonResponse({ result: 'error', message: 'Record with ID ' + id + ' not found in ' + sheetName });
    }

    return createJsonResponse({ result: 'error', message: 'Unknown data type' });
  } catch (err) {
    return createJsonResponse({ result: 'error', error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// --- CÁC HÀM HỖ TRỢ (HELPER FUNCTIONS) ---

/**
 * Lấy thống kê cho Giảng viên (V7 Elite)
 */
function getInstructorStats(ss, instructorId) {
  var courses = getSheetDataRaw(ss, 'courses');
  var instructorCourses = courses.filter(function(c) { return String(c.instructor_id) === String(instructorId); });
  var courseIds = instructorCourses.map(function(c) { return String(c.id); });
  
  var totalStudents = instructorCourses.reduce(function(sum, c) { return sum + (Number(c.total_students) || 0); }, 0);
  var totalRevenueVND = instructorCourses.reduce(function(sum, c) { return sum + (Number(c.price_vnd) * (Number(c.total_students) || 0)); }, 0);
  
  // Lấy đánh giá trung bình
  var avgRating = instructorCourses.length > 0 
    ? instructorCourses.reduce(function(sum, c) { return sum + (Number(c.rating_avg) || 0); }, 0) / instructorCourses.length 
    : 0;

  return createJsonResponse({
    course_count: instructorCourses.length,
    total_students: totalStudents,
    total_revenue_vnd: totalRevenueVND,
    avg_rating: Math.round(avgRating * 10) / 10,
    courses: instructorCourses.map(function(c) {
      return { id: c.id, title: c.title, students: c.total_students, rating: c.rating_avg };
    })
  });
}

/**
 * Lấy danh sách Bots theo role và language (Hệ thống AI Hub)
 */
function getCoachAIBots(ss, role, lang) {
  var sheet = ss.getSheetByName('bots');
  if (!sheet) return createJsonResponse({ error: "Sheet bots not found. Run ?action=setup first." });
  
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return createJsonResponse([]);
  
  var headers = data[0];
  var json = [];
  
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    
    var isLangMatch = obj.language === lang || !obj.language;
    var isRoleMatch = role === 'all' || obj.role_target === role || obj.role_target === 'all';
    var isActive = obj.status === 'active' || obj.status === 'coming_soon';
    
    if (isLangMatch && isRoleMatch && isActive) {
       json.push(obj);
    }
  }
  
  // Sắp xếp theo sort_order
  json.sort(function(a, b) {
     return (parseInt(a.sort_order) || 99) - (parseInt(b.sort_order) || 99);
  });
  
  return createJsonResponse(json);
}

/**
 * Lấy Cấu hình (Hero Content) (Hệ thống AI Hub)
 */
function getCoachAIConfig(ss, lang) {
  var sheetPage = ss.getSheetByName('page_content');
  var sheetBots = ss.getSheetByName('bots');
  
  if (!sheetPage || !sheetBots) {
      return createJsonResponse({ error: "Required sheets not found. Run ?action=setup first." });
  }

  // Parse Config (Dynamic Keys)
  var pageData = sheetPage.getDataRange().getValues();
  var pHeaders = pageData[0];
  var pageContent = {};
  
  for (var i = 1; i < pageData.length; i++) {
     var row = {};
     for (var j = 0; j < pHeaders.length; j++) row[pHeaders[j]] = pageData[i][j];
     
     if (row.status === 'active' && row.key) {
       pageContent[row.key] = lang === 'en' ? row.value_en : row.value_vi;
     }
  }
  
  // Legacy support for hero object
  var hero = { 
    title: pageContent['hero_title'] || "", 
    subtitle: pageContent['hero_subtitle'] || "" 
  };
  
  // Parse All Bots instead of just filtered
  var botsData = sheetBots.getDataRange().getValues();
  var bHeaders = botsData[0];
  var activeBots = [];
  
  for (var i = 1; i < botsData.length; i++) {
     var botRow = {};
     for (var j = 0; j < bHeaders.length; j++) botRow[bHeaders[j]] = botsData[i][j];
     if (botRow.status === 'active' || botRow.status === 'coming_soon') {
        activeBots.push(botRow);
     }
  }
  
  activeBots.sort(function(a, b) {
     return (parseInt(a.sort_order) || 99) - (parseInt(b.sort_order) || 99);
  });
  
  return createJsonResponse({ hero: hero, content: pageContent, bots: activeBots });
}

/**
 * Lấy hoặc tạo mới một Sheet nếu chưa tồn tại
 */
/**
 * Lấy hoặc tạo mới một Sheet nếu chưa tồn tại. 
 * Nếu sheet tồn tại nhưng chỉ có 1 dòng (tiêu đề), tiến hành bơm data mẫu.
 */
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headers = SCHEMA[name];
    if (headers) {
      sheet.appendRow(headers);
      formatHeader(sheet, headers.length);
    }
  }
  
  // Kiểm tra nếu sheet chỉ có 1 dòng (chỉ có tiêu đề) thì bơm data mẫu
  if (sheet.getLastRow() === 1) {
    seedDataForSheet(sheet, name);
  }
  
  return sheet;
}

/**
 * Định dạng dòng tiêu đề
 */
function formatHeader(sheet, colCount) {
  sheet.getRange(1, 1, 1, colCount)
    .setFontWeight('bold')
    .setBackground('#f3f3f3')
    .setBorder(true, true, true, true, true, true);
  sheet.setFrozenRows(1);
}

/**
 * Bơm dữ liệu mẫu (Seed Data) chuẩn Marketing & High-conversion
 */
function seedDataForSheet(sheet, name) {
  var timestamp = new Date().toISOString();
  
  if (name === 'page_content') {
    sheet.appendRow(['hero_title', 'Coach AI | Đột phá thu nhập với AI & No-Code', 'Coach AI | Breakthrough Income with AI & No-Code', 'active', timestamp]);
    sheet.appendRow(['hero_subtitle', 'Lộ trình từ Zero đến HERO cho người mới. Xây dựng trợ lý AI, Tự động hóa công việc và kiếm tiền bền vững.', 'Zero-to-HERO roadmap for beginners. Build AI assistants, automate tasks, and earn sustainable income.', 'active', timestamp]);
    sheet.appendRow(['logo_url', 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo_2017.svg', 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo_2017.svg', 'active', timestamp]);
    sheet.appendRow(['seo_description', 'Hệ thống đào tạo AI & No-Code chuyên nghiệp. Xây dựng trợ lý AI và tự động hóa doanh nghiệp.', 'Professional AI & No-Code training system. Build AI assistants and automate your business.', 'active', timestamp]);
    sheet.appendRow(['cta_primary', 'Tham gia Ngay', 'Join Now', 'active', timestamp]);
    sheet.appendRow(['cta_secondary', 'Lịch hẹn Coaching', 'Book Coaching', 'active', timestamp]);
    
    // Social & Support Links
    sheet.appendRow(['fb_group_url', 'https://www.facebook.com/groups/vibecodecoaching', 'https://www.facebook.com/groups/vibecodecoaching', 'active', timestamp]);
    sheet.appendRow(['zalo_group_url', 'https://zalo.me/g/tdhmtu261', 'https://zalo.me/g/tdhmtu261', 'active', timestamp]);
    sheet.appendRow(['telegram_group_url', 'https://t.me/vibecodocoaching', 'https://t.me/vibecodocoaching', 'active', timestamp]);
    sheet.appendRow(['whatsapp_group_url', 'https://chat.whatsapp.com/E2SNci7FscqCi3i4yCUt2W', 'https://chat.whatsapp.com/E2SNci7FscqCi3i4yCUt2W', 'active', timestamp]);
    sheet.appendRow(['whatsapp_channel_url', 'https://whatsapp.com/channel/0029VbD8X5jLNSZzIImuYz3w', 'https://whatsapp.com/channel/0029VbD8X5jLNSZzIImuYz3w', 'active', timestamp]);
    
    // Admin Contact (Direct Links)
    sheet.appendRow(['admin_zalo_phone', '0989890022', '0989890022', 'active', timestamp]);
    sheet.appendRow(['admin_telegram_user', 'https://t.me/victorchuyen', 'https://t.me/victorchuyen', 'active', timestamp]);
    sheet.appendRow(['support_email', 'support@coachai.vn', 'support@coachai.vn', 'active', timestamp]);
    sheet.appendRow(['company_name', 'CoachAI - Victor Chuyen', 'CoachAI - Victor Chuyen', 'active', timestamp]);
    sheet.appendRow(['admin_whatsapp_link', 'https://zalo.me/0989890022', 'https://zalo.me/0989890022', 'active', timestamp]);
  }

  if (name === 'courses') {
    // Khóa 01
    sheet.appendRow([
      'ai-no-code-mastery', 'Làm chủ AI & No-Code 2024 (Thực chiến)', 'Mastering AI & No-Code 2024 (Practical)', 
      'Khóa học giúp bạn xây dựng ứng dụng AI hoàn chỉnh mà không cần biết lập trình.', 
      'Build complete AI applications without writing any code. From 0 to deployment.',
      'Lộ trình Xây App AI Không Code', 'Roadmap to Build AI Apps No-Code',
      1200000, 50, 'https://picsum.photos/seed/ai-mastery/800/450', 'victor_chuyen', 
      'true', 'true', 1420, 92, 4.9, timestamp, 
      JSON.stringify([
        { id: 'l1', title: 'Video 1: Tổng quan AI & Cơ hội No-Code', title_en: 'Video 1: AI Overview & No-Code Ops', video_url: 'https://vimeo.com/demo1', order: 1 },
        { id: 'l2', title: 'Video 2: Thiết lập trợ lý AI với GPT-4o', title_en: 'Video 2: Setup AI Assistant with GPT-4o', video_url: 'https://vimeo.com/demo2', order: 2 },
        { id: 'l3', title: 'Video 3: Đóng gói sản phẩm thành Web App', title_en: 'Video 3: Packaging into Web App', video_url: 'https://vimeo.com/demo3', order: 3 }
      ])
    ]);
    // Khóa 02
    sheet.appendRow([
      'mmo-ai-automation', 'Kiếm tiền với Affiliate & AI Automation', 'MMO with Affiliate & AI Automation', 
      'Sử dụng AI để tự động hóa việc tạo nội dung và tối ưu chuyển đổi Affiliate.', 
      'Use AI to automate content creation and optimize Affiliate conversions.',
      'Kiếm tiền thụ động với AI', 'Passive Income with AI',
      1500000, 75, 'https://picsum.photos/seed/mmo-automation/800/450', 'victor_chuyen', 
      'true', 'true', 2150, 68, 4.8, timestamp, 
      JSON.stringify([
        { id: 'l1', title: 'Video 1: Tư duy MMO & Chọn ngách ngàn đô', title_en: 'Video 1: MMO Mindset & Niche Selection', video_url: 'https://vimeo.com/demo4', order: 1 },
        { id: 'l2', title: 'Video 2: AI tự động hóa Video ngắn (TikTok/Reels)', title_en: 'Video 2: AI Automation for Short Videos', video_url: 'https://vimeo.com/demo5', order: 2 }
      ])
    ]);
    // Khóa 03
    sheet.appendRow([
      'ai-marketing-advanced', 'AI Marketing & Branding Chuyên Sâu', 'Advanced AI Marketing & Branding', 
      'Xây dựng thương hiệu cá nhân và quy trình Marketing tự động 100% bằng AI.', 
      'Build a personal brand and 100% automated AI marketing workflows.',
      'Đột phá Marketing với AI', 'Breakthrough Marketing with AI',
      1800000, 90, 'https://picsum.photos/seed/ai-marketing/800/450', 'victor_chuyen', 
      'true', 'true', 850, 45, 4.7, timestamp, 
      JSON.stringify([
        { id: 'l1', title: 'Video 1: Branding 4.0 với AI', title_en: 'Video 1: Branding 4.0 with AI', video_url: 'https://vimeo.com/demo6', order: 1 }
      ])
    ]);
  }

  if (name === 'lessons') {
    // Chương 1 cho Khóa 01
    sheet.appendRow(['l1', 'ai-no-code-mastery', 'Chương 1: Tư duy & Công cụ', 'Bài 1: Tổng quan AI 2024', 'Lesson 1: AI 2024 Overview', 'Nội dung bài học về xu hướng AI...', 'https://vimeo.com/demo1', 'https://docs.google.com/doc1', 1, 'true', timestamp]);
    sheet.appendRow(['l2', 'ai-no-code-mastery', 'Chương 1: Tư duy & Công cụ', 'Bài 2: Tại sao chọn No-Code?', 'Lesson 2: Why No-Code?', 'Lợi ích của việc build app nhanh...', 'https://vimeo.com/demo2', 'https://docs.google.com/doc2', 2, 'false', timestamp]);
    
    // Chương 2 cho Khóa 01
    sheet.appendRow(['l3', 'ai-no-code-mastery', 'Chương 2: Thực chiến dự án', 'Bài 3: Xây dựng Chatbot GPT', 'Lesson 3: Building GPT Chatbot', 'Hướng dẫn chi tiết từng bước...', 'https://vimeo.com/demo3', 'https://docs.google.com/doc3', 3, 'false', timestamp]);
    
    
    // Khóa 03
    sheet.appendRow(['l5', 'ai-marketing-advanced', 'Chương 1: Branding cơ bản', 'Bài 1: AI & Thương hiệu cá nhân', 'Lesson 1: AI & Personal Brand', 'Cách dùng AI để branding...', 'https://vimeo.com/demo6', 'https://docs.google.com/doc6', 1, 'true', timestamp]);
  }
  
  if (name === 'bots') {
     sheet.appendRow([
        'bot_student_01', 'Trợ Lý Lộ Trình Học AI', 'student-pathway', 'student', 'gem', 
        'Hỏi về lộ trình học AI từ cơ bản đến nâng cao.', '', 'Mở Cố Vấn Gem', 'https://gemini.google.com/', 
        'Bắt đầu học', '/courses', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg', 
        '', 'admin', 'admin@example.com', 'active', true, 1, 'vibe-coach,newbie', 'vi', timestamp, ''
     ]);
      sheet.appendRow([
      'bot_mmo_01', 'AI Affiliate Mastermind', 'mmo-master', 'student', 'gem', 
      'Chiến lược MMO & Affiliate thực chiến với AI.', '', 'Mở Mastermind', 'https://gemini.google.com/', 
      'Cộng đồng', 'https://facebook.com/groups/...', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg', 
      '', 'admin', 'admin@example.com', 'active', true, 2, 'mmo,money', 'vi', timestamp, ''
    ]);
    sheet.appendRow([
      'bot_coding_01', 'AI Coding Coach', 'coding-coach', 'student', 'gem', 
      'Hỗ trợ lập trình viên tối ưu code và debug bằng AI.', '', 'Mở Workshop', 'https://gemini.google.com/', 
      'Tài liệu', '/docs', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg', 
      '', 'admin', 'admin@example.com', 'active', true, 3, 'coding,debug', 'vi', timestamp, ''
    ]);
  }

  if (name === 'projects') {
    sheet.appendRow([
      'proj_001', 'Chatbot Tư Vấn Bất Động Sản AI', 'AI/No-Code', 'Typebot, ChatGPT API, Google Sheets', 
      'Tự động thu thập lead, trả lời 24/7 thay thế nhân viên trực page. Đồng bộ dữ liệu real-time.', 
      'Mới', 'https://github.com/...', 'active', 1, timestamp
    ]);
    sheet.appendRow([
      'proj_002', 'Hệ Thống Tự Động Viết Bài SEO', 'Automation', 'Make.com, OpenAI, WordPress', 
      'Lấy tin tức mỗi sáng, tóm tắt và tự viết bài dài chuẩn SEO, tự động schedule đăng bài lên web.', 
      'Phổ biến', 'https://github.com/...', 'active', 2, timestamp
    ]);
    sheet.appendRow([
      'proj_003', 'Hệ Thống Quản Lý Giáo Dục LMS 2024', 'LMS', 'React, Firebase, Google Sheets', 
      'Giải pháp quản lý đào tạo tinh gọn cho các trung tâm và chuyên gia dạy online.', 
      'Elite', 'https://github.com/...', 'active', 3, timestamp
    ]);
  }

  if (name === 'teachers') {
    sheet.appendRow([timestamp, 'victor@example.com', 'Victor Chuyen', '090123456', 'AI Automation expert', 'Leading AI education in VN', 'Active', 'uid_123', 'admin']);
    sheet.appendRow([timestamp, 'lucky@example.com', 'Lucky FE', '090778899', 'Frontend Maven', 'React & Tailwind specialist', 'Active', 'uid_456', 'teacher']);
  }

  if (name === 'leads') {
    sheet.appendRow([timestamp, 'test_user@gmail.com', 'Học viên tiềm năng', '0987654321', 'Quan tâm khóa học AI No-code']);
  }

  if (name === 'comments') {
    sheet.appendRow([timestamp, 'Minh Anh', 'minh_anh@example.com', 'Khóa học cực chất, app chạy mượt!', 'user_001', 'https://i.pravatar.cc/150?u=1', 'Khóa học cực chất, app chạy mượt!']);
  }

  if (name === 'courses_ai') {
    sheet.appendRow(['course_001', 'Mastering AI', 'Victor', 'https://gemini.google.com/', 'https://notebooklm.google.com/', '', '', 'active']);
  }

  if (name === 'quizzes') {
    sheet.appendRow(['q1', 'ai-no-code-mastery', 'l1', 'AI là gì?', 'Trí tuệ nhân tạo,Trí tuệ con người,Máy tính,Robot', 'Trí tuệ nhân tạo', 'AI là Artificial Intelligence.']);
    sheet.appendRow(['q2', 'ai-no-code-mastery', 'l1', 'No-code là gì?', 'Không dùng code,Dùng code,Lập trình,Web', 'Không dùng code', 'No-code cho phép xây dựng ứng dụng không cần lập trình.']);
  }

  if (name === 'certificates') {
    sheet.appendRow(['cert_001', 'user_123', 'ai-no-code-mastery', timestamp, 'https://edu.victorchuyen.com/cert/123', 'verified']);
  }

  if (name === 'config') {
    sheet.appendRow(['min_withdrawal', '500000', 'Mức rút tối thiểu']);
    sheet.appendRow(['commission_rate', '0.2', 'Tỷ lệ hoa hồng']);
  }
}

/**
 * Đọc dữ liệu từ Sheet và chuyển sang định dạng JSON
 */
function getSheetDataAsJson(ss, sheetName) {
  var data = getSheetDataAsJsonRaw(ss, sheetName);
  return createJsonResponse(data);
}

/**
 * Lấy dữ liệu từ Sheet dưới dạng mảng JSON Objects (Raw data)
 */
function getSheetDataAsJsonRaw(ss, sheetName) {
  var sheet = getOrCreateSheet(ss, sheetName);
  if (!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return []; // Chỉ có tiêu đề hoặc trống
  
  var headers = data[0];
  var json = [];
  
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var cellValue = data[i][j];
      var head = headers[j];
      if (!head) continue;
      
      // Xử lý các trường hợp đặc biệt (ví dụ: ngày tháng)
      if (cellValue instanceof Date) {
        obj[head] = cellValue.toISOString();
      } else {
        obj[head] = cellValue;
      }
    }
    json.push(obj);
  }
  return json;
}

/**
 * Khởi tạo tất cả các sheet cần thiết
 */
function setupSheets(ss) {
  Object.keys(SCHEMA).forEach(function(name) {
    getOrCreateSheet(ss, name);
  });
  return createJsonResponse({ 
    result: 'success', 
    message: 'All sheets initialized with correct headers.' 
  });
}

/**
 * Tạo phản hồi HTTP dưới dạng JSON
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * HÀM TEST SETUP (CHẠY TRỰC TIẾP TRONG EDITOR)
 * Nếu bạn muốn tạo lại toàn bộ sheet, hãy chọn hàm 'runSetup' ở trên đầu và nhấn 'Chạy'.
 */
function runSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log("Bắt đầu setup toàn bộ sheets...");
  setupSheets(ss);
  Logger.log("Hoàn tất setup!");
}
