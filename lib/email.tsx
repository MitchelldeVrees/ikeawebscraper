import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

interface EmailData {
  to: string;
  productName: string;
  productPrice: number;
  storeName: string;
  productImage?: string;
  watchId: string;
  originalPrice?: number;
  distanceKm?: number;
  fuelCost?: number;
  fuelPricePerLiter?: number;
  fuelUsage?: number;
  storeAddress?: string;
}

export async function sendProductAlert(data: EmailData): Promise<boolean> {
  if (!resendClient) {
    console.error("[v0] RESEND_API_KEY missing - cannot send alert email");
    return false;
  }

  try {
    const response = await resendClient.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "IKEA Tweedekansje Alerts <onboarding@resend.dev>",
      to: data.to,
      subject: `IKEA Deal Alert: ${data.productName}`,
      html: generateEmailHtml(data),
    });

    if (response.error) {
      console.error("[v0] Resend API error:", response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[v0] Error sending email:", error);
    return false;
  }
}

function formatCurrency(value: number | undefined | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return `€${value.toFixed(2)}`;
}

function generateEmailHtml(data: EmailData): string {
  const originalPrice =
    typeof data.originalPrice === "number" && data.originalPrice > 0
      ? data.originalPrice
      : null;
  const priceNow = data.productPrice;
  const fuelCost =
    typeof data.fuelCost === "number" && data.fuelCost > 0
      ? data.fuelCost
      : null;
  const potentialSavings =
    originalPrice !== null
      ? originalPrice - priceNow - (fuelCost ?? 0)
      : null;
  const distanceInfo =
    typeof data.distanceKm === "number" && data.distanceKm > 0
      ? `${data.distanceKm.toFixed(1)} km round trip`
      : null;
  const fuelUsageInfo =
    typeof data.fuelUsage === "number" && data.fuelUsage > 0
      ? `${data.fuelUsage.toFixed(1)} L/100km`
      : null;
  const fuelPriceInfo =
    typeof data.fuelPricePerLiter === "number" && data.fuelPricePerLiter > 0
      ? `${data.fuelPricePerLiter.toFixed(2)} €/L`
      : null;

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
              <p class="price">${formatCurrency(priceNow) ?? ""}</p>
              <p><strong>Store:</strong> ${data.storeName}</p>
              ${data.storeAddress ? `<p><strong>Address:</strong> ${data.storeAddress}</p>` : ""}
              <p>
                <a href="https://www.ikea.com/nl/nl/stores/tweedekansje/" class="button">
                  View on IKEA Tweedekansje
                </a>
              </p>
            </div>
            <div class="product" style="background-color:#fff7d6;">
              <h3>Price Breakdown</h3>
              <ul style="padding-left:20px;">
                ${
                  originalPrice !== null
                    ? `<li>Original price: <strong>${formatCurrency(originalPrice)}</strong></li>`
                    : ""
                }
                <li>Tweedekansje price: <strong>${formatCurrency(priceNow) ?? ""}</strong></li>
                ${
                  fuelCost !== null
                    ? `<li>Estimated fuel cost: <strong>${formatCurrency(fuelCost)}</strong>${
                        distanceInfo
                          ? ` (${distanceInfo}${fuelUsageInfo ? `, ${fuelUsageInfo}` : ""}${
                              fuelPriceInfo ? `, fuel price ${fuelPriceInfo}` : ""
                            })`
                          : ""
                      }</li>`
                    : ""
                }
                ${
                  potentialSavings !== null
                    ? `<li>Estimated savings after fuel: <strong>${formatCurrency(
                        potentialSavings
                      )}</strong></li>`
                    : ""
                }
              </ul>
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
