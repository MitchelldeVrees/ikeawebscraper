interface EmailData {
  to: string;
  productName: string;
  productPrice: number;
  storeName: string;
  productImage?: string;
  watchId: string;
}

export async function sendProductAlert(data: EmailData): Promise<boolean> {
  try {
    // For now, we'll log the email content
    // In production, integrate with Resend or another email service
    console.log("[v0] Sending email alert:", {
      to: data.to,
      subject: `IKEA Deal Alert: ${data.productName}`,
      content: {
        productName: data.productName,
        price: `€${data.productPrice.toFixed(2)}`,
        store: data.storeName,
        imageUrl: data.productImage,
      },
    });

    // TODO: Integrate with Resend
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'IKEA Alerts <alerts@yourdomain.com>',
    //   to: data.to,
    //   subject: `IKEA Deal Alert: ${data.productName}`,
    //   html: generateEmailHtml(data),
    // });

    return true;
  } catch (error) {
    console.error("[v0] Error sending email:", error);
    return false;
  }
}

function generateEmailHtml(data: EmailData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0051BA; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .product { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .product-image { max-width: 100%; height: auto; margin-bottom: 15px; }
          .price { font-size: 24px; font-weight: bold; color: #0051BA; }
          .button { background-color: #FFDA1A; color: #111; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IKEA Tweedekansje Alert!</h1>
          </div>
          <div class="content">
            <p>Great news! The product you're watching is now available:</p>
            <div class="product">
              ${data.productImage ? `<img src="${data.productImage}" alt="${data.productName}" class="product-image">` : ''}
              <h2>${data.productName}</h2>
              <p class="price">€${data.productPrice.toFixed(2)}</p>
              <p><strong>Store:</strong> ${data.storeName}</p>
              <p>
                <a href="https://www.ikea.com/nl/nl/stores/tweedekansje/" class="button">
                  View on IKEA Tweedekansje
                </a>
              </p>
            </div>
            <p>This is a limited-time offer. Visit your local IKEA store to purchase this item.</p>
          </div>
          <div class="footer">
            <p>You received this email because you set up a watch for this product.</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/manage">Manage your watches</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}
