import { NextResponse } from 'next/server';
import { verifyEmailService, sendQuoteConfirmationEmail, sendAdminNotification } from '@/lib/email';

export async function GET(request) {
  try {
    console.log('🧪 TEST 1: Verifying email service...');
    const verify = await verifyEmailService();
    
    if (!verify.success) {
      return NextResponse.json({
        test: 'VERIFY',
        status: 'failed',
        error: verify.error,
      }, { status: 500 });
    }
    console.log('✅ Verification passed');

    // TEST 2: Send actual test email
    console.log('🧪 TEST 2: Sending test quote confirmation...');
    const quoteResult = await sendQuoteConfirmationEmail({
      name: 'Test User',
      email: 'vivekmg31@gmail.com',
      service: 'FCL',
      pol: 'Jeddah',
      pod: 'Shenzhen',
      container: '20ft',
    });
    console.log('Quote email result:', quoteResult);

    // TEST 3: Send admin notification
    console.log('🧪 TEST 3: Sending test admin notification...');
    const adminResult = await sendAdminNotification({
      name: 'Test User',
      email: 'vivekmg31@gmail.com',
      phone: '+91 9876543210',
      company: 'Test Co',
      service_type: 'FCL',
      port_of_loading: 'Jeddah',
      port_of_discharge: 'Shenzhen',
      container_type: '20ft',
      cargo_details: 'Test cargo',
    });
    console.log('Admin email result:', adminResult);

    return NextResponse.json({
      test: 'FULL_SEND_TEST',
      status: 'completed',
      results: {
        verify: verify,
        quoteConfirmation: quoteResult,
        adminNotification: adminResult,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('🧪 Test error:', error.message, error.code);
    return NextResponse.json({
      status: 'error',
      message: 'Test failed',
      error: error.message,
      code: error.code,
      stack: error.stack?.split('\n')[0],
    }, { status: 500 });
  }
}
