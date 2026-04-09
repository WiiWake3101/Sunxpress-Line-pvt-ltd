/**
 * API Route: POST /api/quote-request
 * Handles quote request submissions
 */

import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import {
  validateQuoteForm,
  sanitizeFormData,
  getClientIP,
  verifyEnum,
} from '@/lib/validation';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { sendQuoteConfirmationEmail, sendAdminNotification } from '@/lib/email';

// Allowed service types & container types
const ALLOWED_SERVICES = [
  'Ocean Freight',
  'Bulk Cargo',
  'Port Logistics',
  'Customs Clearance',
  'Cargo Insurance',
  'Container Services',
];

const ALLOWED_CONTAINERS = [
  '20ft Standard',
  '40ft Standard',
  '40ft High Cube',
  '45ft High Cube',
  'Reefer',
  'Flat Rack',
  'Open Top',
  'Bulk/Tank',
];

export async function POST(request) {
  try {
    // 1. Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // 2. Check rate limit (5 requests per hour per IP)
    const rateLimit = checkRateLimit(
      clientIP,
      'quote-request',
      parseInt(process.env.RATE_LIMIT_REQUESTS || 5),
      parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || 60)
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Please try again in ${rateLimit.retryAfter} seconds.`,
          errors: [],
        },
        { status: 429 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { recaptchaToken, ...formData } = body;

    // 4. Verify reCAPTCHA
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: recaptchaResult.error,
          errors: [],
        },
        { status: 400 }
      );
    }

    // 5. Validate form data
    const validationErrors = validateQuoteForm(formData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // 6. Verify enum values
    if (!verifyEnum(formData.service, ALLOWED_SERVICES)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid service type',
          errors: [{ field: 'service', message: 'Invalid service selected' }],
        },
        { status: 400 }
      );
    }

    if (!verifyEnum(formData.container, ALLOWED_CONTAINERS)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid container type',
          errors: [{ field: 'container', message: 'Invalid container type' }],
        },
        { status: 400 }
      );
    }

    // 7. Sanitize data
    const sanitized = sanitizeFormData(formData);

    // 8. Check for duplicate submission (same email within 5 minutes)
    const recentQuote = await supabaseServer
      .from('quote_requests')
      .select('id, created_at')
      .eq('email', sanitized.email)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .limit(1);

    if (recentQuote.data && recentQuote.data.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'You recently submitted a request. Please wait before submitting again.',
          errors: [],
        },
        { status: 400 }
      );
    }

    // 9. Insert into database
    const { data, error } = await supabaseServer
      .from('quote_requests')
      .insert([
        {
          name: sanitized.name,
          email: sanitized.email,
          phone: sanitized.phone,
          company: sanitized.company,
          service_type: sanitized.service,
          port_of_loading: sanitized.pol,
          port_of_discharge: sanitized.pod,
          container_type: sanitized.container,
          cargo_details: sanitized.cargo_details,
          weight: formData.weight || null,
          status: 'pending',
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent'),
        },
      ])
      .select();

    if (error || !data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to submit quote. Database error.',
          errors: [],
        },
        { status: 500 }
      );
    }

    // 10. Send confirmation emails (non-blocking)
    Promise.all([
      sendQuoteConfirmationEmail({
        name: sanitized.name,
        email: sanitized.email,
        service: sanitized.service,
        pol: sanitized.pol,
        pod: sanitized.pod,
        container: sanitized.container,
      }),
      sendAdminNotification({
        name: sanitized.name,
        email: sanitized.email,
        phone: sanitized.phone,
        company: sanitized.company,
        service_type: sanitized.service,
        port_of_loading: sanitized.pol,
        port_of_discharge: sanitized.pod,
        container_type: sanitized.container,
        cargo_details: sanitized.cargo_details,
      }),
    ]).catch(() => {});

    // 11. Return success response
    const quoteId = data && Array.isArray(data) && data.length > 0 ? data[0].id : 'unknown';
    
    return NextResponse.json(
      {
        success: true,
        message: 'Quote request submitted successfully! Check your email for confirmation.',
        data: {
          id: quoteId,
          email: sanitized.email,
          status: 'pending',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while processing your request.',
        errors: [],
      },
      { status: 500 }
    );
  }
}
