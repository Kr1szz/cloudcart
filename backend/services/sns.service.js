const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const logger = require("../utils/logger");

const region = process.env.AWS_REGION || 'us-east-1';
const topicArn = process.env.SNS_TOPIC_ARN;

let snsClient = null;

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
    snsClient = new SNSClient(config);
    logger.info("Amazon SNS Client initialized successfully.");
  } catch (error) {
    logger.warn("Failed to initialize AWS SNS client, SMS/topic alerts will be logged instead:", error.message);
  }
} else {
  logger.warn("SNS client not initialized (no credentials and not in production). SMS/topic alerts will be output to logs.");
}

/**
 * Send SMS Order Notification via SNS and/or publish to SNS Topic
 * @param {string} phoneNumber E.164 format (e.g. +1234567890)
 * @param {number} orderId 
 * @param {number} totalAmount 
 */
const sendSMSOrderNotification = async (phoneNumber, orderId, totalAmount) => {
  const message = `CloudCart: Your order #${orderId} for $${Number(totalAmount).toFixed(2)} has been placed successfully! We will notify you when it ships.`;

  if (!snsClient) {
    logger.info(`[SNS LOG FALLBACK] SMS notification generated. Phone: ${phoneNumber || 'None'}, Message: ${message}`);
    if (topicArn) {
      logger.info(`[SNS LOG FALLBACK] Topic publication simulated for ${topicArn}`);
    }
    return;
  }

  // 1. Publish to Topic if topic ARN is configured and valid
  const hasValidTopicArn = topicArn && topicArn !== 'YOUR_SNS_TOPIC_ARN' && !topicArn.includes('123456789012');
  if (hasValidTopicArn) {
    try {
      const topicCommand = new PublishCommand({
        TopicArn: topicArn,
        Subject: `CloudCart Order #${orderId} Placed`,
        Message: message
      });
      await snsClient.send(topicCommand);
      logger.info(`SNS Topic alert published successfully to ${topicArn} for order #${orderId}`);
    } catch (error) {
      logger.error("Error publishing message to SNS Topic", { error: error.message, topicArn });
    }
  } else {
    logger.debug("SNS Topic ARN not configured or using default template. Skipping topic publish.");
  }

  // 2. Send direct SMS if phone number is provided
  if (phoneNumber) {
    try {
      const smsCommand = new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: message
      });
      await snsClient.send(smsCommand);
      logger.info(`SNS SMS notification sent successfully to ${phoneNumber} for order #${orderId}`);
    } catch (error) {
      logger.error("Error sending direct SMS via SNS", { error: error.message, phone: phoneNumber });
    }
  } else {
    logger.warn(`No phone number provided for order #${orderId}. Skipping direct SMS notification.`);
  }
};

module.exports = {
  sendSMSOrderNotification,
  snsClient
};

