/**
 * API Route: POST /api/quote-request
 * Handles quote request submissions
 *
 * FIXES APPLIED:
 *  1. Phone space stripped before insert (was failing valid_phone constraint)
 *  2. weight inserted as string (column changed to varchar in migration)
 *  3. cargo field correctly mapped to cargo_details
 *  4. Duplicate-check error properly destructured — no silent swallow
 *  5. Consistent use of sanitized.* for all fields
 *  6. Optional chaining on insert result (no throw on null data)
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

// Allowed service types & container types — must match front-end options exactly
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
    // ── 1. Client IP ──────────────────────────────────────────────────────────
    const clientIP = getClientIP(request);

    // ── 2. Rate limit (5 requests / IP / hour) ────────────────────────────────
    const rateLimit = checkRateLimit(
      clientIP,
      'quote-request',
      parseInt(process.env.RATE_LIMIT_REQUESTS || '5'),
      parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '60')
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

    // ── 3. Parse body ─────────────────────────────────────────────────────────
    const body = await request.json();
    const { recaptchaToken, ...formData } = body;

    // ── 4. Verify reCAPTCHA ───────────────────────────────────────────────────
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: recaptchaResult.error || 'reCAPTCHA verification failed.',
          errors: [],
        },
        { status: 400 }
      );
    }

    // ── 5. Validate form data ─────────────────────────────────────────────────
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

    // ── 6. Enum guards ────────────────────────────────────────────────────────
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
          errors: [{ field: 'container', message: 'Invalid container type selected' }],
        },
        { status: 400 }
      );
    }

    // ── 7. Sanitize ───────────────────────────────────────────────────────────
    const sanitized = sanitizeFormData(formData);

    // ── 8. FIX: Strip whitespace from phone so it passes the DB constraint ────
    // Front-end sends "+91 98765 43210" — constraint requires no internal spaces
    // We store the clean version: "+919876543210"
    const cleanPhone = sanitized.phone
      ? sanitized.phone.replace(/\s+/g, '')
      : null;

    // ── 9. Duplicate check (same email within 5 minutes) ──────────────────────
    // FIX: properly destructure { data, error } so DB errors aren't swallowed
    const { data: recentData, error: recentError } = await supabaseServer
      .from('quote_requests')
      .select('id, created_at')
      .eq('email', sanitized.email)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .limit(1);

    if (recentError) {
      console.error('[QUOTE-API] Duplicate check DB error:', recentError.message);
      // Non-fatal: log and continue rather than blocking the user
    } else if (recentData && recentData.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'You recently submitted a request. Please wait a few minutes before submitting again.',
          errors: [],
        },
        { status: 400 }
      );
    }

    // ── 10. Insert into database ───────────────────────────────────────────────
    // FIX: cargo_details mapped from sanitized.cargo (front-end key is "cargo")
    // FIX: weight inserted as string — column is now varchar(100) after migration
    // FIX: phone uses cleanPhone (spaces stripped)
    // FIX: all values come from sanitized.* consistently
    const { data, error } = await supabaseServer
      .from('quote_requests')
      .insert([
        {
          name:                sanitized.name,
          email:               sanitized.email,
          phone:               cleanPhone,                           // FIX: stripped
          company:             sanitized.company    || null,
          service_type:        sanitized.service,
          port_of_loading:     sanitized.pol,
          port_of_discharge:   sanitized.pod,
          container_type:      sanitized.container,
          cargo_details:       sanitized.cargo_details              // FIX: mapped correctly
                                 ?? sanitized.cargo                 //      fallback if sanitizer uses "cargo"
                                 ?? null,
          weight:              sanitized.weight     || null,         // FIX: from sanitized, not raw formData
          status:              'pending',
          ip_address:          clientIP,
          user_agent:          request.headers.get('user-agent'),
        },
      ])
      .select();

    if (error) {
      console.error('[QUOTE-API] Insert error:', error.message, error.details);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to submit quote. Please try again.',
          errors: [],
        },
        { status: 500 }
      );
    }

    // FIX: safe optional chaining — no throw if data is unexpectedly null
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('[QUOTE-API] Insert returned no data');
      return NextResponse.json(
        {
          success: false,
          message: 'Submission error. Please try again.',
          errors: [],
        },
        { status: 500 }
      );
    }

    // ── 11. Send confirmation emails ──────────────────────────────────────────
    try {
      await Promise.all([
        sendQuoteConfirmationEmail({
          name:      sanitized.name,
          email:     sanitized.email,
          service:   sanitized.service,
          pol:       sanitized.pol,
          pod:       sanitized.pod,
          container: sanitized.container,
        }),
        sendAdminNotification({
          name:           sanitized.name,
          email:          sanitized.email,
          phone:          cleanPhone,
          company:        sanitized.company,
          service_type:   sanitized.service,
          port_of_loading:    sanitized.pol,
          port_of_discharge:  sanitized.pod,
          container_type:     sanitized.container,
          cargo_details:      sanitized.cargo_details ?? sanitized.cargo,
        }),
      ]);
      console.log('[QUOTE-API] ✅ All emails sent successfully');
    } catch (emailErr) {
      // Non-fatal: quote is already saved, email failure just gets logged
      console.error('[QUOTE-API] 🚨 Email sending failed:', emailErr.message);
    }

    // ── 12. Success ───────────────────────────────────────────────────────────
    const quoteId = data[0]?.id ?? 'unknown';

    return NextResponse.json(
      {
        success: true,
        message: 'Quote request submitted successfully! Check your email for confirmation.',
        data: {
          id:     quoteId,
          email:  sanitized.email,
          status: 'pending',
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[QUOTE-API] Unhandled error:', error.message);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
        errors: [],
      },
      { status: 500 }
    );
  }
}