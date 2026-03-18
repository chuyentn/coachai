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
  'Courses': [
    'id', 'title', 'title_en', 'description', 'description_en', 'short_description', 'short_description_en',
    'price_vnd', 'price_usd', 'thumbnail_url', 'instructor_id', 'published', 'featured', 
    'total_students', 'total_reviews', 'avg_rating', 'created_at', 'modules'
  ],
  'Leads': [
    'Timestamp', 'Email', 'Name', 'Phone', 'note'
  ],
  'Comments': [
    'Timestamp', 'User Name', 'User Email', 'Comment Text', 'User ID', 'Photo URL', 'Comment'
  ],
  'Teachers': [
    // Thông tin cơ bản từ Form đăng ký
    'Timestamp', 'Email', 'Full Name', 'Phone', 'Expertise (Chuyên môn)', 'Bio (Giới thiệu)', 
    // Các cột dành riêng cho Admin phân quyền nội bộ
    'Status (Trạng thái)', 'Firebase UID', 'Role (Phân quyền)'
  ],
  
  // -- CÁC MODULE MỚI THÊM VÀO CHO AI HUB --
  'bots': [
    'id', 'title', 'slug', 'role_target', 'category', 'short_desc', 'long_desc', 
    'button_primary_text', 'button_primary_url', 'button_secondary_text', 'button_secondary_url', 
    'thumbnail_url', 'course_slug', 'owner_role', 'owner_email', 'status', 'featured', 
    'sort_order', 'tags', 'language', 'updated_at', 'updated_by'
  ],
  'courses_ai': [
    'course_slug', 'course_name', 'teacher_name', 'gem_url', 'notebooklm_url', 
    'support_doc_url', 'pricing_url', 'status'
  ],
  'page_content': [
    'key', 'value_vi', 'value_en', 'status', 'updated_at'
  ]
};

/**
 * Xử lý yêu cầu GET
 * Sử dụng: ?action=getCourses hoặc ?action=getLeads hoặc ?action=getTeachers hoặc ?action=setup, v.v
 */
function doGet(e) {
  // Kiểm tra nếu chạy trực tiếp trong trình soạn thảo
  if (!e || !e.parameter) {
    return createJsonResponse({ 
      message: "Script is active. Use ?action=getCourses, getLeads, getTeachers, getBots, getConfig or setup",
      status: "online"
    });
  }

  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'getCourses') {
    return getSheetDataAsJson(ss, 'Courses');
  } else if (action === 'getLeads') {
    return getSheetDataAsJson(ss, 'Leads');
  } else if (action === 'getTeachers') {
    return getSheetDataAsJson(ss, 'Teachers');
  } else if (action === 'getBots') {
    var role = e.parameter.role || 'all';
    var lang = e.parameter.lang || 'vi';
    return getCoachAIBots(ss, role, lang);
  } else if (action === 'getConfig') {
    var lang = e.parameter.lang || 'vi';
    return getCoachAIConfig(ss, lang);
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
      var sheet = getOrCreateSheet(ss, 'Leads');
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
      var sheet = getOrCreateSheet(ss, 'Comments');
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
      var sheet = getOrCreateSheet(ss, 'Teachers');
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

    return createJsonResponse({ result: 'error', message: 'Unknown data type' });
  } catch (err) {
    return createJsonResponse({ result: 'error', error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// --- CÁC HÀM HỖ TRỢ (HELPER FUNCTIONS) ---

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

  // Parse Config
  var pageData = sheetPage.getDataRange().getValues();
  var pHeaders = pageData[0];
  var hero = { title: "", subtitle: "" };
  
  for (var i = 1; i < pageData.length; i++) {
     var row = {};
     for (var j = 0; j < pHeaders.length; j++) row[pHeaders[j]] = pageData[i][j];
     
     if (row.status === 'active') {
       if (row.key === 'hero_title') hero.title = lang === 'en' ? row.value_en : row.value_vi;
       if (row.key === 'hero_subtitle') hero.subtitle = lang === 'en' ? row.value_en : row.value_vi;
     }
  }
  
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
  
  return createJsonResponse({ hero: hero, bots: activeBots });
}

/**
 * Lấy hoặc tạo mới một Sheet nếu chưa tồn tại
 */
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headers = SCHEMA[name];
    if (headers) {
      sheet.appendRow(headers);
      // Định dạng tiêu đề: In đậm, nền xám nhạt, kẻ bảng
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#f3f3f3')
        .setBorder(true, true, true, true, true, true);
      sheet.setFrozenRows(1); // Cố định dòng đầu tiên

      // Nếu là sheet page_content, thêm dữ liệu mẫu (Seed Data)
      if (name === 'page_content') {
        sheet.appendRow(['hero_title', 'Coach AI - Chọn trợ lý đúng mục tiêu', 'Coach AI - Choose the right assistant', 'active', new Date().toISOString()]);
        sheet.appendRow(['hero_subtitle', 'Học AI, làm dự án, kiếm tiền cùng trợ lý phù hợp.', 'Learn AI, build projects, make money with the right assistant.', 'active', new Date().toISOString()]);
      }
      
      // Seed data mẫu cho bots
      if (name === 'bots') {
         // id, title, slug, role_target, category, short_desc, long_desc, button_primary_text, button_primary_url, button_secondary_text, button_secondary_url, thumbnail_url, course_slug, owner_role, owner_email, status, featured, sort_order, tags, language
         sheet.appendRow([
           'bot_student_01', 'Coach AI cho Học viên', 'student-gem', 'student', 'gem', 
           'Hỏi nhanh về lộ trình học AI và cách bắt đầu.', '', 'Mở Gem', 'https://gemini.google.com/', 
           'Xem khóa học', 'https://edu.victorchuyen.net/courses', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg', 
           '', 'admin', 'admin@example.com', 'active', true, 1, 'ai,học tập,cơ bản', 'vi', new Date().toISOString(), ''
         ]);
         sheet.appendRow([
          'bot_teacher_01', 'Coach AI - Trợ lý giảng viên', 'teacher-gem', 'teacher', 'gem', 
          'Giúp soạn outline, tối ưu khóa học, tạo FAQ nhanh.', '', 'Mở Gem', 'https://gemini.google.com/', 
          'Hỗ trợ Docs', 'https://docs.google.com/', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg', 
          '', 'admin', 'admin@example.com', 'active', true, 2, 'teacher,outline', 'vi', new Date().toISOString(), ''
        ]);
        sheet.appendRow([
          'bot_admin_01', 'Coach AI - Admin & Support', 'admin-support-gem', 'admin', 'support', 
          'Hỗ trợ trả lời FAQ, tra cứu SOP nội bộ vận hành.', '', 'Mở Gem', 'https://gemini.google.com/', 
          'Quy trình', 'https://docs.google.com/', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg', 
          '', 'admin', 'admin@example.com', 'active', false, 3, 'admin,support', 'vi', new Date().toISOString(), ''
        ]);
      }
    }
  }
  return sheet;
}

/**
 * Đọc dữ liệu từ Sheet và chuyển sang định dạng JSON
 */
function getSheetDataAsJson(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return createJsonResponse({ error: "Sheet not found: " + sheetName });
  
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return createJsonResponse([]); // Chỉ có tiêu đề hoặc trống
  
  var headers = data[0];
  var json = [];
  
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var cellValue = data[i][j];
      // Xử lý các trường hợp đặc biệt (ví dụ: ngày tháng)
      if (cellValue instanceof Date) {
        obj[headers[j]] = cellValue.toISOString();
      } else {
        obj[headers[j]] = cellValue;
      }
    }
    json.push(obj);
  }
  
  return createJsonResponse(json);
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
