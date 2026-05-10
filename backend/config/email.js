const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Traveloop <noreply@traveloop.com>',
      to,
      subject,
      html
    });
    
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

const sendOTPEmail = async (to, otp, fullName) => {
  const subject = 'Traveloop - Password Reset OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hello ${fullName},</h2>
      <p>You requested a password reset for your Traveloop account.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code:</p>
        <h1 style="margin: 10px 0; font-size: 36px; letter-spacing: 5px; color: #333;">${otp}</h1>
        <p style="margin: 0; font-size: 12px; color: #999;">Valid for ${process.env.OTP_EXPIRY_MINUTES || 10} minutes</p>
      </div>
      <p style="color: #666; font-size: 14px;">
        If you didn't request this, please ignore this email or contact support.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        Traveloop - Your Personal Travel Planner
      </p>
    </div>
  `;
  
  return await sendEmail(to, subject, html);
};

const sendWelcomeEmail = async (to, fullName) => {
  const subject = 'Welcome to Traveloop!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome ${fullName}!</h2>
      <p>Thank you for joining Traveloop. Start planning your dream trips today!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CORS_ORIGIN}/dashboard" 
           style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
          Start Planning
        </a>
      </div>
    </div>
  `;
  
  return await sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  transporter
};
