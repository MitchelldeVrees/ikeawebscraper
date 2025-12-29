import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const contactRecipient = process.env.CONTACT_RECIPIENT_EMAIL;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

type ContactEmailData = {
  name: string;
  replyTo?: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactEmail(
  data: ContactEmailData
): Promise<boolean> {
  if (!resendClient) {
    console.error("[v0] RESEND_API_KEY missing - cannot send contact email");
    return false;
  }

  if (!contactRecipient) {
    console.error(
      "[v0] CONTACT_RECIPIENT_EMAIL missing - cannot send contact email"
    );
    return false;
  }

  try {
    const response = await resendClient.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "IKEA Tweedekansje Alerts <alerts@ikeatweedekans.com>",
      to: contactRecipient,
      subject: `Nieuw contactbericht van ${data.name}`,
      reply_to: data.replyTo ? [data.replyTo] : undefined,
      html: generateContactEmailHtml(data),
    });

    if (response.error) {
      console.error("[v0] Resend API error (contact):", response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[v0] Error sending contact email:", error);
    return false;
  }
}

function generateContactEmailHtml(data: ContactEmailData): string {
  const safeName = escapeHtml(data.name);
  const safeMessage = escapeHtml(data.message).replace(/\n/g, "<br>");
  const safeReply =
    data.replyTo && data.replyTo.trim().length > 0
      ? escapeHtml(data.replyTo)
      : null;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #111; }
          .container { max-width: 640px; margin: 0 auto; padding: 20px; background: #f8fafc; }
          .card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; }
          .header { font-size: 20px; font-weight: bold; margin-bottom: 12px; color: #0f172a; }
          .meta { font-size: 14px; color: #475569; margin-bottom: 8px; }
          .message { white-space: pre-wrap; font-size: 15px; color: #0f172a; }
          .tag { display: inline-block; margin-top: 6px; padding: 6px 10px; background: #e0f2fe; border-radius: 9999px; color: #0c4a6e; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">Nieuw contactbericht</div>
            <div class="meta"><strong>Naam:</strong> ${safeName}</div>
            ${
              safeReply
                ? `<div class="meta"><strong>E-mail:</strong> ${safeReply}</div>`
                : `<div class="tag">Geen e-mailadres opgegeven</div>`
            }
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
            <div class="message">${safeMessage}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}
