import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { authStore } from "../store/authStore";

const auth = authStore;

/* ----------------------- Helpers ----------------------- */
const isAbsoluteUrl = (u) => /^https?:\/\//i.test(u);
const safeJoinUrl = (base, path) =>
  isAbsoluteUrl(path)
    ? path
    : `${base.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;

// Detect image format from a data URL for jsPDF addImage
const getImageFormatFromDataURL = (dataUrl) => {
  if (typeof dataUrl !== "string") return "PNG";
  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) return "JPEG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP"; // jsPDF >= 2.5 supports via plugin/beta
  return "PNG"; // default
};

// Blob → DataURL (avoids tainted canvas + CORS canvas issues)
const blobToDataURL = (blob) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });

const fetchAsDataURL = async (url, timeoutMs = 8000) => {
  if (!url) throw new Error("No URL");

  const sep = url.includes("?") ? "&" : "?";
  const bustUrl = `${url}${sep}t=${Date.now()}`;

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(bustUrl, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    if (!/^image\//i.test(blob.type)) throw new Error(`Not an image: ${blob.type}`);

    return await blobToDataURL(blob); // "data:image/...;base64,...."
  } finally {
    clearTimeout(to);
  }
};

// Placeholder logo if no usable logo available
const makePlaceholderPng = (initials = "A", size = 80) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Rounded square bg
  const r = 16, w = size, h = size;
  ctx.fillStyle = "#D9D9D9"; 
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

  // Initial(s)
  ctx.fillStyle = "#000";
  ctx.font = `700 ${Math.round(size * 0.32)}px Helvetica, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, size / 2, size / 2);

  return canvas.toDataURL("image/png");
};

// Cross-browser saver (Firefox/Safari/Edge friendly)
const savePdfCrossBrowser = async (doc, fileName = "export.pdf") => {
  const name = /\.pdf$/i.test(fileName) ? fileName : `${fileName}.pdf`;
  try {
    if (typeof doc.save === "function") {
      const maybePromise = doc.save(name, { returnPromise: true });
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
        return;
      }
    }
  } catch {
    // ignore and fall through
  }
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/* ----------------------- Main Export ----------------------- */
export async function pdfExport({ headers, rows, title, fileName }) {
  // 1) Try to load logo
  let logoBase64 = null;
  try {
    const response = await auth.fetchProtectedApi(`/api/org-profile/logo`, {}, "GET");
    const raw = response?.data?.image; // could be a path/URL or already data:image...
    if (response?.status && raw) {
      if (typeof raw === "string" && raw.startsWith("data:image")) {
        // Already a data URL
        logoBase64 = raw;
      } else {
        // Treat as path/URL
        const fullUrl = safeJoinUrl(auth.apiBase, raw);
        logoBase64 = await fetchAsDataURL(fullUrl);
      }
    }
  } catch {
    // swallow – will fallback
  }

  // 2) Fallback placeholder ALWAYS if no usable logo
  if (!logoBase64) {
    const initials = (auth?.user?.org_name || "A").trim().slice(0, 1).toUpperCase();
    logoBase64 = makePlaceholderPng(initials || "A", 80);
  }

  const imgFormat = getImageFormatFromDataURL(logoBase64); // PNG or JPEG typically

  // 3) Build PDF
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
      doc.addImage(logoBase64, imgFormat, pageWidth / 2 - 100, pageHeight / 2 - 100, 200, 200);
    } catch {
      // ignore addImage failures
    }
    doc.restoreGraphicsState();
  };

  // Headers
  const addFirstPageHeader = () => {
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, imgFormat, pageWidth / 2 - 20, 20, 40, 40);
      } catch {}
    }
    doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(30, 30, 30);
    doc.text(auth.user.org_name, pageWidth / 2, 75, { align: "center" });

    doc.setFontSize(10).setFont("helvetica").setTextColor(100);
    doc.text(title, pageWidth / 2, 90, { align: "center" });
  };

  const addOtherPageHeader = () => {
    doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(30, 30, 30);
    doc.text(auth.user.org_name, pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(10).setFont("helvetica").setTextColor(100);
    doc.text(title, pageWidth / 2, 45, { align: "center" });
  };

  // Draw first page header
  addFirstPageHeader();

  // Track row counts per page for footer “Items x–y of z”
  const pageRowCounts = {};

  // Table
  autoTable(doc, {
    head: [header],
    body,
    startY: 100, // below the big header
    margin: { top: 55, right: 40, bottom: 50, left: 40 },
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [217, 217, 217], textColor: [30, 30, 30], fontStyle: "bold" },
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

      watermark();
      if (currentPage !== 1) addOtherPageHeader();

      // Footer
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
      //doc.setFontSize(9);

      // Left
      doc.setFont("helvetica", "italic").setTextColor(100).setFontSize(9);
      doc.text(
        `Generated by Azonation on ${dayjs().format("DD MMM YYYY")}`,
        data.settings.margin.left,
        pageHeight - 25
      );

      // Centre
      doc.setFont("helvetica", "normal").setTextColor(100).setFontSize(9);
      doc.text(
        `Items ${startIndex}–${endIndex} of ${totalItems}`,
        pageWidth / 2,
        pageHeight - 25,
        { align: "center" }
      );

      // Right
      doc.setFont("helvetica", "normal").setTextColor(100).setFontSize(9);
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        pageWidth - data.settings.margin.right,
        pageHeight - 25,
        { align: "right" }
      );
    },
  });

  // Save (ensure called from a user click handler)
  await savePdfCrossBrowser(doc, fileName);
}