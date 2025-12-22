import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

export async function POST(request) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    const verification_check = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phone, code: otp });

    if (verification_check.status === "approved") {
      return NextResponse.json({ success: true, message: "OTP verified successfully." });
    } else {
      return NextResponse.json({ success: false, message: "Invalid OTP." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    const message = error.code === 20404 ? "OTP has expired or could not be found. Please try again." : "Error verifying OTP.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}