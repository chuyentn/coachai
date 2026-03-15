/**
 * UNIFIED GOOGLE APPS SCRIPT FOR EDU VIBE CODE COACHING
 * Version: 3.0 - Full Schema Support (Courses, Leads, Comments)
 * 
 * Script này xử lý:
 * 1. GET: Lấy dữ liệu Khóa học và Leads (trả về JSON).
 * 2. POST: Lưu Leads và Bình luận (tự động tạo sheet và tiêu đề cột).
 * 3. SETUP: Tự động khởi tạo các tab với tiêu đề cột chuẩn.
 */

// --- CẤU HÌNH CÁC CỘT (SCHEMA) DỰA TRÊN HÌNH ẢNH THỰC TẾ ---
const SCHEMA = {
  'Courses': [
    'id', 'title', 'description', 'price_vnd', 'price_usd', 
    'thumbnail_url', 'instructor_id', 'published', 'featured', 
    'total_students', 'avg_rating', 'created_at', 'modules'
  ],
  'Leads': [
    'Timestamp', 'Email', 'Name', 'Phone', 'note'
  ],
  'Comments': [
    'Timestamp', 'User Name', 'User Email', 'Comment Text', 'User ID', 'Photo URL', 'Comment'
  ]
};

/**
 * Xử lý yêu cầu GET
 * Sử dụng: ?action=getCourses hoặc ?action=getLeads hoặc ?action=setup
 */
function doGet(e) {
  // Kiểm tra nếu chạy trực tiếp trong trình soạn thảo
  if (!e || !e.parameter) {
    return createJsonResponse({ 
      message: "Script is active. Use ?action=getCourses, getLeads or setup",
      status: "online"
    });
  }

  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'getCourses') {
    return getSheetDataAsJson(ss, 'Courses');
  } else if (action === 'getLeads') {
    return getSheetDataAsJson(ss, 'Leads');
  } else if (action === 'setup') {
    return setupSheets(ss);
  }
  
  return createJsonResponse({ error: 'Invalid action. Use action=getCourses, getLeads, or setup.' });
}

/**
 * Xử lý yêu cầu POST
 * Lưu dữ liệu Leads và Bình luận
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Đợi tối đa 10 giây để tránh xung đột ghi dữ liệu

  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    // Xử lý lưu Lead (Khách hàng đăng ký)
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
    if (data.type === 'comment') {
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

    // Xử lý lưu Khóa học mới
    if (data.type === 'course') {
      var sheet = getOrCreateSheet(ss, 'Courses');
      sheet.appendRow([
        data.id || Utilities.getUuid(),
        data.title,
        data.description,
        data.price_vnd,
        data.price_usd,
        data.thumbnail_url,
        data.instructor_id,
        true, // published
        false, // featured
        0, // total_students
        0, // avg_rating
        timestamp,
        JSON.stringify(data.modules || [])
      ]);
      return createJsonResponse({ result: 'success', message: 'Course saved successfully' });
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
 * Lấy hoặc tạo mới một Sheet nếu chưa tồn tại
 */
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    var headers = SCHEMA[name];
    if (headers) {
      sheet.appendRow(headers);
      // Định dạng tiêu đề
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#f3f3f3')
        .setBorder(true, true, true, true, true, true);
      sheet.setFrozenRows(1);
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
    message: 'All sheets (Courses, Leads, Comments) initialized with correct headers' 
  });
}

/**
 * Tạo phản hồi HTTP dưới dạng JSON
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
