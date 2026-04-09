import { NextResponse } from 'next/server';
import { verifyEmailService } from '@/lib/email';

export async function GET(request) {
  try {
    console.log('🧪 Testing email service...');
    
    const result = await verifyEmailService();
    
    if (result.success) {
      return NextResponse.json({
        status: 'success',
        message: '✅ Email service is working!',
        details: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER?.substring(0, 10) + '***',
        },
      }, { status: 200 });
    } else {
      return NextResponse.json({
        status: 'failed',
        message: '❌ Email service verification failed',
        error: result.error,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('🧪 Test error:', error.message);
    return NextResponse.json({
      status: 'error',
      message: '❌ Email test failed',
      error: error.message,
      code: error.code,
    }, { status: 500 });
  }
}
