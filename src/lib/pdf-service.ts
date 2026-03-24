import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const applyReportHeader = (doc: jsPDF, title: string, config: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Background for header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Branding
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(config?.name?.toUpperCase() || "BIASHARA POS", 20, 20);

    // Report Title
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(title.toUpperCase(), 20, 28);

    // Metadata (Date/Time)
    doc.setFontSize(8);
    doc.text(`GENERATED: ${new Date().toLocaleString()}`, pageWidth - 20, 15, { align: "right" });
    if (config?.location) doc.text(config.location.toUpperCase(), pageWidth - 20, 22, { align: "right" });
    if (config?.phone) doc.text(`TEL: ${config.phone}`, pageWidth - 20, 29, { align: "right" });

    doc.setTextColor(15, 23, 42); // Reset text color
    return 50; // Return Y position for content to start
};

export const generateReceiptPDF = async (order: any, config?: any) => {
    const doc = new jsPDF({
        unit: "mm",
        format: [80, 200], // Standard Thermal Roll Format
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // --- Header Section ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(config?.name || "BIASHARA POS", pageWidth / 2, y, { align: "center" });

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(config?.location || "HARDWARE SOLUTIONS & SUPPLIES", pageWidth / 2, y, { align: "center" });

    y += 4;
    if (config?.taxNumber) {
        doc.text(`PIN: ${config.taxNumber.toUpperCase()}`, pageWidth / 2, y, { align: "center" });
        y += 4;
    }
    doc.text(`TEL: ${config?.phone || "+254 7XX XXX XXX"}`, pageWidth / 2, y, { align: "center" });

    if (config?.mpesaTill || config?.mpesaPaybill) {
        y += 4;
        const paymentLabel = config.mpesaTill ? `TILL: ${config.mpesaTill}` : `PAYBILL: ${config.mpesaPaybill} [${config.mpesaAccount}]`;
        doc.text(paymentLabel, pageWidth / 2, y, { align: "center" });
    }

    // Decorative Line
    y += 10;
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(5, y, pageWidth - 5, y);

    // --- Transaction Details ---
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text("TAX INVOICE / RECEIPT", 5, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`RECEIPT #: ${order.orderNumber || order.id.slice(0, 8).toUpperCase()}`, 5, y);
    doc.text(`DATE: ${new Date(order.date).toLocaleString([], { hour12: true })}`, 5, y + 4);

    if (order.buyerKraPin) {
        y += 8;
        doc.text(`BUYER KRA PIN: ${order.buyerKraPin.toUpperCase()}`, 5, y);
    }

    y += 8;
    doc.text(`METHOD: ${order.paymentMethod.toUpperCase()}`, 5, y);
    doc.text(`CLERK: POS-TERMINAL-A1`, pageWidth - 5, y, { align: "right" });

    // --- Items Table ---
    y += 5;
    autoTable(doc, {
        startY: y,
        head: [['ITEM DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']],
        body: order.items.map((item: any) => [
            item.product?.name.toUpperCase() || "UNKNOWN ITEM",
            item.quantity,
            item.price.toLocaleString(),
            (item.price * item.quantity).toLocaleString()
        ]),
        theme: 'plain',
        styles: {
            fontSize: 7,
            cellPadding: { top: 2, bottom: 2, left: 0, right: 0 },
            textColor: [51, 65, 85],
            font: 'helvetica'
        },
        headStyles: {
            fontStyle: 'bold',
            textColor: [100, 116, 139],
            fontSize: 6,
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 10, halign: 'center' },
            2: { cellWidth: 12, halign: 'right' },
            3: { cellWidth: 13, halign: 'right' }
        },
        margin: { left: 5, right: 5 }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 8;

    doc.setDrawColor(226, 232, 240);
    doc.line(5, finalY - 4, pageWidth - 5, finalY - 4);

    const taxPercent = config?.taxPercentage || 16.0;
    const isTaxInclusive = config?.taxInclusive ?? true;

    let subtotal, tax;
    if (isTaxInclusive) {
        subtotal = order.total / (1 + (taxPercent / 100));
        tax = order.total - subtotal;
    } else {
        // This case shouldn't happen based on user request (always part of price)
        // but kept for logic completeness
        subtotal = order.total;
        tax = subtotal * (taxPercent / 100);
    }

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("NET SUBTOTAL:", 5, finalY);
    doc.text(`Kshs ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 5, finalY, { align: "right" });

    finalY += 5;
    doc.text(`VAT (${taxPercent}%):`, 5, finalY);
    doc.text(`Kshs ${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - 5, finalY, { align: "right" });

    finalY += 10;
    doc.setDrawColor(15, 23, 42); // slate-900
    doc.setLineWidth(0.3);
    doc.line(40, finalY - 6, pageWidth - 5, finalY - 6); // Accent line for total

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("TOTAL DUE:", 5, finalY);
    doc.text(`Kshs ${order.total.toLocaleString()}`, pageWidth - 5, finalY, { align: "right" });

    // --- Footer ---
    finalY += 15;

    // Insert QR Code via base64 translation of an external API
    try {
        const qrData = encodeURIComponent(`https://itax.kra.go.ke/KRA-Portal`);

        const getBase64Image = async (url: string) => {
            const res = await fetch(url);
            const blob = await res.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        };
        const base64Qr = await getBase64Image(`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`);
        if (base64Qr) {
            doc.addImage(base64Qr as string, "PNG", pageWidth / 2 - 12, finalY, 24, 24);
            finalY += 28;
        }
    } catch (e) {
        console.error("QR Code rendering failed", e);
    }

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Thank you for shopping at ${config?.name || 'Biashara Hardware'}!`, pageWidth / 2, finalY, { align: "center" });

    finalY += 4;
    doc.text("Goods once sold are not returnable.", pageWidth / 2, finalY + 4, { align: "center" });

    finalY += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    // Return PDF blob URL
    const blobURL = doc.output('bloburl');
    return blobURL;
};

export const generateTaxReport = (orders: any[], config?: any) => {
    const doc = new jsPDF();
    const taxPercent = config?.taxPercentage || 16.0;
    const startY = applyReportHeader(doc, "Tax Liability Audit", config);

    doc.setFontSize(10);
    doc.text(`Report Period: All Transactions in Payload`, 20, startY);
    if (config?.taxNumber) {
        doc.text(`Business PIN: ${config.taxNumber.toUpperCase()}`, 20, startY + 7);
    }

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalVAT = orders.reduce((sum, o) => {
        const sub = (o.total || 0) / (1 + (taxPercent / 100));
        return sum + ((o.total || 0) - sub);
    }, 0);

    autoTable(doc, {
        startY: startY + 15,
        head: [["Date", "Order #", "Method", "Total (Kshs)", `VAT (${taxPercent}%)`]],
        body: orders.map(o => {
            const sub = (o.total || 0) / (1 + (taxPercent / 100));
            const v = (o.total || 0) - sub;
            return [
                o.date ? new Date(o.date).toLocaleDateString() : "N/A",
                o.orderNumber || (o.id ? o.id.slice(0, 8) : "N/A"),
                o.paymentMethod || "N/A",
                (o.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
                (v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })
            ];
        }),
        foot: [["TOTALS", "", "", totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }), totalVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })]],
        theme: "grid",
        headStyles: { fillColor: [13, 148, 136] }
    });

    return doc.output('bloburl');
};

export const generateInventoryReport = (products: any[], config?: any) => {
    const doc = new jsPDF();
    const startY = applyReportHeader(doc, "Stock Valuation & Asset Audit", config);

    doc.setFontSize(10);
    doc.text(`Total SKU Profiles: ${products.length}`, 20, startY);

    const totalValuation = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);

    autoTable(doc, {
        startY: startY + 10,
        head: [["Product Name", "Category", "Stock Level", "Price (Kshs)", "Valuation (Kshs)"]],
        body: products.map(p => [
            p.name || "UNKNOWN",
            p.category || "N/A",
            (p.stock || 0).toString(),
            (p.price || 0).toLocaleString(),
            ((p.stock || 0) * (p.price || 0)).toLocaleString()
        ]),
        foot: [["GRAND TOTAL VALUATION", "", "", "", totalValuation.toLocaleString()]],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] }
    });

    return doc.output('bloburl');
};

export const generateLedgerReport = (orders: any[], config?: any) => {
    const doc = new jsPDF();
    const startY = applyReportHeader(doc, "Daily Transactional Ledger", config);

    doc.setFontSize(10);
    doc.text(`Records Synced: ${orders.length} events`, 20, startY);

    const total = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    autoTable(doc, {
        startY: startY + 10,
        head: [["Date", "Reference", "Customer/Staff", "Method", "Amount (Kshs)"]],
        body: orders.map(o => [
            new Date(o.date).toLocaleDateString(),
            o.orderNumber || o.id.slice(0, 8).toUpperCase(),
            o.customerName || "Walk-in",
            o.paymentMethod || "N/A",
            (o.total || 0).toLocaleString()
        ]),
        foot: [["TOTAL TURNOVER", "", "", "", total.toLocaleString()]],
        theme: "striped",
        headStyles: { fillColor: [15, 23, 42] }
    });

    return doc.output('bloburl');
};

export const generateVendorReport = (vendors: any[], config?: any) => {
    const doc = new jsPDF();
    const startY = applyReportHeader(doc, "Vendor Liability & Audit", config);

    doc.setFontSize(10);
    doc.text(`Status: Active Liability Analysis`, 20, startY);

    autoTable(doc, {
        startY: startY + 10,
        head: [["Vendor Name", "Contact", "Email", "Total Debt (Kshs)"]],
        body: vendors.map(v => [
            v.name || "N/A",
            v.contact || "N/A",
            v.email || "N/A",
            (v.balance || 0).toLocaleString()
        ]),
        theme: "grid",
        headStyles: { fillColor: [124, 58, 237] } // purple
    });

    return doc.output('bloburl');
};

export const generateContractorReport = (contractors: any[], config?: any) => {
    const doc = new jsPDF();
    const startY = applyReportHeader(doc, "Contractor Credit Aging", config);

    doc.setFontSize(10);
    doc.text(`Scope: Total Contractor Credit Exposure`, 20, startY);

    autoTable(doc, {
        startY: startY + 10,
        head: [["Contractor", "Phone", "Projects", "Outstanding (Kshs)"]],
        body: contractors.map(c => [
            c.name || "N/A",
            c.phone || "N/A",
            c.category || "Staff/Contractor",
            (c.balance || 0).toLocaleString()
        ]),
        theme: "striped",
        headStyles: { fillColor: [5, 150, 105] } // emerald
    });

    return doc.output('bloburl');
};



export const generatePaymentPatternsReport = (transactions: any[], config?: any) => {
    const doc = new jsPDF();
    const startY = applyReportHeader(doc, "Debt Recovery & Repayment Audit", config);

    const total = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    autoTable(doc, {
        startY: startY + 5,
        head: [["Date", "Contractor", "Ref/Method", "Amount Paid (Kshs)"]],
        body: transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.contractorName || "N/A",
            t.reference || "N/A",
            (t.amount || 0).toLocaleString()
        ]),
        foot: [["TOTAL RECOVERED", "", "", total.toLocaleString()]],
        theme: "grid",
        headStyles: { fillColor: [5, 150, 105] } // emerald
    });

    return doc.output('bloburl');
};

export const generateContractorStatementReport = (data: any, config?: any, filters?: any) => {
    const doc = new jsPDF();
    const { contractor, orders, transactions } = data;

    const title = contractor
        ? `Account Statement: ${contractor.name}`
        : "Consolidated Contractor Accounts";

    const startY = applyReportHeader(doc, title, config);

    doc.setFontSize(10);
    doc.text(`Period: ${filters?.startDate || "Start"} to ${filters?.endDate || "End"}`, 20, startY);

    if (contractor) {
        doc.text(`Current Outstanding Balance: Kshs ${contractor.balance.toLocaleString()}`, 20, startY + 7);
        doc.setTextColor(225, 29, 72); // rose-600
        doc.setFont("helvetica", "bold");
        if (contractor.balance > 0) {
            doc.text("STATUS: DEBTOR - PAYMENT REQUIRED", 20, startY + 14);
        } else {
            doc.setTextColor(5, 150, 105); // emerald-600
            doc.text("STATUS: CLEAR ACCOUNT", 20, startY + 14);
        }
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "normal");
    }

    // Combined Statement Table (LIFO)
    const ledgerItems = [
        ...orders.map((o: any) => ({
            date: o.date,
            description: `Credit Sale: ${o.orderNumber || o.id.slice(0, 8)}`,
            debit: o.total,
            credit: 0,
            ref: o.transactionRef || "N/A"
        })),
        ...transactions.map((t: any) => ({
            date: t.date,
            description: `Repayment: ${t.reference || "Check/Cash"}`,
            debit: 0,
            credit: t.amount,
            ref: t.reference || t.type
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    autoTable(doc, {
        startY: startY + 25,
        head: [['Date', 'Description', 'Ref', 'Debit (Kshs)', 'Credit (Kshs)']],
        body: ledgerItems.map(item => [
            new Date(item.date).toLocaleDateString(),
            item.description,
            item.ref,
            item.debit > 0 ? item.debit.toLocaleString() : "-",
            item.credit > 0 ? item.credit.toLocaleString() : "-"
        ]),
        foot: [[
            'TOTALS',
            '',
            '',
            ledgerItems.reduce((s, i) => s + i.debit, 0).toLocaleString(),
            ledgerItems.reduce((s, i) => s + i.credit, 0).toLocaleString()
        ]],
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] }
    });

    return doc.output('bloburl');
};

export const generatePOPDF = (po: any, vendor: any, products: any[], action: 'print' | 'download' = 'print', config?: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("PURCHASE ORDER", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`PO NUMBER: ${po.poNumber}`, pageWidth - 20, 20, { align: "right" });
    doc.text(`DATE: ${new Date(po.date).toLocaleDateString()}`, pageWidth - 20, 28, { align: "right" });

    // Vendor & Company Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("VENDOR:", 20, 55);
    doc.text("SHIP TO:", pageWidth / 2 + 10, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(vendor?.name || "Unknown Vendor", 20, 62);
    doc.text(vendor?.contact || "N/A", 20, 68);
    doc.text(vendor?.email || "N/A", 20, 74);

    doc.text((config?.name || "BIASHARA POS").toUpperCase(), pageWidth / 2 + 10, 62);
    doc.text(config?.location || "Main Warehouse, Nairobi", pageWidth / 2 + 10, 68);
    doc.text(config?.phone || "Kenya", pageWidth / 2 + 10, 74);

    // Items Table
    const items = JSON.parse(po.items);
    autoTable(doc, {
        startY: 90,
        head: [['SKU / PRODUCT', 'QTY', 'UNIT COST (Kshs)', 'TOTAL (Kshs)']],
        body: items.map((item: any) => {
            const product = products.find(p => p.id === item.productId);
            return [
                product?.name || item.productId,
                item.quantity,
                item.costPrice.toLocaleString(),
                (item.quantity * item.costPrice).toLocaleString()
            ];
        }),
        theme: 'striped',
        headStyles: { fillColor: [13, 148, 136] },
        styles: { fontSize: 9 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    doc.setFont("helvetica", "bold");
    doc.text(`GRAND TOTAL: Kshs ${po.total.toLocaleString()}`, pageWidth - 20, finalY, { align: "right" });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("This is a computer-generated document. No signature required.", pageWidth / 2, 280, { align: "center" });

    if (action === 'download') {
        doc.save(`PO-${po.poNumber}.pdf`);
    } else if (action === 'print') {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);

        let iframe = document.getElementById('manifest-print-engine') as HTMLIFrameElement;

        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'manifest-print-engine';
            iframe.style.position = 'fixed';
            iframe.style.left = '-9999px';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);
        }

        iframe.src = url;

        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            }, 1000); // 1s buffer for PDF engine initialization
        };
    } else {
        return doc.output('bloburl');
    }
};

export const generateGRNReport = (po: any, vendor: any, products: any[], action: 'print' | 'download' | 'open' = 'open', config?: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Branded Header
    const startY = applyReportHeader(doc, "GOODS RECEIVED NOTE (GRN)", config);

    // Metadata Section
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`GRN REF: GRN-${po.poNumber.split('-')[1]}`, 20, startY + 5);
    doc.text(`LINKED PO: ${po.poNumber}`, 20, startY + 12);
    doc.text(`RECEPTION DATE: ${new Date().toLocaleDateString()}`, pageWidth - 20, startY + 5, { align: 'right' });
    doc.text(`SETTLEMENT: ${po.paymentMethod?.toUpperCase() || 'CREDIT'}`, pageWidth - 20, startY + 12, { align: 'right' });

    // Vendor Info
    doc.rect(20, startY + 20, pageWidth - 40, 25);
    doc.setFontSize(9);
    doc.text("SUPPLY PARTNER:", 25, startY + 28);
    doc.setFont("helvetica", "normal");
    doc.text(`${vendor?.name || 'N/A'}`, 25, startY + 35);
    doc.text(`${vendor?.contact || 'N/A'} | ${vendor?.email || 'N/A'}`, 25, startY + 41);

    // Items Table
    const items = JSON.parse(po.items);
    autoTable(doc, {
        startY: startY + 55,
        head: [['#', 'SKU / PRODUCT DESCRIPTION', 'ACCEPTED QTY', 'UNIT COST', 'SUB-TOTAL']],
        body: items.map((item: any, index: number) => {
            const product = products.find(p => p.id === item.productId);
            return [
                index + 1,
                product?.name || item.productId,
                item.quantity,
                `Kshs ${item.costPrice.toLocaleString()}`,
                `Kshs ${(item.quantity * item.costPrice).toLocaleString()}`
            ];
        }),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 8, cellPadding: 4 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Financial Reconciliation
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("FINANCIAL SUMMARY", 20, finalY);
    doc.line(20, finalY + 2, 100, finalY + 2);

    doc.setFont("helvetica", "normal");
    doc.text(`Total Gross Value:`, 20, finalY + 10);
    doc.text(`Kshs ${po.total.toLocaleString()}`, pageWidth - 20, finalY + 10, { align: 'right' });

    doc.text(`Amount Settled:`, 20, finalY + 17);
    doc.text(`Kshs ${(po.paidAmount || 0).toLocaleString()}`, pageWidth - 20, finalY + 17, { align: 'right' });

    doc.setFont("helvetica", "bold");
    doc.text(`Active Debt / Liability:`, 20, finalY + 24);
    doc.setTextColor(225, 29, 72);
    doc.text(`Kshs ${(po.total - (po.paidAmount || 0)).toLocaleString()}`, pageWidth - 20, finalY + 24, { align: 'right' });
    doc.setTextColor(0);

    // Signatures
    const sigY = finalY + 50;
    doc.text("STORE MANAGER SIGNATURE", 20, sigY);
    doc.line(20, sigY + 2, 80, sigY + 2);

    doc.text("VENDOR REPRESENTATIVE", pageWidth - 80, sigY);
    doc.line(pageWidth - 80, sigY + 2, pageWidth - 20, sigY + 2);

    if (action === 'download') {
        doc.save(`GRN-${po.poNumber}.pdf`);
    } else if (action === 'print') {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        let iframe = document.getElementById('manifest-print-engine') as HTMLIFrameElement;
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'manifest-print-engine';
            iframe.style.position = 'fixed';
            iframe.style.left = '-9999px';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);
        }
        iframe.src = url;
        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            }, 500);
        };
    } else {
        return doc.output('bloburl');
    }
};

export const generatePOListReport = (pos: any[], config?: any) => {
    const doc = new jsPDF();
    const startY = applyReportHeader(doc, "Purchase Order Global Ledger", config);

    doc.setFontSize(10);
    doc.text(`Total PO Events: ${pos.length}`, 20, startY);

    const totalValuation = pos.reduce((sum, p) => sum + (p.total || 0), 0);

    autoTable(doc, {
        startY: startY + 10,
        head: [["Date", "PO Number", "Vendor", "Status", "Amount (Kshs)"]],
        body: pos.map(p => [
            new Date(p.date).toLocaleDateString(),
            p.poNumber || "N/A",
            p.vendorName || "External",
            p.status || "N/A",
            (p.total || 0).toLocaleString()
        ]),
        foot: [["GRAND TOTAL PROCURED", "", "", "", totalValuation.toLocaleString()]],
        theme: "grid",
        headStyles: { fillColor: [13, 148, 136] } // teal
    });

    return doc.output('bloburl');
};

