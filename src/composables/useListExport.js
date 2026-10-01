// composables/useListExport.js
// Export items (CSV, Excel, PDF, Word) for a list page, ready for <AzMenu>.
// Only data columns are exported: photo and action columns are left out.
//   const exportItems = useListExport({ columns, rows, title: "Member list", fileName: "Members" });
import { computed, unref } from "vue";
import { useI18n } from "vue-i18n";
import { FileText, FileSpreadsheet, FileDown } from "lucide-vue-next";
import { useToast } from "@/composables/useToast";

const NOT_EXPORTED = new Set(["image_url", "photo", "actions"]);

export function useListExport({ columns, rows, title, fileName }) {
  const { t } = useI18n();
  const toast = useToast();

  // columns: [{ key, label, value?: (row) => text }]
  const exportHeaders = () =>
    unref(columns)
      .filter((c) => !NOT_EXPORTED.has(c.key))
      .map((c) => ({ text: c.label, value: c.value || c.key }));

  const run = async (loader, ext) => {
    try {
      const fn = await loader();
      await fn({
        headers: exportHeaders(),
        rows: unref(rows),
        title: unref(title),
        fileName: `${unref(fileName)}.${ext}`,
      });
    } catch (e) {
      console.error(e);
      toast.error(t("list.exportFailed"));
    }
  };

  return computed(() => [
    { label: "CSV", icon: FileText, onSelect: () => run(() => import("@/helpers/csvExport").then((m) => m.csvExport), "csv") },
    { label: "Excel", icon: FileSpreadsheet, onSelect: () => run(() => import("@/helpers/excelExport").then((m) => m.excelExport), "xlsx") },
    { label: "PDF", icon: FileDown, onSelect: () => run(() => import("@/helpers/pdfExport").then((m) => m.pdfExport), "pdf") },
    { label: "Word", icon: FileText, onSelect: () => run(() => import("@/helpers/docxExport").then((m) => m.docxExport), "docx") },
  ]);
}
