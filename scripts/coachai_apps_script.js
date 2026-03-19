/**
 * Deploy this script as a Web App to create a read-only JSON API for the Coach.online Multi-Tenant SaaS.
 * Use it alongside the `CoachAI_Control_Panel` Google Sheet.
 * 
 * Execution: as "Me" (Owner)
 * Access: "Anyone"
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with actual ID

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
    } else if (action === 'config') {
      responseData = getCoachAIConfig(lang, tenantId);
    } else if (action === 'bots') {
      responseData = getCoachAIBots(role, lang, tenantId);
    } else if (action === 'teacher-scope') {
      const email = e.parameter.email;
      responseData = getTeacherScope(email, tenantId);
    } else {
      responseData = { error: 'Invalid action parameter' };
    }

    // CORS & JSON Return
    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
    return ContentService.createTextOutput(JSON.stringify({
      error: error.message,
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * [NEW] Handle POST requests (Webhooks from Frontend)
 * Implements Phase 5: Auto-Onboarding Tenant Creation
 */
function doPost(e) {
  try {
    // Enable CORS by returning JSON properly
    if (!e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'No POST data received' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === 'register-tenant') {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName('Tenants');
      
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({ error: 'Tenants sheet not found' })).setMimeType(ContentService.MimeType.JSON);
      
      // Reconstruct Row based on HEADERS.tenants: 
      // ['domain', 'app_name', 'logo_url', 'primary_color', 'contact_email', 'zalo_url', 'facebook_url', 'sepay_md5', 'bank_id', 'bank_account', 'bank_owner', 'status']
      const newDomain = postData.domain.includes('.') ? postData.domain : `${postData.domain}.coach.io.vn`;
      
      const newRow = [
        newDomain,                 // domain
        postData.appName || '',    // app_name
        '',                        // logo_url
        postData.color || '',      // primary_color
        postData.email || '',      // contact_email
        '',                        // zalo_url
        '',                        // facebook_url
        '',                        // sepay_md5
        'techcombank',             // bank_id (default fallback)
        '8486568666',              // bank_account
        'TRAN NGOC CHUYEN',        // bank_owner (default support)
        'pending'                  // status
      ];
      
      sheet.appendRow(newRow);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Tenant created successfully! Dashboard will be ready shortly.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid backend action' })).setMimeType(ContentService.MimeType.JSON);

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
