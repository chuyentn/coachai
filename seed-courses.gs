/**
 * SEED 10 DEMO COURSES - Chạy hàm seedDemoCourses() 1 lần trong Apps Script Editor
 * 
 * Cách dùng:
 * 1. Mở Apps Script Editor của spreadsheet
 * 2. Paste toàn bộ code này vào cuối file .gs
 * 3. Chọn "seedDemoCourses" trong dropdown → nhấn ▶️ Run
 * 4. Xác nhận quyền → Courses tab sẽ có 10 khóa học mẫu
 */
function seedDemoCourses() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Courses');

  if (!sheet) {
    sheet = ss.insertSheet('Courses');
    sheet.appendRow(['id','title','description','price_vnd','price_usd','thumbnail_url','instructor_id','published','featured','total_students','avg_rating','created_at','modules']);
    sheet.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#f3f3f3');
    sheet.setFrozenRows(1);
  }

  // Xóa dữ liệu cũ (giữ header)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);

  // Helper: chuyển "A; B; C" → JSON modules array
  function makeModules(str) {
    return JSON.stringify(
      str.split(';').map(function(t, i) {
        return { id: 'm' + (i + 1), title: t.trim(), video_url: '', order: i + 1 };
      })
    );
  }

  var courses = [
    ['1','JavaScript Cơ Bản','Khóa học JS cơ bản cho người mới bắt đầu, xây nền tảng vững chắc về biến, hàm, DOM.',499000,19,'https://cdn.edu.victorchuyen.net/thumbs/js-basic.jpg','1','true','false',1250,4.6,'2025-01-10T08:30:00Z',makeModules('Giới thiệu; Biến và Kiểu dữ liệu; Hàm và Scope; DOM cơ bản')],
    ['2','React từ Zero đến Deploy','Xây dựng ứng dụng React SPA hoàn chỉnh, có routing, state management và deploy production.',1099000,45,'https://cdn.edu.victorchuyen.net/thumbs/react-zero-to-deploy.jpg','2','true','true',830,4.8,'2025-02-02T10:00:00Z',makeModules('Fundamentals; React Hooks; State Management; Routing; Deployment')],
    ['3','Node.js API thực chiến','Tự xây dựng RESTful API với Node.js, Express, JWT, kết nối MongoDB.',899000,37,'https://cdn.edu.victorchuyen.net/thumbs/node-api.jpg','2','true','false',540,4.5,'2024-11-20T14:15:00Z',makeModules('Setup dự án; RESTful APIs; Auth với JWT; Kết nối Database; Triển khai')],
    ['4','Fullstack MERN Bootcamp','Lộ trình fullstack MERN: MongoDB, Express, React, Node, build dự án thực tế.',1999000,79,'https://cdn.edu.victorchuyen.net/thumbs/mern-bootcamp.jpg','3','true','true',320,4.7,'2025-03-01T09:00:00Z',makeModules('Kiến trúc MERN; Backend API; Frontend React; Tích hợp; Dự án cuối khóa')],
    ['5','Git & GitHub cho Developer','Hiểu rõ Git workflow, branching, pull request, code review cho team dev.',299000,12,'https://cdn.edu.victorchuyen.net/thumbs/git-github.jpg','1','true','false',2100,4.4,'2024-09-05T07:45:00Z',makeModules('Git cơ bản; Branching; GitHub workflow; Pull Request; Best Practices')],
    ['6','TypeScript Nâng Cao','Ứng dụng TypeScript trong dự án React/Node, generic, utility types, best practice.',749000,29,'https://cdn.edu.victorchuyen.net/thumbs/typescript-advanced.jpg','2','true','false',410,4.6,'2024-12-12T13:20:00Z',makeModules('Type system; Generics; Advanced types; TS trong React; TS trong Node')],
    ['7','HTML/CSS Từ Zero','Khóa học HTML/CSS cho người mới, xây được 2 landing page responsive.',199000,8,'https://cdn.edu.victorchuyen.net/thumbs/html-css-zero.jpg','4','true','false',3100,4.3,'2023-08-18T06:10:00Z',makeModules('HTML cơ bản; CSS cơ bản; Flexbox; Responsive; Dự án landing page')],
    ['8','Next.js Production','Xây dựng ứng dụng Next.js, SSR/SSG, SEO, image optimization, deploy Vercel.',1299000,51,'https://cdn.edu.victorchuyen.net/thumbs/nextjs-production.jpg','3','true','true',190,4.9,'2025-01-25T11:40:00Z',makeModules('Routing nâng cao; Data fetching; SEO; Image optimization; Deploy')],
    ['9','Design System cho Developer','Học cách thiết kế và áp dụng design system vào frontend codebase.',649000,26,'https://cdn.edu.victorchuyen.net/thumbs/design-system-dev.jpg','5','false','false',60,4.2,'2024-10-01T09:55:00Z',makeModules('Principles; Tokens; Components; Documentation; Integration')],
    ['10','SQL & Database Fundamentals','Hiểu SQL cơ bản, join, index, thiết kế database chuẩn hóa.',459000,18,'https://cdn.edu.victorchuyen.net/thumbs/sql-fundamentals.jpg','5','true','false',980,4.5,'2023-11-30T15:05:00Z',makeModules('Select/Filter; Joins; Index; Normalization; Query tối ưu')]
  ];

  courses.forEach(function(row) { sheet.appendRow(row); });

  // Highlight xanh lá
  sheet.getRange(2, 1, courses.length, 13).setBackground('#e8f5e9');

  Logger.log('✅ Seeded ' + courses.length + ' courses!');
  SpreadsheetApp.getUi().alert('✅ Seed thành công!\n\n10 khóa học mẫu đã thêm vào Courses tab.\nRefresh http://localhost:5173 để xem!');
}
