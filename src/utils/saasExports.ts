import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';

function sanitizeFilePart(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'report';
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Neutralizes spreadsheet formula injection (cells starting with =, +, -, @, tab, CR)
function neutralizeSpreadsheetCell(value: string): string {
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

function columnLetters(colIndex: number): string {
  let n = colIndex + 1;
  let out = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function sanitizeSheetName(name: string, index: number): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 31);
  return cleaned || `Sheet${index + 1}`;
}

function buildWorksheetXml(
  rows: Array<Record<string, string | number | boolean | null | undefined>>
): string {
  const safeRows = rows.length > 0 ? rows : [{ Notice: 'No records available' }];
  const headers = Object.keys(safeRows[0]);

  const colWidths = headers.map((key) => {
    const maxLen = safeRows.reduce((max, row) => {
      const val = row[key] === null || row[key] === undefined ? '' : String(row[key]);
      return Math.max(max, val.length);
    }, key.length);
    return Math.min(44, Math.max(12, maxLen + 3));
  });

  const colsXml = colWidths
    .map((w, idx) => `<col min="${idx + 1}" max="${idx + 1}" width="${w}" customWidth="1"/>`)
    .join('');

  const headerCells = headers
    .map((h, cIdx) => {
      const ref = `${columnLetters(cIdx)}1`;
      return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(neutralizeSpreadsheetCell(h))}</t></is></c>`;
    })
    .join('');

  const dataRowsXml = safeRows
    .map((row, rIdx) => {
      const rowNum = rIdx + 2;
      const cells = headers
        .map((key, cIdx) => {
          const ref = `${columnLetters(cIdx)}${rowNum}`;
          const raw = row[key];
          if (typeof raw === 'number' && Number.isFinite(raw)) {
            return `<c r="${ref}"><v>${raw}</v></c>`;
          }
          const strVal = raw === null || raw === undefined ? '' : String(raw);
          return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(neutralizeSpreadsheetCell(strVal))}</t></is></c>`;
        })
        .join('');
      return `<row r="${rowNum}">${cells}</row>`;
    })
    .join('');

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    `<cols>${colsXml}</cols>` +
    `<sheetData><row r="1">${headerCells}</row>${dataRowsXml}</sheetData>` +
    '</worksheet>'
  );
}

export function exportTableToPdf(options: {
  title: string;
  subtitle: string;
  workspaceName: string;
  columns: string[];
  rows: Array<Array<string | number>>;
  summaryMetrics?: Array<{ label: string; value: string }>;
  fileNamePrefix: string;
}): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // Branded Top Banner (#1769AA)
  doc.setFillColor(23, 105, 170);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 64, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`CODEMANIAC CLOUD — ${options.title}`, 36, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(
    `Workspace: ${options.workspaceName}  |  ${options.subtitle}  |  Generated: ${new Date().toLocaleString('en-IN')}`,
    36,
    48
  );

  let startY = 84;

  // Optional KPI Summary Strip
  if (options.summaryMetrics && options.summaryMetrics.length > 0) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const usable = pageWidth - 72;
    const cardW = (usable - (options.summaryMetrics.length - 1) * 12) / options.summaryMetrics.length;

    options.summaryMetrics.forEach((metric, idx) => {
      const x = 36 + idx * (cardW + 12);
      doc.setFillColor(245, 250, 255);
      doc.setDrawColor(203, 226, 246);
      doc.roundedRect(x, startY, cardW, 46, 6, 6, 'FD');

      doc.setTextColor(72, 101, 129);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(metric.label.toUpperCase(), x + 12, startY + 17);

      doc.setTextColor(16, 42, 67);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(metric.value, x + 12, startY + 36);
    });

    startY += 62;
  }

  autoTable(doc, {
    startY,
    head: [options.columns],
    body: options.rows,
    theme: 'grid',
    headStyles: {
      fillColor: [23, 105, 170],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      textColor: [16, 42, 67],
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [245, 250, 255]
    },
    margin: { left: 36, right: 36 }
  });

  doc.save(`${sanitizeFilePart(options.fileNamePrefix)}-${dateStamp()}.pdf`);
}

// Standards-compliant multi-sheet OOXML .xlsx generator built on JSZip (zero vulnerable sheetjs parser)
export async function exportSheetsToExcel(options: {
  fileNamePrefix: string;
  sheets: Array<{
    sheetName: string;
    rows: Array<Record<string, string | number | boolean | null | undefined>>;
  }>;
}): Promise<void> {
  const zip = new JSZip();
  const sheets = options.sheets.length > 0 ? options.sheets : [{ sheetName: 'Report', rows: [] }];

  const sheetOverrides = sheets
    .map(
      (_s, idx) =>
        `<Override PartName="/xl/worksheets/sheet${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('');

  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      sheetOverrides +
      '</Types>'
  );

  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>'
  );

  const workbookSheetsXml = sheets
    .map(
      (sheet, idx) =>
        `<sheet name="${escapeXml(sanitizeSheetName(sheet.sheetName, idx))}" sheetId="${idx + 1}" r:id="rId${idx + 1}"/>`
    )
    .join('');

  zip.file(
    'xl/workbook.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      `<sheets>${workbookSheetsXml}</sheets>` +
      '</workbook>'
  );

  const workbookRelsXml = sheets
    .map(
      (_s, idx) =>
        `<Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml"/>`
    )
    .join('');

  zip.file(
    'xl/_rels/workbook.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      workbookRelsXml +
      '</Relationships>'
  );

  sheets.forEach((sheet, idx) => {
    zip.file(`xl/worksheets/sheet${idx + 1}.xml`, buildWorksheetXml(sheet.rows));
  });

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilePart(options.fileNamePrefix)}-${dateStamp()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSingleInvoicePdf(options: {
  workspaceName: string;
  billingEmail: string;
  invoiceNumber: string;
  title: string;
  clientName: string;
  amount: number;
  currency: string;
  status: string;
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
  paymentMethod: string;
  notes: string;
}): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(23, 105, 170);
  doc.rect(0, 0, pageWidth, 88, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('INVOICE', 40, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${options.workspaceName}  |  ${options.billingEmail}`, 40, 62);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(options.invoiceNumber, pageWidth - 40, 42, { align: 'right' });
  doc.setFontSize(9.5);
  doc.text(`STATUS: ${options.status.toUpperCase()}`, pageWidth - 40, 62, { align: 'right' });

  // Metadata Box
  doc.setFillColor(245, 250, 255);
  doc.setDrawColor(203, 226, 246);
  doc.roundedRect(40, 110, pageWidth - 80, 92, 6, 6, 'FD');

  doc.setTextColor(72, 101, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('BILLED TO', 56, 132);
  doc.text('ISSUED DATE', 270, 132);
  doc.text('DUE DATE', 390, 132);

  doc.setTextColor(16, 42, 67);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(options.clientName || 'Direct Workspace Billing', 56, 150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(options.issuedAt, 270, 150);
  doc.text(options.dueAt, 390, 150);

  doc.setTextColor(72, 101, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PAYMENT METHOD', 56, 176);
  doc.text('PAID DATE', 270, 176);

  doc.setTextColor(16, 42, 67);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(options.paymentMethod || 'Bank Transfer / UPI', 56, 192);
  doc.text(options.paidAt || 'Pending', 270, 192);

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: options.currency || 'INR',
    maximumFractionDigits: 0
  }).format(options.amount);

  autoTable(doc, {
    startY: 226,
    head: [['Description', 'Invoice No.', 'Currency', 'Amount']],
    body: [[options.title, options.invoiceNumber, options.currency, formattedAmount]],
    theme: 'grid',
    headStyles: { fillColor: [23, 105, 170], textColor: [255, 255, 255], fontSize: 10 },
    bodyStyles: { textColor: [16, 42, 67], fontSize: 10 },
    margin: { left: 40, right: 40 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 310;
  doc.setFillColor(235, 246, 255);
  doc.roundedRect(pageWidth - 230, finalY + 18, 190, 44, 6, 6, 'F');
  doc.setTextColor(23, 105, 170);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL DUE / PAID', pageWidth - 216, finalY + 35);
  doc.setTextColor(16, 42, 67);
  doc.setFontSize(14);
  doc.text(formattedAmount, pageWidth - 216, finalY + 53);

  if (options.notes) {
    doc.setTextColor(72, 101, 129);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('NOTES', 40, finalY + 95);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 78, 104);
    doc.text(doc.splitTextToSize(options.notes, pageWidth - 80), 40, finalY + 112);
  }

  doc.save(`${sanitizeFilePart(options.invoiceNumber)}.pdf`);
}
