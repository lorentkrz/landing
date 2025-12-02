import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const contactEmail = "contact@nataa.app";

const hasSmtp =
  !!process.env.SMTP_HOST &&
  !!process.env.SMTP_PORT &&
  !!process.env.SMTP_USER &&
  !!process.env.SMTP_PASS;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase env vars missing" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Send email if SMTP is configured
    if (hasSmtp) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: `"Nataa Contact" <${process.env.SMTP_USER}>`,
        to: contactEmail,
        replyTo: email,
        subject: `Contact form: ${name}`,
        text: `${message}\n\nFrom: ${name} <${email}>`,
        html: `<p>${message}</p><p>From: ${name} &lt;${email}&gt;</p>`
      });
    }

    // Store in Supabase for tracking (table must exist with RLS to allow this)
    await supabase.from("contact_messages").insert({
      name,
      email,
      message,
      source: "landing"
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to submit" }, { status: 500 });
  }
}
