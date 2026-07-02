const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const logger = require("../utils/logger");

const region = process.env.AWS_REGION || 'us-east-1';
const senderEmail = process.env.SES_SENDER_EMAIL || 'noreply@cloudcart.com';

let sesClient = null;

const hasStaticCredentials =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_ACCESS_KEY_ID !== 'YOUR_AWS_ACCESS_KEY_ID';

const shouldInitialize = hasStaticCredentials || process.env.NODE_ENV === 'production';

if (shouldInitialize) {
  try {
    const config = { region };
    if (hasStaticCredentials) {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      };
    }
    sesClient = new SESClient(config);
    logger.info("Amazon SES Client initialized successfully.");
  } catch (error) {
    logger.warn("Failed to initialize AWS SES client, emails will be logged instead:", error.message);
  }
} else {
  logger.warn("SES client not initialized (no credentials and not in production). Email notification will be output to logs.");
}

/**
 * Send Order Confirmation Email
 * @param {string} toEmail 
 * @param {object} order 
 * @param {array} items 
 */
const sendOrderConfirmationEmail = async (toEmail, order, items) => {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${Number(item.price).toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #0d6efd; text-align: center;">CloudCart Order Confirmation</h2>
      <p>Dear Customer,</p>
      <p>Thank you for shopping with CloudCart! Your order has been placed successfully and is being processed.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0;">Order Summary</h4>
        <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order.id}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.created_at || new Date()).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Shipping Address:</strong> ${order.shipping_address}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f1f1f1;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Grand Total:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #0d6efd;">$${Number(order.total_amount).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <p style="margin-top: 30px; text-align: center; color: #777; font-size: 12px;">
        CloudCart Platform - AWS Showcase MCA Project. All rights reserved.
      </p>
    </div>
  `;

  if (!sesClient) {
    logger.info(`[SES LOG FALLBACK] Email Sent To: ${toEmail}. Subject: CloudCart Order Confirmation #${order.id}`);
    logger.info(`[SES LOG FALLBACK] Body: ${htmlBody}`);
    return;
  }

  try {
    const command = new SendEmailCommand({
      Source: senderEmail,
      Destination: {
        ToAddresses: [toEmail]
      },
      Message: {
        Subject: {
          Data: `CloudCart Order Confirmation - Order #${order.id}`,
          Charset: "UTF-8"
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: "UTF-8"
          }
        }
      }
    });

    await sesClient.send(command);
    logger.info(`SES email sent successfully to ${toEmail} for order #${order.id}`);
  } catch (error) {
    logger.error("Error sending email via SES", { error: error.message, to: toEmail });
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sesClient
};
