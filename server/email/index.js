import nodemailer from "nodemailer"
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "../config/.env"),
});

export async function errorEmail(subject, text, sendTo = process.env.SMTP_USER) {
    // Create a transporter object
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

  // Set up the email options
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: sendTo,
    subject: subject,
    text: text,
  };

  try {
    // Send the email and wait for the result
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Ensure errors are propagated for the calling function to handle
  }
}

