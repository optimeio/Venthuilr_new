const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../utils/email');
const OtpStore = require('../models/OtpStore');


exports.sendRegisterOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'Identity already exists' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(6);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // Store in MongoDB — survives Render restarts
        await OtpStore.findOneAndUpdate(
            { email, type: 'register' },
            { otpHash: hashedOtp, verified: false, expiresAt: new Date(Date.now() + 90000) },
            { upsert: true, new: true }
        );

        const mailOptions = {
            from: `Venthulir Organic <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
            to: email,
            subject: 'Verify Your Account - Venthulir',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #0a2e1f; letter-spacing: 2px; margin: 0;">VENTHULIR</h1>
                    <p style="color: #64748b; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Organic Harvest</p>
                </div>
                <h3 style="color: #111;">Verify your email</h3>
                <p style="color: #444; line-height: 1.6;">You have requested to create a new account at Venthulir. Use the code below to verify your email address.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0a2e1f; background: #f8f9f8; padding: 15px 30px; border-radius: 8px; border: 1px solid #e2e8f0;">${otp}</span>
                </div>
                <p style="color: #c40000; font-size: 13px; text-align: center; font-weight: bold;">This code is valid for 90 seconds.</p>
            </div>
            `
        };

        console.log(`📤 Dispatching verification code to: ${email}`);
        await transporter.sendMail(mailOptions);
        console.log(`✅ Royal dispatch successful to: ${email}`);
        res.json({ msg: 'Verification code sent safely.' });

    } catch (err) {
        console.error('OTP Send Error:', err);
        res.status(500).json({ msg: 'Failed to dispatch verification code.' });
    }
};

exports.verifyRegisterOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const record = await OtpStore.findOne({ email, type: 'register' });

        if (!record || record.verified || new Date() > record.expiresAt) {
            return res.status(400).json({ msg: 'Verification code has expired. Please request a new one.' });
        }

        const isMatch = await bcrypt.compare(otp, record.otpHash);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid verification code.' });

        // Mark as verified and extend expiration for 10 minutes
        record.verified = true;
        record.expiresAt = new Date(Date.now() + 600000);
        await record.save();

        res.json({ msg: 'Email successfully verified' });
    } catch (err) {
        console.error('Register OTP Verify Error:', err);
        res.status(500).json({ msg: 'Verification protocol failed.' });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, address, city, state, zipCode } = req.body;

        if (!phone) return res.status(400).json({ message: 'Phone number is required.' });

        const record = await OtpStore.findOne({ email, type: 'register', verified: true });
        if (!record || new Date() > record.expiresAt) {
            return res.status(400).json({ msg: 'Email not verified or session expired. Please verify your email again.' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Identity already exists' });

        await OtpStore.deleteOne({ email, type: 'register' });

        const salt = await bcrypt.genSalt(6);
        const hashedPassword = await bcrypt.hash(password, salt);

        const deliveryAddress = { address: address || '', city: city || '', state: state || '', zipCode: zipCode || '' };

        user = new User({ name, email, phone, password: hashedPassword, deliveryAddress });
        await user.save();

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email },
            process.env.JWT_SECRET || 'venthulir_secret_key',
            { expiresIn: '30d' } // Production session length
        );

        // Send welcome emails synchronously before response so Render doesn't pause process
        const SENDER = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.EMAIL_USER;

        try {
            await transporter.sendMail({
                from: `Venthulir Organic <${SENDER}>`,
                to: email,
                subject: '🌿 Welcome to Venthulir Organic Harvest!',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: #0b3d2e; padding: 30px; text-align: center;">
                        <h1 style="color: #d4af37; margin: 0; letter-spacing: 3px;">VENTHULIR</h1>
                        <p style="color: #a7f3d0; font-size: 13px; margin: 5px 0 0;">Organic Harvest</p>
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color: #0b3d2e;">Welcome, ${name}! 🎉</h2>
                        <p style="color: #555; line-height: 1.7;">Your Venthulir account has been created successfully. You can now shop our premium organic products, track your orders, and enjoy exclusive member benefits.</p>
                        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
                            <p style="margin: 0; color: #166534; font-size: 14px;"><strong>📧 Email:</strong> ${email}</p>
                        </div>
                        <p style="color: #777; font-size: 13px;">If you did not create this account, please contact us immediately at theventhulir@gmail.com</p>
                    </div>
                    <div style="background: #0b3d2e; padding: 16px; text-align: center; font-size: 12px; color: #a7f3d0;">
                        <p style="margin: 0;">© ${new Date().getFullYear()} Venthulir Royal Reserves. All rights reserved.</p>
                    </div>
                </div>`
            });

            // Notify owner of new signup
            await transporter.sendMail({
                from: `Venthulir System <${SENDER}>`,
                to: OWNER_EMAIL,
                subject: `🆕 New Customer Registered: ${name}`,
                html: `<div style="font-family: Arial; padding: 20px; max-width: 500px; border: 1px solid #eee; border-radius: 8px;">
                    <h3 style="color: #0b3d2e;">New Customer Registered</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Registered At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                </div>`
            });
        } catch (mailErr) {
            console.error('❌ Welcome email failed, continuing login sequence:', mailErr.message);
        }

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, deliveryAddress: user.deliveryAddress, isAdmin: user.isAdmin }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Sovereign Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Identity not found in our records.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials. Access denied.' });

        const expiresIn = rememberMe ? '30d' : '7d';
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email },
            process.env.JWT_SECRET || 'venthulir_secret_key',
            { expiresIn }
        );

        res.json({ token, user: { id: user._id, name: user.name, email, isAdmin: user.isAdmin } });
    } catch (err) {
        res.status(500).json({ msg: 'Sovereign Server Error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const { address, city, state, zipCode } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.deliveryAddress = {
            address: address || user.deliveryAddress.address,
            city: city || user.deliveryAddress.city,
            state: state || user.deliveryAddress.state,
            zipCode: zipCode || user.deliveryAddress.zipCode
        };

        await user.save();
        res.json({ msg: 'Address updated successfully', deliveryAddress: user.deliveryAddress });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error updating address' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();
        res.json({ msg: 'Profile updated successfully', user: { name: user.name, phone: user.phone } });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error updating profile' });
    }
};

exports.sendOTP = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ msg: 'Identity not found in our records.' });

        // Authenticate password first to prevent OTP spam
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials. Access denied.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const salt = await bcrypt.genSalt(6);
        user.otp = await bcrypt.hash(otp, salt);
        user.otpExpires = Date.now() + 60000; // 1 minute expiration
        await user.save();

        const mailOptions = {
            from: `Venthulir Organic <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
            to: email,
            subject: 'Your Royal Login Code - Venthulir',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #0a2e1f; letter-spacing: 2px; margin: 0;">VENTHULIR</h1>
                    <p style="color: #64748b; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Organic Harvest</p>
                </div>
                <h3 style="color: #111;">Greetings, ${user.name},</h3>
                <p style="color: #444; line-height: 1.6;">You have requested to securely sign in to your Venthulir registry. Here is your one-time code.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0a2e1f; background: #f8f9f8; padding: 15px 30px; border-radius: 8px; border: 1px solid #e2e8f0;">${otp}</span>
                </div>
                <p style="color: #c40000; font-size: 13px; text-align: center; font-weight: bold;">This code is valid for 60 seconds.</p>
                <p style="color: #777; font-size: 12px; text-align: center; margin-top: 30px;">If you did not request this, please safely ignore this email.</p>
            </div>
            `
        };

        console.log(`📤 Dispatching login code to: ${email}`);
        await transporter.sendMail(mailOptions);
        console.log(`✅ Login courier reached destination: ${email}`);
        res.json({ msg: 'Verification code sent safely to your chamber.' });

    } catch (err) {
        console.error('OTP Send Error:', err);
        res.status(500).json({ msg: 'Failed to dispatch royal courier.' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp, rememberMe } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ msg: 'Identity not found.' });

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ msg: 'No pending verification. Please request a new code.' });
        }

        if (Date.now() > user.otpExpires) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(400).json({ msg: 'Verification code has expired. Please request a new one.' });
        }

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid verification code.' });
        }

        // OTP Verified
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const expiresIn = rememberMe ? '30d' : '7d';
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email },
            process.env.JWT_SECRET || 'venthulir_secret_key',
            { expiresIn }
        );

        res.json({ token, user: { id: user._id, name: user.name, email, isAdmin: user.isAdmin } });

    } catch (err) {
        console.error('OTP Verify Error:', err);
        res.status(500).json({ msg: 'Verification protocol failed.' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'This email is not registered with Venthulir.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(6);
        const hashedOtp = await bcrypt.hash(otp, salt);

        // Store in MongoDB — survives Render restarts
        await OtpStore.findOneAndUpdate(
            { email, type: 'reset' },
            { otpHash: hashedOtp, verified: false, expiresAt: new Date(Date.now() + 90000) },
            { upsert: true, new: true }
        );

        const mailOptions = {
            from: `Venthulir Support <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
            to: email,
            subject: 'Reset Your Venthulir Password',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h1 style="color: #0a2e1f; text-align: center;">VENTHULIR</h1>
                <h3>Password Reset Request</h3>
                <p>Use the following code to reset your password. If you didn't request this, please ignore this email.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0a2e1f; background: #f8f9f8; padding: 15px 30px; border-radius: 8px; border: 1px solid #e2e8f0;">${otp}</span>
                </div>
                <p style="color: #c40000; font-size: 13px; text-align: center; font-weight: bold;">This code is valid for 60 seconds.</p>
            </div>
            `
        };

        console.log(`📤 Dispatching password reset code to: ${email}`);
        await transporter.sendMail(mailOptions);
        console.log(`✅ Status: Reset code delivered to ${email}`);
        res.json({ msg: 'Password reset code sent to your email.' });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to send reset code.' });
    }
};

exports.verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const record = await OtpStore.findOne({ email, type: 'reset' });

        if (!record || new Date() > record.expiresAt) {
            return res.status(400).json({ msg: 'Reset code expired or invalid.' });
        }

        const isMatch = await bcrypt.compare(otp, record.otpHash);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid reset code.' });

        // Mark as verified and extend for password entry
        record.verified = true;
        record.expiresAt = new Date(Date.now() + 600000);
        await record.save();

        res.json({ msg: 'Code verified. You may now reset your password.' });
    } catch (err) {
        res.status(500).json({ msg: 'Verification failed.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const record = await OtpStore.findOne({ email, type: 'reset', verified: true });

        if (!record || new Date() > record.expiresAt) {
            return res.status(400).json({ msg: 'Session expired or invalid. Please verify again.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'Identity not found.' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        await OtpStore.deleteOne({ email, type: 'reset' });
        res.json({ msg: 'Password reset successful. You can now sign in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Reset failed.' });
    }
};
