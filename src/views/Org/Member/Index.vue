<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '../../../store/authStore'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import placeholderImage from '@/assets/Placeholder/Azonation-profile-image.jpg';
import { utils, writeFileXLSX } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";
import { pdfExport } from "@/helpers/pdfExport.js";
import { excelExport } from "@/helpers/excelExport.js";
import { csvExport } from "@/helpers/csvExport.js";
import { docxExport } from "@/helpers/docxExport";

dayjs.extend(duration)
dayjs.extend(relativeTime)

const auth = authStore
const route = useRoute()
const router = useRouter()
const org_name = auth.user.org_name;

const memberList = ref([])
const search = ref("")
const dateFrom = ref("")
const dateTo = ref("")
const loading = ref(false)

const selectedMember = ref(null)
const viewModal = ref(false)
const editModal = ref(false)
const membership_type_id = ref("")
const membership_status_id = ref("")
const approved_by = ref("")
const approved_at = ref("")
const sponsored_user_id = ref("")
const compact_view = ref(false)


// const exportToWord = async () => {
//   const tableRows = [
//     new TableRow({
//       children: [
//         'Name',
//         'Membership Type',
//         'Membership ID',
//         'Joining Date',
//         'Membership Age'
//       ].map(header => new TableCell({
//         width: { size: 20, type: WidthType.PERCENTAGE },
//         children: [new Paragraph({ text: header, bold: true })]
//       }))
//     }),
//     ...filteredMembers.value.map(m => new TableRow({
//       children: [
//         m.full_name || '--',
//         m.membership_type?.name || '--',
//         m.existing_membership_id || '--',
//         m.membership_start_date ? dayjs(m.membership_start_date).format('YYYY-MM-DD') : '--',
//         calculateMembershipAge(m.membership_start_date)
//       ].map(text => new TableCell({
//         width: { size: 20, type: WidthType.PERCENTAGE },
//         children: [new Paragraph(text)]
//       }))
//     }))
//   ];

//   const doc = new Document({
//     sections: [{
//       properties: {},
//       children: [
//         new Paragraph({
//           text: "Members",
//           heading: "Heading1",
//         }),
//         new Table({
//           rows: tableRows
//         })
//       ],
//     }],
//   });

//   const blob = await Packer.toBlob(doc);
//   saveAs(blob, "OrgMembers.docx");
// };

// ✅ Column Profile Logic
const columnProfiles = {
  minimal: ['full_name', 'membership_type.name', 'existing_membership_id'],

  detailed: ['image_url', 'full_name', 'existing_membership_id', 'membership_type.name', 'membership_start_date', 'membership_age', 'actions']
}

const selectedProfile = ref(localStorage.getItem('selected_member_profile') || 'detailed')
const visibleColumns = ref(JSON.parse(localStorage.getItem('visible_member_columns')) || columnProfiles[selectedProfile.value])

watch([visibleColumns, selectedProfile], () => {
  localStorage.setItem('visible_member_columns', JSON.stringify(visibleColumns.value))
  localStorage.setItem('selected_member_profile', selectedProfile.value)
}, { deep: true })

const applyProfile = () => {
  visibleColumns.value = [...columnProfiles[selectedProfile.value]]
}

// ✅ Table Headers
const allHeaders = [
  { text: 'Image', value: 'image_url' },
  { text: 'Name', value: 'full_name', sortable: true },
  { text: 'Membership ID', value: 'existing_membership_id', sortable: true },
  { text: 'Membership Type', value: 'membership_type.name', sortable: true },
  { text: 'Joining Date', value: 'membership_start_date', sortable: true },
  { text: 'Membership Age', value: 'membership_age' },
  { text: 'Actions', value: 'actions' }
]

// Visibility filter
const headers = computed(() =>
  allHeaders.filter(h => visibleColumns.value.includes(h.value))
)

// ✅ Fetch member list
const fetchMemberList = async () => {
  loading.value = true
  try {
    const response = await auth.fetchProtectedApi('/api/org-members/', {}, 'GET')
    memberList.value = response.status ? response.data.map(m => ({
      ...m,
      full_name: `${m.individual.first_name || ''} ${m.individual.last_name || ''}`.trim(),
      image_url: m.image_url ?? placeholderImage // Force fallback URL at data source
    })) : []
  } catch {
    memberList.value = []
  } finally {
    loading.value = false
  }
}
const membershipTypes = ref([])
// ✅ Fetch membership types
const fetchMembershipType = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/org-membership-types', {}, 'GET')
    membershipTypes.value = response.status ? response.data : []
  } catch (error) {
    console.error('Error fetching membership types:', error)
  }
}

const membershipStatuses = ref([])
// ✅ Fetch membership types
const fetchMembershipSatatuses = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/membership-statuses', {}, 'GET')
    membershipStatuses.value = response.status ? response.data : []
  } catch (error) {
    console.error('Error fetching membership types:', error)
  }
}

// ✅ Membership status badge class
const statusClass = computed(() => {
  const status = (selectedMember.value?.membership_status?.name || '').toLowerCase()

  const map = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-200 text-gray-600',
    suspended: 'bg-red-100 text-red-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-blue-100 text-blue-700',
    probation: 'bg-purple-100 text-purple-700',
    expired: 'bg-black text-white',
    applied: 'bg-sky-100 text-sky-700',
    under_review: 'bg-indigo-100 text-indigo-700',
    rejected: 'bg-red-200 text-red-800',
    withdrawn: 'bg-orange-100 text-orange-700',
    graduated: 'bg-emerald-100 text-emerald-700',
    retired: 'bg-stone-100 text-stone-700',
    lifetime: 'bg-teal-100 text-teal-700',
    honorary: 'bg-pink-100 text-pink-700',
    deceased: 'bg-gray-800 text-white',
    banned: 'bg-red-800 text-white',
  }

  return map[status] || 'bg-gray-200 text-gray-600' // fallback
})

// ✅ Format status for display
const formattedStatus = computed(() => {
  const raw = selectedMember.value?.membership_status?.name || '--'
  return raw
    .replace(/_/g, ' ')          // replace underscores with spaces
    .replace(/\b\w/g, c => c.toUpperCase()) // capitalise each word
})




// ✅ Membership age calculator
const calculateMembershipAge = (startDate) => {
  if (!startDate) return ''
  const start = dayjs(startDate)
  const now = dayjs()
  const diffYears = now.diff(start, 'year')
  const diffMonths = now.diff(start.add(diffYears, 'year'), 'month')
  const diffDays = now.diff(start.add(diffYears, 'year').add(diffMonths, 'month'), 'day')
  return `${diffYears}y ${diffMonths}m ${diffDays}d`
}

// ✅ Data filter
const filteredMembers = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  let list = [...memberList.value].map(member => ({
    ...member,
    image_url: member.image_url || placeholderImage
  }));

  if (keyword) {
    list = list.filter(m => {
      const fullName = m.full_name?.toLowerCase() || ''
      const membershipId = m.existing_membership_id?.toString().toLowerCase() || ''
      const membershipType = m.membership_type?.name?.toLowerCase() || ''
      const membershipStart = m.membership_start_date
        ? dayjs(m.membership_start_date).format('YYYY-MM-DD').toLowerCase()
        : ''
      const membershipAge = calculateMembershipAge(m.membership_start_date)?.toLowerCase() || ''

      return (
        fullName.includes(keyword) ||
        membershipId.includes(keyword) ||
        membershipType.includes(keyword) ||
        membershipStart.includes(keyword) ||
        membershipAge.includes(keyword)
      )
    })
  }

  if (membership_type_id.value) {
    list = list.filter(m => m.membership_type_id === membership_type_id.value)
  }
  if (membership_status_id.value) {
    list = list.filter(m => m.membership_status_id === membership_status_id.value)
  }
  if (dateFrom.value && dateTo.value) {
    const from = dayjs(dateFrom.value)
    const to = dayjs(dateTo.value)
    list = list.filter(m => {
      const d = dayjs(m.membership_start_date)
      return d.isAfter(from.subtract(1, 'day')) && d.isBefore(to.add(1, 'day'))
    })
  }

  return list
})

// ✅ Export functions
// const exportXLSX = () => {
//   const data = filteredMembers.value.map(m => ({
//     'Full Name': m.full_name,
//     'Membership Type': m.membership_type?.name || '--',
//     'Joining Date': m.membership_start_date ? dayjs(m.membership_start_date).format('YYYY-MM-DD') : '--',
//     'Membership ID': m.existing_membership_id || '--',
//     'Membership Age': calculateMembershipAge(m.membership_start_date)
//   }))
//   const ws = utils.json_to_sheet(data)
//   const wb = utils.book_new()
//   utils.book_append_sheet(wb, ws, "Members")
//   writeFileXLSX(wb, "OrgMembers.xlsx")
// }

// const exportCSV = () => {
//   const data = filteredMembers.value.map(m => [
//     m.full_name,
//     m.membership_type?.name || '--',
//     m.membership_start_date ? dayjs(m.membership_start_date).format('YYYY-MM-DD') : '--',
//     m.existing_membership_id || '--',
//     calculateMembershipAge(m.membership_start_date)
//   ])
//   const ws = utils.aoa_to_sheet([
//     ['Full Name', 'Membership Type', 'Joining Date', 'Membership ID', 'Membership Age'],
//     ...data
//   ])
//   const wb = utils.book_new()
//   utils.book_append_sheet(wb, ws, "Members")
//   writeFileXLSX(wb, "OrgMembers.csv", { bookType: 'csv' })
// }

// Export CSV with custom header/footer
const exportCSV = async () => {
  await csvExport({
    headers: headers.value,
    rows: filteredMembers.value,
    title: "Member List",
    fileName: "Members.csv",
  });
};


// Export XLSX with custom header/footer
const exportXLSX = async () => {
  await excelExport({
    headers: headers.value,
    rows: filteredMembers.value,
    title: "Member List",
    fileName: "Members.xlsx",
  });

};

// --- Export Members PDF ---
const exportPDF = () => {
  pdfExport({
    headers: headers.value,
    rows: filteredMembers.value,
    title: "Member List",
    fileName: "Members.pdf",
  });
};


const exportDOCX = () => {
  docxExport({
    headers: headers.value,
    rows: filteredMembers.value,
    title: "Member List",
    fileName: "Members.docx",
    logoPath: "/storage/org/profile/image/20250924184601_map.JPG",

  });
};



const logoPath = ref(null);
const baseURL = auth.apiBase;

// --- Utils ---
const isAbsoluteUrl = (u) => /^https?:\/\//i.test(u);
const safeJoinUrl = (base, path) =>
  isAbsoluteUrl(path) ? path : `${base.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;

const withTimeout = (promise, ms = 6000) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Image load timeout")), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }).catch(e => { clearTimeout(t); reject(e); });
  });

// URL → Base64 (PNG) with CORS + timeout
const urlToBase64 = (url) => withTimeout(new Promise((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 80;
      canvas.height = img.height || 80;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png")); // <-- REAL PNG
    } catch (err) {
      reject(err);
    }
  };
  img.onerror = reject;
  const sep = url.includes("?") ? "&" : "?";
  img.src = `${url}${sep}t=${Date.now()}`;
}), 6000);

// TRUE PNG placeholder via canvas (no SVG)
const makePlaceholderPng = (initials = "Logo", size = 80) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // bg (rounded square)
  const r = 16;
  const w = size, h = size;
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

// Infer jsPDF image format from data URL
const guessJsPdfFormat = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== "string") return "PNG";
  if (dataUrl.startsWith("data:image/jpeg")) return "JPEG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "PNG";
};

const ORG_INITIALS = "Logo";

// --- Fetch & prepare logo (with robust fallback) ---
const fetchLogo = async () => {
  try {
    const response = await auth.fetchProtectedApi(`/api/org-profile/logo`, {}, 'GET');
    const raw = response?.data?.image;

    if (response?.status && raw) {
      const fullUrl = safeJoinUrl(baseURL, raw);
      try {
        logoPath.value = await urlToBase64(fullUrl);
        console.log("Logo fetched and converted to Base64.", logoPath.value?.slice(0, 32) + "...");
        return;
      } catch (imgErr) {
        console.warn("Logo conversion failed, using placeholder.", imgErr);
      }
    } else {
      console.warn("No image in API response, using placeholder.");
    }
  } catch (error) {
    console.warn("Logo fetch error, using placeholder.", error);
  }
  // fallback to TRUE PNG
  logoPath.value = makePlaceholderPng(ORG_INITIALS, 80);
};

// Export PDF
// const exportPDF = async () => {
//   if (!logoPath.value) {
//     await fetchLogo()
//   }

//   const doc = new jsPDF("p", "pt")
//   const pageWidth = doc.internal.pageSize.getWidth()
//   const pageHeight = doc.internal.pageSize.getHeight()

//   // ===== WATERMARK (Logo) =====
//   const watermark = () => {
//     if (logoPath.value) {
//       doc.saveGraphicsState()
//       doc.setGState(new doc.GState({ opacity: 0.08 })) // faint logo
//       try {
//         // Logo size বড় রাখছি যাতে ব্যাকগ্রাউন্ডে পরিষ্কার দেখা যায়
//         doc.addImage(
//           logoPath.value,
//           "PNG",
//           pageWidth / 2 - 100, // center horizontally
//           pageHeight / 2 - 100, // center vertically
//           200, // width
//           200  // height
//         )
//       } catch (e) {
//         console.warn("Watermark logo addImage failed:", e)
//       }
//       doc.restoreGraphicsState()
//     }
//   }

//   // ===== HEADER =====
//   const header = () => {
//     if (logoPath.value) {
//       try {
//         doc.addImage(logoPath.value, "PNG", pageWidth / 2 - 20, 20, 40, 40)
//       } catch (e) {
//         console.warn("Header logo addImage failed:", e)
//       }
//     }

//     // Title
//     doc.setFontSize(18)
//     doc.setFont("helvetica", "bold")
//     doc.setTextColor(30, 30, 30)
//     doc.text("Organization Name", pageWidth / 2, 80, { align: "center" })

//     // Subtitle
//     doc.setFontSize(13)
//     doc.setFont("helvetica", "bold")
//     doc.setTextColor(37, 99, 235)
//     doc.text("Member List", pageWidth / 2, 100, { align: "center" })

//     // Date
//     doc.setFontSize(10)
//     doc.setFont("helvetica", "normal")
//     doc.setTextColor(100)
//     doc.text(`Generated on: ${dayjs().format("YYYY-MM-DD HH:mm")}`, pageWidth / 2, 115, { align: "center" })

//     // Divider
//     doc.setDrawColor(220)
//     doc.setLineWidth(0.8)
//     doc.line(40, 125, pageWidth - 40, 125)
//   }

//   // ===== TABLE DATA =====
//   const rows = filteredMembers.value.map(m => [
//     m.full_name,
//     m.membership_type?.name || "--",
//     m.membership_start_date ? dayjs(m.membership_start_date).format("YYYY-MM-DD") : "--",
//     m.existing_membership_id || "--",
//     calculateMembershipAge(m.membership_start_date),
//   ])

//   // ===== AUTOTABLE =====
//   autoTable(doc, {
//     head: [["Full Name", "Membership Type", "Joining Date", "Membership ID", "Membership Age"]],
//     body: rows,
//     startY: 140,
//     didDrawPage: (data) => {
//       watermark() // background logo watermark
//       header()    // header

//       // Footer Divider
//       doc.setDrawColor(220)
//       doc.setLineWidth(0.8)
//       doc.line(40, pageHeight - 40, pageWidth - 40, pageHeight - 40)

//       const pageCount = doc.internal.getNumberOfPages()
//       const currentPage = doc.internal.getCurrentPageInfo().pageNumber

//       // Footer text
//       doc.setFontSize(10)

//       // Left: "Generated by Azonation"
//       doc.setFont("helvetica", "italic")
//       doc.setTextColor(100)
//       doc.text("Generated by Azonation", data.settings.margin.left, pageHeight - 25)

//       // Center: current page only
//       doc.setFont("helvetica", "bold")
//       doc.setTextColor(37, 99, 235)
//       doc.text(`${currentPage}`, pageWidth / 2, pageHeight - 25, { align: "center" })

//       // Right: current-total
//       doc.setFont("helvetica", "normal")
//       doc.setTextColor(30, 30, 30)
//       doc.text(`${currentPage}-${pageCount}`, pageWidth - data.settings.margin.right, pageHeight - 25, { align: "right" })
//     },
//     styles: { fontSize: 10, cellPadding: 6 },
//     headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
//     alternateRowStyles: { fillColor: [245, 245, 245] },
//   })

//   doc.save("OrgMembers.pdf")
// }

// ✅ Modal handlers
const viewMemberDetail = (member) => {
  selectedMember.value = member
  viewModal.value = true
}

const editMember = () => {
  if (selectedMember.value) {
    membership_type_id.value = selectedMember.value.membership_type_id
    membership_status_id.value = selectedMember.value.membership_status_id
    approved_by.value = selectedMember.value.approved_by
    approved_at.value = selectedMember.value.approved_at
    sponsored_user_id.value = selectedMember.value.sponsored_user_id
    editModal.value = true
  }
}

const closeViewModal = () => {
  selectedMember.value = null
  viewModal.value = false
}

const closeEditModal = () => {
  selectedMember.value = null
  membership_type_id.value = ""
  membership_status_id.value = ""
  approved_by.value = ""
  approved_at.value = ""
  sponsored_user_id.value = ""
  editModal.value = false
  closeViewModal()
  // ⬇️ remove the query param so refresh won’t reopen the modal
  router.replace({ name: 'index-member', query: {} })
}

// ✅ Update Member
const updateMember = async () => {
  try {
    const memberId = selectedMember.value?.id
    const payload = {
      existing_membership_id: selectedMember.value?.existing_membership_id,
      membership_start_date: selectedMember.value?.membership_start_date,
      membership_type_id: membership_type_id.value,
      membership_status_id: membership_status_id.value,
      approved_by: approved_by.value,
      approved_at: approved_at.value,
      sponsored_user_id: sponsored_user_id.value,
    }
    const response = await auth.fetchProtectedApi(`/api/org-members/${memberId}`, payload, 'PUT')

    if (response.status) {
      await fetchMemberList()
      closeEditModal()
      Swal.fire({
        icon: 'success',
        title: 'Member Updated',
        text: 'Member information has been successfully updated.',
        timer: 2000,
        showConfirmButton: false
      })
    } else {
      Swal.fire('Failed', 'Update failed', 'error')
    }
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'An unexpected error occurred.', 'error')
  }
}

const currentPage = ref(1)
const rowsPerPage = ref(10)

const totalItems = computed(() => filteredMembers.value.length)

const totalPages = computed(() => {
  return Math.ceil(totalItems.value / rowsPerPage.value) || 1
})

const paginatedMembers = computed(() => {
  if (!filteredMembers.value?.length) return [];
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredMembers.value.slice(start, start + rowsPerPage.value);
});

watch([search, rowsPerPage], () => {
  currentPage.value = 1
})
const goToFirst = () => currentPage.value = 1
const goToPrev = () => {
  if (currentPage.value > 1) currentPage.value--
}
const goToNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const goToLast = () => currentPage.value = totalPages.value



const terminationModal = ref(false)
const terminationMember = ref(null)
const terminationReasons = ref([])
const orgAdministrator = ref('')

const terminationForm = reactive({
  org_type_user_id: auth.user?.id ?? null,                 // org user
  individual_type_user_id: null,                           // member's user id
  terminated_member_name: '',
  terminated_member_email: '',
  terminated_member_mobile: '',
  terminated_at: dayjs().format('YYYY-MM-DD'),
  processed_at: dayjs().format('YYYY-MM-DD'),
  membership_termination_reason_id: '',
  org_administrator_id: orgAdministrator.value?.id ?? null,  // admin processing
  rejoin_eligible: true,
  file_path: null,                                         // File object
  membership_duration_days: null,
  membership_status_before_termination: null,              // 'active' | 'suspended' | 'probation'
  membership_type_before_termination: null,
  joined_at: dayjs().format('YYYY-MM-DD'),
  org_note: ''
})

// ✅ Fetch termination reasons
const fetchTerminationReasons = async () => {
  try {
    const res = await auth.fetchProtectedApi('/api/membership-termination-reasons', {}, 'GET')

    terminationReasons.value = res?.status ? res.data : [];
  } catch (e) {
    console.error(e)
    Swal.fire('An error occurred. Please try again.', '', 'error')

  }
}
const fetchOrgAdministrators = async () => {
  try {
    const res = await auth.fetchProtectedApi('/api/org-administrators/primary', {}, 'GET')

    orgAdministrator.value = res?.status ? res.data : {};
    terminationForm.org_administrator_id = orgAdministrator.value?.id ?? null
  } catch (e) {
    console.error(e)
    Swal.fire('An error occurred. Please try again.', '', 'error')
  }
}
// ✅ Duration auto-calc: terminated_at - membership_start_date
const computeTerminationDuration = () => {
  const start = terminationMember.value?.membership_start_date
  const end = terminationForm.terminated_at
  if (start && end) {
    terminationForm.membership_duration_days = dayjs(end).diff(dayjs(start), 'day')
  } else {
    terminationForm.membership_duration_days = null
  }
}
watch(() => terminationForm.terminated_at, computeTerminationDuration)

// ✅ Open / Close modal
const openTerminationModal = (member) => {
  terminationMember.value = member
  terminationForm.org_type_user_id = auth.user?.id ?? null
  terminationForm.individual_type_user_id = member?.individual?.id ?? null
  terminationForm.id = member.id ?? null
  const first = member?.individual?.first_name ?? ''
  const last = member?.individual?.last_name ?? ''
  terminationForm.terminated_member_name = `${first} ${last}`.trim() || ''
  terminationForm.terminated_member_email = member?.individual?.email ?? ''
  terminationForm.terminated_member_mobile = member?.individual?.phone_number?.phone_number ?? '016'

  // Defaults
  terminationForm.terminated_at = dayjs().format('YYYY-MM-DD')
  terminationForm.processed_at = dayjs().format('YYYY-MM-DD')
  terminationForm.membership_termination_reason_id = ''
  terminationForm.org_administrator_id = orgAdministrator.value?.id ?? null
  terminationForm.rejoin_eligible = true
  terminationForm.file_path = null
  terminationForm.membership_duration_days = null
  terminationForm.membership_status_before_termination = member?.membership_status?.name ?? null
  terminationForm.membership_type_before_termination = member?.membership_type?.name ?? null
  terminationForm.joined_at = member?.membership_start_date ?? dayjs().format('YYYY-MM-DD')
  terminationForm.org_note = ''

  computeTerminationDuration()
  terminationModal.value = true
}

const closeTerminationModal = () => {
  terminationModal.value = false
  terminationMember.value = null
  // reset core fields (keep object reference intact)
  Object.assign(terminationForm, {
    org_type_user_id: auth.user?.id ?? null,
    individual_type_user_id: null,
    terminated_member_name: '',
    terminated_member_email: '',
    terminated_member_mobile: '',
    terminated_at: dayjs().format('YYYY-MM-DD'),
    processed_at: dayjs().format('YYYY-MM-DD'),
    membership_termination_reason_id: '',
    org_administrator_id: orgAdministrator.value?.id ?? null,
    rejoin_eligible: true,
    file_path: null,
    membership_duration_days: null,
    membership_status_before_termination: null,
    membership_type_before_termination: null,
    joined_at: dayjs().format('YYYY-MM-DD'),
    org_note: ''
  })
}

// Submit (create) termination
const submitTermination = async () => {
  try {
    // ✅ Pre-check: membership type
    if (!terminationForm.membership_type_before_termination) {
      Swal.fire(
        'Membership type before termination is required.',
        '',
        'warning'
      )
      return
    }

    // ✅ Pre-check: membership status
    if (!terminationForm.membership_status_before_termination) {
      Swal.fire(
        'Membership status before termination is required.',
        '',
        'warning'
      )
      return
    }
    
    // ✅ Pre-check: organization administrator
    if (!terminationForm.org_administrator_id) {
      Swal.fire(
        'Member termination is not allowed until an Organization Administrator has been assigned.',
        '',
        'warning'
      )
      return
    }

    // ✅ Confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently terminate the membership.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, terminate it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    })

    if (!result.isConfirmed) return // exit if cancelled

    // ✅ Build FormData
    const fd = new FormData()
    fd.append('org_type_user_id', terminationForm.org_type_user_id ?? '')
    fd.append('individual_type_user_id', terminationForm.individual_type_user_id ?? '')
    fd.append('terminated_member_name', terminationForm.terminated_member_name ?? '')
    fd.append('terminated_member_email', terminationForm.terminated_member_email ?? '')
    fd.append('terminated_member_mobile', terminationForm.terminated_member_mobile ?? '')
    fd.append('terminated_at', terminationForm.terminated_at ?? '')
    fd.append('processed_at', terminationForm.processed_at ?? '')
    fd.append('membership_termination_reason_id', terminationForm.membership_termination_reason_id ?? '')
    fd.append('org_administrator_id', terminationForm.org_administrator_id ?? null)
    fd.append('rejoin_eligible', terminationForm.rejoin_eligible ? '1' : '0')
    if (terminationForm.file_path) fd.append('file_path', terminationForm.file_path)
    if (terminationForm.membership_duration_days !== null)
      fd.append('membership_duration_days', String(terminationForm.membership_duration_days))
    if (terminationForm.membership_status_before_termination)
      fd.append('membership_status_before_termination', terminationForm.membership_status_before_termination)
    if (terminationForm.membership_type_before_termination)
      fd.append('membership_type_before_termination', terminationForm.membership_type_before_termination)
    if (terminationForm.joined_at)
      fd.append('joined_at', terminationForm.joined_at)
    fd.append('org_note', terminationForm.org_note ?? '')

    // ✅ Submit
    const res = await auth.uploadProtectedApi('/api/membership-terminations', fd, 'POST', {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (res?.status) {
      closeTerminationModal()
      Swal.fire({
        icon: 'success',
        title: 'Membership terminated',
        text: 'The termination has been recorded.',
        timer: 1800,
        showConfirmButton: false
      })
      deleteMember(terminationForm.id)
    } else {
      Swal.fire('An error occurred. Please try again.', '', 'error')
    }

  } catch (e) {
    console.error(e)
    Swal.fire('An error occurred. Please try again.', '', 'error')
  }
}



// ✅ Delete Member
const deleteMember = async (memberId) => {
  try {
    // show processing message
    Swal.fire({
      title: 'Deleting...',
      text: 'Please wait while we remove the member.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    const response = await auth.fetchProtectedApi(`/api/org-members/${memberId}`, {}, 'DELETE')

    if (response.status) {
      await fetchMemberList()
      closeViewModal()
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Member deleted successfully.',
        timer: 1500,
        showConfirmButton: false
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to delete member.',
        timer: 2000,
        showConfirmButton: false
      })
    }
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'An error occurred.',
      timer: 2000,
      showConfirmButton: false
    })
  }
}


// ✅ Open edit modal after adding member
const openEditById = (id) => {
  if (!id) return
  const nId = Number(id)
  const m = memberList.value.find(x => x.id === nId)
  selectedMember.value = m
  editMember()
}

// ✅ Lifecycle
onMounted(async () => {
  await fetchMemberList()
  fetchMembershipType()
  fetchMembershipSatatuses()
  fetchTerminationReasons()
  fetchOrgAdministrators()
  fetchLogo()

  const editId = route.query.edit
  if (editId) openEditById(editId)        // ⬅️ no extra fetch; use memberList
})
</script>


<template>
  <div class="p-6 bg-white rounded-lg shadow space-y-6">

    <!-- Top Bar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h2 class="text-lg font-semibold text-gray-700">Members</h2>
      <div class="flex flex-wrap gap-2">
        <!-- Export Buttons -->
        <button @click="exportCSV"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileText class="w-4 h-4" /> CSV
        </button>
        <button @click="exportXLSX"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileSpreadsheet class="w-4 h-4" /> Excel
        </button>
        <button @click="exportPDF"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileDown class="w-4 h-4" /> PDF
        </button>
        <button @click="exportDOCX"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          <FileText class="w-4 h-4" /> Word
        </button>
        <!-- <button @click="$router.push({ name: 'org-membership-types' })"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          Org Membership Types
        </button> -->

        <button @click="$router.push({ name: 'terminated-members' })"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          Terminated Member
        </button>
        <button @click="$router.push({ name: 'independent-member' })"
          class="flex items-center gap-1 border border-gray-300 bg-white px-3 py-1.5 text-sm rounded text-gray-700 hover:bg-gray-100">
          Unlink Member
        </button> 
        <button @click="$router.push({ name: 'create-member' })"
          class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">+ Add Member</button>
      </div>
    </div>

    <!-- Filters: fill the full width on desktop, wrap on smaller screens -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Search -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600">Search</label>
        <input v-model="search" type="text" placeholder="Search..." class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>

      <!-- Membership Type -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600">Membership Type</label>
        <select v-model="membership_type_id" class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All Types</option>
          <option v-for="type in membershipTypes" :key="type.id" :value="type.id">
            {{ type.membership_type.name }}
          </option>
        </select>
      </div>

      <!-- Membership Status -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600">Membership Status</label>
        <select v-model="membership_status_id" class="w-full border rounded px-3 py-1.5 text-sm">
          <option value="">All Membership Status</option>
          <option v-for="status in membershipStatuses" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>
      </div>

      <!-- Start Date -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600">Start Date</label>
        <input v-model="dateFrom" type="date" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>

      <!-- End Date -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600">End Date</label>
        <input v-model="dateTo" type="date" class="w-full border rounded px-3 py-1.5 text-sm" />
      </div>
    </div>


    <!-- Column View -->
    <div class="bg-gray-50 border rounded p-4 flex flex-col lg:flex-row gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Column View:</label>
        <select v-model="selectedProfile" @change="applyProfile"
          class="border rounded px-3 py-1.5 text-xs sm:text-sm w-full sm:w-48">
          <option value="minimal">Minimal</option>
          <option value="detailed">Detailed</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="text-sm font-medium text-gray-700 mb-1 block">Visible Columns</label>
        <div class="flex flex-wrap gap-4">
          <div v-for="header in allHeaders" :key="header.value" class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="visibleColumns" :value="header.value" :id="header.value"
              class="accent-blue-600" />
            <label :for="header.value" class="text-gray-700">{{ header.text }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Member Table -->
    <div class="overflow-x-auto">
      <EasyDataTable :headers="headers" :items="paginatedMembers" :search-value="search" :loading="loading" show-index
        hide-footer table-class="min-w-full text-sm" header-class="bg-gray-100" body-row-class="text-sm"
        :theme-color="'#3b82f6'">

        <!-- Profile Image -->
        <template #item-image_url="{ image_url }">
          <img :src="image_url" class="h-10 w-10 rounded-full object-cover bg-gray-100" />
        </template>

        <!-- Full Name -->
        <template #item-full_name="{ full_name }">
          <span class="text-gray-700">{{ full_name || '--' }}</span>
        </template>

        <!-- Membership ID -->
        <template #item-existing_membership_id="{ existing_membership_id }">
          <span>{{ existing_membership_id || '--' }}</span>
        </template>

        <!-- Membership Type -->
        <template #item-membership_type.name="{ membership_type }">
          <span>{{ membership_type?.name || '--' }}</span>
        </template>

        <!-- Joining Date -->
        <template #item-membership_start_date="{ membership_start_date }">
          <span>{{ membership_start_date ? dayjs(membership_start_date).format('DD-MM-YYYY') : '--' }}</span>
        </template>

        <!-- Membership Age -->
        <template #item-membership_age="{ membership_start_date }">
          <span>{{ calculateMembershipAge(membership_start_date) }}</span>
        </template>

        <!-- Actions -->
        <template #item-actions="{ id }">
          <button @click="viewMemberDetail(memberList.find(m => m.id === id))"
            class="text-blue-600 hover:underline text-xs">Details</button>
          <!-- <button @click="openTerminationModal(memberList.find(m => m.id === id))"
            class="text-red-600 hover:underline text-xs">Terminate</button> -->
        </template>
      </EasyDataTable>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-2 py-3 bg-gray-50 rounded border">
      <!-- Status Text -->
      <div class="text-xs sm:text-sm text-gray-600 text-center md:text-left">
        Items {{ (currentPage - 1) * rowsPerPage + 1 }} -
        {{ Math.min(currentPage * rowsPerPage, totalItems) }}
        of {{ totalItems }} |
        Page {{ currentPage }} of {{ totalPages }}
      </div>

      <!-- Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
        <!-- Page Size -->
        <div class="flex items-center justify-center sm:justify-start gap-1">
          <span class="text-xs sm:text-sm text-gray-600">Items per page:</span>
          <select v-model="rowsPerPage" class="border rounded px-2 py-1 text-xs sm:text-sm">
            <option v-for="size in [5, 10, 50, 100, 250, 500, 1000]" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>

        <!-- Navigation -->
        <div class="flex justify-center flex-wrap gap-1">
          <button @click="goToFirst" :disabled="currentPage === 1"
            class="border rounded px-3 py-1 text-xs sm:text-sm transition"
            :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
            First
          </button>
          <button @click="goToPrev" :disabled="currentPage === 1"
            class="border rounded px-3 py-1 text-xs sm:text-sm transition"
            :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
            Prev
          </button>
          <button @click="goToNext" :disabled="currentPage === totalPages"
            class="border rounded px-3 py-1 text-xs sm:text-sm transition"
            :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
            Next
          </button>
          <button @click="goToLast" :disabled="currentPage === totalPages"
            class="border rounded px-3 py-1 text-xs sm:text-sm transition"
            :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
            Last
          </button>
        </div>
      </div>
    </div>


    <!-- ✅ Modals -->
    <!-- View Modal -->
    <div v-if="viewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-6 gap-4">
          <img :src="selectedMember?.image_url ?? placeholderImage" alt="Member Image"
            class="h-24 w-24 rounded-full object-cover" />
          <div class="flex-1">
            <h2 class="text-2xl font-semibold text-gray-800">
              {{ selectedMember?.individual?.first_name ?? '--' }} {{ selectedMember?.individual?.last_name ?? '--' }}
            </h2>
            <p class="text-sm text-gray-500">Membership Id: {{ selectedMember?.existing_membership_id }}</p>
          </div>
          <div>
            <span class="text-sm px-3 py-1 rounded-full" :class="statusClass">
              {{ formattedStatus }}
            </span>
          </div>


        </div>

        <!-- Details -->

        <div class="grid grid-cols-1 gap-y-4 text-sm text-gray-700">
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Membership type:</span>
            <span>{{ selectedMember?.membership_type?.name ?? '--' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Membership status:</span>
            <span>{{ selectedMember?.membership_status?.name ?? '--' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Start date:</span>
            <span>
              {{ selectedMember?.membership_start_date
                ? new Date(selectedMember?.membership_start_date).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })
                : 'Not provided' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Membership age:</span>
            <span>{{ calculateMembershipAge(selectedMember?.membership_start_date) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Reference/sponsored by:</span>
            <span>
              {{selectedMember?.sponsored_user_id
                ? memberList.find(m => m.individual.id === selectedMember.sponsored_user_id)?.full_name
                : 'Not provided'}}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Approved by:</span>
            <span>
              {{selectedMember?.approved_by
                ? memberList.find(m => m.individual.id === selectedMember.approved_by)?.full_name
                : 'Not provided'}}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="font-medium text-gray-600">Approved at:</span>
            <span>
              {{ selectedMember?.approved_at
                ? new Date(selectedMember?.approved_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })
                : 'Not provided' }}
            </span>
          </div>


        </div>

        <!-- Actions -->
        <div class="mt-8 flex justify-end gap-3">
          <button @click="editMember"
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg">Edit</button>

          <button @click="openTerminationModal(selectedMember)"
            class="bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-2 rounded-lg">
            Terminate
          </button>
          <button @click="closeViewModal"
            class="bg-gray-200 hover:bg-gray-300 text-sm px-5 py-2 rounded-lg">Close</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <div class="flex justify-between items-center border-b pb-4 mb-6">
          <h2 class="text-xl font-semibold text-gray-800">Edit Member</h2>
          <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        <div class="mb-6 text-center">
          <img :src="selectedMember?.image_url ?? placeholderImage" alt="Member Image"
            class="h-24 w-24 rounded-full object-cover mx-auto mb-4" />
          <h2 class="text-2xl font-semibold text-gray-800">
            {{ selectedMember?.individual?.first_name ?? '--' }} {{ selectedMember?.individual?.last_name ?? '--' }}
          </h2>
          <p class="text-sm text-gray-500">Unique Azon Id: {{ selectedMember?.individual?.azon_id ?? '' }}</p>
        </div>

        <form @submit.prevent="updateMember" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Organisation Membership Id</label>
            <input v-model="selectedMember.existing_membership_id" type="text"
              class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label for="membership_type_id" class="block text-sm font-medium text-gray-700">Membership type</label>
            <select v-model="membership_type_id" id="membership_type_id"
              class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="" disabled>Select membership type</option>
              <option v-for="membershipType in membershipTypes" :key="membershipType.membership_type_id"
                :value="membershipType.membership_type_id">
                {{ membershipType.membership_type.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="membership_status_id" class="block text-sm font-medium text-gray-700">Membership status</label>
            <select v-model="membership_status_id" id="membership_status_id"
              class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="" disabled>Select membership status</option>
              <option v-for="membershipStatus in membershipStatuses" :key="membershipStatus.id"
                :value="membershipStatus.id">
                {{ membershipStatus.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Membership Start Date</label>
            <input v-model="selectedMember.membership_start_date" type="date"
              class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label for="sponsored_user_id" class="block text-sm font-medium text-gray-700">Reference/Sponsored
              Member</label>
            <select v-model="sponsored_user_id" id="sponsored_user_id"
              class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="" disabled>Select Reference/Sponsored Member</option>
              <option v-for="orgMember in memberList" :key="orgMember.individual.id" :value="orgMember.individual.id">
                {{ orgMember.full_name }}
              </option>
            </select>
          </div>

          <div>
            <label for="approved_by " class="block text-sm font-medium text-gray-700">Approved by </label>
            <select v-model="approved_by" id="approved_by "
              class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="" disabled>Select Approved by</option>
              <option v-for="orgMember in memberList" :key="orgMember.individual.id" :value="orgMember.individual.id">
                {{ orgMember.full_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Approved at</label>
            <input v-model="approved_at" type="date"
              class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button type="submit"
              class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg">Save</button>
            <button @click="closeEditModal" type="button"
              class="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Membership Termination Modal -->
    <div v-if="terminationModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
        <!-- Header -->
        <div class="flex justify-between items-center border-b pb-4 mb-6">
          <h2 class="text-xl font-semibold text-gray-800">Terminate Membership</h2>
          <button @click="closeTerminationModal" class="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        <!-- Member summary -->
        <div class="mb-6 flex items-center gap-4">
          <img :src="terminationMember?.image_url ?? placeholderImage" class="h-16 w-16 rounded-full object-cover" />
          <div>
            <div class="text-lg font-semibold text-gray-800">

              {{ terminationMember?.individual?.first_name ?? '--' }} {{ terminationMember?.individual?.last_name ?? ''
              }}
            </div>
            <div class="text-sm text-gray-500">
              Membership ID: {{ terminationMember?.existing_membership_id ?? '--' }}
            </div>
          </div>
        </div>

        <form @submit.prevent="submitTermination" class="space-y-5">
          <!-- Grid fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- terminated_member_email -->
            <div>
              <!-- terminated_member_name -->
              <input v-model="terminationForm.terminated_member_name" type="text"
                class="w-full mt-1 border border-gray-100 bg-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0"
                hidden />

              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="terminationForm.terminated_member_email" type="email"
                class="w-full mt-1 border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 focus:outline-none focus:ring-0"
                readonly />
            </div>

            <!-- terminated_member_mobile -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Mobile</label>
              <input v-model="terminationForm.terminated_member_mobile" type="text"
                class="w-full mt-1 border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 focus:outline-none focus:ring-0"
                readonly />
            </div>

            <!-- membership_duration_days (readonly) -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Membership Duration (days)</label>
              <input :value="terminationForm.membership_duration_days ?? ''" type="text" readonly
                class="w-full mt-1 border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 focus:outline-none focus:ring-0" />
            </div>
            <!-- joined_at -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Joined At</label>
              <input v-model="terminationForm.joined_at" type="date"
                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 focus:outline-none focus:ring-0"
                readonly />
            </div>

            <!-- membership_type_before_termination -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Membership Type Before Termination</label>
              <input :value="terminationForm.membership_type_before_termination" type="text" readonly
                class="w-full mt-1 border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 focus:outline-none focus:ring-0" />
            </div>
            <!-- membership_status_before_termination -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Membership Status Before Termination</label>
              <input :value="terminationForm.membership_status_before_termination" type="text" readonly
                class="w-full mt-1 border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 focus:outline-none focus:ring-0" />
            </div>

            <!-- membership_termination_reason_id -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Termination Reason</label>
              <select v-model="terminationForm.membership_termination_reason_id"
                class="w-full mt-1 border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm">
                <option value="" disabled>Select a reason</option>
                <option v-for="r in terminationReasons" :key="r.id" :value="r.id">{{ r.reason }}</option>
              </select>
            </div>

            <!-- terminated_at -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Terminated At</label>
              <input v-model="terminationForm.terminated_at" type="date" @change="computeTerminationDuration"
                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            <!-- processed_at -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Processed At</label>
              <input v-model="terminationForm.processed_at" type="date"
                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <!-- file_path -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Supporting Document (optional)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                @change="e => terminationForm.file_path = e.target.files?.[0] ?? null" />
            </div>
            <!-- org_note -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Organisation Note</label>
              <textarea v-model="terminationForm.org_note" rows="3"
                class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Reason for leaving the organisation"></textarea>
            </div>

            <!-- org_administrator_id  (readonly display) -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Org Administrator</label>
              <input :value="terminationForm.org_administrator_id" type="text" hidden
                class="w-full mt-1 border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600" />
              <input :value="orgAdministrator?.first_name || orgAdministrator?.last_name
                ? `${orgAdministrator?.first_name ?? ''} ${orgAdministrator?.last_name ?? ''}`.trim()
                : '--'" type="text" readonly
                class="w-full mt-1 border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 focus:outline-none focus:ring-0" />

            </div>

            <!-- rejoin_eligible -->
            <div class="flex items-center gap-2 mt-6">
              <input id="rejoin_eligible" type="checkbox" v-model="terminationForm.rejoin_eligible"
                class="accent-blue-600" />
              <label for="rejoin_eligible" class="text-sm text-gray-700">Eligible to rejoin in future</label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3">
            <button type="submit" class="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg">
              Confirm Termination
            </button>
            <button type="button" @click="closeTerminationModal"
              class="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>
