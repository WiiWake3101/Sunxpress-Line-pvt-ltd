/**
 * Email Service using Nodemailer
 */

import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true, // true for port 465 (SSL), false for port 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000,
  socketTimeout: 10000,
});

// Debug: Log email config on startup
console.log('📧 Email Service Initialized:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER?.substring(0, 5) + '***',
  env: process.env.NODE_ENV,
});

/**
 * Send confirmation email to user after quote submission
 */
export const sendQuoteConfirmationEmail = async (user) => {
  const mailOptions = {
    from: `"Sun Xpress Line" <${process.env.ADMIN_EMAIL}>`,
    to: user.email,
    subject: 'Quote Request Received - Sun Xpress Line',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px;">
          
          <div style="text-align: center; border-bottom: 2px solid #A0E9E5; padding-bottom: 20px; margin-bottom: 30px;">
            <h2 style="color: #0D1F3C; margin: 0;">Sun Xpress Line</h2>
            <p style="color: #319795; font-size: 14px; margin: 5px 0 0 0;">Maritime Logistics Excellence</p>
          </div>

          <h3 style="color: #0D1F3C; font-size: 18px; margin-bottom: 15px;">Thank You, ${user.name}! 🚢</h3>
          
          <p style="color: #4A5568; line-height: 1.6; margin-bottom: 15px;">
            We've received your quote request and will review it shortly. Our team typically responds within <strong>24 hours</strong>.
          </p>

          <div style="background: #F8FAFC; border-left: 4px solid #A0E9E5; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #0D1F3C; margin-top: 0;">Your Quote Details:</h4>
            <table style="width: 100%; font-size: 14px; color: #4A5568;">
              <tr>
                <td style="padding: 5px 0;"><strong>Service:</strong></td>
                <td>${user.service}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Port of Loading:</strong></td>
                <td>${user.pol}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Port of Discharge:</strong></td>
                <td>${user.pod}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Container Type:</strong></td>
                <td>${user.container}</td>
              </tr>
            </table>
          </div>

          <p style="color: #4A5568; font-size: 14px; margin-bottom: 20px;">
            You'll receive a detailed quote at <strong>${user.email}</strong> shortly.
          </p>

          <div style="background: #EBF8FF; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h4 style="color: #0D1F3C; margin-top: 0; font-size: 14px;">Need Help?</h4>
            <p style="font-size: 14px; color: #4A5568; margin: 0;">
              📞 <strong>+91 87544 00780</strong><br/>
              ✉️ <strong>admin@sunxp.in</strong>
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;"/>
          <p style="text-align: center; font-size: 12px; color: #A0AEC0; margin: 0;">
            © 2025 Sun Xpress Line Private Limited. All rights reserved.<br/>
            Tuticorin, Tamil Nadu, India
          </p>

        </div>
      </div>
    `,
  };

  try {
    console.log('[QUOTE] 📤 Sending to:', user.email);
    const result = await transporter.sendMail(mailOptions);
    console.log('[QUOTE] ✅ Sent! Message ID:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('[QUOTE] ❌ Failed:', error.message);
    console.error('[QUOTE] Error Code:', error.code);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification to admin about new quote or contact message
 */
export const sendAdminNotification = async (data) => {
  // Check if it's a contact message or quote
  const isContactMessage = data.message && !data.service_type;

  let subject, htmlContent;

  if (isContactMessage) {
    // Contact Message
    subject = `📬 New Contact Message - ${data.name}`;
    htmlContent = `
      <h2 style="color: #0D1F3C; border-bottom: 2px solid #A0E9E5; padding-bottom: 10px;">New Contact Message</h2>

      <table style="width: 100%; margin: 20px 0; border-collapse: collapse; font-size: 14px;">
        <tr style="background: #F8FAFC;">
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C; width: 150px;">Name</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C;">Email</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr style="background: #F8FAFC;">
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C;">Phone</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0;"><a href="tel:${data.phone}">${data.phone || 'N/A'}</a></td>
        </tr>
        ${data.subject ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C;">Subject</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0;">${data.subject}</td>
        </tr>
        ` : ''}
      </table>

      <div style="background: #F8FAFC; border-left: 4px solid #A0E9E5; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h4 style="color: #0D1F3C; margin-top: 0; font-size: 14px;">Message:</h4>
        <p style="color: #4A5568; line-height: 1.6; margin: 0; white-space: pre-wrap; word-wrap: break-word;">
          ${data.message}
        </p>
      </div>
    `;
  } else {
    // Quote Request
    subject = `📋 New Quote Request - ${data.name}`;
    htmlContent = `
      <h2 style="color: #0D1F3C; border-bottom: 2px solid #A0E9E5; padding-bottom: 10px;">New Quote Request</h2>

      <table style="width: 100%; margin: 20px 0; border-collapse: collapse; font-size: 14px;">
        <tr style="background: #F8FAFC;">
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C; width: 150px;">Name</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C;">Email</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr style="background: #F8FAFC;">
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C;">Phone</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0;"><a href="tel:${data.phone}">${data.phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C;">Company</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0;">${data.company || 'N/A'}</td>
        </tr>
        <tr style="background: #F8FAFC;">
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C;">Service</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0;">${data.service_type}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C;">POL → POD</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0;">${data.port_of_loading} → ${data.port_of_discharge}</td>
        </tr>
        <tr style="background: #F8FAFC;">
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C;">Container</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0;">${data.container_type}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #E2E8F0; font-weight: bold; color: #0D1F3C;">Cargo Details</td>
          <td style="padding: 10px; border: 1px solid #E2E8F0; white-space: pre-wrap;">${data.cargo_details || 'N/A'}</td>
        </tr>
      </table>
    `;
  }

  const mailOptions = {
    from: `"System" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px;">
          ${htmlContent}
          <p style="text-align: center; color: #A0AEC0; font-size: 12px; margin-top: 30px;">
            © 2025 Sun Xpress Line. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    console.log('[ADMIN] 📤 Sending', isContactMessage ? 'CONTACT' : 'QUOTE', 'notification to:', process.env.ADMIN_EMAIL);
    const result = await transporter.sendMail(mailOptions);
    console.log('[ADMIN] ✅ Sent! Message ID:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('[ADMIN] ❌ Failed:', error.message);
    console.error('[ADMIN] Error Code:', error.code);
    return { success: false, error: error.message };
  }
};

/**
 * Send contact form acknowledgment
 */
export const sendContactAcknowledgment = async (contact) => {
  const mailOptions = {
    from: `"Sun Xpress Line" <${process.env.ADMIN_EMAIL}>`,
    to: contact.email,
    subject: 'We Received Your Message - Sun Xpress Line',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px;">
          
          {/* Header */}
          <div style="text-align: center; border-bottom: 2px solid #A0E9E5; padding-bottom: 20px; margin-bottom: 30px;">
            <h2 style="color: #0D1F3C; margin: 0;">Sun Xpress Line</h2>
            <p style="color: #319795; font-size: 14px; margin: 5px 0 0 0;">Maritime Logistics Excellence</p>
          </div>

          {/* Content */}
          <h3 style="color: #0D1F3C; font-size: 18px; margin-bottom: 15px;">Message Received! 📬</h3>
          
          <p style="color: #4A5568; line-height: 1.6; margin-bottom: 20px;">
            Hi ${contact.name},<br><br>
            Thank you for reaching out to Sun Xpress Line. We've received your message and will review it shortly. Our team typically responds within <strong>24 hours</strong>.
          </p>

          {/* Your Message */}
          <div style="background: #F8FAFC; border-left: 4px solid #A0E9E5; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #0D1F3C; margin-top: 0; font-size: 14px;">Your Message:</h4>
            <p style="color: #4A5568; line-height: 1.6; margin: 10px 0 0 0; white-space: pre-wrap; word-wrap: break-word;">
              ${contact.message || 'N/A'}
            </p>
          </div>

          {/* Subject if provided */}
          ${contact.subject ? `
          <div style="background: #EBF8FF; padding: 12px; border-radius: 4px; margin: 15px 0; font-size: 14px;">
            <strong style="color: #0D1F3C;">Subject:</strong> <span style="color: #4A5568;">${contact.subject}</span>
          </div>
          ` : ''}

          {/* Contact Info */}
          <div style="background: #F0FFFE; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h4 style="color: #0D1F3C; margin-top: 0; font-size: 14px;">Our Contact Details:</h4>
            <p style="font-size: 14px; color: #4A5568; margin: 0;">
              📞 <strong>+91 87544 00780</strong><br/>
              ✉️ <strong>admin@sunxp.in</strong><br/>
              🏢 Tuticorin, Tamil Nadu, India
            </p>
          </div>

          {/* Footer */}
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;"/>
          <p style="text-align: center; font-size: 12px; color: #A0AEC0; margin: 0;">
            © 2025 Sun Xpress Line Private Limited. All rights reserved.
          </p>

        </div>
      </div>
    `,
  };

  try {
    console.log('[CONTACT] 📤 Sending to:', contact.email);
    const result = await transporter.sendMail(mailOptions);
    console.log('[CONTACT] ✅ Sent! Message ID:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('[CONTACT] ❌ Failed:', error.message);
    console.error('[CONTACT] Error Code:', error.code);
    return { success: false, error: error.message };
  }
};

/**
 * Verify email service is working
 */
export const verifyEmailService = async () => {
  try {
    console.log('[VERIFY] 🔍 Verifying email service...');
    await transporter.verify();
    console.log('[VERIFY] ✅ Service verified successfully');
    return { success: true };
  } catch (error) {
    console.error('[VERIFY] ❌ Verification failed:', error.message);
    return { success: false, error: error.message };
  }
};
