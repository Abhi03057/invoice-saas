const fs = require("fs");
const pdfParse = require("pdf-parse");

async function parseInvoice(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;

  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  // ---------- Invoice Number ----------
  // Handles: "INVOICE NO. 76893", "Invoice # 76893", "#76893"
  let invoiceNumber = null;
  const invoiceMatch =
    text.match(/INVOICE\s*NO\.?\s*[:\s#]*([0-9]+)/i) ||
    text.match(/INVOICE\s*#\s*([0-9]+)/i) ||
    text.match(/#([0-9]+)/);
  if (invoiceMatch) invoiceNumber = invoiceMatch[1];

  // ---------- Date ----------
  // Handles labeled "Date: 2024-07-28" OR standalone ISO date on its own line
  let invoiceDate = null;
  const dateLabelMatch = text.match(/Date[:\s]+([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  const dateStandaloneMatch = text.match(/\b([0-9]{4}-[0-9]{2}-[0-9]{2})\b/);
  if (dateLabelMatch) {
    invoiceDate = dateLabelMatch[1];
  } else if (dateStandaloneMatch) {
    invoiceDate = dateStandaloneMatch[1];
  }

  // ---------- Vendor ----------
  // Strategy: find the INVOICE line, vendor is the next non-empty line after it
  let vendor = null;
  const invoiceLineIndex = lines.findIndex(l => /^INVOICE$/i.test(l));
  if (invoiceLineIndex !== -1) {
    // Skip the invoice number line (starts with #) to get the actual company name
    for (let i = invoiceLineIndex + 1; i < lines.length; i++) {
      if (!/^#\d+/.test(lines[i]) && !/^\d{4}-\d{2}-\d{2}$/.test(lines[i])) {
        vendor = lines[i];
        break;
      }
    }
  }
  if (!vendor) vendor = lines[0] || null;

  // ---------- Total ----------
  // Handles European format: "139.048,40 €" → 139048.40
  // and US format: "$1,234.56"
  let total = null;

  const totalMatch =
    text.match(/Invoice\s+total\s+([\d.,]+)\s*[€$]?/i) ||
    text.match(/TOTAL\s+DUE\s+([\d.,]+)/i) ||
    text.match(/TOTAL\s+([\d.,]+)/i);

  if (totalMatch) {
    const raw = totalMatch[1]; // e.g. "139.048,40" or "1,234.56"

    if (raw.includes(",") && raw.includes(".")) {
      // Determine format by which separator comes last
      const lastComma = raw.lastIndexOf(",");
      const lastDot = raw.lastIndexOf(".");

      if (lastComma > lastDot) {
        // European: 139.048,40 → thousands=dot, decimal=comma
        total = raw.replace(/\./g, "").replace(",", ".");
      } else {
        // US: 1,234.56 → thousands=comma, decimal=dot
        total = raw.replace(/,/g, "");
      }
    } else if (raw.includes(",")) {
      // Could be European decimal: "1234,56" → 1234.56
      // or US thousands: "1,234" → 1234
      const parts = raw.split(",");
      total = parts[parts.length - 1].length === 2
        ? raw.replace(",", ".")   // decimal comma
        : raw.replace(/,/g, "");  // thousands comma
    } else {
      total = raw;
    }
  }

  return {
    invoice_number: invoiceNumber,
    vendor: vendor,
    invoice_date: invoiceDate,
    total: total ? parseFloat(total) : null,
  };
}

module.exports = parseInvoice;