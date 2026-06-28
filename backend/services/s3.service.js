const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const logger = require("../utils/logger");

const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.S3_BUCKET_NAME;

let s3Client = null;

if (bucketName && bucketName !== 'cloudcart-media-bucket-mca') {
  try {
    const config = { region };
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'YOUR_AWS_ACCESS_KEY_ID') {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      };
    }
    s3Client = new S3Client(config);
    logger.info("AWS S3 Client initialized.");
  } catch (error) {
    logger.warn("Failed to initialize AWS S3 client, falling back to local file storage:", error.message);
  }
} else {
  logger.warn("S3 bucket name not set. Product images will be stored locally in public/uploads.");
}

/**
 * Upload image to Amazon S3 or return local path fallback
 * @param {Buffer} fileBuffer 
 * @param {string} fileName 
 * @param {string} mimeType 
 */
const uploadImage = async (fileBuffer, fileName, mimeType) => {
  if (!s3Client) {
    logger.debug("S3 not configured. Using local filesystem upload path.");
    return `/uploads/${fileName}`;
  }

  try {
    const uniqueKey = `${Date.now()}_${fileName}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read' // Assumes public read-enabled bucket policy, or we will access via CloudFront
    });

    await s3Client.send(command);
    
    // Return the CloudFront URL if configured, otherwise the direct S3 URL
    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
    if (cloudfrontDomain) {
      return `https://${cloudfrontDomain}/${uniqueKey}`;
    }
    return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;
  } catch (error) {
    logger.error("Error uploading to S3, using fallback local path", { error: error.message });
    return `/uploads/${fileName}`;
  }
};

/**
 * Delete image from Amazon S3
 * @param {string} fileUrl 
 */
const deleteImage = async (fileUrl) => {
  if (!s3Client || !fileUrl) return;

  try {
    // Extract key from URL
    let key = '';
    if (fileUrl.includes('.amazonaws.com/')) {
      key = fileUrl.split('.amazonaws.com/')[1];
    } else if (process.env.CLOUDFRONT_DOMAIN && fileUrl.includes(process.env.CLOUDFRONT_DOMAIN)) {
      key = fileUrl.split(`${process.env.CLOUDFRONT_DOMAIN}/`)[1];
    } else {
      // Local file or direct key
      key = fileUrl.replace('/uploads/', '');
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3Client.send(command);
    logger.info("Image deleted from S3 successfully", { key });
  } catch (error) {
    logger.error("Error deleting image from S3", { error: error.message });
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  s3Client
};
