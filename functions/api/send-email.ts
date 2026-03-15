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

    // KHI TEST: Resend bắt buộc dùng email 'onboarding@resend.dev' nếu bạn chưa verify Domain.
    // KHI LIVE THẬT: Bạn phải vào trang Resend -> Domains -> Thêm edu.victorchuyen.net rồi đổi email gửi thành hello@edu.victorchuyen.net
    const senderEmail = "onboarding@resend.dev"; 

    // Bắn Email HTML xịn xò
    const { data, error } = await resend.emails.send({
      from: `CoachAI Support <${senderEmail}>`,
      to: [body.email], // Gửi vào email khách hàng nhập
      subject: `🎉 [CoachAI] Yêu cầu Mã Nguồn: ${body.project}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">CoachAI System</h1>
            <p style="color: #64748b; margin-top: 5px;">Hệ sinh thái Học lập trình & Triển khai thực chiến</p>
          </div>
          
          <p style="font-size: 16px;">Xin chào <strong style="color: #4f46e5;">${body.name || 'bạn'}</strong>,</p>
          
          <p style="font-size: 16px;">Cảm ơn bạn đã quan tâm và đăng ký nhận bản quyền mã nguồn cho dự án: <br/>
            <strong style="color: #e11d48; font-size: 18px; display: inline-block; margin-top: 5px;">🏆 ${body.project}</strong>
          </p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-left: 5px solid #4f46e5; margin: 25px 0; border-radius: 0 8px 8px 0;">
             <h3 style="margin-top: 0; color: #0f172a;">🔥 Trạng Thái: Đã Tiếp Nhận</h3>
             <p style="margin-bottom: 0;">Yêu cầu của bạn đã được ghi nhận vào hệ thống CRM. Đoạn mã nguồn này bao gồm lõi Core Architecture và kết nối Database trực tiếp, do đó Đội ngũ Mentor sẽ trao đổi nhanh với qua qua Zalo/SĐT để gửi bộ File Source Code và Hướng dẫn Deploy an toàn trong vòng 24h tới.</p>
          </div>

          <p style="font-size: 16px;">Trong lúc chờ đợi, hãy khám phá thêm các lộ trình Coaching tự động hóa trên trang web của chúng tôi.</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://coachai.pages.dev" style="background-color: #4f46e5; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Truy cập CoachAI ngay</a>
          </div>
          
          <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 30px 0;" />
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">Cần hỗ trợ gấp? Reply trực tiếp email này hoặc liên hệ Zalo Support.</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 5px 0 0 0;">© 2026 CoachAI. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Lỗi Resend:', error);
      return new Response(JSON.stringify({ error }), { 
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
