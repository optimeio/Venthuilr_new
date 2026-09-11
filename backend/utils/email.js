require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const getGmailTransporter = () => {
    const emailUser = process.env.EMAIL_USER || 'theventhulir@gmail.com';
    const rawPass = process.env.EMAIL_PASS || '';
    const emailPass = rawPass.replace(/\s+/g, '');

    if (emailUser && emailPass) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });
    }
    return null;
};

const transporter = {
    sendMail: async ({ from, to, subject, html, text }) => {
        const emailUser = process.env.EMAIL_USER || 'theventhulir@gmail.com';
        const sender = from || `"Venthulir Organic" <${emailUser}>`;
        const recipient = Array.isArray(to) ? to.join(', ') : to;

        // Try Gmail SMTP first
        const gmailTransporter = getGmailTransporter();
        if (gmailTransporter) {
            try {
                const info = await gmailTransporter.sendMail({
                    from: sender,
                    to: recipient,
                    subject,
                    html: html || `<p>${text}</p>`,
                    text: text || ''
                });
                console.log('✅ Email sent successfully via Gmail SMTP. MessageID:', info.messageId);
                return info;
            } catch (err) {
                console.error('⚠️ Gmail SMTP failed:', err.message);
            }
        }

        // Fallback to Resend if configured
        if (process.env.RESEND_API_KEY) {
            try {
                const { Resend } = require('resend');
                const resend = new Resend(process.env.RESEND_API_KEY);
                const { data, error } = await resend.emails.send({
                    from: from || `Venthulir Organic <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                    to: Array.isArray(to) ? to : [to],
                    subject,
                    html: html || `<p>${text}</p>`
                });
                if (!error && data) {
                    console.log('✅ Email sent successfully via Resend. ID:', data.id);
                    return data;
                }
            } catch (resendErr) {
                console.error('⚠️ Resend fallback error:', resendErr.message);
            }
        }

        throw new Error('All email delivery methods failed. Please verify email credentials.');
    },
    verify: (callback) => {
        const gmailTransporter = getGmailTransporter();
        if (gmailTransporter) {
            gmailTransporter.verify((err, success) => {
                if (err) {
                    console.warn('⚠️ Gmail SMTP verification warning:', err.message);
                    if (callback) callback(err);
                } else {
                    console.log('✅ Gmail SMTP is configured and ready to deliver customer emails.');
                    if (callback) callback(null, true);
                }
            });
        } else if (callback) {
            callback(null, true);
        }
    }
};

transporter.verify();

module.exports = transporter;
