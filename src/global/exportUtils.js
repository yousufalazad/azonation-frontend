import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ Use this import instead of direct string

// ✅ CSV Export
export const exportToCSV = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.csv`);
};

// ✅ Excel Export
export const exportToExcel = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// ✅ PDF Export (Fixed)
export const exportToPDF = (data, filename) => {
  if (!data.length) return;

  const doc = new jsPDF('l', 'pt', 'a4'); // Landscape

  const headers = [['Name', 'Email', 'Mobile', 'Address', 'Note', 'Active']];

  const rows = data.map(item => [
    `${item.first_name ?? ''} ${item.last_name ?? ''}`,
    item.email ?? '',
    item.mobile ?? '',
    item.address ?? '',
    item.note ?? '',
    item.is_active === 1 || item.is_active === true ? 'Yes' : 'No'
  ]);

  autoTable(doc, {
    head: headers,
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 160, 133] },
    margin: { top: 40 },
  });

  doc.save(`${filename}.pdf`);
};
