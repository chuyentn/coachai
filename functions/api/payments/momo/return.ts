export const onRequestGet = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const resultCode = searchParams.get('resultCode') || '0';
  const orderId = searchParams.get('orderId') || 'Unknown';
  const message = searchParams.get('message') || '';
  const extraData = searchParams.get('extraData') || '';

  const appUrl = env.APP_URL || 'https://edu.victorchuyen.net';
  
  // Decide where to redirect the user on the frontend
  let redirectTarget = `${appUrl}/payment/success?orderId=${orderId}`;
  
  if (resultCode !== '0') {
    redirectTarget = `${appUrl}/payment/cancel?orderId=${orderId}&reason=${encodeURIComponent(message)}`;
  }

  // Simple HTML redirect page
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>MoMo Payment Return</title>
        <meta http-equiv="refresh" content="0; url=${redirectTarget}">
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8fafc; }
          .loader { border: 4px solid #f3f3f3; border-top: 4px solid #4f46e5; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin-bottom: 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .container { text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="loader"></div>
          <p>Đang xử lý thanh toán MoMo... Vui lòng không tắt trình duyệt.</p>
          <a href="${redirectTarget}">Nhấp vào đây nếu không tự động chuyển hướng</a>
        </div>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
};
