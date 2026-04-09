/**
 * API Route: POST /api/contact
 * Handles contact form submissions
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

const ALLOWED_SUBJECTS = ['Ocean Freight Booking', 'Bulk Cargo Shipment', 'Customs Clearance', 'Port Logistics', 'Cargo Consolidation', 'Cargo Insurance', 'Get a Quote', 'Rate Negotiation', 'Other Inquiry'];
const ALLOWED_CONTAINERS = ['20ft Standard', '40ft Standard', '40ft High Cube', '45ft High Cube', 'Reefer', 'Flat Rack', 'Open Top', 'Bulk/Tank'];
const ALLOWED_SERVICE_TYPES = ['FCL', 'LCL', 'CFS', 'Consolidation', 'Breakbulk'];
const ALLOWED_CARGO_TYPES = ['General Cargo', 'Breakbulk', 'Heavy Lift', 'Project Cargo', 'RoRo', 'Perishable', 'Hazardous', 'Dry Bulk', 'Liquid Bulk'];

export async function POST(request) {
  try {
    // 1. Get client IP
    const clientIP = getClientIP(request);

    // 2. Rate limiting (10 requests per IP per hour)
    const rateLimitResult = checkRateLimit(clientIP, '/api/contact', 10, 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many contact requests. Please wait before submitting again.',
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

    // 6. Verify enum values
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
          errors: [{ field: 'container', message: 'Invalid container type' }],
        },
        { status: 400 }
      );
    }

    if (formData.serviceType && !verifyEnum(formData.serviceType, ALLOWED_SERVICE_TYPES)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid service type',
          errors: [{ field: 'serviceType', message: 'Invalid service type' }],
        },
        { status: 400 }
      );
    }

    if (formData.cargoType && !verifyEnum(formData.cargoType, ALLOWED_CARGO_TYPES)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid cargo type',
          errors: [{ field: 'cargoType', message: 'Invalid cargo type' }],
        },
        { status: 400 }
      );
    }

    // 7. Sanitize data
    const sanitized = sanitizeFormData(formData);

    // 8. Check for duplicate submission (same email within 5 minutes)
    const recentMessage = await supabaseServer
      .from('contact_messages')
      .select('id, created_at')
      .eq('email', sanitized.email)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .limit(1);

    if (recentMessage.data && recentMessage.data.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'You recently submitted a message. Please wait before submitting again.',
          errors: [],
        },
        { status: 400 }
      );
    }

    // 9. Insert into database
    const { data, error } = await supabaseServer
      .from('contact_messages')
      .insert([
        {
          name: sanitized.name,
          email: sanitized.email,
          phone: sanitized.phone || null,
          company: sanitized.company || null,
          subject: sanitized.subject,
          port_of_loading: sanitized.pol || null,
          port_of_discharge: sanitized.pod || null,
          container_type: sanitized.container || null,
          service_type: sanitized.serviceType || null,
          cargo_type: sanitized.cargoType || null,
          shipment_date: sanitized.shipmentDate || null,
          weight: sanitized.weight || null,
          shipper: sanitized.shipper || null,
          consignee: sanitized.consignee || null,
          special_requirements: sanitized.specialRequirements || null,
          message: sanitized.message,
          status: 'new',
          is_read: false,
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent'),
        },
      ])
      .select();

    if (error || !data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to submit message. Database error.',
          errors: [],
        },
        { status: 500 }
      );
    }

    // 10. Send confirmation emails (non-blocking)
    Promise.all([
      sendContactAcknowledgment({
        name: sanitized.name,
        email: sanitized.email,
        subject: sanitized.subject,
      }),
      sendAdminNotification({
        name: sanitized.name,
        email: sanitized.email,
        phone: sanitized.phone,
        company: sanitized.company,
        subject: sanitized.subject,
        port_of_loading: sanitized.pol,
        port_of_discharge: sanitized.pod,
        container_type: sanitized.container,
        service_type: sanitized.serviceType,
        cargo_type: sanitized.cargoType,
        message: sanitized.message,
      }),
    ]).catch(() => {});

    // 11. Return success response
    const messageId = data && Array.isArray(data) && data.length > 0 ? data[0].id : 'unknown';

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully! Check your email for confirmation.',
        data: {
          id: messageId,
          email: sanitized.email,
          status: 'new',
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        errors: [],
      },
      { status: 500 }
    );
  }
}
