import PDFDocument from "pdfkit";

// Builds a GST invoice PDF for an order and resolves to a base64 data URL.
export const generateInvoicePdf = (order, buyer, seller) =>
    new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: "A4", margin: 50 });
            const chunks = [];
            doc.on("data", (c) => chunks.push(c));
            doc.on("end", () => {
                const base64 = Buffer.concat(chunks).toString("base64");
                resolve(`data:application/pdf;base64,${base64}`);
            });

            const subtotal = order.finalPrice || 0;
            const gstRate = 0.18;
            const gst = Math.round(subtotal * gstRate * 100) / 100;
            const fee = order.platformFee || 0;
            const total = Math.round((subtotal + gst) * 100) / 100;

            doc.fontSize(22).fillColor("#16a34a").text("ReScrapIt", { continued: false });
            doc.fillColor("#000").fontSize(10).text("B2B Industrial Scrap Marketplace");
            doc.moveDown();
            doc.fontSize(16).text("Tax Invoice", { align: "right" });
            doc.fontSize(9).text(`Invoice #: ${order._id}`, { align: "right" });
            doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, { align: "right" });
            doc.moveDown();

            doc.fontSize(10).fillColor("#555").text("Seller:");
            doc.fillColor("#000").text(`${seller?.name || ""}  ${seller?.companyName ? "(" + seller.companyName + ")" : ""}`);
            if (seller?.gst) doc.text(`GSTIN: ${seller.gst}`);
            doc.moveDown(0.5);
            doc.fillColor("#555").text("Buyer:");
            doc.fillColor("#000").text(`${buyer?.name || ""}`);
            doc.text(`${buyer?.email || ""}`);
            doc.moveDown();

            doc.fontSize(11).text("Items", { underline: true });
            doc.moveDown(0.3);
            (order.items || []).forEach((it) => {
                const name = it.listing?.name || "Listing";
                doc.fontSize(10).text(`${name}  —  Qty ${it.quantity} × Rs.${it.unitPrice} = Rs.${it.totalPrice}`);
            });
            doc.moveDown();

            doc.fontSize(10);
            doc.text(`Subtotal:  Rs.${subtotal.toFixed(2)}`, { align: "right" });
            doc.text(`GST (18%):  Rs.${gst.toFixed(2)}`, { align: "right" });
            if (fee) doc.text(`Platform fee:  Rs.${fee.toFixed(2)}`, { align: "right" });
            doc.fontSize(12).fillColor("#16a34a").text(`Total:  Rs.${total.toFixed(2)}`, { align: "right" });

            doc.moveDown(2);
            doc.fontSize(8).fillColor("#999").text("This is a computer-generated invoice.", { align: "center" });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
