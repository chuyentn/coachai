import { Resend } from 'resend';

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  // Xử lý CORS chống block trên trình duyệt
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body: any = await request.json();
    
    // Kiểm tra API Key
    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'System is missing RESEND_API_KEY configuration.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resend = new Resend(env.RESEND_API_KEY);
    const senderEmail = "no-reply@edu.victorchuyen.net"; // Đã chuyển sang Custom Domain

    // -- 1. CHUẨN HOÁ DỮ LIỆU ĐẦU VÀO --
    // Hỗ trợ cả chuẩn mới (body.to, body.subject, body.html) do crmService gọi
    // Lẫn chuẩn cũ (body.email, body.name, body.project) do Projects.tsx gọi cũ
    const targetEmail = body.to || body.email;
    const emailSubject = body.subject || `🎉 [CoachAI] Yêu cầu Mã Nguồn: ${body.project || 'Thành công'}`;
    
    if (!targetEmail) {
      return new Response(JSON.stringify({ error: 'Missing destination email (body.to or body.email)' }), { status: 400 });
    }

    // Nội dung động (Dynamic Content): Nếu Không có body.html (chuẩn mới), dùng chuẩn cũ của Form Nhận Code
    const dynamicContent = body.html || `
      <p style="font-size: 16px;">Xin chào <strong style="color: #4f46e5;">${body.name || 'bạn'}</strong>,</p>
      <p style="font-size: 16px;">Cảm ơn bạn đã quan tâm và đăng ký nhận bản quyền mã nguồn cho dự án:<br/>
        <strong style="color: #e11d48; font-size: 18px; display: inline-block; margin-top: 5px;">🏆 ${body.project || 'Template'}</strong>
      </p>
      <div style="background-color: #f8fafc; padding: 20px; border-left: 5px solid #4f46e5; margin: 25px 0; border-radius: 0 8px 8px 0;">
         <h3 style="margin-top: 0; color: #0f172a;">🔥 Trạng Thái: Đã Tiếp Nhận</h3>
         <p style="margin-bottom: 0;">Yêu cầu của bạn đã được ghi nhận vào hệ thống CRM. Mentor sẽ liên hệ nhanh với bạn qua Zalo/SĐT để gửi bộ Source Code và Hướng dẫn Deploy trong vòng 24h tới.</p>
      </div>
    `;

    // -- 2. MASTER EMAIL TEMPLATE GÓC NHÌN WEB OWNER --
    const masterTemplate = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">CoachAI System</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">Hệ sinh thái Học Lập Trình & Triển Khai Thực Chiến</p>
        </div>
        
        <!-- Main Content (Dynamic) -->
        <div style="padding: 30px 20px; background-color: #ffffff;">
          ${dynamicContent}
        </div>
        
        <!-- UP-SELL Footer Box -->
        <div style="background-color: #f8fafc; padding: 25px 20px; text-align: center; border-top: 2px dashed #e2e8f0;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Tiến Xa Hơn Cùng CoachAI</h3>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Bạn muốn truy cập thẳng vào kho mã nguồn khổng lồ hoặc cần người kèm cặp 1:1?</p>
          <a href="https://edu.victorchuyen.net/pricing" style="background-color: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(244,63,94,0.4);">
            Nâng cấp VIP Member
          </a>
        </div>
        
        <!-- Bottom Info -->
        <div style="background-color: #0f172a; padding: 25px 20px; text-align: left; border-top: 4px solid #3b82f6;">
          <h4 style="color: #ffffff; margin-top: 0; font-size: 15px; display: flex; align-items: center; gap: 8px;">☎️ Trung tâm Hỗ trợ CoachAI</h4>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 5px; margin-bottom: 20px; line-height: 1.5;">Lưu ý: Đây là email tự động, vui lòng không phản hồi trực tiếp. Hãy liên hệ qua các kênh Support chính thức sau nếu bạn cần giúp đỡ:</p>
          
          <div style="background-color: #1e293b; padding: 15px; border-radius: 8px;">
            <ul style="list-style-type: none; padding: 0; margin: 0; font-size: 13px; color: #cbd5e1; line-height: 2;">
              <li>🌐 <strong>Group Facebook:</strong> <a href="https://www.facebook.com/groups/vibecodecoaching" style="color: #38bdf8; text-decoration: none;">Cộng đồng Vibe Code</a></li>
              <li>💬 <strong>Support Zalo:</strong> <a href="https://zalo.me/g/tdhmtu261" style="color: #38bdf8; text-decoration: none;">Nhóm Hỗ trợ Zalo</a></li>
              <li>✈️ <strong>Support Telegram:</strong> <a href="https://t.me/vibecodocoaching" style="color: #38bdf8; text-decoration: none;">Nhóm Hỗ trợ Telegram</a></li>
              <li>👤 <strong>Zalo Admin:</strong> <a href="https://zalo.me/0989890022" style="color: #38bdf8; text-decoration: none;">Mr. Victor (0989.890.022)</a></li>
              <li>🛸 <strong>Telegram Admin:</strong> <a href="https://t.me/victorchuyen" style="color: #38bdf8; text-decoration: none;">@victorchuyen</a></li>
            </ul>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <p style="font-size: 11px; color: #64748b; margin: 0;">© 2026 CoachAI. Mọi quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    `;

    // Gửi Email
    const { data, error } = await resend.emails.send({
      from: `CoachAI Support <${senderEmail}>`,
      to: [targetEmail],
      subject: emailSubject,
      html: masterTemplate,
    });

    if (error) {
      console.error('Lỗi Resend Chi Tiết:', JSON.stringify(error, null, 2));
      return new Response(JSON.stringify({ error, detail: 'Lỗi từ Resend API' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify({ success: true, data }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err: any) {
    console.error('Lỗi API Server:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
