/**
 * API Route: POST /api/contact
 * Handles contact form submissions
 *
 * FIXES APPLIED:
 *  1. Phone space stripped before insert (consistent with quote-request fix)
 *  2. Duplicate-check error properly destructured — no silent swallow
 *  3. All sanitized.* fields used consistently
 *  4. Optional chaining on insert result (no throw on null data)
 *  5. shipmentDate empty-string guarded before insert (date column rejects "")
 *  6. Detailed insert error logged with error.details for easier debugging
 */

import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import {
  validateContactForm,
  sanitizeFormData,
  getClientIP,
  verifyEnum,
} from '@/lib/validation';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { sendContactAcknowledgment, sendAdminNotification } from '@/lib/email';

// Must match the front-end <option> values exactly
const ALLOWED_SUBJECTS = [
  'Ocean Freight Booking',
  'Bulk Cargo Shipment',
  'Customs Clearance',
  'Port Logistics',
  'Cargo Consolidation',
  'Cargo Insurance',
  'Get a Quote',
  'Rate Negotiation',
  'Other Inquiry',
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

const ALLOWED_SERVICE_TYPES = [
  'FCL',
  'LCL',
  'CFS',
  'Consolidation',
  'Breakbulk',
];

const ALLOWED_CARGO_TYPES = [
  'General Cargo',
  'Breakbulk',
  'Heavy Lift',
  'Project Cargo',
  'RoRo',
  'Perishable',
  'Hazardous',
  'Dry Bulk',
  'Liquid Bulk',
];

export async function POST(request) {
  try {
    // ── 1. Client IP ──────────────────────────────────────────────────────────
    const clientIP = getClientIP(request);

    // ── 2. Rate limit (10 requests / IP / hour) ───────────────────────────────
    const rateLimitResult = checkRateLimit(clientIP, '/api/contact', 10, 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests. Please wait before submitting again.',
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
    const validationErrors = validateContactForm(formData);
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
    if (formData.subject && !verifyEnum(formData.subject, ALLOWED_SUBJECTS)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid subject type',
          errors: [{ field: 'subject', message: 'Invalid subject selected' }],
        },
        { status: 400 }
      );
    }

    if (formData.container && !verifyEnum(formData.container, ALLOWED_CONTAINERS)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid container type',
          errors: [{ field: 'container', message: 'Invalid container type selected' }],
        },
        { status: 400 }
      );
    }

    if (formData.serviceType && !verifyEnum(formData.serviceType, ALLOWED_SERVICE_TYPES)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid service type',
          errors: [{ field: 'serviceType', message: 'Invalid service type selected' }],
        },
        { status: 400 }
      );
    }

    if (formData.cargoType && !verifyEnum(formData.cargoType, ALLOWED_CARGO_TYPES)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid cargo type',
          errors: [{ field: 'cargoType', message: 'Invalid cargo type selected' }],
        },
        { status: 400 }
      );
    }

    // ── 7. Sanitize ───────────────────────────────────────────────────────────
    const sanitized = sanitizeFormData(formData);

    // ── 8. FIX: Strip whitespace from phone ───────────────────────────────────
    // Front-end sends "+91 98765 43210" with a space after the country code.
    // Store clean: "+919876543210" — consistent with quote-request route.
    const cleanPhone = sanitized.phone
      ? sanitized.phone.replace(/\s+/g, '')
      : null;

    // ── 9. FIX: Guard shipmentDate — empty string breaks date column ──────────
    // Postgres DATE column rejects "" — must be null or a valid ISO date string.
    const shipmentDate = sanitized.shipmentDate && sanitized.shipmentDate.trim() !== ''
      ? sanitized.shipmentDate.trim()
      : null;

    // ── 10. Duplicate check (same email within 5 minutes) ─────────────────────
    // FIX: properly destructure so DB errors aren't silently swallowed
    const { data: recentData, error: recentError } = await supabaseServer
      .from('contact_messages')
      .select('id, created_at')
      .eq('email', sanitized.email)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .limit(1);

    if (recentError) {
      console.error('[CONTACT-API] Duplicate check DB error:', recentError.message);
      // Non-fatal: log and continue
    } else if (recentData && recentData.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'You recently submitted a message. Please wait a few minutes before submitting again.',
          errors: [],
        },
        { status: 400 }
      );
    }

    // ── 11. Insert into database ──────────────────────────────────────────────
    // Column names match contact_messages schema exactly.
    // All values sourced from sanitized.* — no raw formData bypass.
    const { data, error } = await supabaseServer
      .from('contact_messages')
      .insert([
        {
          name:                 sanitized.name,
          email:                sanitized.email,
          phone:                cleanPhone,                        // FIX: stripped
          company:              sanitized.company              || null,
          subject:              sanitized.subject              || 'General Inquiry',
          port_of_loading:      sanitized.pol                  || null,
          port_of_discharge:    sanitized.pod                  || null,
          container_type:       sanitized.container            || null,
          service_type:         sanitized.serviceType          || null,
          cargo_type:           sanitized.cargoType            || null,
          shipment_date:        shipmentDate,                       // FIX: null-guarded
          weight:               sanitized.weight               || null,
          shipper:              sanitized.shipper              || null,
          consignee:            sanitized.consignee            || null,
          special_requirements: sanitized.specialRequirements  || null,
          message:              sanitized.message,
          status:               'new',
          is_read:              false,
          ip_address:           clientIP,
          user_agent:           request.headers.get('user-agent'),
        },
      ])
      .select();

    if (error) {
      console.error('[CONTACT-API] Insert error:', error.message, error.details);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to submit message. Please try again.',
          errors: [],
        },
        { status: 500 }
      );
    }

    // FIX: safe optional chaining — no throw if data is unexpectedly null
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('[CONTACT-API] Insert returned no data');
      return NextResponse.json(
        {
          success: false,
          message: 'Submission error. Please try again.',
          errors: [],
        },
        { status: 500 }
      );
    }

    // ── 12. Send confirmation emails ──────────────────────────────────────────
    try {
      await Promise.all([
        sendContactAcknowledgment({
          name:    sanitized.name,
          email:   sanitized.email,
          subject: sanitized.subject,
          message: sanitized.message,
        }),
        sendAdminNotification({
          name:               sanitized.name,
          email:              sanitized.email,
          phone:              cleanPhone,
          company:            sanitized.company,
          subject:            sanitized.subject,
          port_of_loading:    sanitized.pol,
          port_of_discharge:  sanitized.pod,
          container_type:     sanitized.container,
          service_type:       sanitized.serviceType,
          cargo_type:         sanitized.cargoType,
          message:            sanitized.message,
        }),
      ]);
      console.log('[CONTACT-API] ✅ All emails sent successfully');
    } catch (emailErr) {
      // Non-fatal: message is already saved, email failure just gets logged
      console.error('[CONTACT-API] 🚨 Email sending failed:', emailErr.message);
    }

    // ── 13. Success ───────────────────────────────────────────────────────────
    const messageId = data[0]?.id ?? 'unknown';

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully! Check your email for confirmation.',
        data: {
          id:     messageId,
          email:  sanitized.email,
          status: 'new',
        },
      },
      { status: 201 }
    );

  } catch (err) {
    console.error('[CONTACT-API] Unhandled error:', err.message);
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