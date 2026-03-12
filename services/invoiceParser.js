const fs = require("fs");
const pdfParse = require("pdf-parse");

async function parseInvoice(filePath) {

  const dataBuffer = fs.readFileSync(filePath);

  const data = await pdfParse(dataBuffer);

  const text = data.text;

  const invoiceNumber = text.match(/#(\d+)/);
  const date = text.match(/Date:\s*([0-9\-]+)/);
  const orderNumber = text.match(/Order Number:\s*(\d+)/);

  const totalMatch = text.match(/Invoice total\s*([0-9.,]+)/);

  let total = null;

  if (totalMatch) {
    total = totalMatch[1]
      .replace(/\./g, "")
      .replace(",", ".");
  }

  return {
    invoice_number: invoiceNumber ? invoiceNumber[1] : null,
    invoice_date: date ? date[1] : null,
    order_number: orderNumber ? orderNumber[1] : null,
    total: total
  };
}

module.exports = parseInvoice;