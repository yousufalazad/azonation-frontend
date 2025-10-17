<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authStore } from "../../../store/authStore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const auth = authStore;
const route = useRoute();
const router = useRouter();
const id = route.params.id;

const record = ref(null);

/* ---------------- Fetch record ---------------- */
const fetchRecord = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/strategic-plans/${id}`, {}, "GET");
    if (response.status) record.value = response.data;
    else record.value = null;
  } catch (error) {
    console.error("Error fetching record:", error);
    record.value = null;
  }
};

/* ---------------- Helper functions ---------------- */
const fetchAsDataURL = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

const makePlaceholderPng = (initial, size = 80) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#e5e7eb"; // gray background
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#374151"; // dark gray text
  ctx.font = `bold ${size / 2}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initial, size / 2, size / 2);
  return canvas.toDataURL("image/png");
};

const getImageFormatFromDataURL = (dataURL) => {
  const match = dataURL?.match(/^data:image\/(png|jpeg|jpg)/i);
  return match ? match[1].toUpperCase() : "PNG";
};

const safeJoinUrl = (base, path) => {
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

// Load image as base64 (handles CORS)
const loadImageAsDataURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (err) => reject(err);
  });
};

/* ---------------- PDF Download ---------------- */
const downloadPDF = async () => {
  if (!record.value) return;

  try {
    // 1️⃣ Load logo
    let logoBase64 = null;
    try {
      const response = await auth.fetchProtectedApi(`/api/org-profile/logo`, {}, "GET");
      const raw = response?.data?.image;
      if (response?.status && raw) {
        if (typeof raw === "string" && raw.startsWith("data:image")) {
          logoBase64 = raw;
        } else {
          const fullUrl = safeJoinUrl(auth.apiBase, raw);
          logoBase64 = await fetchAsDataURL(fullUrl);
        }
      }
    } catch {
      console.warn("Logo fetch failed, using fallback.");
    }

    if (!logoBase64) {
      const initials = (auth?.user?.org_name || "A").trim().slice(0, 1).toUpperCase();
      logoBase64 = makePlaceholderPng(initials, 100);
    }
    const imgFormat = getImageFormatFromDataURL(logoBase64);

    // 2️⃣ Initialize jsPDF
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = 40;

    // 3️⃣ Logo centered
    const logoWidth = 60;
    const logoHeight = 60;
    doc.addImage(logoBase64, imgFormat, (pageWidth - logoWidth) / 2, y, logoWidth, logoHeight);
    y += logoHeight + 10;

    // 4️⃣ Org name & Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(auth?.user?.org_name || "Organization Name", pageWidth / 2, y, { align: "center" });
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Strategic Plan Details", pageWidth / 2, y, { align: "center" });
    y += 25;

    // 5️⃣ Basic info
    const info = [
      ["Title", record.value.title || ""],
      ["Start Date", record.value.start_date || ""],
      ["End Date", record.value.end_date || ""],
      ["Privacy", record.value.privacy_name || ""],
      ["Status", record.value.status === 1 ? "Active" : "Disabled"],
    ];

    info.forEach(([label, value]) => {
      if (y > pageHeight - 80) {
        doc.addPage();
        y = margin;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), margin + 100, y);
      y += 16;
    });

    // 6️⃣ Plan HTML content
    const planEl = document.getElementById("pdf-plan-content");
    if (planEl) {
      const prevDisplay = planEl.style.display;
      planEl.style.display = "block";
      planEl.style.opacity = "1";
      planEl.style.position = "static";

      await new Promise((r) => setTimeout(r, 300));
      const canvas = await html2canvas(planEl, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });

      planEl.style.display = prevDisplay || "none";
      planEl.style.opacity = "0";
      planEl.style.position = "absolute";

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (y + imgHeight > pageHeight - 80) {
        doc.addPage();
        y = margin;
      }

      doc.setFont("helvetica", "bold");
      doc.text("Plan:", margin, y);
      y += 10;
      doc.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight);
      y += imgHeight + 20;
    }

    // 7️⃣ Add Images
    // 7️⃣ Add Images using html2canvas
    if (record.value.images && record.value.images.length) {
      for (let img of record.value.images) {
        try {
          const fullUrl = safeJoinUrl(auth.apiBase, img.image_url);

          // Create an offscreen image element
          const imgEl = document.createElement("img");
          imgEl.src = fullUrl;
          imgEl.crossOrigin = "Anonymous"; // important for CORS
          await new Promise((resolve, reject) => {
            imgEl.onload = resolve;
            imgEl.onerror = () => reject(new Error("Image load failed"));
          });

          // Render image to canvas
          const canvas = await html2canvas(imgEl, { useCORS: true, backgroundColor: "#ffffff" });
          const imgData = canvas.toDataURL("image/png");

          // Calculate scaled dimensions
          const maxWidth = pageWidth - margin * 2;
          const imgWidth = maxWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (y + imgHeight > pageHeight - 80) {
            doc.addPage();
            y = margin;
          }

          doc.setFont("helvetica", "bold");
          doc.text("Image:", margin, y);
          y += 10;
          doc.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight);
          y += imgHeight + 15;
        } catch (e) {
          console.warn("Failed to add image to PDF:", img.image_url, e);
        }
      }
    }


    // 8️⃣ Add Documents (clickable links)
    if (record.value.documents && record.value.documents.length) {
      if (y > pageHeight - 80) {
        doc.addPage();
        y = margin;
      }
      doc.setFont("helvetica", "bold");
      doc.text("Documents:", margin, y);
      y += 14;
      doc.setFont("helvetica", "normal");

      for (let i = 0; i < record.value.documents.length; i++) {
        const docItem = record.value.documents[i];
        const fullUrl = safeJoinUrl(auth.apiBase, docItem.document_url);

        if (y > pageHeight - 50) {
          doc.addPage();
          y = margin;
        }

        // clickable link in PDF
        doc.textWithLink(`${i + 1}. ${docItem.file_name || "Document"}`, margin + 15, y, { url: fullUrl });
        y += 14;
      }
    }

    // 9️⃣ Footer
    doc.setDrawColor(220);
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
    doc.setFontSize(9);
    doc.text("Generated by Strategic Plan System", pageWidth / 2, pageHeight - 15, { align: "center" });

    // 10️⃣ Save PDF
    doc.save(`${(record.value.title || "strategic_plan").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w\-]/g, "")}.pdf`);
  } catch (err) {
    console.error("PDF generation error:", err);
  }
};

onMounted(() => fetchRecord());
</script>

<template>
  <div class="container mx-auto max-w-7xl w-10/12 p-6 bg-white rounded-lg shadow-md mt-10">
    <!-- Header Buttons -->
    <div class="flex justify-between items-center mb-6">
      <h5 class="text-xl font-semibold">Strategic Plan Details</h5>
      <div class="flex gap-3">
        <button @click="downloadPDF"
          class="px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700">
          Download PDF
        </button>
        <button @click="router.push({ name: 'strategic-plan' })"
          class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700">
          Back to List
        </button>
      </div>
    </div>

    <!-- Table of Details -->
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <tbody class="text-gray-600 text-md font-medium">
          <tr>
            <td class="px-2 py-2 font-semibold w-36">Title</td>
            <td>:</td>
            <td class="px-2 py-2">{{ record?.title }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 font-semibold w-36 align-top">Plan</td>
            <td class="align-top">:</td>
            <td class="px-2 py-2 align-top">
              <div v-html="record?.plan" class="prose max-w-none bg-gray-50 p-4 rounded-md border"></div>
            </td>
          </tr>
          <tr>
            <td class="px-2 py-2 font-semibold w-36">Start Date</td>
            <td>:</td>
            <td class="px-2 py-2">{{ record?.start_date }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 font-semibold w-36">End Date</td>
            <td>:</td>
            <td class="px-2 py-2">{{ record?.end_date }}</td>
          </tr>
          <tr v-if="record?.images && record?.images.length">
            <td class="px-2 py-2 font-semibold w-36 align-top">Images</td>
            <td class="align-top">:</td>
            <td class="px-2 py-2">
              <div class="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <img v-for="(img, index) in record.images" :key="index" :src="safeJoinUrl(auth.apiBase, img.image_url)"
                  alt="Plan Image" class="max-w-full rounded-lg" />
              </div>
            </td>
          </tr>
          <tr v-if="record?.documents && record?.documents.length">
            <td class="px-2 py-2 font-semibold w-36 align-top">Documents</td>
            <td class="align-top">:</td>
            <td class="px-2 py-2">
              <ul class="mt-2 list-disc list-inside text-blue-600">
                <li v-for="(doc, index) in record.documents" :key="index">
                  <a :href="safeJoinUrl(auth.apiBase, doc.document_url)" target="_blank"
                    class="hover:text-blue-800 underline">{{ doc.file_name || "Download Document" }}</a>
                </li>
              </ul>
            </td>
          </tr>
          <tr>
            <td class="px-2 py-2 font-semibold w-36">Privacy</td>
            <td>:</td>
            <td class="px-2 py-2">{{ record?.privacy_name }}</td>
          </tr>
          <tr>
            <td class="px-2 py-2 font-semibold w-36">Status</td>
            <td>:</td>
            <td class="px-2 py-2">{{ record?.status === 1 ? "Active" : "Disabled" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Error -->
    <div v-if="!record" class="text-center py-6">
      <p class="text-red-500">Failed to load the record.</p>
    </div>

    <!-- Hidden Plan Section for PDF -->
    <div id="pdf-plan-content" v-html="record?.plan"
      class="absolute top-0 left-0 opacity-0 pointer-events-none bg-white w-[700px] p-4 text-black"></div>
  </div>
</template>
