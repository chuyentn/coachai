import { GoogleGenAI } from '@google/genai';

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
    const { message, courseTitle, lessonTitle } = body;

    // Kiểm tra API Key (biến lưu tại Cloudflare Settings > Variables and Secrets)
    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'System is missing GEMINI_API_KEY configuration.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (!message) {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Khởi tạo Gen AI SDK
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    
    // Gọi Model
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `Bạn là một chuyên gia AI Coach hỗ trợ học viên trong khóa học "${courseTitle}". 
          Học viên đang xem bài học: "${lessonTitle}". 
          Hãy trả lời ngắn gọn, chuyên nghiệp và tập trung vào kiến thức chuyên môn.
          
          Câu hỏi của học viên: ${message}` }]
        }
      ],
      config: {
        systemInstruction: "Bạn là một AI Coach chuyên nghiệp, nhiệt tình và có kiến thức sâu rộng về công nghệ và kinh doanh.",
      }
    });

    return new Response(JSON.stringify({ text: response.text || "Xin lỗi, tôi gặp chút trục trặc. Bạn có thể thử lại không?" }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err: any) {
    console.error('Lỗi Gemini AI Server:', err.message);
    return new Response(JSON.stringify({ error: "AI service error: " + err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
