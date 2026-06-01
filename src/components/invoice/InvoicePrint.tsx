import { forwardRef, type CSSProperties } from 'react';
import type { Invoice, Settings } from '../../types';
import { numberToIndianWords } from '../../utils/numberToWords';

interface InvoicePrintProps {
  invoice: Invoice;
  settings: Settings;
  /**
   * 'print'  → hidden from screen, visible only when printing (default for background print div)
   * 'view'   → fully visible on screen (used inside modals / preview)
   */
  variant?: 'print' | 'view';
}

export const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ invoice, settings, variant = 'print' }, ref) => {
    if (!invoice) return null;

    const isView = variant === 'view';
    const visibleRows = Math.max(invoice.items.length, 13);
    const printScale = isView
      ? 1
      : Math.min(1, 252 / (visibleRows * 7.2 + 145));

    const invoiceContent = (
      <div
        ref={isView ? ref : undefined}
        className={`invoice-print-sheet bg-white text-black flex flex-col ${
          isView 
            ? 'w-full p-5'
            : 'w-full p-0'
        }`}
        style={{
          fontFamily: "'Playfair Display', serif",
          '--print-scale': printScale,
        } as CSSProperties}
      >
        {/* HEADER */}
        <div className="text-center mb-4 border-b-2 border-black pb-2">
          <h1 className="text-3xl font-bold uppercase tracking-wider mb-1">
            {settings.agencyName}
          </h1>
          <p className="text-sm">{settings.address}</p>
          <p className="text-sm">
            Mob: {settings.mobile} | {settings.website}
          </p>
          <div className="flex justify-center gap-6 mt-2 text-sm font-semibold">
            <span>CGST No: {settings.cgstNo}</span>
            <span>D.L. No: {settings.dlNo}</span>
            <span>State: {settings.state}</span>
          </div>
          <h2 className="text-lg font-bold mt-4 border border-black inline-block px-8 py-1 rounded-full uppercase tracking-widest">
            Tax Invoice
          </h2>
        </div>

        {/* CUSTOMER & INVOICE META */}
        <div className="flex justify-between border border-black mb-4">
          <div className="w-1/2 p-3 border-r border-black">
            <p>
              <strong>Customer:</strong> {invoice.customerName}
            </p>
            <p>
              <strong>Address:</strong> {invoice.address || 'N/A'}
            </p>
            <p>
              <strong>Mobile:</strong> {invoice.mobile || 'N/A'}
            </p>
            {invoice.customerDlNo && (
              <p>
                <strong>DL No:</strong> {invoice.customerDlNo}
              </p>
            )}
          </div>
          <div className="w-1/2 p-3">
            <p>
              <strong>Invoice No:</strong> {invoice.invoiceNo}
            </p>
            <p>
              <strong>Date:</strong> {invoice.date}
            </p>
            <p>
              <strong>Payment Mode:</strong> {invoice.paymentMode}
            </p>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="invoice-items-wrap overflow-x-auto w-full mb-4">
        <table className="w-full text-left border border-black text-sm" style={{ minWidth: isView ? '600px' : undefined }}>
          <thead>
            <tr className="border-b border-black">
              <th className="invoice-col-sl p-2 border-r border-black w-10">Sl</th>
              <th className="invoice-product-name p-2 border-r border-black">Product Name</th>
              <th className="invoice-col-hsn p-2 border-r border-black">HSN</th>
              <th className="invoice-col-batch p-2 border-r border-black">Batch</th>
              <th className="invoice-col-exp p-2 border-r border-black">Exp</th>
              <th className="invoice-col-mfd p-2 border-r border-black">Mfd By</th>
              <th className="invoice-col-qty p-2 border-r border-black text-right">Qty</th>
              <th className="invoice-col-money p-2 border-r border-black text-right">MRP</th>
              <th className="invoice-col-money p-2 border-r border-black text-right">Rate</th>
              <th className="invoice-col-tax p-2 border-r border-black text-right">Tax%</th>
              <th className="invoice-col-amount p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-black/20">
                <td className="invoice-col-sl p-2 border-r border-black">{index + 1}</td>
                <td className="invoice-product-name p-2 border-r border-black font-semibold">
                  {item.productName}
                </td>
                <td className="invoice-col-hsn p-2 border-r border-black">{item.hsn}</td>
                <td className="invoice-col-batch p-2 border-r border-black">{item.batch}</td>
                <td className="invoice-col-exp p-2 border-r border-black">{item.exp}</td>
                <td className="invoice-col-mfd p-2 border-r border-black text-xs">
                  {item.mfdBy}
                </td>
                <td className="invoice-col-qty p-2 border-r border-black text-right">
                  {item.qty}
                </td>
                <td className="invoice-col-money p-2 border-r border-black text-right">
                  {item.mrp.toFixed(2)}
                </td>
                <td className="invoice-col-money p-2 border-r border-black text-right">
                  {item.rate.toFixed(2)}
                </td>
                <td className="invoice-col-tax p-2 border-r border-black text-right">
                  {item.taxPercent}
                </td>
                <td className="invoice-col-amount p-2 text-right font-semibold">
                  {item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
            {/* Fill empty rows */}
            {Array.from({ length: Math.max(0, 13 - invoice.items.length) }).map(
              (_, i) => (
                <tr key={`empty-${i}`} className="invoice-empty-row">
                  <td className="invoice-col-sl p-2 border-r border-black text-transparent">
                    .
                  </td>
                  <td className="invoice-product-name p-2 border-r border-black"></td>
                  <td className="invoice-col-hsn p-2 border-r border-black"></td>
                  <td className="invoice-col-batch p-2 border-r border-black"></td>
                  <td className="invoice-col-exp p-2 border-r border-black"></td>
                  <td className="invoice-col-mfd p-2 border-r border-black"></td>
                  <td className="invoice-col-qty p-2 border-r border-black"></td>
                  <td className="invoice-col-money p-2 border-r border-black"></td>
                  <td className="invoice-col-money p-2 border-r border-black"></td>
                  <td className="invoice-col-tax p-2 border-r border-black"></td>
                  <td className="invoice-col-amount p-2"></td>
                </tr>
              )
            )}
          </tbody>
        </table>
        </div>

        {/* TOTALS & WORDS */}
        <div className="invoice-totals flex border border-black mb-4">
          <div className="w-2/3 p-4 border-r border-black flex flex-col justify-center">
            <p className="text-sm font-semibold mb-2">Amount in Words:</p>
            <p className="text-lg font-bold italic">
              {invoice.amountInWords ||
                numberToIndianWords(invoice.grandTotal)}
            </p>
          </div>
          <div className="w-1/3 p-0 flex flex-col">
            <div className="flex justify-between p-2 border-b border-black">
              <span className="font-semibold">Sub Total:</span>
              <span>₹ {invoice.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 border-b border-black text-sm">
              <span>Add CGST ({invoice.cgstPercent}%):</span>
              <span>₹ {invoice.cgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 border-b border-black text-sm">
              <span>Add SGST ({invoice.sgstPercent}%):</span>
              <span>₹ {invoice.sgstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-100 font-bold text-lg">
              <span>Grand Total:</span>
              <span>₹ {invoice.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* FOOTER / TERMS */}
        <div className="invoice-footer flex justify-between border border-black p-4 text-sm mt-auto">
          <div className="w-1/2 pr-4 border-r border-black">
            <p className="font-bold mb-2">Terms & Conditions:</p>
            <p className="italic">
              Goods supplied under this invoice do not contravene in any way the
              provision of sec. 18 of the Drugs Act. 1940.
            </p>
          </div>
          <div className="w-1/2 pl-4 flex flex-col justify-between items-end">
            <p className="font-bold">For {settings.agencyName}</p>
            <div className="h-16 flex items-center justify-end">
              {settings.signatureImage && (
                <img
                  src={settings.signatureImage}
                  alt="Signature"
                  className="max-h-14 object-contain opacity-90"
                />
              )}
            </div>
            <p className="border-t border-black pt-1 w-48 text-center">
              Authorised Signature
            </p>
          </div>
        </div>
      </div>
    );

    if (isView) return invoiceContent;

    return (
      <div ref={ref} className="hidden print-only invoice-print-page">
        {invoiceContent}
      </div>
    );
  }
);

InvoicePrint.displayName = 'InvoicePrint';
