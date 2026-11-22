import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  OrderRecord,
  RestaurantSettings,
  RestoFlowReportData
} from '../types/restoflow';

export function downloadRestoReceiptPdf(restaurant: RestaurantSettings, order: OrderRecord): void {
  const doc = new jsPDF({ unit: 'mm', format: [80, 195] });
  const sym = restaurant.currencyCode === 'INR' ? 'Rs.' : restaurant.currencySymbol || '$';
  let y = 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(restaurant.name.toUpperCase(), 40, y, { align: 'center' });
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  if (restaurant.address) {
    doc.text(restaurant.address, 40, y, { align: 'center', maxWidth: 68 });
    y += 4;
  }
  if (restaurant.city) {
    doc.text(restaurant.city, 40, y, { align: 'center' });
    y += 3.5;
  }
  if (restaurant.phone || restaurant.gstin) {
    doc.text(
      [restaurant.phone, restaurant.gstin ? `GSTIN: ${restaurant.gstin}` : ''].filter(Boolean).join(' · '),
      40,
      y,
      { align: 'center', maxWidth: 70 }
    );
    y += 4.5;
  }

  doc.setDrawColor(180);
  doc.line(5, y, 75, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`Bill: ${order.orderNumber}`, 5, y);
  doc.text(order.orderType.replace('_', ' ').toUpperCase(), 75, y, { align: 'right' });
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString('en-IN')}`, 5, y);
  y += 3.8;
  doc.text(
    `Guest: ${order.customerName || 'Walk-in'}${order.tableNumber ? ` · Table ${order.tableNumber}` : ''}`,
    5,
    y
  );
  y += 4.5;

  autoTable(doc, {
    startY: y,
    margin: { left: 4, right: 4 },
    theme: 'plain',
    styles: { fontSize: 7.2, cellPadding: 1.2 },
    headStyles: { fontStyle: 'bold', lineWidth: { bottom: 0.2 }, lineColor: [180, 180, 180] },
    head: [['Item', 'Qty', 'Amt']],
    body: order.items.map((item) => [
      `${item.itemNameSnapshot}${item.variantName ? ` (${item.variantName})` : ''}`,
      String(item.quantity),
      `${sym}${item.lineTotal.toFixed(2)}`
    ]),
    columnStyles: {
      0: { cellWidth: 44 },
      1: { cellWidth: 8, halign: 'center' },
      2: { cellWidth: 20, halign: 'right' }
    }
  });

  y = ((doc as any).lastAutoTable?.finalY || y + 20) + 4;
  doc.line(5, y, 75, y);
  y += 4.5;

  const writeLine = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 9 : 7.5);
    doc.text(label, 5, y);
    doc.text(value, 75, y, { align: 'right' });
    y += bold ? 5 : 3.8;
  };

  writeLine('Subtotal', `${sym}${order.subtotal.toFixed(2)}`);
  if (order.discountAmount > 0) {
    writeLine('Discount', `-${sym}${order.discountAmount.toFixed(2)}`);
  }
  writeLine(`${restaurant.taxLabel} (${order.taxRatePct}%)`, `${sym}${order.taxAmount.toFixed(2)}`);
  if (order.serviceChargeAmount > 0) {
    writeLine('Service Charge', `${sym}${order.serviceChargeAmount.toFixed(2)}`);
  }
  writeLine('GRAND TOTAL', `${sym}${order.grandTotal.toFixed(2)}`, true);

  if (order.payments.length > 0) {
    y += 1;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Payments Recorded:', 5, y);
    y += 3.8;
    for (const p of order.payments) {
      writeLine(
        `${p.paymentMethod.toUpperCase()}${p.referenceNumber ? ` (${p.referenceNumber})` : ''}`,
        `${sym}${p.amount.toFixed(2)}`
      );
    }
  }

  y += 3;
  doc.line(5, y, 75, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  if (restaurant.receiptFooter) {
    doc.text(restaurant.receiptFooter, 40, y, { align: 'center', maxWidth: 68 });
  }

  doc.save(`${order.orderNumber}-Receipt.pdf`);
}

function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeSpreadsheetCell(value: string | number): { type: 'Number' | 'String'; text: string } {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { type: 'Number', text: String(value) };
  }
  const str = String(value ?? '');
  // Neutralize spreadsheet formula injection characters (=, +, -, @, tab, CR)
  const neutralized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return { type: 'String', text: escapeXml(neutralized) };
}

function buildWorksheetXml(sheetName: string, headers: string[], rows: (string | number)[][]): string {
  const headerCells = headers
    .map((h) => {
      const safe = sanitizeSpreadsheetCell(h);
      return `<Cell ss:StyleID="sHeader"><Data ss:Type="String">${safe.text}</Data></Cell>`;
    })
    .join('');

  const dataRows = rows
    .map((row) => {
      const cells = row
        .map((val) => {
          const safe = sanitizeSpreadsheetCell(val);
          return `<Cell><Data ss:Type="${safe.type}">${safe.text}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('\n');

  return `<Worksheet ss:Name="${escapeXml(sheetName)}"><Table><Row>${headerCells}</Row>${dataRows}</Table></Worksheet>`;
}

export function downloadRestoReportPdf(
  restaurant: RestaurantSettings,
  report: import('../types/restoflow').RestoFlowReportData
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const sym = restaurant.currencyCode === 'INR' ? 'Rs.' : restaurant.currencySymbol || '$';

  // Header Banner
  doc.setFillColor(28, 25, 23);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(`${restaurant.name} — Executive Operations Report`, 14, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Period: ${report.periodLabel}  |  Generated: ${new Date(report.generatedAt).toLocaleString('en-IN')}`,
    14,
    21
  );

  doc.setTextColor(30, 41, 59);
  let y = 36;

  // Section 1: KPI Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. Financial & Operational Summary', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    head: [['Metric', 'Value', 'Metric', 'Value']],
    body: [
      [
        'Total Revenue',
        `${sym}${report.summary.totalRevenue.toFixed(2)}`,
        'Total Orders',
        String(report.summary.totalOrders)
      ],
      [
        'Average Order Value',
        `${sym}${report.summary.avgOrderValue.toFixed(2)}`,
        'Completed / Cancelled',
        `${report.summary.completedOrders} / ${report.summary.cancelledOrders}`
      ],
      [
        `${restaurant.taxLabel} Collected`,
        `${sym}${report.summary.totalTaxCollected.toFixed(2)}`,
        'Discounts Applied',
        `${sym}${report.summary.totalDiscounts.toFixed(2)}`
      ],
      [
        'Stock Valuation',
        `${sym}${report.summary.totalStockValuation.toFixed(2)}`,
        'Wastage Cost',
        `${sym}${report.summary.wastageCost.toFixed(2)}`
      ]
    ]
  });

  y = ((doc as any).lastAutoTable?.finalY || y + 30) + 10;

  // Section 2: Payment Methods
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Payment Settlement Breakdown', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    headStyles: { fillColor: [28, 25, 23], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.2 },
    head: [['Payment Method', 'Transactions', 'Amount Collected', 'Share %']],
    body:
      report.paymentBreakdown.length > 0
        ? report.paymentBreakdown.map((p) => [
            p.paymentMethod.toUpperCase(),
            String(p.count),
            `${sym}${p.amount.toFixed(2)}`,
            `${p.sharePct.toFixed(1)}%`
          ])
        : [['No settled payments in period', '0', `${sym}0.00`, '0.0%']]
  });

  y = ((doc as any).lastAutoTable?.finalY || y + 25) + 10;

  // Section 3: Product Performance
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. Top Menu Product Performance', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.2, cellPadding: 2.2 },
    head: [['Dish Name', 'Category', 'Qty Sold', 'Revenue', 'Est. Gross Profit']],
    body:
      report.productPerformance.length > 0
        ? report.productPerformance.map((p) => [
            p.name,
            p.categoryName,
            String(p.quantitySold),
            `${sym}${p.revenue.toFixed(2)}`,
            `${sym}${p.estGrossProfit.toFixed(2)}`
          ])
        : [['No items sold in period', '-', '0', `${sym}0.00`, `${sym}0.00`]]
  });

  // Page 2: Inventory Valuation
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('4. Live Inventory Valuation & Low-Stock Status', 14, 18);

  autoTable(doc, {
    startY: 22,
    margin: { left: 14, right: 14 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.2, cellPadding: 2.2 },
    head: [['SKU', 'Ingredient', 'Category', 'Stock', 'Min Level', 'Unit Cost', 'Valuation', 'Status']],
    body: report.inventoryReport.map((i) => [
      i.sku,
      i.name,
      i.category,
      `${i.currentStock} ${i.unit}`,
      `${i.minStockLevel} ${i.unit}`,
      `${sym}${i.unitCost.toFixed(2)}`,
      `${sym}${i.stockValue.toFixed(2)}`,
      i.status === 'low' ? 'LOW STOCK' : 'OK'
    ])
  });

  doc.save(`RestoFlow-${report.period}-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function downloadRestoReportExcel(
  restaurant: RestaurantSettings,
  report: import('../types/restoflow').RestoFlowReportData
): void {
  const summarySheet = buildWorksheetXml(
    'Executive Summary',
    ['Metric', 'Value'],
    [
      ['Restaurant', restaurant.name],
      ['Period', report.periodLabel],
      ['Generated At', new Date(report.generatedAt).toLocaleString('en-IN')],
      ['Total Revenue', report.summary.totalRevenue],
      ['Total Orders', report.summary.totalOrders],
      ['Completed Orders', report.summary.completedOrders],
      ['Cancelled Orders', report.summary.cancelledOrders],
      ['Average Order Value', report.summary.avgOrderValue],
      ['Tax Collected', report.summary.totalTaxCollected],
      ['Discounts Applied', report.summary.totalDiscounts],
      ['Service Charge Collected', report.summary.totalServiceCharge],
      ['Inventory Valuation', report.summary.totalStockValuation],
      ['Low Stock SKUs', report.summary.lowStockCount],
      ['Wastage Cost', report.summary.wastageCost]
    ]
  );

  const productSheet = buildWorksheetXml(
    'Product Performance',
    ['Dish Name', 'Category', 'Quantity Sold', 'Revenue', 'Recipe Unit Cost', 'Est. Gross Profit'],
    report.productPerformance.map((p) => [
      p.name,
      p.categoryName,
      p.quantitySold,
      p.revenue,
      p.unitCost,
      p.estGrossProfit
    ])
  );

  const paymentSheet = buildWorksheetXml(
    'Payment Breakdown',
    ['Payment Method', 'Transaction Count', 'Amount', 'Share %'],
    report.paymentBreakdown.map((p) => [p.paymentMethod.toUpperCase(), p.count, p.amount, p.sharePct])
  );

  const inventorySheet = buildWorksheetXml(
    'Inventory Valuation',
    ['SKU', 'Ingredient', 'Category', 'Current Stock', 'Min Level', 'Unit', 'Unit Cost', 'Stock Value', 'Status'],
    report.inventoryReport.map((i) => [
      i.sku,
      i.name,
      i.category,
      i.currentStock,
      i.minStockLevel,
      i.unit,
      i.unitCost,
      i.stockValue,
      i.status.toUpperCase()
    ])
  );

  const workbookXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="sHeader">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#EA580C" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 ${summarySheet}
 ${productSheet}
 ${paymentSheet}
 ${inventorySheet}
</Workbook>`;

  const blob = new Blob([workbookXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `RestoFlow-${report.period}-Report-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
