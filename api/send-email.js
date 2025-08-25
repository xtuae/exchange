import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, usdAmount, nilaAmount } = req.body;

  if (!name || !email || !usdAmount || !nilaAmount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <div style="text-align: center; padding: 20px;">
        <img src="https://exchange-dun.vercel.app/mindwave-logo.webp" alt="MindWaveDAO Logo" style="width: 100px; height: auto;" />
      </div>
      <h2 style="text-align: center;">Transaction Successful!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for your purchase. Here are your transaction details:</p>
      <ul>
        <li><strong>USD Amount:</strong> $${usdAmount}</li>
        <li><strong>NILA Tokens to be Received:</strong> ${nilaAmount.toFixed(2)} NILA</li>
      </ul>
      <p>Your NILA tokens will be sent to the designated wallet shortly.</p>
      <p>Thank you for your support!</p>
      <p><strong>The MindWaveDAO Team</strong></p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"MindWaveDAO" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: 'Your NILA Token Transaction was Successful!',
      html: emailHtml,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
