import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { authStore } from "../store/authStore";

const auth = authStore;

// --- Utils ---
const isAbsoluteUrl = (u) => /^https?:\/\//i.test(u);
const safeJoinUrl = (base, path) =>
  isAbsoluteUrl(path)
    ? path
    : `${base.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;

const withTimeout = (promise, ms = 6000) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Image load timeout")), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });

const urlToBase64 = (url) =>
  withTimeout(
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width || 80;
          canvas.height = img.height || 80;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      const sep = url.includes("?") ? "&" : "?";
      img.src = `${url}${sep}t=${Date.now()}`;
    }),
    6000
  );

const makePlaceholderPng = (initials = "Logo", size = 80) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // background
  const r = 16,
    w = size,
    h = size;
  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // text
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.round(size * 0.32)}px Helvetica, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, size / 2, size / 2);

  return canvas.toDataURL("image/png");
};

// --- Main Export Function ---
export async function pdfExport({ headers, rows, title, fileName }) {
  let logoBase64 = null;
  try {
    const response = await auth.fetchProtectedApi(
      `/api/org-profile/logo`,
      {},
      "GET"
    );
    const raw = response?.data?.image;
    if (response?.status && raw) {
      const fullUrl = safeJoinUrl(auth.apiBase, raw);
      logoBase64 = await urlToBase64(fullUrl);
    }
  } catch {
    logoBase64 = makePlaceholderPng("Logo", 80);
  }

  const doc = new jsPDF("p", "pt");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Table data
  const header = headers.map((h) => h.text);
  const body = rows.map((r) =>
    header.map((h) => r[headers.find((hdr) => hdr.text === h).value] || "")
  );

  // Watermark
  const watermark = () => {
    if (!logoBase64) return;
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.02 }));
    try {
      doc.addImage(
        logoBase64,
        "PNG",
        pageWidth / 2 - 100,
        pageHeight / 2 - 100,
        200,
        200
      );
    } catch {}
    doc.restoreGraphicsState();
  };

  // --- First Page Header ---
  const addFirstPageHeader = () => {
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", pageWidth / 2 - 20, 20, 40, 40);
      } catch {}
    }
    doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(30, 30, 30);
    doc.text(auth.user.org_name, pageWidth / 2, 75, { align: "center" });

    doc.setFontSize(10).setFont("helvetica").setTextColor(100);
    doc.text(title, pageWidth / 2, 90, { align: "center" });

    // doc.setDrawColor(220).setLineWidth(0.8);
    // doc.line(40, 125, pageWidth - 40, 125);
  };

  // --- Other Pages Header ---
  const addOtherPageHeader = () => {
    doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(30, 30, 30);
    doc.text(auth.user.org_name, pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(10).setFont("helvetica").setTextColor(100);
    doc.text(title, pageWidth / 2, 45, { align: "center" });

    // doc.setDrawColor(220).setLineWidth(0.8);
    // doc.line(40, 65, pageWidth - 40, 65);
  };

  // Draw first page header
  addFirstPageHeader();

  // Track how many rows per page
  const pageRowCounts = {};

  // --- Table ---
  autoTable(doc, {
    head: [header],
    body,
    startY: 100, // below the big header
    margin: { top: 55, right: 40, bottom: 50, left: 40 },
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },

    didDrawCell: (cell) => {
      if (cell.section === "body" && cell.column.index === 0) {
        const p = doc.internal.getCurrentPageInfo().pageNumber;
        pageRowCounts[p] = (pageRowCounts[p] || 0) + 1;
      }
    },

    didDrawPage: (data) => {
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      const pageCount = doc.internal.getNumberOfPages();
      watermark()
      //if (currentPage === 1) watermark(); else /* no watermark */;

      // Headers
      if (currentPage === 1) {
        // already drawn before
      } else {
        addOtherPageHeader();
      }

      // --- Footer ---
      const totalItems = rows.length;
      const currentCount = pageRowCounts[currentPage] || 0;
      const priorCount = Object.keys(pageRowCounts)
        .filter((k) => Number(k) < currentPage)
        .reduce((s, k) => s + (pageRowCounts[k] || 0), 0);

      const startIndex = totalItems === 0 ? 0 : priorCount + 1;
      const endIndex = Math.min(priorCount + currentCount, totalItems);

      // Footer line
      doc.setDrawColor(220).setLineWidth(0.8);
      doc.line(40, pageHeight - 40, pageWidth - 40, pageHeight - 40);

      // Footer text
      doc.setFontSize(10);

      // Left
      doc.setFont("helvetica", "italic").setTextColor(100);
      doc.text(
        `Generated by Azonation on ${dayjs().format("YYYY-MM-DD")}`,
        data.settings.margin.left,
        pageHeight - 25
      );

      // Center (items count)
      doc.setFont("helvetica", "normal").setTextColor(100);
      doc.text(
        `Items ${startIndex}–${endIndex} of ${totalItems}`,
        pageWidth / 2,
        pageHeight - 25,
        { align: "center" }
      );

      // Right (page numbers)
      doc.setFont("helvetica", "normal").setTextColor(100);
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageWidth - data.settings.margin.right,
        pageHeight - 25,
        { align: "right" }
      );
    },
  });

  doc.save(fileName);
}