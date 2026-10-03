import { sendEmail, transporter } from "../utils/mail";

async function main() {
  await transporter.verify();
  console.log("✅ SMTP connection OK");

  const res = await sendEmail({
    to: "test@example.com",
    subject: "OutreachPulse SMTP test",
    text: "If you see this in Mailtrap, your SMTP settings are correct.",
  });
  console.log("✅ Test email sent:", res.messageId);
}

main().catch((err) => {
  console.error("❌ SMTP test failed:", err.message);
  process.exit(1);
});