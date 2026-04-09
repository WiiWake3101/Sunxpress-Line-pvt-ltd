/**
 * Validation & Sanitization Utilities
 * Ensures data integrity and security
 */

// Email validation (RFC 5322 simplified)
export const validateEmail = (email) => {
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return regex.test(email);
};

// Indian phone validation (starts with +91)
export const validatePhone = (phone) => {
  const regex = /^\+91[0-9]{10}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

// Sanitize string input (remove HTML/SQL)
export const sanitizeString = (str) => {
  if (!str) return '';
  return str
    .trim()
    .replace(/[<>\"']/g, '') // Remove HTML tags
    .replace(/--/g, '') // Remove SQL comments
    .substring(0, 500); // Max length
};

// Validate required fields
export const validateRequired = (obj, fields) => {
  const errors = [];
  fields.forEach((field) => {
    if (!obj[field] || (typeof obj[field] === 'string' && !obj[field].trim())) {
      errors.push({
        field,
        message: `${field} is required`,
      });
    }
  });
  return errors;
};

// Validate quote form data
export const validateQuoteForm = (data) => {
  const errors = [];

  // Required fields
  const requiredFields = ['name', 'email', 'phone', 'service', 'pol', 'pod', 'container'];
  const requiredErrors = validateRequired(data, requiredFields);
  errors.push(...requiredErrors);

  // Email validation
  if (data.email && !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  // Phone validation
  if (data.phone && !validatePhone(data.phone)) {
    errors.push({
      field: 'phone',
      message: 'Enter valid Indian phone (+91XXXXXXXXXX)',
    });
  }

  // Name length
  if (data.name && (data.name.length < 2 || data.name.length > 100)) {
    errors.push({
      field: 'name',
      message: 'Name must be 2-100 characters',
    });
  }

  // Cargo details length
  if (data.cargo && data.cargo.length > 2000) {
    errors.push({
      field: 'cargo',
      message: 'Cargo details too long (max 2000 characters)',
    });
  }

  return errors;
};

// Validate contact form
export const validateContactForm = (data) => {
  const errors = [];

  const requiredFields = ['name', 'email', 'message'];
  const requiredErrors = validateRequired(data, requiredFields);
  errors.push(...requiredErrors);

  if (data.email && !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (data.message && data.message.length < 10) {
    errors.push({
      field: 'message',
      message: 'Message must be at least 10 characters',
    });
  }

  return errors;
};

// Sanitize form data
export const sanitizeFormData = (data) => {
  return {
    name: sanitizeString(data.name),
    email: data.email?.toLowerCase().trim(),
    phone: data.phone?.replace(/\s/g, ''),
    company: sanitizeString(data.company),
    service: data.service,
    pol: data.pol,
    pod: data.pod,
    container: data.container,
    cargo_details: sanitizeString(data.cargo),
    message: sanitizeString(data.message),
  };
};

// Verify enum values
export const verifyEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

// Get client IP address
export const getClientIP = (request) => {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  );
};
