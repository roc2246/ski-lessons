import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "../config/.env"),
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.APP_PASSWORD,
  },
  requireTLS: true,
});

export async function errorEmail(subject, text, sendTo = process.env.SMTP_USER) {
  const smtpUser = process.env.SMTP_USER;
  const appPassword = process.env.APP_PASSWORD;

  // Keep error notifications best-effort and non-blocking.
  if (!smtpUser || !appPassword) {
    console.warn("Email notification skipped: SMTP credentials are not configured.");
    return false;
  }

  const mailOptions = {
    from: smtpUser,
    to: sendTo,
    subject: subject,
    text: text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

