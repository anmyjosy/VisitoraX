import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Ensure you have SMTP_USER and SMTP_PASS in your .env.local file
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use STARTTLS
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // For Gmail, this should be an "App Password"
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/send-otp:", error);
    return NextResponse.json({ success: false, error: "Error sending email" }, { status: 500 });
  }
}
