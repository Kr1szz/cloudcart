const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const logger = require("../utils/logger");

const region = process.env.AWS_REGION || 'us-east-1';

let snsClient = null;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'YOUR_AWS_ACCESS_KEY_ID') {
  try {
    snsClient = new SNSClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    logger.info("Amazon SNS Client initialized.");
  } catch (error) {
    logger.warn("Failed to initialize AWS SNS client, SMS alerts will be logged instead:", error.message);
  }
} else {
  logger.warn("SNS access keys missing or default. SMS alerts will be output to logs.");
}

/**
 * Send SMS Order Notification via SNS
 * @param {string} phoneNumber E.164 format (e.g. +1234567890)
 * @param {number} orderId 
 * @param {number} totalAmount 
 */
const sendSMSOrderNotification = async (phoneNumber, orderId, totalAmount) => {
  const message = `CloudCart: Your order #${orderId} for $${Number(totalAmount).toFixed(2)} has been placed successfully! We will notify you when it ships.`;

  if (!snsClient) {
    logger.info(`[SNS LOG FALLBACK] SMS Sent To: ${phoneNumber}. Message: ${message}`);
    return;
  }

  if (!phoneNumber) {
    logger.warn(`No phone number provided for order #${orderId}. Skipping SMS notification.`);
    return;
  }

  try {
    const command = new PublishCommand({
      PhoneNumber: phoneNumber,
      Message: message
    });

    await snsClient.send(command);
    logger.info(`SNS SMS notification sent successfully to ${phoneNumber} for order #${orderId}`);
  } catch (error) {
    logger.error("Error sending SMS via SNS", { error: error.message, phone: phoneNumber });
  }
};

module.exports = {
  sendSMSOrderNotification,
  snsClient
};
