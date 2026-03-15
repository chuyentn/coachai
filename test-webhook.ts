import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import axios from 'axios';

async function testWebhook() {
  console.log('--- Starting Webhook Test ---');
  if (!getApps().length) {
    initializeApp();
  }
  const db = getFirestore(getApp());

  const mockTransactionCode = `EVTEST${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Create a dummy pending payment (simulating frontend)
  const paymentRef = await db.collection('payments').add({
    user_id: 'test_user_123',
    user_email: 'test@example.com',
    amount: 500000,
    plan_type: 'course',
    course_id: 'test-course-101',
    transaction_code: mockTransactionCode,
    status: 'pending',
    payment_method: 'vietqr',
    created_at: new Date().toISOString()
  });
  console.log(`[1] Created pending payment with code: ${mockTransactionCode}`);

  // 2. Simulate SePay sending a webhook to our local Express server
  console.log(`[2] Simulating bank transfer receiving 500k...`);
  try {
    const response = await axios.post('http://localhost:3000/api/webhooks/sepay', {
      transferAmount: 500000,
      content: `CK tien hoc ${mockTransactionCode} nhe`
    });
    console.log(`[3] Server Webhook Response:`, response.data);

    // 3. Verify it changed in DB
    const finalPayment = await paymentRef.get();
    console.log(`[4] Final Payment Status in DB:`, finalPayment.data()?.status);

    // 4. Clean up mock data
    await paymentRef.delete();
    const enrollId = `test_user_123_test-course-101`;
    await db.collection('enrollments').doc(enrollId).delete();
    console.log('[5] Cleanup completed.');

  } catch (error: any) {
    console.error('Webhook test failed:', error?.response?.data || error.message);
  }
}

testWebhook();
