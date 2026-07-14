/**
 * Vercel Serverless Function — POST /api/contact
 * Handles contact form submissions and email delivery via Resend.
 * 
 * Required Environment Variables:
 *  - RESEND_API_KEY=<your_resend_api_key>
 *  - CONTACT_EMAIL=devottamkumar7@gmail.com
 */

import { Resend } from 'resend';

const ipCache = new Map<string, number>();
const RATE_LIMIT_COOLDOWN = 45 * 1000; // 45 seconds cooldown

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, company, message } = req.body;

  // 1. IP rate limiting
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').toString();
  const now = Date.now();
  if (ipCache.has(ip)) {
    const lastTime = ipCache.get(ip)!;
    if (now - lastTime < RATE_LIMIT_COOLDOWN) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment before sending another message.' });
    }
  }

  // 2. Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields: Name, Email, and Message are required.' });
  }

  // 3. Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  // 4. Sanitize inputs to prevent basic scripting injections
  const sanitize = (val: string) => {
    if (!val) return '';
    return val.replace(/<[^>]*>/g, '').trim();
  };

  const cleanName = sanitize(name);
  const cleanEmail = sanitize(email);
  const cleanCompany = sanitize(company || '');
  const cleanMessage = sanitize(message);

  // 5. Verify Resend SDK readiness
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Resend Warning] RESEND_API_KEY is not defined in the environment.');
    console.log(`[Offline Submission Record]\nName: ${cleanName}\nEmail: ${cleanEmail}\nCompany: ${cleanCompany}\nMessage: ${cleanMessage}`);
    return res.status(503).json({ error: 'Outbound email service is not configured on this host.' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const destinationEmail = process.env.CONTACT_EMAIL || 'devottamkumar7@gmail.com';

    // 6. Send Notification Email
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'contact@devottamkumar.in',
      to: destinationEmail,
      subject: 'New Portfolio Contact Submission',
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\nCompany: ${cleanCompany || 'N/A'}\nSubmitted At: ${new Date().toISOString()}\n\nMessage:\n${cleanMessage}`,
    });

    if (response.error) {
      console.error('[Resend Error Response]:', response.error);
      return res.status(500).json({ error: 'Failed to dispatch email via Resend.', details: response.error.message });
    }

    // Update rate limit cache on success
    ipCache.set(ip, now);

    return res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error: any) {
    console.error('Failed to send email via Resend:', error);
    return res.status(500).json({ error: 'Internal server error while processing transmission.', details: error.message });
  }
}
