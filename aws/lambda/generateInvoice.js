/**
 * AWS Lambda Function - CloudCart Invoice Generator
 * Triggered by: Direct Invocation, SQS, or SNS
 * Dependencies: pdfkit, @aws-sdk/client-s3, mysql2 (if updating DB directly)
 */

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const PDFDocument = require("pdfkit");

const s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
const bucketName = process.env.S3_BUCKET_NAME || "cloudcart-media-bucket-mca";

exports.handler = async (event) => {
  console.log("Invoice Generator Lambda triggered with event:", JSON.stringify(event));

  const { order, items, user } = event;

  if (!order || !items || !user) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required order, items, or user details." }),
    };
  }

  try {
    // 1. Generate PDF in Memory
    const pdfBuffer = await generateInvoicePDF(order, items, user);
    const invoiceKey = `invoices/invoice_${order.id}_${Date.now()}.pdf`;

    // 2. Upload to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: invoiceKey,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    const invoiceUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${invoiceKey}`;
    
    console.log(`Successfully generated and uploaded invoice to S3: ${invoiceUrl}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Invoice generated successfully",
        invoiceUrl: invoiceUrl,
        invoiceKey: invoiceKey
      }),
    };
  } catch (error) {
    console.error("Error generating invoice:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to generate invoice", error: error.message }),
    };
  }
};

/**
 * Generates a PDF invoice using PDFKit and returns a Buffer
 */
function generateInvoicePDF(order, items, user) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // Header / Branding
    doc.fillColor("#0d6efd").fontSize(26).text("CLOUDCART", 50, 45);
    doc.fillColor("#333").fontSize(10).text("AWS Cloud-Native E-Commerce Platform", 50, 75);
    
    doc.fontSize(18).fillColor("#212529").text("INVOICE", 450, 45, { align: "right" });
    doc.fontSize(10).fillColor("#777").text(`Invoice No: INV-${order.id}`, 400, 65, { align: "right" });
    doc.text(`Date: ${new Date(order.created_at || new Date()).toLocaleDateString()}`, 400, 80, { align: "right" });

    // Divider Line
    doc.moveTo(50, 110).lineTo(550, 110).strokeColor("#eee").stroke();

    // Bill To & Ship To
    doc.fontSize(12).fillColor("#0d6efd").text("Bill To:", 50, 130);
    doc.fontSize(10).fillColor("#333");
    doc.text(user.username || "Customer", 50, 148);
    doc.text(user.email, 50, 160);
    if (user.phone) doc.text(user.phone, 50, 172);

    doc.fontSize(12).fillColor("#0d6efd").text("Shipping Address:", 300, 130);
    doc.fontSize(10).fillColor("#333");
    doc.text(order.shipping_address, 300, 148, { width: 250 });

    // Table Header
    const tableTop = 230;
    doc.fontSize(11).fillColor("#0d6efd");
    doc.text("Item Description", 50, tableTop);
    doc.text("Qty", 280, tableTop, { width: 50, align: "center" });
    doc.text("Unit Price", 360, tableTop, { width: 80, align: "right" });
    doc.text("Total", 470, tableTop, { width: 80, align: "right" });

    doc.moveTo(50, 248).lineTo(550, 248).strokeColor("#ddd").stroke();

    // Table Body
    let position = tableTop + 25;
    doc.fillColor("#333").fontSize(10);
    
    items.forEach((item) => {
      doc.text(item.name, 50, position, { width: 220 });
      doc.text(item.quantity.toString(), 280, position, { width: 50, align: "center" });
      doc.text(`$${Number(item.price).toFixed(2)}`, 360, position, { width: 80, align: "right" });
      doc.text(`$${(item.quantity * item.price).toFixed(2)}`, 470, position, { width: 80, align: "right" });
      
      position += 20;
    });

    // Total Section
    doc.moveTo(50, position + 5).lineTo(550, position + 5).strokeColor("#eee").stroke();
    
    doc.fontSize(12).fillColor("#0d6efd").text("Grand Total:", 360, position + 15, { width: 80, align: "right" });
    doc.fontSize(12).fillColor("#0d6efd").text(`$${Number(order.total_amount).toFixed(2)}`, 470, position + 15, { width: 80, align: "right" });

    // Footer
    doc.fontSize(9).fillColor("#aaa").text("Thank you for your business! This is a cloud-generated invoice.", 50, 700, { align: "center" });

    doc.end();
  });
}
