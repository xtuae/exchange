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
  <body style="margin: 0; font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
    <div style="background: radial-gradient(ellipse at center top, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at center bottom, rgba(138, 43, 226, 0.1) 0%, transparent 50%); padding: 20px;">
      <div style="text-align: center; padding: 20px;">
        <img src="https://exchange-dun.vercel.app/mindwave-logo.webp" alt="MindWaveDAO Logo" style="width: 100px; height: auto; filter: drop-shadow(0 0 20px rgba(138, 43, 226, 0.5));" />
      </div>
      <div style="background: rgba(20, 20, 20, 0.8); border: 1px solid rgba(138, 43, 226, 0.3); border-radius: 20px; padding: 2.5rem; max-width: 500px; margin: auto;">
        <h2 style="text-align: center; font-size: 2.5rem; font-weight: 700; background: linear-gradient(135deg, #ffffff 0%, #b794f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Transaction Successful!</h2>
        <p style="color: #e2e8f0;">Hello ${name},</p>
        <p style="color: #e2e8f0;">Thank you for your purchase. Here are your transaction details:</p>
        <div style="background: rgba(30, 30, 30, 0.6); border: 1px solid rgba(138, 43, 226, 0.2); border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem;">
          <p style="margin: 0.5rem 0; color: #e2e8f0;"><strong style="color: #b794f6; margin-right: 0.5rem;">USD Amount:</strong> $${usdAmount}</p>
          <p style="margin: 0.5rem 0; color: #e2e8f0;"><strong style="color: #b794f6; margin-right: 0.5rem;">NILA Tokens to be Received:</strong> ${nilaAmount.toFixed(2)} NILA</p>
        </div>
        <p style="color: #e2e8f0;">Our team will contact you shortly regarding the token airdrop to your wallet.</p>
        <p style="color: #e2e8f0;">Thank you for your support!</p>
        <p style="color: #e2e8f0;"><strong>The MindWaveDAO Team</strong></p>
      </div>
    </div>
  </body>
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
