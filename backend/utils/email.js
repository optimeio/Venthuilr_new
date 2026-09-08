const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Wrapper that mimics nodemailer's sendMail interface
const transporter = {
    sendMail: async ({ from, to, subject, html, text }) => {
        const { data, error } = await resend.emails.send({
            from: from || `Venthulir Organic <onboarding@resend.dev>`,
            to: Array.isArray(to) ? to : [to],
            subject,
            html: html || `<p>${text}</p>`
        });

        if (error) {
            console.error('Resend Email Error:', error);
            throw new Error(error.message || 'Failed to send email via Resend');
        }

        console.log('✅ Email sent successfully via Resend. ID:', data.id);
        return data;
    },
    verify: (callback) => {
        // Resend doesn't need a live connection check — always ready
        if (process.env.RESEND_API_KEY) {
            console.log('✅ Resend API Key is configured. Mail service ready.');
            if (callback) callback(null, true);
        } else {
            console.error('❌ RESEND_API_KEY is missing from environment variables!');
            if (callback) callback(new Error('Missing RESEND_API_KEY'));
        }
    }
};

transporter.verify();

module.exports = transporter;
