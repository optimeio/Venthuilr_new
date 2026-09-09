import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 're_JEn7Uw8p_ArWkoKr8hp25NpMqye7zAFu5';
const resend = new Resend(resendApiKey);

export async function sendEmail({ to, subject, html, text }) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Venthulir Organic <onboarding@resend.dev>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || `<p>${text || ''}</p>`,
    });

    if (error) {
      console.error('❌ Resend Email Error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email sent successfully via Resend. ID:', data?.id);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Resend Dispatch Exception:', err);
    return { success: false, error: err.message };
  }
}

export default sendEmail;
