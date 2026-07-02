const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");

const region = process.env.AWS_REGION || "us-east-1";
let lambdaClient = null;

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
    lambdaClient = new LambdaClient(config);
    logger.info("AWS Lambda Client initialized successfully.");
  } catch (error) {
    logger.warn("Failed to initialize AWS Lambda client, using local mock invoice instead:", error.message);
  }
} else {
  logger.warn("Lambda client not initialized (no credentials and not in production). Using local mock invoice system.");
}

/**
 * Invoke Lambda Function to generate invoice PDF
 * @param {object} order 
 * @param {array} items 
 * @param {object} user 
 * @returns {Promise<string>} S3 invoice URL or fallback path
 */
const generateInvoice = async (order, items, user) => {
  const payload = { order, items, user };

  if (!lambdaClient) {
    logger.info("Lambda not configured. Generating a mock local invoice file...");
    // Mock local invoice generation
    const mockFilename = `invoice_mock_${order.id}.txt`;
    const uploadsDir = path.join(__dirname, "../uploads");
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const mockContent = `
========================================
CLOUDCART INVOICE (MOCK LOCAL FALLBACK)
========================================
Order ID: #${order.id}
Date: ${new Date().toLocaleString()}
Customer: ${user.username} (${user.email})
Shipping Address: ${order.shipping_address}
----------------------------------------
Items:
${items.map(i => `- ${i.name} x${i.quantity} @ $${Number(i.price).toFixed(2)}`).join("\n")}
----------------------------------------
Total Paid: $${Number(order.total_amount).toFixed(2)}
========================================
    `;

    const filePath = path.join(uploadsDir, mockFilename);
    fs.writeFileSync(filePath, mockContent);
    
    return `/uploads/${mockFilename}`;
  }

  try {
    const command = new InvokeCommand({
      FunctionName: "cloudcart-invoice-generator",
      Payload: JSON.stringify(payload)
    });

    const response = await lambdaClient.send(command);
    const resultPayload = JSON.parse(new TextDecoder("utf-8").decode(response.Payload));
    
    if (resultPayload.statusCode === 200) {
      const data = JSON.parse(resultPayload.body);
      logger.info(`Lambda Invoice generated: ${data.invoiceUrl}`);
      return data.invoiceUrl;
    } else {
      throw new Error(resultPayload.body || "Lambda returned non-200 status");
    }
  } catch (error) {
    logger.error("Lambda invoice generation failed, using local mock fallback", { error: error.message });
    return `/uploads/invoice_mock_${order.id}.txt`;
  }
};

module.exports = {
  generateInvoice,
  lambdaClient
};
