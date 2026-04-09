/**
 * reCAPTCHA v3 Verification
 * Invisible bot protection
 */

export const verifyRecaptcha = async (token) => {
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 Development mode: Skipping reCAPTCHA verification');
    return { 
      success: true, 
      score: 0.9,
      isDevelopment: true,
      message: 'Development mode - reCAPTCHA bypassed'
    };
  }
  
  if (!token) {
    return { success: false, error: 'reCAPTCHA token missing' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();

    const threshold = 0.5;

    if (!data.success) {
      return { success: false, error: 'reCAPTCHA verification failed' };
    }

    if (data.score < threshold) {
      return {
        success: false,
        error: 'Suspected bot activity. Please try again.',
        score: data.score,
      };
    }

    return {
      success: true,
      score: data.score,
      action: data.action,
      challengeTs: data.challenge_ts,
      hostname: data.hostname,
    };
  } catch (error) {
    console.error('❌ reCAPTCHA error:', error);
    return { success: false, error: 'reCAPTCHA service error' };
  }
};
